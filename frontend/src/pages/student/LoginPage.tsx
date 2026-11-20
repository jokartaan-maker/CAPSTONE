import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import './LoginPage.css'
import { authApi } from '../../api/auth'
import { ApiError, toFieldErrors } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import { AuthLayout } from '../../components/layout/AuthLayout'
import { Input, PasswordInput } from '../../components/ui/controls'
import { Button } from '../../components/ui/Button'
import { Alert } from '../../components/ui/Alert'
import { iconPerson } from '../../assets/icons'

const RoleIco = ({ src }: { src: string }) => (
  <img src={src} alt="" width={20} height={20} style={{ objectFit: 'contain' }} />
)

export function LoginPage() {
  const { setSession } = useAuth()
  const navigate       = useNavigate()
  const location       = useLocation()
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/student/dashboard'

  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [remember, setRemember]     = useState(false)
  const [errors, setErrors]         = useState<Record<string, string>>({})
  const [formError, setFormError]   = useState('')
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrors({})
    setFormError('')
    setSubmitting(true)
    try {
      const res = await authApi.login({ email: email.trim().toLowerCase(), password, remember })
      setSession(res.token, res.student)
      navigate(from, { replace: true })
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
      topLink={<Link to="/" className="auth-back-link">← العودة لاختيار الدور</Link>}
      roleEyebrow={{ label: 'بوابة طالب', icon: <RoleIco src={iconPerson} /> }}
    >
      <div className="auth-heading">
        <h1>مرحباً بعودتك</h1>
        <p>ادخل إلى مساحتك لمتابعة فريقك ومهام مشروع تخرّجك.</p>
      </div>

      <form onSubmit={onSubmit} className="auth-form" noValidate>
        {formError && <Alert variant="error">{formError}</Alert>}

        <Input
          id="email" label="البريد الإلكتروني الجامعي"
          type="email" required autoComplete="email"
          placeholder="name@aspu.edu.sy"
          
          value={email} onChange={e => setEmail(e.target.value)}
          error={errors.email}
        />

        <PasswordInput
          id="password" label="كلمة المرور"
          required autoComplete="current-password"
          placeholder="••••••••••••"
          
          value={password} onChange={e => setPassword(e.target.value)}
          error={errors.password}
        />

        <div className="auth-options-row">
          <label className="auth-remember">
            <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
            تذكّرني
          </label>
          <Link to="/student/forgot-password" className="auth-forgot">نسيت كلمة المرور؟</Link>
        </div>

        <Button type="submit" loading={submitting} className="btn-block">
          ← تسجيل الدخول
        </Button>
      </form>

      <div className="auth-form-footer">
        ليس لديك حساب؟ <Link to="/student/register">إنشاء حساب طالب</Link>
      </div>
    </AuthLayout>
  )
}
