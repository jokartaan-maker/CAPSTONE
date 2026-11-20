import { Link, useParams, useNavigate } from 'react-router-dom'
import './IdeaDetailPage.css'
import { MOCK_IDEAS } from '../../data/ideas'
import type { IdeaTeam } from '../../types/api'

/* ── Team status helpers ── */
function teamStatusInfo(status: IdeaTeam['status']) {
  if (status === 'your_team') return { label: 'مكتمل',  cls: 'idd-team-full',   action: 'عرض الفريق' }
  if (status === 'full')      return { label: 'مكتمل',  cls: 'idd-team-full',   action: 'عرض الفريق' }
  return                             { label: 'متاح',   cls: 'idd-team-open',   action: 'طلب الانضمام' }
}

/* ── Check icon ── */
const IconCheck = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

/* ── Main Page ── */
export function IdeaDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const idea = MOCK_IDEAS.find(i => i.id === Number(id))

  if (!idea) {
    return (
      <>
        <header className="db-topbar">
          <div className="db-topbar-breadcrumb">
            <Link to="/student/ideas">بنك الأفكار</Link>
            <span className="db-topbar-sep">/</span>
            <span className="db-topbar-current">غير موجودة</span>
          </div>
        </header>
        <div className="db-body">
          <div className="db-card" style={{ marginTop: 20 }}>
            <div className="db-empty" style={{ padding: '52px 16px' }}>
              <div className="db-empty-emoji">❓</div>
              <div className="db-empty-text">الفكرة غير موجودة</div>
              <Link to="/student/ideas" className="btn btn-secondary" style={{ marginTop: 14 }}>
                العودة لبنك الأفكار
              </Link>
            </div>
          </div>
        </div>
      </>
    )
  }

  const hasOpenTeam = idea.teams.some(t => t.status === 'open')

  return (
    <>
      {/* ── Topbar ── */}
      <header className="db-topbar">
        <div className="db-topbar-breadcrumb">
          <Link to="/student/dashboard">مساحة الطالب</Link>
          <span className="db-topbar-sep">/</span>
          <Link to="/student/ideas">بنك الأفكار</Link>
          <span className="db-topbar-sep">/</span>
          <span className="db-topbar-current">{idea.title}</span>
        </div>
        <div className="db-topbar-univ">
          <div className="db-topbar-univ-text">
            <span className="db-topbar-univ-name">جامعة الشام الخاصة</span>
            <span className="db-topbar-univ-faculty"> بوابة الطالب</span>
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="db-body">

        {/* back + title */}
        <div className="idd-page-head">
          <button className="idd-back-btn" onClick={() => navigate(-1)}>
            ← العودة إلى بنك الأفكار
          </button>
          <div className="idd-title-row">
            <h1 className="idd-title">{idea.title}</h1>
            <div className="idd-title-meta">
              <span className="idd-status">
                <span className="idd-status-dot" />
                معتمدة ومتاحة
              </span>
              <span className="idd-code">{idea.code}</span>
              {idea.approved_at && (
                <span className="idd-approved-by">
                  فكرة معتمدة من اللجنة العلمية · أمر تعيين {idea.approved_at} - {idea.approved_by}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Two column layout ── */}
        <div className="idd-layout">

          {/* ── RIGHT col: sidebar ── */}
          <aside className="idd-sidebar">

            {/* supervisor card */}
            <div className="idd-sidebar-card">
              <div className="idd-sidebar-label">ملخص الفكرة</div>

              <div className="idd-supervisor-row">
                <span className="idd-sup-label">المجال</span>
                <span className="idd-sup-value">{idea.field}</span>
              </div>
              <div className="idd-supervisor-row">
                <span className="idd-sup-label">المشرفة الأكاديمية</span>
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
              <div className="idd-supervisor-row">
                <span className="idd-sup-label">حجم الفريق المقترح</span>
                <span className="idd-sup-value">3-4 طلاب</span>
              </div>
              <div className="idd-supervisor-row">
                <span className="idd-sup-label">المدة المتوقعة</span>
                <span className="idd-sup-value">فصل دراسي</span>
              </div>
              <div className="idd-supervisor-row">
                <span className="idd-sup-label">النسبة</span>
                <span className="idd-sup-value">فريق {idea.teams.length > 0 ? '/ شاغر' : 'مناح'} أفراد</span>
              </div>

              {/* tags */}
              <div className="idd-tags-wrap">
                {idea.tags.map(t => (
                  <span key={t} className="idea-tag">{t}</span>
                ))}
              </div>
            </div>

            {/* teams card */}
            <div className="idd-sidebar-card">
              <div className="idd-sidebar-label">الفرق المرتبطة بالفكرة</div>

              {idea.teams.length === 0 ? (
                <div className="idd-no-teams">
                  لا يوجد فريق مرتبط حالياً.
                  <br />يمكنك الاطلاع على الأفكار الأخرى أو الانتظار حتى يُنشأ فريق جديد يطلب منك بدء شيء.
                </div>
              ) : (
                idea.teams.map(team => {
                  const info = teamStatusInfo(team.status)
                  return (
                    <div key={team.id} className="idd-team-row">
                      <div className="idd-team-info">
                        <div className="idd-team-name">
                          <div className="idd-team-avatar">
                            {team.name.slice(0, 1)}
                          </div>
                          {team.name}
                        </div>
                        <div className="idd-team-members">
                          {team.members} / {team.capacity} أفراد
                        </div>
                      </div>
                      <div className="idd-team-footer">
                        <span className={`idd-team-status ${info.cls}`}>
                          {info.label}
                        </span>
                        <button className="idd-team-action">
                          {info.action}
                        </button>
                      </div>
                    </div>
                  )
                })
              )}

              {hasOpenTeam && (
                <div className="idd-no-teams" style={{ marginTop: 10, fontStyle: 'normal' }}>
                  🔍 يمكنك الاطلاع على الأفكار الأخرى أو الانتظار حتى يُنشأ فريق جديد إن لم يكن هناك مناح.
                </div>
              )}
            </div>

          </aside>

          {/* ── LEFT col: main content ── */}
          <div className="idd-main">

            {/* about */}
            <div className="idd-section">
              <h2 className="idd-section-title">عن المشروع</h2>
              <p className="idd-section-text">{idea.description}</p>
            </div>

            {/* problem */}
            <div className="idd-section">
              <h2 className="idd-section-title">المشكلة التي تعالجها</h2>
              <p className="idd-section-text">{idea.problem}</p>
            </div>

            {/* features */}
            <div className="idd-section">
              <h2 className="idd-section-title">الوظائف الأساسية</h2>
              <ul className="idd-checklist">
                {idea.features.map((f, i) => (
                  <li key={i} className="idd-checklist-item">
                    <span className="idd-check-icon"><IconCheck /></span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* requirements */}
            <div className="idd-section">
              <h2 className="idd-section-title">المتطلبات والمخرجات</h2>
              <ul className="idd-checklist">
                {idea.requirements.map((r, i) => (
                  <li key={i} className="idd-checklist-item">
                    <span className="idd-check-icon"><IconCheck /></span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            {/* tech stack */}
            <div className="idd-section">
              <h2 className="idd-section-title">التقنيات المقترحة</h2>
              <div className="idd-tech-wrap">
                {idea.tech_stack.map(t => (
                  <span key={t} className="idd-tech-badge">{t}</span>
                ))}
              </div>
            </div>

            {/* CTA note */}
            <div className="idd-cta-note">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ flexShrink: 0, opacity: .6, marginTop: 2 }}>
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              <span>
                هذه فكرة مشروع تخرج جاهزة. أي تقديم على المشروع لن يُقبل إلا من خلال فريق معتمد مع توفر مشرف.
                <strong style={{ display: 'block', marginTop: 3 }}>
                  تم آخر تحديث للأفكار في {idea.approved_at ?? '—'} · نحو إنجاز أثر
                </strong>
              </span>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
