
**Reactivity:** Because `SpendingInsights` receives `expenses`/`categories` as props, any
`App` state change (`addExpense`, `deleteExpense`, `updateCategoryBudget`, `resetDemoData`)
re-renders it automatically. No `useEffect`, no subscriptions, no memoized caches (FR-4.1–FR-4.3).
An empty `expenses` array yields zero totals and a flat series (FR-4.4).

---

## 5. Testing Strategy

Follow the existing setup: **Vitest** + **React Testing Library**, config in `vite.config.js`,
setup in `tests/setup.js`. Run with `npm test`.

### 5.1 Unit tests — calculation helpers (`tests/insightsCalculations.test.js`, new)
- U-4 / DEP-1: `calculateTotalExpenses` sums **all** expenses including multiple on the same day
  (mirror the regression case: two expenses on `2026-01-05`).
- U-4: sample data total equals `200697.78`.
- U-1: percents sum to ~100 (tolerance); zero-spend category handled consistently; empty input
  returns all-zero percents.
- U-2: series length is exactly 30; ordered oldest→newest; missing days are 0; expenses older
  than the window excluded.
- U-3: average equals mean of series; empty series returns 0.
- Purity: helpers do not mutate their inputs (mirror existing `structuredClone` pattern).

### 5.2 Component tests (`tests/components.test.jsx` extension or new `tests/SpendingInsights.test.jsx`)
- Renders all three sub-views with the sample data.
- Total shown matches the Dashboard "Total Expenses" value (AC-12).
- Breakdown values match the Dashboard breakdown (AC-4).
- Trend shows 30 points / expected zero-days (AC-5, AC-6).
- Accessible text equivalents exist for chart values (AC-19, NFR-3).
- Empty data set renders without crashing and shows zero state (AC-17).

### 5.3 Integration / behaviour tests
- Add an expense → totals, breakdown, and trend update instantly (AC-13).
- Delete an expense → all three views update (AC-14).
- Reset demo data → views return to sample values (AC-15).
- Edit a category budget → budget-dependent display updates; pure spend figures unchanged (AC-16).

### 5.4 Regression
- Run `npm run test:bug` — the previously failing `tests/regression/totalExpenses.test.jsx` must
  now pass. This test is the guard for the DEP-1 fix.
- Ensure the full main suite still passes (AC-20).

### 5.5 Non-functional checks
- Assert `package.json` dependencies unchanged (AC-18) — manual/reviewer check.
- Accessibility pass (roles, labels, aria-hidden on decorative SVG) via Testing Library queries.

---

## 6. Implementation Phases

### Phase 0 — Prerequisite fix (DEP-1)
- Fix `calculateTotalExpenses` (U-4) in `src/utils/expenseCalculations.js`.
- Run `npm run test:bug` → must pass; run `npm test` → must still pass.
- Confirm Dashboard now shows ₦200,697.78.
- **Gate:** do not start Phase 1 until this passes.

### Phase 1 — Utilities
- Add `getCategoryBreakdown` (U-1), `getDailySpendingSeries` (U-2),
  `calculateAverageDailySpend` (U-3).
- Write unit tests (§5.1) and get them green before any UI.

### Phase 2 — Trend chart
- Build `SpendingTrendChart.jsx` (N-3): SVG series, date axis, average line, accessible text.
- Add its styles to `styles.css` (M-3).

### Phase 3 — Category breakdown
- Build `CategoryBreakdownChart.jsx` (N-2): proportional SVG chart + labelled legend.
- Add its styles.

### Phase 4 — Total overview + container
- Build `TotalSpendingCard` (N-4) or reuse `SummaryCard`.
- Build `SpendingInsights.jsx` (N-1) composing all three sub-views with a section heading/region.
- Add container styles.

### Phase 5 — Wire into App
- Modify `App.jsx` (M-2) to render `<SpendingInsights />` below `<Dashboard />`.

### Phase 6 — Component & integration tests
- Add component tests (§5.2) and behaviour tests (§5.3); get all green.

### Phase 7 — Polish & verification
- Responsive/accessibility pass (NFR-3, NFR-5).
- Full regression: `npm test` and `npm run test:bug` both green.
- Verify AC-1 through AC-20; confirm no new dependencies (AC-18).

---

## 7. Acceptance Criteria Traceability

| Phase | Covers |
| --- | --- |
| 0 | DEP-1, AC-10, AC-12 (total correctness) |
| 1 | AC-2, AC-3, AC-5, AC-6, AC-7 |
| 2 | AC-5, AC-6, AC-7, AC-8, AC-9 |
| 3 | AC-1, AC-3, AC-4 |
| 4 | AC-10, AC-11 |
| 5 | FR-5.1, FR-5.2 |
| 6 | AC-13, AC-14, AC-15, AC-16, AC-17, AC-19, AC-20 |
| 7 | AC-18, NFR-3, NFR-5 |

---

## 8. Risks and Mitigations

| Risk | Mitigation |
| --- | --- |
| DEP-1 fix changes Dashboard totals (expected) and could surprise | Call it out as intended; guarded by `npm run test:bug`. |
| SVG chart math (scaling values → coordinates) errors | Keep pure scaling helpers testable; unit-test series/percent math first. |
| Accessibility regressions in custom SVG | Always render text equivalents; mark decorative SVG `aria-hidden`. |
| Timezone/date-bucket off-by-one in the 30-day window | Reuse existing local-date helpers (`toISODate`/`parseISODate`); unit-test boundary days. |
| `expenseCalculations.js` becoming large | Optionally extract insights helpers into `src/utils/insightsCalculations.js` (keep imports clean). |

---

## 9. Decisions Still Open (from spec §9)
- Zero-spend categories in the breakdown: **show with 0 / 0%** (default) vs. omit — must be
  consistent. Plan assumes **show**.
- Trend form: **line vs. bar** — decide at Phase 2. Plan is agnostic.
- Average reference line: **simple mean** (default) vs. median. Plan assumes **mean**.
