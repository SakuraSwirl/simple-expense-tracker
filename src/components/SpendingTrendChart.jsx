import { formatCurrency, formatDate } from '../utils/formatters.js';

const WIDTH = 600;
const HEIGHT = 180;
const PAD_LEFT = 6;
const PAD_RIGHT = 6;
const PAD_TOP = 14;
const PAD_BOTTOM = 10;

/**
 * Daily spending trend as an inline SVG line chart. The chart itself is
 * decorative; every value is also exposed as text in a visually hidden table
 * so screen readers can read the underlying data.
 */
function SpendingTrendChart({ points, average = 0 }) {
  if (points.length === 0) {
    return <p className="empty-state">No spending data to show yet.</p>;
  }

  const plotWidth = WIDTH - PAD_LEFT - PAD_RIGHT;
  const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const baseline = PAD_TOP + plotHeight;

  const totals = points.map((point) => Number(point.total));
  const maxTotal = Math.max(...totals);
  const scaleMax = maxTotal > 0 ? maxTotal : 1;

  const x = (index) =>
    points.length === 1
      ? PAD_LEFT + plotWidth / 2
      : PAD_LEFT + (index / (points.length - 1)) * plotWidth;
  const y = (value) => PAD_TOP + (1 - Number(value) / scaleMax) * plotHeight;

  const linePoints = totals.map((total, index) => `${x(index)},${y(total)}`).join(' ');
  const areaPoints = `${PAD_LEFT},${baseline} ${linePoints} ${PAD_LEFT + plotWidth},${baseline}`;
  const averageY = y(average);

  const axisIndexes = [0, Math.floor((points.length - 1) / 2), points.length - 1];

  return (
    <figure className="trend-chart">
      <figcaption className="trend-chart__caption">
        <span className="trend-chart__title">Daily spending (last {points.length} days)</span>
        <span className="trend-chart__average">Average {formatCurrency(average)} / day</span>
      </figcaption>

      <svg
        className="trend-chart__svg"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        aria-hidden="true"
        focusable="false"
      >
        <polygon className="trend-chart__area" points={areaPoints} />
        <polyline className="trend-chart__line" points={linePoints} />
        <line
          className="trend-chart__baseline"
          x1={PAD_LEFT}
          y1={baseline}
          x2={PAD_LEFT + plotWidth}
          y2={baseline}
        />
        <line
          className="trend-chart__average-line"
          x1={PAD_LEFT}
          y1={averageY}
          x2={PAD_LEFT + plotWidth}
          y2={averageY}
        />
      </svg>

      <div className="trend-chart__axis">
        {axisIndexes.map((index) => (
          <span key={points[index].date}>{formatDate(points[index].date)}</span>
        ))}
      </div>

      <table className="visually-hidden">
        <caption>Daily spending, last {points.length} days</caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Amount</th>
          </tr>
        </thead>
        <tbody>
          {points.map((point) => (
            <tr key={point.date}>
              <th scope="row">{formatDate(point.date)}</th>
              <td>{formatCurrency(point.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

export default SpendingTrendChart;
