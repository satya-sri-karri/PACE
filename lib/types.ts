import { type Commitment, type Goal } from "@/lib/finance";
export type View = "overview" | "lab" | "activity" | "plan";
export type Modal =
  | {
      kind:
        | "income"
        | "expense"
        | "settings"
        | "reset"
        | "health"
        | "confirm"
        | "help";
    }
  | { kind: "commitment"; item?: Commitment }
  | { kind: "goal"; item?: Goal }
  | { kind: "transfer"; item: Goal }
  | { kind: "day"; day: number }
  | null;
