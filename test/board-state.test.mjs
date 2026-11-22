import { test } from "node:test";
import assert from "node:assert/strict";
import { groupByCategory } from "../public/board-state.mjs";

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
