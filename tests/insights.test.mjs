import test from "node:test";
import assert from "node:assert/strict";
import {
  calculate,
  createSeed,
  decide,
  simulate,
  validateBudget,
} from "../lib/finance.ts";
import { recoveryOptions, spendingInsights } from "../lib/insights.ts";

test("today's fully recorded essentials do not create a false essentials shortfall", () => {
  const b = createSeed(true);
  b.day = 30;
  b.commitments = [];
  b.goals = [];
  b.transactions[0].amount = 64000;
  const after = calculate(
    decide(b, {
      type: "purchase",
      amount: 14000,
      title: "Essentials",
      essential: true,
    }),
  );
  assert.equal(after.monthEnd, 50000);
  assert.equal(after.allowance, 0);
  assert.equal(after.essentialsLeftToday, 0);
  assert.equal(after.factors.coverage, 30);
  assert.equal(after.risk, "Watch");
});
test("buffer, flexible spend, recovery suggestions and combined decisions reconcile", () => {
  const b = createSeed();
  const original = JSON.stringify(b);
  assert.equal(calculate(b).flexible, 40000);
  const purchase = {
    type: "purchase",
    amount: 180000,
    title: "Weekend shopping",
  };
  const preview = decide(b, purchase, true);
  const options = recoveryOptions(preview);
  const income = options.find((o) => o.decision.type === "income").decision;
  assert.equal(income.amount, 140000);
  const restored = simulate(b, [purchase, income], false);
  assert.equal(calculate(restored).monthEnd, b.reserve);
  assert.equal(calculate(restored).recoveryGap, 0);
  assert.ok(validateBudget(restored));
  assert.equal(JSON.stringify(b), original);
  const cancelled = simulate(b, [
    purchase,
    { type: "cancel", amount: 0, title: "Music", subscriptionId: "music" },
  ]);
  assert.equal(calculate(cancelled).monthEnd, -65000);
  assert.throws(() => simulate(b, []));
  assert.throws(() => simulate(b, Array(5).fill(purchase)));
});
test("category insights reconcile and trend forecasting separates scheduled bills", () => {
  const b = createSeed();
  const insight = spendingInsights(b);
  assert.equal(insight.total, calculate(b).spent);
  assert.equal(
    insight.categories.reduce((sum, c) => sum + c.amount, 0),
    insight.total,
  );
  assert.equal(
    insight.categories.find((c) => c.name === "Food").amount,
    150000,
  );
  assert.ok(
    Math.abs(
      insight.categories.reduce((sum, c) => sum + c.percentage, 0) - 100,
    ) < 0.001,
  );
  assert.equal(spendingInsights(createSeed(true)).total, 0);
});
test("increasing discretionary spending never improves wallet, forecast or health", () => {
  const base = createSeed();
  let previous = calculate(base);
  for (let amount = 1; amount <= 1000000; amount += 9973) {
    const next = calculate(
      decide(base, { type: "purchase", amount, title: "Stress test" }, true),
    );
    assert.ok(next.balance <= previous.balance);
    assert.ok(next.monthEnd <= previous.monthEnd);
    assert.ok(next.health <= previous.health);
    assert.ok(next.health >= 0 && next.health <= 100);
    assert.ok(next.allowance >= 0 && Number.isFinite(next.allowance));
    previous = next;
  }
});
