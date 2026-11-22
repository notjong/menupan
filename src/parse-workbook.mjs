import * as XLSX from "xlsx";

const HIDDEN_SHEET_PREFIX = "_";
const SOLD_OUT_MARK = "Y";
const SETTINGS_SHEET = "_설정";
const MANUAL_ADVANCE_SEC = 0;

const MENU_COLUMNS = {
  name: "메뉴명",
  price: "가격",
  desc: "설명",
  soldOut: "품절",
  category: "카테고리",
};

const SETTINGS_COLUMNS = { key: "항목", value: "값" };

const SETTING_KEYS = {
  storeName: "매장명",
  theme: "테마",
  autoAdvanceSec: "자동전환초",
};

function isMenuSheet(name) {
  return !name.startsWith(HIDDEN_SHEET_PREFIX);
}

function hasMenuName(row) {
  return Boolean(row[MENU_COLUMNS.name]);
}

function isSoldOutMark(value) {
  return String(value ?? "").trim().toUpperCase() === SOLD_OUT_MARK;
}

function toPrice(value) {
  return Number.isFinite(value) ? value : null;
}

function toMenuItem(row) {
  return {
    name: row[MENU_COLUMNS.name],
    price: toPrice(row[MENU_COLUMNS.price]),
    desc: row[MENU_COLUMNS.desc],
    soldOut: isSoldOutMark(row[MENU_COLUMNS.soldOut]),
    category: row[MENU_COLUMNS.category] ?? "",
  };
}

function parseMenuSheet(sheet) {
  return XLSX.utils.sheet_to_json(sheet).filter(hasMenuName).map(toMenuItem);
}

function toAutoAdvanceSec(value) {
  return Number.isFinite(value) && value > 0 ? value : MANUAL_ADVANCE_SEC;
}

function readSettings(sheet) {
  if (!sheet) return {};
  return Object.fromEntries(
    XLSX.utils.sheet_to_json(sheet).map((row) => [row[SETTINGS_COLUMNS.key], row[SETTINGS_COLUMNS.value]]),
  );
}

export function parseWorkbook(workbook, { themes = [], defaultTheme } = {}) {
  const settings = readSettings(workbook.Sheets[SETTINGS_SHEET]);
  return {
    storeName: settings[SETTING_KEYS.storeName] ?? "",
    theme: themes.includes(settings[SETTING_KEYS.theme]) ? settings[SETTING_KEYS.theme] : defaultTheme,
    autoAdvanceSec: toAutoAdvanceSec(settings[SETTING_KEYS.autoAdvanceSec]),
    pages: workbook.SheetNames.filter(isMenuSheet).map((name) => ({
      name,
      items: parseMenuSheet(workbook.Sheets[name]),
    })),
  };
}
