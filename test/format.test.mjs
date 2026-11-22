import { test } from "node:test";
import assert from "node:assert/strict";
import { formatPrice } from "../src/format.mjs";

test("shouldFormatPriceWithCommaAndWon", () => {
  assert.equal(formatPrice(4500), "4,500원");
});

test("shouldReturnEmptyStringWhenPriceIsNull", () => {
  assert.equal(formatPrice(null), "");
});
