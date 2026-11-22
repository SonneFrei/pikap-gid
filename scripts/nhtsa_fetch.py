#!/usr/bin/env python3
"""
Выгрузка жалоб владельцев и отзывных кампаний из публичной базы NHTSA (США)
для моделей «Пикап·Гида».

Запуск (из корня репозитория сайта):
    python3 scripts/nhtsa_fetch.py

    python3 scripts/nhtsa_fetch.py --from-raw   # только пересобрать сводку, без скачивания

Результат:
    scripts/out/nhtsa_raw.json      — сырые данные (в git не попадают)
    assets/data/nhtsa.js            — сводка для сайта (window.NHTSA)

API: https://api.nhtsa.gov — бесплатно, без ключа.
"""
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from collections import Counter
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT_RAW = ROOT / "scripts" / "out" / "nhtsa_raw.json"
OUT_JS = ROOT / "assets" / "data" / "nhtsa.js"
API = "https://api.nhtsa.gov"

# Модельные годы: с 2021 по «следующий» — новый модельный год в США выходит летом-осенью
# предыдущего календарного года (2027 MY — с середины 2026). Не вписывать конечный год руками:
# так в ноябре 2026 сайт показывал только 2021–2025.
FIRST_YEAR = 2021
YEARS = range(FIRST_YEAR, date.today().year + 2)

# Группы моделей. complaints_re — по каким названиям из базы жалоб собирать;
# recall_re — по каким названиям собирать отзывные кампании (в той базе они другие).
#
# ВАЖНО: в базе жалоб NHTSA все варианты RAM 1500 (Crew/Quad Cab, TRX, RHO и даже
# старый 1500 Classic) лежат под общим productModel «1500». Отдельно их не выделить.
# Поэтому TRX и Raptor берём как «подмножество» родительской модели: только жалобы,
# где модель прямо названа в тексте (derive_from + text_filter).
GROUPS = [
    {
        "id": "ram-1500", "make": "RAM", "years": YEARS,
        "complaints_re": r"^(RAM )?1500( (CREW|QUAD|REGULAR) CAB)?( RHO)?$",
        "recall_models": ["1500", "RAM 1500"], "recall_re": r"^(RAM )?1500\b", "recall_exclude": r"CLASSIC",
    },
    {
        "id": "ram-trx", "derive_from": "ram-1500", "text_filter": r"\bTRX\b", "years": range(2021, 2025),
    },
    {
        "id": "ford-f150", "make": "FORD", "years": YEARS,
        "complaints_re": r"^F-150\s*\(?(REGULAR CAB|SUPER CAB|SUPER CREW)\)?(\s+(GAS|HEV))?$",
        "recall_models": ["F-150"], "recall_re": r"^F-150\b", "recall_exclude": r"LIGHTNING|BEV",
    },
    {
        "id": "ford-raptor", "derive_from": "ford-f150", "text_filter": r"\bRAPTOR\b", "years": YEARS,
    },
    {
        "id": "chevy-silverado", "make": "CHEVROLET", "years": YEARS,
        "complaints_re": r"^SILVERADO 1500$",
        "recall_models": ["SILVERADO 1500", "SILVERADO"], "recall_re": r"^SILVERADO 1500\b", "recall_exclude": r"LTD|LIMITED|EV\b",
    },
    {
        "id": "gmc-sierra", "make": "GMC", "years": YEARS,
        "complaints_re": r"^SIERRA 1500$",
        "recall_models": ["SIERRA 1500", "SIERRA"], "recall_re": r"^SIERRA 1500\b", "recall_exclude": r"LIMITED|EV\b",
    },
]


def get(path, params):
    url = f"{API}{path}?{urllib.parse.urlencode(params)}"
    for attempt in range(4):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "pickup-guide-research/1.0"})
            with urllib.request.urlopen(req, timeout=40) as r:
                return json.loads(r.read().decode("utf-8"))
        except Exception as e:  # сеть иногда отваливается — повторяем
            if getattr(e, "code", None) == 400:  # такого названия в этом году нет — это нормально
                return {}
            if attempt == 3:
                print(f"  ! не удалось: {url} ({e})", file=sys.stderr)
                return {}
            time.sleep(2 * (attempt + 1))


_NAMES_CACHE = {}


def model_names(make, year, issue_type):
    key = (make, year, issue_type)
    if key not in _NAMES_CACHE:
        _NAMES_CACHE[key] = _model_names(make, year, issue_type)
    return _NAMES_CACHE[key]


def _model_names(make, year, issue_type):
    """Список моделей постраничный, а поле count — размер страницы, а не итог.
    Листаем, пока приходят новые названия."""
    names, offset = set(), 0
    for _ in range(60):
        d = get("/products/vehicle/models", {"modelYear": year, "make": make, "issueType": issue_type, "offset": offset})
        res = d.get("results") or []
        if not res:
            break
        before = len(names)
        names.update(r["model"] for r in res)
        offset += len(res)
        if len(names) == before:
            break
    return names


def norm(s):
    return re.sub(r"\s+", " ", s).strip()


_TAILS = {"GASOLINE", "DIESEL", "OTHER", "HYDRAULIC", "AIR", "ELECTRIC"}


def merge_components(parts):
    """В базе жалоб узлы перечислены через запятую, но у некоторых в названии тоже есть запятая
    («FUEL SYSTEM, GASOLINE», «SERVICE BRAKES, HYDRAULIC»). Склеиваем такие хвосты обратно."""
    out = []
    for p in parts:
        if out and p.split(":")[0] in _TAILS:
            out[-1] = out[-1] + ", " + p
        else:
            out.append(p)
    return out


def only_classic(summary):
    """Кампания касается только старого RAM 1500 Classic (а не нового RAM 1500)."""
    t = summary or ""
    return bool(re.search(r"1500 Classic", t, re.I)) and not re.search(r"1500(?! Classic)", t, re.I)


def build_summary(raw):
    summary = {"generated": date.today().isoformat(), "source": "NHTSA (api.nhtsa.gov)", "models": {}}
    for g in GROUPS:
        data = raw[g["id"]]
        complaints, recalls = data["complaints"], dict(data["recalls"])
        if g["id"] in ("ram-1500", "ram-trx"):
            recalls = {k: r for k, r in recalls.items() if not only_classic(r.get("summary"))}
        comp_counter = Counter()
        by_year = Counter()
        for c in complaints.values():
            by_year[c["year"]] += 1
            for comp in set(x.split(":")[0] for x in merge_components(c["components"])):
                comp_counter[comp] += 1
        summary["models"][g["id"]] = {
            "years": [min(g["years"]), max(g["years"])],
            "nhtsaNames": data["names"],
            "complaints": {
                "total": len(complaints),
                "byYear": {str(k): v for k, v in sorted(by_year.items())},
                "byComponent": comp_counter.most_common(12),
                "crashes": sum(c["crash"] for c in complaints.values()),
                "fires": sum(c["fire"] for c in complaints.values()),
                "injuries": sum(c["injuries"] for c in complaints.values()),
                "deaths": sum(c["deaths"] for c in complaints.values()),
            },
            "recalls": sorted(
                [{k: v for k, v in r.items() if k in ("id", "date", "component", "parkIt", "parkOutSide", "years")}
                 for r in recalls.values()],
                key=lambda r: r["id"] or "", reverse=True),
        }
    return summary


def write_js(summary):
    OUT_JS.parent.mkdir(parents=True, exist_ok=True)
    OUT_JS.write_text(
        "/* Сгенерировано scripts/nhtsa_fetch.py — не редактировать вручную. */\n"
        "window.NHTSA = " + json.dumps(summary, ensure_ascii=False, indent=1) + ";\n"
    )
    print(f"Готово: {OUT_JS.relative_to(ROOT)}")


def main():
    raw = {}

    for g in GROUPS:
        print(f"== {g['id']}")
        complaints = {}
        recalls = {}
        used_names = set()

        if g.get("derive_from"):
            parent = raw[g["derive_from"]]
            rx = re.compile(g["text_filter"], re.I)
            yrs = set(g["years"])
            complaints = {k: c for k, c in parent["complaints"].items() if c["year"] in yrs and rx.search(c["summary"])}
            recalls = {k: r for k, r in parent["recalls"].items()
                       if rx.search(" ".join([r.get("summary") or "", r.get("component") or ""]))}
            used_names = {f"{n} (только жалобы, где в тексте есть «{g['text_filter'].strip(chr(92) + 'b')}»)" for n in parent["names"]}
            print(f"  подмножество {g['derive_from']}: жалоб {len(complaints)}, отзывов {len(recalls)}")

        for y in ([] if g.get("derive_from") else g["years"]):
            names = [n for n in model_names(g["make"], y, "c") if re.search(g["complaints_re"], norm(n))]
            used_names.update(names)
            for n in names:
                d = get("/complaints/complaintsByVehicle", {"make": g["make"], "model": n, "modelYear": y})
                for c in d.get("results") or []:
                    complaints[c["odiNumber"]] = {
                        "year": y,
                        "date": c.get("dateComplaintFiled"),
                        "components": [norm(x) for x in (c.get("components") or "").split(",") if x.strip()],
                        "crash": bool(c.get("crash")),
                        "fire": bool(c.get("fire")),
                        "injuries": c.get("numberOfInjuries") or 0,
                        "deaths": c.get("numberOfDeaths") or 0,
                        "summary": c.get("summary") or "",
                    }
            rnames = [n for n in model_names(g["make"], y, "r")
                      if re.search(g["recall_re"], norm(n)) and not re.search(g["recall_exclude"], norm(n).upper())]
            for rm in sorted(set(rnames) | set(g.get("recall_models", []))):
                d = get("/recalls/recallsByVehicle", {"make": g["make"], "model": rm, "modelYear": y})
                for r in d.get("results") or []:
                    if g.get("recall_exclude") and re.search(g["recall_exclude"], (r.get("Model") or "").upper()):
                        continue
                    num = r.get("NHTSACampaignNumber")
                    rec = recalls.setdefault(num, {
                        "id": num,
                        "date": r.get("ReportReceivedDate"),
                        "component": r.get("Component"),
                        "summary": r.get("Summary"),
                        "consequence": r.get("Consequence"),
                        "remedy": r.get("Remedy"),
                        "parkIt": bool(r.get("parkIt")),
                        "parkOutSide": bool(r.get("parkOutSide")),
                        "years": [],
                    })
                    if y not in rec["years"]:
                        rec["years"].append(y)
            print(f"  {y}: жалоб всего {len(complaints)}, отзывов {len(recalls)}")

        raw[g["id"]] = {"names": sorted(used_names), "complaints": complaints, "recalls": recalls}

    OUT_RAW.parent.mkdir(parents=True, exist_ok=True)
    OUT_RAW.write_text(json.dumps(raw, ensure_ascii=False, indent=1))
    write_js(build_summary(raw))


if __name__ == "__main__":
    if "--from-raw" in sys.argv:  # пересобрать сводку из уже скачанных данных, без запросов к API
        write_js(build_summary(json.loads(OUT_RAW.read_text())))
    else:
        main()
