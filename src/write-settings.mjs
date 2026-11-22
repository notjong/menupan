import * as XLSX from "xlsx";
import { SETTING_KEYS, SETTINGS_SHEET } from "./settings-sheet.mjs";

export function writeSettings(workbook, settings) {
  const existing = workbook.Sheets[SETTINGS_SHEET];
  const rows = existing ? XLSX.utils.sheet_to_json(existing, { header: 1 }) : [["항목", "값"]];
  for (const [field, label] of Object.entries(SETTING_KEYS)) {
    const row = rows.find((cells) => cells[0] === label);
    if (row) row[1] = settings[field];
    else rows.push([label, settings[field]]);
  }
  const sheet = XLSX.utils.aoa_to_sheet(rows);
  if (existing) workbook.Sheets[SETTINGS_SHEET] = sheet;
  else XLSX.utils.book_append_sheet(workbook, sheet, SETTINGS_SHEET);
}
