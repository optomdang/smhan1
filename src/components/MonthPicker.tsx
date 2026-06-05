import { formatMonthKey, monthKeyToLabel, parseMonthKey } from '../utils/date'
import './MonthPicker.css'

interface MonthPickerProps {
  monthKey: string
  onChange: (monthKey: string) => void
}

export function MonthPicker({ monthKey, onChange }: MonthPickerProps) {
  const { year, month } = parseMonthKey(monthKey)

  const shiftMonth = (delta: number) => {
    const date = new Date(year, month + delta, 1)
    onChange(formatMonthKey(date.getFullYear(), date.getMonth()))
  }

  return (
    <div className="month-picker">
      <button type="button" className="month-nav" onClick={() => shiftMonth(-1)} aria-label="Tháng trước">
        ‹
      </button>
      <span className="month-label">{monthKeyToLabel(monthKey)}</span>
      <button type="button" className="month-nav" onClick={() => shiftMonth(1)} aria-label="Tháng sau">
        ›
      </button>
    </div>
  )
}
