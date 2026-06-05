import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import './Layout.css'

const STORAGE_KEY = 'sidebar-open'

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) !== 'false'
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(sidebarOpen))
  }, [sidebarOpen])

  return (
    <div className={`app-layout${sidebarOpen ? '' : ' sidebar-collapsed'}`}>
      <Sidebar />
      <div className="main-shell">
        <button
          type="button"
          className="sidebar-toggle"
          onClick={() => setSidebarOpen((open) => !open)}
          aria-label={sidebarOpen ? 'Ẩn sidebar' : 'Hiện sidebar'}
          title={sidebarOpen ? 'Ẩn sidebar' : 'Hiện sidebar'}
        >
          {sidebarOpen ? '‹' : '☰'}
        </button>
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
