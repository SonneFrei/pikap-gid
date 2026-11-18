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

  el.preset.addEventListener("change", () => { applyPreset(el.preset.value); compute(); });
  form.addEventListener("input", (e) => { if (e.target !== el.preset) compute(); });
  form.addEventListener("submit", (e) => e.preventDefault());
  compute();
})();
