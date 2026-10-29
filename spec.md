# Spec: Spending Insights

## 1. Overview

**Feature name:** Spending Insights

**Summary:** A new read-only analytics section that gives users a visual understanding of their
spending. It surfaces spending by category, spending trends over time, and a total spending
overview. All views update automatically whenever expense or budget data changes.

**Status:** Draft for review

**Related context:** ExpenseFlow is a client-only React + Vite app with no backend. It follows a
one-way data flow (see README §6): `App.jsx` owns `expenses` and `categories`, passes them down as
props, and all money math is done by pure helpers in `src/utils/expenseCalculations.js`. Derived
values are computed on render, never stored. This feature must follow the same conventions.

---

## 2. Goals and Non-Goals

### Goals
- Give users a clear, at-a-glance picture of where their money goes.
- Show how spending changes over time (last 30 days, daily).
- Reuse the existing data model and calculation helpers — no new data storage.
- Keep the app dependency-free (no chart library).
- Update reactively: any change to `expenses` or `categories` is reflected immediately.

### Non-Goals
- No new persistence, backend, or API calls.
- No editing of data from within the Insights section (it is read-only).
- No forecasting, budgeting advice, or AI recommendations.
- No cross-device sync or export.
- No interactive drill-down, zoom, or tooltip-heavy interactions in this iteration.
- No changes to the currency (still Nigerian Naira, ₦) or locale.

---

## 3. Definitions

| Term | Meaning |
| --- | --- |
| Insight | A derived visual or numeric summary of existing expense data |
| Category breakdown | Share of total spending attributed to each category |
| Trend | Daily total spending across the last 30 days |
| Total spending overview | The overall sum of all recorded expenses |
| Window | A rolling period of the last 30 calendar days, ending today |

---

## 4. Functional Requirements

### FR-1: Spending by Category
- **FR-1.1** The section SHALL display each category with its total spend for the current data set.
- **FR-1.2** The display SHALL be a chart proportionally representing each category's share of
  total spending, plus the category name and formatted amount.
- **FR-1.3** Each category SHALL be visually distinguishable (e.g. by label and icon/colour),
  and the category icon already defined in the data SHALL be reused where present.
- **FR-1.4** Percentages SHALL be shown per category, calculated as that category's spend divided
  by total spending.
- **FR-1.5** A category with zero spending SHALL be shown with 0 / 0% (or omitted consistently —
  the presentation choice must be consistent across all categories).
- **FR-1.6** The category figures SHALL match the existing per-category calculations used by the
  Dashboard breakdown and the Category Budgets table (single source of truth).

### FR-2: Spending Trends Over Time
- **FR-2.1** The section SHALL display a trend of daily total spending for the **last 30 days**
  (including today).
- **FR-2.2** Each day in the window SHALL be represented, including days with no expenses
  (value of zero), so the series is continuous.
- **FR-2.3** Days SHALL be ordered oldest → newest, left → right.
- **FR-2.4** A date axis (e.g. first, middle, and last labels) SHALL be shown so the reader can
  place the trend in time.
- **FR-2.5** A clear visual cue (e.g. a horizontal reference line at the average daily spend)
  SHALL indicate the average spending level across the window.
- **FR-2.6** Expenses dated outside the 30-day window SHALL NOT appear in the trend, but SHALL
  still be counted in the Total spending overview and the category breakdown.

### FR-3: Total Spending Overview
- **FR-3.1** The section SHALL show the total of all recorded expenses (all-time, not limited to
  the 30-day window).
- **FR-3.2** The total SHALL be formatted as Naira (₦) using the existing currency formatter.
- **FR-3.3** The overview SHALL also show the number of transactions contributing to the total.
- **FR-3.4** The total SHALL be consistent with the "Total Expenses" value shown on the Dashboard.

### FR-4: Dynamic Updates
- **FR-4.1** When an expense is added, deleted, or reset, the Insights section SHALL update
  without a page reload.
- **FR-4.2** When a category budget is edited, any category-related display that depends on
  budget SHALL reflect the change; purely spend-based figures (which do not depend on budget)
  SHALL remain unchanged.
- **FR-4.3** The section SHALL derive all values from `expenses` and `categories` on render; it
  SHALL NOT cache or store computed values.
- **FR-4.4** The section SHALL render correctly with an empty data set (zero expenses).

### FR-5: Placement and Composition
- **FR-5.1** The feature SHALL be a new self-contained section rendered from `App.jsx`, positioned
  below the Dashboard.
- **FR-5.2** The section SHALL receive `expenses` and `categories` via props and SHALL NOT own or
  mutate that data.
- **FR-5.3** Calculation logic SHALL live in a pure helper module in `src/utils/` and be unit
  testable in isolation, consistent with existing helpers.

---

## 5. Non-Functional Requirements

### NFR-1: Dependencies
- No new runtime dependencies SHALL be added. Charts SHALL be built with inline SVG and CSS only.
- The project's existing stack (React, Vite, Vitest, React Testing Library) SHALL be sufficient.

### NFR-2: Performance
- All Insights calculations SHALL be O(n) or better in the number of expenses.
- The section SHALL render within the same frame budget as the existing Dashboard for the sample
  data set (~29 expenses) and SHALL remain responsive for at least 1,000 expenses.
- No timers, polling, or background work SHALL be introduced.

### NFR-3: Accessibility
- Charts SHALL have an accessible text equivalent: every value shown graphically SHALL also be
  available as text (amount, label, percentage), readable by a screen reader.
- Decorative chart elements SHALL be marked as aria-hidden.
- The section SHALL have a heading and an accessible landmark/region.
- Colour SHALL NOT be the only means of conveying information (labels/text required).
- Text and essential graphical elements SHALL meet WCAG 2.1 AA contrast.

### NFR-4: Correctness and Consistency
- All money math SHALL reuse the existing helpers; rounding SHALL use the existing 2-decimal
  rounding behaviour to avoid floating-point noise.
- The category breakdown SHALL sum to the total spending overview (allowing for the documented
  floating-point rounding tolerance).

### NFR-5: Responsiveness and Styling
- The section SHALL be usable on mobile, tablet, and desktop widths, consistent with the existing
  responsive layout.
- Styling SHALL use the existing single stylesheet conventions (class-based, no inline style
  frameworks).

### NFR-6: Maintainability
- New code SHALL follow existing conventions: one component per file, pure helpers in `utils/`,
  default export for components.
- The feature SHALL be covered by unit tests for the helpers and at least one component test.

### NFR-7: Security and Privacy
- No new data SHALL leave the browser; no network requests, telemetry, or third parties.

---

## 6. Dependencies, Assumptions, and Constraints

- **DEP-1 (prerequisite):** The Total spending overview and the category breakdown depend on a
  correct total-expenses calculation. The current helper `calculateTotalExpenses` in
  `src/utils/expenseCalculations.js` de-duplicates expenses by **date** rather than summing every
  expense, so multiple expenses on the same day are undercounted (e.g. the sample data shows
  ₦163,697.78 instead of the correct ₦200,697.78). **This feature assumes that bug is fixed**, so
  that the Insights total agrees with the Dashboard. If it is not fixed first, the Insights total
  will inherit the same error.
- **ASSUMPTION-1:** A "day" is a local calendar day, using the existing local-date handling in
  `src/utils/formatters.js`.
- **ASSUMPTION-2:** The 30-day window is rolling and relative to "today" at render time.
- **ASSUMPTION-3:** Currency and locale remain NGN / `en-NG`.
- **ASSUMPTION-4:** The Insights section is the only new UI surface; the existing Dashboard remains
  unchanged except for the prerequisite bug fix.
- **CONSTRAINT-1:** No new dependencies (see NFR-1).
- **CONSTRAINT-2:** Read-only feature — no new state, no new `localStorage` keys.

---

## 7. Acceptance Criteria

### Spending by Category
- **AC-1** Given the sample data, when the Insights section renders, then every category with
  expenses is displayed with its correct spend amount and its percentage share of total spending.
- **AC-2** Given a category's spend and percentage, the sum of all category spends equals the
  Total spending overview (within the rounding tolerance).
- **AC-3** Given a category with no expenses, then it is displayed with a 0 value in a consistent
  way across all such categories.
- **AC-4** Given the category breakdown values, when compared with the Dashboard breakdown, then
  they match exactly.

### Spending Trends Over Time
- **AC-5** Given the sample data, when the trend renders, then it shows exactly 30 daily data
  points covering the last 30 days including today.
- **AC-6** Given a day within the window with no expenses, then that day appears with a value of
  zero (the series has no gaps).
- **AC-7** Given an expense dated more than 30 days ago, then it does not appear in the trend.
- **AC-8** Given the rendered trend, then an average-spend reference cue and date-axis labels are
  present.
- **AC-9** Given the trend, then each day's value is also available as text for screen readers.

### Total Spending Overview
- **AC-10** Given the sample data, when the overview renders, then the total spending shown equals
  ₦200,697.78 (the correct sum of all 29 expenses).
- **AC-11** Given the overview, then the number of transactions shown equals the number of
  expenses in the data set.
- **AC-12** Given the overview total, when compared with the Dashboard "Total Expenses" card, then
  the two values match.

### Dynamic Updates
- **AC-13** Given the app is open, when an expense is added, then the total overview, the category
  breakdown, and the trend all update immediately without a page reload.
- **AC-14** Given the app is open, when an expense is deleted, then all three views update
  immediately and consistently.
- **AC-15** Given the app is open, when "Reset Demo Data" is confirmed, then all three views
  return to the sample-data values.
- **AC-16** Given a category budget is edited, then budget-dependent displays update and pure
  spend figures remain correct.
- **AC-17** Given all expenses are removed (empty data set), then the section renders without
  errors, showing a zero/monetary-empty state.

### Non-Functional
- **AC-18** Given the project's `package.json`, then no new runtime dependency is present after
  this feature ships.
- **AC-19** Given the Insights section, then all numeric values have accessible text equivalents.
- **AC-20** Given the automated test suite, then helper unit tests and at least one component test
  for the section pass, and the existing suite continues to pass.

---

## 8. Out of Scope / Future Ideas
- Weekly/monthly trend granularity and user-selectable ranges.
- Interactive tooltips, drill-down, and filtering by date range or category.
- Month-over-month comparison and budget-vs-actual convergence charts.
- Export to CSV/PDF.
- Additional analytics such as largest single expense or most frequent category.

---

## 9. Open Questions
- Presentation of zero-spend categories in the breakdown (show vs. omit) — must be consistent.
- Exact visual form of the trend (line vs. bar) — both acceptable under the non-functional
  requirements; decide during design.
- Whether the average reference line should be a simple mean or a per-day median — defaulting to
  simple mean.
