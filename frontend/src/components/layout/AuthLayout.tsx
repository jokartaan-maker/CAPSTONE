import { type ReactNode } from 'react'
import { CapstoneLogotype } from '../../components/ui/CapstoneLogotype'
import './AuthLayout.css'

interface AuthLayoutProps {
  children:     ReactNode
  eyebrow?:     string
  topLink?:     ReactNode
  footer?:      ReactNode
  roleEyebrow?: unknown
}

export function AuthLayout({ children, eyebrow, topLink, footer }: AuthLayoutProps) {
  return (
    <div className="al-shell" dir="rtl">

      {/* ══════════ PANEL: LEFT ══════════ */}
      <div className="al-panel">

        {/* header: شعار */}
        <div className="al-panel-header">
          <CapstoneLogotype variant="white" height={38} />
        </div>

        {/* body: أيقونة + عنوان + وصف */}
        <div className="al-panel-body">

          <div className="al-panel-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
              stroke="rgba(255,255,255,0.85)" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3.33 1.67 8.67 1.67 12 0v-5"/>
            </svg>
          </div>

          <h2 className="al-panel-title">منصة إدارة<br />مشاريع التخرج</h2>

          <p className="al-panel-sub">
            بيئة أكاديمية متكاملة تجمع الطلبة
            والمشرفين واللجنة العلمية في مكان واحد.
          </p>
        </div>

        {/* features list */}
        <div className="al-panel-features">
          {[
            {
              label: 'تشكيل الفرق وإدارة الأعضاء',
              icon: (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.2"
                  strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              ),
            },
            {
              label: 'متابعة تقدم المشروع خطوة بخطوة',
              icon: (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.2"
                  strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
              ),
            },
            {
              label: 'التواصل المباشر مع المشرف الأكاديمي',
              icon: (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.2"
                  strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              ),
            },
            {
              label: 'اعتماد المقترحات من اللجنة العلمية',
              icon: (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.2"
                  strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              ),
            },
          ].map((f, i) => (
            <div key={i} className="al-feature">
              <div className="al-feature-icon">{f.icon}</div>
              <span>{f.label}</span>
            </div>
          ))}
        </div>

        {/* panel footer */}
        <div className="al-panel-footer">
          <span className="al-panel-footer-pill">Capstone · 2027–2026</span>
        </div>

      </div>

      {/* ══════════ FORM SIDE: RIGHT ══════════ */}
      <div className="al-form-side">

        {/* topbar */}
        <div className="al-topbar">
          <CapstoneLogotype height={36} />
          <span className="al-topbar-year">العام الأكاديمي 2026–2027</span>
        </div>

        {/* scrollable area */}
        <div className="al-scroll">
          <div className="al-box">

            {topLink && <div className="al-back-wrap">{topLink}</div>}
            {eyebrow  && <p className="al-eyebrow">{eyebrow}</p>}

            {children}

            {footer && <div className="al-footer-row">{footer}</div>}

            <div className="al-secure-note">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              بياناتك محمية ضمن البيئة الجامعية الآمنة
            </div>

          </div>
        </div>

        {/* page footer */}
        <div className="al-page-footer">
          <span>© 2027-2026 Capstone — جميع الحقوق محفوظة</span>
          <div className="al-page-footer-links">
            <a href="#">سياسة الخصوصية</a>
            <span>·</span>
            <a href="#">العربية</a>
          </div>
        </div>

      </div>
    </div>
  )
}
