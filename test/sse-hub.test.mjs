import { test } from "node:test";
import assert from "node:assert/strict";
import { formatSseEvent } from "../src/sse-hub.mjs";

test("shouldFormatEventAsSseFrame", () => {
  assert.equal(formatSseEvent("menu-updated", {}), "event: menu-updated\ndata: {}\n\n");
});
