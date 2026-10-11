import test from "node:test";
import assert from "node:assert/strict";
import { createSeed, sanitizeText, validateBudget } from "../lib/finance.ts";
import { decodeBackup } from "../lib/plan-store.ts";

test("backup limits reject oversized, malformed, and inconsistent data", () => {
  assert.throws(() => decodeBackup("x".repeat(1_000_001)), /smaller than 1 MB/);
  for (const value of ["null", "[]", "{", '{"budget":{}}'])
    assert.throws(() => decodeBackup(value));
  const budget = createSeed();
  budget.transactions = Array.from({ length: 1001 }, (_, i) => ({
    ...budget.transactions[0],
    id: `income-${i}`,
  }));
  assert.equal(validateBudget(budget), false);
  const history = Array.from({ length: 20 }, () => createSeed());
  assert.equal(
    decodeBackup(JSON.stringify({ budget: createSeed(), history })).history
      .length,
    12,
  );
});

test("descriptions are normalized and bounded; monetary data cannot be coerced", () => {
  assert.equal(sanitizeText("  Lunch\nwith friends  "), "Lunch with friends");
  assert.throws(() => sanitizeText("  "));
  assert.throws(() => sanitizeText("x".repeat(81)));
  const plan = createSeed();
  plan.transactions[0].amount = "1000000";
  assert.equal(validateBudget(plan), false);
  const corrupt = createSeed();
  corrupt.goals[0].planned = -1;
  assert.equal(validateBudget(corrupt), false);
});
