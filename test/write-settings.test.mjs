import { test } from "node:test";
import assert from "node:assert/strict";
import * as XLSX from "xlsx";
import { parseWorkbook } from "../src/parse-workbook.mjs";
import { writeSettings } from "../src/write-settings.mjs";

const MENU_HEADER = ["메뉴명", "가격", "설명", "품절", "카테고리"];
const SETTINGS_HEADER = ["항목", "값"];
const THEME_OPTIONS = { themes: ["cream", "beige"], defaultTheme: "beige" };
const NEW_SETTINGS = {
  storeName: "빌런 커피",
  tagline: "SPECIALTY COFFEE",
  theme: "cream",
  device: "signage",
  autoAdvanceSec: 5,
};

function makeWorkbook(sheets) {
  const workbook = XLSX.utils.book_new();
  for (const [name, rows] of Object.entries(sheets)) {
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(rows), name);
  }
  return workbook;
}

test("shouldWriteSettingsIntoSettingsSheet", () => {
  const workbook = makeWorkbook({
    커피: [MENU_HEADER, ["아메리카노", 4500, "산미", "", "에스프레소"]],
    _설정: [SETTINGS_HEADER, ["매장명", "옛 이름"], ["테마", "beige"]],
  });
  const menuBefore = parseWorkbook(workbook, THEME_OPTIONS).pages;

  writeSettings(workbook, NEW_SETTINGS);

  const menu = parseWorkbook(workbook, THEME_OPTIONS);
  assert.equal(menu.theme, "cream");
  assert.equal(menu.storeName, "빌런 커피");
  assert.deepEqual(menu.pages, menuBefore);
});
