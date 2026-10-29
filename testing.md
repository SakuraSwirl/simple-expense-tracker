# Testing Report — ExpenseFlow (NexaScale Assignment)

**Date:** 2026-10-28 · **Environment:** Node.js LTS (≥22.12), React 19, Vite 8.3.2, Vitest 5.0.3 (Windows)

---

## 1. Total Expenses Bug — Verification

| Item | Detail |
| --- | --- |
| Root cause | `calculateTotalExpenses` de-duplicated expenses by `date`, dropping same-day entries |
| Fix | Sum every expense with `reduce` |
| Command | `npm run test:bug` |
| Result | **4/4 tests pass** |

Dashboard "Total Expenses" now shows **₦200,697.78** (previously ₦163,697.78); Remaining Balance **₦69,302.22**. Verified by the regression suite asserting the same-day sum (`4500.74`), the sample total (`200697.78`), the balance (`69302.22`), and the rendered card value.

---

## 2. Spending Insights — Verification

| Feature | Covered by | Result |
| --- | --- | --- |
| Spending by category | `tests/insightsCalculations.test.js` — spent, percent, zero-spend category, empty data, input purity | ✅ Pass |
| Spending trend | Same file — 30-point window, oldest→newest order, same-day sums, zero-fill, out-of-window exclusion, average | ✅ Pass |
| Total overview | Uses fixed `calculateTotalExpenses`; matches Dashboard | ✅ Pass |

All Insights values are derived on render from `expenses`/`categories`, so added, deleted, or reset data updates the section automatically.

---

## 3. Automated Test Results

| Suite | Command | Tests | Result |
| --- | --- | --- | --- |
| Main | `npm test` | 59 | ✅ 3 files passed |
| Regression | `npm run test:bug` | 4 | ✅ 1 file passed |

Main suite breakdown: `insightsCalculations.test.js` (19), `expenseCalculations.test.js` (26), `components.test.jsx` (14).

---

## 4. Build Verification

**Command:** `npm run build` → ✅ Success

```text
