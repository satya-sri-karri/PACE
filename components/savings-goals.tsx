import { ArrowUpRight, Plus, Target, ChevronRight } from "lucide-react";
import { money, savedFor } from "@/lib/finance";
import { GoalArt } from "@/components/pace-visuals";
import { usePace } from "@/hooks/use-pace";

export function SavingsGoals() {
  const { budget, m, open } = usePace();
  return (
    <section className="panel goals-panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">FOR FUTURE YOU</span>
          <h2>Little goals. Big wins.</h2>
        </div>
        <button
          className="icon-button bordered"
          onClick={() => open({ kind: "goal" })}
          aria-label="Add savings goal"
        >
          <Plus size={18} />
        </button>
      </div>
      {budget.goals.map((g) => {
        const saved = savedFor(budget, g.id),
          pct = Math.min(100, (saved / g.target) * 100);
        return (
          <div className="goal-item" key={g.id}>
            <div className="goal-intro">
              <div>
                <button
                  className="plain-title"
                  onClick={() => open({ kind: "goal", item: g })}
                >
                  {g.title}
                  <ChevronRight size={14} />
                </button>
                <p>
                  <strong>{money(saved)}</strong>
                  <span> of {money(g.target)} saved</span>
                </p>
              </div>
              <GoalArt />
            </div>
            <div className="progress-track">
              <span style={{ width: `${pct}%` }} />
            </div>
            <div className="goal-meta">
              <span>{Math.round(pct)}% there</span>
              <span>
                {money(g.planned)} planned · Day {g.dueDay}
              </span>
            </div>
            <div className="goal-bottom">
              <span
                className={`goal-status ${saved >= g.target ? "good" : m.goalFunding < 1 ? "bad" : ""}`}
              >
                <span className="status-dot" />
                {saved >= g.target
                  ? "Goal reached"
                  : m.goalFunding < 1
                    ? "Needs more room"
                    : "Your plan has room for this"}
              </span>
              <button
                className="text-button dark"
                disabled={saved >= g.target}
                onClick={() => open({ kind: "transfer", item: g })}
              >
                Add savings <ArrowUpRight size={15} />
              </button>
            </div>
          </div>
        );
      })}
      {!budget.goals.length && (
        <div className="empty-state">
          <Target size={24} />
          <p>Give your savings something to aim for.</p>
          <button
            className="button small"
            onClick={() => open({ kind: "goal" })}
          >
            Create a goal
          </button>
        </div>
      )}
    </section>
  );
}
export default SavingsGoals;
