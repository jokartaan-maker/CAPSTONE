import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './RoleSelectionPage.css'
import { AuthLayout } from '../components/layout/AuthLayout'
import {
  iconPerson,      // الطالب       — شخص واحد
  iconMonitor,     // المشرف       — شاشة/مونيتور
  iconPersons,     // اللجنة       — شخصان
  iconShieldCheck, // مدير النظام  — درع + صح
  iconShield,      // ⓘ note       — درع بسيط
} from '../assets/icons'

const Ico = ({ src, size = 16 }: { src: string; size?: number }) => (
  <img src={src} alt="" width={size} height={size} style={{ objectFit: 'contain', display: 'block' }} />
)

type RoleKey = 'student' | 'supervisor' | 'committee' | 'admin'

const roles = [
  { key: 'student'    as RoleKey, title: 'الطالب',           desc: 'شكّل فريقك وابدأ مشروع تخرجك',   icon: iconPerson,      login: '/student/login',    register: '/student/register', registerLabel: 'إنشاء حساب طالب' },
  { key: 'supervisor' as RoleKey, title: 'المشرف الأكاديمي', desc: 'وجّه الفرق وتابع تقدم المشاريع',  icon: iconMonitor,     login: '/supervisor/login' },
  { key: 'committee'  as RoleKey, title: 'اللجنة العلمية',   desc: 'راجع المقترحات واعتمد المخرجات', icon: iconPersons,     login: '/committee/login' },
  { key: 'admin'      as RoleKey, title: 'مدير النظام',       desc: 'أدر الحسابات وإعدادات المنصة',   icon: iconShieldCheck, login: '/admin/login' },
]

export function RoleSelectionPage() {
  const [selected, setSelected] = useState<RoleKey>('student')
  const navigate  = useNavigate()
  const selectedRole = roles.find(r => r.key === selected)!

  return (
    <AuthLayout>
      {/* intro */}
      <div className="role-intro">
        <p className="role-intro-eyebrow">أهلاً بك في Capstone</p>
        <h1>ابدأ رحلتك باختيار دورك</h1>
        <p>اختر صفتك الأكاديمية للوصول إلى مساحة العمل المناسبة لك.</p>
      </div>

      {/* role cards */}
      <div className="role-select-grid">
        {roles.map(role => (
          <article
            key={role.key}
            className={`role-card${selected === role.key ? ' selected' : ''}`}
            onClick={() => setSelected(role.key)}
            role="radio"
            aria-checked={selected === role.key}
            tabIndex={0}
            onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setSelected(role.key)}
          >
            {/* top row: radio يمين، أيقونة يسار */}
            <div className="role-card-top">
              <div className="role-radio">
                <div className="role-radio-dot" />
              </div>
              <div className="role-card-icon">
                <Ico src={role.icon} size={16} />
              </div>
            </div>

            <div className="role-card-copy">
              <h3>{role.title}</h3>
              <p>{role.desc}</p>
            </div>

            {role.register && (
              <div className="role-card-register">
                <Link to={role.register} onClick={e => e.stopPropagation()}>
                  {role.registerLabel}
                </Link>
              </div>
            )}
          </article>
        ))}
      </div>

      {/* CTA */}
      <div className="role-cta-row">
        <button className="btn btn-primary btn-block" onClick={() => navigate(selectedRole.login)}>
          ← {`المتابعة كـ${selectedRole.title}`}
        </button>
      </div>

      {/* footer note */}
      <div className="role-footer-note">
        <Ico src={iconShield} size={12} />
        <span>يمكن للطلبة وأعضاء الهيئة الأكاديمية إنشاء حساب جديد.</span>
      </div>

      {/* year */}
      <div className="role-year-note">
        منصة إدارة مشاريع التخرج · العام الأكاديمي 2026-2027
      </div>
    </AuthLayout>
  )
}