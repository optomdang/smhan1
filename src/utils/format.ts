export function formatCurrency(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (!digits) return ''
  return Number(digits).toLocaleString('vi-VN')
}

export function parseCurrency(value: string): number {
  const digits = value.replace(/\D/g, '')
  return digits ? Number(digits) : 0
}

export function formatCurrencyNumber(value: number): string {
  return value.toLocaleString('vi-VN')
}
