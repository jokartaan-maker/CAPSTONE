import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import './ChangePasswordPage.css'
import './DashboardPage.css'
import { UnivLogo } from '../../components/ui/UnivLogo'
import { profileApi } from '../../api/profile'
import { ApiError, toFieldErrors } from '../../api/client'
import { PasswordInput } from '../../components/ui/controls'
import { Button } from '../../components/ui/Button'
import { Alert } from '../../components/ui/Alert'
import {  iconShieldCheck } from '../../assets/icons/index'

const PASS_HINT = '8 أحرف: حرف كبير + صغير + رقم + رمز، وتختلف عن الحالية'
  
export function ChangePasswordPage() {
  const [current, setCurrent]       = useState('')
  const [password, setPassword]     = useState('')
  const [confirm, setConfirm]       = useState('')
  const [errors, setErrors]         = useState<Record<string, string>>({})
  const [formError, setFormError]   = useState('')
  const [success, setSuccess]       = useState('')
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrors({})
    setFormError('')
    setSuccess('')

    const ce: Record<string, string> = {}
    if (!current)             ce.current_password      = 'كلمة المرور الحالية مطلوبة'
    if (!password)            ce.password              = 'كلمة المرور الجديدة مطلوبة'
    if (password !== confirm) ce.password_confirmation = 'تأكيد كلمة المرور غير مطابق'
    if (Object.keys(ce).length) { setErrors(ce); return }

    setSubmitting(true)
    try {
      const res = await profileApi.changePassword({
        current_password:      current,
        password,
        password_confirmation: confirm,
      })
      setSuccess(res.message)
      setCurrent('')
      setPassword('')
      setConfirm('')
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
    <>
      {/* topbar */}
      <header className="db-topbar">
        <div className="db-topbar-breadcrumb">
          <Link to="/student/dashboard">مساحة الطالب</Link>
          <span className="db-topbar-sep">/</span>
          <Link to="/student/profile">الملف الشخصي</Link>
          <span className="db-topbar-sep">/</span>
          <span className="db-topbar-current">تغيير كلمة المرور</span>
        </div>
        <div className="db-topbar-univ">
          <UnivLogo height={34} />
        </div>
      </header>

      <div className="db-body">
      {/* header */}
      <div className="page-head">
        <h1 className="page-title">تغيير كلمة المرور</h1>
        <Link to="/student/profile" className="btn btn-ghost">← العودة للملف</Link>
      </div>

      {/* ── Success state ── */}
      {success && (
        <div className="card">
          <div className="change-pass-success">
            <div className="change-pass-success-icon">
              <img
                src={iconShieldCheck} alt=""
                width={28} height={28}
                style={{ filter: 'brightness(0) invert(1)', opacity: .9 }}
              />
            </div>
            <h2>تم تغيير كلمة المرور</h2>
            <p>{success}</p>
            <Link to="/student/profile" className="btn btn-primary">
              العودة للملف الشخصي
            </Link>
          </div>
        </div>
      )}

      {/* ── Form ── */}
      {!success && (
        <form onSubmit={onSubmit} noValidate>
          <div className="card">
            {formError && <Alert variant="error">{formError}</Alert>}

            {/* info banner */}
            <div className="alert alert-info" style={{ marginBottom: 20 }}>
              بعد تغيير كلمة المرور سيتم تسجيل الخروج من جميع الأجهزة الأخرى تلقائياً.
            </div>

            <PasswordInput
              id="current_password"
              label="كلمة المرور الحالية"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={current}
              onChange={e => setCurrent(e.target.value)}
              error={errors.current_password}
            />

            <PasswordInput
              id="password"
              label="كلمة المرور الجديدة"
              required
              hint={PASS_HINT}
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              error={errors.password}
            />

            <PasswordInput
              id="password_confirmation"
              label="تأكيد كلمة المرور الجديدة"
              required
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              error={errors.password_confirmation}
            />

            <div className="form-actions">
              <Button type="submit" loading={submitting}>تغيير كلمة المرور</Button>
              <Link to="/student/profile" className="btn btn-ghost">إلغاء</Link>
            </div>
          </div>
        </form>
      )}
      </div>{/* end db-body */}
    </>
  )
}
