import type { OpportunityRow, RevenueRow } from '../types'
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
  const revenues: RevenueRow[] = []

  for (const monthKey of monthKeys) {
    const data = loadStaffData(staffId, monthKey)
    opportunities.push(...data.opportunities.filter((row) => isDateInRange(row.date, period.start, period.end)))
    revenues.push(...data.revenues.filter((row) => isDateInRange(row.date, period.start, period.end)))
  }

  return { opportunities, revenues }
}

export function getDailyStatsForStaff(staffId: string, period: PeriodRange): DailyStatPoint[] {
  const { opportunities, revenues } = loadRowsForPeriod(staffId, period)
  const dates = getDatesInPeriod(period)

  return dates.map((date) => {
    const dayOpportunities = opportunities.filter((row) => row.date === date)
    const dayRevenues = revenues.filter((row) => row.date === date)

    return {
      date,
      label: formatDisplayDate(date),
      opportunities: dayOpportunities.filter((row) => row.company.trim()).length,
      customerSources: dayOpportunities.filter((row) => row.company.trim() && row.source).length,
      revenueReceived: dayRevenues.reduce((sum, row) => sum + parseCurrency(row.moneyReceived), 0),
      projectsToRecover: dayRevenues.filter((row) => parseCurrency(row.receivable) > 0).length,
      amountToRecover: dayRevenues.reduce((sum, row) => sum + parseCurrency(row.receivable), 0),
    }
  })
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
