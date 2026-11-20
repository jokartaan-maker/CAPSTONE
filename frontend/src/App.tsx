import { Route, Routes } from 'react-router-dom'
import { ProtectedRoute, PublicOnlyRoute } from './components/ProtectedRoute'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { LoginPage } from './pages/student/LoginPage'
import { RegisterPage } from './pages/student/RegisterPage'
import { ForgotPasswordPage } from './pages/student/ForgotPasswordPage'
import { ResetPasswordPage } from './pages/student/ResetPasswordPage'
import { DashboardPage } from './pages/student/DashboardPage'
import { ProfilePage } from './pages/student/ProfilePage'
import { ChangePasswordPage } from './pages/student/ChangePasswordPage'
import { IdeasPage } from './pages/student/IdeasPage'
import { IdeaDetailPage } from './pages/student/IdeaDetailPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { RoleSelectionPage } from './pages/RoleSelectionPage'
import { RoleLoginPage, RoleRegisterPage } from './pages/RoleAuthPages'

export function App() {
  return (
    <Routes>
      <Route path="/" element={<RoleSelectionPage />} />

      <Route element={<PublicOnlyRoute />}>
        <Route path="/student/login"           element={<LoginPage />} />
        <Route path="/student/register"        element={<RegisterPage />} />
        <Route path="/student/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/student/reset-password"  element={<ResetPasswordPage />} />

        <Route path="/supervisor/login"    element={<RoleLoginPage role="supervisor" />} />
        <Route path="/committee/login"     element={<RoleLoginPage role="committee" />} />
        <Route path="/admin/login"         element={<RoleLoginPage role="admin" />} />
        <Route path="/supervisor/register" element={<RoleRegisterPage role="supervisor" />} />
        <Route path="/committee/register"  element={<RoleRegisterPage role="committee" />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/student/dashboard"        element={<DashboardPage />} />
          <Route path="/student/profile"          element={<ProfilePage />} />
          <Route path="/student/profile/password" element={<ChangePasswordPage />} />
          <Route path="/student/ideas"            element={<IdeasPage />} />
          <Route path="/student/ideas/:id"        element={<IdeaDetailPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
