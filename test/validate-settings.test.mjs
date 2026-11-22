import { test } from "node:test";
import assert from "node:assert/strict";
import { validateSettings } from "../src/validate-settings.mjs";

const OPTIONS = { themes: ["cream", "beige"], devices: ["mobile", "signage"] };
const VALID_INPUT = {
  storeName: "빌런 커피",
  tagline: "SPECIALTY COFFEE",
  theme: "cream",
  device: "signage",
  autoAdvanceSec: 5,
};

test("shouldAcceptValidSettings", () => {
  const result = validateSettings({ ...VALID_INPUT, storeName: " 빌런 커피 ", autoAdvanceSec: "5" }, OPTIONS);

  assert.deepEqual(result, { ok: true, settings: VALID_INPUT });
});

test("shouldRejectUnknownThemeOrDevice", () => {
  const result = validateSettings({ ...VALID_INPUT, theme: "purple", device: "tv" }, OPTIONS);

  assert.equal(result.ok, false);
  assert.deepEqual(result.errors.map((error) => error.field), ["theme", "device"]);
});

test("shouldRejectInvalidAutoAdvanceSec", () => {
  const okFor = (autoAdvanceSec) => validateSettings({ ...VALID_INPUT, autoAdvanceSec }, OPTIONS).ok;

  assert.deepEqual([-1, 1.5, "빠르게"].map(okFor), [false, false, false]);
});
