/*
 * Правила растаможки пикапа (грузовой автомобиль, код ТН ВЭД 8704, категория N1/N2)
 * для физлица. ВСЕ ставки собраны в одном месте, чтобы их было легко обновлять.
 *
 * status:
 *   "ok"     — подтверждено первоисточником или несколькими независимыми источниками
 *   "check"  — источники расходятся или данных мало, нужна сверка с брокером
 *
 * Обновлено и перепроверено по первоисточникам: 22.11.2026
 */
// Год ставок. Коэффициенты утильсбора на 2027–2030 и ставки налога Москвы на 2027+ уже утверждены,
// поэтому 1 января сайт сам переключается на ставки нового года.
window.RATE_YEAR = Math.min(2030, Math.max(2026, new Date().getFullYear()));

window.RULES = {
  updated: "22.11.2026",

  // НДС на ввоз. База = таможенная стоимость + пошлина (+ акциз, но на грузовые 8704 его нет).
  vat: {
    rate: 0.22,
    status: "ok",
    note: "Основная ставка НДС — 22% с 1 января 2026 года (Федеральный закон от 28.11.2025 № 425-ФЗ). При ввозе считается от таможенной стоимости плюс пошлина.",
    sources: [
      { title: "ФНС: с 1 января 2026 года ставка НДС составляет 22%", url: "https://www.nalog.gov.ru/rn26/news/smi/16596761/" }
    ]
  },

  excise: {
    status: "ok",
    note: "Акциз не начисляется: по ст. 181 НК РФ подакцизны легковые автомобили и мотоциклы, а пикап, оформленный как грузовой (8704), к ним не относится. Если машину оформят как легковую (8703), появятся и акциз, и совсем другие ставки.",
    sources: [
      { title: "ФНС: плательщики акцизов и подакцизные товары", url: "https://www.nalog.gov.ru/rn03/taxation/taxes/akciz/" }
    ]
  },

  // Таможенный сбор за таможенные операции, с 01.01.2026 (ПП РФ № 1637 в ред. № 1638)
  customsFee: {
    status: "ok",
    // [верхняя граница таможенной стоимости, ₽ (включительно)], сбор, ₽
    scale: [
      [200000, 1231],
      [450000, 2462],
      [1200000, 4924],
      [2700000, 13541],
      [4200000, 18465],
      [5500000, 21344],
      [10000000, 49240],
      [Infinity, 73860]
    ],
    sources: [
      { title: "Alta.ru: ПП РФ № 1638 от 23.10.2025", url: "https://www.alta.ru/tamdoc/25ps1638/" },
      { title: "TKS.ru: индексация таможенных сборов с 2026", url: "https://www.tks.ru/news/nearby/2025/10/27/0001/pravitelstvo-utverdilo-indeksatsiyu-tamozhennyih-sborov-s-2026-goda/" }
    ]
  },

  // Ввозная пошлина для 8704 до 5 т — по Единому таможенному тарифу ЕАЭС
  duty: {
    status: "ok",
    note: "По Единому таможенному тарифу ЕАЭС (позиции 8704 21, 8704 31, 8704 51). Важно: льготные 12,5% — только для НОВЫХ бензиновых машин с мотором больше 2 800 см³. Б/у машина, даже годовалая, платит 15%. Дизель — 10%. Старше 7 лет — 1 € за см³. Гибриды, где ДВС мощнее электромотора (F-150 PowerBoost, eTorque), считаются по тем же ставкам.",
    sources: [
      { title: "Alta.ru: Единый таможенный тариф ЕАЭС, группа 87", url: "https://www.alta.ru/ett/gruppa87.html" },
      { title: "Контур.Норматив: ЕТТ ЕАЭС, редакция от 11.08.2026", url: "https://normativ.kontur.ru/document?moduleId=1&documentId=404742" }
    ]
  },

  // Утилизационный сбор для грузовых (N1/N2): 150 000 ₽ × коэффициент на год (постановление №1291, раздел II).
  // new/old/note заполняются ниже под window.RATE_YEAR.
  util: {
    base: 150000,
    rows: [
      { id: "le2500", label: "полная масса до 2,5 т", maxKg: 2500, status: "ok",
        coefs: { 2026: [6.13, 8.91], 2027: [6.74, 9.8], 2028: [7.42, 10.78], 2029: [8.16, 11.85], 2030: [8.97, 13.04] } },
      { id: "le3500", label: "полная масса 2,5–3,5 т", maxKg: 3500, status: "ok",
        coefs: { 2026: [6.6, 9.61], 2027: [7.26, 10.57], 2028: [7.99, 11.62], 2029: [8.79, 12.79], 2030: [9.67, 14.06] } },
      { id: "le5000", label: "полная масса 3,5–5 т", maxKg: 5000, status: "ok",
        coefs: { 2026: [6.91, 10.29], 2027: [7.6, 11.31], 2028: [8.36, 12.44], 2029: [9.2, 13.69], 2030: [10.12, 15.06] } }
    ],
    sources: [
      { title: "Постановление Правительства №1291, перечень, раздел II (N1, коэффициенты по годам)", url: "https://law.tks.ru/document/830618" },
      { title: "Drom: невысокий утильсбор на пикапы", url: "https://www.drom.ru/info/misc/103545.html" }
    ],
    nextChange: "Коэффициенты утильсбора на 2027–2030 годы уже утверждены в постановлении №1291 — 1 января калькулятор сам переходит на ставки нового года."
  },

  // Транспортный налог Москвы, руб. за 1 л.с. в год, по годам (закон г. Москвы № 33 в ред. закона № 21 от 13.11.2024).
  // [верхняя граница мощности (л.с., включительно), {год: ставка}] — последний известный год действует и дальше.
  // truck/car (на текущий год) и note заполняются ниже.
  transportTax: {
    region: "Москва",
    status: "ok",
    truckByYear: [[100, { 2025: 17, 2026: 19, 2027: 21, 2028: 23, 2029: 25 }], [150, { 2025: 29, 2026: 32, 2027: 35, 2028: 39, 2029: 40 }], [200, { 2025: 42, 2026: 46, 2027: 50 }], [250, { 2025: 61, 2026: 65 }], [Infinity, { 2025: 77, 2026: 85 }]],
    carByYear: [[100, { 2025: 13, 2026: 14, 2027: 15, 2028: 17, 2029: 19, 2030: 21, 2031: 23, 2032: 25 }], [125, { 2025: 28, 2026: 31, 2027: 34, 2028: 35 }], [150, { 2025: 35 }], [200, { 2025: 50 }], [225, { 2025: 72, 2026: 75 }], [250, { 2025: 75 }], [Infinity, { 2025: 150 }]],
    luxuryCoef: 3,
    luxuryFromRub: 10000000,
    sources: [
      { title: "Закон г. Москвы № 33 «О транспортном налоге», ставки по годам (Контур.Норматив)", url: "https://www.kontur-extern.ru/info/normativ/document/3/103397-zakon-g-moskvy-ot-09-07-2008-n-33" },
      { title: "Закон г. Москвы № 33 в ред. от 01.11.2025 (PDF на mos.ru)", url: "https://www.mos.ru/upload/documents/files/6513/ZakongMoskviot09072008N33%28redot01112025%29.pdf" },
      { title: "Налог на роскошь: коэффициент 3 и перечень Минпромторга", url: "https://nalog-nalog.ru/transportnyj_nalog/raschet_transportnogo_naloga/povyshayuwij_koefficient_dlya_transportnogo_naloga/" }
    ]
  },

  // Топливо: средние цены по России (Росстат) и средний пробег
  fuel: {
    date: "16.11.2026",
    prices: { ai92: 70.04, ai95: 76.33, ai98: 104.15, dt: 87.09 },
    labels: { ai92: "АИ-92", ai95: "АИ-95", ai98: "АИ-98", dt: "Дизель" },
    // EPA-класс топлива → российская марка (американская шкала AKI ниже нашей RON примерно на 4–5 единиц)
    gradeToFuel: { regular: "ai92", midgrade: "ai95", premium: "ai98", diesel: "dt" },
    gradeNote: {
      regular: "Производитель: regular (87 по американской шкале) — это примерно наш АИ-92.",
      midgrade: "Производитель: midgrade (89 по американской шкале) — это примерно АИ-93–94, у нас — АИ-95.",
      premium: "Производитель: premium (91+ по американской шкале) — это примерно АИ-95–98. АИ-95 — минимум, АИ-98 — с запасом.",
      diesel: "Дизельное топливо."
    },
    mileageKm: 18500,
    status: "ok",
    note: "Расход — официальные данные EPA (США) в смешанном цикле. Зимой, в пробках и с прицепом реальный расход обычно выше на 10–20%. Цены — средние по России по данным Росстата; в вашем регионе и на вашей АЗС они могут отличаться. Средний пробег — оценка «Автостата» для машин 3–5 лет (у пикапов, по данным Auto.ru, — около 19,5 тыс. км).",
    sources: [
      { title: "Росстат: потребительские цены на бензин, 18.11.2026", url: "https://rosstat.gov.ru/storage/mediabank/175_18-11-2026.pdf" },
      { title: "Calcus: цены на бензин и дизель (по данным Росстата)", url: "https://calcus.ru/fuel-prices" },
      { title: "fueleconomy.gov (EPA): расход и тип топлива", url: "https://www.fueleconomy.gov/" },
      { title: "ДП: средний годовой пробег по данным «Автостата»", url: "https://www.dp.ru/a/2025/05/29/edem-dalshe-v-peterburge" },
      { title: "Auto.ru: годовой пробег пикапов и седанов", url: "https://auto.ru/mag/article/godovoy-probeg-sedanov-i-pikapov-v-rossii-okazalsya-bolshe-chem-hetchbekov-i-krossoverov/" }
    ]
  },

  // Морская доставка в контейнере: цена = ставка за одно «легковое» место × сколько мест занимает машина.
  shipping: {
    status: "check",
    slotRateUsd: 2800,      // оценка за одно место; реальные ставки — только у импортёра
    pickupSlots: 2,         // полноразмерный пикап длиной ~5,9 м
    containerSlots: 4,      // столько легковых входит в 40-футовый контейнер
    note: "В 40-футовый контейнер входит до 4 легковых машин среднего класса. Полноразмерный пикап длиной около 5,9 м занимает место двух: в контейнер их встаёт два, один за другим. Поэтому платить приходится за два места. Ставку за место — около $2 800, это нижняя граница цены доставки легковой из США — мы взяли как ориентир: маршруты в Россию идут через третьи страны, ставки меняются почти каждую неделю. Ro-Ro (своим ходом на судне) считается по объёму, и пикап там тоже дороже седана.",
    sources: [
      { title: "SeaRates: сколько автомобилей помещается в контейнер", url: "https://www.searates.com/ru/blog/post/skolko-mashin-pomeshchaetsya-v-konteinere" },
      { title: "DHL: размеры морских контейнеров", url: "https://www.dhl.com/us-en/home/global-forwarding/freight-forwarding-education-center/cargo-container-sizes-and-types.html" },
      { title: "Ford: длина F-150 SuperCrew — 232 дюйма ≈ 5,9 м (PDF)", url: "https://www.fromtheroad.ford.com/content/dam/fordmediasite/us/en/library/2026/specs/2026_Ford_F150_Specs.pdf" }
    ]
  },

  // «Если бы это был легковой»: ввоз физлицом для себя (код 8703). Нужен только для сравнения на главной.
  passenger: {
    status: "ok",
    // ЕТС для легковых не старше 3 лет: [стоимость до, €; ставка; но не менее, € за см³]
    ets: [[8500, 0.54, 2.5], [16700, 0.48, 3.5], [42300, 0.48, 5.5], [84500, 0.48, 7.5], [169000, 0.48, 15], [Infinity, 0.48, 20]],
    feeRub: 500,     // сбор за таможенные операции для физлица при уплате по ЕТС
    utilBase: 20000, // базовая ставка утильсбора для легковых (сноска 5 к перечню)
    note: "Легковой автомобиль, ввезённый физлицом для себя, платит единую ставку (ЕТС): для машин не старше 3 лет — 48% от стоимости, но не меньше фиксированной суммы в евро за каждый см³ объёма. НДС и акциз отдельно не начисляются — они внутри единой ставки. Утильсбор: льготная ставка для физлиц действует только до 160 л.с.; мощнее — по общим коэффициентам постановления №1291 (базовая ставка 20 000 ₽ × коэффициент по объёму и мощности). Для пикапа (грузовой N1) единой ставки нет: пошлина, НДС и утильсбор по грузовой строке.",
    sources: [
      { title: "Решение Совета ЕЭК №107, приложение 2 (ЕТС для легковых), редакция с 18.04.2026", url: "https://law.tks.ru/document/833411" },
      { title: "Постановление Правительства №1291 (утильсбор), редакция с 12.02.2026", url: "https://law.tks.ru/document/830618" },
      { title: "TKS: для физлиц пошлина, НДС и акциз — одной единой ставкой", url: "https://www.tks.ru/auto/calc/main/" },
      { title: "E1: утильсбор при частном ввозе машин мощнее 160 л.с. — по коммерческим ставкам", url: "https://www.e1.ru/text/auto/2026/02/25/76280026/" }
    ],
    // Пример для главной: новый RAM 1500 5.7 V8, 395 л.с. ≈ 290,5 кВт →
    // строка «свыше 3 500 см³, свыше 272,14 до 294,20 кВт», коэффициенты для новых по годам (постановление №1291, раздел I)
    example: { engineId: "ram-1500-57", utilCoefNewByYear: { 2026: 199.68, 2027: 219.65, 2028: 241.61, 2029: 265.77, 2030: 292.35 } }
  },

  // Порог 3,5 т: права, знак 3.4, пропуска
  massLimitKg: 3500
};

/* Ставки на текущий год (window.RATE_YEAR): утильсбор, налог, коэффициент легкового для главной */
(function () {
  const Y = window.RATE_YEAR, R = window.RULES;
  const pick = (byYear) => { const ys = Object.keys(byYear).map(Number).filter((y) => y <= Y); return byYear[Math.max(...ys)]; };
  const num = (n) => String(n).replace(".", ",");
  R.util.year = Y;
  R.util.rows.forEach((r) => {
    const [cn, co] = r.coefs[Y];
    r.new = Math.round(R.util.base * cn);
    r.old = Math.round(R.util.base * co);
    r.note = `150 000 ₽ × ${num(cn)} (до 3 лет) и × ${num(co)} (старше 3 лет) — ставки ${Y} года по постановлению №1291.`;
  });
  const T = R.transportTax;
  T.year = Y;
  T.truck = T.truckByYear.map(([lim, by]) => [lim, pick(by)]);
  T.car = T.carByYear.map(([lim, by]) => [lim, pick(by)]);
  T.note = `Ставки Москвы на ${Y} год (закон г. Москвы № 33 в ред. закона № 21 от 13.11.2024). Повышающий коэффициент ×3 по ст. 362 НК РФ применяется к легковым автомобилям из перечня Минпромторга (средняя стоимость от 10 млн ₽) — пикап, оформленный как грузовой, под него не попадает. В других регионах ставки свои.`;
  R.passenger.example.utilCoefNew = R.passenger.example.utilCoefNewByYear[Y];
})();

/** Расход л/100 км из миль на галлон (США) */
window.mpgToL100 = (mpg) => (mpg ? Math.round((235.215 / mpg) * 10) / 10 : 0);

/** Транспортный налог в год. kind: "truck" | "car" */
window.calcTransportTax = function (hp, kind) {
  const scale = window.RULES.transportTax[kind];
  for (const [limit, rate] of scale) {
    if (hp <= limit) return { rub: hp * rate, rate };
  }
  return { rub: 0, rate: 0 };
};

/**
 * Возрастные группы.
 * Пошлина различает «новые» и «бывшие в эксплуатации» (а у б/у — 5–7 и 7+ лет).
 * Утильсбор различает «до 3 лет» и «старше 3 лет».
 */
window.AGE_GROUPS = [
  { id: "new", label: "Новая", utilNew: true, used: false },
  { id: "lt3", label: "Б/у до 3 лет", utilNew: true, used: true },
  { id: "3to5", label: "3–5 лет", utilNew: false, used: true },
  { id: "5to7", label: "5–7 лет", utilNew: false, used: true },
  { id: "gt7", label: "7+ лет", utilNew: false, used: true }
];
window.findAge = (id) => window.AGE_GROUPS.find((a) => a.id === id) || window.AGE_GROUPS[0];

/**
 * Пошлина для 8704 до 5 т по ЕТТ ЕАЭС.
 * Возвращает { rub, label }.
 */
window.calcDuty = function (fuel, cc, ageId, valueRub, eurRate) {
  const pct = (p) => ({ rub: valueRub * p, label: (p * 100).toString().replace(".", ",") + "%" });
  const perCc = (eur) => ({ rub: cc * eur * eurRate, label: eur.toString().replace(".", ",") + " € за см³" });

  if (ageId === "gt7") return perCc(1);

  if (fuel === "diesel") {
    if (cc <= 2500 && ageId === "5to7") {
      const a = pct(0.10), b = perCc(0.13);
      return a.rub >= b.rub ? a : { rub: b.rub, label: "0,13 € за см³ (больше, чем 10%)" };
    }
    return pct(0.10);
  }

  // бензин и гибриды, где ДВС мощнее электромотора
  if (ageId === "new" && cc > 2800) return pct(0.125);
  return pct(0.15);
};

/** ЕТС для легкового не старше 3 лет, ввезённого физлицом для себя. Возвращает { rub, pct, minEurCc, byMin } */
window.calcPassengerETS = function (valueRub, eurRate, cc) {
  const valueEur = valueRub / eurRate;
  const [, pct, minEurCc] = window.RULES.passenger.ets.find(([lim]) => valueEur <= lim);
  const byPct = valueEur * pct, byMin = minEurCc * cc;
  return { rub: Math.max(byPct, byMin) * eurRate, pct, minEurCc, byMin: byMin > byPct };
};

window.calcCustomsFee = function (valueRub) {
  for (const [limit, fee] of window.RULES.customsFee.scale) {
    if (valueRub <= limit) return fee;
  }
  return 0;
};

window.utilRow = function (gvwrKg) {
  const rows = window.RULES.util.rows;
  return rows.find((r) => gvwrKg <= r.maxKg) || rows[rows.length - 1];
};
