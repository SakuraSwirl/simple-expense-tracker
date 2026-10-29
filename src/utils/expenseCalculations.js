/**
 * Pure helper functions for expense and budget math.
 * Components should use these instead of calculating totals inline.
 */
import { toISODate } from './formatters.js';

/** Rounds a number to 2 decimal places to avoid floating point noise. */
export function roundToCents(value) {
  return Math.round(value * 100) / 100;
}

/** Sum of all category budgets. */
export function calculateTotalBudget(categories) {
  return roundToCents(categories.reduce((total, category) => total + Number(category.budget), 0));
}

/** Sum of all recorded expenses. Each expense is counted once. */
export function calculateTotalExpenses(expenses) {
  return roundToCents(expenses.reduce((total, expense) => total + Number(expense.amount), 0));
}

/** Total budget minus total expenses. May be negative. */
export function calculateRemainingBalance(categories, expenses) {
  return roundToCents(calculateTotalBudget(categories) - calculateTotalExpenses(expenses));
}

/** Sum of the expenses that belong to one category. */
export function calculateCategorySpent(expenses, categoryId) {
  return roundToCents(
    expenses
      .filter((expense) => expense.categoryId === categoryId)
      .reduce((total, expense) => total + Number(expense.amount), 0)
  );
}

/** Category budget minus what has been spent in it. May be negative. */
export function calculateCategoryRemaining(category, expenses) {
  return roundToCents(Number(category.budget) - calculateCategorySpent(expenses, category.id));
}

/**
 * Returns each category with its calculated `spent`, `remaining`
 * and `expenseCount` values. Does not modify the input.
 */
export function getCategorySummaries(categories, expenses) {
  return categories.map((category) => ({
    ...category,
    spent: calculateCategorySpent(expenses, category.id),
    remaining: calculateCategoryRemaining(category, expenses),
    expenseCount: expenses.filter((expense) => expense.categoryId === category.id).length,
  }));
}

/**
 * Returns each category with its `spent` amount and its `percent` share of
 * total spending. Percentages are 0 when there is no spending at all.
 * Categories with no expenses are included with `spent: 0` and `percent: 0`.
 * Does not modify the input.
 */
export function getCategoryBreakdown(categories, expenses) {
  const total = calculateTotalExpenses(expenses);
  return getCategorySummaries(categories, expenses).map((category) => ({
    id: category.id,
    name: category.name,
    icon: category.icon,
    spent: category.spent,
    percent: total > 0 ? roundToCents((category.spent / total) * 100) : 0,
  }));
}

/**
 * Returns a continuous daily spending series for the last `days` calendar
 * days, oldest first and ending on `today`. Every day is present, so days
 * with no expenses appear with `total: 0`. Expenses outside the window are
 * ignored. Does not modify the input.
 */
export function getDailySpendingSeries(expenses, days = 30, today = new Date()) {
  const totalsByDate = new Map();
  for (const expense of expenses) {
    totalsByDate.set(expense.date, (totalsByDate.get(expense.date) ?? 0) + Number(expense.amount));
  }

  const series = [];
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset);
    const isoDate = toISODate(date);
    series.push({ date: isoDate, total: roundToCents(totalsByDate.get(isoDate) ?? 0) });
  }
  return series;
}

/** Mean of the daily totals in a series. Returns 0 for an empty series. */
export function calculateAverageDailySpend(series) {
  if (series.length === 0) {
    return 0;
  }
  const total = series.reduce((sum, point) => sum + Number(point.total), 0);
  return roundToCents(total / series.length);
}

/** Returns a new array sorted by date, newest first (or oldest first). */
export function sortExpensesByDate(expenses, order = 'newest') {
  const direction = order === 'oldest' ? 1 : -1;
  return [...expenses].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? -direction : direction;
    if (a.id === b.id) return 0;
    return a.id < b.id ? -direction : direction;
  });
}

/**
 * Returns a new array grouped by category name (A–Z), newest first within
 * each category. Expenses with an unknown category go last.
 */
export function sortExpensesByCategory(expenses, categories) {
  const namesById = Object.fromEntries(categories.map((category) => [category.id, category.name]));
  return sortExpensesByDate(expenses).sort((a, b) => {
    const nameA = namesById[a.categoryId];
    const nameB = namesById[b.categoryId];
    if (nameA === nameB) return 0;
    if (nameA === undefined) return 1;
    if (nameB === undefined) return -1;
    return nameA.localeCompare(nameB);
  });
}
