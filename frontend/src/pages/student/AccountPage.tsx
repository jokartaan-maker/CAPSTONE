import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import './AccountPage.css'
import { authApi } from '../../api/auth'
import { profileApi } from '../../api/profile'
import { ApiError, toFieldErrors } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import { Input, PasswordInput, CustomSelect } from '../../components/ui/controls'
import { SkillsInput } from '../../components/ui/SkillsInput'
import { Button } from '../../components/ui/Button'
import { Alert } from '../../components/ui/Alert'
import { AccountPageSkeleton } from '../../components/ui/Skeleton'
import { CapstoneLogotype } from '../../components/ui/CapstoneLogotype'
import { usePageLoader } from '../../hooks/usePageLoader'
import type { RegisterOptions, StudentProfile, UpdateProfilePayload } from '../../types/api'

const PASS_HINT = '8 أحرف: حرف كبير + صغير + رقم + رمز، وتختلف عن الحالية'

/* ── inline icons (stroke = currentColor) ── */
const ICON_PATHS = {
  user:     <><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
  idcard:   <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="11" r="2" /><path d="M15 9h3M15 13h3M6 17c.5-1.5 1.7-2 3-2s2.5.5 3 2" /></>,
  mail:     <><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></>,
  calendar: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
  grad:     <><path d="M22 10 12 5 2 10l10 5 10-5z" /><path d="M6 12v5c3 2 9 2 12 0v-5" /></>,
  phone:    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />,
  code:     <path d="m16 18 6-6-6-6M8 6l-6 6 6 6" />,
  message:  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  clock:    <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>,
  task:     <><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></>,
  done:     <><path d="M22 11.1V12a10 10 0 1 1-5.9-9.1" /><path d="m22 4-10 10-3-3" /></>,
  users:    <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" /></>,
  monitor:  <><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></>,
} satisfies Record<string, ReactNode>

type IconName = keyof typeof ICON_PATHS

const Icon = ({ name, size = 14 }: { name: IconName; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {ICON_PATHS[name]}
  </svg>
)

/* ── password strength ── */
const STRENGTH_LABELS = ['', 'ضعيفة', 'متوسطة', 'جيدة', 'قوية']
const getStrength = (p: string) => {
  let s = 0
  if (p.length >= 8) s++
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++
  if (/\d/.test(p)) s++
  if (/[^A-Za-z0-9]/.test(p)) s++
  return s
}

/* ── notifications ── */
type NotifTone = 'blue' | 'amber' | 'green' | 'slate'
interface Notif {
  id: number
  unread: boolean
  icon: IconName
  tone: NotifTone
  title: string
  bold?: string
  file?: string
  time: string
}

const INITIAL_NOTIFS: Notif[] = [
  { id: 1, unread: true,  icon: 'message', tone: 'blue',  title: 'أضافت', bold: 'د. سارة ملاحظتين جديدتين', file: 'ملف Analysis_Report_v2.pdf', time: 'اليوم · 09:30' },
  { id: 2, unread: true,  icon: 'clock',   tone: 'amber', title: 'موعد تسليم قريب', file: 'تقرير التحليل · متبقٍ 5 أيام', time: 'اليوم · 08:00' },
  { id: 3, unread: true,  icon: 'task',    tone: 'slate', title: 'أُسندت إليك', bold: 'مهمة جديدة', file: 'تعديل مخطط قاعدة البيانات', time: 'أمس · 13:15' },
  { id: 4, unread: false, icon: 'done',    tone: 'green', title: 'اكتملت مهمة قاعدة البيانات', time: 'أمس · 13:15' },
  { id: 5, unread: false, icon: 'users',   tone: 'slate', title: 'انضم عضو جديد إلى', bold: 'فريق «أثر»', time: 'الثلاثاء · 11:00' },
]

/* ── prefs ── */
type PrefKey     = 'supervisor' | 'tasks' | 'teams' | 'weekly'
type DeadlineKey = 'week' | 'day' | 'morning'

const PREF_ROWS: { key: PrefKey; label: string; sub: string }[] = [
  { key: 'supervisor', label: 'ملاحظات المشرف وقراراته',        sub: 'بريد إلكتروني فور أي تعليق' },
  { key: 'tasks',      label: 'إسناد المهام وتحديثاتها',          sub: 'بريد عند إسناد مهمة أو تغيير حالتها' },
  { key: 'teams',      label: 'طلبات الانضمام وقرارات الفريق',  sub: 'إشعار عند طلب أو قبول في الفريق' },
  { key: 'weekly',     label: 'ملخص النشاط الأسبوعي',           sub: 'ملخص كل يوم أحد صباحاً' },
]
const DEADLINE_ROWS: { key: DeadlineKey; label: string; sub: string }[] = [
  { key: 'week',    label: 'قبل الموعد بأسبوع',    sub: 'تذكير قبل أسبوع من موعد التسليم' },
  { key: 'day',     label: 'قبل الموعد بيوم واحد', sub: 'تذكير في اليوم السابق للتسليم' },
  { key: 'morning', label: 'صباح يوم التسليم',     sub: 'الساعة 08:00 من يوم التسليم' },
]

const ToggleRow = ({
  label, sub, checked, onChange,
}: { label: string; sub: string; checked: boolean; onChange: () => void }) => (
  <div className="notif-pref-row">
    <div>
      <div className="notif-pref-label">{label}</div>
      <div className="notif-pref-sub">{sub}</div>
    </div>
    <label className="notif-toggle">
      <input type="checkbox" role="switch" checked={checked} onChange={onChange} aria-label={label} />
      <span className="notif-toggle-track" />
    </label>
  </div>
)

const InfoRow = ({
  icon, label, children, rtl,
}: { icon: IconName; label: string; children: ReactNode; rtl?: boolean }) => (
  <div className="acct-info-row">
    <span className="acct-info-label"><Icon name={icon} size={14} /> {label}</span>
    <span className={'acct-info-value' + (rtl ? ' rtl' : '')}>{children}</span>
  </div>
)

export function AccountPage() {
  const { refresh, student } = useAuth()

  /* ── profile state ── */
  const [profile, setProfile]     = useState<StudentProfile | null>(null)
  const [options, setOptions]     = useState<RegisterOptions | null>(null)
  const [apiFetched, setApiFetched] = useState(false)   // API انتهى؟
  const pageReady  = usePageLoader(300)                  // 300ms minimum
  const loading    = !apiFetched || pageReady            // كلاهما لازم ينتهي
  const [editing, setEditing]     = useState(false)
  const [name, setName]           = useState('')
  const [phone, setPhone]         = useState('')
  const [studyYear, setStudyYear] = useState('')
  const [skills, setSkills]       = useState<string[]>([])
  const [profErrors, setProfErrors]       = useState<Record<string, string>>({})
  const [profFormError, setProfFormError] = useState('')
  const [profSuccess, setProfSuccess]     = useState('')
  const [saving, setSaving]               = useState(false)

  /* ── password state ── */
  const [current, setCurrent]   = useState('')
  const [newPass, setNewPass]   = useState('')
  const [confirm, setConfirm]   = useState('')
  const [passErrors, setPassErrors]       = useState<Record<string, string>>({})
  const [passFormError, setPassFormError] = useState('')
  const [passSuccess, setPassSuccess]     = useState('')
  const [passLoading, setPassLoading]     = useState(false)

  /* ── notifications state ── */
  const [notifs, setNotifs] = useState<Notif[]>(INITIAL_NOTIFS)
  const [prefs, setPrefs] = useState<Record<PrefKey, boolean>>({
    supervisor: true, tasks: true, teams: true, weekly: false,
  })
  const [deadlines, setDeadlines] = useState<Record<DeadlineKey, boolean>>({
    week: true, day: true, morning: false,
  })
  const [prefsSaved, setPrefsSaved] = useState(false)
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const unreadCount = notifs.filter(n => n.unread).length
  const strength = getStrength(newPass)

  useEffect(() => {
    void (async () => {
      try {
        const [prof, opts] = await Promise.all([profileApi.show(), authApi.registerOptions()])
        setProfile(prof.student)
        setOptions(opts)
      } catch { /* handled by context */ }
      finally { setApiFetched(true) }
    })()
    return () => { if (savedTimer.current) clearTimeout(savedTimer.current) }
  }, [])

  /* profile handlers */
  const startEdit = () => {
    if (!profile) return
    setName(profile.name); setPhone(profile.phone ?? '')
    setStudyYear(String(profile.study_year)); setSkills(profile.skills ?? [])
    setProfErrors({}); setProfFormError(''); setProfSuccess(''); setEditing(true)
  }
  const cancelEdit = () => { setEditing(false); setProfErrors({}); setProfFormError('') }

  const onProfileSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setProfErrors({}); setProfFormError(''); setProfSuccess('')
    const payload: UpdateProfilePayload = {
      name: name.trim(), phone: phone.trim() || null,
      study_year: Number(studyYear), skills,
    }
    setSaving(true)
    try {
      const res = await profileApi.update(payload)
      setProfile(res.student); setEditing(false)
      setProfSuccess('تم تحديث الملف الشخصي بنجاح')
      await refresh()
    } catch (err) {
      if (err instanceof ApiError) {
        const fe = toFieldErrors(err.errors)
        setProfErrors(fe)
        if (!Object.keys(fe).length) setProfFormError(err.message)
      } else { setProfFormError('تعذّر الاتصال بالخادم') }
    } finally { setSaving(false) }
  }

  /* password handler */
  const onPassSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setPassErrors({}); setPassFormError(''); setPassSuccess('')
    const ce: Record<string, string> = {}
    if (!current)            ce.current_password      = 'كلمة المرور الحالية مطلوبة'
    if (!newPass)            ce.password              = 'كلمة المرور الجديدة مطلوبة'
    if (newPass !== confirm) ce.password_confirmation = 'تأكيد كلمة المرور غير مطابق'
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

  /* notifications handlers */
  const markRead = (id: number) =>
    setNotifs(list => list.map(n => (n.id === id ? { ...n, unread: false } : n)))
  const markAllRead = () =>
    setNotifs(list => list.map(n => ({ ...n, unread: false })))

  const savePrefs = () => {
    setPrefsSaved(true)
    if (savedTimer.current) clearTimeout(savedTimer.current)
    savedTimer.current = setTimeout(() => setPrefsSaved(false), 2500)
  }

  /* ── Loading ── */
  if (loading) return <AccountPageSkeleton />

  const initials = profile?.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() ?? '؟'

  return (
    <div className="account-wrap">

      {/* ── Topbar ── */}
      <header className="account-topbar">
        <nav className="account-topbar-breadcrumb" aria-label="مسار التنقل">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{opacity:.5}}>
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <Link to="/student/dashboard">مساحة الطالب</Link>
          <span className="account-topbar-sep">/</span>
          <span className="account-topbar-current">حسابي والإشعارات</span>
        </nav>
        <CapstoneLogotype height={36} />
      </header>

      {/* ── Scrollable body ── */}
      <div className="account-body">
        <div className="account-inner">

          {/* Page heading */}
          <div className="account-page-head">
            <div className="account-page-eyebrow">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              إعدادات الحساب
            </div>
            <h1 className="account-page-title">حسابي والإشعارات</h1>
            <p className="account-page-sub">
              إدارة ملفك الجامعي وأمان الحساب، ومتابعة تنبيهات البريد والتذكير بمواعيد التسليم.
            </p>
          </div>

          <div className="account-grid">

            {/* ══ RIGHT column: profile + password ══ */}
            <div className="account-col">

              {/* Profile card */}
              <section className="account-card">
                <div className="account-card-title">الملف الشخصي</div>

                <div className="acct-profile-head">
                  <div className="acct-avatar">{initials}</div>
                  <div>
                    <div className="acct-name">{profile?.name ?? '—'}</div>
                    <div className="acct-email">{profile?.email ?? '—'}</div>
                    <div className="acct-status-badge">
                      <span className="acct-status-dot" />
                      طالب نشط
                    </div>
                  </div>
                </div>

                {profSuccess && <Alert variant="success">{profSuccess}</Alert>}

                {!editing ? (
                  <>
                    <div className="acct-info-list">
                      <InfoRow icon="user" label="الاسم الكامل" rtl>{profile?.name ?? '—'}</InfoRow>
                      <InfoRow icon="idcard" label="الرقم الجامعي">{profile?.university_number ?? '—'}</InfoRow>
                      <InfoRow icon="mail" label="البريد الجامعي">{profile?.email ?? '—'}</InfoRow>
                      <InfoRow icon="calendar" label="السنة الدراسية" rtl>
                        {profile?.study_year ? `السنة ${profile.study_year}` : '—'}
                      </InfoRow>
                      <InfoRow icon="grad" label="التخصص" rtl>{profile?.major ?? '—'}</InfoRow>
                      <InfoRow icon="phone" label="رقم الهاتف">{profile?.phone ?? '—'}</InfoRow>
                      {(profile?.skills?.length ?? 0) > 0 && (
                        <div className="acct-info-row stack">
                          <span className="acct-info-label"><Icon name="code" size={14} /> المهارات</span>
                          <div className="acct-chip-list">
                            {(profile?.skills ?? []).map(s => <span key={s} className="acct-chip">{s}</span>)}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="acct-actions">
                      <Button variant="secondary" onClick={startEdit}>تعديل البيانات</Button>
                    </div>
                  </>
                ) : (
                  <form onSubmit={onProfileSubmit} noValidate>
                    {profFormError && <Alert variant="error">{profFormError}</Alert>}
                    <Input id="name" label="الاسم الكامل" required 
                      placeholder="الاسم الكامل" value={name}
                      onChange={e => setName(e.target.value)} error={profErrors.name} />
                    <Input id="phone" label="رقم الهاتف" inputMode="tel" 
                      placeholder="07xxxxxxxx" value={phone}
                      onChange={e => setPhone(e.target.value)} error={profErrors.phone} />
                    <CustomSelect id="study_year" label="السنة الدراسية" required 
                      value={studyYear} onChange={v => setStudyYear(v)}
                      error={profErrors.study_year}
                      options={(options?.study_years ?? []).map(y => ({ value: String(y), label: `السنة ${y}` }))} />
                    {options && (
                      <SkillsInput label="المهارات" value={skills} onChange={setSkills}
                        maxSkills={options.max_skills} error={profErrors.skills}  />
                    )}
                    <div className="acct-actions">
                      <Button type="submit" loading={saving}>حفظ التغييرات</Button>
                      <Button type="button" variant="ghost" onClick={cancelEdit} disabled={saving}>إلغاء</Button>
                    </div>
                  </form>
                )}
              </section>

              {/* Password + Security card */}
              <section className="account-card">
                <div className="account-card-title">كلمة المرور والأمان</div>

                {passSuccess && (
                  <div className="acct-pass-ok">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
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

                  {newPass && (
                    <div className={`acct-strength lv-${strength}`} aria-live="polite">
                      <div className="acct-strength-head">
                        <span>قوة كلمة المرور</span>
                        <span className="acct-strength-label">{STRENGTH_LABELS[strength] || 'ضعيفة'}</span>
                      </div>
                      <div className="acct-strength-bars">
                        <span /><span /><span /><span />
                      </div>
                    </div>
                  )}

                  <div className="acct-actions">
                    <Button type="submit" loading={passLoading}>تحديث كلمة المرور</Button>
                  </div>
                </form>

                {/* Security rows */}
                <div className="acct-security">
                  <div className="acct-verify-row">
                    <div>
                      <div className="acct-verify-label">التحقق بخطوتين عبر البريد</div>
                      <div className="acct-verify-sub">يُرسل رمز تحقق عند تسجيل الدخول من جهاز جديد</div>
                    </div>
                    <span className="acct-verify-badge off">معطّل</span>
                  </div>

                  <div className="acct-verify-row col">
                    <div className="acct-verify-label">الجلسات النشطة</div>
                    <div className="acct-session-item">
                      <div className="acct-session-icon"><Icon name="monitor" size={17} /></div>
                      <div className="acct-session-info">
                        <div className="acct-session-name">Chrome · Windows</div>
                        <div className="acct-session-meta">{student?.name ?? '—'}</div>
                      </div>
                      <span className="acct-session-badge">الجهاز الحالي</span>
                    </div>
                  </div>

                  <div className="acct-actions" style={{ marginTop: 0 }}>
                    <Button type="button" variant="ghost">تسجيل الخروج من الأجهزة الأخرى</Button>
                  </div>
                </div>
              </section>

            </div>{/* end right col */}

            {/* ══ LEFT column: notifications ══ */}
            <div className="account-col">

              {/* Notifications list card */}
              <section className="account-card">
                <div className="account-card-title">إشعاراتي</div>

                <div className={'notif-unread-banner' + (unreadCount === 0 ? ' is-clear' : '')}>
                  {unreadCount > 0 ? (
                    <span><span className="notif-unread-count">{unreadCount}</span> غير مقروءة · آخر 30 يوماً</span>
                  ) : (
                    <span>لا توجد إشعارات غير مقروءة</span>
                  )}
                  <button type="button" className="notif-mark-all"
                    onClick={markAllRead} disabled={unreadCount === 0}>
                    تحديد الكل كمقروء
                  </button>
                </div>

                <div className="notif-list">
                  {notifs.map(n => (
                    <button key={n.id} type="button"
                      className={'notif-item' + (n.unread ? ' unread' : '')}
                      onClick={() => markRead(n.id)}>
                      <div className="notif-dot-wrap">{n.unread && <div className="notif-dot" />}</div>
                      <div className={`notif-icon-wrap tone-${n.tone}`}>
                        <Icon name={n.icon} size={16} />
                      </div>
                      <div className="notif-info">
                        <div className="notif-title">
                          {n.title}{n.bold ? <> <span>{n.bold}</span></> : null}
                        </div>
                        {n.file && <div className="notif-file">{n.file}</div>}
                        <div className="notif-time">{n.time}</div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="notif-footer">
                  <Button type="button" variant="ghost">كل الإشعارات ←</Button>
                </div>
              </section>

              {/* Notification prefs card */}
              <section className="account-card">
                <div className="account-card-title">تفضيلات البريد والتنبيهات</div>

                <div className="notif-email-row">
                  <div className="notif-email-label">يُرسل إلى البريد الجامعي الموثّق</div>
                  <div className="notif-email-val">{student?.email ?? '—'}</div>
                </div>

                {prefsSaved && <Alert variant="success">تم حفظ التفضيلات بنجاح</Alert>}

                <div className="notif-pref-group">
                  <div className="notif-pref-group-title">ملاحظات المشرف وقرارات اللجنة</div>
                  {PREF_ROWS.map(r => (
                    <ToggleRow key={r.key} label={r.label} sub={r.sub} checked={prefs[r.key]}
                      onChange={() => setPrefs(p => ({ ...p, [r.key]: !p[r.key] }))} />
                  ))}
                </div>

                <div className="notif-pref-group">
                  <div className="notif-pref-group-title">تذكيرات مواعيد التسليم</div>
                  {DEADLINE_ROWS.map(r => (
                    <ToggleRow key={r.key} label={r.label} sub={r.sub} checked={deadlines[r.key]}
                      onChange={() => setDeadlines(d => ({ ...d, [r.key]: !d[r.key] }))} />
                  ))}
                </div>

                <div className="notif-tz-row">
                  <span>المنطقة الزمنية</span>
                  <span className="notif-tz-val">دمشق · UTC+03:00</span>
                </div>

                <div className="notif-save-wrap">
                  <Button variant="primary" onClick={savePrefs} className="btn-block">
                    حفظ تفضيلات الإشعارات
                  </Button>
                </div>
              </section>

            </div>{/* end left col */}

          </div>{/* end account-grid */}
        </div>{/* end account-inner */}
      </div>{/* end account-body */}
    </div>
  )
}