import {
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type ReactNode,
  useState,
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
