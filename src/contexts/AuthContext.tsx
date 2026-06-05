import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  changePassword as changePasswordApi,
  canEditDashboard as canEditDashboardApi,
  clearSession,
  getSession,
  isLoggedInAs,
  login as loginApi,
  loginToDashboard as loginToDashboardApi,
  type StaffSession,
} from '../utils/auth'

interface AuthContextValue {
  session: StaffSession | null
  canEditDashboard: boolean
  isLoggedInAs: (staffId: string) => boolean
  login: (staffId: string, loginId: string, password: string) => ReturnType<typeof loginApi>
  loginToDashboard: (loginId: string, password: string) => ReturnType<typeof loginToDashboardApi>
  logout: () => void
  changePassword: (
    staffId: string,
    currentPassword: string,
    newPassword: string,
  ) => ReturnType<typeof changePasswordApi>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<StaffSession | null>(() => getSession())

  const login = useCallback((staffId: string, loginId: string, password: string) => {
    const result = loginApi(staffId, loginId, password)
    if (result.ok) {
      setSession(getSession())
    }
    return result
  }, [])

  const loginToDashboard = useCallback((loginId: string, password: string) => {
    const result = loginToDashboardApi(loginId, password)
    if (result.ok) {
      setSession(getSession())
    }
    return result
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setSession(null)
  }, [])

  const changePassword = useCallback(
    (staffId: string, currentPassword: string, newPassword: string) => {
      return changePasswordApi(staffId, currentPassword, newPassword)
    },
    [],
  )

  const value = useMemo(
    () => ({
      session,
      canEditDashboard: canEditDashboardApi(),
      isLoggedInAs: (staffId: string) => isLoggedInAs(staffId),
      login,
      loginToDashboard,
      logout,
      changePassword,
    }),
    [session, login, loginToDashboard, logout, changePassword],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
