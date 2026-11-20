import './Spinner.css'

export type SpinnerVariant = 'page' | 'inline' | 'overlay'
export type SpinnerSize    = 'sm' | 'md' | 'lg'

interface SpinnerProps {
  /** طريقة العرض:
   *  - `page`    → يغطي كامل الشاشة (تحميل أوّلي للصفحة)
   *  - `inline`  → يمتد عرض الحاوية مع padding (داخل بطاقة أو قسم)
   *  - `overlay` → يغطي الحاوية النسبية (position: relative على الأب)
   */
  variant?: SpinnerVariant

  /** حجم الـ ring */
  size?: SpinnerSize

  /** النص الظاهر تحت الـ ring — مرره null لإخفائه */
  label?: string | null
}

export function Spinner({
  variant = 'inline',
  size    = 'md',
  label   = 'جارٍ التحميل...',
}: SpinnerProps) {
  const classes = [
    'spinner',
    `spinner--${variant}`,
    size !== 'md' ? `spinner--${size}` : '',
  ].filter(Boolean).join(' ')

  return (
    <span className={classes} role="status" aria-live="polite" aria-label={label ?? 'جارٍ التحميل'}>
      <span className="spinner-ring" aria-hidden="true" />
      {label !== null && label && (
        <span className="spinner-label">{label}</span>
      )}
    </span>
  )
}
