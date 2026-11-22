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

function createAdminApp() {
  return createApp({
    getMenu: () => ({ pages: [] }),
    auth: createAdminAuth({ username: "admin", password: "1234" }),
  });
}

test("shouldRejectAdminSettingsWithoutSession", async (t) => {
  const baseUrl = await startServer(t, createAdminApp());

  const response = await fetch(`${baseUrl}/api/admin/settings`);

  assert.equal(response.status, 401);
});
