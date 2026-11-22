import './DashboardPage.css'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { CapstoneLogotype } from '../../components/ui/CapstoneLogotype'
import { DashboardPageSkeleton } from '../../components/ui/Skeleton'
import { usePageLoader } from '../../hooks/usePageLoader'
import type { StudentProject, ProjectStatus } from '../../types/api'

/* ── Status helpers ── */
function getStatusInfo(status: ProjectStatus) {
  switch (status) {
    case 'pending_approval': return { label: 'قيد المراجعة', variant: 'warning' }
    case 'approved':         return { label: 'معتمد',          variant: 'success' }
    case 'in_progress':      return { label: 'قيد التنفيذ',   variant: 'warning' }
    case 'under_review':     return { label: 'تحت المراجعة',  variant: 'warning' }
    case 'completed':        return { label: 'مكتمل',          variant: 'success' }
    case 'rejected':         return { label: 'مرفوض',          variant: 'danger'  }
    default:                 return { label: status,            variant: 'muted'   }
  }
}

/* ── Milestone steps ── */
const MILESTONES = [
  { key: 'form',   label: 'تشكيل الفريق',    desc: 'اختر أعضاء الفريق وأكمل التسجيل' },
  { key: 'idea',   label: 'اعتماد الفكرة',    desc: 'قدّم فكرة المشروع للمشرف'         },
  { key: 'design', label: 'التحليل والتصميم', desc: 'ضع خطة المشروع والتصميم التقني'  },
  { key: 'dev',    label: 'التطوير',           desc: 'ابدأ تطوير المشروع حسب الخطة'     },
  { key: 'final',  label: 'التسليم النهائي',  desc: 'الاختبار والتسليم النهائي'         },
]

function getMilestoneIndex(status: ProjectStatus | undefined): number {
  if (!status) return -1
  switch (status) {
    case 'pending_approval': return 1
    case 'approved':         return 1
    case 'in_progress':      return 2
    case 'under_review':     return 3
    case 'completed':        return 5
    default:                 return 0
  }
}

/* ── SVG stat icons ── */
const STAT_ICONS = {
  team: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  tasks: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  reports: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  notes: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
}

/* ── Project Hero Card ── */
function ProjectHeroCard({ project }: { project: StudentProject }) {
  const { label, variant } = getStatusInfo(project.status)
  return (
    <div className="db-project-card">
      <div className="db-project-card-inner">
        <div className="db-project-badges">
          {project.team_name && (
            <span className="db-badge db-badge-muted">مشروع التخرج · {project.team_name}</span>
          )}
          <span className={`db-badge db-badge-${variant}`}>
            <span className="db-badge-dot" />{label}
          </span>
        </div>
        <div className="db-project-name">{project.name}</div>
        {(project.supervisor_name || project.major || project.semester) && (
          <div className="db-project-meta">
            {[
              project.supervisor_name && `إشراف: ${project.supervisor_name}`,
              project.major,
              project.semester,
            ].filter(Boolean).join(' · ')}
          </div>
        )}
        <div className="db-progress-wrap">
          <div className="db-progress-label">
            <span>التقدم الكلي</span>
            <span className="db-progress-pct">{project.progress}%</span>
          </div>
          <div className="db-progress-bar-track">
            <div className="db-progress-bar-fill" style={{ width: `${project.progress}%` }} />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── No Project Card ── */
function NoProjectCard() {
  return (
    <div className="db-project-card">
      <div className="db-project-card-inner">
        <div className="db-project-empty">
          <div className="db-project-empty-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
              stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div className="db-project-empty-title">لم تنضم إلى فريق بعد</div>
          <div className="db-project-empty-sub">
            استكشف بنك الأفكار واختر مشروعاً يناسبك، أو أنشئ فريقاً جديداً.
          </div>
          <Link to="/student/ideas" className="db-project-empty-cta">
            استعراض بنك الأفكار ←
          </Link>
        </div>
      </div>
    </div>
  )
}

/* ── Main Page ── */
export function DashboardPage() {
  const { student } = useAuth()
  const firstName = student?.name?.split(' ')[0] ?? 'الطالب'
  const loading = usePageLoader(700)

  const [project] = useState<StudentProject | null>(null)
  const milestoneActiveIdx = getMilestoneIndex(project?.status)

  const stats = {
    teamMembers:      project?.team_members.length ?? 0,
    tasksTotal:       project?.tasks_total         ?? 0,
    tasksCompleted:   project?.tasks_completed     ?? 0,
    reportsSubmitted: project?.reports_submitted   ?? 0,
    openNotes:        project?.open_notes          ?? 0,
  }

  if (loading) return <DashboardPageSkeleton />

  return (
    <div className="db-wrap">

      {/* ── Topbar ── */}
      <header className="db-topbar">
        <div className="db-topbar-breadcrumb">
          <Link to="/student/dashboard">مساحة الطالب</Link>
          <span className="db-topbar-sep">/</span>
          <span className="db-topbar-current">نظرة عامة</span>
        </div>
        <div className="db-topbar-right">
          <CapstoneLogotype height={36} />
        </div>
      </header>

      {/* ── Body ── */}
      <div className="db-body">
        <div className="db-body-inner">

          {/* Page heading */}
          <div className="db-page-head">
            <div className="db-page-eyebrow">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              <Link to="/student/dashboard">مساحة الطالب</Link>
            </div>
            <h1 className="db-page-title">مرحباً {firstName} </h1>
            <p className="db-page-sub">
              هذه نظرة شاملة على حالة مشروعك وما يحتاج انتباهك اليوم.
            </p>
          </div>

          {/* Project hero */}
          {project ? <ProjectHeroCard project={project} /> : <NoProjectCard />}

          {/* Stats */}
          <div className="db-stats-row">

            <div className="db-stat-card">
              <div className="db-stat-icon db-stat-icon-blue">{STAT_ICONS.team}</div>
              <div className="db-stat-body">
                <div className="db-stat-label">أعضاء الفريق</div>
                <div className="db-stat-value">{stats.teamMembers}</div>
                <div className="db-stat-sub">{stats.teamMembers === 0 ? 'لا يوجد فريق بعد' : `${stats.teamMembers} أعضاء نشطون`}</div>
              </div>
            </div>

            <div className="db-stat-card">
              <div className="db-stat-icon db-stat-icon-purple">{STAT_ICONS.tasks}</div>
              <div className="db-stat-body">
                <div className="db-stat-label">المهام المكتملة</div>
                <div className="db-stat-value">{stats.tasksCompleted}<span className="db-stat-total">/{stats.tasksTotal}</span></div>
                <div className="db-stat-sub">{stats.tasksTotal === 0 ? 'لا توجد مهام بعد' : `${stats.tasksTotal - stats.tasksCompleted} متبقية`}</div>
              </div>
            </div>

            <div className="db-stat-card">
              <div className="db-stat-icon db-stat-icon-green">{STAT_ICONS.reports}</div>
              <div className="db-stat-body">
                <div className="db-stat-label">التقارير المسلّمة</div>
                <div className="db-stat-value">{stats.reportsSubmitted}</div>
                <div className="db-stat-sub">{stats.reportsSubmitted === 0 ? 'لا توجد تقارير' : 'تقرير مسلّم'}</div>
              </div>
            </div>

            <div className="db-stat-card">
              <div className="db-stat-icon db-stat-icon-amber">{STAT_ICONS.notes}</div>
              <div className="db-stat-body">
                <div className="db-stat-label">ملاحظات مفتوحة</div>
                <div className="db-stat-value">{stats.openNotes}</div>
                <div className="db-stat-sub">{stats.openNotes === 0 ? 'لا توجد ملاحظات' : 'ملاحظة مفتوحة'}</div>
              </div>
            </div>

          </div>

          {/* Two-column grid */}
          <div className="db-grid">

            {/* ── Left (main) column ── */}
            <div className="db-left-col">

              {/* Milestone timeline */}
              <div className="db-card" style={{ marginBottom: 16 }}>
                <div className="db-card-header">
                  <div>
                    <div className="db-card-title">مسار مشروع التخرج</div>
                    <div className="db-card-sub">
                      {project
                        ? `أنت في مرحلة: ${MILESTONES[milestoneActiveIdx]?.label ?? '—'}`
                        : 'ابدأ رحلتك بتشكيل الفريق واختيار الفكرة'}
                    </div>
                  </div>
                  <div className="db-card-badge">
                    {milestoneActiveIdx < 0 ? 'لم يبدأ' : `${milestoneActiveIdx + 1} / ${MILESTONES.length}`}
                  </div>
                </div>
                <div className="db-timeline">
                  {MILESTONES.map((m, idx) => {
                    const done   = milestoneActiveIdx > idx
                    const active = milestoneActiveIdx === idx
                    return (
                      <div className="db-timeline-step" key={m.key}>
                        <div className={`db-timeline-node${done ? ' done' : active ? ' active' : ''}`}>
                          {done ? (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                              stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          ) : active ? (
                            <div className="db-timeline-pulse" />
                          ) : (
                            <span className="db-timeline-num">{idx + 1}</span>
                          )}
                        </div>
                        <div className="db-timeline-info">
                          <div className={`db-timeline-step-label${!done && !active ? ' muted' : ''}`}>
                            {m.label}
                          </div>
                          <div className="db-timeline-step-desc">{m.desc}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Two-col row */}
              <div className="db-row">

                <div className="db-card">
                  <div className="db-card-header">
                    <div className="db-card-title">خطواتك التالية</div>
                  </div>
                  <div className="db-task-list">
                    <div className="db-empty">
                      <div className="db-empty-emoji">📋</div>
                      <div className="db-empty-text">لا توجد مهام مجدولة حالياً</div>
                    </div>
                  </div>
                </div>

                <div className="db-card">
                  <div className="db-card-header">
                    <div className="db-card-title">آخر الأنشطة</div>
                  </div>
                  <div className="db-activity-list">
                    <div className="db-empty">
                      <div className="db-empty-emoji">🕐</div>
                      <div className="db-empty-text">لا توجد أنشطة مسجّلة بعد</div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* ── Right column ── */}
            <div className="db-right-col">

              <div className="db-card">
                <div className="db-card-header">
                  <div className="db-card-title">الموعد الأقرب</div>
                </div>
                <div className="db-card-body">
                  <div className="db-empty">
                    <div className="db-empty-emoji">📅</div>
                    <div className="db-empty-text">لا توجد مواعيد قادمة</div>
                  </div>
                </div>
              </div>

              <div className="db-card">
                <div className="db-card-header">
                  <div className="db-card-title">أعضاء الفريق</div>
                </div>
                {project?.team_members.length ? (
                  <div className="db-members-list">
                    {project.team_members.map(m => (
                      <div className="db-member-item" key={m.id}>
                        <div className="db-member-avatar">
                          {m.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}
                        </div>
                        <div>
                          <div className="db-member-name">{m.name}</div>
                          <div className="db-member-role">{m.role}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="db-members-list">
                    <div className="db-empty">
                      <div className="db-empty-emoji">👥</div>
                      <div className="db-empty-text">لم تنضم إلى فريق بعد</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="db-card">
                <div className="db-card-header">
                  <div className="db-card-title">ملاحظات المشرف</div>
                </div>
                <div className="db-card-body">
                  <div className="db-empty">
                    <div className="db-empty-emoji">💬</div>
                    <div className="db-empty-text">لا توجد ملاحظات من المشرف</div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
