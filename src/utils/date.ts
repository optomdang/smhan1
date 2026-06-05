export function formatMonthKey(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}`
}

export function parseMonthKey(key: string): { year: number; month: number } {
  const [year, month] = key.split('-').map(Number)
  return { year, month: month - 1 }
}

export function formatDisplayDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  return `${day}/${month}/${year}`
}

export function getDaysInMonth(year: number, month: number): string[] {
  const days = new Date(year, month + 1, 0).getDate()
  return Array.from({ length: days }, (_, i) => {
    const day = i + 1
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  })
}

export function getCurrentMonthKey(): string {
  const now = new Date()
  return formatMonthKey(now.getFullYear(), now.getMonth())
}

export function getSeedMonthKey(): string {
  const year = new Date().getFullYear()
  return formatMonthKey(year, 0)
}

export function monthKeyToLabel(key: string): string {
  const { year, month } = parseMonthKey(key)
  return `Tháng ${month + 1}/${year}`
}
