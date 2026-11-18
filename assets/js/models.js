/*
 * Модельный ряд MVP. Всё, что помечено check: true, нужно сверить
 * (по ПТС реальных машин, у импортёров или в официальных спецификациях).
 *
 * gvwrKg — разрешённая максимальная масса (полная масса, РММ / GVWR), кг.
 *   От неё зависят: строка утильсбора, категория прав (B / C), знак 3.4, пропуска.
 * msrpFrom — стартовая цена в США, $, без доставки по США (destination).
 * Обновлено: 19.11.2026
 */
window.MODELS = [
  {
    id: "ram-1500",
    brand: "RAM",
    name: "1500",
    tagline: "Самый популярный американец в России: в феврале 2026 — №1 среди всех новых пикапов по продажам за месяц.",
    generation: "DT, рестайлинг 2025–2026",
    msrpFrom: 40275,
    msrpNote: "Tradesman. Источники расходятся: $40 275–42 025.",
    msrpCheck: true,
    gvwrKg: [2950, 3400],
    gvwrDefault: 3130,
    gvwrNote: "Tradesman Crew Cab — 6 900 lb ≈ 3 130 кг.",
    gvwrCheck: true,
    engines: [
      { id: "ram-1500-36", name: "3.6 V6 Pentastar eTorque", fuel: "petrol", cc: 3604, hp: 305, note: "мягкий гибрид" },
      { id: "ram-1500-57", name: "5.7 V8 HEMI", fuel: "petrol", cc: 5654, hp: 395, note: "вернулся в 2026 году" },
      { id: "ram-1500-so", name: "3.0 I6 Hurricane SO", fuel: "petrol", cc: 2998, hp: 420, note: "twin-turbo" },
      { id: "ram-1500-ho", name: "3.0 I6 Hurricane HO", fuel: "petrol", cc: 2998, hp: 540, note: "RHO, Tungsten" }
    ],
    rivals: ["ford-f150", "chevy-silverado", "gmc-sierra"],
    sources: [
      { title: "Autotrader: HEMI V8 возвращается в RAM 1500", url: "https://www.autotrader.ca/editorial/20260107/the-hemi-v8-is-back-under-the-ram-1500-s-hood-but-there-s-a-price-to-pay" },
      { title: "Cars.com: RAM 1500 Tradesman 2026", url: "https://www.cars.com/research/ram-1500-2026/specs/473196" }
    ]
  },
  {
    id: "ram-trx",
    brand: "RAM",
    name: "1500 TRX (2021–2024)",
    tagline: "702 л.с. и подвеска для пустыни. Главный герой «границы 3,5 т»: в одних ПТС 3 300 кг, в других — 3 538.",
    generation: "2021–2024, на вторичном рынке",
    msrpFrom: null,
    msrpNote: "Снят с производства в 2024 — цену смотрим по рынку б/у.",
    msrpCheck: true,
    gvwrKg: [3175, 3538],
    gvwrDefault: 3538,
    gvwrNote: "Встречается 3 175–3 300 кг и 3 538 кг — решает запись в конкретном ПТС.",
    gvwrCheck: true,
    engines: [
      { id: "ram-trx-62", name: "6.2 V8 Supercharged HEMI", fuel: "petrol", cc: 6166, hp: 702, note: "компрессор" }
    ],
    rivals: ["ford-raptor-r"],
    sources: [
      { title: "Категория прав RAM 1500 / TRX", url: "https://xn----7sbbiclwan7boiet.xn--p1ai/kategoriya-prav-dodge-ram-ram-trx-ram-1500-rho-v-2025-2026-godu/" },
      { title: "Форум: ПТС TRX с массой 3 538 кг", url: "https://forum.motolodka.ru/read.php?f=2&i=1678767&t=1678767" }
    ]
  },
  {
    id: "ram-srt-trx",
    brand: "RAM",
    name: "1500 SRT TRX (2027)",
    tagline: "TRX вернулся: 777 л.с., 0–100 примерно за 3,5 с. Самый мощный серийный бензиновый полутонный пикап — по словам Ram.",
    generation: "2027 модельный год, продажи со второй половины 2026",
    msrpFrom: 99995,
    msrpNote: "Без доставки по США ($2 595) — по пресс-релизу Ram.",
    msrpCheck: false,
    gvwrKg: [3450, 3700],
    gvwrDefault: 3600,
    gvwrNote: "Официальной полной массы пока нет. Снаряжённая — около 3 175 кг (оценка), поэтому РММ, скорее всего, выше 3,5 т. Ждём реальных ПТС.",
    gvwrCheck: true,
    engines: [
      { id: "srt-trx-62", name: "6.2 V8 Supercharged HEMI", fuel: "petrol", cc: 6166, hp: 777, note: "компрессор, только полный привод" }
    ],
    rivals: ["ford-raptor-r"],
    sources: [
      { title: "Ram (пресс-релиз): TRX возвращается", url: "https://www.nasdaq.com/press-release/apex-pickup-returns-rams-trx-back-fastest-and-most-powerful-production-gas-pickup" },
      { title: "Carscoops: Ram 1500 SRT TRX — 777 л.с.", url: "https://www.carscoops.com/2026/01/ram-1500-srt-trx-2027-777hp-price-performance/" }
    ]
  },
  {
    id: "ford-f150",
    brand: "Ford",
    name: "F-150",
    tagline: "Самый продаваемый пикап Америки. Выбор моторов от 2.7 до гибрида — и у маленького мотора пошлина выше.",
    generation: "14-е поколение",
    msrpFrom: 37290,
    msrpNote: "XL, по данным дилера Ford. XLT — от $45 695, Lariat — от $59 560, Platinum — от $68 800.",
    msrpCheck: true,
    gvwrKg: [2821, 3334],
    gvwrDefault: 3150,
    gvwrNote: "6 220–7 350 lb — все версии в пределах 3,5 т.",
    gvwrCheck: false,
    engines: [
      { id: "f150-27", name: "2.7 V6 EcoBoost", fuel: "petrol", cc: 2694, hp: 325, note: "до 2 800 см³ → пошлина 15%" },
      { id: "f150-35", name: "3.5 V6 EcoBoost", fuel: "petrol", cc: 3496, hp: 400, note: "" },
      { id: "f150-50", name: "5.0 V8 Coyote", fuel: "petrol", cc: 4951, hp: 400, note: "" },
      { id: "f150-pb", name: "3.5 V6 PowerBoost", fuel: "petrol", cc: 3496, hp: 430, note: "полный гибрид; считаем как бензин — проверить" }
    ],
    rivals: ["ram-1500", "chevy-silverado", "gmc-sierra"],
    sources: [
      { title: "Astro Ford: цены F-150 2026", url: "https://www.astroford.com/ford-models/2026-ford-f-150-xl.htm" },
      { title: "Sneed Ford: масса и GVWR F-150", url: "https://www.sneedford.com/ford-f-150-weight.html" }
    ]
  },
  {
    id: "ford-raptor",
    brand: "Ford",
    name: "F-150 Raptor",
    tagline: "Внедорожный F-150 с длинноходной подвеской. Прямой соперник RAM 1500 RHO.",
    generation: "2026",
    msrpFrom: 79005,
    msrpNote: "Без доставки по США (по конфигуратору Ford).",
    msrpCheck: false,
    gvwrKg: [3334, 3334],
    gvwrDefault: 3334,
    gvwrNote: "7 350 lb (SuperCrew 4x4) — в пределах 3,5 т, но запас всего 166 кг.",
    gvwrCheck: false,
    engines: [
      { id: "raptor-35", name: "3.5 V6 EcoBoost High Output", fuel: "petrol", cc: 3496, hp: 450, note: "" }
    ],
    rivals: ["ram-1500"],
    sources: [
      { title: "Ford: F-150 Raptor 2026", url: "https://www.ford.com/trucks/f150raptor" },
      { title: "CarWhere: Ford F-150 Raptor", url: "https://www.carwhere.com/ford/raptor" }
    ]
  },
  {
    id: "ford-raptor-r",
    brand: "Ford",
    name: "F-150 Raptor R",
    tagline: "720 л.с. из компрессорного V8. Пакет поверх Raptor — и прямой ответ TRX.",
    generation: "2026",
    msrpFrom: 110930,
    msrpNote: "Raptor $79 005 + пакет R $31 925, без доставки.",
    msrpCheck: false,
    gvwrKg: [3300, 3400],
    gvwrDefault: 3334,
    gvwrNote: "Официальной цифры не нашли; база та же, что у Raptor (7 350 lb), машина тяжелее на ~65–140 кг — сверить по ПТС.",
    gvwrCheck: true,
    engines: [
      { id: "raptor-r-52", name: "5.2 V8 Supercharged", fuel: "petrol", cc: 5163, hp: 720, note: "компрессор" }
    ],
    rivals: ["ram-trx"],
    sources: [
      { title: "CarWhere: Ford F-150 Raptor R", url: "https://www.carwhere.com/ford/raptor-r" }
    ]
  },
  {
    id: "chevy-silverado",
    brand: "Chevrolet",
    name: "Silverado 1500",
    tagline: "Классика GM. Близнец GMC Sierra — те же моторы, другой характер и цена.",
    generation: "2026 (в 2027 — новое поколение)",
    msrpFrom: 39695,
    msrpNote: "Regular Cab. Источники расходятся ($39 695–44 295).",
    msrpCheck: true,
    gvwrKg: [2900, 3220],
    gvwrDefault: 3220,
    gvwrNote: "Crew Cab 4WD — 7 000–7 100 lb (3 175–3 220 кг) по данным дилеров. Нижняя граница — оценка для Regular Cab.",
    gvwrCheck: true,
    engines: [
      { id: "silv-27", name: "2.7 I4 TurboMax", fuel: "petrol", cc: 2727, hp: 310, note: "до 2 800 см³ → пошлина 15%" },
      { id: "silv-53", name: "5.3 V8", fuel: "petrol", cc: 5328, hp: 355, note: "" },
      { id: "silv-62", name: "6.2 V8", fuel: "petrol", cc: 6162, hp: 420, note: "" },
      { id: "silv-30d", name: "3.0 I6 Duramax", fuel: "diesel", cc: 2993, hp: 305, note: "дизель → пошлина 10%" }
    ],
    rivals: ["gmc-sierra", "ram-1500", "ford-f150"],
    sources: [
      { title: "KBB: Silverado 1500 2026", url: "https://www.kbb.com/chevrolet/silverado-1500/2026/" }
    ]
  },
  {
    id: "gmc-sierra",
    brand: "GMC",
    name: "Sierra 1500",
    tagline: "Тот же Silverado, только «премиальнее». Денали, AT4X — и вечный вопрос, за что переплата.",
    generation: "2026 (в 2027 — новое поколение)",
    msrpFrom: 38300,
    msrpNote: "Pro, без доставки. Диапазон по версиям: $38 300–84 200.",
    msrpCheck: false,
    gvwrKg: [2900, 3220],
    gvwrDefault: 3220,
    gvwrNote: "Платформа та же, что у Silverado: Crew Cab 4WD — около 7 100 lb (3 220 кг). Нижняя граница — оценка.",
    gvwrCheck: true,
    engines: [
      { id: "sierra-27", name: "2.7 I4 TurboMax", fuel: "petrol", cc: 2727, hp: 310, note: "до 2 800 см³ → пошлина 15%" },
      { id: "sierra-53", name: "5.3 V8", fuel: "petrol", cc: 5328, hp: 355, note: "" },
      { id: "sierra-62", name: "6.2 V8", fuel: "petrol", cc: 6162, hp: 420, note: "" },
      { id: "sierra-30d", name: "3.0 I6 Duramax", fuel: "diesel", cc: 2993, hp: 305, note: "дизель → пошлина 10%" }
    ],
    rivals: ["chevy-silverado", "ram-1500", "ford-f150"],
    sources: [
      { title: "Equipment World: GMC Sierra 1500 2026", url: "https://www.equipmentworld.com/trucks/pickups/article/15755341/2026-gmc-sierra-1500-revealed-8-trims-4-engines" }
    ]
  }
];

window.findModel = (id) => window.MODELS.find((m) => m.id === id);
window.findEngine = (engineId) => {
  for (const m of window.MODELS) {
    const e = m.engines.find((x) => x.id === engineId);
    if (e) return { model: m, engine: e };
  }
  return null;
};
