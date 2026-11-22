// 어드민 화면 어댑터. 검증·저장 규칙은 서버(src/validate-settings.mjs, write-settings.mjs)가 맡고,
// 여기는 입력을 모아 보내고 미리보기를 보여 주기만 한다.
const API = {
  login: "/api/admin/login",
  logout: "/api/admin/logout",
  settings: "/api/admin/settings",
};
// public/client.js의 PREVIEW_MESSAGE와 같은 값이다.
const PREVIEW_MESSAGE = "menu-preview";

// 화면 표시용 이름과 캔버스 크기. 유효한 값 목록은 서버가 준다(없는 이름은 ID를 그대로 쓴다).
const DEVICE_INFO = {
  signage: { label: "사이니지 (세로)", width: 1080, height: 1920 },
  "tablet-land": { label: "태블릿 (가로)", width: 1920, height: 1440 },
  "tablet-port": { label: "태블릿 (세로)", width: 1440, height: 1920 },
  mobile: { label: "모바일", width: 1080, height: 2160 },
};
const THEME_INFO = {
  "light-olive": { label: "Light Olive", ko: "라이트 올리브" },
  "deep-green": { label: "Deep Green", ko: "딥 그린" },
  cream: { label: "Cream", ko: "크림" },
  beige: { label: "Beige", ko: "베이지" },
};
const FIELD_NAMES = {
  storeName: "매장명",
  tagline: "영문태그",
  theme: "테마",
  device: "디바이스",
  autoAdvanceSec: "자동전환초",
};

const $ = (id) => document.getElementById(id);
const loginView = $("login-view");
const adminView = $("admin-view");
const loginForm = $("login-form");
const loginError = $("login-error");
const form = $("settings-form");
const saveButton = $("save");
const saveMessage = $("save-message");
const stage = $("stage");
const stageClip = $("stage-clip");
const preview = $("preview");

let options = { themes: [], devices: [] };
let saved = null;
let draft = null;

function showLogin() {
  adminView.hidden = true;
  loginView.hidden = false;
  loginForm.elements.username.focus();
}

function showAdmin() {
  loginView.hidden = true;
  adminView.hidden = false;
}

function sendJson(url, method, body) {
  return fetch(url, {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── 선택 버튼 ──
function choiceButton({ name, sub, swatch, pressed, isDevice, onClick }) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = isDevice ? "choice is-device" : "choice";
  button.setAttribute("aria-pressed", String(pressed));
  const title = document.createElement("span");
  title.className = "choice-name";
  if (swatch !== undefined) {
    const dot = document.createElement("span");
    dot.className = "swatch";
    dot.dataset.theme = swatch;
    title.append(dot);
  }
  title.append(name);
  button.append(title);
  if (sub) {
    const subEl = document.createElement("span");
    subEl.className = "choice-sub";
    subEl.textContent = sub;
    button.append(subEl);
  }
  button.addEventListener("click", onClick);
  return button;
}

function renderChoices() {
  $("theme-choices").replaceChildren(
    ...options.themes.map((theme) =>
      choiceButton({
        name: THEME_INFO[theme]?.label ?? theme,
        sub: THEME_INFO[theme]?.ko ?? "",
        swatch: theme,
        pressed: theme === draft.theme,
        onClick: () => update({ theme }),
      }),
    ),
  );
  $("device-choices").replaceChildren(
    ...options.devices.map((device) =>
      choiceButton({
        name: DEVICE_INFO[device]?.label ?? device,
        pressed: device === draft.device,
        isDevice: true,
        onClick: () => update({ device }),
      }),
    ),
  );
  paintSwatches();
}

// 테마 색 점: 각 테마 CSS의 --accent 값을 읽어 칠한다(색을 이 파일에 따로 적지 않는다).
const accentCache = new Map();
async function themeAccent(theme) {
  if (!accentCache.has(theme)) {
    const css = await fetch(`/templates/${encodeURIComponent(theme)}.css`).then((r) => (r.ok ? r.text() : ""));
    accentCache.set(theme, css.match(/--accent:\s*([^;]+);/)?.[1].trim() ?? "");
  }
  return accentCache.get(theme);
}
function paintSwatches() {
  for (const dot of document.querySelectorAll(".swatch")) {
    themeAccent(dot.dataset.theme).then((color) => dot.style.setProperty("--swatch", color));
  }
}

// ── 입력 ↔ draft ──
function fillFields() {
  for (const name of ["storeName", "tagline", "autoAdvanceSec"]) {
    form.elements[name].value = draft[name];
    form.elements[name].removeAttribute("aria-invalid");
  }
}

// 입력칸 값은 글자라서 글자로 맞춰 비교한다(자동전환초 "0"과 0은 같다).
function isDirty() {
  return Object.keys(FIELD_NAMES).some((key) => String(saved[key]) !== String(draft[key]));
}

function update(changes) {
  draft = { ...draft, ...changes };
  renderChoices();
  refreshPreview();
  refreshSaveState();
}

function refreshSaveState(message = isDirty() ? "저장하지 않은 변경이 있습니다." : "", isError = false) {
  saveButton.disabled = !isDirty();
  saveMessage.textContent = message;
  saveMessage.classList.toggle("is-error", isError);
}

// ── 미리보기 ──
function deviceSize() {
  return DEVICE_INFO[draft.device] ?? DEVICE_INFO["tablet-port"];
}

function fitPreview() {
  const { width, height } = deviceSize();
  const style = getComputedStyle(stage);
  const availableWidth = stage.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
  const availableHeight = stage.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
  const scale = Math.min(availableWidth / width, availableHeight / height);
  preview.style.width = `${width}px`;
  preview.style.height = `${height}px`;
  preview.style.transform = `scale(${scale})`;
  stageClip.style.width = `${Math.floor(width * scale)}px`;
  stageClip.style.height = `${Math.floor(height * scale)}px`;
}

function refreshPreview() {
  fitPreview();
  const settings = { ...draft, autoAdvanceSec: Number(draft.autoAdvanceSec) || 0 };
  preview.contentWindow?.postMessage({ type: PREVIEW_MESSAGE, settings }, location.origin);
  $("bg-path").textContent = `assets/${draft.theme}/bg-${draft.device}.png`;
  $("frame-path").textContent = `assets/${draft.theme}/frame-${draft.device}.png`;
  const { width, height } = deviceSize();
  $("device-size").textContent = `${width} × ${height}px`;
}

// ── 서버와 주고받기 ──
async function loadSettings() {
  const response = await fetch(API.settings, { cache: "no-store" });
  if (response.status === 401) return showLogin();
  if (!response.ok) throw new Error(`${API.settings} ${response.status}`);
  const body = await response.json();
  options = { themes: body.themes, devices: body.devices };
  saved = body.settings;
  draft = { ...saved };
  showAdmin();
  fillFields();
  update({});
}

function showErrors(errors) {
  for (const { field } of errors) form.elements[field]?.setAttribute("aria-invalid", "true");
  const text = errors.map(({ field, message }) => `${FIELD_NAMES[field] ?? field}: ${message}`).join(" ");
  refreshSaveState(text, true);
}

async function save(event) {
  event.preventDefault();
  saveButton.disabled = true;
  saveMessage.textContent = "저장하는 중…";
  const response = await sendJson(API.settings, "PUT", draft).catch(() => null);
  if (response?.status === 401) return showLogin();
  if (response?.status === 400) return showErrors((await response.json()).errors);
  if (!response?.ok) return refreshSaveState("저장하지 못했습니다. Excel에서 파일을 닫았는지 확인하고 다시 시도하세요.", true);
  saved = { ...draft, autoAdvanceSec: Number(draft.autoAdvanceSec) };
  draft = { ...saved };
  fillFields();
  refreshSaveState("저장했습니다. Excel _설정 시트에 반영했고, 열려 있는 메뉴판이 곧 바뀝니다.");
}

async function login(event) {
  event.preventDefault();
  loginError.hidden = true;
  const { username, password } = loginForm.elements;
  const response = await sendJson(API.login, "POST", { username: username.value, password: password.value });
  if (!response.ok) {
    loginError.textContent = "아이디 또는 비밀번호가 맞지 않습니다.";
    loginError.hidden = false;
    password.select();
    return;
  }
  password.value = "";
  await loadSettings();
}

async function logout() {
  await fetch(API.logout, { method: "POST" });
  showLogin();
}

loginForm.addEventListener("submit", login);
form.addEventListener("submit", save);
form.addEventListener("input", (event) => {
  const { name, value } = event.target;
  if (name in FIELD_NAMES) {
    event.target.removeAttribute("aria-invalid");
    update({ [name]: value });
  }
});
$("logout").addEventListener("click", logout);
preview.addEventListener("load", () => draft && refreshPreview());
new ResizeObserver(() => draft && fitPreview()).observe(stage);

loadSettings().catch((error) => {
  console.error("[admin] 설정을 받지 못했다:", error);
  showLogin();
});
