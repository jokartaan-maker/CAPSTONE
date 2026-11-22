import { useState, useRef, type FormEvent, type KeyboardEvent, type ClipboardEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './ForgotPasswordPage.css'
import { authApi } from '../../api/auth'
import { ApiError, toFieldErrors } from '../../api/client'
import { AuthLayout } from '../../components/layout/AuthLayout'
import { Input } from '../../components/ui/controls'
import { Button } from '../../components/ui/Button'
import { Alert } from '../../components/ui/Alert'
import { iconShieldCheck } from '../../assets/icons'

const IconRefresh = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>
  </svg>
)

// ── مكوّن إدخال الـ OTP (6 خانات منفصلة) ──
function OtpInput({ value, onChange, disabled }: {
  value: string
  onChange: (v: string) => void
  disabled?: boolean
}) {
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  // نحوّل الـ string لمصفوفة 6 عناصر، كل عنصر رقم أو فراغ
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? '')

  const focus = (i: number) => inputs.current[i]?.focus()

  const handleChange = (i: number, raw: string) => {
    const d = raw.replace(/\D/g, '').slice(-1) // رقم واحد فقط
    const next = digits.map((v, idx) => (idx === i ? d : v))
    onChange(next.join(''))
    if (d && i < 5) setTimeout(() => focus(i + 1), 0)
  }

  const handleKey = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      if (digits[i]) {
        const next = digits.map((v, idx) => (idx === i ? '' : v))
        onChange(next.join(''))
      } else if (i > 0) {
        const next = digits.map((v, idx) => (idx === i - 1 ? '' : v))
        onChange(next.join(''))
        focus(i - 1)
      }
    } else if (e.key === 'ArrowRight' && i > 0) {
      focus(i - 1)
    } else if (e.key === 'ArrowLeft' && i < 5) {
      focus(i + 1)
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const next = Array.from({ length: 6 }, (_, i) => pasted[i] ?? '')
    onChange(next.join(''))
    setTimeout(() => focus(Math.min(pasted.length, 5)), 0)
  }

  return (
    <div className="otp-row">
      {[0, 1, 2, 3, 4, 5].map(i => (
        <input
          key={i}
          ref={el => { inputs.current[i] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i]}
          disabled={disabled}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste}
          onFocus={e => e.target.select()}
          className={`otp-cell${digits[i] ? ' filled' : ''}`}
        />
      ))}
    </div>
  )
}

type Step = 'email' | 'otp'

export function ForgotPasswordPage() {
  const navigate = useNavigate()

  const [step, setStep]             = useState<Step>('email')
  const [email, setEmail]           = useState('')
  const [otp, setOtp]               = useState('')
  const [errors, setErrors]         = useState<Record<string, string>>({})
  const [formError, setFormError]   = useState('')
  const [submitting, setSubmitting] = useState(false)

  // ── خطوة 1: إرسال الإيميل ──
  const onSubmitEmail = async (e: FormEvent) => {
    e.preventDefault()
    setErrors({})
    setFormError('')
    setSubmitting(true)
    try {
      await authApi.forgotPassword({ email: email.trim().toLowerCase() })
      setStep('otp')
    } catch (err) {
      if (err instanceof ApiError) {
        const fe = toFieldErrors(err.errors)
        setErrors(fe)
        if (!Object.keys(fe).length) setFormError(err.message)
      } else {
        setFormError('تعذّر الاتصال بالخادم، حاول مرة أخرى')
      }
    } finally {
      setSubmitting(false)
    }
  }

  // ── خطوة 2: التحقق من الـ OTP ──
  const onSubmitOtp = async (e: FormEvent) => {
    e.preventDefault()
    setErrors({})
    setFormError('')
    if (otp.replace(/\D/g, '').length < 6) {
      setErrors({ otp: 'أدخل الرمز المكوّن من 6 أرقام كاملاً' })
      return
    }
    setSubmitting(true)
    try {
      const res = await authApi.verifyOtp({ email: email.trim().toLowerCase(), otp })
      // ننتقل لصفحة كلمة المرور الجديدة ونمرر الـ token والإيميل عبر state
      navigate('/student/reset-password', {
        state: { resetToken: res.reset_token, email: res.email },
        replace: true,
      })
    } catch (err) {
      if (err instanceof ApiError) {
        const fe = toFieldErrors(err.errors)
        setErrors(fe)
        if (!Object.keys(fe).length) setFormError(err.message)
      } else {
        setFormError('تعذّر الاتصال بالخادم، حاول مرة أخرى')
      }
    } finally {
      setSubmitting(false)
    }
  }

  // ── إعادة إرسال الرمز ──
  const onResend = async () => {
    setOtp('')
    setErrors({})
    setFormError('')
    setSubmitting(true)
    try {
      await authApi.forgotPassword({ email: email.trim().toLowerCase() })
    } catch {
      // نتجاهل الخطأ — الرسالة الموحّدة من الـ backend لا تكشف شيئاً
    } finally {
      setSubmitting(false)
    }
  }


  return (
    <AuthLayout
      topLink={<Link to="/student/login" className="auth-back-link">← العودة لتسجيل الدخول</Link>}
      eyebrow={step === 'otp' ? 'استعادة الحساب — رمز التحقق' : 'استعادة الحساب'}
    >
      {step === 'email' ? (
        // ════════════ خطوة 1: إدخال الإيميل ════════════
        <>
          <div className="auth-heading">
            <h1>نسيت كلمة المرور؟</h1>
            <p>أدخل بريدك الجامعي وسنرسل إليك رمز تحقق لاستعادة حسابك.</p>
          </div>

          <form onSubmit={onSubmitEmail} className="auth-form" noValidate>
            {formError && <Alert variant="error">{formError}</Alert>}

            <Input
              id="email" label="البريد الإلكتروني الجامعي"
              type="email" required autoComplete="email"
              placeholder="sara.ahmad@aspu.edu.sy"
             
              value={email} onChange={e => setEmail(e.target.value)}
              error={errors.email}
            />

            <Button type="submit" loading={submitting} className="btn-block">
              إرسال رمز التحقق
            </Button>

            <div className="fp-info-note">
              <img src={iconShieldCheck} alt="" width={13} height={13} />
              <span>لأمان حسابك، ينتهي رمز التحقق بعد 10 دقائق ويمكن استخدامه مرة واحدة فقط.</span>
            </div>
          </form>

          <div className="auth-form-footer">
            هل يمكنك الوصول؟ <Link to="/student/login">تواصل مع الدعم الجامعي</Link>
          </div>
        </>
      ) : (
        // ════════════ خطوة 2: إدخال الـ OTP ════════════
        <>
          <div className="auth-heading">
            <h1>أدخل رمز التحقق</h1>
            <p>
              أرسلنا رمزاً مكوّناً من 6 أرقام إلى
              <strong style={{ color: 'var(--navy)', margin: '0 4px', direction: 'ltr', display: 'inline-block' }}>{email}</strong>
            </p>
          </div>

          <form onSubmit={onSubmitOtp} noValidate>
            {formError && <Alert variant="error">{formError}</Alert>}
            {errors.otp && <Alert variant="error">{errors.otp}</Alert>}

            <OtpInput value={otp} onChange={setOtp} disabled={submitting} />

            <div className="otp-hint">
              الرمز صالح لمدة 10 دقائق.
            </div>

            <Button
              type="submit"
              loading={submitting}
              className="btn-block"
              disabled={otp.replace(/\D/g, '').length < 6}
            >
              تحقق وتابع
            </Button>

            <div className="otp-actions-row">
              <button
                type="button"
                className="btn btn-ghost"
                style={{ fontSize: 12, padding: '6px 10px', minHeight: 'unset' }}
                onClick={() => { setStep('email'); setOtp(''); setErrors({}) }}
              >
                ← تعديل البريد
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                style={{ fontSize: 12, padding: '6px 10px', minHeight: 'unset', gap: 5 }}
                onClick={onResend}
                disabled={submitting}
              >
                <IconRefresh />
                إعادة إرسال الرمز
              </button>
            </div>
          </form>
        </>
      )}
    </AuthLayout>
  )
}
