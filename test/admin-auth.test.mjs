import { test } from "node:test";
import assert from "node:assert/strict";
import { createAdminAuth } from "../src/admin-auth.mjs";

test("shouldIssueSessionOnlyForCorrectCredentials", () => {
  const auth = createAdminAuth({ username: "admin", password: "1234" });

  const token = auth.login("admin", "1234");

  assert.equal(typeof token, "string");
  assert.equal(auth.isValid(token), true);
  assert.equal(auth.login("admin", "0000"), null);
});
