import { test } from "node:test";
import assert from "node:assert/strict";
import * as XLSX from "xlsx";
import { parseWorkbook } from "../src/parse-workbook.mjs";

const MENU_HEADER = ["메뉴명", "가격", "설명", "품절", "카테고리"];

function makeWorkbook(sheets) {
  const workbook = XLSX.utils.book_new();
  for (const [name, rows] of Object.entries(sheets)) {
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(rows), name);
  }
  return workbook;
}

test("shouldTurnEachSheetIntoPage", () => {
  const workbook = makeWorkbook({ 커피: [MENU_HEADER], 디저트: [MENU_HEADER] });

  const menu = parseWorkbook(workbook);

  assert.equal(menu.pages.length, 2);
  assert.deepEqual(menu.pages.map((page) => page.name), ["커피", "디저트"]);
});

test("shouldExcludeSheetsStartingWithUnderscore", () => {
  const workbook = makeWorkbook({ 커피: [MENU_HEADER], _설정: [["항목", "값"]] });

  const menu = parseWorkbook(workbook);

  assert.deepEqual(menu.pages.map((page) => page.name), ["커피"]);
});

test("shouldKeepWorkbookSheetOrder", () => {
  const workbook = makeWorkbook({ 음료: [MENU_HEADER], 커피: [MENU_HEADER] });

  const menu = parseWorkbook(workbook);

  assert.deepEqual(menu.pages.map((page) => page.name), ["음료", "커피"]);
});

test("shouldMapColumnsToItemFields", () => {
  const workbook = makeWorkbook({
    커피: [MENU_HEADER, ["아메리카노", 4500, "깔끔한 산미", "", "에스프레소"]],
  });

  const menu = parseWorkbook(workbook);

  assert.deepEqual(menu.pages[0].items[0], {
    name: "아메리카노",
    price: 4500,
    desc: "깔끔한 산미",
    soldOut: false,
    category: "에스프레소",
  });
});
