import type {
  OpportunityRow,
  ReceivableEntryRow,
  RevenueEntryRow,
  RevenueRow,
  StaffMonthData,
} from '../types'
import { createId } from './id'
import { getDaysInMonth, parseMonthKey } from './date'

export function storageKey(staffId: string, monthKey: string): string {
  return `staff-${staffId}-${monthKey}`
}

function createDefaultOpportunities(monthKey: string): OpportunityRow[] {
  const { year, month } = parseMonthKey(monthKey)
  return getDaysInMonth(year, month).map((date) => ({
    id: createId(),
    date,
    company: '',
    source: '',
  }))
}

function createDefaultRevenueRows(monthKey: string): RevenueEntryRow[] {
  const { year, month } = parseMonthKey(monthKey)
  return getDaysInMonth(year, month).map((date) => ({
    id: createId(),
    date,
    project: '',
    moneyReceived: '',
  }))
}

function createDefaultReceivableRows(monthKey: string): ReceivableEntryRow[] {
  const { year, month } = parseMonthKey(monthKey)
  return getDaysInMonth(year, month).map((date) => ({
    id: createId(),
    date,
    project: '',
    receivable: '',
  }))
}

function migrateLegacyData(raw: unknown, monthKey: string): StaffMonthData | null {
  if (!raw || typeof raw !== 'object') return null

  const parsed = raw as Record<string, unknown>
  if (Array.isArray(parsed.revenueRows) && Array.isArray(parsed.receivableRows)) {
    return {
      opportunities: (parsed.opportunities as OpportunityRow[]) ?? createDefaultOpportunities(monthKey),
      revenueRows: parsed.revenueRows as RevenueEntryRow[],
      receivableRows: parsed.receivableRows as ReceivableEntryRow[],
    }
  }

  if (!Array.isArray(parsed.revenues)) return null

  const revenues = parsed.revenues as RevenueRow[]
  return {
    opportunities: (parsed.opportunities as OpportunityRow[]) ?? createDefaultOpportunities(monthKey),
    revenueRows: revenues.map((row) => ({
      id: row.id,
      date: row.date,
      project: row.project,
      moneyReceived: row.moneyReceived,
      isExtra: row.isExtra,
    })),
    receivableRows: revenues.map((row) => ({
      id: createId(),
      date: row.date,
      project: row.project,
      receivable: row.receivable,
      isExtra: row.isExtra,
    })),
  }
}

export function loadStaffData(staffId: string, monthKey: string): StaffMonthData {
  const raw = localStorage.getItem(storageKey(staffId, monthKey))
  if (raw) {
    try {
      const migrated = migrateLegacyData(JSON.parse(raw), monthKey)
      if (migrated) return migrated
    } catch {
      /* fall through */
    }
  }
  return {
    opportunities: createDefaultOpportunities(monthKey),
    revenueRows: createDefaultRevenueRows(monthKey),
    receivableRows: createDefaultReceivableRows(monthKey),
  }
}

export function saveStaffData(
  staffId: string,
  monthKey: string,
  data: StaffMonthData,
): void {
  localStorage.setItem(storageKey(staffId, monthKey), JSON.stringify(data))
}
