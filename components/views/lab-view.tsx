import {
  ArrowUpRight,
  Music2,
  ShoppingBag,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { Forecast } from "@/components/pace-visuals";
import { usePace } from "@/hooks/use-pace";
import { DecisionLab } from "@/components/decision-lab";
import { DecisionBoard } from "@/components/decision-board";
export function LabView() {
  const { budget, candidate, activeSubscriptions, preset } = usePace();
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
          <DecisionBoard mode="recovery" />
        </div>
      </div>
      <DecisionBoard mode="comparison" />
    </>
  );
}
export default LabView;
