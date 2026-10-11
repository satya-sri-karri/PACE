import {
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  PiggyBank,
} from "lucide-react";
import { money } from "@/lib/finance";
import { usePace } from "@/hooks/use-pace";
import { ActivityPanel } from "@/components/activity-panel";
export function ActivityView() {
  const { m } = usePace();
  return (
    <>
      <div className="activity-summary">
        <div>
          <span>Total received</span>
          <strong>{money(m.income)}</strong>
          <ArrowDownLeft />
        </div>
        <div>
          <span>Total spent</span>
          <strong>{money(m.spent)}</strong>
          <ArrowUpRight />
        </div>
        <div>
          <span>Actually saved</span>
          <strong>{money(m.saved)}</strong>
          <PiggyBank />
        </div>
      </div>
      <ActivityPanel full />
      <div className="activity-note">
        <ShieldCheck size={17} />
        Savings transfers are tracked separately from spending. Your data stays
        in this browser.
      </div>
    </>
  );
}
export default ActivityView;
