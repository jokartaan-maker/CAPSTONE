import './DashboardPage.css'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  iconPersons,
  iconMonitor,
  iconShieldCheck,
  iconGradCap,
} from '../../assets/icons/index'
import type { StudentProject, ProjectStatus } from '../../types/api'

/* ── small helpers ── */
const StatIco = ({ src }: { src: string }) => (
  <img src={src} alt="" className="db-stat-label-icon" />
)

/* project status → Arabic label + badge variant */
function getStatusInfo(status: ProjectStatus): { label: string; variant: 'warning' | 'success' | 'muted' | 'danger' } {
  switch (status) {
    case 'pending_approval': return { label: 'قيد المراجعة',   variant: 'warning' }
    case 'approved':         return { label: 'معتمد',           variant: 'success' }
    case 'in_progress':      return { label: 'قيد التنفيذ',    variant: 'warning' }
    case 'under_review':     return { label: 'تحت المراجعة',   variant: 'warning' }
    case 'completed':        return { label: 'مكتمل',           variant: 'success' }
    case 'rejected':         return { label: 'مرفوض',           variant: 'danger'  }
    default:                 return { label: status,             variant: 'muted'   }
  }
}

/* milestone steps */
const MILESTONES = [
  { key: 'form',   label: 'تشكيل الفريق',    desc: 'اختر أعضاء الفريق وأكمل التسجيل'  },
  { key: 'idea',   label: 'اعتماد الفكرة',    desc: 'قدّم فكرة المشروع للمشرف'          },
  { key: 'design', label: 'التحليل والتصميم', desc: 'ضع خطة المشروع والتصميم التقني'   },
  { key: 'dev',    label: 'التطوير',           desc: 'ابدأ تطوير المشروع حسب الخطة'      },
  { key: 'final',  label: 'إضافة النهائية',   desc: 'الاختبار والتسليم النهائي'          },
]

/* which milestone step is active based on status */
function getMilestoneIndex(status: ProjectStatus | undefined): number {
  if (!status) return -1
  switch (status) {
    case 'pending_approval': return 1
    case 'approved':         return 1
    case 'in_progress':      return 2
    case 'under_review':     return 3
    case 'completed':        return 5   // all done
    default:                 return 0
  }
}

/* ─────────────────────────────────────────────────────────────
   Hero card: shown when a project exists
───────────────────────────────────────────────────────────── */
function ProjectHeroCard({ project }: { project: StudentProject }) {
  const { label, variant } = getStatusInfo(project.status)

  return (
    <div className="db-project-card">
      <div className="db-project-card-inner">
        <div className="db-project-badges">
          {project.team_name && (
            <span className="db-badge db-badge-muted">
              مشروع التخرج · {project.team_name}
            </span>
          )}
          <span className={`db-badge db-badge-${variant}`}>
            <span className="db-badge-dot" />
            {label}
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
            <span>التقدم الكلي للمشروع</span>
            <span className="db-progress-pct">{project.progress}%</span>
          </div>
          <div className="db-progress-bar-track">
            <div
              className="db-progress-bar-fill"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   Hero card: shown when no project yet
───────────────────────────────────────────────────────────── */
function NoProjectCard() {
  return (
    <div className="db-project-card">
      <div className="db-project-card-inner">
        <div className="db-project-empty">
          <div className="db-project-empty-icon">🚀</div>
          <div className="db-project-empty-title">لم تنضم إلى فريق بعد</div>
          <div className="db-project-empty-sub">
            ابحث عن فريق أو أنشئ فريقاً جديداً لبدء مشروع تخرجك
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   Main page
───────────────────────────────────────────────────────────── */
export function DashboardPage() {
  const { student } = useAuth()
  const firstName = student?.name?.split(' ')[0] ?? 'الطالب'

  /*
   * project: null  → لم ينضم لفريق بعد
   * project: {...} → لديه مشروع نشط
   *
   * في المستقبل يُحمَّل من API:
   *   useEffect(() => { dashboardApi.getProject().then(r => setProject(r.project)) }, [])
   */
  const [project] = useState<StudentProject | null>(null)
  const milestoneActiveIdx = getMilestoneIndex(project?.status)

  /* Stats — صفر لما مافي مشروع، من المشروع لما موجود */
  const stats = {
    teamMembers:      project?.team_members.length  ?? 0,
    tasksTotal:       project?.tasks_total          ?? 0,
    tasksCompleted:   project?.tasks_completed      ?? 0,
    reportsSubmitted: project?.reports_submitted    ?? 0,
    openNotes:        project?.open_notes           ?? 0,
  }

  return (
    <>
      {/* ── Topbar ── */}
      <header className="db-topbar">
        <div className="db-topbar-breadcrumb">
          <Link to="/student/dashboard">مساحة الطالب</Link>
          <span className="db-topbar-sep">/</span>
          <span className="db-topbar-current">نظرة عامة</span>
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

        {/* Page heading */}
        <div className="db-page-head">
          <div className="db-page-eyebrow">
            <Link to="/student/dashboard">مساحة الطالب</Link>
          </div>
          <h1 className="db-page-title">كل خطوة تقرّبك من الإنجاز</h1>
          <p className="db-page-sub">
            مرحباً {firstName}، هذه نظرة شاملة على حالة مشروعك وما يحتاج انتباهك اليوم.
          </p>
        </div>

        {/* ── Project hero card ── */}
        {project ? <ProjectHeroCard project={project} /> : <NoProjectCard />}

        {/* ── Stats row ── */}
        <div className="db-stats-row">
          <div className="db-stat-card">
            <div className="db-stat-label">
              <StatIco src={iconPersons} />
              أعضاء الفريق
            </div>
            <div className="db-stat-value">{stats.teamMembers}</div>
            <div className="db-stat-sub">
              {stats.teamMembers === 0 ? 'لا يوجد فريق حالياً' : `${stats.teamMembers} أعضاء نشطون`}
            </div>
          </div>

          <div className="db-stat-card">
            <div className="db-stat-label">
              <StatIco src={iconMonitor} />
              المهام المكتملة
            </div>
            <div className="db-stat-value">
              {stats.tasksCompleted} / {stats.tasksTotal}
            </div>
            <div className="db-stat-sub">
              {stats.tasksTotal === 0 ? 'لا توجد مهام مسندة' : `${stats.tasksTotal - stats.tasksCompleted} مهام متبقية`}
            </div>
          </div>

          <div className="db-stat-card">
            <div className="db-stat-label">
              <StatIco src={iconShieldCheck} />
              التقارير المسلّمة
            </div>
            <div className="db-stat-value">{stats.reportsSubmitted}</div>
            <div className="db-stat-sub">
              {stats.reportsSubmitted === 0 ? 'لا توجد تقارير' : 'تقرير مسلّم'}
            </div>
          </div>

          <div className="db-stat-card">
            <div className="db-stat-label">
              <StatIco src={iconGradCap} />
              الملاحظات المفتوحة
            </div>
            <div className="db-stat-value">{stats.openNotes}</div>
            <div className="db-stat-sub">
              {stats.openNotes === 0 ? 'لا توجد ملاحظات' : 'ملاحظة مفتوحة'}
            </div>
          </div>
        </div>

        {/* ── Main two-column grid ── */}
        <div className="db-grid">

          {/* Left column */}
          <div>

            {/* Graduation path */}
            <div className="db-card" style={{ marginBottom: 20 }}>
              <div className="db-card-header">
                <div>
                  <div className="db-card-title">مسار مشروع التخرج</div>
                  <div className="db-card-sub">
                    {project
                      ? `أنت في مرحلة: ${MILESTONES[milestoneActiveIdx]?.label ?? '—'}`
                      : 'أنت الآن في مرحلة البداية — ابدأ بتشكيل الفريق'}
                  </div>
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
                          <svg width="8" height="8" viewBox="0 0 24 24" fill="var(--navy-mid)">
                            <circle cx="12" cy="12" r="6" />
                          </svg>
                        ) : null}
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

            {/* Two-col row: tasks + activity */}
            <div className="db-row">

              {/* Upcoming tasks */}
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

              {/* Activity feed */}
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

          {/* Right column */}
          <div className="db-right-col">

            {/* Nearest deadline */}
            <div className="db-card">
              <div className="db-card-header">
                <div className="db-card-title">الموعد الأقرب</div>
              </div>
              <div className="db-card-body" style={{ paddingTop: 12 }}>
                <div className="db-empty">
                  <div className="db-empty-emoji">📅</div>
                  <div className="db-empty-text">لا توجد مواعيد قادمة</div>
                </div>
              </div>
            </div>

            {/* Team members */}
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

            {/* Supervisor notes */}
            <div className="db-card">
              <div className="db-card-header">
                <div className="db-card-title">ملاحظات المشرف</div>
              </div>
              <div className="db-card-body" style={{ paddingTop: 12 }}>
                <div className="db-empty">
                  <div className="db-empty-emoji">💬</div>
                  <div className="db-empty-text">لا توجد ملاحظات من المشرف</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
