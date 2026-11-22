// 화면 어댑터: /api/menu를 받아 DOM에 그리고, /events 신호가 오면 다시 받는다.
// 계산은 테스트된 board-state.mjs·format.mjs에 있다. 여기는 DOM과 타이머만 다룬다.
import { groupByCategory, nextPageIndex, resolvePageIndex } from "./board-state.mjs";
import { formatPrice } from "./format.mjs";

const MENU_URL = "/api/menu";
const EVENTS_URL = "/events";
// src/sse-hub.mjs의 MENU_UPDATED_EVENT와 같은 값이다. 브라우저는 src/를 받지 못해 따로 적는다.
const MENU_UPDATED_EVENT = "menu-updated";
const DEFAULT_TITLE = "메뉴판";
const EMPTY_MESSAGE = "표시할 메뉴 시트가 없습니다.";

// 어드민 미리보기(/admin의 iframe, ?preview)에서만 저장 전 설정을 덮어쓴다.
// 같은 출처의 메시지만 받는다. 일반 화면은 이 값을 쓰지 않는다.
const PREVIEW_MESSAGE = "menu-preview";
const isPreview = new URLSearchParams(location.search).has("preview");
let previewOverrides = {};

const rootEl = document.documentElement;
const taglineEl = document.getElementById("tagline");
const storeNameEl = document.getElementById("store-name");
const tabsEl = document.getElementById("page-tabs");
const listEl = document.getElementById("menu-list");
const themeLinkEl = document.getElementById("theme");

let serverMenu = null;
let menu = null;
let pageIndex = 0;
let autoAdvanceSec = 0;
let autoAdvanceTimer = null;

// Excel 값은 반드시 textContent로 넣는다 (TRD 5절: innerHTML 금지, XSS 방지).
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function applyTheme(theme) {
  if (!theme) {
    themeLinkEl.removeAttribute("href");
    return;
  }
  const href = `templates/${encodeURIComponent(theme)}.css`;
  if (themeLinkEl.getAttribute("href") !== href) themeLinkEl.setAttribute("href", href);
}

// 디바이스 값만 옮긴다. 캔버스 크기·열 수·PNG는 board-grid.css가 고른다.
function applyDevice(device) {
  rootEl.dataset.device = device;
}

function renderItem(item) {
  const li = el("li", item.soldOut ? "item is-sold-out" : "item");
  const row = el("div", "item-row");
  row.append(el("span", "item-name", item.name));
  if (item.soldOut) row.append(el("span", "sold-out-label", "품절"));
  if (item.price !== null) {
    row.append(el("span", "item-leader"), el("span", "item-price", formatPrice(item.price)));
  }
  li.append(row);
  if (item.desc) li.append(el("p", "item-desc", item.desc));
  return li;
}

function renderCategory({ category, items }) {
  const section = el("section", "category");
  if (category) section.append(el("h2", "category-title", category));
  const list = el("ul", "items");
  list.append(...items.map(renderItem));
  section.append(list);
  return section;
}

function renderTabs(pages) {
  tabsEl.replaceChildren(
    ...pages.map((page, index) => {
      const tab = el("button", "page-tab", page.name);
      tab.type = "button";
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-selected", String(index === pageIndex));
      tab.addEventListener("click", () => showPage(index));
      return tab;
    }),
  );
}

function render() {
  taglineEl.textContent = menu.tagline ?? "";
  storeNameEl.textContent = menu.storeName;
  document.title = menu.storeName || DEFAULT_TITLE;

  if (menu.pages.length === 0) {
    tabsEl.replaceChildren();
    listEl.replaceChildren(el("p", "empty-message", EMPTY_MESSAGE));
    return;
  }
  renderTabs(menu.pages);
  listEl.replaceChildren(...groupByCategory(menu.pages[pageIndex].items).map(renderCategory));
}

function showPage(index) {
  pageIndex = index;
  render();
}

function setAutoAdvance(seconds) {
  if (seconds === autoAdvanceSec) return;
  autoAdvanceSec = seconds;
  clearInterval(autoAdvanceTimer);
  autoAdvanceTimer = null;
  if (seconds > 0) {
    autoAdvanceTimer = setInterval(() => {
      if (menu.pages.length > 0) showPage(nextPageIndex(pageIndex, menu.pages.length));
    }, seconds * 1000);
  }
}

function applyMenu() {
  if (!serverMenu) return;
  menu = { ...serverMenu, ...previewOverrides };
  // 페이지가 0개면 resolvePageIndex가 -1을 낸다. 빈 화면을 그리므로 0으로 둔다.
  pageIndex = menu.pages.length > 0 ? resolvePageIndex(pageIndex, menu.pages.length) : 0;
  applyTheme(menu.theme);
  applyDevice(menu.device);
  setAutoAdvance(menu.autoAdvanceSec);
  render();
}

async function loadMenu() {
  const response = await fetch(MENU_URL, { cache: "no-store" });
  if (!response.ok) throw new Error(`${MENU_URL} ${response.status}`);
  serverMenu = await response.json();
  applyMenu();
}

// 받기에 실패하면 이전 화면을 그대로 둔다. 다음 신호나 새로고침에서 다시 받는다.
async function reload() {
  try {
    await loadMenu();
  } catch (error) {
    console.error("[menu] 메뉴를 받지 못했다:", error);
  }
}

if (isPreview) {
  window.addEventListener("message", (event) => {
    if (event.origin !== location.origin || event.data?.type !== PREVIEW_MESSAGE) return;
    previewOverrides = event.data.settings;
    applyMenu();
  });
}

// TRD 5절: 첫 로드를 그린 뒤에 구독한다.
await reload();
new EventSource(EVENTS_URL).addEventListener(MENU_UPDATED_EVENT, reload);
