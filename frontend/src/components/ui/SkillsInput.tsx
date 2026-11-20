import { type KeyboardEvent, useState } from 'react'
import { FieldError } from './controls'

interface SkillsInputProps {
  label: string
  value: string[]
  onChange: (skills: string[]) => void
  maxSkills: number
  error?: string
  id?: string
  icon?: string
}

export function SkillsInput({
  label,
  value,
  onChange,
  maxSkills,
  error,
  id = 'skills',
  icon,
}: SkillsInputProps) {
  const [draft, setDraft] = useState('')
  const full = value.length >= maxSkills

  const add = () => {
    const v = draft.trim()
    setDraft('')
    if (!v || value.includes(v) || value.length >= maxSkills) return
    onChange([...value, v])
  }

  const remove = (s: string) => onChange(value.filter(x => x !== s))

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      add()
    } else if (e.key === 'Backspace' && !draft && value.length > 0) {
      remove(value[value.length - 1])
    }
  }

  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>
        {label}
        <span className="field-hint" style={{ display: 'inline', marginRight: 6 }}>
          ({value.length}/{maxSkills})
        </span>
      </label>

      <div className={`skills-box${error ? ' has-error' : ''}`}>
        {icon && (
          <img
            src={icon}
            alt=""
            aria-hidden
            style={{ width: 16, height: 16, opacity: .45, flexShrink: 0 }}
          />
        )}
        {value.map(s => (
          <span key={s} className="chip">
            {s}
            <button
              type="button"
              className="chip-remove"
              onClick={() => remove(s)}
              aria-label={`إزالة ${s}`}
            >
              ×
            </button>
          </span>
        ))}
        {!full && (
          <input
            id={id}
            className="skills-input-inner"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            onBlur={add}
            placeholder={value.length === 0 ? 'اكتب مهارة ثم اضغط Enter' : ''}
          />
        )}
      </div>

      {!error && (
        <span className="field-hint">اضغط Enter أو فاصلة لإضافة كل مهارة</span>
      )}
      <FieldError>{error}</FieldError>
    </div>
  )
}
