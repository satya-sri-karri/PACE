import {
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  ShoppingBag,
  Coffee,
  Bus,
  Search,
  PiggyBank,
  Pencil,
} from "lucide-react";
import { money } from "@/lib/finance";
import { usePace } from "@/hooks/use-pace";

export function ActivityPanel({ full = false }: { full?: boolean }) {
  const { budget, search, setSearch, filter, setFilter, open, move } =
    usePace();
  return (
    <section className="panel activity-panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">THE REAL NUMBERS</span>
          <h2>{full ? "Your money moves." : "Recent activity."}</h2>
        </div>
        {full ? (
          <button
            className="button small"
            onClick={() => open({ kind: "expense" })}
          >
            <Plus size={15} />
            Add expense
          </button>
        ) : (
          <button className="text-button dark" onClick={() => move("activity")}>
            View all <ArrowUpRight size={15} />
          </button>
        )}
      </div>
      {full && (
        <div className="activity-controls">
          <div className="filter-tabs">
            {["all", "income", "expense", "saving"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={filter === f ? "active" : ""}
                aria-pressed={filter === f}
              >
                {f === "all"
                  ? "All moves"
                  : f === "saving"
                    ? "Savings"
                    : f === "expense"
                      ? "Expenses"
                      : "Income"}
              </button>
            ))}
          </div>
          <label className="search-field">
            <Search size={16} />
            <input
              placeholder="Find a transaction"
              aria-label="Search transactions"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        </div>
      )}
      <div className="activity-list">
        {[...budget.transactions]
          .reverse()
          .filter(
            (t) =>
              !full ||
              ((filter === "all" || t.type === filter) &&
                `${t.title} ${t.category}`
                  .toLowerCase()
                  .includes(search.toLowerCase())),
          )
          .slice(0, full ? undefined : 4)
          .map((t) => (
            <div className="activity-row" key={t.id}>
              <span
                className={`item-icon ${t.type === "income" ? "lime-bg" : t.type === "saving" ? "peach" : "stone"}`}
              >
                {t.type === "income" ? (
                  <ArrowDownLeft size={19} />
                ) : t.type === "saving" ? (
                  <PiggyBank size={19} />
                ) : t.category === "Food" ? (
                  <Coffee size={18} />
                ) : t.category === "Transport" ? (
                  <Bus size={18} />
                ) : (
                  <ShoppingBag size={18} />
                )}
              </span>
              <div className="activity-title">
                {full && !t.linkedId && t.type !== "saving" ? (
                  <button
                    className="edit-entry"
                    onClick={() =>
                      open({
                        kind: t.type === "income" ? "income" : "expense",
                        item: t,
                      })
                    }
                    aria-label={`Edit ${t.title}`}
                  >
                    <b>{t.title}</b>
                    <Pencil size={12} />
                  </button>
                ) : (
                  <b>{t.title}</b>
                )}
                <small>
                  {t.category}
                  {t.essential ? " · Essential" : ""}
                </small>
              </div>
              <span className="transaction-day">Day {t.day}</span>
              <strong className={t.type === "income" ? "positive-text" : ""}>
                {t.type === "income" ? "+" : "−"}
                {money(t.amount)}
              </strong>
            </div>
          ))}
        {full &&
          !budget.transactions.some(
            (t) =>
              (filter === "all" || t.type === filter) &&
              `${t.title} ${t.category}`
                .toLowerCase()
                .includes(search.toLowerCase()),
          ) && (
            <div className="empty-state">
              <Search size={24} />
              <p>No moves match that search.</p>
            </div>
          )}
      </div>
    </section>
  );
}
export default ActivityPanel;
