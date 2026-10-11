import { Plus, Music2, Cloud, House, Wifi, Check } from "lucide-react";
import { money, payBill } from "@/lib/finance";
import { usePace } from "@/hooks/use-pace";

export function BillsPanel() {
  const { budget, view, m, open, commit, safe, preset, move } = usePace();
  return (
    <section className="panel commitments-panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">ALREADY ON THE CALENDAR</span>
          <h2>Coming up.</h2>
        </div>
        <button
          className="icon-button bordered"
          onClick={() => open({ kind: "commitment" })}
          aria-label="Add bill or subscription"
        >
          <Plus size={18} />
        </button>
      </div>
      <div className="commitment-list">
        {budget.commitments
          .filter((c) => c.status === "pending")
          .sort((a, b) => a.dueDay - b.dueDay)
          .map((c) => (
            <div className="commitment-row" key={c.id}>
              <span
                className={`item-icon ${c.kind === "subscription" ? "peach" : "stone"}`}
              >
                {c.kind === "subscription" ? (
                  c.id === "cloud" ? (
                    <Cloud size={18} />
                  ) : (
                    <Music2 size={18} />
                  )
                ) : c.id === "room" ? (
                  <House size={18} />
                ) : (
                  <Wifi size={18} />
                )}
              </span>
              <button
                className="item-title"
                onClick={() => open({ kind: "commitment", item: c })}
              >
                <b>{c.title}</b>
                <small>
                  {c.dueDay < budget.day ? "Overdue · " : ""}Day {c.dueDay} ·{" "}
                  {c.kind === "subscription" ? "Renewal" : "Bill"}
                </small>
              </button>
              <div className="item-amount">
                <b>{money(c.amount)}</b>
                <div className="row-actions">
                  <button
                    onClick={() =>
                      safe(() =>
                        commit(
                          payBill(budget, c.id),
                          "Payment recorded. This bill won’t be counted twice.",
                        ),
                      )
                    }
                  >
                    Mark paid
                  </button>
                  {view === "plan" && c.kind === "subscription" && (
                    <button
                      onClick={() => {
                        preset("cancel", "0", c.title, c.id);
                        move("lab");
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        {!budget.commitments.some((c) => c.status === "pending") && (
          <div className="empty-state">
            <Check size={24} />
            <p>All clear. No upcoming payments.</p>
          </div>
        )}
      </div>
      <div className="panel-bottom">
        <span>Total reserved</span>
        <strong>{money(m.commitments)}</strong>
      </div>
    </section>
  );
}
export default BillsPanel;
