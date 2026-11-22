/*
 * Модельный ряд MVP. Всё, что помечено check: true, нужно сверить
 * (по ПТС реальных машин, у импортёров или в официальных спецификациях).
 *
 * gvwrKg — разрешённая максимальная масса (полная масса, РММ / GVWR), кг.
 *   От неё зависят: строка утильсбора, категория прав (B / C), знак 3.4, пропуска.
 * msrpFrom — стартовая цена в США, $, без доставки по США (destination).
 * mpg — расход EPA в смешанном цикле (миль на галлон), grade — тип топлива по EPA
 *   (regular / midgrade / premium / diesel). Источник: fueleconomy.gov, 2026 модельный год
 *   (TRX 2021–2024 — 2024 год; Hurricane HO — данные EPA за 2025 год; Sierra 3.0 дизель — как у Silverado).
 *   5.7 HEMI 2027: в таблице EPA две пары строк — 19/18 (как eTorque 2026) и 17/17 (2WD/4WD); вторую
 *   считаем версией без eTorque (без гибрида расход хуже примерно на 2 mpg). Пометки eTorque в таблице EPA нет.
 * wide / widthNote — широкий кузов: в 40-футовом контейнере (внутри ~2,35 м) места по бокам почти нет.
 * Обновлено: 21.11.2026
 */
window.MODELS = [
  {
    id: "ram-1500",
    brand: "RAM",
    name: "1500",
    tagline: "Самый популярный американец в России: в феврале 2026 — №1 среди всех новых пикапов по продажам за месяц.",
    generation: "DT, рестайлинг 2025–2026",
    msrpFrom: 42575,
    msrpNote: "Tradesman 2027 модельного года, без доставки до дилера ($2 795) — по сайту Ram.",
    msrpCheck: false,
    gvwrKg: [2950, 3400],
    gvwrDefault: 3130,
    gvwrNote: "Tradesman Crew Cab — 6 900 lb ≈ 3 130 кг. У тяжёлых версий (полный привод, длинная база, Hurricane HO) — до ≈ 3 400 кг; источники по версиям расходятся, точная цифра — в ПТС.",
    gvwrCheck: true,
    engines: [
      { id: "ram-1500-36", name: "3.6 V6 Pentastar eTorque", fuel: "petrol", cc: 3604, hp: 305, note: "мягкий гибрид", mpg: 21, grade: "regular" },
      { id: "ram-1500-57", name: "5.7 V8 HEMI eTorque", fuel: "petrol", cc: 5654, hp: 395, note: "мягкий гибрид, 2026 и начало 2027 модельного года", mpg: 18, grade: "midgrade" },
      { id: "ram-1500-57n", name: "5.7 V8 HEMI без eTorque", fuel: "petrol", cc: 5654, hp: 395, note: "с 2027 модельного года: без гибрида и стоп-старта", mpg: 17, grade: "midgrade" },
      { id: "ram-1500-so", name: "3.0 I6 Hurricane SO", fuel: "petrol", cc: 2998, hp: 420, note: "twin-turbo", mpg: 20, grade: "regular" },
      { id: "ram-1500-ho", name: "3.0 I6 Hurricane HO", fuel: "petrol", cc: 2998, hp: 540, note: "RHO, Tungsten", mpg: 17, grade: "premium" }
    ],
    rivals: ["ford-f150", "chevy-silverado", "gmc-sierra"],
    sources: [
      { title: "Ram: RAM 1500 2027 — цены версий (MSRP)", url: "https://www.ramtrucks.com/2027/ram-1500.html" },
      { title: "Autotrader: HEMI V8 возвращается в RAM 1500", url: "https://www.autotrader.ca/editorial/20260107/the-hemi-v8-is-back-under-the-ram-1500-s-hood-but-there-s-a-price-to-pay" },
      { title: "Cars.com: RAM 1500 Tradesman 2026", url: "https://www.cars.com/research/ram-1500-2026/specs/473196" },
      { title: "Carscoops: Ram убирает eTorque с HEMI в 2027 модельном году", url: "https://www.carscoops.com/2026/08/ram-hemi-etorque-discontinued/" },
      { title: "fueleconomy.gov: расход RAM 1500 2027", url: "https://www.fueleconomy.gov/feg/PowerSearch.do?action=noform&path=1&year1=2027&year2=2027&make=Ram&baseModel=1500&srchtyp=ymm&pageno=1&rowLimit=50" }
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
    wide: true,
    widthNote: "Ширина без зеркал — 88 дюймов ≈ 2 235 мм (Edmunds).",
    engines: [
      { id: "ram-trx-62", name: "6.2 V8 Supercharged HEMI", fuel: "petrol", cc: 6166, hp: 702, note: "компрессор", mpg: 12, grade: "premium" }
    ],
    rivals: ["ford-raptor-r"],
    sources: [
      { title: "Категория прав RAM 1500 / TRX", url: "https://xn----7sbbiclwan7boiet.xn--p1ai/kategoriya-prav-dodge-ram-ram-trx-ram-1500-rho-v-2025-2026-godu/" },
      { title: "Форум: ПТС TRX с массой 3 538 кг", url: "https://forum.motolodka.ru/read.php?f=2&i=1678767&t=1678767" },
      { title: "Edmunds: размеры Ram 1500 TRX 2024", url: "https://www.edmunds.com/ram/1500/2024/trx/features-specs" }
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
    gvwrKg: [3538, 3561],
    gvwrDefault: 3538,
    gvwrNote: "Ram указывает 7 800 lb ≈ 3 538 кг, KBB — 7 850 lb ≈ 3 561 кг. В обоих случаях больше 3,5 т: нужны права C1, под знак 3.4 нельзя.",
    gvwrCheck: false,
    wide: true,
    widthNote: "Ширина официально не опубликована. Кузов с расширенными арками, как у TRX 2021–2024 (около 2,24 м).",
    engines: [
      { id: "srt-trx-62", name: "6.2 V8 Supercharged HEMI", fuel: "petrol", cc: 6166, hp: 777, note: "компрессор, только полный привод", mpg: 12, grade: "premium" }
    ],
    rivals: ["ford-raptor-r"],
    sources: [
      { title: "Ram (пресс-релиз): TRX возвращается", url: "https://www.nasdaq.com/press-release/apex-pickup-returns-rams-trx-back-fastest-and-most-powerful-production-gas-pickup" },
      { title: "Carscoops: Ram 1500 SRT TRX — 777 л.с.", url: "https://www.carscoops.com/2026/01/ram-1500-srt-trx-2027-777hp-price-performance/" },
      { title: "Ram: FAQ по TRX SRT (полная масса 7 800 lb)", url: "https://www.ramtrucks.com/ram-1500/trx/faq.html" },
      { title: "KBB: Ram 1500 TRX SRT 2027", url: "https://www.kbb.com/ram/1500-crew-cab/2027/trx-srt/" }
    ]
  },
  {
    id: "ford-f150",
    brand: "Ford",
    name: "F-150",
    tagline: "Самый продаваемый пикап Америки. С 2027 модельного года база — V6 3.0 вместо 2.7, а V8 5.0 есть в любой версии.",
    generation: "14-е поколение, обновление 2027",
    msrpFrom: 40155,
    msrpNote: "XL 2027 модельного года, без доставки до дилера — по сайту Ford. STX — от $42 675, XLT — от $46 525, Lariat — от $57 730, Platinum — от $69 130.",
    msrpCheck: false,
    gvwrKg: [2821, 3334],
    gvwrDefault: 3150,
    gvwrNote: "6 220–7 350 lb — все версии в пределах 3,5 т.",
    gvwrCheck: false,
    engines: [
      { id: "f150-30", name: "3.0 V6 EcoBoost", fuel: "petrol", cc: 2999, hp: 325, note: "базовый с 2027 модельного года; ≈3 000 см³ (у Ford — «3,0 л», точная цифра — в ПТС), больше 2 800 → пошлина 12,5%; расход EPA ещё не опубликован — считаем как у 2.7", mpg: 20, grade: "regular" },
      { id: "f150-27", name: "2.7 V6 EcoBoost", fuel: "petrol", cc: 2694, hp: 325, note: "до 2026 модельного года; до 2 800 см³ → пошлина 15%", mpg: 20, grade: "regular" },
      { id: "f150-35", name: "3.5 V6 EcoBoost", fuel: "petrol", cc: 3496, hp: 400, note: "", mpg: 19, grade: "regular" },
      { id: "f150-50", name: "5.0 V8 Coyote", fuel: "petrol", cc: 4951, hp: 400, note: "", mpg: 19, grade: "regular" },
      { id: "f150-pb", name: "3.5 V6 PowerBoost", fuel: "petrol", cc: 3496, hp: 430, note: "полный гибрид; считаем как бензин — проверить", mpg: 23, grade: "regular" }
    ],
    rivals: ["ram-1500", "chevy-silverado", "gmc-sierra"],
    sources: [
      { title: "Ford: F-150 2027 — цены версий и моторы", url: "https://www.ford.com/trucks/f150/" },
      { title: "Ford: всё о F-150 2027 (новый базовый V6 3.0 вместо 2.7)", url: "https://www.fromtheroad.ford.com/us/en/articles/2026/2027-ford-f-150-specs-features" },
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
    wide: true,
    widthNote: "Ширина без зеркал — 79,8–86,6 дюйма (до 2 200 мм на 37-дюймовых шинах), по спецификации Ford.",
    engines: [
      { id: "raptor-35", name: "3.5 V6 EcoBoost High Output", fuel: "petrol", cc: 3496, hp: 450, note: "", mpg: 16, grade: "regular" }
    ],
    rivals: ["ram-1500"],
    sources: [
      { title: "Ford: F-150 Raptor 2026", url: "https://www.ford.com/trucks/f150raptor" },
      { title: "CarWhere: Ford F-150 Raptor", url: "https://www.carwhere.com/ford/raptor" },
      { title: "Ford: спецификации F-150 2026 (PDF)", url: "https://www.fromtheroad.ford.com/content/dam/fordmediasite/us/en/library/2026/specs/2026_Ford_F150_Specs.pdf" }
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
    gvwrKg: [3334, 3402],
    gvwrDefault: 3402,
    gvwrNote: "В карточках дилеров Ford указано 7 500 lb ≈ 3 402 кг (у обычного Raptor — 7 350 lb). В спецификации Ford цифры нет, поэтому сверяйте по ПТС: запас до 3,5 т — около 100 кг.",
    gvwrCheck: true,
    wide: true,
    widthNote: "Ширина без зеркал — 86,6 дюйма ≈ 2 200 мм (Raptor на 37-дюймовых шинах, по спецификации Ford).",
    engines: [
      { id: "raptor-r-52", name: "5.2 V8 Supercharged", fuel: "petrol", cc: 5163, hp: 720, note: "компрессор", mpg: 12, grade: "premium" }
    ],
    rivals: ["ram-trx"],
    sources: [
      { title: "CarWhere: Ford F-150 Raptor R", url: "https://www.carwhere.com/ford/raptor-r" },
      { title: "Дилер Ford: Raptor R 2026, GVWR 7 500 lb", url: "https://www.baytownford.com/new/Ford/2026-Ford-F-150-df38abc2ac18162841248f68f19180ae.htm" },
      { title: "Ford: спецификации F-150 2026 (PDF)", url: "https://www.fromtheroad.ford.com/content/dam/fordmediasite/us/en/library/2026/specs/2026_Ford_F150_Specs.pdf" }
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
      { id: "silv-27", name: "2.7 I4 TurboMax", fuel: "petrol", cc: 2727, hp: 310, note: "до 2 800 см³ → пошлина 15%", mpg: 18, grade: "regular" },
      { id: "silv-53", name: "5.3 V8", fuel: "petrol", cc: 5328, hp: 355, note: "", mpg: 17, grade: "regular" },
      { id: "silv-62", name: "6.2 V8", fuel: "petrol", cc: 6162, hp: 420, note: "", mpg: 17, grade: "premium" },
      { id: "silv-30d", name: "3.0 I6 Duramax", fuel: "diesel", cc: 2993, hp: 305, note: "дизель → пошлина 10%", mpg: 23, grade: "diesel" }
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
      { id: "sierra-27", name: "2.7 I4 TurboMax", fuel: "petrol", cc: 2727, hp: 310, note: "до 2 800 см³ → пошлина 15%", mpg: 18, grade: "regular" },
      { id: "sierra-53", name: "5.3 V8", fuel: "petrol", cc: 5328, hp: 355, note: "", mpg: 16, grade: "regular" },
      { id: "sierra-62", name: "6.2 V8", fuel: "petrol", cc: 6162, hp: 420, note: "", mpg: 16, grade: "premium" },
      { id: "sierra-30d", name: "3.0 I6 Duramax", fuel: "diesel", cc: 2993, hp: 305, note: "дизель → пошлина 10%", mpg: 23, grade: "diesel" }
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
