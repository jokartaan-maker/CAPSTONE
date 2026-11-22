import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './RegisterPage.css'
import { authApi } from '../../api/auth'
import { ApiError, toFieldErrors } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import { AuthLayout } from '../../components/layout/AuthLayout'
import { Input, PasswordInput, CustomSelect, Checkbox } from '../../components/ui/controls'
import { SkillsInput } from '../../components/ui/SkillsInput'
import { Button } from '../../components/ui/Button'
import { Alert } from '../../components/ui/Alert'
import { Spinner } from '../../components/ui/Spinner'
import type { RegisterOptions } from '../../types/api'

export function RegisterPage() {
  const { setSession } = useAuth()
  const navigate = useNavigate()

  const [options, setOptions] = useState<RegisterOptions | null>(null)
  const [optErr, setOptErr] = useState('')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConf, setPasswordConf] = useState('')
  const [universityNo, setUniversityNo] = useState('')
  const [major, setMajor] = useState('')
  const [studyYear, setStudyYear] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [terms, setTerms] = useState(false)

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    void (async () => {
      try { setOptions(await authApi.registerOptions()) }
      catch { setOptErr('تعذّر تحميل خيارات التسجيل، حدّث الصفحة') }
    })()
  }, [])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrors({})
    setFormError('')
    const ce: Record<string, string> = {}
    if (!name.trim()) ce.name = 'الاسم مطلوب'
    if (!email.trim()) ce.email = 'البريد الإلكتروني مطلوب'
    if (!password) ce.password = 'كلمة المرور مطلوبة'
    if (password !== passwordConf) ce.password_confirmation = 'تأكيد كلمة المرور غير مطابق'
    if (!universityNo) ce.university_number = 'الرقم الجامعي مطلوب'
    if (!major) ce.major = 'القسم مطلوب'
    if (!studyYear) ce.study_year = 'السنة الدراسية مطلوبة'
    if (!terms) ce.terms = 'يجب الموافقة على الشروط'
    if (Object.keys(ce).length) { setErrors(ce); return }
    setSubmitting(true)
    try {
      const res = await authApi.register({
        name: name.trim(), email: email.trim().toLowerCase(),
        password, password_confirmation: passwordConf,
        university_number: universityNo.trim(), major,
        study_year: Number(studyYear),
        skills: skills.length ? skills : undefined,
        terms: true,
      })
      setSession(res.token, res.student)
      navigate('/student/profile', { replace: true })
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

  if (!options && !optErr) return <Spinner variant="page" label="جارٍ تحميل بيانات التسجيل..." />

  return (
    <AuthLayout
      topLink={
        <div>
          <Link to="/" className="auth-back-link">← العودة لاختيار الدور</Link>
          <div className="auth-breadcrumb" style={{ marginTop: 3 }}>
            <Link to="/student/login">تسجيل الدخول</Link>
            <span className="auth-breadcrumb-sep">/</span>
            <span style={{ color: 'var(--text-light)' }}>إنشاء حساب</span>
          </div>
        </div>
      }
      eyebrow="بوابة الطالب"
      footer={<>لديك حساب بالفعل؟ <Link to="/student/login">تسجيل الدخول</Link></>}
    >
      <div className="auth-heading">
        <h1>مسيرتك تبدأ من هنا</h1>
        <p>أنشئ حسابك الجامعي وتعرّفنا على مهاراتك لبناء الفريق المناسب.</p>
      </div>

      <form onSubmit={onSubmit} className="auth-form" noValidate>
        {formError && <Alert variant="error">{formError}</Alert>}
        {optErr && <Alert variant="error">{optErr}</Alert>}

        <div className="form-section-title">البيانات الشخصية وبيانات الدخول</div>

        <div className="form-grid-2">
          <Input id="name" label="الاسم الكامل" required placeholder="سارة أحمد" value={name} onChange={e => setName(e.target.value)} error={errors.name} />
          <Input id="email" label="البريد الإلكتروني الجامعي" type="email" required placeholder="sara.ahmad@aspu.edu.sy" value={email} onChange={e => setEmail(e.target.value)} error={errors.email} />
        </div>

        <div className="form-grid-2">
          <PasswordInput id="password" label="كلمة المرور" required autoComplete="new-password" placeholder="••••••••••••" value={password} onChange={e => setPassword(e.target.value)} error={errors.password} />
          <PasswordInput id="password_conf" label="تأكيد كلمة المرور" required autoComplete="new-password" placeholder="••••••••••••" value={passwordConf} onChange={e => setPasswordConf(e.target.value)} error={errors.password_confirmation} />
        </div>

        <div className="form-section-title" style={{ marginTop: 4 }}>الملف الأكاديمي</div>

        <div className="form-grid-2">
          <Input id="uni_no" label="الرقم الجامعي" required placeholder="20221048" value={universityNo} onChange={e => setUniversityNo(e.target.value)} error={errors.university_number} />
          <CustomSelect id="major" label="القسم" required placeholder="هندسة البرمجيات" value={major} onChange={v => setMajor(v)} error={errors.major}
            options={(options?.majors ?? ['هندسة البرمجيات', 'هندسة الحاسوب', 'نظم المعلومات']).map(m => ({ value: m, label: m }))} />
        </div>

        <div className="form-grid-2">
          <CustomSelect id="study_year" label="السنة الدراسية" required placeholder="السنة الخامسة" value={studyYear} onChange={v => setStudyYear(v)} error={errors.study_year}
            options={(options?.study_years ?? [4, 5]).map(y => ({ value: String(y), label: `السنة ${y}` }))} />
          <SkillsInput label="المهارات" value={skills} onChange={setSkills} maxSkills={options?.max_skills ?? 6} error={errors.skills} />
        </div>

        <Checkbox id="terms" label={<>أوافق على شروط الاستخدام وسياسة الخصوصية للمنصة</>} checked={terms} onChange={e => setTerms(e.target.checked)} error={errors.terms} />

        <Button type="submit" loading={submitting} className="btn-block">
          ← إنشاء حساب طالب
        </Button>
      </form>
    </AuthLayout>
  )
}