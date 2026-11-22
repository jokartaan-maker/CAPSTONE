import { useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './ResetPasswordPage.css'
import { authApi } from '../../api/auth'
import { ApiError, toFieldErrors } from '../../api/client'
import { AuthLayout } from '../../components/layout/AuthLayout'
import { PasswordInput } from '../../components/ui/controls'
import { Button } from '../../components/ui/Button'
import { Alert } from '../../components/ui/Alert'
import { iconShieldCheck } from '../../assets/icons'

const IconLogIn = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
    <polyline points="10 17 15 12 10 7"/>
    <line x1="15" y1="12" x2="3" y2="12"/>
  </svg>
)

function getStrength(p: string) {
  let score = 0
  if (p.length >= 8)            score++
  if (/[A-Z]/.test(p))          score++
  if (/[0-9]/.test(p))          score++
  if (/[^A-Za-z0-9]/.test(p))  score++
  return score
}

function StrengthBar({ password }: { password: string }) {
  const score  = getStrength(password)
  const labels = ['', 'ضعيفة', 'مقبولة', 'قوية', 'قوية جداً']
  const colors = ['', 'filled-weak', 'filled-fair', 'filled-good', 'filled-strong']
  const checks = [
    { label: '8 أحرف على الأقل',   ok: password.length >= 8 },
    { label: 'حرف كبير (A→Z)',      ok: /[A-Z]/.test(password) },
    { label: 'رقم واحد على الأقل', ok: /[0-9]/.test(password) },
    { label: 'رمز خاص (@ # ! …)',  ok: /[^A-Za-z0-9]/.test(password) },
  ]
  return (
    <div className="pass-strength">
      <div className="pass-strength-bar-wrap">
        {[0,1,2,3].map(i => (
          <div key={i} className={`pass-strength-seg${i < score ? ` ${colors[score]}` : ''}`} />
        ))}
      </div>
      {password && (
        <div className="pass-strength-label">كلمة مرور {labels[score]}</div>
      )}
      <div className="pass-strength-checks">
        {checks.map((c, i) => (
          <div key={i} className={`psc-item${c.ok ? ' ok' : ''}`}>
            <div className="psc-dot" />
            <span>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ResetPasswordPage() {
  const location = useLocation()
  // الـ token والإيميل يصلان عبر navigation state من ForgotPasswordPage
  const resetToken: string = (location.state as { resetToken?: string })?.resetToken ?? ''
  const email: string      = (location.state as { email?: string })?.email ?? ''

  const [password, setPassword]     = useState('')
  const [passConf, setPassConf]     = useState('')
  const [errors, setErrors]         = useState<Record<string, string>>({})
  const [formError, setFormError]   = useState('')
  const [success, setSuccess]       = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // إذا وصل المستخدم لهذه الصفحة بدون token (مباشرة من URL)
  if (!resetToken) {
    return (
      <AuthLayout topLink={<Link to="/student/forgot-password" className="auth-back-link">← طلب رمز جديد</Link>}>
        <div className="auth-heading"><h1>الجلسة غير صالحة</h1></div>
        <Alert variant="error">
          لا يمكن الوصول لهذه الصفحة مباشرة.{' '}
          <Link to="/student/forgot-password">ابدأ من صفحة الاستعادة</Link>
        </Alert>
      </AuthLayout>
    )
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrors({})
    setFormError('')
    const ce: Record<string, string> = {}
    if (password !== passConf)     ce.password_confirmation = 'كلمة المرور غير مطابقة'
    if (getStrength(password) < 2) ce.password = 'كلمة المرور ضعيفة جداً'
    if (Object.keys(ce).length) { setErrors(ce); return }
    setSubmitting(true)
    try {
      await authApi.resetPassword({
        token: resetToken,
        email,
        password,
        password_confirmation: passConf,
      })
      setSuccess(true)
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

  return (
    <AuthLayout
      topLink={<Link to="/student/login" className="auth-back-link">← العودة لتسجيل الدخول</Link>}
      eyebrow={success ? 'استعادة الحساب — اكتملت بنجاح' : 'استعادة الحساب — كلمة مرور جديدة'}
    >
      {success ? (
        <div className="reset-success">
          <div className="success-circle">
            <img src={iconShieldCheck} alt="" width={22} height={22} style={{ objectFit: 'contain' }} />
          </div>
          <h2>تم تغيير كلمة المرور</h2>
          <p>أصبح حسابك جاهزاً من جديد. يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة ومتابعة رحلتك الأكاديمية.</p>
          <div className="reset-success-safe-note">
            <img src={iconShieldCheck} alt="" width={13} height={13} style={{ opacity: .6, flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong>حسابك آمن</strong><br />
              تم تحديث كلمة المرور وإرسال إشعار أمني إلى بريدك الجامعي.
            </div>
          </div>
          <Link to="/student/login" className="btn btn-primary btn-block" style={{ marginTop: 4 }}>
            <IconLogIn />
            العودة إلى تسجيل الدخول
          </Link>
        </div>
      ) : (
        <>
          <div className="auth-heading">
            <h1>بداية جديدة وآمنة</h1>
            <p>اختر كلمة مرور قوية لم تستخدمها من قبل لحماية حسابك الجامعي.</p>
          </div>

          <form onSubmit={onSubmit} className="auth-form" noValidate>
            {formError && <Alert variant="error">{formError}</Alert>}

            <PasswordInput
              id="password" label="كلمة المرور الجديدة"
              required autoComplete="new-password"
              placeholder="••••••••••••"
              
              value={password} onChange={e => setPassword(e.target.value)}
              error={errors.password}
            />

            {password.length > 0 && <StrengthBar password={password} />}

            <PasswordInput
              id="password_conf" label="تأكيد كلمة المرور الجديدة"
              required autoComplete="new-password"
              placeholder="••••••••••••"
              
              value={passConf} onChange={e => setPassConf(e.target.value)}
              error={errors.password_confirmation}
            />

            {passConf.length > 0 && password === passConf && (
              <div className="pass-match-note">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                كلمتا المرور متطابقتان
              </div>
            )}

            <Button type="submit" loading={submitting} className="btn-block" style={{ marginTop: 10 }}>
              ✓ حفظ كلمة المرور الجديدة
            </Button>

            <div className="sent-hint" style={{ textAlign: 'center', marginTop: 10 }}>
              بعد الحفظ، ستحتاج إلى الدخول بكلمة المرور الجديدة.
            </div>
          </form>
        </>
      )}
    </AuthLayout>
  )
}
