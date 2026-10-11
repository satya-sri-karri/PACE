import { type Commitment, type Goal, type Transaction } from "@/lib/finance";
export type View = "overview" | "lab" | "activity" | "plan";
export type Modal =
  | {
      kind: "settings" | "reset" | "health" | "confirm" | "help";
    }
  | { kind: "income" | "expense"; item?: Transaction }
  | { kind: "commitment"; item?: Commitment }
  | { kind: "goal"; item?: Goal }
  | { kind: "transfer"; item: Goal }
  | { kind: "day"; day: number }
  | null;
