import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { AuthProvider } from './contexts/AuthContext'
import { DashboardPage } from './pages/DashboardPage'
import { StaffPage } from './pages/StaffPage'

const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, '')

function App() {
  return (
    <BrowserRouter basename={routerBasename || undefined}>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/staff/:staffId" element={<StaffPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
