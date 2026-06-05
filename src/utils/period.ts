import {
  formatDisplayDate,
  formatMonthKey,
  getSeedMonthKey,
  monthKeyToLabel,
  parseMonthKey,
} from './date'

export type FilterMode = 'day' | 'week' | 'month'

export interface PeriodRange {
  mode: FilterMode
  start: string
  end: string
  label: string
  monthKey: string
}

export function toIsoDate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function parseIsoDate(date: string): { year: number; month: number; day: number } {
  const [year, month, day] = date.split('-').map(Number)
  return { year, month: month - 1, day }
}

export function isDateInRange(date: string, start: string, end: string): boolean {
  return date >= start && date <= end
}

export function getMonthKeysInRange(start: string, end: string): string[] {
  const keys = new Set<string>()
  const startParts = parseIsoDate(start)
  const endParts = parseIsoDate(end)
  let year = startParts.year
  let month = startParts.month

  while (year < endParts.year || (year === endParts.year && month <= endParts.month)) {
    keys.add(formatMonthKey(year, month))
    month++
    if (month > 11) {
      month = 0
      year++
    }
  }

  return [...keys]
}

export function getMonthPeriod(monthKey: string): PeriodRange {
  const { year, month } = parseMonthKey(monthKey)
  const lastDay = new Date(year, month + 1, 0).getDate()
  return {
    mode: 'month',
    start: toIsoDate(year, month, 1),
    end: toIsoDate(year, month, lastDay),
    label: monthKeyToLabel(monthKey),
    monthKey,
  }
}

export function getDayPeriod(date: string): PeriodRange {
  const { year, month } = parseIsoDate(date)
  return {
    mode: 'day',
    start: date,
    end: date,
    label: formatDisplayDate(date),
    monthKey: formatMonthKey(year, month),
  }
}

export function getWeekPeriod(anchorDate: string): PeriodRange {
  const { year, month, day } = parseIsoDate(anchorDate)
  const anchor = new Date(year, month, day)
  const weekday = anchor.getDay()
  const mondayOffset = weekday === 0 ? -6 : 1 - weekday

  const monday = new Date(year, month, day + mondayOffset)
  const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6)

  const start = toIsoDate(monday.getFullYear(), monday.getMonth(), monday.getDate())
  const end = toIsoDate(sunday.getFullYear(), sunday.getMonth(), sunday.getDate())

  return {
    mode: 'week',
    start,
    end,
    label: `Tuần ${formatDisplayDate(start)} – ${formatDisplayDate(end)}`,
    monthKey: formatMonthKey(parseIsoDate(anchorDate).year, parseIsoDate(anchorDate).month),
  }
}

export function shiftPeriod(period: PeriodRange, delta: number): PeriodRange {
  if (period.mode === 'month') {
    const { year, month } = parseMonthKey(period.monthKey)
    const date = new Date(year, month + delta, 1)
    return getMonthPeriod(formatMonthKey(date.getFullYear(), date.getMonth()))
  }

  const { year, month, day } = parseIsoDate(period.start)
  const shiftDays = period.mode === 'day' ? delta : delta * 7
  const next = new Date(year, month, day + shiftDays)
  const iso = toIsoDate(next.getFullYear(), next.getMonth(), next.getDate())

  return period.mode === 'day' ? getDayPeriod(iso) : getWeekPeriod(iso)
}

export function getDefaultPeriod(): PeriodRange {
  return getMonthPeriod(getSeedMonthKey())
}

export function todayIso(): string {
  const now = new Date()
  return toIsoDate(now.getFullYear(), now.getMonth(), now.getDate())
}
