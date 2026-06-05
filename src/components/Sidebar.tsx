import { NavLink } from 'react-router-dom'
import { STAFF_MEMBERS } from '../data/staff'
import './Sidebar.css'

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-badge">BC</div>
        <span className="sidebar-brand-title">Báo cáo</span>
        <span className="sidebar-brand-sub">Cơ hội &amp; Doanh số</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `sidebar-link sidebar-link-dashboard${isActive ? ' active' : ''}`
          }
        >
          <span className="sidebar-link-icon">▦</span>
          Dashboard
        </NavLink>

        <div className="sidebar-section">
          <span className="sidebar-section-label">Nhân sự</span>
          <ul className="sidebar-staff-list">
            {STAFF_MEMBERS.map((staff) => (
              <li key={staff.id}>
                <NavLink
                  to={`/staff/${staff.id}`}
                  className={({ isActive }) =>
                    `sidebar-link${isActive ? ' active' : ''}`
                  }
                >
                  {staff.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </aside>
  )
}
