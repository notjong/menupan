import { test } from "node:test";
import assert from "node:assert/strict";
import { createAdminAuth } from "../src/admin-auth.mjs";
import { createApp } from "../src/app.mjs";

async function startServer(t, app) {
  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  t.after(() => {
    server.closeAllConnections();
    return new Promise((resolve) => server.close(resolve));
  });
  return `http://127.0.0.1:${server.address().port}`;
}

test("shouldServeMenuJsonFromApiMenu", async (t) => {
  const menu = { pages: [{ name: "커피", items: [] }] };
  const baseUrl = await startServer(t, createApp({ getMenu: () => menu }));

  const response = await fetch(`${baseUrl}/api/menu`);

  assert.equal(response.status, 200);
  assert.equal((await response.json()).pages[0].name, "커피");
});

test("shouldRespondEventStreamHeadersOnEvents", async (t) => {
  const hub = { add: t.mock.fn() };
  const baseUrl = await startServer(t, createApp({ getMenu: () => ({ pages: [] }), hub }));
  const controller = new AbortController();

  const response = await fetch(`${baseUrl}/events`, { signal: controller.signal });
  controller.abort();

  assert.match(response.headers.get("content-type"), /^text\/event-stream/);
  assert.equal(response.headers.get("cache-control"), "no-cache");
});

const CURRENT_SETTINGS = {
  storeName: "빌런 커피",
  tagline: "SPECIALTY COFFEE",
  theme: "cream",
  device: "signage",
  autoAdvanceSec: 0,
};

function createAdminApp(overrides = {}) {
  return createApp({
    getMenu: () => ({ ...CURRENT_SETTINGS, pages: [] }),
    getThemes: () => ["beige", "cream"],
    auth: createAdminAuth({ username: "admin", password: "1234" }),
    ...overrides,
  });
}

test("shouldRejectAdminSettingsWithoutSession", async (t) => {
  const baseUrl = await startServer(t, createAdminApp());

  const response = await fetch(`${baseUrl}/api/admin/settings`);

  assert.equal(response.status, 401);
});

function postJson(url, body, headers = {}) {
  return fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

test("shouldLoginAndSetSessionCookie", async (t) => {
  const baseUrl = await startServer(t, createAdminApp());

  const ok = await postJson(`${baseUrl}/api/admin/login`, { username: "admin", password: "1234" });
  const wrong = await postJson(`${baseUrl}/api/admin/login`, { username: "admin", password: "0000" });

  assert.equal(ok.status, 200);
  assert.match(ok.headers.get("set-cookie"), /HttpOnly/i);
  assert.equal(wrong.status, 401);
});

async function loginCookie(baseUrl) {
  const response = await postJson(`${baseUrl}/api/admin/login`, { username: "admin", password: "1234" });
  return response.headers.get("set-cookie").split(";")[0];
}

test("shouldReturnCurrentSettingsAndOptions", async (t) => {
  const baseUrl = await startServer(t, createAdminApp());
  const cookie = await loginCookie(baseUrl);

  const response = await fetch(`${baseUrl}/api/admin/settings`, { headers: { cookie } });

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    settings: CURRENT_SETTINGS,
    themes: ["beige", "cream"],
    devices: ["mobile", "tablet-port", "tablet-land", "signage"],
  });
});

function putSettings(baseUrl, cookie, body) {
  return fetch(`${baseUrl}/api/admin/settings`, {
    method: "PUT",
    headers: { "content-type": "application/json", cookie },
    body: JSON.stringify(body),
  });
}

test("shouldSaveValidSettingsWithSession", async (t) => {
  const saveSettings = t.mock.fn();
  const baseUrl = await startServer(t, createAdminApp({ saveSettings }));
  const cookie = await loginCookie(baseUrl);
  const next = { ...CURRENT_SETTINGS, theme: "beige", autoAdvanceSec: "5" };

  const response = await putSettings(baseUrl, cookie, next);

  assert.equal(response.status, 204);
  assert.equal(saveSettings.mock.callCount(), 1);
  assert.deepEqual(saveSettings.mock.calls[0].arguments[0], { ...next, autoAdvanceSec: 5 });
});
