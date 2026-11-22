const HIDDEN_SHEET_PREFIX = "_";

function isMenuSheet(name) {
  return !name.startsWith(HIDDEN_SHEET_PREFIX);
}

export function parseWorkbook(workbook) {
  return {
    pages: workbook.SheetNames.filter(isMenuSheet).map((name) => ({ name })),
  };
}
