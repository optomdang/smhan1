import { useMemo, useState } from 'react'
import { DEFAULT_COMPARE_STAFF_IDS, STAFF_MEMBERS } from '../data/staff'
import {
  METRIC_DEFINITIONS,
  type MetricKey,
  formatMetricDisplay,
  getMetricDefinition,
  getStaffPeriodTotals,
} from '../utils/dailyStats'
import type { PeriodRange } from '../utils/period'
import './StaffCompareChart.css'

const STAFF_GRADIENTS = [
  'url(#compare-gradient-a)',
  'url(#compare-gradient-b)',
] as const

interface StaffCompareChartProps {
  period: PeriodRange
  refreshKey?: number
  editable?: boolean
}

interface CompareRow {
  metricKey: MetricKey
  label: string
  valueA: number
  valueB: number
}

interface DeltaInfo {
  tone: 'a' | 'b' | 'tie'
  text: string
  detail: string
}

function formatDelta(a: number, b: number, unit: 'count' | 'money'): DeltaInfo {
  if (a === b) {
    return { tone: 'tie', text: 'Hòa', detail: formatMetricDisplay(a, unit) }
  }

  const leaderIsA = a > b
  const higher = leaderIsA ? a : b
  const lower = leaderIsA ? b : a
  const diff = higher - lower
  const pct = lower > 0 ? (diff / lower) * 100 : 100

  return {
    tone: leaderIsA ? 'a' : 'b',
    text: `+${pct.toFixed(pct >= 10 ? 0 : 1)}%`,
    detail: `Chênh ${formatMetricDisplay(diff, unit)}`,
  }
}

export function StaffCompareChart({ period, refreshKey = 0, editable = true }: StaffCompareChartProps) {
  const [staffAId, setStaffAId] = useState<string>(DEFAULT_COMPARE_STAFF_IDS.a)
  const [staffBId, setStaffBId] = useState<string>(DEFAULT_COMPARE_STAFF_IDS.b)
  const [selectedMetrics, setSelectedMetrics] = useState<Set<MetricKey>>(
    () => new Set(METRIC_DEFINITIONS.map((item) => item.key)),
  )

  const staffA = STAFF_MEMBERS.find((item) => item.id === staffAId) ?? STAFF_MEMBERS[0]
  const staffB = STAFF_MEMBERS.find((item) => item.id === staffBId) ?? STAFF_MEMBERS[1]

  const totalsA = useMemo(
    () => getStaffPeriodTotals(staffAId, period),
    [staffAId, period, refreshKey],
  )
  const totalsB = useMemo(
    () => getStaffPeriodTotals(staffBId, period),
    [staffBId, period, refreshKey],
  )

  const activeMetrics = METRIC_DEFINITIONS.filter((item) => selectedMetrics.has(item.key))
  const allSelected = selectedMetrics.size === METRIC_DEFINITIONS.length

  const toggleMetric = (key: MetricKey) => {
    setSelectedMetrics((current) => {
      const next = new Set(current)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  const toggleAllMetrics = () => {
    if (allSelected) {
      setSelectedMetrics(new Set())
      return
    }
    setSelectedMetrics(new Set(METRIC_DEFINITIONS.map((item) => item.key)))
  }

  const chartRows = useMemo((): CompareRow[] => {
    return activeMetrics.map((metric) => ({
      metricKey: metric.key,
      label: metric.label,
      valueA: totalsA[metric.key],
      valueB: totalsB[metric.key],
    }))
  }, [activeMetrics, totalsA, totalsB])

  const scoreboard = useMemo(() => {
    let winsA = 0
    let winsB = 0
    let ties = 0

    for (const row of chartRows) {
      if (row.valueA > row.valueB) winsA += 1
      else if (row.valueB > row.valueA) winsB += 1
      else ties += 1
    }

    return { winsA, winsB, ties }
  }, [chartRows])

  const LABEL_WIDTH = 168
  const BAR_AREA_WIDTH = 560
  const HALF_WIDTH = (BAR_AREA_WIDTH - 20) / 2
  const CENTER_X = LABEL_WIDTH + BAR_AREA_WIDTH / 2
  const ROW_HEIGHT = 64
  const BAR_HEIGHT = 20
  const chartHeight = Math.max(chartRows.length * ROW_HEIGHT + 56, 140)
  const chartWidth = LABEL_WIDTH + BAR_AREA_WIDTH + 120

  return (
    <section className="staff-compare-card">
      <div className="staff-compare-header">
        <div>
          <h3>So sánh giữa 2 nhân sự</h3>
          <p>{period.label}</p>
        </div>
        {activeMetrics.length > 0 && (
          <div className="compare-scoreboard">
            <div className="score-item score-a">
              <span className="score-name">{staffA.name.split(' ').slice(-1)[0]}</span>
              <span className="score-value">{scoreboard.winsA}</span>
              <span className="score-label">thắng</span>
            </div>
            <div className="score-divider">
              {scoreboard.ties > 0 ? `${scoreboard.ties} hòa` : 'vs'}
            </div>
            <div className="score-item score-b">
              <span className="score-name">{staffB.name.split(' ').slice(-1)[0]}</span>
              <span className="score-value">{scoreboard.winsB}</span>
              <span className="score-label">thắng</span>
            </div>
          </div>
        )}
      </div>

      <div className="compare-staff-pickers">
        <div className="compare-staff-picker compare-staff-picker-a">
          <span className="picker-label">Nhân sự A</span>
          <select
            value={staffAId}
            onChange={(e) => setStaffAId(e.target.value)}
            className="compare-select"
            disabled={!editable}
          >
            {STAFF_MEMBERS.map((member) => (
              <option key={member.id} value={member.id} disabled={member.id === staffBId}>
                {member.name}
              </option>
            ))}
          </select>
        </div>
        <div className="compare-vs-badge">VS</div>
        <div className="compare-staff-picker compare-staff-picker-b">
          <span className="picker-label">Nhân sự B</span>
          <select
            value={staffBId}
            onChange={(e) => setStaffBId(e.target.value)}
            className="compare-select"
            disabled={!editable}
          >
            {STAFF_MEMBERS.map((member) => (
              <option key={member.id} value={member.id} disabled={member.id === staffAId}>
                {member.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="compare-metric-picker">
        <span className="picker-label">Chỉ số so sánh</span>
        <div className="compare-metric-list">
          <button
            type="button"
            className={`compare-pill${allSelected ? ' active' : ''}`}
            onClick={toggleAllMetrics}
            disabled={!editable}
          >
            Tất cả
          </button>
          {METRIC_DEFINITIONS.map((metric) => (
            <button
              key={metric.key}
              type="button"
              className={`compare-pill${selectedMetrics.has(metric.key) ? ' active' : ''}`}
              onClick={() => toggleMetric(metric.key)}
              disabled={!editable}
            >
              {metric.label}
            </button>
          ))}
        </div>
      </div>

      <div className="compare-chart-wrap">
        {activeMetrics.length === 0 ? (
          <div className="compare-chart-empty">Chọn ít nhất một chỉ số để so sánh</div>
        ) : (
          <>
            <div className="compare-chart-legend">
              <span className="compare-legend-item compare-legend-a">
                <span className="legend-swatch" />
                {staffA.name}
              </span>
              <span className="compare-legend-item compare-legend-b">
                <span className="legend-swatch" />
                {staffB.name}
              </span>
            </div>

            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="compare-chart"
              role="img"
              aria-label={`So sánh ${staffA.name} và ${staffB.name}`}
            >
              <defs>
                <linearGradient id="compare-gradient-a" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#1d4ed8" />
                  <stop offset="100%" stopColor="#60a5fa" />
                </linearGradient>
                <linearGradient id="compare-gradient-b" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#fb923c" />
                  <stop offset="100%" stopColor="#f97316" />
                </linearGradient>
              </defs>

              <text
                x={CENTER_X - HALF_WIDTH}
                y={18}
                textAnchor="start"
                className="compare-axis-label compare-axis-a"
              >
                {staffA.name.split(' ').slice(-2).join(' ')}
              </text>
              <text
                x={CENTER_X + HALF_WIDTH}
                y={18}
                textAnchor="end"
                className="compare-axis-label compare-axis-b"
              >
                {staffB.name.split(' ').slice(-2).join(' ')}
              </text>

              <line
                x1={CENTER_X}
                y1={28}
                x2={CENTER_X}
                y2={chartHeight - 12}
                className="compare-center-line"
              />

              {chartRows.map((row, index) => {
                const y = 36 + index * ROW_HEIGHT
                const definition = getMetricDefinition(row.metricKey)
                const max = Math.max(row.valueA, row.valueB, 1)
                const widthA = (row.valueA / max) * HALF_WIDTH
                const widthB = (row.valueB / max) * HALF_WIDTH
                const delta = formatDelta(row.valueA, row.valueB, definition.unit)
                const barY = y + 10

                return (
                  <g key={row.metricKey}>
                    <text x={0} y={y + 14} className="compare-row-label">
                      {row.label.length > 22 ? `${row.label.slice(0, 21)}…` : row.label}
                    </text>
                    <text x={0} y={y + 28} className="compare-row-delta compare-row-delta-muted">
                      {delta.detail}
                    </text>

                    <rect
                      x={CENTER_X - HALF_WIDTH}
                      y={barY}
                      width={HALF_WIDTH}
                      height={BAR_HEIGHT}
                      className="compare-track"
                      rx={5}
                    />
                    <rect
                      x={CENTER_X}
                      y={barY}
                      width={HALF_WIDTH}
                      height={BAR_HEIGHT}
                      className="compare-track"
                      rx={5}
                    />

                    <rect
                      x={CENTER_X - widthA}
                      y={barY}
                      width={widthA}
                      height={BAR_HEIGHT}
                      fill={STAFF_GRADIENTS[0]}
                      rx={5}
                    />
                    <rect
                      x={CENTER_X}
                      y={barY}
                      width={widthB}
                      height={BAR_HEIGHT}
                      fill={STAFF_GRADIENTS[1]}
                      rx={5}
                    />

                    <text
                      x={CENTER_X - widthA - 6}
                      y={barY + BAR_HEIGHT / 2 + 4}
                      textAnchor="end"
                      className="compare-bar-value compare-bar-value-a"
                    >
                      {formatMetricDisplay(row.valueA, definition.unit)}
                    </text>
                    <text
                      x={CENTER_X + widthB + 6}
                      y={barY + BAR_HEIGHT / 2 + 4}
                      textAnchor="start"
                      className="compare-bar-value compare-bar-value-b"
                    >
                      {formatMetricDisplay(row.valueB, definition.unit)}
                    </text>

                    <g transform={`translate(${CENTER_X}, ${barY - 4})`}>
                      <rect
                        x={-28}
                        y={-12}
                        width={56}
                        height={18}
                        rx={9}
                        className={`compare-delta-badge compare-delta-${delta.tone}`}
                      />
                      <text y={1} textAnchor="middle" className="compare-delta-text">
                        {delta.text}
                      </text>
                    </g>
                  </g>
                )
              })}
            </svg>
          </>
        )}
      </div>
    </section>
  )
}
