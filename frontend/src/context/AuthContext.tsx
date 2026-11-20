import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { authApi } from '../api/auth'
import { setAuthToken } from '../api/client'
import type { Student } from '../types/api'

const TOKEN_KEY = 'capstone_student_token'

interface AuthContextValue {
  student: Student | null
  token: string | null
  loading: boolean
  isAuthenticated: boolean
  setSession: (token: string, student: Student) => void
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [student, setStudent] = useState<Student | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [loading, setLoading] = useState(true)

  // ضبط الـ token في عميل HTTP فوراً
  useEffect(() => {
    setAuthToken(token)
  }, [token])

  // عند وجود token محفوظ: نتحقق من صحته عبر /me
  useEffect(() => {
    let active = true
    if (!token) {
      setLoading(false)
      return
    }
    void (async () => {
      try {
        const res = await authApi.me()
        if (active) setStudent(res.student)
      } catch {
        // token غير صالح/منتهي → نمسحه
        if (active) {
          localStorage.removeItem(TOKEN_KEY)
          setAuthToken(null)
          setToken(null)
          setStudent(null)
        }
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [token])

  const setSession = (newToken: string, newStudent: Student) => {
    localStorage.setItem(TOKEN_KEY, newToken)
    setAuthToken(newToken)
    setToken(newToken)
    setStudent(newStudent)
  }

  const refresh = async () => {
    const res = await authApi.me()
    setStudent(res.student)
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch {
      // تجاهل أخطاء الشبكة عند تسجيل الخروج
    }
    localStorage.removeItem(TOKEN_KEY)
    setAuthToken(null)
    setToken(null)
    setStudent(null)
  }

  return (
    <AuthContext.Provider
      value={{
        student,
        token,
        loading,
        isAuthenticated: !!token && !!student,
        setSession,
        logout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
