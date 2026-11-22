import * as XLSX from "xlsx";
import { SETTING_KEYS, SETTINGS_SHEET } from "./settings-sheet.mjs";

export function writeSettings(workbook, settings) {
  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[SETTINGS_SHEET], { header: 1 });
  for (const [field, label] of Object.entries(SETTING_KEYS)) {
    const row = rows.find((cells) => cells[0] === label);
    if (row) row[1] = settings[field];
  }
  workbook.Sheets[SETTINGS_SHEET] = XLSX.utils.aoa_to_sheet(rows);
}
