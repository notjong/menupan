export function parseWorkbook(workbook) {
  return {
    pages: workbook.SheetNames
      .filter((name) => !name.startsWith("_"))
      .map((name) => ({ name })),
  };
}
