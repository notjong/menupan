export function parseWorkbook(workbook) {
  return { pages: workbook.SheetNames.map((name) => ({ name })) };
}
