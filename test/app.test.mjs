import { test } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.mjs";

async function startServer(t, app) {
  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  return `http://127.0.0.1:${server.address().port}`;
}

test("shouldServeMenuJsonFromApiMenu", async (t) => {
  const menu = { pages: [{ name: "커피", items: [] }] };
  const baseUrl = await startServer(t, createApp({ getMenu: () => menu }));

  const response = await fetch(`${baseUrl}/api/menu`);

  assert.equal(response.status, 200);
  assert.equal((await response.json()).pages[0].name, "커피");
});
