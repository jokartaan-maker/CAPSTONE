import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Spinner } from './ui/Spinner'

/** مسارات تحتاج تسجيل دخول: توجّه إلى /student/login مع حفظ الصفحة المطلوبة. */
export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) return <Spinner variant="page" label="جارٍ التحقق من الجلسة..." />
  if (!isAuthenticated) {
    return <Navigate to="/student/login" state={{ from: location }} replace />
  }
  return <Outlet />
}

/** مسارات عامة فقط: إذا كان المستخدم مسجّلاً تُحوّله إلى لوحة التحكم. */
export function PublicOnlyRoute() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) return <Spinner variant="page" label="جارٍ التحقق من الجلسة..." />
  if (isAuthenticated) return <Navigate to="/student/dashboard" replace />
  return <Outlet />
}
