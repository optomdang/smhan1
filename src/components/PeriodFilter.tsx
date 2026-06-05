import type { FilterMode, PeriodRange } from '../utils/period'
import {
  getDayPeriod,
  getMonthPeriod,
  getWeekPeriod,
  isDateInRange,
  shiftPeriod,
  todayIso,
} from '../utils/period'
import { formatMonthKey, parseMonthKey } from '../utils/date'
import './PeriodFilter.css'

interface PeriodFilterProps {
  period: PeriodRange
  onChange: (period: PeriodRange) => void
  readOnly?: boolean
}

const MODES: { id: FilterMode; label: string }[] = [
  { id: 'day', label: 'Ngày' },
  { id: 'week', label: 'Tuần' },
  { id: 'month', label: 'Tháng' },
]

export function PeriodFilter({ period, onChange, readOnly = false }: PeriodFilterProps) {
  const setMode = (mode: FilterMode) => {
    if (mode === period.mode) return
    const today = todayIso()

    if (mode === 'month') {
      onChange(getMonthPeriod(period.monthKey))
      return
    }
    if (mode === 'day') {
      const monthPeriod = getMonthPeriod(period.monthKey)
      onChange(
        getDayPeriod(
          isDateInRange(today, monthPeriod.start, monthPeriod.end)
            ? today
            : monthPeriod.start,
        ),
      )
      return
    }
    onChange(getWeekPeriod(isDateInRange(today, period.start, period.end) ? today : period.start))
  }

  const handleDateInput = (value: string) => {
    if (!value) return
    onChange(period.mode === 'day' ? getDayPeriod(value) : getWeekPeriod(value))
  }

  const dateInputValue =
    period.mode === 'week'
      ? period.start
      : period.start

  const monthInputValue = (() => {
    const { year, month } = parseMonthKey(period.monthKey)
    return `${year}-${String(month + 1).padStart(2, '0')}`
  })()

  if (readOnly) {
    return (
      <div className="period-filter period-filter-readonly">
        <span className="period-readonly-label">Kỳ báo cáo</span>
        <span className="period-label">{period.label}</span>
      </div>
    )
  }

  return (
    <div className="period-filter">
      <div className="period-mode-tabs" role="tablist" aria-label="Lọc theo thời gian">
        {MODES.map((mode) => (
          <button
            key={mode.id}
            type="button"
            role="tab"
            aria-selected={period.mode === mode.id}
            className={`period-mode-tab${period.mode === mode.id ? ' active' : ''}`}
            onClick={() => setMode(mode.id)}
          >
            {mode.label}
          </button>
        ))}
      </div>

      <div className="period-controls">
        <button
          type="button"
          className="period-nav"
          onClick={() => onChange(shiftPeriod(period, -1))}
          aria-label="Kỳ trước"
        >
          ‹
        </button>

        {period.mode === 'month' ? (
          <input
            type="month"
            className="period-input"
            value={monthInputValue}
            onChange={(e) => {
              if (!e.target.value) return
              const [year, month] = e.target.value.split('-').map(Number)
              onChange(getMonthPeriod(formatMonthKey(year, month - 1)))
            }}
          />
        ) : (
          <input
            type="date"
            className="period-input"
            value={dateInputValue}
            onChange={(e) => handleDateInput(e.target.value)}
          />
        )}

        <button
          type="button"
          className="period-nav"
          onClick={() => onChange(shiftPeriod(period, 1))}
          aria-label="Kỳ sau"
        >
          ›
        </button>
      </div>

      <span className="period-label">{period.label}</span>
    </div>
  )
}
