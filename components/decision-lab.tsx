import { ArrowUpRight, FlaskConical, ShieldCheck, Check } from "lucide-react";
import { money } from "@/lib/finance";
import { usePace } from "@/hooks/use-pace";

export function DecisionLab() {
  const {
    modal,
    error,
    setError,
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
    m,
    after,
    activeSubscriptions,
    open,
    preview,
    apply,
  } = usePace();
  return (
    <section className="lab-panel" id="decision-lab">
      <div className="section-heading">
        <div>
          <span className="eyebrow">TRY IT BEFORE YOU BUY IT</span>
          <h2>Would it fit?</h2>
        </div>
        <FlaskConical size={26} strokeWidth={1.5} />
      </div>
      <p className="lab-intro">A little what-if goes a long way.</p>
      <form onSubmit={preview}>
        <div className="decision-types">
          {(["purchase", "income", "emergency", "cancel"] as const).map((t) => (
            <button
              type="button"
              key={t}
              className={type === t ? "selected" : ""}
              aria-pressed={type === t}
              onClick={() => {
                setType(t);
                setDecision(null);
                setError("");
              }}
            >
              {t === "purchase"
                ? "Purchase"
                : t === "income"
                  ? "Income"
                  : t === "emergency"
                    ? "Emergency"
                    : "Renewal"}
            </button>
          ))}
        </div>
        {type === "cancel" ? (
          <label className="lab-field">
            Upcoming renewal
            <select
              value={
                activeSubscriptions.some((s) => s.id === subscriptionId)
                  ? subscriptionId
                  : (activeSubscriptions[0]?.id ?? "")
              }
              onChange={(e) => {
                setSubscriptionId(e.target.value);
                setDecision(null);
              }}
            >
              <option value="">Choose a subscription</option>
              {activeSubscriptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} · {money(s.amount)}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <>
            <label className="lab-field">
              {type === "income"
                ? "Money received"
                : type === "emergency"
                  ? "Unexpected cost"
                  : "Price tag"}
              <div className="amount-input">
                <span>₹</span>
                <input
                  aria-label="Decision amount in rupees"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setDecision(null);
                  }}
                  required
                  maxLength={12}
                />
                <span className="inr">INR</span>
              </div>
            </label>
            <input
              className="price-slider"
              aria-label="Adjust decision amount"
              type="range"
              min="50"
              max="5000"
              step="50"
              value={Math.min(5000, Math.max(50, Number(amount) || 50))}
              onChange={(e) => {
                setAmount(e.target.value);
                setDecision(null);
              }}
            />
            <div className="slider-labels">
              <span>₹50</span>
              <span>₹5,000</span>
            </div>
            <label className="lab-field name-field">
              What’s it for?
              <input
                value={decisionTitle}
                maxLength={80}
                onChange={(e) => {
                  setDecisionTitle(e.target.value);
                  setDecision(null);
                }}
                placeholder="e.g. A weekend plan"
              />
            </label>
          </>
        )}
        {error && !modal && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button
          className="button lime full"
          disabled={type === "cancel" && !activeSubscriptions.length}
        >
          Preview impact <ArrowUpRight size={18} />
        </button>
      </form>
      {after ? (
        <div className="impact-results" aria-live="polite">
          <div className="impact-heading">
            <span>THE RIPPLE EFFECT</span>
            <span className={`badge ${after.risk.toLowerCase()}`}>
              {after.risk} risk
            </span>
          </div>
          {[
            {
              label: "Daily allowance",
              before: money(m.allowance, true),
              after: money(after.allowance, true),
            },
            {
              label: "Wallet balance",
              before: money(m.balance),
              after: money(after.balance),
            },
            {
              label: "Month-end forecast",
              before: money(m.monthEnd),
              after: money(after.monthEnd),
            },
            {
              label: "Planning health",
              before: `${m.health}`,
              after: `${after.health}/100`,
            },
            {
              label: "Goal affordability",
              before: money(m.goalAffordable),
              after: money(after.goalAffordable),
            },
          ].map((r) => (
            <div className="impact-row" key={r.label}>
              <span>{r.label}</span>
              <div>
                <del>{r.before}</del>
                <strong>{r.after}</strong>
              </div>
            </div>
          ))}
          <p className="impact-explanation">
            {after.riskReason}{" "}
            {after.goalFunding < 1
              ? "Your savings target also needs more room."
              : "Your savings target remains affordable."}
          </p>
          <div className="impact-actions">
            <button
              className="button light"
              onClick={() =>
                after.risk === "High" &&
                decision?.type !== "income" &&
                decision?.type !== "cancel"
                  ? open({ kind: "confirm" })
                  : apply()
              }
            >
              Apply to my plan <Check size={15} />
            </button>
            <button
              className="text-button"
              onClick={() => {
                setDecision(null);
                setError("");
              }}
            >
              Discard
            </button>
          </div>
        </div>
      ) : (
        <div className="lab-footnote">
          <ShieldCheck size={15} />
          <span>Just a preview. Your money stays put.</span>
        </div>
      )}
    </section>
  );
}
export default DecisionLab;
