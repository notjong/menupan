// 조립만 한다. 로직은 src/의 테스트된 모듈에 있다.
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import chokidar from "chokidar";
import express from "express";
import * as XLSX from "xlsx";
import { createApp } from "./src/app.mjs";
import { debounce } from "./src/debounce.mjs";
import { parseWorkbook } from "./src/parse-workbook.mjs";
import { createReloader } from "./src/reloader.mjs";
import { createSseHub } from "./src/sse-hub.mjs";
import { shouldReload } from "./src/watch-filter.mjs";

const PORT = 3000;
const RELOAD_DEBOUNCE_MS = 300;
const MENU_FILE = fileURLToPath(new URL("./data/menu.xlsx", import.meta.url));
const PUBLIC_DIR = fileURLToPath(new URL("./public/", import.meta.url));
const THEME_ASSETS_DIR = fileURLToPath(new URL("./public/assets/", import.meta.url));

// 유효한 테마 = public/assets/ 아래 폴더 이름 (docs/TRD.md 7절 미결 사항의 임시 규칙).
// 매번 다시 읽어서, 테마 폴더를 추가하면 서버를 다시 켜지 않아도 반영된다.
function listThemes() {
  try {
    return readdirSync(THEME_ASSETS_DIR, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
  } catch {
    return [];
  }
}

const hub = createSseHub();
const reloader = createReloader({
  // ESM 빌드의 XLSX.readFile은 fs가 연결되지 않아 파일을 못 읽는다. 직접 읽어서 넘긴다.
  readWorkbook: () => XLSX.read(readFileSync(MENU_FILE)),
  parse: (workbook) => {
    const themes = listThemes();
    return parseWorkbook(workbook, { themes, defaultTheme: themes[0] });
  },
  hub,
  log: (error) => console.error(`[menu] 읽기 실패, 이전 메뉴를 유지한다: ${error.message}`),
});
reloader.reload();

const reloadSoon = debounce(() => {
  reloader.reload();
  console.log(`[menu] 다시 읽음: ${MENU_FILE}`);
}, RELOAD_DEBOUNCE_MS);

chokidar
  .watch(MENU_FILE, { ignoreInitial: true })
  .on("all", (_event, path) => {
    if (shouldReload(path)) reloadSoon();
  });

const app = createApp({ getMenu: reloader.getMenu, hub });
app.use(express.static(PUBLIC_DIR));
app.listen(PORT, () => {
  console.log(`[menu] http://localhost:${PORT} (감시 중: ${MENU_FILE})`);
});
