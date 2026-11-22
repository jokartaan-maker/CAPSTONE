import {
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type ReactNode,
  useState,
  useRef,
  useEffect,
} from 'react'

// ── helpers ──────────────────────────────────────────────────

export function FieldError({ children }: { children?: ReactNode }) {
  if (!children) return null
  return <span className="field-error">{children}</span>
}

function FieldLabel({
  id,
  label,
  required,
}: {
  id?: string
  label: ReactNode
  required?: boolean
}) {
  return (
    <label htmlFor={id} className="field-label">
      {required && <span className="req">* </span>}
      {label}
    </label>
  )
}

// ── Input (with optional left-side icon) ─────────────────────

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
  /** أيقونة PNG تظهر على اليمين داخل الحقل */
  icon?: string
}

export function Input({
  label,
  error,
  hint,
  icon,
  id,
  required,
  className = '',
  ...rest
}: InputProps) {
  return (
    <div className={`field ${className}`.trim()}>
      <FieldLabel id={id} label={label} required={required} />
      <div className="input-wrap">
        {icon && <img src={icon} alt="" className="input-icon" aria-hidden />}
        <input
          id={id}
          className={`control${!icon ? ' no-icon' : ''}${error ? ' has-error' : ''}`}
          aria-invalid={!!error}
          {...rest}
        />
      </div>
      {hint && !error && <span className="field-hint">{hint}</span>}
      <FieldError>{error}</FieldError>
    </div>
  )
}

// ── PasswordInput ─────────────────────────────────────────────

interface PasswordProps extends Omit<InputProps, 'type'> {}

export function PasswordInput({
  label,
  error,
  hint,
  icon,
  id,
  required,
  className = '',
  ...rest
}: PasswordProps) {
  const [show, setShow] = useState(false)
  return (
    <div className={`field ${className}`.trim()}>
      <FieldLabel id={id} label={label} required={required} />
      <div className="input-wrap">
        {icon && <img src={icon} alt="" className="input-icon" aria-hidden />}
        <input
          id={id}
          type={show ? 'text' : 'password'}
          className={`control${!icon ? ' no-icon' : ''}${error ? ' has-error' : ''}`}
          style={{ paddingLeft: '52px' }}
          aria-invalid={!!error}
          {...rest}
        />
        <button
          type="button"
          className="input-eye"
          onClick={() => setShow(s => !s)}
          tabIndex={-1}
          aria-label={show ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
        >
          {show ? 'إخفاء' : 'إظهار'}
        </button>
      </div>
      {hint && !error && <span className="field-hint">{hint}</span>}
      <FieldError>{error}</FieldError>
    </div>
  )
}

// ── Select ────────────────────────────────────────────────────

interface SelectOption {
  value: string | number
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: string
  options: SelectOption[]
  placeholder?: string
  icon?: string
}

export function Select({
  label,
  error,
  options,
  placeholder,
  icon,
  id,
  required,
  className = '',
  ...rest
}: SelectProps) {
  return (
    <div className={`field ${className}`.trim()}>
      <FieldLabel id={id} label={label} required={required} />
      <div className="input-wrap">
        {icon && <img src={icon} alt="" className="input-icon" aria-hidden />}
        <select
          id={id}
          className={`control${!icon ? ' no-icon' : ''}${error ? ' has-error' : ''}`}
          aria-invalid={!!error}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map(o => (
            <option key={String(o.value)} value={String(o.value)}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <FieldError>{error}</FieldError>
    </div>
  )
}

// ── CustomSelect — dropdown مخصص بدل <select> الافتراضي ──────
interface CustomSelectProps {
  id?: string
  label: string
  required?: boolean
  placeholder?: string
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  error?: string
  className?: string
}

export function CustomSelect({
  id, label, required, placeholder, value, onChange, options, error, className = '',
}: CustomSelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const selected = options.find(o => String(o.value) === value)
  const display  = selected ? selected.label : placeholder ?? '— اختر —'

  return (
    <div className={`field ${className}`.trim()}>
      <FieldLabel id={id} label={label} required={required} />
      <div className="cselect-wrap" ref={ref}>
        <button
          type="button"
          id={id}
          className={`cselect-btn${open ? ' open' : ''}${!value ? ' placeholder' : ''}${error ? ' has-error' : ''}`}
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          aria-haspopup="listbox"
        >
          <span>{display}</span>
          <svg
            className={`cselect-chevron${open ? ' rotated' : ''}`}
            width="13" height="13" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {open && (
          <div className="cselect-menu" role="listbox">
            {options.map(o => {
              const isActive = String(o.value) === value
              return (
                <button
                  key={String(o.value)}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  className={`cselect-item${isActive ? ' active' : ''}`}
                  onClick={() => { onChange(String(o.value)); setOpen(false) }}
                >
                  <span style={{ flex: 1 }}>{o.label}</span>
                  {isActive && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5"
                      strokeLinecap="round" strokeLinejoin="round"
                      style={{ flexShrink: 0 }}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
      {error && <span className="field-error">{error}</span>}
    </div>
  )
}

// ── Checkbox ──────────────────────────────────────────────────

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode
  error?: string
}

export function Checkbox({ label, error, id, className = '', ...rest }: CheckboxProps) {
  return (
    <div className={`checkbox-wrap ${className}`.trim()}>
      <label className="checkbox-label" htmlFor={id}>
        <input id={id} type="checkbox" {...rest} />
        <span>{label}</span>
      </label>
      <FieldError>{error}</FieldError>
    </div>
  )
}
