import type { OpportunityRow, RevenueRow, StaffMonthData } from '../types'
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

function createDefaultRevenues(monthKey: string): RevenueRow[] {
  const { year, month } = parseMonthKey(monthKey)
  return getDaysInMonth(year, month).map((date) => ({
    id: createId(),
    date,
    project: '',
    moneyReceived: '',
    receivable: '',
  }))
}

export function loadStaffData(staffId: string, monthKey: string): StaffMonthData {
  const raw = localStorage.getItem(storageKey(staffId, monthKey))
  if (raw) {
    try {
      return JSON.parse(raw) as StaffMonthData
    } catch {
      /* fall through */
    }
  }
  return {
    opportunities: createDefaultOpportunities(monthKey),
    revenues: createDefaultRevenues(monthKey),
  }
}

export function saveStaffData(
  staffId: string,
  monthKey: string,
  data: StaffMonthData,
): void {
  localStorage.setItem(storageKey(staffId, monthKey), JSON.stringify(data))
}
