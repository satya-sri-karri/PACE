import {
  createSeed,
  validateBudget,
  STORAGE_KEY,
  type Budget,
} from "./finance.ts";

export type PlanSnapshot = {
  budget: Budget;
  history: Budget[];
  storageWarning: string;
};
export const MAX_BACKUP_BYTES = 1_000_000;
const initial: PlanSnapshot = {
  budget: createSeed(),
  history: [],
  storageWarning: "",
};
let snapshot = initial;
let restored = false;
const listeners = new Set<() => void>();

export function decodeBackup(raw: string): {
  budget: Budget;
  history: Budget[];
} {
  if (raw.length > MAX_BACKUP_BYTES)
    throw new Error("Choose a backup smaller than 1 MB.");
  const data: unknown = JSON.parse(raw);
  if (
    !data ||
    typeof data !== "object" ||
    !("budget" in data) ||
    !validateBudget(data.budget)
  ) {
    throw new Error("That file is not a valid Pace backup.");
  }
  const history =
    "history" in data && Array.isArray(data.history)
      ? data.history.slice(-12).filter(validateBudget)
      : [];
  return { budget: data.budget, history };
}

function emit() {
  listeners.forEach((listener) => listener());
}
export function subscribePlan(listener: () => void) {
  listeners.add(listener);
  if (!restored && typeof window !== "undefined") {
    restored = true;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) snapshot = { ...decodeBackup(raw), storageWarning: "" };
    } catch {
      snapshot = {
        ...initial,
        storageWarning:
          "Your saved plan could not be restored. A fresh demo is ready.",
      };
    }
    emit();
  }
  return () => {
    listeners.delete(listener);
  };
}
export const getPlanSnapshot = () => snapshot;
export const getInitialSnapshot = () => initial;

export function updatePlan(updater: (current: PlanSnapshot) => PlanSnapshot) {
  const next = updater(snapshot);
  if (!validateBudget(next.budget))
    throw new Error(
      "Check the amounts and dates: this change creates an invalid plan.",
    );
  snapshot = next;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ budget: next.budget, history: next.history }),
    );
  } catch {
    snapshot = {
      ...next,
      storageWarning:
        "Storage is unavailable. Your plan works for this session, but refresh may reset it.",
    };
  }
  emit();
}

export function dismissStorageWarning() {
  snapshot = { ...snapshot, storageWarning: "" };
  emit();
}
