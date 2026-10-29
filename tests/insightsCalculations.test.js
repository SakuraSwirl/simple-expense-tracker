import { describe, expect, it } from 'vitest';
import {
  calculateAverageDailySpend,
  calculateTotalExpenses,
  getCategoryBreakdown,
  getDailySpendingSeries,
} from '../src/utils/expenseCalculations.js';
import { createSampleCategories, createSampleExpenses } from '../src/data/sampleData.js';

const categories = [
  { id: 'food', name: 'Food', icon: '🍽️', budget: 100 },
  { id: 'fun', name: 'Fun', icon: '🎬', budget: 50 },
  { id: 'travel', name: 'Travel', icon: '✈️', budget: 20 },
];

const expenses = [
  { id: 'e1', description: 'Lunch', amount: 12.5, categoryId: 'food', date: '2026-01-03' },
  { id: 'e2', description: 'Dinner', amount: 30.25, categoryId: 'food', date: '2026-01-05' },
  { id: 'e3', description: 'Movie', amount: 60, categoryId: 'fun', date: '2026-01-04' },
];

describe('calculateTotalExpenses (DEP-1)', () => {
  it('adds up every expense, including several on the same day', () => {
    const sameDay = [
      { id: 'a', amount: 1500.5, categoryId: 'food', date: '2026-01-05' },
      { id: 'b', amount: 2000.25, categoryId: 'food', date: '2026-01-05' },
      { id: 'c', amount: 999.99, categoryId: 'fun', date: '2026-01-06' },
    ];
    expect(calculateTotalExpenses(sameDay)).toBe(4500.74);
  });

  it('sums the sample data to the correct total', () => {
    expect(calculateTotalExpenses(createSampleExpenses())).toBe(200697.78);
  });

  it('returns 0 for an empty list', () => {
    expect(calculateTotalExpenses([])).toBe(0);
  });
});

describe('getCategoryBreakdown', () => {
  it('returns spent and percent for each category', () => {
    const breakdown = getCategoryBreakdown(categories, expenses);
    expect(breakdown).toEqual([
      { id: 'food', name: 'Food', icon: '🍽️', spent: 42.75, percent: 41.61 },
      { id: 'fun', name: 'Fun', icon: '🎬', spent: 60, percent: 58.39 },
      { id: 'travel', name: 'Travel', icon: '✈️', spent: 0, percent: 0 },
    ]);
  });

  it('includes a zero-spend category with spent 0 and percent 0', () => {
    const travel = getCategoryBreakdown(categories, expenses).find((c) => c.id === 'travel');
    expect(travel).toEqual({ id: 'travel', name: 'Travel', icon: '✈️', spent: 0, percent: 0 });
  });

  it('percentages sum to about 100 for the sample data', () => {
    const breakdown = getCategoryBreakdown(createSampleCategories(), createSampleExpenses());
    const percentSum = breakdown.reduce((sum, category) => sum + category.percent, 0);
    expect(percentSum).toBeCloseTo(100, 1);
  });

  it('matches the sample data per-category spend (single source of truth)', () => {
    const breakdown = getCategoryBreakdown(createSampleCategories(), createSampleExpenses());
    const spentSum = breakdown.reduce((sum, category) => sum + category.spent, 0);
    expect(spentSum).toBeCloseTo(200697.78, 2);
    expect(breakdown.find((c) => c.id === 'food').percent).toBeCloseTo(42.6, 1);
  });

  it('gives every category percent 0 when there are no expenses', () => {
    const breakdown = getCategoryBreakdown(categories, []);
    expect(breakdown.every((category) => category.spent === 0 && category.percent === 0)).toBe(true);
  });

  it('does not modify the input', () => {
    const categoryCopy = structuredClone(categories);
    const expenseCopy = structuredClone(expenses);
    getCategoryBreakdown(categories, expenses);
    expect(categories).toEqual(categoryCopy);
    expect(expenses).toEqual(expenseCopy);
  });
});

describe('getDailySpendingSeries', () => {
  const today = new Date(2026, 0, 15); // 15 Jan 2026, local time

  const windowExpenses = [
    { id: 'a', amount: 1000, categoryId: 'food', date: '2026-01-15' }, // today
    { id: 'b', amount: 500, categoryId: 'food', date: '2026-01-15' }, // same day
    { id: 'c', amount: 250, categoryId: 'food', date: '2025-12-17' }, // first day of window
    { id: 'd', amount: 9999, categoryId: 'food', date: '2025-12-16' }, // outside window
  ];

  it('returns exactly `days` points, oldest first, ending today', () => {
    const series = getDailySpendingSeries(windowExpenses, 30, today);
    expect(series).toHaveLength(30);
    expect(series[0].date).toBe('2025-12-17');
    expect(series[series.length - 1].date).toBe('2026-01-15');
    expect(series).toEqual([...series].sort((a, b) => (a.date < b.date ? -1 : 1)));
  });

  it('sums expenses that share a day', () => {
    const series = getDailySpendingSeries(windowExpenses, 30, today);
    const last = series[series.length - 1];
    expect(last).toEqual({ date: '2026-01-15', total: 1500 });
    expect(series[0]).toEqual({ date: '2025-12-17', total: 250 });
  });

  it('includes days with no expenses as zero (no gaps)', () => {
    const series = getDailySpendingSeries(windowExpenses, 30, today);
    const middle = series.find((point) => point.date === '2026-01-01');
    expect(middle).toEqual({ date: '2026-01-01', total: 0 });
  });

  it('excludes expenses dated outside the window', () => {
    const series = getDailySpendingSeries(windowExpenses, 30, today);
    const total = series.reduce((sum, point) => sum + point.total, 0);
    expect(total).toBe(1750);
  });

  it('supports a custom window length', () => {
    const series = getDailySpendingSeries(windowExpenses, 7, today);
    expect(series).toHaveLength(7);
    expect(series[0].date).toBe('2026-01-09');
  });

  it('returns an all-zero series when there are no expenses', () => {
    const series = getDailySpendingSeries([], 30, today);
    expect(series).toHaveLength(30);
    expect(series.every((point) => point.total === 0)).toBe(true);
  });

  it('does not modify the input', () => {
    const copy = structuredClone(windowExpenses);
    getDailySpendingSeries(windowExpenses, 30, today);
    expect(windowExpenses).toEqual(copy);
  });
});

describe('calculateAverageDailySpend', () => {
  it('returns the mean of the daily totals', () => {
    expect(calculateAverageDailySpend([{ total: 10 }, { total: 20 }, { total: 30 }])).toBe(20);
  });

  it('returns 0 for an empty series', () => {
    expect(calculateAverageDailySpend([])).toBe(0);
  });

  it('rounds to 2 decimal places', () => {
    expect(calculateAverageDailySpend([{ total: 10 }, { total: 10 }, { total: 5 }])).toBe(8.33);
  });
});
