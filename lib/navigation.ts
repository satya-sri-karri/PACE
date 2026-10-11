import {
  LayoutGrid,
  FlaskConical,
  ReceiptText,
  CalendarDays,
} from "lucide-react";
export const NAV = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "lab", label: "What-if lab", icon: FlaskConical },
  { id: "activity", label: "Activity", icon: ReceiptText },
  { id: "plan", label: "Your plan", icon: CalendarDays },
] as const;
export const TITLES = {
  income: "A little more coming in.",
  expense: "What went out?",
  commitment: "Put it on the calendar.",
  goal: "What are you saving for?",
  transfer: "A little closer to your goal.",
  settings: "Your plan, your assumptions.",
  reset: "A fresh start?",
  health: "What’s behind the number.",
  confirm: "See the trade-off first.",
  day: "A day, in focus.",
  help: "Meet your money’s pace.",
};
