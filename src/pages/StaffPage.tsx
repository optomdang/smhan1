import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ChangePasswordModal } from '../components/ChangePasswordModal'
import { MonthPicker } from '../components/MonthPicker'
import { OpportunityTable } from '../components/OpportunityTable'
import { ReceivableTable } from '../components/ReceivableTable'
import { RevenueTable } from '../components/RevenueTable'
import { StaffLoginModal } from '../components/StaffLoginModal'
import { useAuth } from '../contexts/AuthContext'
import { getStaffById } from '../data/staff'
import { useStaffData } from '../hooks/useStaffData'
import { getStaffLoginId } from '../utils/auth'
import { getSeedMonthKey } from '../utils/date'
import { nameToLoginId } from '../utils/vietnamese'
import './StaffPage.css'

export function StaffPage() {
  const { staffId = '1' } = useParams<{ staffId: string }>()
  const staff = getStaffById(staffId)
  const [monthKey, setMonthKey] = useState(getSeedMonthKey)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
  const { isLoggedInAs, login, logout, changePassword } = useAuth()
  const loginId = staff ? nameToLoginId(staff.name) : ''
  const isAuthenticated = isLoggedInAs(staffId)

  const {
    opportunities,
    revenues,
    isEditing,
    isDirty,
    saveMessage,
    updateOpportunities,
    updateRevenues,
    addOpportunityRowAfter,
    addRevenueRowAfter,
    startEdit,
    cancelEdit,
    save,
  } = useStaffData(staffId, monthKey)

  useEffect(() => {
    if (isEditing && !isAuthenticated) {
      cancelEdit()
    }
  }, [isEditing, isAuthenticated, cancelEdit])

  if (!staff) {
    return (
      <div className="staff-page">
        <p className="not-found">Không tìm thấy nhân viên.</p>
      </div>
    )
  }

  const handleMonthChange = (nextMonthKey: string) => {
    if (isEditing && isDirty) {
      const confirmed = window.confirm(
        'Bạn có thay đổi chưa lưu. Chuyển tháng sẽ hủy các thay đổi này. Tiếp tục?',
      )
      if (!confirmed) return
    }
    setMonthKey(nextMonthKey)
  }

  const handleStartEdit = () => {
    if (isAuthenticated) {
      startEdit()
      return
    }
    setShowLoginModal(true)
  }

  const handleLogin = (username: string, password: string) => {
    const result = login(staffId, username, password)
    if (result.ok) {
      startEdit()
    }
    return result
  }

  const handleLogout = () => {
    if (isEditing && isDirty) {
      const confirmed = window.confirm('Bạn có thay đổi chưa lưu. Đăng xuất sẽ hủy các thay đổi này.')
      if (!confirmed) return
    }
    if (isEditing) {
      cancelEdit()
    }
    logout()
  }

  return (
    <div className="staff-page">
      <header className="staff-header">
        <div className="staff-title">
          <h1>{staff.name}</h1>
          <p className="staff-subtitle">
            Báo cáo cơ hội &amp; doanh số hằng ngày
            {isAuthenticated && (
              <span className="staff-login-badge">
                Đã đăng nhập · <code>{getStaffLoginId(staffId)}</code>
              </span>
            )}
          </p>
        </div>

        <div className="staff-header-actions">
          <div className="staff-edit-actions">
            {!isEditing ? (
              <button type="button" className="btn-staff btn-staff-edit" onClick={handleStartEdit}>
                Chỉnh sửa
              </button>
            ) : (
              <>
                <button type="button" className="btn-staff btn-staff-cancel" onClick={cancelEdit}>
                  Hủy
                </button>
                <button type="button" className="btn-staff btn-staff-save" onClick={save}>
                  Lưu
                </button>
              </>
            )}
            {isAuthenticated && (
              <>
                <button
                  type="button"
                  className="btn-staff btn-staff-password"
                  onClick={() => setShowChangePasswordModal(true)}
                >
                  Đổi mật khẩu
                </button>
                <button type="button" className="btn-staff btn-staff-logout" onClick={handleLogout}>
                  Đăng xuất
                </button>
              </>
            )}
            {saveMessage && <span className="staff-save-message">{saveMessage}</span>}
            {isEditing && isDirty && !saveMessage && (
              <span className="staff-dirty-hint">Chưa lưu</span>
            )}
          </div>
          <MonthPicker monthKey={monthKey} onChange={handleMonthChange} />
        </div>
      </header>

      <div className={`staff-content${isEditing ? '' : ' staff-content-readonly'}`}>
        <OpportunityTable
          rows={opportunities}
          monthKey={monthKey}
          editable={isEditing}
          onChange={(rows) => updateOpportunities(() => rows)}
          onAddRowAfter={addOpportunityRowAfter}
        />
        <RevenueTable
          rows={revenues}
          monthKey={monthKey}
          editable={isEditing}
          onChange={(rows) => updateRevenues(() => rows)}
          onAddRowAfter={addRevenueRowAfter}
        />
        <ReceivableTable
          rows={revenues}
          monthKey={monthKey}
          editable={isEditing}
          onChange={(rows) => updateRevenues(() => rows)}
          onAddRowAfter={addRevenueRowAfter}
        />
      </div>

      {showLoginModal && (
        <StaffLoginModal
          staffName={staff.name}
          loginId={loginId}
          onClose={() => setShowLoginModal(false)}
          onSubmit={handleLogin}
        />
      )}

      {showChangePasswordModal && (
        <ChangePasswordModal
          staffName={staff.name}
          loginId={loginId}
          onClose={() => setShowChangePasswordModal(false)}
          onSubmit={(currentPassword, newPassword) =>
            changePassword(staffId, currentPassword, newPassword)
          }
        />
      )}
    </div>
  )
}
