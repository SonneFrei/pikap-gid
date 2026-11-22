(function () {
  "use strict";

  const fmt = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });
  const rub = (n) => fmt.format(Math.round(n)) + " ₽";
  const usd = (n) => "$" + fmt.format(Math.round(n));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // Официальный курс ЦБ РФ (зеркало cbr-xml-daily.ru, обновляется ежедневно).
  // Если недоступно — остаются значения по умолчанию.
  let cbrPromise = null;
  window.loadCbrRates = function () {
    if (!cbrPromise) {
      const ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
      const timer = ctrl ? setTimeout(() => ctrl.abort(), 5000) : null;
      cbrPromise = fetch("https://www.cbr-xml-daily.ru/daily_json.js", ctrl ? { signal: ctrl.signal } : {})
        .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        .then((d) => ({
          usd: Math.round(d.Valute.USD.Value * 100) / 100,
          eur: Math.round(d.Valute.EUR.Value * 100) / 100,
          date: new Date(d.Date).toLocaleDateString("ru-RU")
        }))
        .catch(() => null)
        .finally(() => timer && clearTimeout(timer));
    }
    return cbrPromise;
  };

  /* ---------- Мобильное меню ---------- */
  const siteHeader = document.querySelector(".site-header");
  const navToggle = siteHeader && siteHeader.querySelector(".nav-toggle");
  if (navToggle) {
    const setNavOpen = (open) => {
      siteHeader.classList.toggle("open", open);
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.textContent = open ? "Закрыть" : "Меню";
    };
    navToggle.addEventListener("click", () => setNavOpen(!siteHeader.classList.contains("open")));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setNavOpen(false); });
    document.addEventListener("click", (e) => { if (!siteHeader.contains(e.target)) setNavOpen(false); });
  }

  /* ---------- Разборы: рубрики и список статей ---------- */
  const rubricsBox = document.getElementById("rubrics");
  if (rubricsBox && window.ARTICLES) {
    const RUB = window.ARTICLE_RUBRICS;
    const rubName = (id) => (RUB.find((r) => r.id === id) || {}).name || id;
    const listBox = document.getElementById("article-list");
    const count = (id) => window.ARTICLES.filter((a) => a.rubrics.includes(id)).length;
    const dateRu = (iso) => new Date(iso + "T12:00:00").toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
    let current = new URLSearchParams(location.search).get("r");
    if (!RUB.some((r) => r.id === current) || !count(current)) current = null;

    const render = () => {
      rubricsBox.innerHTML = RUB.map((r) => {
        const n = count(r.id);
        const state = n ? `${n} ${n === 1 ? "разбор" : n < 5 ? "разбора" : "разборов"}` : "скоро";
        return `<button type="button" class="rubric" data-r="${esc(r.id)}" aria-pressed="${current === r.id}" ${n ? "" : "disabled"}>` +
          `<b>${esc(r.name)}</b><span>${esc(r.desc)}</span><small>${state}</small></button>`;
      }).join("");
      const items = window.ARTICLES.filter((a) => !current || a.rubrics.includes(current));
      listBox.innerHTML = items.map((a) =>
        `<a class="article-card" href="${esc(a.url)}">` +
        `<div class="meta">${a.rubrics.map((r) => `<span class="badge soon">${esc(rubName(r))}</span>`).join("")}<span>${esc(dateRu(a.date))}</span></div>` +
        `<h3>${esc(a.title)}</h3><p>${esc(a.lead)}</p></a>`
      ).join("") +
        (current ? `<p class="dim" style="margin:4px 0 0;font-size:14px">Показана рубрика «${esc(rubName(current))}». <a href="articles.html" data-r="">Все разборы</a></p>` : "");
    };
    const pick = (id) => {
      current = id && id !== current ? id : null;
      history.replaceState(null, "", current ? "?r=" + current : location.pathname);
      render();
    };
    rubricsBox.addEventListener("click", (e) => { const b = e.target.closest("button[data-r]"); if (b && !b.disabled) pick(b.dataset.r); });
    listBox.addEventListener("click", (e) => { const a = e.target.closest("a[data-r]"); if (a) { e.preventDefault(); pick(null); } });
    render();

    const planned = window.ARTICLES_PLANNED || [];
    if (planned.length) {
      document.getElementById("planned-list").innerHTML = planned.map((p) =>
        `<li>${esc(p.title)}<small>${esc(rubName(p.rubric))}</small></li>`).join("");
      document.getElementById("planned").hidden = false;
    }
  }

  const statusBadge = (status) =>
    status === "ok"
      ? '<span class="badge ok">проверено</span>'
      : '<span class="badge check">нужна сверка</span>';

  // Пометка «проверить»: раскрывается по клику и показывает, что именно сверяем
  const checkBadge = (note) =>
    `<details class="chk"><summary class="badge check">проверить</summary><span class="chk-note">${esc(note || "Источники расходятся — сверяем.")}</span></details>`;

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
            <div class="spec"><small>Цена в США от</small><b>${m.msrpFrom ? usd(m.msrpFrom) : "уточняем"}</b> ${m.msrpCheck ? checkBadge(m.msrpNote) : ""}</div>
            <div class="spec"><small>Мощность</small><b>${hpRange} л.с.</b></div>
            <div class="spec"><small>Полная масса (РММ)</small><b>${gvwr} кг</b> ${m.gvwrCheck ? checkBadge(m.gvwrNote) : ""}</div>
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
   * Главная: «пикап против легкового» — те же формулы, что в калькуляторе
   * ========================================================= */
  const vsN1 = document.getElementById("vs-n1");
  if (vsN1) {
    const R = window.RULES, P = R.passenger, SH = R.shipping;
    const ex = window.findEngine(P.example.engineId);
    const mln = (n, d) => (n / 1e6).toLocaleString("ru-RU", { minimumFractionDigits: d, maximumFractionDigits: d });
    const renderVs = (usdRate, eurRate, date) => {
      const { model, engine } = ex;
      const deliveryUsd = SH.slotRateUsd * SH.pickupSlots;
      const cv = (model.msrpFrom + deliveryUsd) * usdRate;
      // Пикап (N1): пошлина, НДС, таможенный сбор, грузовой утильсбор
      const duty = window.calcDuty(engine.fuel, engine.cc, "new", cv, eurRate);
      const vat = (cv + duty.rub) * R.vat.rate;
      const fee = window.calcCustomsFee(cv);
      const utilN1 = window.utilRow(model.gvwrDefault).new;
      const n1 = duty.rub + vat + fee + utilN1;
      // Легковой, ввезённый физлицом для себя: ЕТС + сбор + утильсбор по мощности
      const ets = window.calcPassengerETS(cv, eurRate, engine.cc);
      const utilM1 = P.utilBase * P.example.utilCoefNew;
      const m1 = ets.rub + P.feeRub + utilM1;
      const diff = m1 - n1;
      vsN1.textContent = `≈ ${mln(n1, 2)} млн`;
      document.getElementById("vs-m1").textContent = `≈ ${mln(m1, 2)} млн`;
      document.getElementById("vs-diff").textContent = `≈ ${mln(diff, 1)} млн ₽`;
      const sN1 = document.getElementById("stat-n1"), sD = document.getElementById("stat-diff");
      if (sN1) sN1.textContent = `≈ ${mln(n1, 1)} млн ₽`;
      if (sD) sD.textContent = `≈ ${mln(diff, 1)} млн ₽`;
      document.getElementById("vs-note").innerHTML = `
        <p>Новый ${esc(model.brand + " " + model.name)} с ${esc(engine.name)} (${engine.hp} л.с., ${fmt.format(engine.cc)} см³), стартовая версия за ${usd(model.msrpFrom)} + доставка ${usd(deliveryUsd)}, курс ${date ? `ЦБ РФ на ${esc(date)}` : "по умолчанию"}: $ — ${String(usdRate).replace(".", ",")} ₽, € — ${String(eurRate).replace(".", ",")} ₽. Считаем только платежи государству, без цены машины.</p>
        <p><b>Как пикап (грузовой N1), ${rub(n1)}:</b> пошлина ${esc(duty.label)} — ${rub(duty.rub)}, НДС 22% — ${rub(vat)}, таможенный сбор — ${rub(fee)}, утильсбор — ${rub(utilN1)}.</p>
        <p><b>Если бы был легковым и ввезён для себя, ${rub(m1)}:</b> единая ставка ${Math.round(ets.pct * 100)}%, но не меньше €${String(ets.minEurCc).replace(".", ",")} за см³${ets.byMin ? " — здесь срабатывает минимум" : ""} — ${rub(ets.rub)} (НДС и акциз внутри неё), сбор — ${rub(P.feeRub)}, утильсбор — ${rub(utilM1)}: льгота для физлиц только до 160 л.с.</p>
        <p class="dim">${esc(P.note)}</p>
        ${sourcesList(P.sources.concat(R.duty.sources.slice(0, 1), R.util.sources.slice(0, 1)))}`;
    };
    renderVs(82, 90, null);
    window.loadCbrRates().then((r) => { if (r) renderVs(r.usd, r.eur, r.date); });
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
   * Материал «Граница 3,5 т»: интерактивная проверка массы
   * ========================================================= */
  const massTool = document.getElementById("mass-tool");
  if (massTool) {
    const range = document.getElementById("mass-range");
    const numIn = document.getElementById("mass-num");
    const out = document.getElementById("mass-result");
    const presets = [
      { label: "F-150 Raptor", kg: 3334 },
      { label: "RAM 1500 (тяжёлая версия)", kg: 3400 },
      { label: "TRX — ПТС №1", kg: 3300 },
      { label: "TRX — ПТС №2", kg: 3538 },
      { label: "Raptor R (по дилерам)", kg: 3402 },
      { label: "SRT TRX 2027 (данные Ram)", kg: 3538 },
      { label: "RAM 2500 (оценка)", kg: 4300 }
    ];
    const presetBox = document.getElementById("mass-presets");
    presetBox.innerHTML = presets.map((p, i) => `<button type="button" data-i="${i}">${esc(p.label)} · ${fmt.format(p.kg)} кг</button>`).join("");

    const item = (state, title, text) => `
      <li class="mi ${state}">
        <span class="mi-icon" aria-hidden="true">${state === "ok" ? "✓" : state === "bad" ? "✕" : "?"}</span>
        <div><b>${title}</b>${text ? `<span>${text}</span>` : ""}</div>
      </li>`;

    function update(kg, from) {
      kg = Math.round(+kg || 0);
      if (from !== "range") range.value = Math.min(Math.max(kg, +range.min), +range.max);
      if (from !== "num") numIn.value = kg;
      [...presetBox.children].forEach((b) => b.setAttribute("aria-selected", String(presets[+b.dataset.i].kg === kg)));
      if (kg < 1500) {
        out.innerHTML = `<div class="mass-verdict warn"><b>Введите полную массу из ПТС, в килограммах.</b> У полноразмерных пикапов это обычно от 2 700 до 3 600 кг.</div>`;
        return;
      }

      const over = kg > 3500;
      const margin = 3500 - kg;
      const row = window.utilRow(kg);
      const items = [];

      items.push(over
        ? item("bad", `Права: нужна категория ${kg > 7500 ? "C" : "C1 или C"}`, "С категорией B за руль садиться нельзя — это езда без прав нужной категории.")
        : item("ok", "Права: достаточно категории B", ""));
      items.push(over
        ? item("bad", "Под знак 3.4 «Движение грузовых запрещено» — нельзя", "Даже если на знаке нет цифры. Штраф — 5 000 ₽, в Москве и Петербурге — 7 500 ₽.")
        : item("ok", "Под знак 3.4 без цифры — можно", "Знак без цифры запрещает проезд только грузовикам тяжелее 3,5 т. Если на знаке есть табличка или цифра — смотрите её."));
      items.push(over
        ? item("bad", "Скорость: не больше 70 км/ч за городом и 90 на автомагистрали", "Как у грузовика (п. 10.3 ПДД).")
        : item("ok", "Скорость как у легковых: до 90 км/ч за городом, до 110 на автомагистрали", "п. 10.3 ПДД"));
      if (over) items.push(item("bad", "На автомагистрали — не дальше второй полосы", "Штраф 1 000 ₽ (КоАП 12.11)."));
      items.push(over
        ? item("bad", "Стоянка во дворах (жилая зона) — только в специально обозначенных местах", "п. 17.2 ПДД.")
        : item("ok", "Стоянка в жилой зоне — как у всех", ""));
      if (kg > 2500) items.push(item("bad", "Крайняя левая полоса на дорогах от трёх полос — только для поворота", "Действует для любого пикапа тяжелее 2,5 т, даже легче 3,5 т (п. 9.4 ПДД)."));
      items.push(item("check", "Въезд в центр Москвы", over
        ? `Грузовикам тяжелее 3,5 т внутри МКАД нужен пропуск днём и ночью. Подробнее — в разборе <a href="pickup-city.html">«Пикап в Москве»</a>.`
        : `Днём внутри ТТК нельзя грузовикам грузоподъёмностью больше 1 т (разрешённая масса минус масса без нагрузки). Проверьте свою машину в разборе <a href="pickup-city.html">«Пикап в Москве»</a>.`));
      items.push(kg <= 5000
        ? item(over ? "check" : "ok", `Утильсбор (как грузовик, новая машина): ${rub(row.new)}`,
          over ? `Строка «${row.label}» — на ${rub(row.new - window.RULES.util.rows[1].new)} больше, чем до 3,5 т. Но если машину оформят как легковую (M1G), счёт пойдёт на миллионы.` : `Строка «${row.label}».`)
        : item("check", "Утильсбор", "Больше 5 т — другие ставки, вне этого расчёта."));

      out.innerHTML = `
        <div class="mass-verdict ${over ? "bad" : margin <= 150 ? "warn" : "ok"}">
          ${over
            ? `<b>${fmt.format(kg)} кг — это больше 3,5 т на ${fmt.format(-margin)} кг.</b> Для закона это уже другая машина.`
            : margin <= 150
              ? `<b>${fmt.format(kg)} кг — в пределах 3,5 т, но запас всего ${fmt.format(margin)} кг.</b> Перепроверьте ПТС: такие машины легко оказываются по ту сторону границы.`
              : `<b>${fmt.format(kg)} кг — в пределах 3,5 т</b> (запас ${fmt.format(margin)} кг).`}
        </div>
        <ul class="mass-items">${items.join("")}</ul>`;
    }

    range.addEventListener("input", () => update(range.value, "range"));
    numIn.addEventListener("input", () => update(numIn.value, "num"));
    presetBox.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-i]");
      if (b) update(presets[+b.dataset.i].kg);
    });
    update(3538);
  }

  /* =========================================================
   * Материал «Пикап в Москве»: грузоподъёмность по СТС
   * ========================================================= */
  const cityTool = document.getElementById("city-tool");
  if (cityTool) {
    const rmmIn = document.getElementById("city-rmm");
    const curbIn = document.getElementById("city-curb");
    const out = document.getElementById("city-result");
    const kg = (n) => fmt.format(n) + " кг";
    const item = (state, title, text) => `
      <li class="mi ${state}">
        <span class="mi-icon" aria-hidden="true">${state === "ok" ? "✓" : state === "bad" ? "✕" : "?"}</span>
        <div><b>${title}</b>${text ? `<span>${text}</span>` : ""}</div>
      </li>`;

    function update() {
      const rmm = Math.round(+rmmIn.value || 0);
      const curb = Math.round(+curbIn.value || 0);
      if (rmm < 1000 || curb < 500 || curb >= rmm) {
        out.innerHTML = `<div class="mass-verdict warn"><b>Проверьте цифры.</b> Разрешённая максимальная масса должна быть больше массы без нагрузки. У полноразмерных пикапов это обычно около 2 700–3 600 кг и 2 000–2 800 кг.</div>`;
        return;
      }
      const payload = rmm - curb;
      const overTon = payload > 1000;
      const heavy = rmm > 3500;
      const items = [];

      items.push(overTon
        ? item("bad", "Внутри ТТК и по ТТК с 7:00 до 23:00 — нельзя", `Грузоподъёмность ${kg(payload)} больше 1 000 кг. Ночью, с 23:00 до 7:00, это ограничение не действует.`)
        : item("ok", "Внутри ТТК и по ТТК днём — можно", payload > 950
          ? `Грузоподъёмность ${kg(payload)} — в пределах тонны, но запас всего ${kg(1000 - payload)}. Сверьте цифры с документами ещё раз.`
          : `Грузоподъёмность ${kg(payload)} — не больше 1 000 кг.`));
      items.push(heavy
        ? item("bad", "Внутри МКАД и по МКАД — только с пропуском, днём и ночью", `Разрешённая масса ${kg(rmm)} больше 3 500 кг. Плюс права категории C.`)
        : item("ok", "Пропуск для МКАД и внутрь неё не нужен", `Разрешённая масса ${kg(rmm)} — не больше 3 500 кг.`));
      items.push(heavy
        ? item("bad", "Под знак 3.4 нельзя — даже без цифры", "Штраф в Москве — 7 500 ₽, повторно — 10 000 ₽.")
        : item("check", "Знак 3.4 без цифры — можно, с цифрой — сравните", `Если на знаке масса меньше ${kg(rmm)}, проезд запрещён. Штраф в Москве — 7 500 ₽.`));
      if (rmm > 2500) items.push(item("check", "Въезд в жилые районы с грузового каркаса — смотрите на знак",
        "Дептранс считает ограничение для грузовиков тяжелее 2,5 т, а по ПДД табличка без цифры касается только грузовиков тяжелее 3,5 т. Если живёте или работаете в районе — проезд разрешён."));
      items.push(item("check", "Экологический класс — смотрите ПТС", "Внутри ТТК нужен класс не ниже 3, между МКАД и ТТК — не ниже 2."));

      const verdict = overTon
        ? `<div class="mass-verdict bad"><b>Грузоподъёмность ${kg(payload)} — больше тонны.</b> Днём в центр Москвы этой машине нельзя.${heavy ? " А из-за разрешённой массы больше 3,5 т внутри МКАД нужен пропуск." : ""}</div>`
        : heavy
          ? `<div class="mass-verdict bad"><b>Разрешённая масса ${kg(rmm)} — больше 3,5 т.</b> Грузоподъёмность ${kg(payload)} в пределах тонны, но по Москве эта машина ездит только с пропуском, а водителю нужны права категории C.</div>`
          : `<div class="mass-verdict ${payload > 950 ? "warn" : "ok"}"><b>Грузоподъёмность ${kg(payload)} — не больше тонны.</b> Ограничение для центра по грузоподъёмности вас не касается.</div>`;
      out.innerHTML = `${verdict}<ul class="mass-items">${items.join("")}</ul>`;
    }

    rmmIn.addEventListener("input", update);
    curbIn.addEventListener("input", update);
    update();
  }

  /* =========================================================
   * Сравнения лоб в лоб
   * ========================================================= */
  const compareRoot = document.getElementById("compare-root");
  if (compareRoot) {
    const R = window.RULES;
    const SH = R.shipping;
    const DEF = { deliveryUsd: SH.slotRateUsd * SH.pickupSlots, usdRate: 82, eurRate: 90, otherRub: 200000 };
    const NHTSA_OF = {
      "ram-1500": "ram-1500", "ram-trx": "ram-trx", "ram-srt-trx": "ram-trx",
      "ford-f150": "ford-f150", "ford-raptor": "ford-raptor", "ford-raptor-r": "ford-raptor",
      "chevy-silverado": "chevy-silverado", "gmc-sierra": "gmc-sierra"
    };
    const PAIRS = [
      {
        a: "ram-1500", b: "ford-f150", title: "RAM 1500 vs F-150",
        points: [
          "F-150 дешевле на старте ($37 290 против $40 275) и даёт больше выбора моторов — от V6 2.7 до гибрида PowerBoost.",
          "Нюанс растаможки: у F-150 2.7 объём меньше 2 800 см³, поэтому пошлина для новой машины — 15%, а у V6 3.5 и V8 — 12,5%. Меньший мотор растаможить дороже в процентах. У RAM все моторы больше 2,8 л — везде 12,5%.",
          "RAM в 2026 году вернул HEMI V8 5.7 (с 2027 модельного года — постепенно без гибридной системы eTorque) и предлагает рядную «шестёрку» Hurricane до 540 л.с. — это самый мощный мотор в паре (у обычного F-150 максимум 430 л.с., без учёта Raptor).",
          "Обе модели по полной массе в пределах 3,5 т: права категории B, грузовой утильсбор.",
          "Отзывных кампаний у F-150 почти вдвое больше (57 против 30), но и продаётся он в разы больше — это не прямое сравнение надёжности. Что именно отзывали — во вкладке «Болячки»."
        ]
      },
      {
        a: "ram-srt-trx", b: "ford-raptor-r", title: "SRT TRX vs Raptor R",
        points: [
          "777 против 720 л.с. и $99 995 против $110 930 — на бумаге новый TRX и мощнее, и дешевле.",
          "Но главный вопрос для России — масса. У Raptor R в карточках дилеров Ford — 7 500 lb ≈ 3 402 кг: в пределах 3,5 т, но запас около 100 кг (в спецификации Ford цифры нет — сверяйте по ПТС). У нового TRX Ram указывает 7 800 lb ≈ 3 538 кг — больше 3,5 т: права категории C1, запрет проезда под знак 3.4 и утильсбор по другой строке.",
          "Поэтому до покупки проверьте строку «Разрешённая максимальная масса» в ПТС: для этой пары она важнее, чем 57 л.с. разницы.",
          "Обе машины широкие — около 2,2 м без зеркал при ширине контейнера изнутри примерно 2,35 м. В контейнере каждая занимает как минимум два места, как два легковых автомобиля. Не посчитает ли перевозчик её за весь контейнер, нужно уточнять до оплаты: разница может доходить до $5 600.",
          "Отдельной статистики жалоб ни по TRX, ни по Raptor NHTSA не ведёт — смотрите общие данные RAM 1500 и F-150 во вкладке «Болячки»."
        ]
      },
      {
        a: "chevy-silverado", b: "gmc-sierra", title: "Silverado vs Sierra",
        points: [
          "По сути, это одна машина: общая платформа, одинаковые моторы (2.7 TurboMax, V8 5.3 и 6.2, дизель 3.0 Duramax) и почти все отзывные кампании общие.",
          "Разница — в дизайне, оснащении и позиционировании: GMC продаётся как более «премиальная» версия, особенно Denali и AT4X (до $84 200).",
          "У обоих есть дизель 3.0 Duramax: пошлина для дизеля — 10% вместо 12,5–15% у бензиновых версий.",
          "Если смотрите V8 6.2 2021–2024 годов, обязательно проверьте по VIN отзывную кампанию 25V274 — дефект шатунов и коленвала, двигатель может разрушиться.",
          "Стартовые цены по источникам близки ($38 300 у Sierra Pro и $39 695 у Silverado Regular Cab), но данные расходятся — сверяйте с конкретной комплектацией."
        ]
      }
    ];

    // Примерная цена под ключ: базовая версия (первый мотор), новая машина, наши допущения
    function estimate(m) {
      if (!m.msrpFrom) return null;
      const e = m.engines[0];
      const cv = (m.msrpFrom + DEF.deliveryUsd) * DEF.usdRate;
      const duty = window.calcDuty(e.fuel, e.cc, "new", cv, DEF.eurRate);
      const vat = (cv + duty.rub) * R.vat.rate;
      const fee = window.calcCustomsFee(cv);
      const util = window.utilRow(m.gvwrDefault).new;
      return { total: cv + duty.rub + vat + fee + util + DEF.otherRub, engine: e };
    }

    const dutyLabels = (m) => {
      const set = new Map();
      m.engines.forEach((e) => {
        const d = window.calcDuty(e.fuel, e.cc, "new", 1000000, DEF.eurRate).label;
        const short = e.name.split(" ").slice(0, 2).join(" ");
        const list = set.get(d) || [];
        if (!list.includes(short)) list.push(short);
        set.set(d, list);
      });
      return [...set.entries()].map(([d, names]) => `${d} (${names.join(", ")})`).join("<br>");
    };

    const selA = document.getElementById("cmp-a");
    const selB = document.getElementById("cmp-b");
    const opts = window.MODELS.map((m) => `<option value="${esc(m.id)}">${esc(m.brand + " " + m.name)}</option>`).join("");
    selA.innerHTML = opts; selB.innerHTML = opts;

    const chips = document.getElementById("pair-chips");
    chips.innerHTML = PAIRS.map((p, i) => `<button type="button" data-pair="${i}">${esc(p.title)}</button>`).join("") +
      '<button type="button" data-pair="custom">Свои две модели</button>';

    function row(label, va, vb, win) {
      // win: "a" | "b" | null — подсветка того, кто выигрывает
      return `
        <tr>
          <th scope="row">${label}</th>
          <td class="${win === "a" ? "win" : ""}">${va}</td>
          <td class="${win === "b" ? "win" : ""}">${vb}</td>
        </tr>`;
    }
    const better = (a, b, lowerIsBetter) => {
      if (a == null || b == null || a === b) return null;
      return (lowerIsBetter ? a < b : a > b) ? "a" : "b";
    };

    let current = null;
    window.loadCbrRates().then((r) => {
      if (!r) return;
      DEF.usdRate = r.usd; DEF.eurRate = r.eur; DEF.rateDate = r.date;
      if (current) render(...current);
    });

    function render(aId, bId, pair) {
      current = [aId, bId, pair];
      const A = window.findModel(aId), B = window.findModel(bId);
      selA.value = aId; selB.value = bId;
      [...chips.children].forEach((c) => c.setAttribute("aria-selected", String(
        pair ? c.dataset.pair === String(PAIRS.indexOf(pair)) : c.dataset.pair === "custom")));
      if (!A || !B) return;

      const eA = estimate(A), eB = estimate(B);
      const hpMax = (m) => Math.max(...m.engines.map((e) => e.hp));
      const hpRange = (m) => { const h = m.engines.map((e) => e.hp); return Math.min(...h) === Math.max(...h) ? `${Math.min(...h)}` : `${Math.min(...h)}–${Math.max(...h)}`; };
      const margin = (m) => R.massLimitKg - m.gvwrKg[1];
      const massCell = (m) => {
        const mg = margin(m);
        const range = m.gvwrKg[0] === m.gvwrKg[1] ? fmt.format(m.gvwrKg[0]) : `${fmt.format(m.gvwrKg[0])}–${fmt.format(m.gvwrKg[1])}`;
        return `${range} кг${m.gvwrCheck ? " " + checkBadge(m.gvwrNote) : ""}<br><small>${mg >= 0 ? `запас до 3,5 т: ${fmt.format(mg)} кг` : `<span class="neg">может превышать 3,5 т на ${fmt.format(-mg)} кг</span>`}</small>`;
      };
      const license = (m) => m.gvwrKg[1] > R.massLimitKg
        ? (m.gvwrKg[0] > R.massLimitKg ? "C" : "B или C — смотрите РММ в ПТС")
        : "B";
      const nh = (m) => window.NHTSA && window.NHTSA.models[NHTSA_OF[m.id]];
      const complaintsCell = (m) => {
        const d = nh(m);
        if (!d) return "—";
        const top = d.complaints.byComponent.slice(0, 3).map(([n]) => window.ruComponent(n)).join(", ");
        const derived = NHTSA_OF[m.id] === "ram-trx" || NHTSA_OF[m.id] === "ford-raptor";
        const n = d.complaints.total, n10 = n % 10, n100 = n % 100;
        const word = n10 === 1 && n100 !== 11 ? "жалоба" : n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14) ? "жалобы" : "жалоб";
        return `${derived ? "мало данных: " : ""}${esc(top)}<br><small>${fmt.format(n)} ${word}${derived ? " с упоминанием модели" : ""}</small>`;
      };
      const recallsCell = (m) => { const d = nh(m); return d ? fmt.format(d.recalls.length) : "—"; };
      const hasDiesel = (m) => m.engines.some((e) => e.fuel === "diesel");

      compareRoot.innerHTML = `
        <div class="table-wrap">
          <table class="cmp">
            <thead>
              <tr><th></th>
                <th><span class="brand">${esc(A.brand)}</span>${esc(A.name)}</th>
                <th><span class="brand">${esc(B.brand)}</span>${esc(B.name)}</th>
              </tr>
            </thead>
            <tbody>
              ${row("Цена в США от", A.msrpFrom ? usd(A.msrpFrom) : "уточняем", B.msrpFrom ? usd(B.msrpFrom) : "уточняем", better(A.msrpFrom, B.msrpFrom, true))}
              ${row("Примерно под ключ в России<br><small>новая, базовая версия</small>",
                eA ? `${rub(eA.total)}<br><small>${esc(eA.engine.name)}</small>` : "—",
                eB ? `${rub(eB.total)}<br><small>${esc(eB.engine.name)}</small>` : "—",
                better(eA && eA.total, eB && eB.total, true))}
              ${row("Мощность, л.с.", hpRange(A), hpRange(B), better(hpMax(A), hpMax(B), false))}
              ${row("Моторы", A.engines.map((e) => esc(e.name)).join("<br>"), B.engines.map((e) => esc(e.name)).join("<br>"), null)}
              ${row("Дизель", hasDiesel(A) ? "есть" : "нет", hasDiesel(B) ? "есть" : "нет", null)}
              ${row("Пошлина для новой", dutyLabels(A), dutyLabels(B), null)}
              ${row("Полная масса (РММ)", massCell(A), massCell(B), better(margin(A), margin(B), false))}
              ${row("Права", license(A), license(B), null)}
              ${row("Что чаще всего ломается<br><small>по жалобам NHTSA</small>", complaintsCell(A), complaintsCell(B), null)}
              ${row("Отзывных кампаний<br><small>меньше — не значит надёжнее</small>", recallsCell(A), recallsCell(B), null)}
            </tbody>
          </table>
        </div>
        <p class="dim" style="font-size:13px;margin:10px 0 0">
          Подсвечено, кто выигрывает по строке. «Под ключ» — по нашим допущениям: доставка $${fmt.format(DEF.deliveryUsd)} (пикап занимает ${SH.pickupSlots} места в контейнере по $${fmt.format(SH.slotRateUsd)}), курс ${String(DEF.usdRate).replace(".", ",")} ₽/$${DEF.rateDate ? ` (ЦБ РФ на ${DEF.rateDate})` : ""}, прочие расходы ${fmt.format(DEF.otherRub)} ₽.
          Свою конфигурацию посчитайте в <a href="calculator.html">калькуляторе</a>.
        </p>

        ${pair ? `
          <section class="panel" style="margin-top:16px">
            <h2>Разбор: ${esc(pair.title)}</h2>
            <ul class="points">${pair.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
          </section>` : ""}

        <div class="grid cols-2" style="margin-top:16px">
          ${[A, B].map((m) => `
            <div class="card">
              <div class="top"><span class="num">${esc(m.brand)}</span></div>
              <h3>${esc(m.name)}</h3>
              <p>${esc(m.tagline)}</p>
              <div class="foot" style="display:flex;gap:10px;flex-wrap:wrap;margin-top:8px">
                <a class="btn" style="padding:10px 16px;font-size:14px" href="calculator.html?engine=${encodeURIComponent(m.engines[0].id)}">Посчитать</a>
                <a class="btn ghost" style="padding:10px 16px;font-size:14px" href="issues.html#${encodeURIComponent(NHTSA_OF[m.id])}">Болячки</a>
              </div>
            </div>`).join("")}
        </div>`;

      history.replaceState(null, "", `?a=${encodeURIComponent(aId)}&b=${encodeURIComponent(bId)}`);
    }

    const findPair = (a, b) => PAIRS.find((p) => (p.a === a && p.b === b) || (p.a === b && p.b === a));

    chips.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-pair]");
      if (!btn) return;
      if (btn.dataset.pair === "custom") { render(selA.value, selB.value, null); selA.focus(); return; }
      const p = PAIRS[+btn.dataset.pair];
      render(p.a, p.b, p);
    });
    const onSelect = () => render(selA.value, selB.value, findPair(selA.value, selB.value) || null);
    selA.addEventListener("change", onSelect);
    selB.addEventListener("change", onSelect);

    const q = new URLSearchParams(location.search);
    const qa = q.get("a"), qb = q.get("b");
    if (qa && qb && window.findModel(qa) && window.findModel(qb)) render(qa, qb, findPair(qa, qb) || null);
    else render(PAIRS[0].a, PAIRS[0].b, PAIRS[0]);
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
    slots: () => +form.querySelector('input[name="slots"]:checked').value,
    shipHint: $("ship-hint"),
    priceLabel: $("price-label"),
    priceHint: $("price-hint"),
    usdRate: $("usdRate"),
    eurRate: $("eurRate"),
    other: $("other"),
    hp: $("hp"),
    km: $("km"),
    l100: $("l100"),
    fuelSel: $("fuel"),
    fuelPrice: $("fuelPrice"),
    fuelHint: $("fuel-hint"),
    out: $("calc-result"),
    presetInfo: $("preset-info")
  };

  // Два списка: модель → мотор этой модели. el.preset — это список моторов (id мотора или "custom").
  el.model = $("model");
  el.engineField = $("engine-field");
  el.lockHint = $("lock-hint");
  el.model.innerHTML =
    window.MODELS.map((m) => `<option value="${esc(m.id)}">${esc(m.brand + " " + m.name)}</option>`).join("") +
    '<option value="custom">Другая машина — ввести вручную</option>';

  function fillEngines(modelId) {
    const m = window.findModel(modelId);
    if (!m) {
      el.preset.innerHTML = '<option value="custom">—</option>';
      el.preset.value = "custom";
      el.engineField.hidden = true;
      return;
    }
    el.engineField.hidden = false;
    el.preset.innerHTML = m.engines.map((e) => `<option value="${esc(e.id)}">${esc(e.name + " · " + e.hp + " л.с.")}</option>`).join("");
  }

  // У выбранного мотора топливо, объём и мощность известны — менять их нельзя, иначе расчёт
  // выйдет под чужим названием (например, «дизельный» RAM 1500). Свои цифры — через «Другая машина».
  function setLocked(locked) {
    form.querySelectorAll('input[name="fuel"]').forEach((i) => { i.disabled = locked; });
    el.cc.readOnly = locked;
    el.hp.readOnly = locked;
    el.lockHint.hidden = !locked;
  }

  const num = (input) => {
    const v = parseFloat(String(input.value).replace(/\s/g, "").replace(",", "."));
    return isFinite(v) && v >= 0 ? v : 0;
  };

  let priceTouched = false; // человек сам вписал цену (например, из объявления о б/у)
  function applyPreset(engineId) {
    const found = window.findEngine(engineId);
    if (!found) { setLocked(false); el.presetInfo.textContent = ""; return; }
    setLocked(true);
    const { model, engine } = found;
    form.querySelector(`input[name="fuel"][value="${engine.fuel}"]`).checked = true;
    el.cc.value = engine.cc;
    el.hp.value = engine.hp;
    if (engine.mpg) {
      const F = R.fuel;
      const fuelKey = F.gradeToFuel[engine.grade] || "ai95";
      el.l100.value = window.mpgToL100(engine.mpg);
      el.fuelSel.value = fuelKey;
      el.fuelPrice.value = F.prices[fuelKey];
      el.fuelHint.textContent = `${F.gradeNote[engine.grade] || ""} Расход по EPA: ${engine.mpg} миль/галлон ≈ ${String(window.mpgToL100(engine.mpg)).replace(".", ",")} л/100 км в смешанном цикле.`;
    }
    el.gvwr.value = model.gvwrDefault;
    el.price.value = model.msrpFrom || "";
    priceTouched = false;
    const SH = R.shipping;
    // Новая модель — места в контейнере снова по умолчанию (пикап = 2), а не от прошлого выбора
    const slotInput = form.querySelector(`input[name="slots"][value="${SH.pickupSlots}"]`);
    if (slotInput) slotInput.checked = true;
    el.shipHint.textContent = `В 40-футовый контейнер входит ${SH.containerSlots} легковых или 2 полноразмерных пикапа — поэтому ${model.brand} ${model.name} занимает ${SH.pickupSlots} места.` +
      (model.wide ? ` Широкий кузов. ${model.widthNote} Внутри контейнер около 2,35 м, так что по бокам остаётся всего несколько сантиметров. Возьмёт ли перевозчик такую машину за 2 места или за весь контейнер (4 места), заранее не скажешь — спрашивайте до оплаты. Разница — ещё 2 места, примерно $${fmt.format(2 * SH.slotRateUsd)} по нашей ставке.` : "");
    el.presetInfo.innerHTML =
      `${esc(engine.hp)} л.с., ${fmt.format(engine.cc)} см³. Полная масса у этой модели: ${fmt.format(model.gvwrKg[0])}–${fmt.format(model.gvwrKg[1])} кг — ` +
      `<b>подставьте цифру из ПТС</b>, если она известна.` +
      (model.msrpFrom ? "" : " Цену в США по этой модели уточняем — введите свою.");
  }

  // --- Стоимость владения: транспортный налог как у грузовика и «если бы был легковым»
  function ownBlock(hp, total, fuel) {
    if (!hp) return "";
    const T = R.transportTax;
    const F = R.fuel;
    const truck = window.calcTransportTax(hp, "truck");
    const car = window.calcTransportTax(hp, "car");
    const luxury = total >= T.luxuryFromRub;
    const carTotal = car.rub * (luxury ? T.luxuryCoef : 1);
    const saving = carTotal - truck.rub;
    return `
      <section class="own">
        <h3>Сколько стоит владеть</h3>
        <p class="own-sub">Транспортный налог</p>
        <div class="own-grid">
          <div class="own-card main">
            <small>Как пикап (грузовой), ${esc(T.region)}</small>
            <b>${rub(truck.rub)} <span>в год</span></b>
            <small>${fmt.format(hp)} л.с. × ${truck.rate} ₽</small>
          </div>
          <div class="own-card">
            <small>Если бы это был легковой</small>
            <b>${rub(carTotal)} <span>в год</span></b>
            <small>${fmt.format(hp)} л.с. × ${car.rate} ₽${luxury ? ` × ${T.luxuryCoef} — «налог на роскошь» для легковых дороже 10 млн ₽ из перечня Минпромторга` : ""}</small>
          </div>
        </div>
        ${saving > 0 ? `<p class="own-save">Экономия статуса грузовика: <b>${rub(saving)} в год</b>${luxury ? " — коэффициент ×3 к пикапу не применяется." : "."}</p>` : ""}
        <details>
          <summary>${statusBadge(T.status)} откуда цифры по налогу</summary>
          <p>${esc(T.note)}</p>
          ${sourcesList(T.sources)}
        </details>
        ${fuel && fuel.rub > 0 ? `
          <h3 style="margin-top:16px">Топливо</h3>
          <div class="own-grid">
            <div class="own-card">
              <small>${esc(fuel.label)} · ${fmt.format(fuel.km)} км в год</small>
              <b>${rub(fuel.rub)} <span>в год</span></b>
              <small>${String(fuel.l100).replace(".", ",")} л/100 км × ${String(fuel.price).replace(".", ",")} ₽/л</small>
            </div>
            <div class="own-card main">
              <small>Налог + топливо</small>
              <b>${rub(truck.rub + fuel.rub)} <span>в год</span></b>
              <small>≈ ${rub((truck.rub + fuel.rub) / 12)} в месяц, без ТО, страховки и шин</small>
            </div>
          </div>
          <details>
            <summary>${statusBadge(F.status)} откуда цифры по топливу</summary>
            <p>${esc(F.note)} Цены на ${esc(F.date)}.</p>
            ${sourcesList(F.sources)}
          </details>` : ""}
      </section>`;
  }

  // --- Smoke-test: интерес к подбору у импортёров. Персональные данные не собираем.
  let lastCalc = null;
  function leadBlock() {
    return `
      <section class="lead" id="lead-box">
        <div>
          <h3>Хотите такую машину?</h3>
          <p>Соберём предложения от проверенных импортёров под ваш расчёт — с реальными ценами и сроками.</p>
        </div>
        <button type="button" class="btn" id="lead-btn">Хочу предложения</button>
      </section>`;
  }
  el.out.addEventListener("click", (e) => {
    if (!e.target.closest("#lead-btn")) return;
    if (typeof window.trackGoal === "function" && lastCalc) {
      window.trackGoal("lead_click", false, lastCalc);
    }
    const box = document.getElementById("lead-box");
    box.classList.add("done");
    box.innerHTML = `
      <div>
        <h3>Спасибо — ваш интерес учтён</h3>
        <p>Подбор у проверенных импортёров мы только запускаем. Такие клики показывают нам, для каких машин запускать его первым. Контакты мы не собираем — следите за обновлениями сайта.</p>
      </div>`;
  });

  function compute() {
    const fuel = el.fuel();
    const ageId = el.age();
    const cc = num(el.cc);
    const gvwr = num(el.gvwr);
    const priceUsd = num(el.price);
    const slotUsd = num(el.delivery);
    const slots = el.slots();
    const deliveryUsd = slotUsd * slots;
    const usdRate = num(el.usdRate);
    const eurRate = num(el.eurRate);
    const otherRub = num(el.other);
    const hp = num(el.hp);
    const fuelYear = {
      km: num(el.km), l100: num(el.l100), price: num(el.fuelPrice),
      label: R.fuel.labels[el.fuelSel.value] || ""
    };
    fuelYear.rub = (fuelYear.km / 100) * fuelYear.l100 * fuelYear.price;

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
      {
        key: "delivery", color: "var(--c-delivery)", name: "Доставка до границы РФ",
        sub: `${slots} ${slots === 1 ? "место" : "места"} в контейнере × ${usd(slotUsd)} = ${usd(deliveryUsd)} — оценка, уточните у импортёра`,
        val: deliveryRub, status: R.shipping.status, note: R.shipping.note, sources: R.shipping.sources
      },
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
    const found = window.findEngine(el.preset.value);
    lastCalc = {
      model: found ? `${found.model.brand} ${found.model.name}` : "Другая машина",
      engine: found ? found.engine.name : `${fmt.format(cc)} см³`,
      age: ageId,
      total_rub: Math.round(total)
    };
    const toState = duty.rub + vat + fee + util;
    const share = total > 0 ? Math.round((toState / total) * 100) : 0;

    // Возраст: цена из пресета — это цена новой машины
    const used = ageId !== "new";
    el.priceLabel.textContent = used ? "Цена б/у в США (из объявления), $" : "Цена в США, $";
    el.priceHint.textContent = used
      ? "Возраст меняет пошлину и утильсбор, а цену машины калькулятор не угадывает — впишите цену конкретного объявления."
      : "Стартовая цена новой машины. Для б/у поставьте цену из объявления.";

    // Предупреждения
    const alerts = [];
    if (used && !priceTouched && found && found.model.msrpFrom && priceUsd === found.model.msrpFrom) {
      alerts.push(`
        <div class="alert warn">
          <b>В расчёте цена новой машины</b>
          ${usd(priceUsd)} — стартовая цена новой ${esc(found.model.brand + " " + found.model.name)} в США. Б/у стоит меньше, а с ней меньше и пошлина с НДС. Впишите цену из объявления в поле «Цена б/у в США» — итог пересчитается.
        </div>`);
    }
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
          <a href="limit-3500.html">Подробный разбор: что меняет граница 3,5 т →</a>
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
    if (!priceUsd) {
      alerts.unshift(`<div class="alert warn"><b>Впишите цену машины</b>Новых машин этой модели в продаже нет — поставьте в поле «Цена б/у в США» цену из объявления, иначе итог посчитан без самой машины.</div>`);
    }
    if (gvwr > 0 && gvwr < 2000) {
      alerts.push(`<div class="alert warn"><b>Проверьте полную массу</b>У полноразмерных американских пикапов она обычно от 2 700 до 3 600 кг.</div>`);
    }

    // Что меняет возраст при той же цене машины
    const ageRows = window.AGE_GROUPS.map((a) => {
      const d = window.calcDuty(fuel, cc, a.id, customsValue, eurRate);
      const v = (customsValue + d.rub) * R.vat.rate;
      const u = a.utilNew ? row.new : row.old;
      return { a, duty: d, state: d.rub + v + fee + u, util: u };
    });
    const ageTable = `
      <details class="age-box">
        <summary>Как возраст меняет платежи государству при этой цене</summary>
        <table class="age-table">
          <thead><tr><th>Возраст</th><th>Пошлина</th><th>Утильсбор</th><th>Всего государству</th></tr></thead>
          <tbody>
            ${ageRows.map((r) => `<tr class="${r.a.id === ageId ? "cur" : ""}"><td>${esc(r.a.label)}</td><td>${esc(r.duty.label)}</td><td>${rub(r.util)}</td><td>${rub(r.state)}</td></tr>`).join("")}
          </tbody>
        </table>
        <p class="dim" style="font-size:12.5px;margin:8px 0 0">Для пикапа 3–5 и 5–7 лет считаются одинаково: пошлина та же, утильсбор как у машин старше 3 лет. Скачки — на границе «до 3 лет» (утильсбор) и после 7 лет (пошлина за см³). Цену машины поменяйте сами: б/у дешевле — меньше пошлина и НДС.</p>
      </details>`;

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
      ${ageTable}
      ${alerts.join("")}
      ${ownBlock(hp, total, fuelYear)}
      ${leadBlock()}
      <div class="alert info">
        <b>Как считаем</b>
        Ввоз физлицом как грузового автомобиля (код ТН ВЭД 8704). Таможенная стоимость = цена машины + доставка до границы. Ставки проверены ${esc(R.updated)}. ${esc(R.util.nextChange)}
        Это ориентир, а не оферта: перед покупкой сверьте расчёт с таможенным брокером или импортёром.
      </div>`;

    // Сохраняем выбор в адресе, чтобы расчётом можно было поделиться
    const params = new URLSearchParams({
      engine: el.preset.value, age: ageId, price: priceUsd, gvwr: gvwr, slots: slots
    });
    history.replaceState(null, "", "?" + params.toString());
  }

  // Начальные значения из адреса
  const qs = new URLSearchParams(location.search);
  const startEngine = qs.get("engine") && (window.findEngine(qs.get("engine")) || qs.get("engine") === "custom")
    ? qs.get("engine") : window.MODELS[0].engines[1].id;
  const startFound = window.findEngine(startEngine);
  el.model.value = startFound ? startFound.model.id : "custom";
  fillEngines(el.model.value);
  el.preset.value = startEngine;
  applyPreset(startEngine);
  if (qs.get("age") && form.querySelector(`input[name="age"][value="${CSS.escape(qs.get("age"))}"]`)) {
    form.querySelector(`input[name="age"][value="${CSS.escape(qs.get("age"))}"]`).checked = true;
  }
  if (qs.get("price") && +qs.get("price") > 0) {
    el.price.value = qs.get("price");
    const f = window.findEngine(startEngine);
    if (!f || +qs.get("price") !== f.model.msrpFrom) priceTouched = true;
  }
  if (qs.get("slots") && form.querySelector(`input[name="slots"][value="${CSS.escape(qs.get("slots"))}"]`)) {
    form.querySelector(`input[name="slots"][value="${CSS.escape(qs.get("slots"))}"]`).checked = true;
  }
  if (qs.get("gvwr") && +qs.get("gvwr") > 0) el.gvwr.value = qs.get("gvwr");

  // Цель для аналитики: человек сам что-то поменял в калькуляторе (один раз за визит)
  const track = () => { if (typeof window.trackGoal === "function") window.trackGoal("calc_used", true); };

  // Подставляем сегодняшний курс ЦБ, если человек ещё не менял курс вручную
  let ratesTouched = false;
  el.usdRate.addEventListener("input", () => { ratesTouched = true; });
  el.eurRate.addEventListener("input", () => { ratesTouched = true; });
  window.loadCbrRates().then((rates) => {
    const hint = document.getElementById("rate-hint");
    if (!rates) { if (hint) hint.textContent = "Курс ЦБ загрузить не удалось — поставьте сегодняшний вручную."; return; }
    if (ratesTouched) { if (hint) hint.textContent = `Курс ЦБ РФ на ${rates.date}: $ — ${rates.usd} ₽, € — ${rates.eur} ₽.`; return; }
    el.usdRate.value = rates.usd;
    el.eurRate.value = rates.eur;
    if (hint) hint.textContent = `Курс ЦБ РФ на ${rates.date} подставлен автоматически — можно поменять.`;
    compute();
  });

  el.fuelSel.addEventListener("input", () => { el.fuelPrice.value = R.fuel.prices[el.fuelSel.value] || el.fuelPrice.value; });
  el.model.addEventListener("change", () => {
    fillEngines(el.model.value);
    applyPreset(el.preset.value); // у новой модели — её первый мотор; для «Другой машины» поля открываются с текущими цифрами
    compute(); track();
  });
  el.preset.addEventListener("change", () => { applyPreset(el.preset.value); compute(); track(); });
  el.price.addEventListener("input", () => { priceTouched = true; });
  form.addEventListener("input", (e) => { if (e.target !== el.preset && e.target !== el.model) { compute(); track(); } });
  form.addEventListener("submit", (e) => e.preventDefault());
  compute();
})();
