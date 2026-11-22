import { test } from "node:test";
import assert from "node:assert/strict";
import { debounce } from "../src/debounce.mjs";

const QUIET_MS = 300;

function setupDebounced(t) {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const fn = t.mock.fn();
  return { fn, debounced: debounce(fn, QUIET_MS), tick: (ms) => t.mock.timers.tick(ms) };
}

test("shouldCallOnceForBurstWithin300ms", (t) => {
  const { fn, debounced, tick } = setupDebounced(t);

  debounced();
  tick(100);
  debounced();
  tick(100);
  debounced();
  tick(300);

  assert.equal(fn.mock.callCount(), 1);
});

test("shouldCallAgainAfterQuietPeriod", (t) => {
  const { fn, debounced, tick } = setupDebounced(t);

  debounced();
  tick(1000);
  debounced();
  tick(500);

  assert.equal(fn.mock.callCount(), 2);
});
