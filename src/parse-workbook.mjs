import * as XLSX from "xlsx";

const HIDDEN_SHEET_PREFIX = "_";
const SOLD_OUT_MARK = "Y";

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
    category: row[MENU_COLUMNS.category],
  };
}

function parseMenuSheet(sheet) {
  return XLSX.utils.sheet_to_json(sheet).filter(hasMenuName).map(toMenuItem);
}

export function parseWorkbook(workbook) {
  return {
    pages: workbook.SheetNames.filter(isMenuSheet).map((name) => ({
      name,
      items: parseMenuSheet(workbook.Sheets[name]),
    })),
  };
}
