import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { seedTestDataIfNeeded } from './data/seed'
import { ensureStaffAccounts } from './utils/auth'
import './index.css'
import App from './App.tsx'

seedTestDataIfNeeded()
ensureStaffAccounts()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
