import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import './RoleAuthPages.css'
import { AuthLayout } from '../components/layout/AuthLayout'
import { Input, PasswordInput } from '../components/ui/controls'
import { Button } from '../components/ui/Button'
import { Alert } from '../components/ui/Alert'
import { iconPersons, iconShieldCheck, iconMonitor, iconEnvelope, iconLockClosed } from '../assets/icons'

/* ── role icon helper ── */
const RoleImg = ({ src }: { src: string }) => (
  <img src={src} alt="" style={{ width: 20, height: 20, objectFit: 'contain' }} />
)
const IconArrowLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
)
const IconShieldOk = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <polyline points="9 12 11 14 15 10"/>
  </svg>
)

/* ── per-role config ── */
export type Role = 'supervisor' | 'committee' | 'admin'

const roleConfig: Record<Role, {
  title: string
  eyebrowLabel: string
  eyebrowIcon: React.ReactNode
  intro: string
  registerPath?: string
  registerLabel?: string
  adminNotice?: string
  forgotPath: string
}> = {
  supervisor: {
    title: 'مرحباً بعودتك',
    eyebrowLabel: 'بوابة مشرف',
    eyebrowIcon: <RoleImg src={iconMonitor} />,
    intro: 'تابع مشاريع طلبتك، وشارك ملاحظاتك، وأدر مواعيد الإشراف.',
    registerPath: '/supervisor/register',
    registerLabel: 'إنشاء حساب مشرف',
    forgotPath: '/student/forgot-password',
  },
  committee: {
    title: 'مرحباً بعودتك',
    eyebrowLabel: 'بوابة عضو لجنة',
    eyebrowIcon: <RoleImg src={iconPersons} />,
    intro: 'راجع مقترحات المشاريع وتابع قرارات الاعتماد والتقييم العلمي.',
    registerPath: '/committee/register',
    registerLabel: 'إنشاء حساب عضو لجنة',
    forgotPath: '/student/forgot-password',
  },
  admin: {
    title: 'مرحباً بعودتك',
    eyebrowLabel: 'بوابة مدير النظام',
    eyebrowIcon: <RoleImg src={iconShieldCheck} />,
    intro: 'سجّل الدخول بحسابك المعتمد لإدارة المنصة والصلاحيات الأكاديمية.',
    adminNotice: 'تُمنح الحسابات الإدارية من قِبل الجامعة فقط. ولا يتاح التسجيل الذاتي.',
    forgotPath: '/student/forgot-password',
  },
}

/* ================================================================
   RoleLoginPage
   ================================================================ */
export function RoleLoginPage({ role }: { role: Role }) {
  const cfg = roleConfig[role]

  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [remember, setRemember]     = useState(false)
  const [notice, setNotice]         = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setTimeout(() => {
      setNotice('هذه واجهة تجريبية؛ لم يتم ربط هذا الدور بخدمة خلفية بعد.')
      setSubmitting(false)
    }, 600)
  }

  return (
    <AuthLayout
      topLink={<Link to="/" className="auth-back-link">← العودة لاختيار الدور</Link>}
      roleEyebrow={{ label: cfg.eyebrowLabel, icon: cfg.eyebrowIcon }}
    >
      <div className="auth-heading">
        <h1>{cfg.title}</h1>
        <p>{cfg.intro}</p>
      </div>

      <form className="auth-form" onSubmit={submit} noValidate>
        {notice && <Alert variant="info">{notice}</Alert>}

        {/* admin-only notice box */}
        {cfg.adminNotice && (
          <div className="auth-admin-notice">
            <span className="auth-admin-notice-icon">
              <IconShieldOk />
            </span>
            <div>
              <strong>وصول مخصص لإدارة النظام</strong><br />
              {cfg.adminNotice}
            </div>
          </div>
        )}

        <Input
          id={`${role}-email`}
          label="البريد الإلكتروني الجامعي"
          type="email" required autoComplete="email"
          placeholder="name@aspu.edu.sy"
          icon={iconEnvelope}
          value={email} onChange={e => setEmail(e.target.value)}
        />

        <PasswordInput
          id={`${role}-password`}
          label="كلمة المرور"
          required autoComplete="current-password"
          placeholder="••••••••••••"
          icon={iconLockClosed}
          value={password} onChange={e => setPassword(e.target.value)}
        />

        <div className="auth-options-row">
          <label className="auth-remember">
            <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
            تذكّرني
          </label>
          <Link to={cfg.forgotPath} className="auth-forgot">نسيت كلمة المرور؟</Link>
        </div>

        <Button type="submit" loading={submitting} className="btn-block">
          <IconArrowLeft />
          تسجيل الدخول
        </Button>
      </form>

      {cfg.registerPath ? (
        <div className="auth-form-footer">
          ليس لديك حساب؟ <Link to={cfg.registerPath}>{cfg.registerLabel}</Link>
        </div>
      ) : (
        <div className="auth-form-footer">
          تواجه مشكلة في الدخول؟ تواصل مع مسؤول تقنية المعلومات.
        </div>
      )}
    </AuthLayout>
  )
}

/* ================================================================
   RoleRegisterPage — supervisor
   ================================================================ */
function SupervisorRegisterForm() {
  const [submitted, setSubmitted] = useState(false)
  const [name, setName]           = useState('')
  const [email, setEmail]         = useState('')
  const [empNo, setEmpNo]         = useState('')
  const [dept, setDept]           = useState('هندسة البرمجيات')
  const [title, setTitle]         = useState('أستاذ مساعد')
  const [capacity, setCapacity]   = useState('')
  const [specs, setSpecs]         = useState('')
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [terms, setTerms]         = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setTimeout(() => { setSubmitted(true); setSubmitting(false) }, 600)
  }

  if (submitted) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '20px 0', textAlign: 'center' }}>
        <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'var(--success-bg)', display: 'grid', placeItems: 'center', color: 'var(--success)', fontSize: 22 }}>✓</div>
        <h2 style={{ fontSize: 18, fontWeight: 800 }}>تم إرسال طلب التسجيل</h2>
        <p style={{ fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.8 }}>حالة الحساب بعد التسجيل: بانتظار التحقق.<br />تراجع الإدارة بياناتك الوظيفية قبل تفعيل صلاحيات الإشراف.</p>
        <Link className="btn btn-primary btn-block" to="/supervisor/login">العودة لتسجيل الدخول</Link>
      </div>
    )
  }

  return (
    <form className="auth-form" onSubmit={submit} noValidate>
      <div className="form-section-title">الهوية الأكاديمية</div>

      <div className="form-grid-3">
        <Input id="sv-name"  label="الاسم الكامل"               required placeholder="رامي خليل"             value={name}     onChange={e => setName(e.target.value)} />
        <Input id="sv-email" label="البريد الإلكتروني الجامعي"  type="email" required placeholder="r.khalil@aspu.edu.sy" icon={iconEnvelope}  value={email}    onChange={e => setEmail(e.target.value)} />
        <Input id="sv-emp"   label="الرقم الوظيفي"              required placeholder="EMP-0248"               value={empNo}    onChange={e => setEmpNo(e.target.value)} />
      </div>

      <div className="form-grid-2">
        <div>
          <label className="field-label">اللقب العلمي</label>
          <select className="control no-icon" value={title} onChange={e => setTitle(e.target.value)}>
            <option>أستاذ مساعد</option>
            <option>أستاذ مشارك</option>
            <option>أستاذ</option>
          </select>
        </div>
        <div>
          <label className="field-label">القسم</label>
          <select className="control no-icon" value={dept} onChange={e => setDept(e.target.value)}>
            <option>هندسة البرمجيات</option>
            <option>هندسة الحاسوب</option>
            <option>نظم المعلومات</option>
          </select>
        </div>
      </div>

      <div className="form-grid-2">
        <div>
          <label className="field-label">الطاقة الاستيعابية</label>
          <input className="control no-icon" placeholder="4 فرق" value={capacity} onChange={e => setCapacity(e.target.value)} />
        </div>
        <div />
      </div>

      <div className="form-section-title">التخصصات البحثية</div>
      <div style={{ marginBottom: 14 }}>
        <label className="field-label">التخصصات البحثية</label>
        <input className="control no-icon" placeholder="+ إضافة تخصص" value={specs} onChange={e => setSpecs(e.target.value)} />
      </div>

      <div className="form-section-title">بيانات الدخول</div>
      <div className="form-grid-2">
        <PasswordInput id="sv-pass"  label="كلمة المرور"        required placeholder="••••••••••••" icon={iconLockClosed} value={password} onChange={e => setPassword(e.target.value)} />
        <PasswordInput id="sv-conf"  label="تأكيد كلمة المرور" required placeholder="••••••••••••" icon={iconShieldCheck} value={confirm}  onChange={e => setConfirm(e.target.value)} />
      </div>

      <div className="auth-note">
        <span className="auth-note-icon">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        </span>
        <div>
          <strong>حالة الحساب بعد التسجيل: بانتظار التحقق</strong><br />
          تراجع الإدارة بياناتك الوظيفية قبل تفعيل الصلاحيات. ستُرسل إليك رسالة على بريدك الجامعي.
        </div>
      </div>

      <label className="checkbox-label" style={{ marginBottom: 14, fontSize: 11 }}>
        <input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)} style={{ width: 13, height: 13, accentColor: 'var(--navy-mid)' }} />
        أوافق على شروط الاستخدام وسياسة الخصوصية للمنصة
      </label>

      <Button type="submit" loading={submitting} className="btn-block">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        إرسال طلب تسجيل المشرف
      </Button>
    </form>
  )
}

/* ================================================================
   RoleRegisterPage — committee
   ================================================================ */
function CommitteeRegisterForm() {
  const [submitted, setSubmitted] = useState(false)
  const [name, setName]           = useState('')
  const [email, setEmail]         = useState('')
  const [empNo, setEmpNo]         = useState('')
  const [dept, setDept]           = useState('هندسة البرمجيات')
  const [decree, setDecree]       = useState('')
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [terms, setTerms]         = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setTimeout(() => { setSubmitted(true); setSubmitting(false) }, 600)
  }

  if (submitted) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '20px 0', textAlign: 'center' }}>
        <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'var(--success-bg)', display: 'grid', placeItems: 'center', color: 'var(--success)', fontSize: 22 }}>✓</div>
        <h2 style={{ fontSize: 18, fontWeight: 800 }}>تم إرسال طلب العضوية</h2>
        <p style={{ fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.8 }}>حالة الحساب بعد التسجيل: بانتظار التحقق.<br />لن تُفعَّل صلاحيات اللجنة العلمية إلا بعد اعتماد عضويتك.</p>
        <Link className="btn btn-primary btn-block" to="/committee/login">العودة لتسجيل الدخول</Link>
      </div>
    )
  }

  return (
    <form className="auth-form" onSubmit={submit} noValidate>
      <div className="form-section-title">بيانات العضوية والحساب</div>

      <div className="form-grid-3">
        <Input id="cm-name"  label="الاسم الكامل"               required placeholder="لينا حسن"             value={name}  onChange={e => setName(e.target.value)} />
        <Input id="cm-email" label="البريد الإلكتروني الجامعي"  type="email" required placeholder="l.hassan@aspu.edu.sy" icon={iconEnvelope} value={email} onChange={e => setEmail(e.target.value)} />
        <Input id="cm-emp"   label="الرقم الوظيفي"              required placeholder="EMP-0136"              value={empNo} onChange={e => setEmpNo(e.target.value)} />
      </div>

      <div className="form-grid-2">
        <div>
          <label className="field-label">القسم</label>
          <select className="control no-icon" value={dept} onChange={e => setDept(e.target.value)}>
            <option>هندسة البرمجيات</option>
            <option>هندسة الحاسوب</option>
            <option>نظم المعلومات</option>
          </select>
        </div>
        <div />
      </div>

      <div style={{ marginBottom: 14 }}>
        <label className="field-label">مرجع قرار التعيين في اللجنة</label>
        <div className="input-wrap">
          <svg className="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
          </svg>
          <input className="control" value={decree} onChange={e => setDecree(e.target.value)} />
        </div>
      </div>

      <div className="form-grid-2">
        <PasswordInput id="cm-pass" label="كلمة المرور"        required placeholder="••••••••••••" icon={iconLockClosed}  value={password} onChange={e => setPassword(e.target.value)} />
        <PasswordInput id="cm-conf" label="تأكيد كلمة المرور" required placeholder="••••••••••••" icon={iconShieldCheck} value={confirm}  onChange={e => setConfirm(e.target.value)} />
      </div>

      <div className="auth-note">
        <span className="auth-note-icon">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        </span>
        <div>
          <strong>حالة الحساب بعد التسجيل: بانتظار التحقق</strong><br />
          لن تُفعَّل صلاحيات اللجنة العلمية قبل منح قرار التعيين في اللجنة. سيصلك إشعار على بريدك الجامعي.
        </div>
      </div>

      <label className="checkbox-label" style={{ marginBottom: 14, fontSize: 11 }}>
        <input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)} style={{ width: 13, height: 13, accentColor: 'var(--navy-mid)' }} />
        أوافق على شروط الاستخدام وسياسة الخصوصية للمنصة
      </label>

      <Button type="submit" loading={submitting} className="btn-block">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        إرسال طلب عضوية اللجنة
      </Button>
    </form>
  )
}

/* ================================================================
   exported register page
   ================================================================ */
export function RoleRegisterPage({ role }: { role: 'supervisor' | 'committee' }) {
  const isSupervisor = role === 'supervisor'

  return (
    <AuthLayout
      topLink={
        <div>
          <Link to="/" className="auth-back-link">← العودة لاختيار الدور</Link>
          <div className="auth-breadcrumb" style={{ marginTop: 3 }}>
            <Link to={`/${role}/login`}>التسجيل</Link>
            <span className="auth-breadcrumb-sep">/</span>
            <span style={{ color: 'var(--text-light)' }}>
              {isSupervisor ? 'المشرف الأكاديمي' : 'اللجنة العلمية'}
            </span>
          </div>
        </div>
      }
      roleEyebrow={{
        label: isSupervisor ? 'بوابة المشرف الأكاديمي' : 'بوابة عضو اللجنة',
        icon: isSupervisor ? <RoleImg src={iconMonitor} /> : <RoleImg src={iconPersons} />,
      }}
    >
      <div className="auth-heading">
        <h1>{isSupervisor ? 'خبرتك تصنع فرقاً' : 'شريك في جودة المخرجات'}</h1>
        <p>
          {isSupervisor
            ? 'أكمل ملفك الأكاديمي للانضمام إلى مشرفي مشاريع التخرج.'
            : 'سجّل عضويتك باستخدام بياناتك الوظيفية ومرجع قرار التعيين.'}
        </p>
      </div>

      {isSupervisor ? <SupervisorRegisterForm /> : <CommitteeRegisterForm />}

      <div className="auth-form-footer">
        لديك حساب معتمد؟ <Link to={`/${role}/login`}>تسجيل الدخول</Link>
      </div>
    </AuthLayout>
  )
}
