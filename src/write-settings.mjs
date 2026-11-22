import * as XLSX from "xlsx";
import { SETTING_KEYS, SETTINGS_COLUMNS, SETTINGS_SHEET } from "./settings-sheet.mjs";

const KEY_CELL = 0;
const VALUE_CELL = 1;
const HEADER_ROW = [SETTINGS_COLUMNS.key, SETTINGS_COLUMNS.value];

function readRows(sheet) {
  return sheet ? XLSX.utils.sheet_to_json(sheet, { header: 1 }) : [HEADER_ROW];
}

function setValue(rows, key, value) {
  const row = rows.find((cells) => cells[KEY_CELL] === key);
  if (row) row[VALUE_CELL] = value;
  else rows.push([key, value]);
}

// _설정 시트의 항목 값만 바꾼다. 모르는 항목 행과 다른 시트는 그대로 둔다.
export function writeSettings(workbook, settings) {
  const existing = workbook.Sheets[SETTINGS_SHEET];
  const rows = readRows(existing);
  for (const [field, key] of Object.entries(SETTING_KEYS)) setValue(rows, key, settings[field]);

  const sheet = XLSX.utils.aoa_to_sheet(rows);
  if (existing) workbook.Sheets[SETTINGS_SHEET] = sheet;
  else XLSX.utils.book_append_sheet(workbook, sheet, SETTINGS_SHEET);
}
