import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './DashboardLayout.css'

import {
  iconPerson,
  iconPersons,
  iconGradCap,
  iconMonitor,
  iconPersonSearch,
  iconBuilding,
  iconInfo,
  iconShieldCheck,
  iconLockClosed,
  iconHelp,
} from '../../assets/icons/index'

/* icon helper inside sidebar */
const NavIco = ({ src }: { src: string }) => (
  <img src={src} alt="" className="dash-nav-link-icon" />
)

export function DashboardLayout() {
  const { student, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/student/login', { replace: true })
  }

  const initials = student?.name
    ? student.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : '؟'

  return (
    <div className="dash-shell">

      {/* ════════════════ SIDEBAR ════════════════ */}
      <aside className="dash-sidebar">

        {/* Logo */}
        <div className="dash-sidebar-logo">
          
          <div className="dash-sidebar-logo-text">
            <span className="dash-sidebar-logo-name">Capstone</span> <br></br>
            <span className="dash-sidebar-logo-tag">Student Workspace</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="dash-nav">

          {/* Main */}
          <div className="dash-nav-section">
            <NavLink
              to="/student/dashboard"
              end
              className={({ isActive }) => 'dash-nav-link' + (isActive ? ' active' : '')}
            >
              <NavIco src={iconBuilding} />
              نظرة عامة
            </NavLink>
          </div>

          {/* Project */}
          <div className="dash-nav-section">
            <div className="dash-nav-section-title">المشروع</div>
            <NavLink
              to="/student/ideas"
              className={({ isActive }) => 'dash-nav-link' + (isActive ? ' active' : '')}
            >
              <NavIco src={iconInfo} />
              بنك الأفكار
            </NavLink>
            <NavLink
              to="/student/teams/explore"
              className={({ isActive }) => 'dash-nav-link' + (isActive ? ' active' : '')}
            >
              <NavIco src={iconPersonSearch} />
              استكشاف الفرق
            </NavLink>
            <NavLink
              to="/student/my-team"
              className={({ isActive }) => 'dash-nav-link' + (isActive ? ' active' : '')}
            >
              <NavIco src={iconPersons} />
              فريقي
            </NavLink>
            <NavLink
              to="/student/join-requests"
              className={({ isActive }) => 'dash-nav-link' + (isActive ? ' active' : '')}
            >
              <NavIco src={iconGradCap} />
              طلبات الانضمام
            </NavLink>
            <NavLink
              to="/student/team/tasks"
              className={({ isActive }) => 'dash-nav-link' + (isActive ? ' active' : '')}
            >
              <NavIco src={iconMonitor} />
              مهام الفريق
            </NavLink>
            <NavLink
              to="/student/reports"
              className={({ isActive }) => 'dash-nav-link' + (isActive ? ' active' : '')}
            >
              <NavIco src={iconShieldCheck} />
              التقارير والملفات
            </NavLink>
            <NavLink
              to="/student/supervisor-notes"
              className={({ isActive }) => 'dash-nav-link' + (isActive ? ' active' : '')}
            >
              <NavIco src={iconPerson} />
              ملاحظات المشرف
            </NavLink>
          </div>

          {/* Account */}
          <div className="dash-nav-section">
            <div className="dash-nav-section-title">الحساب</div>
            <NavLink
              to="/student/profile"
              end
              className={({ isActive }) => 'dash-nav-link' + (isActive ? ' active' : '')}
            >
              <NavIco src={iconPerson} />
              الملف الشخصي
            </NavLink>
            <NavLink
              to="/student/profile/password"
              className={({ isActive }) => 'dash-nav-link' + (isActive ? ' active' : '')}
            >
              <NavIco src={iconLockClosed} />
              كلمة المرور
            </NavLink>
            <NavLink
              to="/student/help"
              className={({ isActive }) => 'dash-nav-link' + (isActive ? ' active' : '')}
            >
              <NavIco src={iconHelp} />
              حساب وانتباهات
            </NavLink>
          </div>

        </nav>

        {/* User footer */}
        <div className="dash-sidebar-user">
          <div className="dash-sidebar-avatar">{initials}</div>
          <div className="dash-sidebar-user-info">
            <span className="dash-sidebar-user-name">{student?.name ?? '—'}</span>
            <span className="dash-sidebar-user-role">طالب</span>
          </div>
          <button className="dash-sidebar-logout" onClick={handleLogout} title="تسجيل الخروج">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
              style={{ opacity: .6 }}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>

      </aside>

      {/* ════════════════ MAIN ════════════════ */}
      <div className="dash-main">
        <Outlet />
      </div>

    </div>
  )
}
