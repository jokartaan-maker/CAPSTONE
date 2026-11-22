import React from 'react'
import capstoneLogo from '../../assets/images/Capstone · شعار بخلفية شفافة.png'
import './Spinner.css'

export type SpinnerVariant = 'page' | 'inline' | 'overlay'
export type SpinnerSize    = 'sm' | 'md' | 'lg'

interface SpinnerProps {
  /**
   * - `page`    → يغطي كامل الشاشة (تحميل أوّلي للصفحة)
   * - `inline`  → داخل بطاقة أو قسم
   * - `overlay` → يغطي الحاوية النسبية
   */
  variant?: SpinnerVariant
  size?:    SpinnerSize
  /** النص الظاهر تحت الـ ring — مرره null لإخفائه */
  label?: string | null
}

export function Spinner({
  variant = 'inline',
  size    = 'md',
  label   = 'جارٍ التحميل...',
}: SpinnerProps) {

  /* ── Page variant: full branded loading screen ── */
  if (variant === 'page') {
    return (
      <div className="sp-page" role="status" aria-live="polite" aria-label={label ?? 'جارٍ التحميل'}>

        {/* Logo */}
        <div className="sp-page-logo">
          <img src={capstoneLogo} alt="Capstone" className="sp-page-logo-img" />
          <span className="sp-page-brand">Capstone</span>
        </div>

        {/* Animated bars */}
        <div className="sp-bars" aria-hidden="true">
          <span className="sp-bar" style={{ '--i': 0 } as React.CSSProperties} />
          <span className="sp-bar" style={{ '--i': 1 } as React.CSSProperties} />
          <span className="sp-bar" style={{ '--i': 2 } as React.CSSProperties} />
          <span className="sp-bar" style={{ '--i': 3 } as React.CSSProperties} />
          <span className="sp-bar" style={{ '--i': 4 } as React.CSSProperties} />
        </div>

        {/* Label */}
        {label !== null && label && (
          <p className="sp-page-label">{label}</p>
        )}

        {/* Tagline */}
        <p className="sp-page-tagline">منصة إدارة مشاريع التخرج</p>

      </div>
    )
  }

  /* ── Overlay variant ── */
  if (variant === 'overlay') {
    return (
      <div className="sp-overlay" role="status" aria-live="polite" aria-label={label ?? 'جارٍ التحميل'}>
        <div className="sp-overlay-inner">
          <span className={`sp-ring sp-ring--${size}`} aria-hidden="true" />
          {label !== null && label && (
            <span className="sp-label">{label}</span>
          )}
        </div>
      </div>
    )
  }

  /* ── Inline variant (default) ── */
  return (
    <span
      className={`sp-inline sp-inline--${size}`}
      role="status"
      aria-live="polite"
      aria-label={label ?? 'جارٍ التحميل'}
    >
      <span className={`sp-ring sp-ring--${size}`} aria-hidden="true" />
      {label !== null && label && (
        <span className="sp-label">{label}</span>
      )}
    </span>
  )
}
