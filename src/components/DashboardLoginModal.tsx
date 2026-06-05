import { useState, type FormEvent } from 'react'
import { DASHBOARD_EDITOR_IDS, STAFF_MEMBERS } from '../data/staff'
import { DEFAULT_PASSWORD } from '../utils/auth'
import { nameToLoginId } from '../utils/vietnamese'
import './StaffAuthModal.css'

interface DashboardLoginModalProps {
  onClose: () => void
  onSubmit: (loginId: string, password: string) => { ok: true } | { ok: false; message: string }
}

const EDITOR_HINTS = DASHBOARD_EDITOR_IDS.map((staffId) => {
  const staff = STAFF_MEMBERS.find((item) => item.id === staffId)
  return staff ? { name: staff.name, loginId: nameToLoginId(staff.name) } : null
}).filter((item): item is { name: string; loginId: string } => item !== null)

export function DashboardLoginModal({ onClose, onSubmit }: DashboardLoginModalProps) {
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const result = onSubmit(loginId, password)
    if (!result.ok) {
      setError(result.message)
      return
    }
    onClose()
  }

  return (
    <div className="staff-auth-overlay" role="presentation" onClick={onClose}>
      <div
        className="staff-auth-modal"
        role="dialog"
        aria-labelledby="dashboard-login-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="staff-auth-modal-header">
          <h2 id="dashboard-login-title">Đăng nhập chỉnh sửa Dashboard</h2>
          <p>Chỉ Lê Thị Hải Hiền và Hồ Thị Thắm có quyền tùy chỉnh.</p>
        </div>

        <form className="staff-auth-form" onSubmit={handleSubmit}>
          <label className="staff-auth-field">
            <span>Tài khoản</span>
            <input
              type="text"
              value={loginId}
              onChange={(event) => setLoginId(event.target.value)}
              autoComplete="username"
              placeholder="lethihaihien hoặc hothitham"
              required
            />
          </label>

          <label className="staff-auth-field">
            <span>Mật khẩu</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              placeholder="Nhập mật khẩu"
              required
            />
          </label>

          <div className="staff-auth-hint">
            {EDITOR_HINTS.map((editor) => (
              <p key={editor.loginId}>
                {editor.name}: <code>{editor.loginId}</code>
              </p>
            ))}
            <p>
              Mật khẩu mặc định: <code>{DEFAULT_PASSWORD}</code>
            </p>
          </div>

          {error && <p className="staff-auth-error">{error}</p>}

          <div className="staff-auth-actions">
            <button type="button" className="btn-auth-secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn-auth-primary">
              Đăng nhập
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
