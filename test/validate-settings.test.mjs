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
