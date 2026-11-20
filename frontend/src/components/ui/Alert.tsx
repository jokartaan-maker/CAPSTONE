import { type ReactNode } from 'react'

type AlertVariant = 'info' | 'success' | 'error' | 'warning'

interface AlertProps {
  variant?: AlertVariant
  children: ReactNode
}

export function Alert({ variant = 'info', children }: AlertProps) {
  const icons: Record<AlertVariant, string> = {
    error:   '✕',
    success: '✓',
    warning: '⚠',
    info:    'ℹ',
  }
  return (
    <div className={`alert alert-${variant}`} role="alert">
      <span style={{ flexShrink: 0, fontWeight: 700 }}>{icons[variant]}</span>
      <span>{children}</span>
    </div>
  )
}
