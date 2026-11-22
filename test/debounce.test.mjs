import { test } from "node:test";
import assert from "node:assert/strict";
import { debounce } from "../src/debounce.mjs";

test("shouldCallOnceForBurstWithin300ms", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const fn = t.mock.fn();
  const debounced = debounce(fn, 300);

  debounced();
  t.mock.timers.tick(100);
  debounced();
  t.mock.timers.tick(100);
  debounced();
  t.mock.timers.tick(300);

  assert.equal(fn.mock.callCount(), 1);
});

test("shouldCallAgainAfterQuietPeriod", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const fn = t.mock.fn();
  const debounced = debounce(fn, 300);

  debounced();
  t.mock.timers.tick(1000);
  debounced();
  t.mock.timers.tick(500);

  assert.equal(fn.mock.callCount(), 2);
});
