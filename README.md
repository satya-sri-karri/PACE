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
- Up to four decisions in one atomic preview, with three options pinned for side-by-side comparison
- Exact buffer-recovery gaps and actionable income, renewal and lower-cost alternatives
- Editable manual transactions with validated correction, removal and undo
- Category spending breakdown and a separate observed-spending forecast
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

Open the local URL printed by Vite. Financial calculations and personal data stay in the browser. A small dependency-free HTTP worker serves the built files and security headers; no backend account or API key is needed.

## Validate and build

```sh
pnpm check
pnpm audit --audit-level low
pnpm preview
```

The deployment output is **dist/server/index.js**, a self-contained Worker ES module with an exact allowlist of embedded client assets. It applies security headers, Brotli/gzip negotiation, MIME types, ETags and immutable caching to versioned assets. The standalone static build is **work/client/**; Vercel configuration points there. The app uses internal views, so no SPA route rewrites are required.

## Financial model

Money is stored as integer paise. The starting demo is Day 11:

| Item                            |    Value |
| ------------------------------- | -------: |
| Received income                 |  ₹10,000 |
| Recorded spending               |   ₹2,600 |
| Wallet                          |   ₹7,400 |
| Unpaid bills and renewals       |   ₹2,200 |
| Planned savings                 |   ₹1,500 |
| Emergency buffer                |     ₹500 |
| Remaining days, including today |       20 |
| Forecast essentials             | ₹140/day |
| Daily allowance                 |     ₹160 |
| Month-end wallet forecast       |     ₹900 |

Daily allowance = max(0, wallet − unpaid commitments − planned savings − buffer) / remaining days.

Room for a one-off extra = max(0, minimum projected balance − buffer). Recovery gap = max(0, buffer − minimum projected balance). Risk and essentials coverage use **remaining** essentials, so a day whose essentials are already fully recorded is not charged again. The separate spending-trend forecast uses observed everyday spending through the current day, excluding linked bill payments; it does not replace the configured essentials forecast.

The forecast deducts each scheduled payment on its due day and estimates future essential spending. Essentials already posted today reduce today's remaining essentials forecast. An internal savings transfer is not consumption spending. Paying an already-reserved bill or transferring already-reserved savings does not charge the allowance twice.

An emergency buffer is a protected portion of the wallet, not an expense; it is not deducted a second time from the wallet forecast.

Previewing a ₹1,800 purchase gives ₹5,600 in the wallet, ₹70/day, a −₹900 month-end forecast, and High planning risk. Preview never mutates the live ledger.

Planning health is a transparent product indicator: 50 points for liquidity, 30 for essentials coverage, and 20 for savings affordability. Its exact factors are explained in the app. It is not a credit score or a validated financial risk model.

## Project structure

- `app/page.tsx`: application composition
- `components/`: focused dashboard panels and accessible visuals
- `components/views/`: separate overview, lab, activity, plan, and dialog views
- `hooks/use-pace.tsx`: typed actions and interaction state
- `lib/plan-store.ts`: validated local persistence and subscription-based state
- `lib/finance.ts`: pure financial calculations and bounded input validation
- `src/prerender.tsx`: initial dashboard HTML for first paint
- `scripts/`: prerendering, build budgets, static accessibility, and DOM interaction verification
- `tests/`: numerical invariants and invalid-data cases
- `.github/workflows/quality.yml`: repeatable lint, type, test, build, and dependency checks

The active project uses only React, React DOM, and Lucide at runtime. There is no unused Next.js server, database, or component scaffold.

## Verification and demo

Version 0.3.0 includes checks for zero-warning ESLint, strict TypeScript, 14 financial/security/HTTP test groups, production builds, hydration, and core DOM interactions. The complete dashboard is prerendered; secondary views and dialogs load on demand. Browser assets are precompressed during the build. A size check caps total JavaScript and CSS at 90 kB with Brotli; gzip and uncompressed fallbacks are also available. The older 100 kB gzip budget was replaced with a check of the encoding actually served to supporting browsers.

Static axe checks cover the overview, decision lab, comparison board, activity, plan, confirmation dialog, invalid-input dialog, and calendar dialog. They report zero violations for supported rules. Colour contrast is excluded from axe in JSDOM because it requires layout; source colour checks informed contrast improvements. Native dialog focus trapping, viewport appearance, FCP, and CLS still require a real-browser audit. No Lighthouse or FAIE score is claimed by the local checks.

The full lockfile audit reported zero known vulnerabilities at the time of this update. Patched transitive packages are pinned in `pnpm-workspace.yaml`; rerun the audit because advisories can change.

A same-origin Content Security Policy blocks external scripts, plugins, and unexpected resource origins. React escapes descriptions as text, monetary input is parsed to integer paise, and import size/record-count limits bound backup processing. The Worker applies CSP (including frame ancestors), nosniff, referrer policy, permissions policy, HSTS and cross-origin policies on HTTP responses. The HTML also includes a CSP and referrer policy. Static hosting alternatives must honor the included header configuration.

Suggested demo: open the Day 11 baseline, preview the ₹1,800 purchase and pin it. The buffer-recovery gap is ₹1,400; explore that extra-income combination and pin it as a second option. Compare the resulting allowance, forecast, goal affordability, risk and health. Apply only income actually received, inspect Activity, then undo the entire combination. Explore category spending and correct a manual entry. Refresh to demonstrate persistence.

Data stays in the current browser. This app does not connect to a bank, move real money, or sync accounts. Export a backup to keep a copy of a plan.

Built independently with AI-assisted development during the official hackathon window.
