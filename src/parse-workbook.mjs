import * as XLSX from "xlsx";

const HIDDEN_SHEET_PREFIX = "_";

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

function toMenuItem(row) {
  return {
    name: row[MENU_COLUMNS.name],
    price: row[MENU_COLUMNS.price],
    desc: row[MENU_COLUMNS.desc],
    soldOut: false,
    category: row[MENU_COLUMNS.category],
  };
}

export function parseWorkbook(workbook) {
  return {
    pages: workbook.SheetNames.filter(isMenuSheet).map((name) => ({
      name,
      items: XLSX.utils.sheet_to_json(workbook.Sheets[name]).map(toMenuItem),
    })),
  };
}
