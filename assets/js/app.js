(function () {
  "use strict";

  const fmt = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });
  const rub = (n) => fmt.format(Math.round(n)) + " ₽";
  const usd = (n) => "$" + fmt.format(Math.round(n));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const statusBadge = (status) =>
    status === "ok"
      ? '<span class="badge ok">проверено</span>'
      : '<span class="badge check">нужна сверка</span>';

  const sourcesList = (sources) =>
    sources && sources.length
      ? "<ul>" + sources.map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a></li>`).join("") + "</ul>"
      : "";

  /* =========================================================
   * Страница моделей
   * ========================================================= */
  const modelsList = document.getElementById("models-list");
  if (modelsList) {
    modelsList.innerHTML = window.MODELS.map((m) => {
      const hp = m.engines.map((e) => e.hp);
      const hpRange = Math.min(...hp) === Math.max(...hp) ? Math.min(...hp) : `${Math.min(...hp)}–${Math.max(...hp)}`;
      const gvwr = m.gvwrKg[0] === m.gvwrKg[1] ? fmt.format(m.gvwrKg[0]) : `${fmt.format(m.gvwrKg[0])}–${fmt.format(m.gvwrKg[1])}`;
      const crosses = m.gvwrKg[1] > window.RULES.massLimitKg;
      return `
        <article class="model-card" id="${esc(m.id)}">
          <div>
            <div class="brand">${esc(m.brand)}</div>
            <h3>${esc(m.name)}</h3>
          </div>
          <p class="tagline">${esc(m.tagline)}</p>
          <div class="specs">
            <div class="spec"><small>Цена в США от</small><b>${m.msrpFrom ? usd(m.msrpFrom) : "уточняем"}</b> ${m.msrpCheck ? '<span class="badge check">проверить</span>' : ""}</div>
            <div class="spec"><small>Мощность</small><b>${hpRange} л.с.</b></div>
            <div class="spec"><small>Полная масса (РММ)</small><b>${gvwr} кг</b> ${m.gvwrCheck ? '<span class="badge check">проверить</span>' : ""}</div>
            <div class="spec"><small>Порог 3,5 т</small><b>${crosses ? "может перейти ⚠️" : "в пределах"}</b></div>
          </div>
          <ul class="engines">
            ${m.engines.map((e) => `
              <li>
                <span>${esc(e.name)}${e.note ? `<span class="note">${esc(e.note)}</span>` : ""}</span>
                <span class="hp">${e.hp} л.с.</span>
              </li>`).join("")}
          </ul>
          <p class="dim" style="margin:0;font-size:13px">${esc(m.msrpNote)} ${esc(m.gvwrNote)}</p>
          <div class="foot">
            <a class="btn" href="calculator.html?engine=${encodeURIComponent(m.engines[0].id)}">Сколько стоит в России</a>
          </div>
        </article>`;
    }).join("");
  }

  /* =========================================================
   * Болячки (данные NHTSA)
   * ========================================================= */
  const issuesRoot = document.getElementById("issues-root");
  if (issuesRoot && window.NHTSA) {
    const GROUPS = [
      { id: "ram-1500", label: "RAM 1500", model: "ram-1500" },
      { id: "ram-trx", label: "RAM TRX", model: "ram-trx" },
      { id: "ford-f150", label: "Ford F-150", model: "ford-f150" },
      { id: "ford-raptor", label: "F-150 Raptor", model: "ford-raptor" },
      { id: "chevy-silverado", label: "Silverado 1500", model: "chevy-silverado" },
      { id: "gmc-sierra", label: "Sierra 1500", model: "gmc-sierra" }
    ];
    const NOTES = {
      "ram-1500": "В базе жалоб NHTSA все версии RAM 1500 — включая старый RAM 1500 Classic, TRX и RHO — записаны одной моделью «1500». Отделить их нельзя, поэтому цифры общие.",
      "ram-trx": "NHTSA не выделяет TRX отдельно. Здесь — только те жалобы на RAM 1500, где владелец прямо упомянул TRX. Выборка маленькая: смотрите её вместе с общими данными RAM 1500 — платформа и большая часть узлов общие.",
      "ford-raptor": "NHTSA не выделяет Raptor отдельно. Здесь — только жалобы на F-150, где упомянут Raptor. Отзывные кампании F-150 по общим узлам касаются и Raptor — смотрите вкладку F-150.",
      "chevy-silverado": "Silverado и GMC Sierra — одна платформа с общими моторами и коробками. Отзывные кампании у них почти всегда совпадают.",
      "gmc-sierra": "Sierra и Chevrolet Silverado — одна платформа с общими моторами и коробками. Отзывные кампании у них почти всегда совпадают."
    };
    const tabs = document.getElementById("issues-tabs");
    tabs.innerHTML = GROUPS.map((g) =>
      `<button type="button" role="tab" data-id="${g.id}">${esc(g.label)}</button>`).join("");

    const tr = (id) => (window.ISSUES_RU.recalls || {})[id];
    const yearsLabel = (ys) => {
      const s = [...ys].sort();
      return s.length === 1 ? String(s[0]) : `${s[0]}–${s[s.length - 1]}`;
    };
    const recallUrl = (id) => `https://www.nhtsa.gov/recalls?nhtsaId=${encodeURIComponent(id)}`;

    function recallItem(r) {
      const t = tr(r.id);
      const badges = [];
      if (r.parkIt) badges.push('<span class="badge danger">не ездить до ремонта</span>');
      if (r.parkOutSide) badges.push('<span class="badge danger">парковать на улице — риск возгорания</span>');
      return `
        <li class="recall">
          <div class="recall-head">
            <b>${esc(t ? t.title : window.ruComponent(r.component))}</b>
            ${badges.join(" ")}
          </div>
          ${t ? `<p>${esc(t.text)}</p>` : `<p class="dim">Узел: ${esc(window.ruComponent(r.component))}. Перевод готовится — подробности в оригинале.</p>`}
          <div class="recall-meta">
            Модельные годы: ${esc(yearsLabel(r.years))} · кампания ${esc(r.id)}${r.date ? " · " + esc(r.date) : ""}
            · <a href="${recallUrl(r.id)}" target="_blank" rel="noopener">оригинал на NHTSA</a>
          </div>
        </li>`;
    }

    function render(id) {
      const g = GROUPS.find((x) => x.id === id) || GROUPS[0];
      const m = window.NHTSA.models[g.id];
      [...tabs.children].forEach((b) => b.setAttribute("aria-selected", String(b.dataset.id === g.id)));
      if (!m) { issuesRoot.innerHTML = '<p class="muted">Данных пока нет.</p>'; return; }

      const c = m.complaints;
      const maxComp = c.byComponent.length ? c.byComponent[0][1] : 1;
      const years = Object.entries(c.byYear);
      const maxYear = Math.max(1, ...years.map(([, v]) => v));

      const recalls = [...m.recalls].sort((a, b) =>
        (tr(b.id) ? 1 : 0) - (tr(a.id) ? 1 : 0) ||
        ((b.parkIt || b.parkOutSide) ? 1 : 0) - ((a.parkIt || a.parkOutSide) ? 1 : 0) ||
        String(b.id).localeCompare(String(a.id)));
      const firstN = 8;

      issuesRoot.innerHTML = `
        ${NOTES[g.id] ? `<div class="alert warn" style="margin-top:0"><b>Важно про эти данные</b>${esc(NOTES[g.id])}</div>` : ""}
        <div class="stats issues-stats">
          <div class="stat"><b>${fmt.format(c.total)}</b><span>жалоб владельцев, ${m.years[0]}–${m.years[1]} модельные годы</span></div>
          <div class="stat"><b>${fmt.format(m.recalls.length)}</b><span>${g.id === "ram-trx" ? "отдельных кампаний только по TRX — общие смотрите во вкладке RAM 1500"
            : g.id === "ford-raptor" ? "отдельных кампаний только по Raptor — общие смотрите во вкладке F-150"
            : "отзывных кампаний"}</span></div>
          <div class="stat"><b>${fmt.format(c.crashes)} / ${fmt.format(c.fires)}</b><span>жалоб, где были ДТП / возгорание</span></div>
        </div>

        <div class="grid cols-2" style="margin-top:16px">
          <section class="panel">
            <h2>Что ломается чаще всего</h2>
            <p class="dim" style="font-size:13px">Доля жалоб, где упоминается узел. Одна жалоба может касаться нескольких узлов.</p>
            <ul class="comp-list">
              ${c.byComponent.slice(0, 10).map(([name, n]) => `
                <li>
                  <div class="comp-row"><span>${esc(window.ruComponent(name))}</span><b>${fmt.format(n)} · ${c.total ? Math.round((n / c.total) * 100) : 0}%</b></div>
                  <div class="comp-bar"><span style="width:${(n / maxComp) * 100}%"></span></div>
                </li>`).join("")}
            </ul>
          </section>
          <section class="panel">
            <h2>Жалобы по модельным годам</h2>
            <p class="dim" style="font-size:13px">У свежих годов жалоб меньше: машины ещё не успели накатать пробег.</p>
            <div class="year-bars">
              ${years.map(([y, v]) => `
                <div class="year-bar">
                  <span class="v">${fmt.format(v)}</span>
                  <span class="b" style="height:${Math.max(4, (v / maxYear) * 140)}px"></span>
                  <span class="y">${esc(y)}</span>
                </div>`).join("")}
            </div>
          </section>
        </div>

        <section class="panel" style="margin-top:16px">
          <h2>Отзывные кампании</h2>
          ${recalls.length ? `
            <ul class="recalls">${recalls.slice(0, firstN).map(recallItem).join("")}</ul>
            ${recalls.length > firstN ? `
              <details class="more">
                <summary>Показать ещё ${recalls.length - firstN}</summary>
                <ul class="recalls">${recalls.slice(firstN).map(recallItem).join("")}</ul>
              </details>` : ""}
          ` : '<p class="muted">Отдельных отзывных кампаний в базе не найдено.</p>'}
        </section>

        <p class="dim" style="font-size:13px;margin-top:16px">
          Данные: NHTSA, выгрузка от ${esc(window.NHTSA.generated)}. Названия моделей в базе: ${esc(m.nhtsaNames.join(", ") || "—")}.
        </p>`;
    }

    tabs.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-id]");
      if (!b) return;
      history.replaceState(null, "", "#" + b.dataset.id);
      render(b.dataset.id);
    });
    render((location.hash || "").slice(1) || GROUPS[0].id);
  }

  /* =========================================================
   * Калькулятор
   * ========================================================= */
  const form = document.getElementById("calc-form");
  if (!form) return;

  const R = window.RULES;
  const $ = (id) => document.getElementById(id);
  const el = {
    preset: $("preset"),
    fuel: () => form.querySelector('input[name="fuel"]:checked').value,
    age: () => form.querySelector('input[name="age"]:checked').value,
    cc: $("cc"),
    gvwr: $("gvwr"),
    price: $("price"),
    delivery: $("delivery"),
    usdRate: $("usdRate"),
    eurRate: $("eurRate"),
    other: $("other"),
    out: $("calc-result"),
    presetInfo: $("preset-info")
  };

  // Наполняем список пресетов
  el.preset.innerHTML =
    window.MODELS.map((m) =>
      `<optgroup label="${esc(m.brand + " " + m.name)}">` +
      m.engines.map((e) => `<option value="${esc(e.id)}">${esc(m.brand + " " + m.name + " — " + e.name)}</option>`).join("") +
      "</optgroup>"
    ).join("") + '<option value="custom">Другая машина — ввести вручную</option>';

  const num = (input) => {
    const v = parseFloat(String(input.value).replace(/\s/g, "").replace(",", "."));
    return isFinite(v) && v >= 0 ? v : 0;
  };

  function applyPreset(engineId) {
    const found = window.findEngine(engineId);
    if (!found) { el.presetInfo.textContent = "Введите параметры машины вручную."; return; }
    const { model, engine } = found;
    form.querySelector(`input[name="fuel"][value="${engine.fuel}"]`).checked = true;
    el.cc.value = engine.cc;
    el.gvwr.value = model.gvwrDefault;
    if (model.msrpFrom) el.price.value = model.msrpFrom;
    el.presetInfo.innerHTML =
      `${esc(engine.hp)} л.с., ${fmt.format(engine.cc)} см³. Полная масса у этой модели: ${fmt.format(model.gvwrKg[0])}–${fmt.format(model.gvwrKg[1])} кг — ` +
      `<b>подставьте цифру из ПТС</b>, если она известна.` +
      (model.msrpFrom ? "" : " Цену в США по этой модели уточняем — введите свою.");
  }

  function compute() {
    const fuel = el.fuel();
    const ageId = el.age();
    const cc = num(el.cc);
    const gvwr = num(el.gvwr);
    const priceUsd = num(el.price);
    const deliveryUsd = num(el.delivery);
    const usdRate = num(el.usdRate);
    const eurRate = num(el.eurRate);
    const otherRub = num(el.other);

    const carRub = priceUsd * usdRate;
    const deliveryRub = deliveryUsd * usdRate;
    const customsValue = carRub + deliveryRub;

    const duty = window.calcDuty(fuel, cc, ageId, customsValue, eurRate);
    const vat = (customsValue + duty.rub) * R.vat.rate;
    const fee = window.calcCustomsFee(customsValue);
    const row = window.utilRow(gvwr);
    const age = window.findAge(ageId);
    const isNew = age.utilNew;
    const util = isNew ? row.new : row.old;

    const items = [
      { key: "car", color: "var(--c-car)", name: "Машина в США", sub: `${usd(priceUsd)} × ${fmt.format(usdRate)} ₽`, val: carRub },
      { key: "delivery", color: "var(--c-delivery)", name: "Доставка до границы РФ", sub: `${usd(deliveryUsd)} — оценка, уточните у импортёра`, val: deliveryRub },
      {
        key: "duty", color: "var(--c-duty)", name: "Ввозная пошлина",
        sub: duty.label.includes("€") ? duty.label : `${duty.label} от таможенной стоимости (${age.used ? "б/у" : "новая"}, ${fuel === "diesel" ? "дизель" : "бензин"}, ${fmt.format(cc)} см³)`,
        val: duty.rub,
        status: R.duty.status, note: R.duty.note, sources: R.duty.sources
      },
      {
        key: "vat", color: "var(--c-vat)", name: "НДС 22%", sub: "от стоимости + пошлины", val: vat,
        status: R.vat.status, note: R.vat.note + " " + R.excise.note, sources: R.vat.sources.concat(R.excise.sources)
      },
      {
        key: "fee", color: "var(--c-fee)", name: "Таможенный сбор", sub: "по шкале 2026 года", val: fee,
        status: R.customsFee.status, note: "Фиксированная сумма в зависимости от таможенной стоимости.", sources: R.customsFee.sources
      },
      {
        key: "util", color: "var(--c-util)", name: "Утильсбор", sub: `грузовой, ${row.label}, ${isNew ? "до 3 лет" : "старше 3 лет"}`, val: util,
        status: row.status, note: row.note + " Для грузовых не зависит от мощности.", sources: R.util.sources
      },
      { key: "other", color: "var(--c-other)", name: "Прочие расходы в РФ", sub: "брокер, СВХ, СБКТС/ЭПТС, доставка до города — оценка, уточните у импортёра", val: otherRub }
    ];

    const total = items.reduce((s, i) => s + i.val, 0);
    const toState = duty.rub + vat + fee + util;
    const share = total > 0 ? Math.round((toState / total) * 100) : 0;

    // Предупреждения
    const alerts = [];
    if (gvwr > R.massLimitKg) {
      alerts.push(`
        <div class="alert danger">
          <b>Полная масса больше 3 500 кг — это уже другая машина для закона</b>
          <ul>
            <li>Нужны права категории <b>C</b> (подкатегория C1: от 3,5 до 7,5 т), категории B недостаточно.</li>
            <li>Под знак 3.4 «Движение грузовых автомобилей запрещено» без цифры — <b>нельзя</b>. Штраф в Москве и Петербурге — 7 500 ₽.</li>
            <li>Для въезда в центр Москвы, скорее всего, понадобится пропуск — правила проверяем.</li>
            <li>Утильсбор считается по строке «3,5–5 т». Встречались случаи, когда такие машины оформляли как легковые M1G — тогда расчёт совсем другой. Уточните у брокера до покупки.</li>
          </ul>
        </div>`);
    } else if (gvwr >= 3400) {
      alerts.push(`
        <div class="alert warn">
          <b>Вы у самой границы 3,5 т</b>
          Несколько десятков килограммов в ПТС решают, нужны ли права категории C и можно ли под знак 3.4. Проверьте строку «Разрешённая максимальная масса» в ПТС конкретной машины.
        </div>`);
    }
    if (gvwr > 5000) {
      alerts.push(`<div class="alert warn"><b>Больше 5 т — вне этого калькулятора</b>Для таких машин действуют другие ставки.</div>`);
    }
    if (gvwr > 0 && gvwr < 2000) {
      alerts.push(`<div class="alert warn"><b>Проверьте полную массу</b>У полноразмерных американских пикапов она обычно от 2 700 до 3 600 кг.</div>`);
    }

    el.out.innerHTML = `
      <div class="result-total">
        <div>
          <div class="muted" style="font-size:14px;font-weight:700">Примерно под ключ</div>
          <div class="sum">${rub(total)}</div>
        </div>
        <div class="usd">≈ ${usd(usdRate ? total / usdRate : 0)}</div>
      </div>
      <p class="state-share">Из них государству (пошлина, НДС, сборы): <b>${rub(toState)} — ${share}%</b></p>
      <div class="bar" role="img" aria-label="Структура стоимости">
        ${items.filter((i) => i.val > 0).map((i) => `<span title="${esc(i.name)}" style="width:${(i.val / total) * 100}%;background:${i.color}"></span>`).join("")}
      </div>
      <div class="rows">
        ${items.map((i) => `
          <div class="row">
            <span class="dot" style="background:${i.color}"></span>
            <div class="name">${esc(i.name)}<small>${esc(i.sub)}</small></div>
            <div class="val">${rub(i.val)}</div>
            ${i.status ? `
              <details>
                <summary>${statusBadge(i.status)} откуда цифра</summary>
                <p>${esc(i.note)}</p>
                ${sourcesList(i.sources)}
              </details>` : ""}
          </div>`).join("")}
      </div>
      ${alerts.join("")}
      <div class="alert info">
        <b>Как считаем</b>
        Ввоз физлицом как грузового автомобиля (код ТН ВЭД 8704). Таможенная стоимость = цена машины + доставка до границы. Ставки проверены ${esc(R.updated)}. ${esc(R.util.nextChange)}
        Это ориентир, а не оферта: перед покупкой сверьте расчёт с таможенным брокером или импортёром.
      </div>`;

    // Сохраняем выбор в адресе, чтобы расчётом можно было поделиться
    const params = new URLSearchParams({
      engine: el.preset.value, age: ageId, price: priceUsd, gvwr: gvwr
    });
    history.replaceState(null, "", "?" + params.toString());
  }

  // Начальные значения из адреса
  const qs = new URLSearchParams(location.search);
  const startEngine = qs.get("engine") && (window.findEngine(qs.get("engine")) || qs.get("engine") === "custom")
    ? qs.get("engine") : window.MODELS[0].engines[1].id;
  el.preset.value = startEngine;
  applyPreset(startEngine);
  if (qs.get("age") && form.querySelector(`input[name="age"][value="${CSS.escape(qs.get("age"))}"]`)) {
    form.querySelector(`input[name="age"][value="${CSS.escape(qs.get("age"))}"]`).checked = true;
  }
  if (qs.get("price") && +qs.get("price") > 0) el.price.value = qs.get("price");
  if (qs.get("gvwr") && +qs.get("gvwr") > 0) el.gvwr.value = qs.get("gvwr");

  // Цель для аналитики: человек сам что-то поменял в калькуляторе (один раз за визит)
  const track = () => { if (typeof window.trackGoal === "function") window.trackGoal("calc_used", true); };

  el.preset.addEventListener("change", () => { applyPreset(el.preset.value); compute(); track(); });
  form.addEventListener("input", (e) => { if (e.target !== el.preset) { compute(); track(); } });
  form.addEventListener("submit", (e) => e.preventDefault());
  compute();
})();
