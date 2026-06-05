import { useEffect, useMemo, useState } from 'react'
import { ChangePasswordModal } from '../components/ChangePasswordModal'
import { CustomerSourceChart } from '../components/CustomerSourceChart'
import { DashboardLoginModal } from '../components/DashboardLoginModal'
import { DashboardSummaryTable } from '../components/DashboardSummaryTable'
import { PeriodFilter } from '../components/PeriodFilter'
import { StaffCompareChart } from '../components/StaffCompareChart'
import { StaffDailyChart } from '../components/StaffDailyChart'
import { useAuth } from '../contexts/AuthContext'
import { seedTestData } from '../data/seed'
import { getStaffById } from '../data/staff'
import { getDashboardRows, getDashboardTotals } from '../utils/dashboard'
import { getDefaultPeriod, getMonthPeriod } from '../utils/period'
import type { PeriodRange } from '../utils/period'
import { nameToLoginId } from '../utils/vietnamese'
import './DashboardPage.css'

export function DashboardPage() {
  const [period, setPeriod] = useState<PeriodRange>(getDefaultPeriod)
  const [refreshKey, setRefreshKey] = useState(0)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
  const { canEditDashboard, session, loginToDashboard, logout, changePassword } = useAuth()

  const editorStaff = session ? getStaffById(session.staffId) : undefined
  const editorLoginId = session ? nameToLoginId(editorStaff?.name ?? '') : ''

  useEffect(() => {
    const refresh = () => setRefreshKey((key) => key + 1)
    window.addEventListener('focus', refresh)
    return () => window.removeEventListener('focus', refresh)
  }, [])

  const rows = useMemo(
    () => getDashboardRows(period),
    [period, refreshKey],
  )

  const totals = useMemo(() => getDashboardTotals(rows), [rows])

  const handleReseed = () => {
    const monthKey = seedTestData(true)
    setPeriod((current) =>
      current.monthKey === monthKey ? current : getMonthPeriod(monthKey),
    )
    setRefreshKey((key) => key + 1)
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p className="dashboard-subtitle">
            Tổng hợp báo cáo cơ hội và doanh số toàn đội
            {canEditDashboard && editorStaff && (
              <span className="dashboard-login-badge">
                Đã đăng nhập · {editorStaff.name}
              </span>
            )}
          </p>
        </div>
        <div className="dashboard-toolbar">
          <div className="dashboard-auth-actions">
            {!canEditDashboard ? (
              <button
                type="button"
                className="btn-dashboard-edit"
                onClick={() => setShowLoginModal(true)}
              >
                Đăng nhập chỉnh sửa
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="btn-dashboard-password"
                  onClick={() => setShowChangePasswordModal(true)}
                >
                  Đổi mật khẩu
                </button>
                <button type="button" className="btn-dashboard-logout" onClick={logout}>
                  Đăng xuất
                </button>
              </>
            )}
          </div>
          {canEditDashboard && (
            <button type="button" className="btn-demo-data" onClick={handleReseed}>
              Nạp dữ liệu mẫu
            </button>
          )}
          <PeriodFilter
            period={period}
            onChange={setPeriod}
            readOnly={!canEditDashboard}
          />
        </div>
      </header>

      <div className="dashboard-main">
        <CustomerSourceChart totals={totals} />
        <DashboardSummaryTable rows={rows} totals={totals} periodLabel={period.label} />
      </div>

      <StaffDailyChart
        period={period}
        refreshKey={refreshKey}
        editable={canEditDashboard}
      />
      <StaffCompareChart
        period={period}
        refreshKey={refreshKey}
        editable={canEditDashboard}
      />

      {showLoginModal && (
        <DashboardLoginModal
          onClose={() => setShowLoginModal(false)}
          onSubmit={loginToDashboard}
        />
      )}

      {showChangePasswordModal && session && editorStaff && (
        <ChangePasswordModal
          staffName={editorStaff.name}
          loginId={editorLoginId}
          onClose={() => setShowChangePasswordModal(false)}
          onSubmit={(currentPassword, newPassword) =>
            changePassword(session.staffId, currentPassword, newPassword)
          }
        />
      )}
    </div>
  )
}
