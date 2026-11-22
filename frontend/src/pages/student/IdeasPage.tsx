import { useState, useMemo, useRef, useEffect, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import './IdeasPage.css'
import { MOCK_IDEAS } from '../../data/ideas'
import type { Idea } from '../../types/api'
import { UnivLogo } from '../../components/ui/UnivLogo'

/* ================================================================
   Custom Dropdown
   ================================================================ */
function Dropdown({
  options, value, onChange, label,
}: {
  options: string[]
  value: string
  onChange: (v: string) => void
  label: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <div className="ideas-dropdown" ref={ref}>
      <label className="ideas-filter-label">{label}</label>
      <button type="button" className={`ideas-dropdown-btn${open ? ' open' : ''}`}
        onClick={() => setOpen(o => !o)}>
        <span>{value}</span>
        <svg className={`ideas-dropdown-chevron${open ? ' rotated' : ''}`}
          width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="ideas-dropdown-menu">
          {options.map(opt => (
            <button key={opt} type="button"
              className={`ideas-dropdown-item${value === opt ? ' active' : ''}`}
              onClick={() => { onChange(opt); setOpen(false) }}>
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ================================================================
   Tags Input — يقبل كلمات مفتاحية كـ chips
   ================================================================ */
function TagsInput({
  label, placeholder, value, onChange, error,
}: {
  label: string
  placeholder: string
  value: string[]
  onChange: (v: string[]) => void
  error?: string
}) {
  const [input, setInput] = useState('')

  const add = () => {
    const v = input.trim()
    if (v && !value.includes(v) && value.length < 10) {
      onChange([...value, v])
      setInput('')
    }
  }

  return (
    <div className="field">
      <label className="field-label">{label}</label>
      <div className={`pi-tags-box${error ? ' has-error' : ''}`}>
        {value.map(t => (
          <span key={t} className="pi-chip">
            {t}
            <button type="button" className="pi-chip-remove"
              onClick={() => onChange(value.filter(x => x !== t))}>×</button>
          </span>
        ))}
        <input
          className="pi-tags-input"
          placeholder={value.length === 0 ? placeholder : '+ إضافة'}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
        />
      </div>
      {error && <span className="field-error">{error}</span>}
      <span className="field-hint">اضغط Enter بعد كل إدخال</span>
    </div>
  )
}

/* ================================================================
   Submit Idea Modal
   ================================================================ */
const MAJORS    = ['هندسة البرمجيات', 'هندسة الحاسوب', 'نظم المعلومات', 'الذكاء الاصطناعي', 'أمن المعلومات', 'إنترنت الأشياء']
const MOCK_SUPS = ['د. سارة الحسن', 'د. عمر الدرويش', 'د. رامي منصور', 'د. مازن علي', 'د. نور حجور']

/* ── Dropdown داخل الـ Modal (بدون label خارجي) ── */
function ModalDropdown({
  options, value, onChange, placeholder,
}: {
  options: string[]
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const display = value || placeholder

  return (
    <div className="pi-select" ref={ref}>
      <button
        type="button"
        className={`pi-select-btn${open ? ' open' : ''}${!value ? ' placeholder' : ''}`}
        onClick={() => setOpen(o => !o)}
      >
        <span>{display}</span>
        <svg className={`ideas-dropdown-chevron${open ? ' rotated' : ''}`}
          width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="pi-select-menu">
          {options.filter(o => o !== '').map(opt => (
            <button
              key={opt}
              type="button"
              className={`pi-select-item${value === opt ? ' active' : ''}`}
              onClick={() => { onChange(opt); setOpen(false) }}
            >
              {value === opt && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

interface SubmitIdeaModalProps {
  onClose: () => void
  onSubmit: (idea: Idea) => void
}

function SubmitIdeaModal({ onClose, onSubmit }: SubmitIdeaModalProps) {
  /* ── form state ── */
  const [title,       setTitle]       = useState('')
  const [field,       setField]       = useState('')
  const [description, setDescription] = useState('')
  const [problem,     setProblem]     = useState('')
  const [features,    setFeatures]    = useState<string[]>([])
  const [requirements,setRequirements]= useState<string[]>([])
  const [techStack,   setTechStack]   = useState<string[]>([])
  const [supervisor,  setSupervisor]  = useState('')
  const [errors,      setErrors]      = useState<Record<string, string>>({})
  const [submitted,   setSubmitted]   = useState(false)
  const [step,        setStep]        = useState<1 | 2>(1)

  /* إغلاق بـ Escape */
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  const validate1 = () => {
    const e: Record<string, string> = {}
    if (!title.trim())       e.title       = 'عنوان الفكرة مطلوب'
    if (!field)              e.field       = 'المجال مطلوب'
    if (description.trim().length < 30)
                             e.description = 'الوصف يجب أن يكون 30 حرفاً على الأقل'
    if (!problem.trim())     e.problem     = 'وصف المشكلة مطلوب'
    return e
  }

  const validate2 = () => {
    const e: Record<string, string> = {}
    if (features.length < 2)     e.features     = 'أدخل وظيفتين على الأقل'
    if (requirements.length < 1) e.requirements = 'أدخل متطلباً واحداً على الأقل'
    if (techStack.length < 1)    e.techStack    = 'أدخل تقنية واحدة على الأقل'
    if (!supervisor)             e.supervisor   = 'المشرف المقترح مطلوب'
    return e
  }

  const nextStep = () => {
    const e = validate1()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setStep(2)
  }

  const handleSubmit = (ev: FormEvent) => {
    ev.preventDefault()
    const e = validate2()
    if (Object.keys(e).length) { setErrors(e); return }

    const newIdea: Idea = {
      id:           Date.now(),
      code:         `IDEA-${String(Math.floor(Math.random() * 900) + 100)}`,
      title:        title.trim(),
      field,
      status:       'pending',
      supervisor:   supervisor,
      tags:         techStack,
      teams:        [],
      description:  description.trim(),
      problem:      problem.trim(),
      features,
      requirements,
      tech_stack:   techStack,
    }
    onSubmit(newIdea)
    setSubmitted(true)
  }

  /* ── Success screen ── */
  if (submitted) return (
    <div className="pi-overlay" onClick={onClose}>
      <div className="pi-modal" onClick={e => e.stopPropagation()}>
        <div className="pi-success">
          <div className="pi-success-icon">✓</div>
          <h2>تم إرسال فكرتك بنجاح!</h2>
          <p>
            فكرتك الآن <strong>قيد مراجعة اللجنة العلمية</strong>.<br />
            ستصلك إشعار بالقرار خلال 3–5 أيام عمل على بريدك الجامعي.
          </p>
          <div className="pi-success-note">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <span>يمكنك متابعة حالة فكرتك من تبويب "أفكاري" أو من صفحة بنك الأفكار.</span>
          </div>
          <button className="btn btn-primary btn-block" onClick={onClose}>
            حسناً، عودة للبنك
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="pi-overlay" onClick={onClose}>
      <div className="pi-modal" onClick={e => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="pi-header">
          <div>
            <h2 className="pi-title">طرح فكرة مشروع</h2>
            <p className="pi-sub">ستمر فكرتك بمسار مراجعة اللجنة العلمية قبل الاعتماد</p>
          </div>
          <button className="pi-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* ── Step indicator ── */}
        <div className="pi-steps">
          <div className={`pi-step${step >= 1 ? ' active' : ''}`}>
            <div className="pi-step-num">1</div>
            <span>معلومات الفكرة</span>
          </div>
          <div className="pi-step-line" />
          <div className={`pi-step${step >= 2 ? ' active' : ''}`}>
            <div className="pi-step-num">2</div>
            <span>التفاصيل التقنية</span>
          </div>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} noValidate className="pi-form">
          <div className="pi-body">

            {step === 1 && (
              <>
                {/* title */}
                <div className="field">
                  <label className="field-label">عنوان الفكرة <span className="req">*</span></label>
                  <input
                    className={`control no-icon${errors.title ? ' has-error' : ''}`}
                    placeholder="مثال: منصة ذكية لإدارة المكتبات الجامعية"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                  />
                  {errors.title && <span className="field-error">{errors.title}</span>}
                </div>

                {/* field (major) */}
                <div className="field">
                  <label className="field-label">المجال <span className="req">*</span></label>
                  <div className={`pi-dropdown-wrap${errors.field ? ' has-error' : ''}`}>
                    <ModalDropdown
                      options={['', ...MAJORS]}
                      value={field}
                      onChange={setField}
                      placeholder="— اختر المجال —"
                    />
                  </div>
                  {errors.field && <span className="field-error">{errors.field}</span>}
                </div>

                {/* description */}
                <div className="field">
                  <label className="field-label">وصف الفكرة <span className="req">*</span></label>
                  <textarea
                    className={`control no-icon pi-textarea${errors.description ? ' has-error' : ''}`}
                    placeholder="اشرح فكرتك بوضوح: ما هو المشروع؟ ما القيمة التي يضيفها؟ من المستفيد منه؟"
                    rows={4}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                  <span className="field-hint">{description.length} / 30 حرف كحد أدنى</span>
                  {errors.description && <span className="field-error">{errors.description}</span>}
                </div>

                {/* problem */}
                <div className="field">
                  <label className="field-label">المشكلة التي تعالجها <span className="req">*</span></label>
                  <textarea
                    className={`control no-icon pi-textarea${errors.problem ? ' has-error' : ''}`}
                    placeholder="ما المشكلة الحالية؟ لماذا تحتاج حلاً؟"
                    rows={3}
                    value={problem}
                    onChange={e => setProblem(e.target.value)}
                  />
                  {errors.problem && <span className="field-error">{errors.problem}</span>}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                {/* features */}
                <TagsInput
                  label="الوظائف الأساسية *"
                  placeholder="مثال: إدارة المستخدمين، لوحة تحكم..."
                  value={features}
                  onChange={setFeatures}
                  error={errors.features}
                />

                {/* requirements */}
                <TagsInput
                  label="المتطلبات والمخرجات *"
                  placeholder="مثال: تقرير PDF، واجهة عربية..."
                  value={requirements}
                  onChange={setRequirements}
                  error={errors.requirements}
                />

                {/* tech stack */}
                <TagsInput
                  label="التقنيات المقترحة *"
                  placeholder="مثال: React، Node.js، PostgreSQL..."
                  value={techStack}
                  onChange={setTechStack}
                  error={errors.techStack}
                />

                {/* supervisor */}
                <div className="field">
                  <label className="field-label">المشرف المقترح <span className="req">*</span></label>
                  <div className={errors.supervisor ? 'pi-dropdown-wrap has-error' : 'pi-dropdown-wrap'}>
                    <ModalDropdown
                      options={MOCK_SUPS}
                      value={supervisor}
                      onChange={setSupervisor}
                      placeholder="— اختر المشرف المقترح —"
                    />
                  </div>
                  {errors.supervisor && <span className="field-error">{errors.supervisor}</span>}
                  <span className="field-hint">الاختيار النهائي يعتمده مسؤول القسم</span>
                </div>

                {/* info note */}
                <div className="pi-info-note">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    style={{ flexShrink: 0, marginTop: 2, opacity: .7 }}>
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="16" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                  </svg>
                  <span>
                    بعد إرسال الفكرة، ستظهر في القائمة بحالة <strong>قيد المراجعة</strong> حتى تبتّ اللجنة العلمية بها.
                    يمكنك تعديلها ما لم تُحوَّل للمراجعة.
                  </span>
                </div>
              </>
            )}

          </div>

          {/* ── Footer ── */}
          <div className="pi-footer">
            {step === 1 ? (
              <>
                <button type="button" className="btn btn-ghost" onClick={onClose}>إلغاء</button>
                <button type="button" className="btn btn-primary" onClick={nextStep}>
                  التالي: التفاصيل التقنية →
                </button>
              </>
            ) : (
              <>
                <button type="button" className="btn btn-secondary" onClick={() => { setStep(1); setErrors({}) }}>
                  ← السابق
                </button>
                <button type="submit" className="btn btn-primary">
                  إرسال الفكرة للمراجعة
                </button>
              </>
            )}
          </div>
        </form>

      </div>
    </div>
  )
}

/* ================================================================
   Helpers
   ================================================================ */
function getTeamBadge(idea: Idea) {
  const hasYours = idea.teams.some(t => t.status === 'your_team')
  if (hasYours) return { label: 'مشروع فريقك', cls: 'idea-badge idea-badge-yours' }
  return null
}

function statusLabel(s: Idea['status']) {
  if (s === 'approved') return { text: 'معتمدة',       cls: 'idea-status-approved' }
  if (s === 'pending')  return { text: 'قيد المراجعة', cls: 'idea-status-pending'  }
  return                       { text: 'مرفوضة',        cls: 'idea-status-rejected' }
}

const FIELD_TABS    = ['كل الأفكار', ...Array.from(new Set(MOCK_IDEAS.map(i => i.field)))]
const ALL_SUPERVISORS = ['جميع المشرفين', ...Array.from(new Set(MOCK_IDEAS.map(i => i.supervisor)))]
const PAGE_SIZE = 6

/* ================================================================
   IdeaCard
   ================================================================ */
function IdeaCard({ idea }: { idea: Idea }) {
  const st        = statusLabel(idea.status)
  const badge     = getTeamBadge(idea)
  const openTeams = idea.teams.filter(t => t.status === 'open').length

  return (
    <div className={`idea-card${badge ? ' idea-card-yours' : ''}`}>
      <div className="idea-card-head">
        <div className="idea-card-meta">
          {badge && <span className={badge.cls}>{badge.label}</span>}
          <span className={`idea-status ${st.cls}`}>
            <span className="idea-status-dot" />
            {st.text}
          </span>
        </div>
        <div className="idea-card-code">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: .4 }}>
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8"  x2="12"    y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {idea.code}
        </div>
      </div>

      <h3 className="idea-card-title">{idea.title}</h3>
      <p  className="idea-card-desc">{idea.description.slice(0, 90)}…</p>

      <div className="idea-card-supervisor">
        <span className="idea-card-supervisor-label">المشرف</span>
        <span className="idea-card-supervisor-name">{idea.supervisor}</span>
      </div>

      <div className="idea-card-tags">
        {idea.tags.map(t => <span key={t} className="idea-tag">{t}</span>)}
      </div>

      <div className="idea-card-footer">
        <span className="idea-card-teams">
          {idea.status === 'pending'
            ? 'قيد مراجعة اللجنة'
            : openTeams > 0
              ? 'فريق واحد مناح'
              : idea.teams.length === 0
                ? 'التسجيل مفتوح'
                : 'الفرق مكتملة'}
        </span>
        {idea.status === 'approved' ? (
          <Link to={`/student/ideas/${idea.id}`} className="idea-card-cta">
            تفاصيل الفكرة
          </Link>
        ) : (
          <span className="idea-card-cta-disabled">قيد المراجعة</span>
        )}
      </div>
    </div>
  )
}

/* ================================================================
   IdeasPage
   ================================================================ */
export function IdeasPage() {
  const [search,     setSearch]     = useState('')
  const [activeTab,  setActiveTab]  = useState('كل الأفكار')
  const [supervisor, setSupervisor] = useState('جميع المشرفين')
  const [page,       setPage]       = useState(1)
  const [showModal,  setShowModal]  = useState(false)

  /* الأفكار المضافة من الطالب (pending) */
  const [myIdeas, setMyIdeas] = useState<Idea[]>([])

  const allIdeas = useMemo(() => [...myIdeas, ...MOCK_IDEAS], [myIdeas])

  const changeTab    = (tab: string) => { setActiveTab(tab);  setPage(1) }
  const changeSup    = (s: string)   => { setSupervisor(s);   setPage(1) }
  const changeSearch = (s: string)   => { setSearch(s);       setPage(1) }

  const filtered = useMemo(() => allIdeas.filter(idea => {
    const matchSearch =
      !search.trim() ||
      idea.title.includes(search) ||
      idea.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
    const matchField      = activeTab === 'كل الأفكار' || idea.field === activeTab
    const matchSupervisor = supervisor === 'جميع المشرفين' || idea.supervisor === supervisor
    return matchSearch && matchField && matchSupervisor
  }), [search, activeTab, supervisor, allIdeas])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleNewIdea = (idea: Idea) => {
    setMyIdeas(prev => [idea, ...prev])
  }

  return (
    <div className="db-wrap">
      {showModal && (
        <SubmitIdeaModal
          onClose={() => setShowModal(false)}
          onSubmit={handleNewIdea}
        />
      )}

      {/* ── Topbar ── */}
      <header className="db-topbar">
        <div className="db-topbar-breadcrumb">
          <Link to="/student/dashboard">مساحة الطالب</Link>
          <span className="db-topbar-sep">/</span>
          <span className="db-topbar-current">بنك الأفكار</span>
        </div>
        <div className="db-topbar-univ">
          <UnivLogo height={34} />
        </div>
      </header>

      {/* ── Body ── */}
      <div className="db-body">
        <div className="db-body-inner">

        {/* heading + CTA */}
        <div className="ideas-page-head">
          <div>
            <h1 className="db-page-title">بنك الأفكار المعتمدة</h1>
            <p className="db-page-sub">
              استكشف أفكار اللجنة العلمية، وقارن الفرق المتاحة قبل اختيار مسارك.
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            طرح فكرة
          </button>
        </div>

        {/* ── Filters ── */}
        <div className="ideas-filters">
          <div className="ideas-filter-group">
            <label className="ideas-filter-label">البحث في الأفكار</label>
            <div className="ideas-search-wrap">
              <svg className="ideas-search-icon" width="14" height="14" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                className="ideas-search-input"
                placeholder="ابحث باسم الفكرة أو التقنية أو الكلمات المفتاحية"
                value={search}
                onChange={e => changeSearch(e.target.value)}
              />
            </div>
          </div>

          <Dropdown
            label="المشرف"
            options={ALL_SUPERVISORS}
            value={supervisor}
            onChange={changeSup}
          />

          <button className="btn btn-primary ideas-search-btn" onClick={() => setPage(1)}>
            بحث
          </button>
        </div>

        {/* ── Tabs + count ── */}
        <div className="ideas-results-head">
          <span className="ideas-results-count">
            عرض {paginated.length} من {filtered.length} فكرة
          </span>
          <div className="ideas-tabs">
            {FIELD_TABS.map(tab => (
              <button key={tab}
                className={`idea-tab${activeTab === tab ? ' idea-tab-active' : ''}`}
                onClick={() => changeTab(tab)}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* ── Grid ── */}
        {paginated.length === 0 ? (
          <div className="db-card" style={{ marginTop: 8 }}>
            <div className="db-empty" style={{ padding: '52px 16px' }}>
              <div className="db-empty-emoji">🔍</div>
              <div className="db-empty-text">لا توجد أفكار تطابق معايير البحث</div>
            </div>
          </div>
        ) : (
          <div className="ideas-grid">
            {paginated.map(idea => <IdeaCard key={idea.id} idea={idea} />)}
          </div>
        )}

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="ideas-pagination">
            <button className="ideas-page-btn" disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}>
              الصفحة التالية →
            </button>
            <span className="ideas-page-info">
              الصفحة {page} من {totalPages}
            </span>
            <button className="ideas-page-btn" disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}>
              ← الصفحة السابقة
            </button>
          </div>
        )}

        </div>{/* end db-body-inner */}
      </div>
    </div>
  )
}
