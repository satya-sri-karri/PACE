# PACE

**Small budget. Big possibilities.**

A React + TypeScript personal finance app built during PROMPT RUN. Start with ₹10,000, plan a 30-day month, and see how a decision affects the entire financial picture before recording it.

The interface uses warm ivory, ink, burnt orange, flat peach and sage surfaces, and original SVG illustrations. No gradients, external images, or API keys are needed.

## Features

- Daily allowance after unpaid commitments, planned savings, and an emergency buffer
- Income and expense recording with categorized, searchable activity
- Upcoming bills and subscription renewals, payment recording, and future-renewal cancellation
- Savings goals with actual savings separated from planned contributions
- A dated cash-flow chart and interactive 30-day calendar
- A What-if lab for purchases, emergencies, extra income, and subscription cancellation
- Before/after balance, allowance, forecast, savings affordability, risk, and planning health
- Apply, discard, and persistent undo history
- Validated local storage, JSON backup/restore, and fresh-month/demo reset
- Responsive layouts, semantic controls, native dialogs, reduced motion, and chart text summaries

## Run locally

Use Node.js 24 (or a compatible Node.js version satisfying package.json) and pnpm 11.25.0.

```sh
npm install -g pnpm@11.25.0
pnpm install --frozen-lockfile
pnpm dev
```

Open the local URL printed by Vite. The application runs entirely in the browser; there is no backend configuration.

## Validate and build

```sh
pnpm test
pnpm typecheck
pnpm build
pnpm preview
```

The production output is **dist/**. Vercel configuration is included; other static hosts can use `pnpm build` and publish `dist`. The app uses internal views rather than URL-based routes, so no SPA route rewrites are required.

## Financial model

Money is stored as integer paise. The starting demo is Day 11:

| Item | Value |
|---|---:|
| Received income | ₹10,000 |
| Recorded spending | ₹2,600 |
| Wallet | ₹7,400 |
| Unpaid bills and renewals | ₹2,200 |
| Planned savings | ₹1,500 |
| Emergency buffer | ₹500 |
| Remaining days, including today | 20 |
| Forecast essentials | ₹140/day |
| Daily allowance | ₹160 |
| Month-end wallet forecast | ₹900 |

Daily allowance = max(0, wallet − unpaid commitments − planned savings − buffer) / remaining days.

The forecast deducts each scheduled payment on its due day and estimates future essential spending. Essentials already posted today reduce today's remaining essentials forecast. An internal savings transfer is not consumption spending. Paying an already-reserved bill or transferring already-reserved savings does not charge the allowance twice.

An emergency buffer is a protected portion of the wallet, not an expense; it is not deducted a second time from the wallet forecast.

Previewing a ₹1,800 purchase gives ₹5,600 in the wallet, ₹70/day, a −₹900 month-end forecast, and High planning risk. Preview never mutates the live ledger.

Planning health is a transparent product indicator: 50 points for liquidity, 30 for essentials coverage, and 20 for savings affordability. Its exact factors are explained in the app. It is not a credit score or a validated financial risk model.

## Project structure

- `src/main.tsx`: React entry point
- `app/page.tsx`: dashboard, interactions, and plan state
- `app/globals.css`: custom visual system and responsive styles
- `components/pace-visuals.tsx`: original SVG art, dialogs, and cash-flow visualization
- `lib/finance.ts`: pure financial calculations, validated monetary parsing, and decisions
- `tests/finance.test.mjs`: numerical cases and financial invariants
- `vite.app.config.ts`: frontend build configuration

The repository also retains its hosting scaffold. The active app is the static React/Vite entry point; no Worker or database is required.

## Verification and demo

Automated financial tests, TypeScript checking, production builds, and the initial React-rendered financial values were checked during implementation. Interactive browser and viewport testing still need to be completed at the live URL.

Suggested demo: open the Day 11 baseline, preview the ₹1,800 purchase, inspect its interconnected consequences, discard it, preview extra income or a cancelled renewal, then apply and inspect Activity. Refresh to demonstrate persistence. Undo restores the previous plan.

Data stays in the current browser. This app does not connect to a bank, move real money, or sync accounts. Export a backup to keep a copy of a plan.

Built independently with AI-assisted development during the official hackathon window.
