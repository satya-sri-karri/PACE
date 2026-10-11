import { calculate, money, type Budget, type Decision } from "./finance.ts";

export type SavedScenario = {
  id: string;
  title: string;
  decisions: Decision[];
};

export function spendingInsights(budget: Budget) {
  const expenses = budget.transactions.filter((t) => t.type === "expense");
  const categories = new Map<string, number>();
  for (const item of expenses)
    categories.set(
      item.category,
      (categories.get(item.category) ?? 0) + item.amount,
    );
  const total = expenses.reduce((sum, item) => sum + item.amount, 0);
  const everyday = expenses.filter((t) => !t.linkedId);
  const average =
    everyday.reduce((sum, item) => sum + item.amount, 0) / budget.day;
  const today = everyday
    .filter((t) => t.day === budget.day)
    .reduce((sum, item) => sum + item.amount, 0);
  const m = calculate(budget);
  return {
    total,
    today,
    average,
    trendEnd:
      m.balance -
      m.commitments -
      m.savingsPlan -
      average * (m.days - 1) -
      Math.max(0, average - today),
    categories: [...categories]
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: total ? (amount / total) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount),
  };
}

export function recoveryOptions(budget: Budget) {
  const m = calculate(budget);
  const amount = Math.ceil(m.recoveryGap);
  const subscription = budget.commitments
    .filter((c) => c.kind === "subscription" && c.status === "pending")
    .sort((a, b) => b.amount - a.amount)[0];
  const options: { title: string; description: string; decision: Decision }[] =
    [];
  if (amount > 0)
    options.push({
      title: `Explore ${money(amount)} extra income`,
      description:
        "The amount needed to cover this plan and preserve your buffer. Count it only once received.",
      decision: {
        type: "income",
        amount,
        title: "Income to rebalance my plan",
      },
    });
  if (subscription)
    options.push({
      title: `Skip ${subscription.title}`,
      description: `Release ${money(subscription.amount)} reserved for the next renewal. Past payments stay unchanged.`,
      decision: {
        type: "cancel",
        amount: 0,
        title: subscription.title,
        subscriptionId: subscription.id,
      },
    });
  return options;
}
