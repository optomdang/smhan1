export interface StaffMember {
  id: string
  name: string
}

/** Nhân sự được chỉnh sửa Dashboard (đăng nhập bằng tài khoản trang cá nhân) */
export const DASHBOARD_EDITOR_IDS = ['1', '2'] as const

/** Mặc định biểu đồ so sánh: hai nhân sự khác nhau */
export const DEFAULT_COMPARE_STAFF_IDS = {
  a: '1',
  b: '3',
} as const

export const STAFF_MEMBERS: StaffMember[] = [
  { id: '1', name: 'Lê Thị Hải Hiền' },
  { id: '2', name: 'Hồ Thị Thắm' },
  { id: '3', name: 'Hoàng Thị Khuyên' },
  { id: '4', name: 'Phạm Thị Quyên' },
  { id: '5', name: 'Vũ Đình San' },
  { id: '6', name: 'Nguyễn Đăng Thắng' },
  { id: '7', name: 'Ngô Thị Phương Trang' },
  { id: '8', name: 'Lê Hải Yến' },
  { id: '9', name: 'Đặng Thị Ngọc Anh' },
  { id: '10', name: 'Đặng Thị Ánh' },
  { id: '11', name: 'Nguyễn Thị Phương Anh' },
]

export function getStaffById(id: string): StaffMember | undefined {
  return STAFF_MEMBERS.find((s) => s.id === id)
}
