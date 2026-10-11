# Changelog

## 0.3.0 — Decisions in context

- Compare three pinned options and simulate up to four connected changes before applying them atomically.
- Show exact recovery gaps, available discretionary room and the portion of the safety buffer remaining.
- Offer recalculated income, subscription and smaller-purchase alternatives.
- Add spending-category insights, observed-spending forecasts, editable entries and undoable removal.
- Correct the risk edge case after today’s essentials have already been recorded.
- Associate form errors with fields, focus the error message and restore dialog trigger focus.
- Add an error recovery screen for failed views or stale deployment assets.
- Serve the prerendered app through a dependency-free Worker with HTTP security headers, Brotli/gzip compression, ETags, correct MIME types and immutable asset caching.
- Verify combined decisions, comparisons, corrections and invalid-input states in automated DOM checks. No FAIE or Lighthouse score is claimed.


## 0.2.0 — Rubric-focused quality update

- Split the dashboard into typed components and separate views; removed unused starter code and dependencies.
- Added zero-warning ESLint, accessibility lint rules, stronger TypeScript checks, and reproducible CI checks.
- Updated affected tooling and pinned patched transitive packages; full dependency audit reports zero known vulnerabilities.
- Added bounded plain-text normalization, import limits, validated persistence, and a same-origin Content Security Policy.
- Prerendered the complete initial dashboard, lazy-loaded secondary views and dialogs, cached currency formatters, and memoized forecasts.
- Improved text/control contrast, focus indicators, navigation focus, touch targets, and reduced-motion behavior.
- Added an accessible daily cash-flow table and stronger dialog typing.
- Verified eight financial/security test groups, hydration, navigation, preview/apply/undo, payments, saving transfers, calendar details, persistence, and static accessibility checks.

Real-browser viewport, native focus trapping, and Web Vitals checks remain unverified in this environment. FAIE determines the actual competition score.
