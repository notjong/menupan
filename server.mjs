// 조립만 한다. 로직은 src/의 테스트된 모듈에 있다.
import { readdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import chokidar from "chokidar";
import express from "express";
import * as XLSX from "xlsx";
import { createAdminAuth } from "./src/admin-auth.mjs";
import { createApp } from "./src/app.mjs";
import { debounce } from "./src/debounce.mjs";
import { parseWorkbook } from "./src/parse-workbook.mjs";
import { createReloader } from "./src/reloader.mjs";
import { createSseHub } from "./src/sse-hub.mjs";
import { shouldReload } from "./src/watch-filter.mjs";
import { writeSettings } from "./src/write-settings.mjs";

const PORT = 3000;
const RELOAD_DEBOUNCE_MS = 300;
const MENU_FILE = fileURLToPath(new URL("./data/menu.xlsx", import.meta.url));
// 저장 중인 파일을 감시자가 반쯤 읽지 않도록 옆에 다 쓴 뒤 이름을 바꾼다(감시 대상은 MENU_FILE 하나).
const MENU_SAVING_FILE = fileURLToPath(new URL("./data/.menu.xlsx.saving", import.meta.url));
const ADMIN_PAGE = fileURLToPath(new URL("./public/admin.html", import.meta.url));
// 강의용 고정 계정이다. 외부에 공개하는 서버라면 바꿔야 한다.
const ADMIN_ACCOUNT = { username: "admin", password: "1234" };
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

// 어드민 저장: _설정 시트만 바꿔 Excel에 쓴다. 화면 갱신은 파일 감시 → SSE가 맡는다.
function saveSettings(settings) {
  const workbook = XLSX.read(readFileSync(MENU_FILE));
  writeSettings(workbook, settings);
  writeFileSync(MENU_SAVING_FILE, XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }));
  renameSync(MENU_SAVING_FILE, MENU_FILE);
}

const app = createApp({
  getMenu: reloader.getMenu,
  hub,
  auth: createAdminAuth(ADMIN_ACCOUNT),
  getThemes: listThemes,
  saveSettings,
});
app.get("/admin", (_req, res) => res.sendFile(ADMIN_PAGE));
app.use(express.static(PUBLIC_DIR));
app.listen(PORT, () => {
  console.log(`[menu] http://localhost:${PORT} · 어드민 http://localhost:${PORT}/admin (감시 중: ${MENU_FILE})`);
});
