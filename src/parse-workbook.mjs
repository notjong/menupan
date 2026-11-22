import * as XLSX from "xlsx";

const HIDDEN_SHEET_PREFIX = "_";

function isMenuSheet(name) {
  return !name.startsWith(HIDDEN_SHEET_PREFIX);
}

export function parseWorkbook(workbook) {
  return {
    pages: workbook.SheetNames.filter(isMenuSheet).map((name) => ({
      name,
      items: XLSX.utils.sheet_to_json(workbook.Sheets[name]).map((row) => ({
        name: row["메뉴명"],
        price: row["가격"],
        desc: row["설명"],
        soldOut: false,
        category: row["카테고리"],
      })),
    })),
  };
}
