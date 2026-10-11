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
  decide,
  newId,
  parseMoney,
  sanitizeText,
  savedFor,
  transferSaving,
  validateBudget,
  type Budget,
  type Commitment,
  type Decision,
  type Goal,
} from "@/lib/finance";
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
  const setBudget = (next: Budget) =>
    updatePlan((current) => ({ ...current, budget: next }));
  const setHistory = (next: Budget[] | ((current: Budget[]) => Budget[])) =>
    updatePlan((current) => ({
      ...current,
      history: typeof next === "function" ? next(current.history) : next,
    }));
  const setStorageWarning = dismissStorageWarning;
  const [view, setView] = useState<View>("overview"),
    [modal, setModal] = useState<Modal>(null),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const [type, setType] = useState<Decision["type"]>("purchase"),
    [amount, setAmount] = useState("1800"),
    [decisionTitle, setDecisionTitle] = useState("Weekend shopping"),
    [subscriptionId, setSubscriptionId] = useState("cloud"),
    [decision, setDecision] = useState<Decision | null>(null);
  const [search, setSearch] = useState(""),
    [filter, setFilter] = useState("all"),
    lock = useRef(false);
  const m = useMemo(() => calculate(budget), [budget]);
  const candidate = useMemo(() => {
    if (!decision) return null;
    try {
      return decide(budget, decision, true);
    } catch {
      return null;
    }
  }, [budget, decision]);
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
        decide(budget, decision),
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
  function undo() {
    if (!history.length) return;
    updatePlan((current) => ({
      ...current,
      budget: current.history.at(-1) ?? current.budget,
      history: current.history.slice(0, -1),
    }));
    setDecision(null);
    setNotice("Last change undone. Your previous plan is restored.");
  }
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget),
      f = (key: string) => String(data.get(key) ?? "");
    safe(() => {
      const next = structuredClone(budget);
      if (modal?.kind === "income" || modal?.kind === "expense") {
        const cash = parseMoney(f("amount")),
          income = modal.kind === "income";
        if (!income && cash > m.balance)
          throw Error("Your wallet cannot cover this expense.");
        next.transactions.push({
          id: newId(),
          day: budget.day,
          title: sanitizeText(f("title")),
          amount: cash,
          type: income ? "income" : "expense",
          category: income ? "Income" : f("category"),
          essential: !income && data.get("essential") === "on",
        });
        commit(
          next,
          income
            ? "Income received. Your plan just got lighter."
            : "Expense recorded. Every number is up to date.",
        );
      } else if (modal?.kind === "commitment") {
        const dueDay = Number(f("dueDay"));
        if (!Number.isInteger(dueDay) || dueDay < budget.day || dueDay > 30)
          throw Error(`Choose a day between ${budget.day} and 30.`);
        const c: Commitment = {
            id: modal.item?.id || newId(),
            title: sanitizeText(f("title")),
            amount: parseMoney(f("amount")),
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
          target = parseMoney(f("target")),
          planned = parseMoney(f("planned"), true),
          dueDay = Number(f("dueDay"));
        if (!Number.isInteger(dueDay) || dueDay < budget.day || dueDay > 30)
          throw Error(`Choose a day between ${budget.day} and 30.`);
        if (target < savedFor(budget, id))
          throw Error("The target cannot be below actual savings.");
        if (planned > target - savedFor(budget, id))
          throw Error(
            "Your planned contribution exceeds the amount left to save.",
          );
        const g: Goal = {
            id,
            title: sanitizeText(f("title")),
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
          transferSaving(budget, modal.item.id, parseMoney(f("amount"))),
          "Money moved to savings. Your goal is getting closer.",
        );
      else if (modal?.kind === "settings") {
        next.essentials = parseMoney(f("essentials"), true);
        next.reserve = parseMoney(f("reserve"), true);
        next.day = Number(f("day"));
        const latest = Math.max(1, ...budget.transactions.map((t) => t.day));
        if (!Number.isInteger(next.day) || next.day < latest || next.day > 30)
          throw Error(
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

  return {
    budget,
    setBudget,
    history,
    setHistory,
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
  };
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
