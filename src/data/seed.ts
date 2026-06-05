import { STAFF_MEMBERS } from './staff'
import type { OpportunityRow, RevenueRow, SourceOption, StaffMonthData } from '../types'
import { SOURCE_OPTIONS } from '../types'
import { getDaysInMonth, getSeedMonthKey, parseMonthKey } from '../utils/date'
import { formatCurrency } from '../utils/format'
import { createId } from '../utils/id'
import { saveStaffData } from '../utils/storage'

const SEED_FLAG = 'demo-seeded-v5-january'

const COMPANY_NAMES = [
  'Minh Phát', 'Đại Dương', 'Thành Công', 'Phượng Hoàng', 'Bảo An',
  'Tân Tiến', 'Gia Bảo', 'Thiên Long', 'An Khang', 'Vạn Xuân',
  'Đông Á', 'Smartech', 'GreenLife', 'BlueSky', 'Hải Đăng',
  'Kim Ngân', 'Phú Quý', 'Tâm An', 'Lotus', 'Saigon Tech',
  'Mekong', 'Ánh Dương', 'Bình Minh', 'Hoàng Gia', 'Việt Tiến',
  'Nam Phát', 'FPT Retail', 'Nova', 'Elip', 'Hòa Bình',
]

const PROJECT_TYPES = [
  'triển khai ERP', 'phát triển website', 'app mobile', 'hệ thống CRM',
  'nâng cấp POS', 'tích hợp API', 'bảo trì hệ thống', 'triển khai cloud',
  'dự án IoT', 'chatbot AI', 'landing page', 'social media',
  'hệ thống kế toán', 'quản lý kho', 'e-commerce', 'đào tạo nhân sự',
]

function hash(staffIndex: number, day: number, salt: number): number {
  return Math.abs(staffIndex * 997 + day * 131 + salt * 17)
}

function pick<T>(items: readonly T[], staffIndex: number, day: number, salt: number): T {
  return items[hash(staffIndex, day, salt) % items.length]
}

function generateCompany(staffIndex: number, day: number, salt = 0): string {
  const h = hash(staffIndex, day, salt)
  const prefixes = ['Công ty TNHH', 'Công ty CP', 'Tập đoàn', 'Công ty']
  const prefix = prefixes[h % prefixes.length]
  const name = COMPANY_NAMES[(h + staffIndex) % COMPANY_NAMES.length]
  return `${prefix} ${name}`
}

function generateProject(staffIndex: number, day: number, salt = 0): string {
  const type = pick(PROJECT_TYPES, staffIndex, day, salt)
  const client = COMPANY_NAMES[hash(staffIndex, day, salt + 5) % COMPANY_NAMES.length]
  return `Dự án ${type} - ${client}`
}

function generateMoney(staffIndex: number, day: number, salt = 0): number {
  const h = hash(staffIndex, day, salt + 10)
  if (h % 3 === 0) {
    const tens = 2 + (h % 9)
    return tens * 10_000_000
  }
  const millions = 3 + (h % 8)
  return millions * 1_000_000
}

function generateReceivable(staffIndex: number, day: number, money: number, salt = 0): number {
  const h = hash(staffIndex, day, salt + 20)
  if (h % 5 === 0) return 0
  const pct = 20 + (h % 26)
  const amount = Math.round((money * pct) / 100 / 1_000_000) * 1_000_000
  return Math.max(amount, 1_000_000)
}

function buildMonthData(monthKey: string, staffId: string): StaffMonthData {
  const staffIndex = Number(staffId) - 1
  const { year, month } = parseMonthKey(monthKey)
  const days = getDaysInMonth(year, month)

  const opportunities: OpportunityRow[] = []
  const revenues: RevenueRow[] = []

  for (let i = 0; i < days.length; i++) {
    const day = i + 1
    const date = days[i]
    const source = pick(SOURCE_OPTIONS, staffIndex, day, 1) as SourceOption

    opportunities.push({
      id: createId(),
      date,
      company: generateCompany(staffIndex, day),
      source,
    })

    if ((day + staffIndex) % 5 === 0) {
      opportunities.push({
        id: createId(),
        date,
        company: generateCompany(staffIndex, day, 3),
        source: pick(SOURCE_OPTIONS, staffIndex, day, 4) as SourceOption,
        isExtra: true,
      })
    }

    const money = generateMoney(staffIndex, day)
    revenues.push({
      id: createId(),
      date,
      project: generateProject(staffIndex, day),
      moneyReceived: formatCurrency(String(money)),
      receivable: formatCurrency(String(generateReceivable(staffIndex, day, money))),
    })

    if ((day + staffIndex) % 7 === 0) {
      const extraMoney = generateMoney(staffIndex, day, 7)
      revenues.push({
        id: createId(),
        date,
        project: generateProject(staffIndex, day, 8),
        moneyReceived: formatCurrency(String(extraMoney)),
        receivable: formatCurrency(String(generateReceivable(staffIndex, day, extraMoney, 9))),
        isExtra: true,
      })
    }
  }

  return { opportunities, revenues }
}

function clearNonSeedMonthData(seedMonthKey: string): void {
  const keysToRemove: string[] = []

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key) continue

    const match = key.match(/^staff-\d+-(\d{4}-\d{2})$/)
    if (match && match[1] !== seedMonthKey) {
      keysToRemove.push(key)
    }
  }

  keysToRemove.forEach((key) => localStorage.removeItem(key))
}

export function seedTestData(force = false): string {
  const monthKey = getSeedMonthKey()

  if (!force && localStorage.getItem(SEED_FLAG) === monthKey) {
    return monthKey
  }

  clearNonSeedMonthData(monthKey)

  for (const staff of STAFF_MEMBERS) {
    saveStaffData(staff.id, monthKey, buildMonthData(monthKey, staff.id))
  }

  localStorage.setItem(SEED_FLAG, monthKey)
  return monthKey
}

export function isTestDataSeeded(): boolean {
  return localStorage.getItem(SEED_FLAG) === getSeedMonthKey()
}

export function seedTestDataIfNeeded(): string {
  return seedTestData()
}

export { getSeedMonthKey }
