import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import './AccountPage.css'
import { authApi } from '../../api/auth'
import { profileApi } from '../../api/profile'
import { ApiError, toFieldErrors } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import { Input, Select } from '../../components/ui/controls'
import { PasswordInput } from '../../components/ui/controls'
import { SkillsInput } from '../../components/ui/SkillsInput'
import { Button } from '../../components/ui/Button'
import { Alert } from '../../components/ui/Alert'
import { Spinner } from '../../components/ui/Spinner'
import {
  iconPerson,
  iconPersonSearch,
  iconGradCap,
  iconMonitor,
  iconBuilding,
  iconShieldCheck,
  iconLockClosed,
} from '../../assets/icons/index'
import type { RegisterOptions, StudentProfile, UpdateProfilePayload } from '../../types/api'

type Tab = 'profile' | 'notifications'

const PASS_HINT = '8 أحرف: حرف كبير + صغير + رقم + رمز، وتختلف عن الحالية'

/* ── small icon helpers ── */
const FieldIco = ({ src }: { src: string }) => (
  <img src={src} alt="" width={11} height={11}
    style={{ filter: 'brightness(0)', opacity: .35, flexShrink: 0, marginTop: 2 }} />
)

/* ─────────────────────────────────────────
   PROFILE TAB
───────────────────────────────────────── */
function ProfileTab() {
  const { refresh, student } = useAuth()

  const [profile, setProfile]     = useState<StudentProfile | null>(null)
  const [options, setOptions]     = useState<RegisterOptions | null>(null)
  const [loading, setLoading]     = useState(true)
  const [editing, setEditing]     = useState(false)

  const [name, setName]           = useState('')
  const [phone, setPhone]         = useState('')
  const [studyYear, setStudyYear] = useState('')
  const [skills, setSkills]       = useState<string[]>([])
  const [errors, setErrors]       = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const [success, setSuccess]     = useState('')
  const [saving, setSaving]       = useState(false)

  /* password sub-section */
  const [current, setCurrent]     = useState('')
  const [newPass, setNewPass]     = useState('')
  const [confirm, setConfirm]     = useState('')
  const [passErrors, setPassErrors]       = useState<Record<string, string>>({})
  const [passFormError, setPassFormError] = useState('')
  const [passSuccess, setPassSuccess]     = useState('')
  const [passLoading, setPassLoading]     = useState(false)

  useEffect(() => {
    void (async () => {
      try {
        const [prof, opts] = await Promise.all([profileApi.show(), authApi.registerOptions()])
        setProfile(prof.student)
        setOptions(opts)
      } catch { /* handled by context */ }
      finally { setLoading(false) }
    })()
  }, [])

  const startEdit = () => {
    if (!profile) return
    setName(profile.name)
    setPhone(profile.phone ?? '')
    setStudyYear(String(profile.study_year))
    setSkills(profile.skills ?? [])
    setErrors({})
    setFormError('')
    setSuccess('')
    setEditing(true)
  }

  const cancelEdit = () => { setEditing(false); setErrors({}); setFormError('') }

  const onProfileSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrors({}); setFormError(''); setSuccess('')
    const payload: UpdateProfilePayload = {
      name: name.trim(), phone: phone.trim() || null,
      study_year: Number(studyYear), skills,
    }
    setSaving(true)
    try {
      const res = await profileApi.update(payload)
      setProfile(res.student)
      setEditing(false)
      setSuccess('تم تحديث الملف الشخصي بنجاح')
      await refresh()
    } catch (err) {
      if (err instanceof ApiError) {
        const fe = toFieldErrors(err.errors)
        setErrors(fe)
        if (!Object.keys(fe).length) setFormError(err.message)
      } else { setFormError('تعذّر الاتصال بالخادم') }
    } finally { setSaving(false) }
  }

  const onPassSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setPassErrors({}); setPassFormError(''); setPassSuccess('')
    const ce: Record<string, string> = {}
    if (!current)             ce.current_password      = 'كلمة المرور الحالية مطلوبة'
    if (!newPass)             ce.password              = 'كلمة المرور الجديدة مطلوبة'
    if (newPass !== confirm)  ce.password_confirmation = 'تأكيد كلمة المرور غير مطابق'
    if (Object.keys(ce).length) { setPassErrors(ce); return }
    setPassLoading(true)
    try {
      const res = await profileApi.changePassword({
        current_password: current, password: newPass, password_confirmation: confirm,
      })
      setPassSuccess(res.message)
      setCurrent(''); setNewPass(''); setConfirm('')
    } catch (err) {
      if (err instanceof ApiError) {
        const fe = toFieldErrors(err.errors)
        setPassErrors(fe)
        if (!Object.keys(fe).length) setPassFormError(err.message)
      } else { setPassFormError('تعذّر الاتصال بالخادم') }
    } finally { setPassLoading(false) }
  }

  if (loading) return <Spinner variant="page" label="جارٍ التحميل..." />
  if (!profile) return <Alert variant="error">تعذّر تحميل الملف الشخصي.</Alert>

  const initials = profile.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()

  return (
    <div className="account-grid">

      {/* ── RIGHT: profile info ── */}
      <div>
        <div className="account-card">
          <div className="account-card-title">الملف الشخصي</div>

          {/* avatar row */}
          <div className="acct-profile-head">
            <div className="acct-avatar">{initials}</div>
            <div>
              <div className="acct-name">{profile.name}</div>
              <div className="acct-email">{profile.email}</div>
              <div className="acct-status-badge">
                <span className="acct-status-dot" />
                طالب نشط
              </div>
            </div>
          </div>

          {success && <Alert variant="success">{success}</Alert>}

          {/* view mode */}
          {!editing ? (
            <>
              <div className="acct-info-list">
                <div className="acct-info-row">
                  <span className="acct-info-label"><FieldIco src={iconBuilding} /> الاسم الكامل</span>
                  <span className="acct-info-value rtl">{profile.name}</span>
                </div>
                <div className="acct-info-row">
                  <span className="acct-info-label"><FieldIco src={iconBuilding} /> الرقم الجامعي</span>
                  <span className="acct-info-value">{profile.university_number}</span>
                </div>
                <div className="acct-info-row">
                  <span className="acct-info-label"><FieldIco src={iconBuilding} /> البريد الإلكتروني الجامعي</span>
                  <span className="acct-info-value">{profile.email}</span>
                </div>
                <div className="acct-info-row">
                  <span className="acct-info-label"><FieldIco src={iconPersonSearch} /> السنة الدراسية</span>
                  <span className="acct-info-value rtl">{profile.study_year ? `السنة ${profile.study_year}` : '—'}</span>
                </div>
                <div className="acct-info-row">
                  <span className="acct-info-label"><FieldIco src={iconGradCap} /> التخصص</span>
                  <span className="acct-info-value rtl">{profile.major ?? '—'}</span>
                </div>
                <div className="acct-info-row">
                  <span className="acct-info-label"><FieldIco src={iconBuilding} /> الكلية</span>
                  <span className="acct-info-value rtl">كلية الهندسة المعلوماتية</span>
                </div>
                <div className="acct-info-row">
                  <span className="acct-info-label"><FieldIco src={iconPerson} /> رقم الهاتف</span>
                  <span className="acct-info-value">{profile.phone ?? '—'}</span>
                </div>
                {profile.skills?.length ? (
                  <div className="acct-info-row" style={{ flexDirection: 'column', gap: 8 }}>
                    <span className="acct-info-label"><FieldIco src={iconMonitor} /> المهارات</span>
                    <div className="acct-chip-list">
                      {profile.skills.map(s => <span key={s} className="acct-chip">{s}</span>)}
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="acct-actions">
                <Button variant="primary" onClick={startEdit}>حفظ بيانات الملف</Button>
              </div>
            </>
          ) : (
            /* edit mode */
            <form onSubmit={onProfileSubmit} noValidate>
              {formError && <Alert variant="error">{formError}</Alert>}
              <Input id="name" label="الاسم الكامل" required icon={iconPerson}
                placeholder="الاسم الكامل" value={name}
                onChange={e => setName(e.target.value)} error={errors.name} />
              <Input id="phone" label="رقم الهاتف" inputMode="tel" icon={iconPerson}
                placeholder="07xxxxxxxx" value={phone}
                onChange={e => setPhone(e.target.value)} error={errors.phone} />
              <Select id="study_year" label="السنة الدراسية" required icon={iconPersonSearch}
                value={studyYear} onChange={e => setStudyYear(e.target.value)}
                error={errors.study_year}
                options={(options?.study_years ?? []).map(y => ({ value: y, label: `السنة ${y}` }))} />
              {options && (
                <SkillsInput label="المهارات" value={skills} onChange={setSkills}
                  maxSkills={options.max_skills} error={errors.skills} icon={iconMonitor} />
              )}
              <div className="acct-actions">
                <Button type="submit" loading={saving}>حفظ التغييرات</Button>
                <Button type="button" variant="ghost" onClick={cancelEdit} disabled={saving}>إلغاء</Button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* ── LEFT: password + security ── */}
      <div>

        {/* password card */}
        <div className="account-card">
          <div className="account-card-title">كلمة المرور والأمان</div>

          {passSuccess && (
            <div className="acct-pass-ok">
              <img src={iconShieldCheck} alt="" width={16} height={16}
                style={{ filter: 'brightness(0)', opacity: .6 }} />
              {passSuccess}
            </div>
          )}
          {passFormError && <Alert variant="error">{passFormError}</Alert>}

          <form onSubmit={onPassSubmit} noValidate>
            <PasswordInput id="current_password" label="كلمة المرور الحالية" required
              autoComplete="current-password" placeholder="••••••••"
              value={current} onChange={e => setCurrent(e.target.value)}
              error={passErrors.current_password} />
            <PasswordInput id="new_password" label="كلمة المرور الجديدة" required
              hint={PASS_HINT} autoComplete="new-password" placeholder="••••••••"
              value={newPass} onChange={e => setNewPass(e.target.value)}
              error={passErrors.password} />
            <PasswordInput id="password_confirmation" label="تأكيد كلمة المرور الجديدة" required
              autoComplete="new-password" placeholder="••••••••"
              value={confirm} onChange={e => setConfirm(e.target.value)}
              error={passErrors.password_confirmation} />

            <div className="acct-pass-strength">
              <img src={iconShieldCheck} alt="" className="acct-pass-strength-icon" />
              قوة كلمة المرور: قوية — 12 حرفاً على الأقل مع أرقام ورموز
            </div>

            <div className="acct-actions" style={{ marginTop: 0 }}>
              <Button type="submit" loading={passLoading}>تحديث كلمة المرور</Button>
            </div>
          </form>
        </div>

        {/* security card */}
        <div className="account-card">
          <div className="account-card-title">التحقق والجلسات</div>

          <div className="acct-verify-row">
            <div>
              <div className="acct-verify-label">التحقق بخطوتين عبر البريد</div>
              <div className="acct-verify-sub">يرسل رمز تحقق عند تسجيل الدخول</div>
            </div>
            <span className="acct-verify-badge off">معطّل</span>
          </div>

          <div className="acct-verify-row" style={{ marginTop: 8 }}>
            <div>
              <div className="acct-verify-label">الجلسات النشطة</div>
            </div>
          </div>

          <div className="acct-session-item">
            <div className="acct-session-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="var(--navy)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8M12 17v4" />
              </svg>
            </div>
            <div className="acct-session-info">
              <div className="acct-session-name">Chrome · Windows</div>
              <div className="acct-session-meta">
                {student?.name ?? '—'} · الجهاز الحالي
              </div>
            </div>
            <span className="acct-session-badge">هنا الجهاز</span>
          </div>

          <div className="acct-actions" style={{ marginTop: 8 }}>
            <button className="btn btn-ghost" style={{ fontSize: 12 }}>
              تسجيل الخروج من الأجهزة الأخرى
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   NOTIFICATIONS TAB
───────────────────────────────────────── */
type PrefKey = 'supervisor' | 'tasks' | 'teams' | 'weekly'
type DeadlineKey = 'week' | 'day' | 'morning'

function NotificationsTab() {
  const { student } = useAuth()

  const [prefs, setPrefs] = useState<Record<PrefKey, boolean>>({
    supervisor: true, tasks: true, teams: true, weekly: false,
  })
  const [deadlines, setDeadlines] = useState<Record<DeadlineKey, boolean>>({
    week: true, day: true, morning: false,
  })
  const [saved, setSaved] = useState(false)

  const togglePref = (k: PrefKey) => setPrefs(p => ({ ...p, [k]: !p[k] }))
  const toggleDeadline = (k: DeadlineKey) => setDeadlines(d => ({ ...d, [k]: !d[k] }))

  const savePrefs = () => { setSaved(true); setTimeout(() => setSaved(false), 2500) }

  return (
    <div className="account-grid">

      {/* ── RIGHT: notification list ── */}
      <div>
        <div className="account-card">
          <div className="account-card-title">إشعاراتي</div>

          <div className="notif-unread-banner">
            <span>
              <span className="notif-unread-count">3</span> غير مقروءة · آخر 30 يوماً
            </span>
            <button className="notif-mark-all">تحديد الكل كمقروء</button>
          </div>

          <div className="notif-list">

            <div className="notif-item unread">
              <div className="notif-dot-wrap"><div className="notif-dot" /></div>
              <div className="notif-icon-wrap">
                <img src={iconShieldCheck} alt="" className="notif-ico" />
              </div>
              <div className="notif-info">
                <div className="notif-title">
                  أضافت <span>د. سارة ملاحظتين</span>
                </div>
                <div className="notif-file">ملف Analysis_Report_v2.pdf</div>
                <div className="notif-time">اليوم · 09:30</div>
              </div>
            </div>

            <div className="notif-item unread">
              <div className="notif-dot-wrap"><div className="notif-dot" /></div>
              <div className="notif-icon-wrap">
                <img src={iconLockClosed} alt="" className="notif-ico" />
              </div>
              <div className="notif-info">
                <div className="notif-title">موعد تسليم قريب</div>
                <div className="notif-file">تقرير التحليل · متبقى 5 أيام</div>
                <div className="notif-time">اليوم · 08:00</div>
              </div>
            </div>

            <div className="notif-item unread">
              <div className="notif-dot-wrap"><div className="notif-dot" /></div>
              <div className="notif-icon-wrap">
                <img src={iconMonitor} alt="" className="notif-ico" />
              </div>
              <div className="notif-info">
                <div className="notif-title">
                  أُسندت إليك <span>مهمة مهمة</span>
                </div>
                <div className="notif-file">تعديل مخطط قاعدة البيانات</div>
                <div className="notif-time">أمس · 13:15</div>
              </div>
            </div>

            <div className="notif-item">
              <div className="notif-dot-wrap" />
              <div className="notif-icon-wrap">
                <img src={iconShieldCheck} alt="" className="notif-ico" />
              </div>
              <div className="notif-info">
                <div className="notif-title">اكتملت مهمة قاعدة البيانات</div>
                <div className="notif-time">أمس · 13:15</div>
              </div>
            </div>

            <div className="notif-item">
              <div className="notif-dot-wrap" />
              <div className="notif-icon-wrap">
                <img src={iconBuilding} alt="" className="notif-ico" />
              </div>
              <div className="notif-info">
                <div className="notif-title">
                  انضم <span>فكرة فريق أثر</span>
                </div>
                <div className="notif-time">الثلاثاء · 11:00</div>
              </div>
            </div>

          </div>

          <div style={{ padding: '12px 0 0', borderTop: '1px solid var(--border)', marginTop: 4 }}>
            <button className="btn btn-ghost" style={{ fontSize: 11.5, padding: '6px 0' }}>
              كل الإشعارات ←
            </button>
          </div>
        </div>
      </div>

      {/* ── LEFT: preferences ── */}
      <div>
        <div className="account-card">
          <div className="account-card-title">تفضيلات البريد والتنبيهات</div>

          <div className="notif-email-row">
            <div className="notif-email-label">أُرسل إلى البريد الجامعي المُوثّق</div>
            <div className="notif-email-val">{student?.email ?? '—'}</div>
          </div>

          {saved && <Alert variant="success">تم حفظ التفضيلات بنجاح</Alert>}

          <div className="notif-pref-group">
            <div className="notif-pref-group-title">ملاحظات المشرف وقرارات اللجنة</div>

            <div className="notif-pref-row">
              <div>
                <div className="notif-pref-label">ملاحظات المشرف وقراراته</div>
                <div className="notif-pref-sub">بريد إلكتروني فور أي تعليق</div>
              </div>
              <label className="notif-toggle">
                <input type="checkbox" checked={prefs.supervisor} onChange={() => togglePref('supervisor')} />
                <span className="notif-toggle-track" />
              </label>
            </div>

            <div className="notif-pref-row">
              <div>
                <div className="notif-pref-label">إسناد المهام وتحديثاتها</div>
                <div className="notif-pref-sub">بريد عند إسناد مهمة أو تغيير حالتها</div>
              </div>
              <label className="notif-toggle">
                <input type="checkbox" checked={prefs.tasks} onChange={() => togglePref('tasks')} />
                <span className="notif-toggle-track" />
              </label>
            </div>

            <div className="notif-pref-row">
              <div>
                <div className="notif-pref-label">طلبات الانضمام وقرارات الفريق</div>
                <div className="notif-pref-sub">إشعار عند طلب أو قبول في الفريق</div>
              </div>
              <label className="notif-toggle">
                <input type="checkbox" checked={prefs.teams} onChange={() => togglePref('teams')} />
                <span className="notif-toggle-track" />
              </label>
            </div>

            <div className="notif-pref-row">
              <div>
                <div className="notif-pref-label">ملخص النشاط الأسبوعي</div>
                <div className="notif-pref-sub">ملخص كل يوم أحد صباحاً</div>
              </div>
              <label className="notif-toggle">
                <input type="checkbox" checked={prefs.weekly} onChange={() => togglePref('weekly')} />
                <span className="notif-toggle-track" />
              </label>
            </div>
          </div>

          <div className="notif-pref-group">
            <div className="notif-pref-group-title">تذكيرات مواعيد التسليم</div>

            <div className="notif-pref-row">
              <div>
                <div className="notif-pref-label">قبل الموعد بأسبوع</div>
                <div className="notif-pref-sub">بكرى الأسبوع وتبقى ذمّة</div>
              </div>
              <label className="notif-toggle">
                <input type="checkbox" checked={deadlines.week} onChange={() => toggleDeadline('week')} />
                <span className="notif-toggle-track" />
              </label>
            </div>

            <div className="notif-pref-row">
              <div>
                <div className="notif-pref-label">قبل الموعد بيوم واحد</div>
                <div className="notif-pref-sub">قبل اليوم والتسليم نهاية المهلة</div>
              </div>
              <label className="notif-toggle">
                <input type="checkbox" checked={deadlines.day} onChange={() => toggleDeadline('day')} />
                <span className="notif-toggle-track" />
              </label>
            </div>

            <div className="notif-pref-row">
              <div>
                <div className="notif-pref-label">صباح يوم التسليم</div>
                <div className="notif-pref-sub">الساعة 08:00 من يوم المهلة</div>
              </div>
              <label className="notif-toggle">
                <input type="checkbox" checked={deadlines.morning} onChange={() => toggleDeadline('morning')} />
                <span className="notif-toggle-track" />
              </label>
            </div>
          </div>

          <div className="notif-tz-row">
            <span>المنطقة الزمنية</span>
            <span className="notif-tz-val">دمشق · UTC+03:00</span>
          </div>

          <div className="notif-save-btn">
            <Button variant="primary" onClick={savePrefs} className="btn-block">
              حفظ تفضيلات الإشعارات
            </Button>
          </div>
        </div>
      </div>

    </div>
  )
}

/* ─────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────── */
export function AccountPage() {
  const [tab, setTab] = useState<Tab>('profile')

  return (
    <div className="account-wrap">

      {/* topbar */}
      <header className="account-topbar">
        <div className="account-topbar-breadcrumb">
          <Link to="/student/dashboard">ساحة الطالب</Link>
          <span className="account-topbar-sep">/</span>
          <span className="account-topbar-current">حسابي والإشعارات</span>
        </div>
        <div className="account-topbar-univ">
          <div className="account-topbar-univ-text">
            <span className="account-topbar-univ-name">جامعة الشام الخاصة</span>
            <span className="account-topbar-univ-fac">كلية الهندسة المعلوماتية · بوابة الطالب</span>
          </div>
        </div>
      </header>

      {/* tab bar */}
      <div className="account-tabs">
        <button
          className={'account-tab' + (tab === 'profile' ? ' active' : '')}
          onClick={() => setTab('profile')}
        >
          <img src={iconPerson} alt="" className="account-tab-icon" />
          الملف الشخصي
        </button>
        <button
          className={'account-tab' + (tab === 'notifications' ? ' active' : '')}
          onClick={() => setTab('notifications')}
        >
          <img src={iconShieldCheck} alt="" className="account-tab-icon" />
          الإشعارات
        </button>
      </div>

      {/* body */}
      <div className="account-body">
        <div className="account-page-head">
          <h1 className="account-page-title">حسابي والإشعارات</h1>
          <p className="account-page-sub">
            إدارة ملفك الجامعي وأمان الحساب، ومتابعة تنبيهات البريد والذكري.
          </p>
        </div>

        {tab === 'profile'       && <ProfileTab />}
        {tab === 'notifications' && <NotificationsTab />}
      </div>

    </div>
  )
}
