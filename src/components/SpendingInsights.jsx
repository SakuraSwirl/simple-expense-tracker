import SummaryCard from './SummaryCard.jsx';
import CategoryBreakdownChart from './CategoryBreakdownChart.jsx';
import SpendingTrendChart from './SpendingTrendChart.jsx';
import {
  calculateAverageDailySpend,
  calculateTotalExpenses,
  getCategoryBreakdown,
  getDailySpendingSeries,
} from '../utils/expenseCalculations.js';

const TREND_DAYS = 30;

/**
 * Read-only analytics section. All values are derived from `expenses` and
 * `categories` on render, so the section updates automatically whenever that
 * data changes.
 */
function SpendingInsights({ expenses, categories }) {
  const totalSpending = calculateTotalExpenses(expenses);
  const breakdown = getCategoryBreakdown(categories, expenses);
  const series = getDailySpendingSeries(expenses, TREND_DAYS);
  const averageDailySpend = calculateAverageDailySpend(series);

  return (
    <section className="section" aria-labelledby="insights-heading">
      <h2 id="insights-heading" className="section__title">
        Spending Insights
      </h2>

      <div className="insights-total">
        <SummaryCard
          label="Total Spending"
          amount={totalSpending}
          icon="🧾"
          variant="expenses"
          description={`${expenses.length} transactions recorded`}
        />
      </div>

      <div className="insights-grid">
        <div className="card">
          <h3 className="card__title">Spending by Category</h3>
          <CategoryBreakdownChart categories={breakdown} />
        </div>

        <div className="card">
          <h3 className="card__title">Spending Trend</h3>
          <SpendingTrendChart points={series} average={averageDailySpend} />
        </div>
      </div>
    </section>
  );
}

export default SpendingInsights;
