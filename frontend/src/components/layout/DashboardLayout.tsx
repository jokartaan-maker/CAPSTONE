import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { CapstoneLogotype } from '../../components/ui/CapstoneLogotype'
import './DashboardLayout.css'

import {
  iconBuilding,
  iconInfo,
  iconPersonSearch,
  iconPersons,
  iconGradCap,
  iconMonitor,
  iconShieldCheck,
  iconPerson,
  iconHelp,
} from '../../assets/icons/index'

const NavIco = ({ src }: { src: string }) => (
  <img src={src} alt="" className="ds-nav-icon" />
)

const NAV_SECTIONS = [
  {
    title: null,
    links: [
      { to: '/student/dashboard', end: true,  icon: iconBuilding,    label: 'نظرة عامة' },
    ],
  },
  {
    title: 'المشروع',
    links: [
      { to: '/student/ideas',            icon: iconInfo,         label: 'بنك الأفكار'       },
      { to: '/student/teams/explore',    icon: iconPersonSearch, label: 'استكشاف الفرق'      },
      { to: '/student/my-team',          icon: iconPersons,      label: 'فريقي'              },
      { to: '/student/join-requests',    icon: iconGradCap,      label: 'طلبات الانضمام'     },
      { to: '/student/team/tasks',       icon: iconMonitor,      label: 'مهام الفريق'        },
      { to: '/student/reports',          icon: iconShieldCheck,  label: 'التقارير والملفات'  },
      { to: '/student/supervisor-notes', icon: iconPerson,       label: 'ملاحظات المشرف'     },
    ],
  },
  {
    title: 'الحساب',
    links: [
      { to: '/student/account', icon: iconHelp, label: 'حسابي والإشعارات' },
    ],
  },
]

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
    <div className="ds-shell">

      {/* ════════ SIDEBAR ════════ */}
      <aside className="ds-sidebar">

        {/* Logo */}
        <div className="ds-logo">
          <CapstoneLogotype variant="white" height={38} />
        </div>

        {/* Nav */}
        <nav className="ds-nav">
          {NAV_SECTIONS.map((section, si) => (
            <div key={si} className="ds-nav-section">
              {section.title && (
                <div className="ds-nav-section-title">{section.title}</div>
              )}
              {section.links.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={'end' in link ? link.end : false}
                  className={({ isActive }) =>
                    'ds-nav-link' + (isActive ? ' active' : '')
                  }
                >
                  <NavIco src={link.icon} />
                  <span>{link.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="ds-user">
          <div className="ds-user-avatar">{initials}</div>
          <div className="ds-user-info">
            <span className="ds-user-name">{student?.name ?? '—'}</span>
            <span className="ds-user-role">طالب</span>
          </div>
          <button
            className="ds-logout-btn"
            onClick={handleLogout}
            title="تسجيل الخروج"
            aria-label="تسجيل الخروج"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>

      </aside>

      {/* ════════ MAIN ════════ */}
      <div className="ds-main">
        <Outlet />
      </div>

    </div>
  )
}
