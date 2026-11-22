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

test("shouldSkipRowsWithEmptyName", () => {
  const workbook = makeWorkbook({
    커피: [
      MENU_HEADER,
      ["아메리카노", 4500],
      ["", 3000, "메뉴명이 빠진 행"],
      ["라떼", 5000],
    ],
  });

  const menu = parseWorkbook(workbook);

  assert.deepEqual(menu.pages[0].items.map((item) => item.name), ["아메리카노", "라떼"]);
});

test("shouldMarkItemSoldOutWhenColumnIsY", () => {
  const workbook = makeWorkbook({
    커피: [
      MENU_HEADER,
      ["디카페인 아메리카노", 5000, "", "Y"],
      ["아메리카노", 4500, "", ""],
    ],
  });

  const [soldOutItem, availableItem] = parseWorkbook(workbook).pages[0].items;

  assert.equal(soldOutItem.soldOut, true);
  assert.equal(availableItem.soldOut, false);
});

test("shouldTreatLowercaseAndPaddedYAsSoldOut", () => {
  const workbook = makeWorkbook({
    커피: [MENU_HEADER, ["라떼", 5000, "", "y"], ["모카", 5500, "", " Y "]],
  });

  const items = parseWorkbook(workbook).pages[0].items;

  assert.deepEqual(items.map((item) => item.soldOut), [true, true]);
});

test("shouldSetPriceNullWhenNotNumeric", () => {
  const workbook = makeWorkbook({
    커피: [MENU_HEADER, ["오늘의 원두", "시가"], ["라떼", "4,500원"]],
  });

  const items = parseWorkbook(workbook).pages[0].items;

  assert.deepEqual(items.map((item) => item.price), [null, null]);
});

test("shouldDefaultCategoryToEmptyString", () => {
  const workbook = makeWorkbook({ 커피: [MENU_HEADER, ["아메리카노", 4500]] });

  const [item] = parseWorkbook(workbook).pages[0].items;

  assert.equal(item.category, "");
});

const SETTINGS_HEADER = ["항목", "값"];
const THEME_OPTIONS = { themes: ["cream", "beige"], defaultTheme: "beige" };

function settingsOf(menu) {
  const { storeName, theme, autoAdvanceSec } = menu;
  return { storeName, theme, autoAdvanceSec };
}

test("shouldReadStoreNameThemeAndAutoAdvanceFromSettingsSheet", () => {
  const workbook = makeWorkbook({
    커피: [MENU_HEADER],
    _설정: [SETTINGS_HEADER, ["매장명", "빌런 커피"], ["테마", "cream"], ["자동전환초", 5]],
  });

  const menu = parseWorkbook(workbook, THEME_OPTIONS);

  assert.deepEqual(settingsOf(menu), { storeName: "빌런 커피", theme: "cream", autoAdvanceSec: 5 });
});
