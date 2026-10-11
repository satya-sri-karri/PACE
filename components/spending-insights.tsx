import { ArrowUpRight, CircleHelp } from "lucide-react";
import { money } from "@/lib/finance";
import { spendingInsights } from "@/lib/insights";
import { usePace } from "@/hooks/use-pace";

export function SpendingInsights() {
  const { budget, m, open } = usePace();
  const insights = spendingInsights(budget);
  return (
    <section className="panel spending-panel" aria-labelledby="spending-title">
      <div className="section-heading">
        <div>
          <span className="eyebrow">KNOW WHERE IT GOES</span>
          <h2 id="spending-title">Small spends add up.</h2>
        </div>
        <span className="badge neutral">Through Day {budget.day}</span>
      </div>
      <div className="spending-grid">
        <div className="category-breakdown">
          <div className="category-total">
            <strong>{money(insights.total)}</strong>
            <span>Total expenses · savings excluded</span>
          </div>
          {insights.categories.map((category, index) => (
            <div className="category-row" key={category.name}>
              <div>
                <span>
                  <i className={`category-dot category-${index % 5}`} />
                  {category.name}
                </span>
                <b>
                  {money(category.amount)}{" "}
                  <small>{Math.round(category.percentage)}%</small>
                </b>
              </div>
              <div className="category-track" aria-hidden="true">
                <span
                  className={`category-${index % 5}`}
                  style={{ width: `${category.percentage}%` }}
                />
              </div>
            </div>
          ))}
          {!insights.categories.length && (
            <p className="muted-note">
              Your first recorded expense will appear here.
            </p>
          )}
        </div>
        <div className="spending-outlook">
          <span className="eyebrow">TWO WAYS TO LOOK AHEAD</span>
          <div>
            <span>Essentials-based forecast</span>
            <strong>{money(m.monthEnd)}</strong>
          </div>
          <p>
            Uses your {money(budget.essentials)}/day estimate, unpaid
            commitments and planned savings.
          </p>
          <div>
            <span>If your everyday pace continues</span>
            <strong className={insights.trendEnd < 0 ? "danger-text" : ""}>
              {money(insights.trendEnd)}
            </strong>
          </div>
          <p>
            Uses {money(insights.average, true)}/day in recorded everyday
            expenses through Day {budget.day}. Scheduled bill payments are
            excluded from this average.
          </p>
          <span className="forecast-assumption">
            <CircleHelp size={15} />
            Both are estimates. Today’s recorded expenses are counted once.
          </span>
          <button
            className="text-button dark"
            onClick={() => open({ kind: "settings" })}
          >
            Review assumptions <ArrowUpRight size={15} />
          </button>
        </div>
      </div>
    </section>
  );
}
