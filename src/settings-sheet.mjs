// _설정 시트의 모양. 읽기(parse-workbook)와 쓰기(write-settings)가 같은 이름을 쓴다.
export const SETTINGS_SHEET = "_설정";

export const SETTING_KEYS = {
  storeName: "매장명",
  tagline: "영문태그",
  theme: "테마",
  device: "디바이스",
  autoAdvanceSec: "자동전환초",
};

export const SETTINGS_COLUMNS = { key: "항목", value: "값" };
