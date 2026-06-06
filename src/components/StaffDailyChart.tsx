import { useMemo, useState } from 'react'
import { STAFF_MEMBERS } from '../data/staff'
import {
  type ChartType,
  type MetricKey,
  METRIC_DEFINITIONS,
  formatAxisValue,
  getDailyStatsForStaff,
  getMetricDefinition,
  getMetricValue,
  getWeeklyStatsForStaff,
} from '../utils/dailyStats'
import type { PeriodRange } from '../utils/period'
import './StaffDailyChart.css'

interface ChartSlot {
  metric: MetricKey | null
  chartType: ChartType
}

const CHART_TYPES: { id: ChartType; label: string }[] = [
  { id: 'bar', label: 'Cột' },
  { id: 'line', label: 'Đường' },
  { id: 'area', label: 'Vùng' },
]

const SLOT_COLORS = ['#3b82f6', '#10b981', '#f59e0b'] as const

const DEFAULT_SLOTS: ChartSlot[] = [
  { metric: 'opportunities', chartType: 'bar' },
  { metric: 'revenueReceived', chartType: 'line' },
  { metric: 'amountToRecover', chartType: 'area' },
]

interface StaffDailyChartProps {
  period: PeriodRange
  refreshKey?: number
  editable?: boolean
}

const CHART_WIDTH = 900
const CHART_HEIGHT = 280
const PADDING = { top: 20, right: 56, bottom: 44, left: 48 }

type ActiveSlot = ChartSlot & { metric: MetricKey }
type StatsViewMode = 'day' | 'week'

const VIEW_MODES: { id: StatsViewMode; label: string }[] = [
  { id: 'day', label: 'Theo ngày' },
  { id: 'week', label: 'Theo tuần' },
]

export function StaffDailyChart({ period, refreshKey = 0, editable = true }: StaffDailyChartProps) {
  const [staffId, setStaffId] = useState(STAFF_MEMBERS[0].id)
  const [slots, setSlots] = useState<ChartSlot[]>(DEFAULT_SLOTS)
  const [viewMode, setViewMode] = useState<StatsViewMode>('day')

  const staff = STAFF_MEMBERS.find((item) => item.id === staffId) ?? STAFF_MEMBERS[0]
  const chartData = useMemo(() => {
    if (viewMode === 'week') {
      return getWeeklyStatsForStaff(staffId, period)
    }
    return getDailyStatsForStaff(staffId, period)
  }, [staffId, period, refreshKey, viewMode])

  const activeSlots = useMemo(
    () => slots.filter((slot): slot is ActiveSlot => slot.metric !== null),
    [slots],
  )

  const plotWidth = CHART_WIDTH - PADDING.left - PADDING.right
  const plotHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom

  const chartModel = useMemo(() => {
    if (activeSlots.length === 0) {
      return { countMax: 1, moneyMax: 1, series: [], xAt: () => 0, chartData }
    }

    const countMax = Math.max(
      1,
      ...activeSlots
        .filter((slot) => getMetricDefinition(slot.metric).unit === 'count')
        .flatMap((slot) => chartData.map((point) => getMetricValue(point, slot.metric))),
    )
    const moneyMax = Math.max(
      1,
      ...activeSlots
        .filter((slot) => getMetricDefinition(slot.metric).unit === 'money')
        .flatMap((slot) => chartData.map((point) => getMetricValue(point, slot.metric))),
    )

    const xStep = chartData.length > 1 ? plotWidth / (chartData.length - 1) : plotWidth
    const xAt = (index: number) =>
      PADDING.left + (chartData.length > 1 ? index * xStep : plotWidth / 2)

    const yCount = (value: number) => PADDING.top + plotHeight - (value / countMax) * plotHeight
    const yMoney = (value: number) => PADDING.top + plotHeight - (value / moneyMax) * plotHeight
    const yFor = (value: number, unit: 'count' | 'money') =>
      unit === 'count' ? yCount(value) : yMoney(value)

    const series = activeSlots.map((slot, seriesIndex) => {
      const definition = getMetricDefinition(slot.metric)
      const color = SLOT_COLORS[seriesIndex % SLOT_COLORS.length]
      const points = chartData.map((point, index) => ({
        x: xAt(index),
        y: yFor(getMetricValue(point, slot.metric), definition.unit),
        value: getMetricValue(point, slot.metric),
        label: point.label,
      }))

      const dayWidth = chartData.length > 0 ? plotWidth / chartData.length : plotWidth
      const barWidth = Math.min(32, (dayWidth * 0.78) / activeSlots.length)
      const barOffset = (seriesIndex - (activeSlots.length - 1) / 2) * (barWidth + 4)

      return { slot, definition, color, seriesIndex, points, barWidth, barOffset }
    })

    return { countMax, moneyMax, series, xAt, chartData }
  }, [activeSlots, chartData, plotHeight, plotWidth])

  const selectMetric = (slotIndex: number, metricKey: MetricKey) => {
    setSlots((current) =>
      current.map((slot, index) => {
        if (index !== slotIndex) return slot
        return {
          ...slot,
          metric: slot.metric === metricKey ? null : metricKey,
        }
      }),
    )
  }

  const isMetricUsedInOtherSlot = (metricKey: MetricKey, slotIndex: number) =>
    slots.some((slot, index) => index !== slotIndex && slot.metric === metricKey)

  const updateChartType = (slotIndex: number, chartType: ChartType) => {
    setSlots((current) =>
      current.map((slot, index) => (index === slotIndex ? { ...slot, chartType } : slot)),
    )
  }

  return (
    <section className="staff-daily-chart-card">
      <div className="staff-daily-chart-header">
        <div>
          <h3>Thống kê cá nhân</h3>
          <p>
            {staff.name} · {period.label} ·{' '}
            {viewMode === 'day' ? 'Theo ngày' : 'Theo tuần'}
          </p>
        </div>
        <div
          className={`stats-view-tabs${editable ? '' : ' stats-view-tabs-readonly'}`}
          role="tablist"
          aria-label="Kiểu thống kê"
        >
          {VIEW_MODES.map((mode) => (
            <button
              key={mode.id}
              type="button"
              role="tab"
              aria-selected={viewMode === mode.id}
              className={`stats-view-tab${viewMode === mode.id ? ' active' : ''}`}
              onClick={() => setViewMode(mode.id)}
              disabled={!editable}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {editable ? (
        <div className="staff-picker">
          <span className="picker-label">Nhân sự</span>
          <div className="staff-picker-list">
            {STAFF_MEMBERS.map((member) => (
              <button
                key={member.id}
                type="button"
                className={`picker-pill${member.id === staffId ? ' active' : ''}`}
                onClick={() => setStaffId(member.id)}
              >
                {member.name}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="staff-picker staff-picker-readonly">
          <span className="picker-label">Nhân sự</span>
          <span className="staff-readonly-name">{staff.name}</span>
        </div>
      )}

      <div className={`metric-slots${editable ? '' : ' metric-slots-readonly'}`}>
        {slots.map((slot, index) => (
          <div
            key={index}
            className={`metric-slot${slot.metric ? '' : ' metric-slot-inactive'}`}
          >
            <div className="metric-slot-title">
              Chỉ số {index + 1}
              {slot.metric && (
                <span
                  className="metric-slot-color"
                  style={{ background: SLOT_COLORS[index % SLOT_COLORS.length] }}
                />
              )}
            </div>
            <div className="metric-picker">
              {METRIC_DEFINITIONS.map((metric) => {
                const isActive = slot.metric === metric.key
                const isUsedElsewhere = isMetricUsedInOtherSlot(metric.key, index)
                return (
                  <button
                    key={metric.key}
                    type="button"
                    className={`picker-pill picker-pill-sm${isActive ? ' active' : ''}${isUsedElsewhere ? ' used-elsewhere' : ''}`}
                    onClick={() => selectMetric(index, metric.key)}
                    disabled={!editable || (isUsedElsewhere && !isActive)}
                    title={
                      isUsedElsewhere && !isActive
                        ? 'Chỉ số đã chọn ở khung khác'
                        : undefined
                    }
                  >
                    {metric.label}
                  </button>
                )
              })}
            </div>
            {slot.metric && (
              <div className="chart-type-picker">
                {CHART_TYPES.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    className={`type-pill${slot.chartType === type.id ? ' active' : ''}`}
                    onClick={() => updateChartType(index, type.id)}
                    disabled={!editable}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="combo-chart-wrap">
        {activeSlots.length === 0 ? (
          <div className="chart-empty">Chọn ít nhất một chỉ số để hiển thị biểu đồ</div>
        ) : (
          <>
            <svg
              viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
              className="combo-chart"
              role="img"
              aria-label={`Biểu đồ thống kê cá nhân ${viewMode === 'day' ? 'theo ngày' : 'theo tuần'} của ${staff.name}`}
            >
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const y = PADDING.top + plotHeight * (1 - ratio)
                const hasCount = activeSlots.some(
                  (slot) => getMetricDefinition(slot.metric).unit === 'count',
                )
                const hasMoney = activeSlots.some(
                  (slot) => getMetricDefinition(slot.metric).unit === 'money',
                )
                return (
                  <g key={`grid-${ratio}`}>
                    <line
                      x1={PADDING.left}
                      x2={CHART_WIDTH - PADDING.right}
                      y1={y}
                      y2={y}
                      className="chart-grid-line"
                    />
                    {hasCount && (
                      <text x={PADDING.left - 8} y={y + 4} className="chart-axis-label chart-axis-left">
                        {formatAxisValue(chartModel.countMax * ratio, 'count')}
                      </text>
                    )}
                    {hasMoney && (
                      <text
                        x={CHART_WIDTH - PADDING.right + 8}
                        y={y + 4}
                        className="chart-axis-label chart-axis-right"
                      >
                        {formatAxisValue(chartModel.moneyMax * ratio, 'money')}
                      </text>
                    )}
                  </g>
                )
              })}

              {chartModel.series.map(({ slot, definition, color, seriesIndex, points, barWidth, barOffset }) => {
                if (slot.chartType === 'bar') {
                  return (
                    <g key={`series-${seriesIndex}-${definition.key}-bar`}>
                      {points.map((point, pointIndex) => (
                        <rect
                          key={`series-${seriesIndex}-bar-${pointIndex}`}
                          x={point.x + barOffset - barWidth / 2}
                          y={point.y}
                          width={barWidth}
                          height={PADDING.top + plotHeight - point.y}
                          fill={color}
                          opacity={0.9}
                          rx={3}
                        />
                      ))}
                    </g>
                  )
                }

                const pathD = points
                  .map((point, pointIndex) => `${pointIndex === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
                  .join(' ')

                const areaD = `${pathD} L ${points[points.length - 1]?.x ?? 0} ${PADDING.top + plotHeight} L ${points[0]?.x ?? 0} ${PADDING.top + plotHeight} Z`

                return (
                  <g key={`series-${seriesIndex}-${definition.key}-${slot.chartType}`}>
                    {slot.chartType === 'area' && (
                      <path d={areaD} fill={color} opacity={0.18} />
                    )}
                    <path
                      d={pathD}
                      fill="none"
                      stroke={color}
                      strokeWidth={2.5}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                    {points.map((point, pointIndex) => (
                      <circle
                        key={`series-${seriesIndex}-point-${pointIndex}`}
                        cx={point.x}
                        cy={point.y}
                        r={3.5}
                        fill="#fff"
                        stroke={color}
                        strokeWidth={2}
                      />
                    ))}
                  </g>
                )
              })}

              {chartModel.chartData.map((point, index) => (
                <text
                  key={point.date}
                  x={chartModel.xAt(index)}
                  y={CHART_HEIGHT - 14}
                  className="chart-axis-label chart-axis-bottom"
                  textAnchor="middle"
                >
                  {viewMode === 'week'
                    ? point.label.split(' ')[0]
                    : point.label.split('/')[0]}
                </text>
              ))}
            </svg>

            <div className="chart-legend">
              {chartModel.series.map(({ slot, definition, color, seriesIndex }) => (
                <div key={`legend-${seriesIndex}-${definition.key}`} className="chart-legend-item">
                  <span className="legend-swatch" style={{ background: color }} />
                  <span>{definition.label}</span>
                  <span className="legend-type">
                    ({CHART_TYPES.find((type) => type.id === slot.chartType)?.label})
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
