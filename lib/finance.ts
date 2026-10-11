export type Transaction = {
  id: string;
  day: number;
  title: string;
  amount: number;
  type: "income" | "expense" | "saving";
  category: string;
  essential: boolean;
  goalId?: string;
  linkedId?: string;
};
export type Commitment = {
  id: string;
  title: string;
  amount: number;
  dueDay: number;
  kind: "bill" | "subscription";
  status: "pending" | "paid" | "cancelled";
};
export type Goal = {
  id: string;
  title: string;
  target: number;
  planned: number;
  dueDay: number;
};
export type Budget = {
  version: 1;
  day: number;
  essentials: number;
  reserve: number;
  transactions: Transaction[];
  commitments: Commitment[];
  goals: Goal[];
};
export type Decision = {
  type: "purchase" | "income" | "emergency" | "cancel";
  amount: number;
  title: string;
  subscriptionId?: string;
  essential?: boolean;
};
export type ForecastPoint = {
  day: number;
  balance: number;
  events: string[];
};
export type Risk = "Low" | "Watch" | "High";
export const STORAGE_KEY = "pace-budget-v1";
const moneyFormats = [false, true].map(
  (decimals) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: decimals ? 2 : 0,
      maximumFractionDigits: decimals ? 2 : 0,
    }),
);
export function sanitizeText(raw: string, fallback = ""): string {
  const text =
    raw
      .normalize("NFC")
      .replace(/\p{Cc}/gu, " ")
      .trim() || fallback;
  if (!text || text.length > 80)
    throw new Error("Use a description between 1 and 80 characters.");
  return text;
}
export const newId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
export function money(amount: number, decimals = false): string {
  return (moneyFormats[decimals ? 1 : 0] ?? moneyFormats[0]!).format(
    amount / 100,
  );
}
export function parseMoney(raw: string, allowZero = false): number {
  const value = raw.trim();
  if (!/^\d+(\.\d{1,2})?$/.test(value))
    throw new Error("Enter a valid amount with up to two decimal places.");
  const [whole = "0", fraction = ""] = value.split(".");
  const result = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  if (
    !Number.isSafeInteger(result) ||
    result > 1000000000 ||
    result < (allowZero ? 0 : 1)
  )
    throw new Error(
      allowZero
        ? "Enter an amount from ₹0 to ₹1 crore."
        : "Enter an amount from ₹0.01 to ₹1 crore.",
    );
  return result;
}
export function createSeed(fresh = false): Budget {
  return {
    version: 1,
    day: fresh ? 1 : 11,
    essentials: 14000,
    reserve: 50000,
    transactions: [
      {
        id: "allowance",
        day: 1,
        title: "Monthly allowance",
        amount: 1000000,
        type: "income",
        category: "Allowance",
        essential: false,
      },
      ...(!fresh
        ? [
            {
              id: "groceries",
              day: 2,
              title: "Groceries for the week",
              amount: 120000,
              type: "expense" as const,
              category: "Food",
              essential: true,
            },
            {
              id: "transport",
              day: 4,
              title: "Metro & auto rides",
              amount: 60000,
              type: "expense" as const,
              category: "Transport",
              essential: true,
            },
            {
              id: "cafe",
              day: 7,
              title: "A little café moment",
              amount: 30000,
              type: "expense" as const,
              category: "Food",
              essential: false,
            },
            {
              id: "supplies",
              day: 10,
              title: "Study supplies",
              amount: 50000,
              type: "expense" as const,
              category: "Shopping",
              essential: false,
            },
          ]
        : []),
    ],
    commitments: [
      {
        id: "room",
        title: "Room & utilities",
        amount: 110000,
        dueDay: 14,
        kind: "bill",
        status: "pending",
      },
      {
        id: "internet",
        title: "Internet & phone",
        amount: 70000,
        dueDay: 19,
        kind: "bill",
        status: "pending",
      },
      {
        id: "music",
        title: "Music membership",
        amount: 25000,
        dueDay: 22,
        kind: "subscription",
        status: "pending",
      },
      {
        id: "cloud",
        title: "Cloud storage",
        amount: 15000,
        dueDay: 25,
        kind: "subscription",
        status: "pending",
      },
    ],
    goals: [
      {
        id: "emergency",
        title: "A little safety net",
        target: 150000,
        planned: 150000,
        dueDay: 30,
      },
    ],
  };
}
export function savedFor(b: Budget, id: string) {
  return b.transactions
    .filter((t) => t.type === "saving" && t.goalId === id)
    .reduce((n, t) => n + t.amount, 0);
}
export function calculate(b: Budget) {
  const income = b.transactions
    .filter((t) => t.type === "income")
    .reduce((n, t) => n + t.amount, 0);
  const spent = b.transactions
    .filter((t) => t.type === "expense")
    .reduce((n, t) => n + t.amount, 0);
  const saved = b.transactions
    .filter((t) => t.type === "saving")
    .reduce((n, t) => n + t.amount, 0);
  const balance = income - spent - saved;
  const pending = b.commitments.filter((c) => c.status === "pending");
  const commitments = pending.reduce((n, c) => n + c.amount, 0);
  const goalPlans = b.goals.map((g) => ({
    ...g,
    remaining: Math.max(0, g.target - savedFor(b, g.id)),
    allocation: Math.min(g.planned, Math.max(0, g.target - savedFor(b, g.id))),
  }));
  const savingsPlan = goalPlans.reduce((n, g) => n + g.allocation, 0);
  const goalRemaining = goalPlans.reduce((n, g) => n + g.remaining, 0);
  const days = 31 - b.day;
  const todayEssential = b.transactions
    .filter((t) => t.day === b.day && t.type === "expense" && t.essential)
    .reduce((n, t) => n + t.amount, 0);
  const futureEssentials =
    Math.max(0, b.essentials - todayEssential) + b.essentials * (days - 1);
  const free = balance - commitments - savingsPlan - b.reserve;
  const allowance = Math.max(0, free) / days;
  let running = balance;
  const forecast: ForecastPoint[] = [
    { day: b.day, balance: running, events: ["Your wallet now"] },
  ];
  for (let day = b.day; day <= 30; day++) {
    const bills = pending.filter((c) => Math.max(b.day, c.dueDay) === day);
    const goals = goalPlans.filter(
      (g) => Math.max(b.day, g.dueDay) === day && g.allocation > 0,
    );
    running -=
      bills.reduce((n, c) => n + c.amount, 0) +
      goals.reduce((n, g) => n + g.allocation, 0) +
      (day === b.day
        ? Math.max(0, b.essentials - todayEssential)
        : b.essentials);
    forecast.push({
      day,
      balance: running,
      events: [
        ...bills.map((c) => c.title),
        ...goals.map((g) => `Savings: ${g.title}`),
      ],
    });
  }
  const minimum = Math.min(...forecast.map((p) => p.balance));
  const deficitDay = forecast.find((p) => p.balance < 0)?.day;
  const risk: Risk =
    minimum < 0 || free < futureEssentials
      ? "High"
      : minimum < b.reserve + 7 * b.essentials
        ? "Watch"
        : "Low";
  const riskReason =
    minimum < 0
      ? `Your plan runs short on Day ${deficitDay}.`
      : free < futureEssentials
        ? `Your available spending is ${money(futureEssentials - Math.max(0, free))} below your remaining essentials estimate.`
        : risk === "Watch"
          ? "Bills are covered, but your cash cushion is less than a week of essentials."
          : "Your plan covers essentials, goals, and a week of breathing room.";
  const clamp = (x: number) => Math.min(1, Math.max(0, x));
  const liquidity = clamp(
    (minimum - b.reserve) / Math.max(7 * b.essentials, 1),
  );
  const coverage = futureEssentials === 0 ? 1 : clamp(free / futureEssentials);
  const goalAffordable = Math.max(
    0,
    balance - commitments - futureEssentials - b.reserve,
  );
  const goalFunding =
    goalRemaining === 0 ? 1 : clamp(goalAffordable / goalRemaining);
  const health = Math.round(50 * liquidity + 30 * coverage + 20 * goalFunding);
  return {
    income,
    spent,
    saved,
    balance,
    commitments,
    savingsPlan,
    goalRemaining,
    days,
    futureEssentials,
    free,
    allowance,
    shortfall: Math.max(0, -free),
    forecast,
    monthEnd: running,
    minimum,
    deficitDay,
    risk,
    riskReason,
    health,
    factors: {
      liquidity: 50 * liquidity,
      coverage: 30 * coverage,
      goals: 20 * goalFunding,
    },
    goalAffordable,
    goalFunding,
    flexible: Math.max(0, minimum - b.reserve),
    recoveryGap: Math.max(0, b.reserve - minimum),
    bufferRemaining: Math.min(b.reserve, Math.max(0, minimum)),
    essentialsLeftToday: Math.max(0, b.essentials - todayEssential),
  };
}
export function decide(b: Budget, decision: Decision, preview = false): Budget {
  const next = structuredClone(b);
  if (decision.type === "cancel") {
    const sub = next.commitments.find(
      (c) => c.id === decision.subscriptionId && c.kind === "subscription",
    );
    if (!sub || sub.status !== "pending")
      throw new Error("Choose an active, unpaid subscription.");
    sub.status = "cancelled";
  } else {
    if (
      !Number.isSafeInteger(decision.amount) ||
      decision.amount < 1 ||
      decision.amount > 1000000000
    )
      throw new Error("Enter a positive amount.");
    if (
      !preview &&
      decision.type !== "income" &&
      decision.amount > calculate(b).balance
    )
      throw new Error(
        "Your wallet cannot cover this expense. Try a smaller amount or record received income first.",
      );
    next.transactions.push({
      id: newId(),
      day: b.day,
      title: sanitizeText(
        decision.title,
        decision.type === "income"
          ? "Extra income"
          : decision.type === "emergency"
            ? "Unexpected expense"
            : "New purchase",
      ),
      amount: decision.amount,
      type: decision.type === "income" ? "income" : "expense",
      category:
        decision.type === "income"
          ? "Income"
          : decision.type === "emergency"
            ? "Unexpected"
            : "Shopping",
      essential: decision.essential ?? false,
    });
  }
  return next;
}
export function payBill(b: Budget, id: string): Budget {
  const next = structuredClone(b);
  const bill = next.commitments.find((c) => c.id === id);
  if (!bill || bill.status !== "pending")
    throw new Error("This bill has already been paid or cancelled.");
  if (bill.amount > calculate(b).balance)
    throw new Error("Your wallet cannot cover this bill yet.");
  bill.status = "paid";
  next.transactions.push({
    id: newId(),
    day: b.day,
    title: bill.title,
    amount: bill.amount,
    type: "expense",
    category: bill.kind === "subscription" ? "Subscriptions" : "Bills",
    essential: false,
    linkedId: bill.id,
  });
  return next;
}
export function transferSaving(b: Budget, id: string, amount: number): Budget {
  const next = structuredClone(b),
    goal = next.goals.find((g) => g.id === id);
  if (!goal) throw new Error("This goal no longer exists.");
  if (!Number.isSafeInteger(amount) || amount < 1)
    throw new Error("Enter a positive amount.");
  if (amount > goal.target - savedFor(b, id))
    throw new Error("This amount exceeds your remaining goal target.");
  if (amount > calculate(b).balance)
    throw new Error("Your wallet cannot cover this transfer.");
  goal.planned = Math.max(0, goal.planned - amount);
  next.transactions.push({
    id: newId(),
    day: b.day,
    title: goal.title,
    amount,
    type: "saving",
    category: "Savings",
    essential: false,
    goalId: id,
  });
  return next;
}
export function validateBudget(value: unknown): value is Budget {
  if (!value || typeof value !== "object") return false;
  const b = value as Budget,
    amount = (v: unknown) =>
      typeof v === "number" &&
      Number.isSafeInteger(v) &&
      v >= 0 &&
      v <= 1000000000;
  const day = (v: unknown) =>
    typeof v === "number" && Number.isInteger(v) && v >= 1 && v <= 30;
  const str = (v: unknown) =>
    typeof v === "string" &&
    v.trim().length > 0 &&
    v.length <= 120 &&
    !/\p{Cc}/u.test(v);
  if (
    b.version !== 1 ||
    !day(b.day) ||
    !amount(b.essentials) ||
    !amount(b.reserve) ||
    !Array.isArray(b.transactions) ||
    !Array.isArray(b.commitments) ||
    !Array.isArray(b.goals)
  )
    return false;
  if (
    b.transactions.length > 1000 ||
    b.commitments.length > 100 ||
    b.goals.length > 50
  )
    return false;
  if (
    [...b.transactions, ...b.commitments, ...b.goals].some(
      (item) => !item || typeof item !== "object",
    )
  )
    return false;
  if (
    !b.transactions.every(
      (t) =>
        str(t.id) &&
        str(t.title) &&
        str(t.category) &&
        amount(t.amount) &&
        t.amount > 0 &&
        day(t.day) &&
        t.day <= b.day &&
        ["income", "expense", "saving"].includes(t.type) &&
        typeof t.essential === "boolean" &&
        (t.type !== "saving" || b.goals.some((g) => g.id === t.goalId)),
    )
  )
    return false;
  if (
    !b.commitments.every(
      (c) =>
        str(c.id) &&
        str(c.title) &&
        amount(c.amount) &&
        c.amount > 0 &&
        day(c.dueDay) &&
        ["bill", "subscription"].includes(c.kind) &&
        ["pending", "paid", "cancelled"].includes(c.status),
    )
  )
    return false;
  if (
    !b.goals.every(
      (g) =>
        str(g.id) &&
        str(g.title) &&
        amount(g.target) &&
        g.target > 0 &&
        amount(g.planned) &&
        g.planned <= Math.max(0, g.target - savedFor(b, g.id)) &&
        day(g.dueDay) &&
        savedFor(b, g.id) <= g.target,
    )
  )
    return false;
  const unique = (
    items: {
      id: string;
    }[],
  ) => new Set(items.map((i) => i.id)).size === items.length;
  if (![b.transactions, b.commitments, b.goals].every(unique)) return false;
  if (
    b.commitments.some(
      (c) =>
        c.status === "paid" &&
        b.transactions.filter(
          (t) =>
            t.linkedId === c.id &&
            t.type === "expense" &&
            t.amount === c.amount,
        ).length !== 1,
    )
  )
    return false;
  if (
    b.transactions.some(
      (t) =>
        t.linkedId &&
        (t.type !== "expense" ||
          !str(t.linkedId) ||
          !b.commitments.some(
            (c) =>
              c.id === t.linkedId &&
              c.status === "paid" &&
              c.amount === t.amount,
          )),
    )
  )
    return false;
  if (
    b.transactions.some(
      (t) => t.goalId !== undefined && (t.type !== "saving" || !str(t.goalId)),
    )
  )
    return false;
  return calculate(b).balance >= 0;
}

/** A bundle is atomic: incoming money is available before any included expense. */
export function simulate(
  budget: Budget,
  decisions: readonly Decision[],
  preview = true,
): Budget {
  if (!decisions.length || decisions.length > 4)
    throw new Error("Compare up to four decisions together.");
  const ordered = [...decisions].sort(
    (a, b) => Number(b.type === "income") - Number(a.type === "income"),
  );
  return ordered.reduce(
    (next, decision) => decide(next, decision, preview),
    budget,
  );
}
