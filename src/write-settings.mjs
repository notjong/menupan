import * as XLSX from "xlsx";

const SETTING_KEYS = {
  storeName: "매장명",
  tagline: "영문태그",
  theme: "테마",
  device: "디바이스",
  autoAdvanceSec: "자동전환초",
};

export function writeSettings(workbook, settings) {
  const rows = XLSX.utils.sheet_to_json(workbook.Sheets["_설정"], { header: 1 });
  for (const [field, label] of Object.entries(SETTING_KEYS)) {
    const row = rows.find((cells) => cells[0] === label);
    if (row) row[1] = settings[field];
  }
  workbook.Sheets["_설정"] = XLSX.utils.aoa_to_sheet(rows);
}
