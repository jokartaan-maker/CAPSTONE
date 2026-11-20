import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import capLogo from '../../assets/images/Capstone logo.png'

export function AppLayout() {
  const { student, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/student/login', { replace: true })
  }

  return (
    <div className="app-shell">

      <header className="topbar">
        <div className="topbar-inner">

          {/* Brand */}
          <Link to="/student/profile" className="topbar-brand">
            <img src={capLogo} alt="Capstone" />
            <span className="topbar-brand-name">Capstone</span>
          </Link>

          {/* Nav */}
          <nav className="topbar-nav">
            <NavLink
              to="/student/profile"
              end
              className={({ isActive }) =>
                'topbar-nav-link' + (isActive ? ' active' : '')
              }
            >
              الملف الشخصي
            </NavLink>
            <NavLink
              to="/student/profile/password"
              className={({ isActive }) =>
                'topbar-nav-link' + (isActive ? ' active' : '')
              }
            >
              كلمة المرور
            </NavLink>
          </nav>

          {/* User + Logout */}
          <div className="topbar-right">
            {student?.name && (
              <span className="topbar-username">{student.name}</span>
            )}
            <button className="topbar-logout" onClick={handleLogout}>
              تسجيل الخروج
            </button>
          </div>

        </div>
      </header>

      <main className="app-main">
        <div className="app-content">
          <Outlet />
        </div>
      </main>

    </div>
  )
}
