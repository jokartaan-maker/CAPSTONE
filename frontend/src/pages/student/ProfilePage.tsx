import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import './ProfilePage.css'
import './DashboardPage.css'
import { UnivLogo } from '../../components/ui/UnivLogo'
import { authApi } from '../../api/auth'
import { profileApi } from '../../api/profile'
import { ApiError, toFieldErrors } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import { Input, Select } from '../../components/ui/controls'
import { SkillsInput } from '../../components/ui/SkillsInput'
import { Button } from '../../components/ui/Button'
import { Alert } from '../../components/ui/Alert'
import { Spinner } from '../../components/ui/Spinner'
import {
  iconPerson,
  iconPersonSearch,
  iconGradCap,
  iconMonitor,
  iconShield,
  iconBuilding,
} from '../../assets/icons/index'
import type { RegisterOptions, StudentProfile, UpdateProfilePayload } from '../../types/api'

/* small helper — dark icon on light bg */
const InfoIco = ({ src }: { src: string }) => (
  <img
    src={src} alt=""
    width={11} height={11}
    style={{ filter: 'brightness(0)', opacity: .35, flexShrink: 0, marginTop: 2 }}
  />
)

/* shared topbar component */
function ProfileTopbar({ crumb }: { crumb?: string }) {
  return (
    <header className="db-topbar">
      <div className="db-topbar-breadcrumb">
        <Link to="/student/dashboard">مساحة الطالب</Link>
        <span className="db-topbar-sep">/</span>
        {crumb ? (
          <>
            <Link to="/student/profile">الملف الشخصي</Link>
            <span className="db-topbar-sep">/</span>
            <span className="db-topbar-current">{crumb}</span>
          </>
        ) : (
          <span className="db-topbar-current">الملف الشخصي</span>
        )}
      </div>
      <div className="db-topbar-univ">
        <UnivLogo height={34} />
      </div>
    </header>
  )
}

export function ProfilePage() {
  const { refresh } = useAuth()

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

  useEffect(() => {
    void (async () => {
      try {
        const [prof, opts] = await Promise.all([
          profileApi.show(),
          authApi.registerOptions(),
        ])
        setProfile(prof.student)
        setOptions(opts)
      } catch { /* 401 handled by context */ }
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

  const cancelEdit = () => {
    setEditing(false)
    setErrors({})
    setFormError('')
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrors({})
    setFormError('')
    setSuccess('')
    const payload: UpdateProfilePayload = {
      name:       name.trim(),
      phone:      phone.trim() || null,
      study_year: Number(studyYear),
      skills,
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
      } else {
        setFormError('تعذّر الاتصال بالخادم، حاول مرة أخرى')
      }
    } finally {
      setSaving(false)
    }
  }

  /* ── Loading / Error ── */
  if (loading) return <Spinner variant="page" label="جارٍ تحميل الملف الشخصي..." />
  if (!profile) return <Alert variant="error">تعذّر تحميل الملف الشخصي.</Alert>

  const initials = profile.name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()

  /* ══════════════════════════════════════════════════════════════
     EDIT MODE
  ══════════════════════════════════════════════════════════════ */
  if (editing) {
    return (
      <div className="profile-page-wrap">
        <ProfileTopbar crumb="تعديل البيانات" />

        <div className="db-body">
          <div className="page-head">
            <h1 className="page-title">تعديل الملف الشخصي</h1>
          </div>

          <form onSubmit={onSubmit} noValidate>
            <div className="card">
              {formError && <Alert variant="error">{formError}</Alert>}

              <Input
                id="name"
                label="الاسم الكامل"
                required
                icon={iconPerson}
                placeholder="الاسم الكامل"
                value={name}
                onChange={e => setName(e.target.value)}
                error={errors.name}
              />

              <Input
                id="phone"
                label="رقم الهاتف"
                inputMode="tel"
                icon={iconPerson}
                placeholder="07xxxxxxxx"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                error={errors.phone}
              />

              <Select
                id="study_year"
                label="السنة الدراسية"
                required
                icon={iconPersonSearch}
                value={studyYear}
                onChange={e => setStudyYear(e.target.value)}
                error={errors.study_year}
                options={(options?.study_years ?? []).map(y => ({
                  value: y,
                  label: `السنة ${y}`,
                }))}
              />

              {options && (
                <SkillsInput
                  label="المهارات"
                  value={skills}
                  onChange={setSkills}
                  maxSkills={options.max_skills}
                  error={errors.skills}
                  icon={iconMonitor}
                />
              )}

              <div className="form-actions">
                <Button type="submit" loading={saving}>حفظ التغييرات</Button>
                <Button type="button" variant="ghost" onClick={cancelEdit} disabled={saving}>
                  إلغاء
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    )
  }

  /* ══════════════════════════════════════════════════════════════
     VIEW MODE
  ══════════════════════════════════════════════════════════════ */
  return (
    <div className="profile-page-wrap">
      <ProfileTopbar />

      <div className="db-body">
        <div className="page-head">
          <h1 className="page-title">الملف الشخصي</h1>
          <Button variant="secondary" onClick={startEdit}>تعديل البيانات</Button>
        </div>

        {success && <Alert variant="success">{success}</Alert>}

        <div className="card">

          {/* avatar + name */}
          <div className="profile-head">
            <div className="avatar">{initials}</div>
            <div>
              <div className="profile-name">{profile.name}</div>
              <div className="profile-email">{profile.email}</div>
            </div>
          </div>

          {/* info grid */}
          <dl className="info-grid">

            <div className="info-item">
              <dt className="info-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <InfoIco src={iconBuilding} />
                الرقم الجامعي
              </dt>
              <dd className="info-value">{profile.university_number}</dd>
            </div>

            <div className="info-item">
              <dt className="info-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <InfoIco src={iconGradCap} />
                القسم
              </dt>
              <dd className="info-value">{profile.major}</dd>
            </div>

            <div className="info-item">
              <dt className="info-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <InfoIco src={iconPersonSearch} />
                السنة الدراسية
              </dt>
              <dd className="info-value">السنة {profile.study_year}</dd>
            </div>

            <div className="info-item">
              <dt className="info-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <InfoIco src={iconPerson} />
                رقم الهاتف
              </dt>
              <dd className="info-value" style={{ direction: 'ltr', textAlign: 'right' }}>
                {profile.phone ?? '—'}
              </dd>
            </div>

            <div className="info-item">
              <dt className="info-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <InfoIco src={iconShield} />
                عضو منذ
              </dt>
              <dd className="info-value">{profile.member_since ?? '—'}</dd>
            </div>

            <div className="info-item info-item-full">
              <dt className="info-label" style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
                <InfoIco src={iconMonitor} />
                المهارات
              </dt>
              <dd>
                {profile.skills?.length ? (
                  <ul className="chip-list">
                    {profile.skills.map(s => (
                      <li key={s} className="chip-static">{s}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="info-value">—</span>
                )}
              </dd>
            </div>

          </dl>

          {/* actions */}
          <div className="profile-actions">
            <Link to="/student/profile/password" className="btn btn-secondary">
              تغيير كلمة المرور
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
