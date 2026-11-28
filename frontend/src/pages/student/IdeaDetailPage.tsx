import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import './IdeaDetailPage.css'
import { ideasApi } from '../../api/ideas'
import { ApiError } from '../../api/client'
import type { Idea, IdeaTeam } from '../../types/api'
import { CapstoneLogotype } from '../../components/ui/CapstoneLogotype'
import { IdeaDetailPageSkeleton } from '../../components/ui/Skeleton'

/* ── تنسيق التاريخ بالعربي ── */
function formatDate(date: string | null | undefined): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('ar-SY', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}
function teamStatusInfo(status: IdeaTeam['status']) {
  if (status === 'your_team') return { label: 'فريقك',  cls: 'idd-team-yours', action: 'عرض الفريق'    }
  if (status === 'full')      return { label: 'مكتمل',  cls: 'idd-team-full',  action: 'عرض الفريق'    }
  return                             { label: 'متاح',   cls: 'idd-team-open',  action: 'طلب الانضمام' }
}

/* ── SVG icons ── */
const IconCheck = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)
const IconBack = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 5l-7 7 7 7" />
  </svg>
)

/* ── Topbar shared ── */
function Topbar({ title }: { title?: string }) {
  return (
    <header className="db-topbar">
      <div className="db-topbar-breadcrumb">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ opacity:.5, flexShrink:0 }}>
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        <Link to="/student/dashboard">مساحة الطالب</Link>
        <span className="db-topbar-sep">/</span>
        <Link to="/student/ideas">بنك الأفكار</Link>
        <span className="db-topbar-sep">/</span>
        <span className="db-topbar-current">{title ?? '...'}</span>
      </div>
      <CapstoneLogotype height={36} />
    </header>
  )
}

/* ════════════════════════════════════════
   Main Page
════════════════════════════════════════ */
export function IdeaDetailPage() {
  const { id }   = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [idea,    setIdea]    = useState<Idea | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    if (!id || isNaN(Number(id))) {
      setError('رقم الفكرة غير صحيح')
      setLoading(false)
      return
    }
    void (async () => {
      try {
        const res = await ideasApi.show(Number(id))
        setIdea(res.idea)
      } catch (err) {
        if (err instanceof ApiError && err.status === 404)
          setError('الفكرة غير موجودة أو غير متاحة في الفصل الحالي')
        else
          setError('تعذّر تحميل تفاصيل الفكرة، تحقق من الاتصال')
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  /* ── Loading ── */
  if (loading) return <IdeaDetailPageSkeleton />

  /* ── Error / Not found ── */
  if (error || !idea) {
    return (
      <div className="db-wrap">
        <Topbar title="غير موجودة" />
        <div className="db-body">
          <div className="idd-not-found">
            <div className="idd-not-found-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8"  x2="12"    y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h2>الفكرة غير موجودة</h2>
            <p>{error || 'لم نتمكن من إيجاد هذه الفكرة.'}</p>
            <Link to="/student/ideas" className="btn btn-primary">
              العودة لبنك الأفكار
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const hasOpenTeam = idea.teams.some(t => t.status === 'open')

  return (
    <div className="db-wrap">
      <Topbar title={idea.title} />

      <div className="db-body">
        <div className="db-body-inner">

          {/* ── Page head ── */}
          <div className="idd-page-head">
            <button className="idd-back-btn" onClick={() => navigate(-1)}>
              <IconBack />
              العودة إلى بنك الأفكار
            </button>

            <div className="idd-hero">
              <div className="idd-hero-badges">
                <span className="idd-field-badge">{idea.field}</span>
                <span className="idd-code-badge">{idea.code}</span>
                {idea.academic_term && (
                  <span className="idd-code-badge">{idea.academic_term}</span>
                )}
              </div>
              <h1 className="idd-title">{idea.title}</h1>
              {idea.approved_at && (
                <p className="idd-approved-note">
                  اعتمدتها اللجنة العلمية بتاريخ {formatDate(idea.approved_at)}
                  {idea.approved_by ? ` · ${idea.approved_by}` : ''}
                </p>
              )}
            </div>
          </div>

          {/* ── Two-column layout ── */}
          <div className="idd-layout">

            {/* ══ MAIN content ══ */}
            <div className="idd-main">

              {/* About */}
              <div className="idd-section">
                <div className="idd-section-label">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="16" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                  </svg>
                  عن المشروع
                </div>
                <p className="idd-section-text">{idea.description}</p>
              </div>

              {/* Problem */}
              {idea.problem && (
                <div className="idd-section">
                  <div className="idd-section-label">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    المشكلة التي تعالجها
                  </div>
                  <p className="idd-section-text">{idea.problem}</p>
                </div>
              )}

              {/* Features */}
              {idea.features.length > 0 && (
                <div className="idd-section">
                  <div className="idd-section-label">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 11 12 14 22 4"/>
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                    </svg>
                    الوظائف الأساسية
                  </div>
                  <ul className="idd-checklist">
                    {idea.features.map((f, i) => (
                      <li key={i} className="idd-checklist-item">
                        <span className="idd-check-icon"><IconCheck /></span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Requirements */}
              {idea.requirements.length > 0 && (
                <div className="idd-section">
                  <div className="idd-section-label">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    المتطلبات والمخرجات
                  </div>
                  <ul className="idd-checklist">
                    {idea.requirements.map((r, i) => (
                      <li key={i} className="idd-checklist-item">
                        <span className="idd-check-icon"><IconCheck /></span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tech stack */}
              {idea.tech_stack.length > 0 && (
                <div className="idd-section">
                  <div className="idd-section-label">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>
                    </svg>
                    التقنيات المقترحة
                  </div>
                  <div className="idd-tech-wrap">
                    {idea.tech_stack.map(t => (
                      <span key={t} className="idd-tech-badge">{t}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA note */}
              <div className="idd-cta-note">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  style={{ flexShrink:0, marginTop:2 }}>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <span>
                  أي تقديم على هذه الفكرة يتم حصراً من خلال فريق معتمد مع توفر مشرف.
                  <strong style={{ display:'block', marginTop:3 }}>
                    آخر تحديث: {formatDate(idea.approved_at)}
                  </strong>
                </span>
              </div>

            </div>

            {/* ══ SIDEBAR ══ */}
            <aside className="idd-sidebar">

              {/* Summary card */}
              <div className="idd-sidebar-card">
                <div className="idd-sidebar-card-title">ملخص الفكرة</div>

                <div className="idd-meta-list">
                  <div className="idd-meta-row">
                    <span className="idd-meta-label">المجال</span>
                    <span className="idd-meta-value">{idea.field}</span>
                  </div>

                  {idea.supervisor && (
                    <div className="idd-meta-row">
                      <span className="idd-meta-label">المشرف الأكاديمي</span>
                      <div>
                        <div className="idd-sup-name">{idea.supervisor}</div>
                        {idea.supervisor_title && (
                          <div className="idd-sup-title">{idea.supervisor_title}</div>
                        )}
                        {idea.supervisor_email && (
                          <div className="idd-sup-email">{idea.supervisor_email}</div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="idd-meta-row">
                    <span className="idd-meta-label">حجم الفريق</span>
                    <span className="idd-meta-value">3–4 طلاب</span>
                  </div>
                  <div className="idd-meta-row">
                    <span className="idd-meta-label">المدة المتوقعة</span>
                    <span className="idd-meta-value">فصل دراسي</span>
                  </div>
                  {idea.academic_term && (
                    <div className="idd-meta-row">
                      <span className="idd-meta-label">الفصل الدراسي</span>
                      <span className="idd-meta-value">{idea.academic_term}</span>
                    </div>
                  )}
                </div>

                {idea.tags.length > 0 && (
                  <div className="idd-tags-wrap">
                    {idea.tags.map(t => (
                      <span key={t} className="idea-tag">{t}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Teams card */}
              <div className="idd-sidebar-card">
                <div className="idd-sidebar-card-title">
                  الفرق المرتبطة
                  {idea.teams.length > 0 && (
                    <span className="idd-teams-count">{idea.teams.length}</span>
                  )}
                </div>

                {idea.teams.length === 0 ? (
                  <div className="idd-no-teams">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                      strokeLinejoin="round" style={{ opacity:.3 }}>
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    <p>لا يوجد فريق مرتبط حالياً. يمكنك إنشاء فريق جديد لهذه الفكرة.</p>
                  </div>
                ) : (
                  <div className="idd-teams-list">
                    {idea.teams.map(team => {
                      const info = teamStatusInfo(team.status)
                      return (
                        <div key={team.id} className="idd-team-card">
                          <div className="idd-team-card-head">
                            <div className="idd-team-avatar">{team.name.slice(0, 2)}</div>
                            <div className="idd-team-info">
                              <div className="idd-team-name">{team.name}</div>
                              <div className="idd-team-members">
                                {team.members} / {team.capacity} أعضاء
                              </div>
                            </div>
                            <span className={`idd-team-badge ${info.cls}`}>{info.label}</span>
                          </div>
                          <div className="idd-team-bar-wrap">
                            <div className="idd-team-bar-fill"
                              style={{ width: `${(team.members / team.capacity) * 100}%` }} />
                          </div>
                          <button className="idd-team-action-btn">{info.action}</button>
                        </div>
                      )
                    })}
                  </div>
                )}

                {hasOpenTeam && (
                  <div className="idd-open-note">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                      strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="16" x2="12" y2="12"/>
                      <line x1="12" y1="8" x2="12.01" y2="8"/>
                    </svg>
                    يمكنك الانضمام لفريق متاح أو إنشاء فريق جديد.
                  </div>
                )}
              </div>

            </aside>
          </div>

        </div>
      </div>
    </div>
  )
}
