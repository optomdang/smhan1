import type { DashboardTotals } from '../utils/dashboard'
import './CustomerSourceChart.css'

const SOURCE_ITEMS = [
  { key: 'fromMarketing' as const, label: 'Marketing', color: '#3b82f6' },
  { key: 'fromSelfSearch' as const, label: 'Tự tìm kiếm', color: '#0ea5e9' },
  { key: 'fromInternal' as const, label: 'Nội bộ', color: '#8b5cf6' },
  { key: 'fromCsm' as const, label: 'CSM', color: '#10b981' },
]

interface CustomerSourceChartProps {
  totals: Pick<
    DashboardTotals,
    'fromMarketing' | 'fromSelfSearch' | 'fromInternal' | 'fromCsm'
  >
}

export function CustomerSourceChart({ totals }: CustomerSourceChartProps) {
  const items = SOURCE_ITEMS.map((item) => ({
    ...item,
    value: totals[item.key],
  }))

  const total = items.reduce((sum, item) => sum + item.value, 0)
  const max = Math.max(...items.map((item) => item.value), 1)

  let acc = 0
  const gradientStops =
    total > 0
      ? items
          .map((item) => {
            const start = (acc / total) * 100
            acc += item.value
            const end = (acc / total) * 100
            return `${item.color} ${start}% ${end}%`
          })
          .join(', ')
      : '#e2e8f0 0% 100%'

  return (
    <div className="source-chart-card">
      <div className="source-chart-header">
        <h3>Nguồn khách hàng</h3>
        <p className="source-chart-sub">Phân bổ cơ hội theo nguồn</p>
      </div>

      <div className="source-chart-body">
        <div
          className="source-donut"
          style={{ background: `conic-gradient(${gradientStops})` }}
          role="img"
          aria-label="Biểu đồ nguồn khách hàng"
        >
          <div className="source-donut-hole">
            <span className="source-donut-total">{total}</span>
            <span className="source-donut-label">cơ hội</span>
          </div>
        </div>

        <ul className="source-legend">
          {items.map((item) => {
            const pct = total > 0 ? Math.round((item.value / total) * 100) : 0
            const barWidth = total > 0 ? (item.value / max) * 100 : 0

            return (
              <li key={item.key} className="source-legend-item">
                <div className="source-legend-top">
                  <span className="source-legend-label">
                    <span className="source-dot" style={{ background: item.color }} />
                    {item.label}
                  </span>
                  <span className="source-legend-value">
                    {item.value}
                    <span className="source-legend-pct">({pct}%)</span>
                  </span>
                </div>
                <div className="source-bar-track">
                  <div
                    className="source-bar-fill"
                    style={{ width: `${barWidth}%`, background: item.color }}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
