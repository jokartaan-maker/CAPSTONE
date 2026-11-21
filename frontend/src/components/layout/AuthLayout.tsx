import { type ReactNode } from 'react'
import { UnivLogo } from '../ui/UnivLogo'

import sidebarBg from '../../assets/images/background.png'
import {
  iconPerson,       // فكرة  — شخص (بداية الرحلة)
  iconGradCap,      // إشراف — قبعة تخرج
  iconShieldCheck,  // إنجاز  — درع + صح
  iconShield,       // بيانات محمية — درع بسيط
  iconInfo,         // الدعم والمساعدة — دائرة info
} from '../../assets/icons'

const Ico = ({
  src,
  size = 14,
  opacity = 1,
  white = false,
}: {
  src: string
  size?: number
  opacity?: number
  white?: boolean   // يحوّل الأيقونة الداكنة لبيضاء (على خلفية داكنة)
}) => (
  <img
    src={src}
    alt=""
    width={size}
    height={size}
    style={{
      objectFit: 'contain',
      opacity,
      filter: white ? 'brightness(0) invert(1)' : undefined,
      display: 'block',
    }}
  />
)

interface AuthLayoutProps {
  children:     ReactNode
  roleEyebrow?: { label: string; icon: ReactNode }
  topLink?:     ReactNode
  footer?:      ReactNode
}

export function AuthLayout({ children, roleEyebrow, topLink, footer }: AuthLayoutProps) {
  return (
    <div className="auth-shell" dir="rtl">

      {/* ══ SIDEBAR ══ */}
      <aside
        className="auth-sidebar"
        style={{
          backgroundImage:    `url(${sidebarBg})`,
          backgroundSize:     'cover',
          backgroundPosition: 'center top',
        }}
      >
        <div className="auth-sidebar-overlay" />

        {/* logo */}
        <div className="auth-sidebar-logo">
          
        </div>

        {/* headline */}
        <div className="auth-sidebar-headline">
        
          <p>بيئة أكاديمية تجمع الطلبة والمشرفين واللجنة العلمية، لتنظيم كل خطوة في رحلة مشروع التخرج.</p>
        </div>

        {/* progress steps */}
        <div className="auth-sidebar-progress">
          <div className="asp-header">
            <span className="asp-title">رحلتك نحو الإنجاز</span>
            <span className="asp-badge">مسار متكامل</span>
          </div>
          <div className="asp-bar-wrap"><div className="asp-bar" /></div>
          <div className="asp-steps">
            {/* فكرة — شخص (بداية / تشكيل الفريق) */}
            <div className="asp-step">
              <div className="asp-step-icon active">
                <Ico src={iconPerson} size={15} white />
              </div>
              <span>فكرة</span>
            </div>
            {/* إشراف — قبعة تخرج */}
            <div className="asp-step">
              <div className="asp-step-icon">
                <Ico src={iconGradCap} size={15} white />
              </div>
              <span>إشراف</span>
            </div>
            {/* إنجاز — درع + صح */}
            <div className="asp-step">
              <div className="asp-step-icon">
                <Ico src={iconShieldCheck} size={15} white />
              </div>
              <span>إنجاز</span>
            </div>
          </div>
        </div>

        {/* sidebar bottom note */}
        <div className="auth-sidebar-footer">
          <Ico src={iconShieldCheck} size={12} white opacity={0.55} />
          <span>مساحة أكاديمية آمنة وموثوقة</span>
        </div>
      </aside>

      {/* ══ MAIN ══ */}
      <main className="auth-main">
        <div className="auth-content">
          <div className="auth-box">

            {/* top bar */}
            <div className="auth-box-topbar">
              {/* يسار: دعم */}
              <button className="auth-support-btn">
                <Ico src={iconInfo} size={13} opacity={0.55} />
                <span>الدعم والمساعدة</span>
              </button>
              {/* يمين: جامعة */}
              <div className="auth-univ-lockup">
                <UnivLogo height={32} />
              </div>
            </div>

            {/* back link */}
            {topLink && (
              <div style={{ marginBottom: 16 }}>{topLink}</div>
            )}

            {/* role eyebrow */}
            {roleEyebrow && (
              <div className="auth-role-eyebrow">
                <div className="auth-role-icon-wrap">{roleEyebrow.icon}</div>
                <span className="auth-role-label">{roleEyebrow.label}</span>
              </div>
            )}

            {children}

            {footer && <div className="auth-form-footer">{footer}</div>}

            {/* uni protection note */}
            <div className="auth-uni-note">
              <Ico src={iconShield} size={11} opacity={0.4} />
              <span>بياناتك محمية ضمن البيئة الجامعية</span>
            </div>

          </div>
        </div>

        {/* page footer */}
        <footer className="auth-page-footer">
          <span>© 2026 Capstone · جميع الحقوق محفوظة</span>
          <div className="auth-page-footer-links">
            <a href="#">سياسة الخصوصية</a>
            <span>·</span>
            <a href="#">العربية</a>
          </div>
        </footer>
      </main>

    </div>
  )
}
