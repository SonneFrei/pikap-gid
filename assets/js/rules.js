/*
 * Правила растаможки пикапа (грузовой автомобиль, код ТН ВЭД 8704, категория N1/N2)
 * для физлица. ВСЕ ставки собраны в одном месте, чтобы их было легко обновлять.
 *
 * status:
 *   "ok"     — подтверждено первоисточником или несколькими независимыми источниками
 *   "check"  — источники расходятся или данных мало, нужна сверка с брокером
 *
 * Обновлено и перепроверено: 19.11.2026
 */
window.RULES = {
  updated: "19.11.2026",

  // НДС на ввоз. База = таможенная стоимость + пошлина (+ акциз, но на грузовые 8704 его нет).
  vat: {
    rate: 0.22,
    status: "ok",
    note: "Основная ставка НДС — 22% с 1 января 2026 года (Федеральный закон от 28.11.2025 № 425-ФЗ). При ввозе считается от таможенной стоимости плюс пошлина.",
    sources: [
      { title: "ФНС: с 1 января 2026 года ставка НДС составляет 22%", url: "https://www.nalog.gov.ru/rn26/news/smi/16596761/" },
      { title: "РБК Компании: НДС при импорте в 2026 году", url: "https://companies.rbc.ru/news/PSOwQt2nr9/nds-pri-importe-iz-kitaya-v-2026-godu/" }
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

  // Утилизационный сбор для грузовых (N1/N2), 2026 год: 150 000 ₽ × коэффициент
  util: {
    rows: [
      {
        id: "le2500", label: "полная масса до 2,5 т", maxKg: 2500,
        new: 919500, old: 1336500, status: "ok",
        note: "150 000 ₽ × 6,13 (до 3 лет) и × 8,91 (старше 3 лет), ставки 2026 года."
      },
      {
        id: "le3500", label: "полная масса 2,5–3,5 т", maxKg: 3500,
        new: 990000, old: 1441500, status: "ok",
        note: "150 000 ₽ × 6,6 (до 3 лет) и × 9,61 (старше 3 лет), ставки 2026 года. Совпадает в нескольких независимых источниках (январь и сентябрь 2026)."
      },
      {
        id: "le5000", label: "полная масса 3,5–5 т", maxKg: 5000,
        new: 1036500, old: 1543500, status: "ok",
        note: "150 000 ₽ × 6,91 (до 3 лет) и × 10,29 (старше 3 лет), ставки 2026 года."
      }
    ],
    sources: [
      { title: "Logisline: утилизационный сбор в 2026 году (таблица)", url: "https://logisline.ru/information/utilizatsionnyy-sbor-v-2026-godu/" },
      { title: "Sferacar: утильсбор на пикап в 2026", url: "https://sferacar.ru/stati/utilizacionnyj-sbor-dlya-pikapov.html" },
      { title: "Drom: невысокий утильсбор на пикапы", url: "https://www.drom.ru/info/misc/103545.html" }
    ],
    nextChange: "Ставки коммерческого утильсбора индексируются каждое 1 января: по планам, на 10% в год в 2027–2030."
  },

  // Порог 3,5 т: права, знак 3.4, пропуска
  massLimitKg: 3500
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
