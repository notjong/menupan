import { test } from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { createSseHub, formatSseEvent } from "../src/sse-hub.mjs";

test("shouldFormatEventAsSseFrame", () => {
  assert.equal(formatSseEvent("menu-updated", {}), "event: menu-updated\ndata: {}\n\n");
});

function fakeResponse(t) {
  const res = new EventEmitter();
  res.write = t.mock.fn();
  return res;
}

test("shouldWriteEventToAllConnectedClients", (t) => {
  const hub = createSseHub();
  const first = fakeResponse(t);
  const second = fakeResponse(t);
  hub.add(first);
  hub.add(second);

  hub.broadcast("menu-updated", {});

  for (const res of [first, second]) {
    assert.deepEqual(res.write.mock.calls.map((call) => call.arguments), [
      ["event: menu-updated\ndata: {}\n\n"],
    ]);
  }
});

test("shouldRemoveClientOnClose", (t) => {
  const hub = createSseHub();
  const closed = fakeResponse(t);
  const open = fakeResponse(t);
  hub.add(closed);
  hub.add(open);

  closed.emit("close");
  hub.broadcast("menu-updated", {});

  assert.equal(closed.write.mock.callCount(), 0);
  assert.equal(open.write.mock.callCount(), 1);
});
