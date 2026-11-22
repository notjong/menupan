import { test } from "node:test";
import assert from "node:assert/strict";
import { createReloader } from "../src/reloader.mjs";

const MENU_A = { pages: [{ name: "커피", items: [] }] };

function readOkThenFail(t) {
  let calls = 0;
  return t.mock.fn(() => {
    calls += 1;
    if (calls > 1) throw new Error("파일이 잠겨 있음");
    return "workbook-A";
  });
}

test("shouldKeepPreviousDataWhenParseFails", (t) => {
  const log = t.mock.fn();
  const reloader = createReloader({
    readWorkbook: readOkThenFail(t),
    parse: () => MENU_A,
    hub: { broadcast: t.mock.fn() },
    log,
  });

  reloader.reload();
  reloader.reload();

  assert.equal(reloader.getMenu(), MENU_A);
  assert.equal(log.mock.callCount(), 1);
});

test("shouldNotBroadcastWhenParseFails", (t) => {
  const hub = { broadcast: t.mock.fn() };
  const reloader = createReloader({
    readWorkbook: readOkThenFail(t),
    parse: () => MENU_A,
    hub,
    log: () => {},
  });

  reloader.reload();
  assert.equal(hub.broadcast.mock.callCount(), 1);

  reloader.reload();
  assert.equal(hub.broadcast.mock.callCount(), 1);
});
