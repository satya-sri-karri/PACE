import {
  ArrowUpRight,
  Plus,
  ReceiptText,
  Target,
  Music2,
  Cloud,
  Check,
  SlidersHorizontal,
} from "lucide-react";
import { money } from "@/lib/finance";
import { usePace } from "@/hooks/use-pace";
import { BillsPanel } from "@/components/bills-panel";
import { SavingsGoals } from "@/components/savings-goals";
export function PlanView() {
  const { budget, m, open, preset, move } = usePace();
  return (
    <>
      <section className="panel calendar-panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">ONE MONTH AT A TIME</span>
            <h2>30 days. One good plan.</h2>
          </div>
          <button
            className="button small outline"
            onClick={() => open({ kind: "settings" })}
          >
            <SlidersHorizontal size={15} />
            Adjust assumptions
          </button>
        </div>
        <div className="month-map">
          {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
            const bill = budget.commitments.some(
                (c) => c.dueDay === day && c.status === "pending",
              ),
              goal = budget.goals.some(
                (g) => g.dueDay === day && g.planned > 0,
              ),
              p = m.forecast.filter((p) => p.day === day).at(-1);
            return (
              <button
                key={day}
                className={`${day < budget.day ? "past" : ""} ${day === budget.day ? "today" : ""} ${bill ? "has-bill" : ""} ${p && p.balance < 0 ? "negative-day" : ""}`}
                onClick={() => open({ kind: "day", day })}
                aria-label={`Day ${day}${day === budget.day ? ", today" : ""}${bill ? ", payment due" : ""}${goal ? ", savings due" : ""}`}
              >
                <span>{day}</span>
                {bill ? (
                  <ReceiptText size={14} />
                ) : goal ? (
                  <Target size={14} />
                ) : day === budget.day ? (
                  <span className="today-mark" />
                ) : null}
              </button>
            );
          })}
        </div>
        <div className="calendar-key">
          <span>
            <i className="orange-dot" />
            Today
          </span>
          <span>
            <ReceiptText size={13} />
            Upcoming payment
          </span>
          <span>
            <Target size={13} />
            Savings
          </span>
          <span>Tap a day for details</span>
        </div>
      </section>
      <div className="bottom-grid">
        <BillsPanel />
        <SavingsGoals />
      </div>
      <section className="panel subscriptions-panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">THE LITTLE RECURRING THINGS</span>
            <h2>Subscriptions, under control.</h2>
          </div>
          <button
            className="button small outline"
            onClick={() =>
              open({
                kind: "commitment",
                item: {
                  id: "",
                  title: "",
                  amount: 0,
                  dueDay: Math.max(budget.day, 22),
                  kind: "subscription",
                  status: "pending",
                },
              })
            }
          >
            <Plus size={15} />
            Add renewal
          </button>
        </div>
        <div className="subscription-cards">
          {budget.commitments
            .filter((c) => c.kind === "subscription")
            .map((c) => (
              <div key={c.id} className="subscription-card">
                <span className="item-icon peach">
                  {c.id === "cloud" ? (
                    <Cloud size={20} />
                  ) : (
                    <Music2 size={20} />
                  )}
                </span>
                <h3>{c.title}</h3>
                <strong>
                  {money(c.amount)}
                  <small> / month</small>
                </strong>
                <p>
                  Day {c.dueDay} ·{" "}
                  {c.status === "pending"
                    ? "Upcoming renewal"
                    : c.status === "paid"
                      ? "Paid this month"
                      : "Renewal cancelled"}
                </p>
                {c.status === "pending" ? (
                  <button
                    className="text-button dark"
                    onClick={() => {
                      preset("cancel", "0", c.title, c.id);
                      move("lab");
                    }}
                  >
                    Preview cancellation <ArrowUpRight size={16} />
                  </button>
                ) : (
                  <span className="badge neutral">
                    <Check size={12} />
                    {c.status === "paid" ? "Paid" : "Cancelled"}
                  </span>
                )}
              </div>
            ))}
        </div>
        <p className="muted-note">
          Cancelling frees a future renewal’s reserved amount. Past payments are
          never refunded by this app.
        </p>
      </section>
    </>
  );
}
export default PlanView;
