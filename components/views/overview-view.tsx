import { ArrowUpRight, ArrowRight, Wallet, Sparkles, Info } from "lucide-react";
import { money } from "@/lib/finance";
import { CoinArt, Forecast } from "@/components/pace-visuals";
import { usePace } from "@/hooks/use-pace";
import { DecisionLab } from "@/components/decision-lab";
import { BillsPanel } from "@/components/bills-panel";
import { SavingsGoals } from "@/components/savings-goals";
import { ActivityPanel } from "@/components/activity-panel";
export function OverviewView() {
  const { budget, m, candidate, activeSubscriptions, open, preset, move } =
    usePace();
  return (
    <>
      <div className="hero-grid">
        <section className="allowance-card">
          <div className="allowance-content">
            <div className="eyebrow">
              YOUR DAILY SPENDING PACE
              <button
                className="info-dot"
                onClick={() => open({ kind: "help" })}
                aria-label="How daily allowance is calculated"
              >
                <Info size={13} />
              </button>
            </div>
            <div
              className={
                m.allowance / 100 >= 1000
                  ? "allowance-number long"
                  : "allowance-number"
              }
              key={m.allowance}
            >
              <span>₹</span>
              {new Intl.NumberFormat("en-IN", {
                maximumFractionDigits: 2,
              }).format(m.allowance / 100)}
              <small>/ day</small>
            </div>
            <p>After bills, savings & your safety buffer.</p>
            <div className="allowance-bottom">
              <span className="badge cream">
                <span className="status-dot" />
                {m.risk === "High"
                  ? "Time to adjust"
                  : m.risk === "Low"
                    ? "Room to breathe"
                    : "Keep a little cushion"}
              </span>
              <span>
                {m.days} days to go <ArrowRight size={14} />
              </span>
            </div>
          </div>
          <CoinArt />
          <span className="hand-note">
            make it last,
            <br />
            make it count.
          </span>
        </section>
        <section className="wallet-card panel">
          <div className="card-eyebrow">
            <span className="eyebrow">IN YOUR POCKET</span>
            <Wallet size={18} />
          </div>
          <strong
            className={
              m.balance / 100 >= 100000 ? "wallet-number long" : "wallet-number"
            }
          >
            {money(m.balance)}
          </strong>
          <p>
            <span>{money(m.spent)}</span> spent · <span>{money(m.income)}</span>{" "}
            received
          </p>
          <div
            className="allocation-bar"
            role="img"
            aria-label={`Reserved: ${money(m.commitments)} bills, ${money(m.savingsPlan)} savings, ${money(budget.reserve)} buffer; ${money(Math.max(0, m.free))} available`}
          >
            {[
              { value: m.commitments, cls: "allocation-bills" },
              { value: m.savingsPlan, cls: "allocation-savings" },
              { value: budget.reserve, cls: "allocation-buffer" },
              { value: Math.max(0, m.free), cls: "allocation-free" },
            ].map((s) => (
              <span
                key={s.cls}
                className={s.cls}
                style={{
                  width: `${(s.value / Math.max(1, m.commitments + m.savingsPlan + budget.reserve + Math.max(0, m.free))) * 100}%`,
                }}
              />
            ))}
          </div>
          <div className="allocation-legend">
            <span>
              <i className="allocation-bills" />
              Bills <b>{money(m.commitments)}</b>
            </span>
            <span>
              <i className="allocation-savings" />
              Savings <b>{money(m.savingsPlan)}</b>
            </span>
            <span>
              <i className="allocation-buffer" />
              Buffer <b>{money(budget.reserve)}</b>
            </span>
            <span>
              <i className="allocation-free" />
              Available <b>{money(Math.max(0, m.free))}</b>
            </span>
          </div>
          {m.shortfall > 0 && (
            <small className="danger-text">
              Reserved plan shortfall: {money(m.shortfall)}
            </small>
          )}
        </section>
        <button
          className="health-card"
          onClick={() => open({ kind: "health" })}
        >
          <div className="card-eyebrow">
            <span className="eyebrow">PLANNING HEALTH</span>
            <ArrowUpRight size={19} />
          </div>
          <div className="health-dial">
            <svg viewBox="0 0 160 105" aria-hidden="true">
              <path
                d="M18 82a62 62 0 0 1 124 0"
                fill="none"
                stroke="#b9cd8a"
                strokeWidth="9"
                strokeLinecap="round"
              />
              <path
                d="M18 82a62 62 0 0 1 124 0"
                fill="none"
                stroke="#2b3523"
                strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray={`${(m.health / 100) * 195} 195`}
              />
            </svg>
            <div>
              <strong>{m.health}</strong>
              <span>/ 100</span>
            </div>
          </div>
          <span className={`badge ${m.risk.toLowerCase()}`}>
            <span className="status-dot" />
            {m.risk === "Low"
              ? "Looking good"
              : m.risk === "Watch"
                ? "A little watchful"
                : "Needs some care"}
          </span>
          <small>
            See what’s behind your score <ArrowRight size={13} />
          </small>
        </button>
      </div>
      <div className="middle-grid">
        <Forecast budget={budget} candidate={candidate} />
        <DecisionLab />
      </div>
      <div className="insight-strip">
        <span className="insight-icon">
          <Sparkles size={21} />
        </span>
        <div>
          <strong>
            {m.risk === "High"
              ? "Let’s give your plan a little breathing room."
              : m.risk === "Watch"
                ? "Your money has a plan. A little cushion would help."
                : "You’re making room for the things that matter."}
          </strong>
          <p>{m.riskReason}</p>
        </div>
        <button
          className="text-button dark"
          onClick={() => {
            if (activeSubscriptions[0])
              preset(
                "cancel",
                "0",
                activeSubscriptions[0].title,
                activeSubscriptions[0].id,
              );
            else preset("income", "1000", "Extra income");
            move("lab");
          }}
        >
          Explore a small change <ArrowUpRight size={17} />
        </button>
      </div>
      <div className="bottom-grid">
        <BillsPanel />
        <SavingsGoals />
      </div>
      <ActivityPanel />
    </>
  );
}
export default OverviewView;
