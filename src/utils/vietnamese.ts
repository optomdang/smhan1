export function removeVietnameseDiacritics(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
}

/** Họ và tên → ID đăng nhập: viết thường, không dấu, không khoảng trắng */
export function nameToLoginId(name: string): string {
  return removeVietnameseDiacritics(name).toLowerCase().replace(/\s+/g, '')
}
