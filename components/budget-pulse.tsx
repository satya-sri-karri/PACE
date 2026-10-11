import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { money } from "@/lib/finance";
import { usePace } from "@/hooks/use-pace";

export function BudgetPulse() {
  const { budget, m, move } = usePace();
  return (
    <section className="budget-pulse" aria-label="Your plan at a glance">
      <div>
        <ShieldCheck size={19} />
        <span>
          Safety buffer at month-end
          <strong>
            {money(m.bufferRemaining)} <small>of {money(budget.reserve)}</small>
          </strong>
        </span>
      </div>
      <div>
        <span>
          Essentials still needed today
          <strong>{money(m.essentialsLeftToday)}</strong>
        </span>
      </div>
      <div>
        <span>
          {m.recoveryGap > 0
            ? "Gap to protect your plan"
            : "Room for a one-off extra"}
          <strong className={m.recoveryGap > 0 ? "danger-text" : ""}>
            {money(m.recoveryGap || m.flexible)}
          </strong>
        </span>
      </div>
      <button className="text-button dark" onClick={() => move("lab")}>
        Explore your options <ArrowUpRight size={17} />
      </button>
    </section>
  );
}
