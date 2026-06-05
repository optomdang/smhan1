import { DASHBOARD_EDITOR_IDS, STAFF_MEMBERS } from '../data/staff'
import { nameToLoginId } from './vietnamese'

export const DEFAULT_PASSWORD = '12345678'

const ACCOUNTS_KEY = 'staff-auth-accounts'
const SESSION_KEY = 'staff-auth-session'

export interface StaffAccount {
  staffId: string
  loginId: string
  password: string
}

export interface StaffSession {
  staffId: string
  loginId: string
}

interface AccountStore {
  accounts: StaffAccount[]
}

function loadAccountStore(): AccountStore {
  const raw = localStorage.getItem(ACCOUNTS_KEY)
  if (raw) {
    try {
      return JSON.parse(raw) as AccountStore
    } catch {
      /* fall through */
    }
  }
  return { accounts: [] }
}

function saveAccountStore(store: AccountStore): void {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(store))
}

export function getStaffLoginId(staffId: string): string | undefined {
  const staff = STAFF_MEMBERS.find((item) => item.id === staffId)
  return staff ? nameToLoginId(staff.name) : undefined
}

export function ensureStaffAccounts(): void {
  const store = loadAccountStore()
  const byStaffId = new Map(store.accounts.map((item) => [item.staffId, item]))

  for (const staff of STAFF_MEMBERS) {
    const loginId = nameToLoginId(staff.name)
    const existing = byStaffId.get(staff.id)

    if (!existing) {
      store.accounts.push({
        staffId: staff.id,
        loginId,
        password: DEFAULT_PASSWORD,
      })
      continue
    }

    if (existing.loginId !== loginId) {
      existing.loginId = loginId
    }
  }

  saveAccountStore(store)
}

export function getSession(): StaffSession | null {
  const raw = sessionStorage.getItem(SESSION_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as StaffSession
  } catch {
    return null
  }
}

export function clearSession(): void {
  sessionStorage.removeItem(SESSION_KEY)
}

export function isLoggedInAs(staffId: string): boolean {
  const session = getSession()
  return session?.staffId === staffId
}

export function isDashboardEditor(staffId: string): boolean {
  return DASHBOARD_EDITOR_IDS.includes(staffId as (typeof DASHBOARD_EDITOR_IDS)[number])
}

export function canEditDashboard(): boolean {
  const session = getSession()
  return session ? isDashboardEditor(session.staffId) : false
}

export function loginToDashboard(
  loginId: string,
  password: string,
): { ok: true } | { ok: false; message: string } {
  const normalizedLoginId = loginId.trim().toLowerCase()
  const store = loadAccountStore()
  const account = store.accounts.find((item) => item.loginId === normalizedLoginId)

  if (!account) {
    return { ok: false, message: 'Tài khoản không tồn tại.' }
  }

  if (!isDashboardEditor(account.staffId)) {
    return { ok: false, message: 'Tài khoản không có quyền chỉnh sửa Dashboard.' }
  }

  if (account.password !== password) {
    return { ok: false, message: 'Mật khẩu không chính xác.' }
  }

  const session: StaffSession = { staffId: account.staffId, loginId: account.loginId }
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return { ok: true }
}

export function login(
  staffId: string,
  loginId: string,
  password: string,
): { ok: true } | { ok: false; message: string } {
  const normalizedLoginId = loginId.trim().toLowerCase()
  const store = loadAccountStore()
  const account = store.accounts.find((item) => item.staffId === staffId)

  if (!account) {
    return { ok: false, message: 'Không tìm thấy tài khoản nhân sự.' }
  }

  if (account.loginId !== normalizedLoginId) {
    return { ok: false, message: 'Tài khoản không đúng với nhân sự này.' }
  }

  if (account.password !== password) {
    return { ok: false, message: 'Mật khẩu không chính xác.' }
  }

  const session: StaffSession = { staffId, loginId: account.loginId }
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return { ok: true }
}

export function changePassword(
  staffId: string,
  currentPassword: string,
  newPassword: string,
): { ok: true } | { ok: false; message: string } {
  if (newPassword.length < 8) {
    return { ok: false, message: 'Mật khẩu mới phải có ít nhất 8 ký tự.' }
  }

  const store = loadAccountStore()
  const account = store.accounts.find((item) => item.staffId === staffId)

  if (!account) {
    return { ok: false, message: 'Không tìm thấy tài khoản.' }
  }

  if (account.password !== currentPassword) {
    return { ok: false, message: 'Mật khẩu hiện tại không chính xác.' }
  }

  account.password = newPassword
  saveAccountStore(store)
  return { ok: true }
}
