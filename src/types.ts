export const SOURCE_OPTIONS = [
  'Marketing',
  'Tự tìm kiếm',
  'Nội bộ',
  'CSM',
] as const

export type SourceOption = (typeof SOURCE_OPTIONS)[number]

export interface OpportunityRow {
  id: string
  date: string
  company: string
  source: SourceOption | ''
  isExtra?: boolean
}

export interface RevenueEntryRow {
  id: string
  date: string
  project: string
  moneyReceived: string
  isExtra?: boolean
}

export interface ReceivableEntryRow {
  id: string
  date: string
  project: string
  receivable: string
  isExtra?: boolean
}

/** @deprecated Dùng RevenueEntryRow / ReceivableEntryRow */
export interface RevenueRow {
  id: string
  date: string
  project: string
  moneyReceived: string
  receivable: string
  isExtra?: boolean
}

export interface StaffMonthData {
  opportunities: OpportunityRow[]
  revenueRows: RevenueEntryRow[]
  receivableRows: ReceivableEntryRow[]
}
