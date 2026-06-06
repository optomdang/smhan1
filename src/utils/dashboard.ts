import { STAFF_MEMBERS } from '../data/staff'
import type { OpportunityRow, ReceivableEntryRow, RevenueEntryRow, SourceOption } from '../types'
import { parseCurrency, formatCurrencyNumber } from './format'
import type { PeriodRange } from './period'
import { getMonthKeysInRange, isDateInRange } from './period'
import { loadStaffData } from './storage'

export interface StaffSummaryRow {
  staffId: string
  staffName: string
  opportunities: number
  fromMarketing: number
  fromSelfSearch: number
  fromInternal: number
  fromCsm: number
  revenueReceived: number
  projectsToRecover: number
  amountToRecover: number
}

export interface DashboardTotals {
  opportunities: number
  fromMarketing: number
  fromSelfSearch: number
  fromInternal: number
  fromCsm: number
  revenueReceived: number
  projectsToRecover: number
  amountToRecover: number
}

function filterByPeriod<T extends { date: string }>(rows: T[], period: PeriodRange): T[] {
  return rows.filter((row) => isDateInRange(row.date, period.start, period.end))
}

function loadStaffDataForPeriod(staffId: string, period: PeriodRange) {
  const monthKeys = getMonthKeysInRange(period.start, period.end)
  const opportunities: OpportunityRow[] = []
  const revenueRows: RevenueEntryRow[] = []
  const receivableRows: ReceivableEntryRow[] = []

  for (const monthKey of monthKeys) {
    const data = loadStaffData(staffId, monthKey)
    opportunities.push(...filterByPeriod(data.opportunities, period))
    revenueRows.push(...filterByPeriod(data.revenueRows, period))
    receivableRows.push(...filterByPeriod(data.receivableRows, period))
  }

  return { opportunities, revenueRows, receivableRows }
}

function countBySource(opportunities: OpportunityRow[], source: SourceOption): number {
  return opportunities.filter(
    (row) => row.company.trim() && row.source === source,
  ).length
}

function summarizeStaff(
  staffId: string,
  staffName: string,
  period: PeriodRange,
): StaffSummaryRow {
  const { opportunities, revenueRows, receivableRows } = loadStaffDataForPeriod(staffId, period)
  const filledOpportunities = opportunities.filter((row) => row.company.trim())

  return {
    staffId,
    staffName,
    opportunities: filledOpportunities.length,
    fromMarketing: countBySource(opportunities, 'Marketing'),
    fromSelfSearch: countBySource(opportunities, 'Tự tìm kiếm'),
    fromInternal: countBySource(opportunities, 'Nội bộ'),
    fromCsm: countBySource(opportunities, 'CSM'),
    revenueReceived: revenueRows.reduce(
      (sum, row) => sum + parseCurrency(row.moneyReceived),
      0,
    ),
    projectsToRecover: receivableRows.filter((row) => parseCurrency(row.receivable) > 0).length,
    amountToRecover: receivableRows.reduce(
      (sum, row) => sum + parseCurrency(row.receivable),
      0,
    ),
  }
}

export function getDashboardRows(period: PeriodRange): StaffSummaryRow[] {
  return STAFF_MEMBERS.map((staff) =>
    summarizeStaff(staff.id, staff.name, period),
  )
}

export function getDashboardTotals(rows: StaffSummaryRow[]): DashboardTotals {
  return rows.reduce(
    (acc, row) => ({
      opportunities: acc.opportunities + row.opportunities,
      fromMarketing: acc.fromMarketing + row.fromMarketing,
      fromSelfSearch: acc.fromSelfSearch + row.fromSelfSearch,
      fromInternal: acc.fromInternal + row.fromInternal,
      fromCsm: acc.fromCsm + row.fromCsm,
      revenueReceived: acc.revenueReceived + row.revenueReceived,
      projectsToRecover: acc.projectsToRecover + row.projectsToRecover,
      amountToRecover: acc.amountToRecover + row.amountToRecover,
    }),
    {
      opportunities: 0,
      fromMarketing: 0,
      fromSelfSearch: 0,
      fromInternal: 0,
      fromCsm: 0,
      revenueReceived: 0,
      projectsToRecover: 0,
      amountToRecover: 0,
    },
  )
}

export function formatMoney(value: number): string {
  return `${formatCurrencyNumber(value)} đ`
}
