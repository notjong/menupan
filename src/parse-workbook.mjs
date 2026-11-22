import * as XLSX from "xlsx";
import { DEFAULT_DEVICE, DEVICES } from "./devices.mjs";
import { SETTING_KEYS, SETTINGS_COLUMNS, SETTINGS_SHEET } from "./settings-sheet.mjs";

const HIDDEN_SHEET_PREFIX = "_";
const SOLD_OUT_MARK = "Y";
const MANUAL_ADVANCE_SEC = 0;

const MENU_COLUMNS = {
  name: "메뉴명",
  price: "가격",
  desc: "설명",
  soldOut: "품절",
  category: "카테고리",
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

function toTheme(value, { themes, defaultTheme }) {
  return themes.includes(value) ? value : defaultTheme;
}

function toDevice(value) {
  return DEVICES.includes(value) ? value : DEFAULT_DEVICE;
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
    tagline: settings[SETTING_KEYS.tagline] ?? "",
    theme: toTheme(settings[SETTING_KEYS.theme], { themes, defaultTheme }),
    autoAdvanceSec: toAutoAdvanceSec(settings[SETTING_KEYS.autoAdvanceSec]),
    device: toDevice(settings[SETTING_KEYS.device]),
    pages: workbook.SheetNames.filter(isMenuSheet).map((name) => ({
      name,
      items: parseMenuSheet(workbook.Sheets[name]),
    })),
  };
}
