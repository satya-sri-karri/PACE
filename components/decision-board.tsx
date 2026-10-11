import { X, ArrowUpRight, BookmarkPlus, ShieldCheck } from "lucide-react";
import { useMemo } from "react";
import { calculate, money, simulate } from "@/lib/finance";
import { recoveryOptions } from "@/lib/insights";
import { usePace } from "@/hooks/use-pace";

export function DecisionBoard({ mode }: { mode: "recovery" | "comparison" }) {
  const {
    budget,
    m,
    candidate,
    after,
    decision,
    supporting,
    decisions,
    scenarios,
    setScenarios,
    addSupport,
    pinScenario,
    loadScenario,
    preset,
  } = usePace();
  const current = after ?? m;
  const outcomes = useMemo(
    () => scenarios.map((s) => calculate(simulate(budget, s.decisions))),
    [budget, scenarios],
  );
  const options = recoveryOptions(candidate ?? budget);
  return (
    <>
      {mode === "recovery" && (
        <section
          className="panel recovery-panel"
          aria-labelledby="recovery-title"
        >
          <div className="section-heading">
            <div>
              <span className="eyebrow">FIND A WAY THAT FITS</span>
              <h2 id="recovery-title">A little room to move.</h2>
            </div>
            <ShieldCheck size={22} />
          </div>
          <div className="recovery-summary">
            <div>
              <span>
                {current.recoveryGap > 0
                  ? "Needed to protect your buffer"
                  : "Room for a one-off extra"}
              </span>
              <strong>{money(current.recoveryGap || current.flexible)}</strong>
            </div>
            <p>
              {current.recoveryGap > 0
                ? "Cover this gap to keep essentials, scheduled savings and your safety buffer intact."
                : "After every remaining essential, bill and planned saving. Based on your estimates, not a guarantee."}
            </p>
          </div>
          {supporting.length > 0 && (
            <p className="bundle-note">
              Your preview now combines {decisions.length} decisions. All
              effects below include the whole combination.
            </p>
          )}
          <div className="recovery-options">
            {options.map((option) => (
              <button
                key={`${option.decision.type}-${option.decision.subscriptionId ?? "income"}`}
                disabled={decisions.length >= 4}
                onClick={() =>
                  decision
                    ? addSupport(option.decision)
                    : preset(
                        option.decision.type,
                        String(option.decision.amount / 100),
                        option.decision.title,
                        option.decision.subscriptionId,
                      )
                }
              >
                <span>
                  <b>{option.title}</b>
                  <small>{option.description}</small>
                </span>
                <ArrowUpRight size={18} />
              </button>
            ))}
            {decision?.type === "purchase" &&
              m.flexible > 0 &&
              decision.amount > m.flexible && (
                <button
                  onClick={() =>
                    preset(
                      "purchase",
                      (Math.floor(m.flexible) / 100).toFixed(2),
                      "A smaller version of my plan",
                    )
                  }
                >
                  <span>
                    <b>Try a {money(m.flexible)} version</b>
                    <small>
                      Keep your original commitments and protect the buffer.
                    </small>
                  </span>
                  <ArrowUpRight size={18} />
                </button>
              )}
          </div>
        </section>
      )}
      {mode === "comparison" && (
        <section
          className="panel scenario-board"
          aria-labelledby="scenario-board-title"
        >
          <div className="section-heading">
            <div>
              <span className="eyebrow">SIDE BY SIDE, BEFORE YOU DECIDE</span>
              <h2 id="scenario-board-title">Your options, on the table.</h2>
            </div>
            <span className="badge neutral">{scenarios.length} / 3 pinned</span>
          </div>
          {scenarios.length === 0 ? (
            <div className="comparison-empty">
              <BookmarkPlus size={25} />
              <p>
                Preview a decision, pin it, then try another. Compare up to
                three options against your current plan.
              </p>
            </div>
          ) : (
            <div
              className="scenario-table-wrap"
              role="region"
              aria-label="Comparison of pinned financial decisions"
              tabIndex={0}
            >
              <table className="scenario-table">
                <caption>
                  Each option is calculated from your current plan. Pinned
                  options stay separate from your ledger.
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Outcome</th>
                    <th scope="col">Current plan</th>
                    {scenarios.map((s) => (
                      <th scope="col" key={s.id}>
                        <span>{s.title}</span>
                        {s.decisions.length > 1 && (
                          <small>{s.decisions.length} decisions together</small>
                        )}
                        <button
                          aria-label={`Remove ${s.title} comparison`}
                          onClick={() =>
                            setScenarios((all) =>
                              all.filter((item) => item.id !== s.id),
                            )
                          }
                        >
                          <X size={14} />
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      label: "Wallet",
                      value: (v: ReturnType<typeof calculate>) =>
                        money(v.balance),
                    },
                    {
                      label: "Daily allowance",
                      value: (v: ReturnType<typeof calculate>) =>
                        money(v.allowance, true),
                    },
                    {
                      label: "Month-end",
                      value: (v: ReturnType<typeof calculate>) =>
                        money(v.monthEnd),
                    },
                    {
                      label: "Goal affordability",
                      value: (v: ReturnType<typeof calculate>) =>
                        money(v.goalAffordable),
                    },
                    {
                      label: "Health",
                      value: (v: ReturnType<typeof calculate>) =>
                        `${v.health}/100`,
                    },
                    {
                      label: "Risk",
                      value: (v: ReturnType<typeof calculate>) => v.risk,
                    },
                  ].map((row) => (
                    <tr key={row.label}>
                      <th scope="row">{row.label}</th>
                      <td>{row.value(m)}</td>
                      {scenarios.map((s, i) => (
                        <td key={s.id}>{row.value(outcomes[i] ?? m)}</td>
                      ))}
                    </tr>
                  ))}
                  <tr>
                    <th scope="row">Explore</th>
                    <td>Live ledger</td>
                    {scenarios.map((s) => (
                      <td key={s.id}>
                        <button
                          className="text-button dark"
                          onClick={() => loadScenario(s)}
                        >
                          Load option <ArrowUpRight size={13} />
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          <button
            className="button outline small"
            disabled={!decision}
            onClick={pinScenario}
          >
            <BookmarkPlus size={15} />
            Pin this preview
          </button>
        </section>
      )}
    </>
  );
}
