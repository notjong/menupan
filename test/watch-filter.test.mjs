import { test } from "node:test";
import assert from "node:assert/strict";
import { shouldReload } from "../src/watch-filter.mjs";

test("shouldIgnoreExcelLockFiles", () => {
  assert.equal(shouldReload("data/~$menu.xlsx"), false);
  assert.equal(shouldReload("data/menu.xlsx"), true);
});
