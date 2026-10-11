import { createContext, useContext, type ReactNode } from "react";
import type { View, Modal } from "@/lib/types";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import {
  calculate,
  createSeed,
  decide,
  newId,
  parseMoney,
  sanitizeText,
  savedFor,
  simulate,
  transferSaving,
  validateBudget,
  type Budget,
  type Commitment,
  type Decision,
  type Goal,
} from "@/lib/finance";
import type { SavedScenario } from "@/lib/insights";
import {
  decodeBackup,
  dismissStorageWarning,
  getInitialSnapshot,
  getPlanSnapshot,
  MAX_BACKUP_BYTES,
  subscribePlan,
  updatePlan,
} from "@/lib/plan-store";
export function usePaceController() {
  const { budget, history, storageWarning } = useSyncExternalStore(
    subscribePlan,
    getPlanSnapshot,
    getInitialSnapshot,
  );
  const loaded = true;
  function resetPlan(fresh = false) {
    updatePlan(() => ({
      budget: createSeed(fresh),
      history: [],
      storageWarning: "",
    }));
    setScenarios([]);
    setSupporting([]);
    setDecision(null);
    setModal(null);
    setError("");
    setNotice(
      fresh
        ? "Fresh month. ₹10,000 and 30 days ahead."
        : "Day 11 demo restored. Ready to explore.",
    );
  }
  const setStorageWarning = dismissStorageWarning;
  const [view, setView] = useState<View>("overview"),
    [modal, setModal] = useState<Modal>(null),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const [supporting, setSupporting] = useState<Decision[]>([]);
  const [scenarios, setScenarios] = useState<SavedScenario[]>([]);
  const [errorField, setErrorField] = useState("");
  const [type, setType] = useState<Decision["type"]>("purchase"),
    [amount, setAmount] = useState("1800"),
    [decisionTitle, setDecisionTitle] = useState("Weekend shopping"),
    [subscriptionId, setSubscriptionId] = useState("cloud"),
    [decision, setDecision] = useState<Decision | null>(null);
  const [search, setSearch] = useState(""),
    [filter, setFilter] = useState("all"),
    lock = useRef(false);
  const m = useMemo(() => calculate(budget), [budget]);
  const decisions = useMemo(
    () => (decision ? [...supporting, decision] : []),
    [supporting, decision],
  );
  const candidate = useMemo(() => {
    if (!decision) return null;
    try {
      return simulate(budget, decisions);
    } catch {
      return null;
    }
  }, [budget, decision, decisions]);
  const after = useMemo(
      () => (candidate ? calculate(candidate) : null),
      [candidate],
    ),
    activeSubscriptions = budget.commitments.filter(
      (c) => c.kind === "subscription" && c.status === "pending",
    );
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 4200);
    return () => clearTimeout(t);
  }, [notice]);
  function open(next: Modal) {
    setError("");
    setModal(next);
  }
  function commit(next: Budget, message: string) {
    if (lock.current) return;
    if (!validateBudget(next))
      throw Error(
        "Check the amounts and dates: this change creates an invalid plan.",
      );
    lock.current = true;
    updatePlan((current) => ({
      ...current,
      history: [...current.history, current.budget].slice(-12),
      budget: next,
    }));
    setDecision(null);
    setSupporting([]);
    setScenarios([]);
    setNotice(message);
    setError("");
    setModal(null);
    setTimeout(() => {
      lock.current = false;
    }, 0);
  }
  function safe(fn: () => void) {
    try {
      fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please check your entry.");
      setErrorField(e instanceof FieldError ? e.field : "");
      requestAnimationFrame(() =>
        document.getElementById("form-error")?.focus(),
      );
    }
  }
  function preview(e?: FormEvent) {
    e?.preventDefault();
    safe(() => {
      const d: Decision = {
        type,
        amount: type === "cancel" ? 0 : parseMoney(amount),
        title: decisionTitle,
        subscriptionId: activeSubscriptions.some((s) => s.id === subscriptionId)
          ? subscriptionId
          : (activeSubscriptions[0]?.id ?? ""),
      };
      decide(budget, d, true);
      setDecision(d);
      setSupporting([]);
      setError("");
      setView("lab");
      window.scrollTo({
        top: 0,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
    });
  }
  function apply() {
    if (!decision) return;
    safe(() =>
      commit(
        simulate(budget, decisions, false),
        decision.type === "cancel"
          ? "Renewal cancelled. A little more breathing room."
          : "Decision recorded. Your whole plan is up to date.",
      ),
    );
  }
  function preset(
    t: Decision["type"],
    value: string,
    title: string,
    sub = "cloud",
  ) {
    setType(t);
    setAmount(value);
    setDecisionTitle(title);
    setSubscriptionId(sub);
    safe(() => {
      const d: Decision = {
        type: t,
        amount: t === "cancel" ? 0 : parseMoney(value),
        title,
        subscriptionId: sub,
      };
      decide(budget, d, true);
      setDecision(d);
      setSupporting([]);
      setError("");
    });
  }
  function move(next: View) {
    setView(next);
    requestAnimationFrame(() =>
      document.getElementById("main")?.focus({ preventScroll: true }),
    );
    setError("");
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }
  function addSupport(d: Decision) {
    if (!decision) return;
    safe(() => {
      simulate(budget, [...supporting, d, decision]);
      setSupporting((current) => [...current, d]);
      setError("");
    });
  }
  function pinScenario() {
    if (!decision || !candidate) return;
    const signature = JSON.stringify(decisions);
    if (scenarios.some((s) => JSON.stringify(s.decisions) === signature)) {
      setNotice("This option is already on your comparison board.");
      return;
    }
    setScenarios((current) =>
      [
        ...current,
        {
          id: newId(),
          title: decision.title || "My option",
          decisions: structuredClone(decisions),
        },
      ].slice(-3),
    );
    setNotice("Option pinned. Try another amount and compare the trade-offs.");
  }
  function loadScenario(scenario: SavedScenario) {
    const d = scenario.decisions.at(-1);
    if (!d) return;
    safe(() => {
      simulate(budget, scenario.decisions);
      setDecision(d);
      setSupporting(scenario.decisions.slice(0, -1));
      setType(d.type);
      setAmount(String(d.amount / 100));
      setDecisionTitle(d.title);
      setSubscriptionId(d.subscriptionId ?? "");
      setError("");
    });
  }
  function undo() {
    if (!history.length) return;
    updatePlan((current) => ({
      ...current,
      budget: current.history.at(-1) ?? current.budget,
      history: current.history.slice(0, -1),
    }));
    setDecision(null);
    setSupporting([]);
    setScenarios([]);
    setNotice("Last change undone. Your previous plan is restored.");
  }
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget),
      f = (key: string) => String(data.get(key) ?? "");
    const cashField = (key: string, zero = false) => {
      try {
        return parseMoney(f(key), zero);
      } catch (error) {
        throw new FieldError(
          key,
          error instanceof Error ? error.message : "Enter a valid amount.",
        );
      }
    };
    const titleField = () => {
      try {
        return sanitizeText(f("title"));
      } catch {
        throw new FieldError(
          "title",
          "Use a description between 1 and 80 characters.",
        );
      }
    };
    safe(() => {
      const next = structuredClone(budget);
      if (modal?.kind === "income" || modal?.kind === "expense") {
        const cash = cashField("amount"),
          income = modal.kind === "income";
        const existing = modal.item;
        if (existing && (existing.linkedId || existing.type === "saving"))
          throw Error("Use the linked bill or savings action for this entry.");
        if (!income && cash > m.balance + (existing?.amount ?? 0))
          throw new FieldError(
            "amount",
            "Your wallet cannot cover this expense.",
          );
        const entry = {
          id: existing?.id ?? newId(),
          day: existing?.day ?? budget.day,
          title: titleField(),
          amount: cash,
          type: income ? ("income" as const) : ("expense" as const),
          category: income ? "Income" : f("category"),
          essential: !income && data.get("essential") === "on",
        };
        if (existing)
          next.transactions = next.transactions.map((t) =>
            t.id === existing.id ? entry : t,
          );
        else next.transactions.push(entry);
        commit(
          next,
          existing
            ? "Entry corrected. Your balance and forecast are updated."
            : income
              ? "Income received. Your plan just got lighter."
              : "Expense recorded. Every number is up to date.",
        );
      } else if (modal?.kind === "commitment") {
        const dueDay = Number(f("dueDay"));
        if (!Number.isInteger(dueDay) || dueDay < budget.day || dueDay > 30)
          throw new FieldError(
            "dueDay",
            `Choose a day between ${budget.day} and 30.`,
          );
        const c: Commitment = {
            id: modal.item?.id || newId(),
            title: titleField(),
            amount: cashField("amount"),
            dueDay,
            kind: f("kind") as Commitment["kind"],
            status: "pending",
          },
          i = next.commitments.findIndex((c2) => c2.id === c.id);
        if (i < 0) next.commitments.push(c);
        else next.commitments[i] = c;
        commit(next, "Commitment updated. Your forecast now includes it.");
      } else if (modal?.kind === "goal") {
        const id = modal.item?.id || newId(),
          target = cashField("target"),
          planned = cashField("planned", true),
          dueDay = Number(f("dueDay"));
        if (!Number.isInteger(dueDay) || dueDay < budget.day || dueDay > 30)
          throw new FieldError(
            "dueDay",
            `Choose a day between ${budget.day} and 30.`,
          );
        if (target < savedFor(budget, id))
          throw new FieldError(
            "target",
            "The target cannot be below actual savings.",
          );
        if (planned > target - savedFor(budget, id))
          throw new FieldError(
            "planned",
            "Your planned contribution exceeds the amount left to save.",
          );
        const g: Goal = {
            id,
            title: titleField(),
            target,
            planned,
            dueDay,
          },
          i = next.goals.findIndex((g2) => g2.id === id);
        if (i < 0) next.goals.push(g);
        else next.goals[i] = g;
        commit(next, "Goal updated. Your plan makes room for it.");
      } else if (modal?.kind === "transfer")
        commit(
          transferSaving(budget, modal.item.id, cashField("amount")),
          "Money moved to savings. Your goal is getting closer.",
        );
      else if (modal?.kind === "settings") {
        next.essentials = cashField("essentials", true);
        next.reserve = cashField("reserve", true);
        next.day = Number(f("day"));
        const latest = Math.max(1, ...budget.transactions.map((t) => t.day));
        if (!Number.isInteger(next.day) || next.day < latest || next.day > 30)
          throw new FieldError(
            "day",
            `Choose a day from ${latest} to 30. Posted entries keep their dates.`,
          );
        commit(next, "Plan assumptions updated. Forecasts are recalculated.");
      }
    });
  }
  function exportPlan() {
    const url = URL.createObjectURL(
        new Blob([JSON.stringify({ budget, history }, null, 2)], {
          type: "application/json",
        }),
      ),
      a = document.createElement("a");
    a.href = url;
    a.download = "pace-plan.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function importPlan(file: File | undefined) {
    if (!file) return;
    try {
      if (file.size > MAX_BACKUP_BYTES)
        throw Error("Choose a backup smaller than 1 MB.");
      const data = decodeBackup(await file.text());
      commit(data.budget, "Your saved plan is restored.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not restore that plan.");
    }
  }
  function removeEntry() {
    if ((modal?.kind !== "expense" && modal?.kind !== "income") || !modal.item)
      return;
    const item = modal.item;
    safe(() => {
      if (item.linkedId || item.type === "saving")
        throw Error("Use the linked bill or savings action for this entry.");
      commit(
        {
          ...budget,
          transactions: budget.transactions.filter((t) => t.id !== item.id),
        },
        "Entry removed. Undo can restore it.",
      );
    });
  }

  return {
    budget,
    supporting,
    setSupporting,
    decisions,
    scenarios,
    setScenarios,
    addSupport,
    pinScenario,
    loadScenario,
    fieldProps: (name: string) => ({
      "aria-invalid": Boolean(error && errorField === name),
      "aria-describedby":
        error && errorField === name ? "form-error" : undefined,
    }),
    resetPlan,
    history,
    loaded,
    storageWarning,
    setStorageWarning,
    view,
    setView,
    modal,
    setModal,
    error,
    setError,
    notice,
    setNotice,
    type,
    setType,
    amount,
    setAmount,
    decisionTitle,
    setDecisionTitle,
    subscriptionId,
    setSubscriptionId,
    decision,
    setDecision,
    search,
    setSearch,
    filter,
    setFilter,
    lock,
    m,
    candidate,
    after,
    activeSubscriptions,
    open,
    commit,
    safe,
    preview,
    apply,
    preset,
    move,
    undo,
    submit,
    exportPlan,
    importPlan,
    removeEntry,
  };
}
class FieldError extends Error {
  constructor(
    public field: string,
    message: string,
  ) {
    super(message);
  }
}
const PaceContext = createContext<ReturnType<typeof usePaceController> | null>(
  null,
);
export function PaceProvider({ children }: { children: ReactNode }) {
  const value = usePaceController();
  return <PaceContext.Provider value={value}>{children}</PaceContext.Provider>;
}
export function usePace() {
  const value = useContext(PaceContext);
  if (!value) throw new Error("PaceProvider is required");
  return value;
}
