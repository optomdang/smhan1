import { useState, type FormEvent } from 'react'
import { DEFAULT_PASSWORD } from '../utils/auth'
import './StaffAuthModal.css'

interface StaffLoginModalProps {
  staffName: string
  loginId: string
  onClose: () => void
  onSubmit: (loginId: string, password: string) => { ok: true } | { ok: false; message: string }
}

export function StaffLoginModal({ staffName, loginId, onClose, onSubmit }: StaffLoginModalProps) {
  const [username, setUsername] = useState(loginId)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const result = onSubmit(username, password)
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
        aria-labelledby="staff-login-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="staff-auth-modal-header">
          <h2 id="staff-login-title">Đăng nhập để chỉnh sửa</h2>
          <p>
            Trang cá nhân: <strong>{staffName}</strong>
          </p>
        </div>

        <form className="staff-auth-form" onSubmit={handleSubmit}>
          <label className="staff-auth-field">
            <span>Tài khoản</span>
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              placeholder={loginId}
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
            <p>
              Định dạng tài khoản: họ và tên viết thường, không dấu (ví dụ:{' '}
              <code>{loginId}</code>)
            </p>
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
