import {
  ArrowUpRight,
  Music2,
  ShoppingBag,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { money } from "@/lib/finance";
import { Forecast } from "@/components/pace-visuals";
import { usePace } from "@/hooks/use-pace";
import { DecisionLab } from "@/components/decision-lab";
export function LabView() {
  const { budget, m, candidate, after, activeSubscriptions, preset } =
    usePace();
  return (
    <>
      <div className="scenario-grid">
        <button onClick={() => preset("purchase", "1800", "Weekend shopping")}>
          <ShoppingBag />
          <span>
            That weekend plan<strong>₹1,800 purchase</strong>
          </span>
          <ArrowUpRight size={18} />
        </button>
        <button onClick={() => preset("emergency", "600", "Unexpected repair")}>
          <AlertTriangle />
          <span>
            A plot twist<strong>₹600 emergency</strong>
          </span>
          <ArrowUpRight size={18} />
        </button>
        <button onClick={() => preset("income", "1000", "Freelance income")}>
          <TrendingUp />
          <span>
            A little extra<strong>₹1,000 income</strong>
          </span>
          <ArrowUpRight size={18} />
        </button>
        <button
          disabled={!activeSubscriptions.length}
          onClick={() =>
            activeSubscriptions[0] &&
            preset(
              "cancel",
              "0",
              activeSubscriptions[0].title,
              activeSubscriptions[0].id,
            )
          }
        >
          <Music2 />
          <span>
            One less renewal<strong>Trim a subscription</strong>
          </span>
          <ArrowUpRight size={18} />
        </button>
      </div>
      <div className="lab-page-grid">
        <DecisionLab />
        <div>
          <Forecast budget={budget} candidate={candidate} />
          <section className="panel comparison-panel">
            <div className="section-heading">
              <div>
                <span className="eyebrow">A DECISION, IN CONTEXT</span>
                <h2>The whole ripple.</h2>
              </div>
              <span className="badge neutral">
                {after ? "Live preview" : "Current plan"}
              </span>
            </div>
            <div className="comparison-grid">
              {[
                {
                  label: "Daily allowance",
                  value: money((after ?? m).allowance, true),
                  previous: money(m.allowance, true),
                },
                {
                  label: "Wallet balance",
                  value: money((after ?? m).balance),
                  previous: money(m.balance),
                },
                {
                  label: "Month-end forecast",
                  value: money((after ?? m).monthEnd),
                  previous: money(m.monthEnd),
                },
                {
                  label: "Actual savings",
                  value: money(m.saved),
                  previous: money(m.saved),
                },
                {
                  label: "Planning health",
                  value: `${(after ?? m).health}/100`,
                  previous: `${m.health}/100`,
                },
                {
                  label: "Financial risk",
                  value: (after ?? m).risk,
                  previous: m.risk,
                },
              ].map((r) => (
                <div key={r.label}>
                  <span>{r.label}</span>
                  <strong>{r.value}</strong>
                  {after && <small>Before: {r.previous}</small>}
                </div>
              ))}
            </div>
            <p className="muted-note">
              A preview never moves actual savings. Goal affordability changes
              when future cash has less room.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
export default LabView;
