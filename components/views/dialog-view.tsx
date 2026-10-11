import { TITLES } from "@/lib/navigation";
import {
  ArrowUpRight,
  ArrowRight,
  FlaskConical,
  Download,
  AlertTriangle,
} from "lucide-react";
import { money, savedFor } from "@/lib/finance";
import { Star, GoalArt, Dialog } from "@/components/pace-visuals";
import { usePace } from "@/hooks/use-pace";

export function AppDialog() {
  const {
    budget,
    resetPlan,
    modal,
    setModal,
    error,
    setError,
    fieldProps,
    supporting,
    m,
    after,
    apply,
    submit,
    exportPlan,
    importPlan,
    removeEntry,
  } = usePace();
  if (!modal) return null;
  return (
    <Dialog
      title={
        modal.kind === "day"
          ? `Day ${modal.day}, in focus.`
          : (modal.kind === "expense" || modal.kind === "income") && modal.item
            ? "Make the numbers right."
            : TITLES[modal.kind]
      }
      onClose={() => {
        setModal(null);
        setError("");
      }}
    >
      {[
        "income",
        "expense",
        "commitment",
        "goal",
        "transfer",
        "settings",
      ].includes(modal.kind) && (
        <form className="modal-form" onSubmit={submit}>
          {(modal.kind === "income" || modal.kind === "expense") && (
            <>
              <p className="form-intro">
                {modal.kind === "income"
                  ? "Only record money already received. It becomes available today."
                  : "Record a real expense. Your budget and forecast update together."}
              </p>
              <label>
                Description
                <input
                  name="title"
                  {...fieldProps("title")}
                  defaultValue={modal.item?.title}
                  required
                  maxLength={80}
                  placeholder={
                    modal.kind === "income"
                      ? "e.g. Freelance project"
                      : "e.g. Lunch with friends"
                  }
                />
              </label>
              <label>
                Amount (₹)
                <input
                  name="amount"
                  {...fieldProps("amount")}
                  defaultValue={
                    modal.item ? modal.item.amount / 100 : undefined
                  }
                  required
                  inputMode="decimal"
                  placeholder="0.00"
                  maxLength={12}
                />
              </label>
              {modal.kind === "expense" && (
                <>
                  <label>
                    Category
                    <select name="category" defaultValue={modal.item?.category}>
                      <option>Food</option>
                      <option>Transport</option>
                      <option>Shopping</option>
                      <option>Entertainment</option>
                      <option>Unexpected</option>
                      <option>Other</option>
                    </select>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="essential"
                      defaultChecked={modal.item?.essential}
                    />
                    Part of today’s expected essentials
                  </label>
                  <p className="field-help">
                    Reduces today’s remaining essentials forecast, so it isn’t
                    counted twice.
                  </p>
                </>
              )}
            </>
          )}
          {modal.kind === "commitment" && (
            <>
              <label>
                Name
                <input
                  name="title"
                  {...fieldProps("title")}
                  required
                  maxLength={80}
                  defaultValue={modal.item?.title}
                  placeholder="e.g. Internet bill"
                />
              </label>
              <div className="form-columns">
                <label>
                  Amount (₹)
                  <input
                    name="amount"
                    {...fieldProps("amount")}
                    required
                    inputMode="decimal"
                    defaultValue={
                      modal.item?.amount ? modal.item.amount / 100 : ""
                    }
                    placeholder="0.00"
                  />
                </label>
                <label>
                  Due day
                  <input
                    name="dueDay"
                    {...fieldProps("dueDay")}
                    type="number"
                    min={budget.day}
                    max="30"
                    required
                    defaultValue={Math.max(
                      budget.day,
                      modal.item?.dueDay ?? Math.min(30, budget.day + 3),
                    )}
                  />
                </label>
              </div>
              <label>
                Type
                <select name="kind" defaultValue={modal.item?.kind ?? "bill"}>
                  <option value="bill">One-time bill</option>
                  <option value="subscription">Subscription renewal</option>
                </select>
              </label>
              <p className="field-help">
                Reserves money in your plan. Your wallet changes when you mark
                it paid.
              </p>
            </>
          )}
          {modal.kind === "goal" && (
            <>
              <label>
                Goal name
                <input
                  name="title"
                  {...fieldProps("title")}
                  required
                  maxLength={80}
                  defaultValue={modal.item?.title}
                  placeholder="e.g. My next adventure"
                />
              </label>
              <div className="form-columns">
                <label>
                  Target (₹)
                  <input
                    name="target"
                    {...fieldProps("target")}
                    required
                    inputMode="decimal"
                    defaultValue={
                      modal.item?.target ? modal.item.target / 100 : ""
                    }
                    placeholder="1500"
                  />
                </label>
                <label>
                  Planned this month (₹)
                  <input
                    name="planned"
                    {...fieldProps("planned")}
                    required
                    inputMode="decimal"
                    defaultValue={
                      modal.item?.planned !== undefined
                        ? modal.item.planned / 100
                        : ""
                    }
                    placeholder="500"
                  />
                </label>
              </div>
              <label>
                Contribution day
                <input
                  name="dueDay"
                  {...fieldProps("dueDay")}
                  type="number"
                  min={budget.day}
                  max="30"
                  required
                  defaultValue={modal.item?.dueDay ?? 30}
                />
              </label>
              <p className="field-help">
                Planned contributions are reserved, not yet saved. Use “Add
                savings” to record an actual transfer.
              </p>
            </>
          )}
          {modal.kind === "transfer" && (
            <>
              <div className="transfer-goal">
                <GoalArt />
                <div>
                  <strong>{modal.item?.title}</strong>
                  <p>
                    {money(savedFor(budget, modal.item.id))} saved of{" "}
                    {money(modal.item.target)}
                  </p>
                </div>
              </div>
              <label>
                Move to savings (₹)
                <input
                  name="amount"
                  {...fieldProps("amount")}
                  inputMode="decimal"
                  required
                  defaultValue={
                    Math.min(
                      modal.item.planned ||
                        modal.item.target - savedFor(budget, modal.item.id),
                      modal.item.target - savedFor(budget, modal.item.id),
                    ) / 100
                  }
                />
              </label>
              <p className="field-help">
                Already reserved savings move out of your wallet without
                reducing your allowance a second time.
              </p>
            </>
          )}
          {modal.kind === "settings" && (
            <>
              <p className="form-intro">
                Forecasts follow these assumptions. They describe your plan, not
                your actual spending.
              </p>
              <label>
                Current day of your 30-day month
                <input
                  type="number"
                  name="day"
                  {...fieldProps("day")}
                  required
                  min={Math.max(...budget.transactions.map((t) => t.day), 1)}
                  max="30"
                  defaultValue={budget.day}
                />
              </label>
              <div className="form-columns">
                <label>
                  Daily essentials (₹)
                  <input
                    name="essentials"
                    {...fieldProps("essentials")}
                    inputMode="decimal"
                    required
                    defaultValue={budget.essentials / 100}
                  />
                </label>
                <label>
                  Safety buffer (₹)
                  <input
                    name="reserve"
                    {...fieldProps("reserve")}
                    inputMode="decimal"
                    required
                    defaultValue={budget.reserve / 100}
                  />
                </label>
              </div>
              <p className="field-help">
                Advancing the day does not invent real expenses. Record them in
                Activity.
              </p>
              <div className="backup-actions">
                <button
                  type="button"
                  className="button outline small"
                  onClick={exportPlan}
                >
                  <Download size={15} />
                  Export plan
                </button>
                <label className="import-label">
                  Restore backup
                  <input
                    type="file"
                    accept="application/json,.json"
                    onChange={(e) => importPlan(e.target.files?.[0])}
                  />
                </label>
              </div>
            </>
          )}
          {error && (
            <p
              id="form-error"
              className="form-error"
              role="alert"
              tabIndex={-1}
            >
              {error}
            </p>
          )}
          <div className="modal-actions">
            {(modal.kind === "income" || modal.kind === "expense") &&
              modal.item && (
                <button
                  type="button"
                  className="text-button danger-text"
                  onClick={removeEntry}
                >
                  Remove entry
                </button>
              )}
            <button
              type="button"
              className="button outline"
              onClick={() => setModal(null)}
            >
              Cancel
            </button>
            <button className="button">
              {modal.kind === "settings"
                ? "Update plan"
                : modal.kind === "transfer"
                  ? "Record transfer"
                  : "Save to my plan"}
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      )}
      {modal.kind === "health" && (
        <div className="modal-content">
          <div className="health-explainer">
            <strong>
              {m.health}
              <small>/100</small>
            </strong>
            <span className={`badge ${m.risk.toLowerCase()}`}>
              {m.risk} risk
            </span>
          </div>
          <p>{m.riskReason}</p>
          {[
            {
              name: "Cash cushion",
              value: m.factors.liquidity,
              max: 50,
              description:
                "Lowest projected wallet, after your buffer, compared with a week of essentials.",
            },
            {
              name: "Essentials coverage",
              value: m.factors.coverage,
              max: 30,
              description:
                "Daily allowance compared with your configured essentials.",
            },
            {
              name: "Goal affordability",
              value: m.factors.goals,
              max: 20,
              description:
                "Room for remaining targets after bills, essentials, and your buffer.",
            },
          ].map((f) => (
            <div className="health-factor" key={f.name}>
              <div>
                <b>{f.name}</b>
                <strong>
                  {f.value.toFixed(1)} / {f.max}
                </strong>
              </div>
              <div className="progress-track">
                <span style={{ width: `${(f.value / f.max) * 100}%` }} />
              </div>
              <small>{f.description}</small>
            </div>
          ))}
          <p className="muted-note">
            A planning indicator, not a credit score. High risk means negative
            projected cash or insufficient money for remaining essentials and
            the buffer. Watch means less than a week of cushion.
          </p>
        </div>
      )}
      {modal.kind === "reset" && (
        <div className="modal-content">
          <p>
            This replaces your plan and clears undo history. Export a backup in
            Plan settings to keep a copy.
          </p>
          <div className="reset-options">
            <button
              onClick={() => {
                resetPlan(true);
              }}
            >
              <span className="item-icon lime-bg">
                <Star />
              </span>
              <div>
                <strong>Start a fresh month</strong>
                <small>Day 1 · ₹10,000 · A clean ledger</small>
              </div>
              <ArrowUpRight size={20} />
            </button>
            <button
              onClick={() => {
                resetPlan();
              }}
            >
              <span className="item-icon peach">
                <FlaskConical size={20} />
              </span>
              <div>
                <strong>Load the Day 11 demo</strong>
                <small>Sample activity · ₹7,400 in your wallet</small>
              </div>
              <ArrowUpRight size={20} />
            </button>
          </div>
        </div>
      )}
      {modal.kind === "confirm" && after && (
        <div className="modal-content">
          <div className="risk-callout">
            <AlertTriangle />
            <div>
              <strong>
                {supporting.some((d) => d.type === "income")
                  ? "Confirm the whole combination."
                  : "This puts pressure on your plan."}
              </strong>
              <p>{after.riskReason}</p>
            </div>
          </div>
          <p>
            Your allowance becomes <b>{money(after.allowance, true)}</b> and
            month-end forecast becomes <b>{money(after.monthEnd)}</b>. This
            records a decision; it does not make a real payment.
          </p>
          {modal.kind === "confirm" &&
            supporting.some((d) => d.type === "income") && (
              <p className="income-confirmation">
                This combination records extra income. Continue only if that
                money has actually arrived. Otherwise, keep it as a preview.
              </p>
            )}
          {error && (
            <p
              id="form-error"
              className="form-error"
              role="alert"
              tabIndex={-1}
            >
              {error}
            </p>
          )}
          <div className="modal-actions">
            <button className="button outline" onClick={() => setModal(null)}>
              Keep exploring
            </button>
            <button className="button" onClick={apply}>
              Record anyway
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
      {modal.kind === "day" && (
        <div className="modal-content">
          <span className="badge neutral">
            {modal.day < budget.day
              ? "Recorded history"
              : modal.day === budget.day
                ? "Today"
                : "Future plan"}
          </span>
          {budget.transactions
            .filter((t) => t.day === modal.day)
            .map((t) => (
              <div className="day-detail-row" key={t.id}>
                <span>{t.title}</span>
                <b>
                  {t.type === "income" ? "+" : "−"}
                  {money(t.amount)}
                </b>
              </div>
            ))}
          {budget.commitments
            .filter((c) => c.dueDay === modal.day)
            .map((c) => (
              <div className="day-detail-row" key={c.id}>
                <span>
                  {c.title}
                  <small>{c.status}</small>
                </span>
                <b>{money(c.amount)}</b>
              </div>
            ))}
          {budget.goals
            .filter((g) => g.dueDay === modal.day && g.planned > 0)
            .map((g) => (
              <div className="day-detail-row" key={g.id}>
                <span>Planned savings: {g.title}</span>
                <b>{money(g.planned)}</b>
              </div>
            ))}
          {modal.day >= budget.day && (
            <div className="day-detail-row">
              <span>Projected end-of-day wallet</span>
              <b>
                {money(
                  m.forecast.filter((p) => p.day === modal.day).at(-1)
                    ?.balance ?? m.balance,
                )}
              </b>
            </div>
          )}
          <p className="muted-note">
            Future balances include remaining essentials and unpaid items.
            Overdue payments are included today.
          </p>
        </div>
      )}
      {modal.kind === "help" && (
        <div className="modal-content help-content">
          <div className="help-brand">
            <Star />
            Small budget. Big possibilities.
          </div>
          <p>
            Pace starts with ₹10,000 and a 30-day plan. Day 11 includes sample
            spending; reset to Day 1 for a clean start.
          </p>
          <h3>What can I spend each day?</h3>
          <div className="formula-box">
            (Wallet − unpaid bills − planned savings − buffer)
            <br />
            <strong>÷ days remaining</strong>
          </div>
          <p>
            Your allowance includes essentials. It isn’t extra money on top of
            your essentials estimate.
          </p>
          <h3>Try before you commit.</h3>
          <p>
            What-if decisions update a separate preview. Apply records the
            change; discard leaves your actual plan untouched. Undo restores the
            previous plan.
          </p>
          <h3>Keep the forecast honest.</h3>
          <p>
            Planned savings differ from money already saved. Future essentials
            are estimates. Income is available only when received. No bank
            connection or real payment is involved.
          </p>
          <p className="muted-note">
            Data stays in this browser. Export a backup in Plan settings to keep
            a copy.
          </p>
        </div>
      )}
    </Dialog>
  );
}
export default AppDialog;
