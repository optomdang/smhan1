import type { OpportunityRow, ReceivableEntryRow, RevenueEntryRow } from '../types'
import { formatDisplayDate } from './date'
import { parseCurrency } from './format'
import type { PeriodRange } from './period'
import { getMonthKeysInRange, isDateInRange, parseIsoDate, toIsoDate } from './period'
import { loadStaffData } from './storage'

export type MetricKey =
  | 'opportunities'
  | 'customerSources'
  | 'revenueReceived'
  | 'projectsToRecover'
  | 'amountToRecover'

export type ChartType = 'bar' | 'line' | 'area'

export interface DailyStatPoint {
  date: string
  label: string
  opportunities: number
  customerSources: number
  revenueReceived: number
  projectsToRecover: number
  amountToRecover: number
}

export interface MetricDefinition {
  key: MetricKey
  label: string
  unit: 'count' | 'money'
  color: string
}

export const METRIC_DEFINITIONS: MetricDefinition[] = [
  { key: 'opportunities', label: 'Cơ hội bán hàng', unit: 'count', color: '#3b82f6' },
  { key: 'customerSources', label: 'Nguồn khách hàng', unit: 'count', color: '#0ea5e9' },
  { key: 'revenueReceived', label: 'Doanh số tiền về', unit: 'money', color: '#10b981' },
  { key: 'projectsToRecover', label: 'Số DA cần thu hồi', unit: 'count', color: '#f59e0b' },
  { key: 'amountToRecover', label: 'Số tiền cần thu hồi', unit: 'money', color: '#ef4444' },
]

export function getMetricDefinition(key: MetricKey): MetricDefinition {
  return METRIC_DEFINITIONS.find((item) => item.key === key)!
}

function getDatesInPeriod(period: PeriodRange): string[] {
  const start = parseIsoDate(period.start)
  const end = parseIsoDate(period.end)
  const dates: string[] = []
  const cursor = new Date(start.year, start.month, start.day)
  const last = new Date(end.year, end.month, end.day)

  while (cursor <= last) {
    dates.push(toIsoDate(cursor.getFullYear(), cursor.getMonth(), cursor.getDate()))
    cursor.setDate(cursor.getDate() + 1)
  }

  return dates
}

function loadRowsForPeriod(staffId: string, period: PeriodRange) {
  const monthKeys = getMonthKeysInRange(period.start, period.end)
  const opportunities: OpportunityRow[] = []
  const revenueRows: RevenueEntryRow[] = []
  const receivableRows: ReceivableEntryRow[] = []

  for (const monthKey of monthKeys) {
    const data = loadStaffData(staffId, monthKey)
    opportunities.push(...data.opportunities.filter((row) => isDateInRange(row.date, period.start, period.end)))
    revenueRows.push(...data.revenueRows.filter((row) => isDateInRange(row.date, period.start, period.end)))
    receivableRows.push(...data.receivableRows.filter((row) => isDateInRange(row.date, period.start, period.end)))
  }

  return { opportunities, revenueRows, receivableRows }
}

function getMondayKey(date: string): string {
  const { year, month, day } = parseIsoDate(date)
  const weekday = new Date(year, month, day).getDay()
  const mondayOffset = weekday === 0 ? -6 : 1 - weekday
  const monday = new Date(year, month, day + mondayOffset)
  return toIsoDate(monday.getFullYear(), monday.getMonth(), monday.getDate())
}

function formatWeekLabel(mondayIso: string, weekIndex: number): string {
  const start = parseIsoDate(mondayIso)
  const sunday = new Date(start.year, start.month, start.day + 6)
  const endDay = sunday.getDate()
  const endMonth = sunday.getMonth() + 1
  return `T${weekIndex + 1} (${start.day}/${start.month + 1}–${endDay}/${endMonth})`
}

export function aggregateDailyStatsByWeek(daily: DailyStatPoint[]): DailyStatPoint[] {
  const weeks = new Map<string, DailyStatPoint>()

  for (const point of daily) {
    const weekKey = getMondayKey(point.date)
    const existing = weeks.get(weekKey)

    if (!existing) {
      weeks.set(weekKey, {
        date: weekKey,
        label: '',
        opportunities: point.opportunities,
        customerSources: point.customerSources,
        revenueReceived: point.revenueReceived,
        projectsToRecover: point.projectsToRecover,
        amountToRecover: point.amountToRecover,
      })
      continue
    }

    existing.opportunities += point.opportunities
    existing.customerSources += point.customerSources
    existing.revenueReceived += point.revenueReceived
    existing.projectsToRecover += point.projectsToRecover
    existing.amountToRecover += point.amountToRecover
  }

  return [...weeks.values()]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((point, index) => ({
      ...point,
      label: formatWeekLabel(point.date, index),
    }))
}

export function getDailyStatsForStaff(staffId: string, period: PeriodRange): DailyStatPoint[] {
  const { opportunities, revenueRows, receivableRows } = loadRowsForPeriod(staffId, period)
  const dates = getDatesInPeriod(period)

  return dates.map((date) => {
    const dayOpportunities = opportunities.filter((row) => row.date === date)
    const dayRevenueRows = revenueRows.filter((row) => row.date === date)
    const dayReceivableRows = receivableRows.filter((row) => row.date === date)

    return {
      date,
      label: formatDisplayDate(date),
      opportunities: dayOpportunities.filter((row) => row.company.trim()).length,
      customerSources: dayOpportunities.filter((row) => row.company.trim() && row.source).length,
      revenueReceived: dayRevenueRows.reduce((sum, row) => sum + parseCurrency(row.moneyReceived), 0),
      projectsToRecover: dayReceivableRows.filter((row) => parseCurrency(row.receivable) > 0).length,
      amountToRecover: dayReceivableRows.reduce((sum, row) => sum + parseCurrency(row.receivable), 0),
    }
  })
}

export function getWeeklyStatsForStaff(staffId: string, period: PeriodRange): DailyStatPoint[] {
  return aggregateDailyStatsByWeek(getDailyStatsForStaff(staffId, period))
}

export function getMetricValue(point: DailyStatPoint, key: MetricKey): number {
  return point[key]
}

export function getStaffPeriodTotals(
  staffId: string,
  period: PeriodRange,
): Record<MetricKey, number> {
  const daily = getDailyStatsForStaff(staffId, period)
  return {
    opportunities: daily.reduce((sum, point) => sum + point.opportunities, 0),
    customerSources: daily.reduce((sum, point) => sum + point.customerSources, 0),
    revenueReceived: daily.reduce((sum, point) => sum + point.revenueReceived, 0),
    projectsToRecover: daily.reduce((sum, point) => sum + point.projectsToRecover, 0),
    amountToRecover: daily.reduce((sum, point) => sum + point.amountToRecover, 0),
  }
}

export function formatMetricDisplay(value: number, unit: 'count' | 'money'): string {
  if (unit === 'money') {
    return `${formatAxisValue(value, 'money')} đ`
  }
  return formatAxisValue(value, 'count')
}

export function formatAxisValue(value: number, unit: 'count' | 'money'): string {
  if (unit === 'count') return String(Math.round(value))
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}tỷ`
  if (value >= 1_000_000) return `${Math.round(value / 1_000_000)}tr`
  if (value >= 1_000) return `${Math.round(value / 1_000)}k`
  return String(value)
}
