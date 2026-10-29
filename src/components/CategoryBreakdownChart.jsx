import { formatCurrency } from '../utils/formatters.js';

const SIZE = 140;
const STROKE = 18;
const RADIUS = (SIZE - STROKE) / 2;
const CENTER = SIZE / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const SEGMENT_COLORS = ['#4f46e5', '#0d9488', '#b45309', '#c0262d', '#7c3aed', '#0891b2'];

/**
 * Spending by category as a donut chart with a labelled legend. The donut is
 * decorative; the legend lists every category with its name, amount and
 * percentage as text, so colour is never the only cue.
 */
function CategoryBreakdownChart({ categories }) {
  const totalSpent = categories.reduce((sum, category) => sum + Number(category.spent), 0);

  let offset = 0;
  const segments = categories.map((category, index) => {
    const fraction = totalSpent > 0 ? Number(category.spent) / totalSpent : 0;
    const length = fraction * CIRCUMFERENCE;
    const segment = {
      id: category.id,
      color: SEGMENT_COLORS[index % SEGMENT_COLORS.length],
      length,
      offset,
    };
    offset += length;
    return segment;
  });

  return (
    <div className="category-chart">
      <svg
        className="category-chart__donut"
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        aria-hidden="true"
        focusable="false"
      >
        <circle
          className="category-chart__track"
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          strokeWidth={STROKE}
        />
        {segments.map(
          (segment) =>
            segment.length > 0 && (
              <circle
                key={segment.id}
                cx={CENTER}
                cy={CENTER}
                r={RADIUS}
                strokeWidth={STROKE}
                stroke={segment.color}
                strokeDasharray={`${segment.length} ${CIRCUMFERENCE - segment.length}`}
                strokeDashoffset={-segment.offset}
                transform={`rotate(-90 ${CENTER} ${CENTER})`}
              />
            )
        )}
      </svg>

      <ul className="category-chart__legend">
        {categories.map((category, index) => (
          <li key={category.id} className="category-chart__legend-item">
            <span
              className="category-chart__swatch"
              style={{ background: SEGMENT_COLORS[index % SEGMENT_COLORS.length] }}
              aria-hidden="true"
            />
            <span className="category-chart__legend-name">
              <span className="category-chart__legend-icon" aria-hidden="true">
                {category.icon}
              </span>
              {category.name}
            </span>
            <span className="category-chart__legend-value">
              {formatCurrency(category.spent)}
              <span className="category-chart__legend-percent">{category.percent}%</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CategoryBreakdownChart;
