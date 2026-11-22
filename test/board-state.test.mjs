import { test } from "node:test";
import assert from "node:assert/strict";
import { groupByCategory, resolvePageIndex } from "../public/board-state.mjs";

test("shouldGroupItemsByCategoryInOrder", () => {
  const items = [
    { name: "아메리카노", category: "에스프레소" },
    { name: "라떼", category: "에스프레소" },
    { name: "핸드드립", category: "브루잉" },
  ];

  const groups = groupByCategory(items);

  assert.deepEqual(groups, [
    { category: "에스프레소", items: [items[0], items[1]] },
    { category: "브루잉", items: [items[2]] },
  ]);
});

test("shouldKeepCurrentPageIndexAfterUpdate", () => {
  assert.equal(resolvePageIndex(1, 3), 1);
});

test("shouldClampPageIndexWhenPagesShrink", () => {
  assert.equal(resolvePageIndex(2, 2), 1);
});
