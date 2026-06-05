import { useState, type FormEvent } from 'react'
import './StaffAuthModal.css'

interface ChangePasswordModalProps {
  staffName: string
  loginId: string
  onClose: () => void
  onSubmit: (
    currentPassword: string,
    newPassword: string,
  ) => { ok: true } | { ok: false; message: string }
}

export function ChangePasswordModal({
  staffName,
  loginId,
  onClose,
  onSubmit,
}: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu mới và xác nhận không khớp.')
      return
    }

    const result = onSubmit(currentPassword, newPassword)
    if (!result.ok) {
      setError(result.message)
      return
    }

    setSuccess('Đã đổi mật khẩu thành công.')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  return (
    <div className="staff-auth-overlay" role="presentation" onClick={onClose}>
      <div
        className="staff-auth-modal"
        role="dialog"
        aria-labelledby="change-password-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="staff-auth-modal-header">
          <h2 id="change-password-title">Đổi mật khẩu</h2>
          <p>
            {staffName} · <code>{loginId}</code>
          </p>
        </div>

        <form className="staff-auth-form" onSubmit={handleSubmit}>
          <label className="staff-auth-field">
            <span>Mật khẩu hiện tại</span>
            <input
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          <label className="staff-auth-field">
            <span>Mật khẩu mới</span>
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>

          <label className="staff-auth-field">
            <span>Xác nhận mật khẩu mới</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>

          {error && <p className="staff-auth-error">{error}</p>}
          {success && <p className="staff-auth-success">{success}</p>}

          <div className="staff-auth-actions">
            <button type="button" className="btn-auth-secondary" onClick={onClose}>
              Đóng
            </button>
            <button type="submit" className="btn-auth-primary">
              Lưu mật khẩu
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
