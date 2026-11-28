import { useState, useEffect, useRef, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import './IdeasPage.css'
import { ideasApi } from '../../api/ideas'
import { ApiError } from '../../api/client'
import type { Idea, IdeaFilters } from '../../types/api'
import { CapstoneLogotype } from '../../components/ui/CapstoneLogotype'
import { IdeasPageSkeleton } from '../../components/ui/Skeleton'
import { Alert } from '../../components/ui/Alert'

/* ── المجالات والـ PAGE SIZE ── */
const PAGE_SIZE = 6

/* ================================================================
   Custom Dropdown — للفلاتر
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
   Tags Input — chips
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
        <input className="pi-tags-input"
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
   Submit Idea Modal — طرح فكرة (local فقط — لا endpoint بعد)
   ================================================================ */
const MAJORS = ['هندسة البرمجيات', 'هندسة الحاسوب', 'نظم المعلومات', 'الذكاء الاصطناعي', 'أمن المعلومات', 'إنترنت الأشياء']

function ModalDropdown({ options, value, onChange, placeholder }: {
  options: string[]; value: string; onChange: (v: string) => void; placeholder: string
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
    <div className="pi-select" ref={ref}>
      <button type="button"
        className={`pi-select-btn${open ? ' open' : ''}${!value ? ' placeholder' : ''}`}
        onClick={() => setOpen(o => !o)}>
        <span>{value || placeholder}</span>
        <svg className={`ideas-dropdown-chevron${open ? ' rotated' : ''}`}
          width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="pi-select-menu">
          {options.filter(o => o !== '').map(opt => (
            <button key={opt} type="button"
              className={`pi-select-item${value === opt ? ' active' : ''}`}
              onClick={() => { onChange(opt); setOpen(false) }}>
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

function SubmitIdeaModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle]             = useState('')
  const [field, setField]             = useState('')
  const [description, setDescription] = useState('')
  const [problem, setProblem]         = useState('')
  const [features, setFeatures]       = useState<string[]>([])
  const [requirements, setRequirements] = useState<string[]>([])
  const [techStack, setTechStack]     = useState<string[]>([])
  const [errors, setErrors]           = useState<Record<string, string>>({})
  const [submitted, setSubmitted]     = useState(false)
  const [step, setStep]               = useState<1 | 2>(1)

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  const validate1 = () => {
    const e: Record<string, string> = {}
    if (!title.trim()) e.title = 'عنوان الفكرة مطلوب'
    if (!field)        e.field = 'المجال مطلوب'
    if (description.trim().length < 30) e.description = 'الوصف يجب أن يكون 30 حرفاً على الأقل'
    if (!problem.trim()) e.problem = 'وصف المشكلة مطلوب'
    return e
  }

  const validate2 = () => {
    const e: Record<string, string> = {}
    if (features.length < 2)     e.features     = 'أدخل وظيفتين على الأقل'
    if (requirements.length < 1) e.requirements = 'أدخل متطلباً واحداً على الأقل'
    if (techStack.length < 1)    e.techStack    = 'أدخل تقنية واحدة على الأقل'
    return e
  }

  const nextStep = () => {
    const e = validate1()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({}); setStep(2)
  }

  const handleSubmit = (ev: FormEvent) => {
    ev.preventDefault()
    const e = validate2()
    if (Object.keys(e).length) { setErrors(e); return }
    setSubmitted(true)
  }

  if (submitted) return (
    <div className="pi-overlay" onClick={onClose}>
      <div className="pi-modal" onClick={e => e.stopPropagation()}>
        <div className="pi-success">
          <div className="pi-success-icon">✓</div>
          <h2>تم إرسال فكرتك بنجاح!</h2>
          <p>فكرتك الآن <strong>قيد مراجعة اللجنة العلمية</strong>.<br />
            ستصلك إشعار بالقرار خلال 3–5 أيام عمل على بريدك الجامعي.</p>
          <div className="pi-success-note">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ flexShrink: 0, marginTop: 2 }}>
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <span>يمكنك متابعة حالة فكرتك من صفحة بنك الأفكار.</span>
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
        <div className="pi-steps">
          <div className={`pi-step${step >= 1 ? ' active' : ''}`}>
            <div className="pi-step-num">1</div><span>معلومات الفكرة</span>
          </div>
          <div className="pi-step-line" />
          <div className={`pi-step${step >= 2 ? ' active' : ''}`}>
            <div className="pi-step-num">2</div><span>التفاصيل التقنية</span>
          </div>
        </div>
        <form onSubmit={handleSubmit} noValidate className="pi-form">
          <div className="pi-body">
            {step === 1 && (
              <>
                <div className="field">
                  <label className="field-label">عنوان الفكرة <span className="req">*</span></label>
                  <input className={`control no-icon${errors.title ? ' has-error' : ''}`}
                    placeholder="مثال: منصة ذكية لإدارة المكتبات الجامعية"
                    value={title} onChange={e => setTitle(e.target.value)} />
                  {errors.title && <span className="field-error">{errors.title}</span>}
                </div>
                <div className="field">
                  <label className="field-label">المجال <span className="req">*</span></label>
                  <div className={`pi-dropdown-wrap${errors.field ? ' has-error' : ''}`}>
                    <ModalDropdown options={['', ...MAJORS]} value={field}
                      onChange={setField} placeholder="— اختر المجال —" />
                  </div>
                  {errors.field && <span className="field-error">{errors.field}</span>}
                </div>
                <div className="field">
                  <label className="field-label">وصف الفكرة <span className="req">*</span></label>
                  <textarea className={`control no-icon pi-textarea${errors.description ? ' has-error' : ''}`}
                    placeholder="اشرح فكرتك بوضوح: ما هو المشروع؟ ما القيمة التي يضيفها؟" rows={4}
                    value={description} onChange={e => setDescription(e.target.value)} />
                  <span className="field-hint">{description.length} / 30 حرف كحد أدنى</span>
                  {errors.description && <span className="field-error">{errors.description}</span>}
                </div>
                <div className="field">
                  <label className="field-label">المشكلة التي تعالجها <span className="req">*</span></label>
                  <textarea className={`control no-icon pi-textarea${errors.problem ? ' has-error' : ''}`}
                    placeholder="ما المشكلة الحالية؟ لماذا تحتاج حلاً؟" rows={3}
                    value={problem} onChange={e => setProblem(e.target.value)} />
                  {errors.problem && <span className="field-error">{errors.problem}</span>}
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <TagsInput label="الوظائف الأساسية *"
                  placeholder="مثال: إدارة المستخدمين، لوحة تحكم..."
                  value={features} onChange={setFeatures} error={errors.features} />
                <TagsInput label="المتطلبات والمخرجات *"
                  placeholder="مثال: تقرير PDF، واجهة عربية..."
                  value={requirements} onChange={setRequirements} error={errors.requirements} />
                <TagsInput label="التقنيات المقترحة *"
                  placeholder="مثال: React، Node.js، PostgreSQL..."
                  value={techStack} onChange={setTechStack} error={errors.techStack} />
                <div className="pi-info-note">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    style={{ flexShrink: 0, marginTop: 2, opacity: .7 }}>
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="16" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                  </svg>
                  <span>بعد إرسال الفكرة ستظهر بحالة <strong>قيد المراجعة</strong> حتى تبتّ اللجنة العلمية بها.</span>
                </div>
              </>
            )}
          </div>
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
                <button type="button" className="btn btn-secondary"
                  onClick={() => { setStep(1); setErrors({}) }}>← السابق</button>
                <button type="submit" className="btn btn-primary">إرسال الفكرة للمراجعة</button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

/* ================================================================
   IdeaCard
   ================================================================ */
function IdeaCard({ idea }: { idea: Idea }) {
  const openTeams = idea.teams.filter(t => t.status === 'open').length
  const isYours   = idea.teams.some(t => t.status === 'your_team')

  return (
    <div className={`idea-card${isYours ? ' idea-card-yours' : ''}`}>
      <div className="idea-card-head">
        <div className="idea-card-meta">
          {isYours && <span className="idea-badge idea-badge-yours">مشروع فريقك</span>}
        </div>
        <span className="idea-card-code">{idea.code}</span>
      </div>

      <div className="idea-card-field">{idea.field}</div>
      <h3 className="idea-card-title">{idea.title}</h3>
      <p  className="idea-card-desc">{idea.description.slice(0, 100)}…</p>

      {/* Supervisor */}
      {idea.supervisor && (
        <div className="idea-card-supervisor">
          <div className="idea-card-sup-avatar">
            {idea.supervisor.split(' ').slice(-1)[0]?.[0] ?? 'م'}
          </div>
          <div className="idea-card-sup-info">
            <span className="idea-card-sup-label">المشرف الأكاديمي</span>
            <span className="idea-card-sup-name">{idea.supervisor}</span>
          </div>
        </div>
      )}

      {/* Tags */}
      {idea.tags.length > 0 && (
        <div className="idea-card-tags">
          {idea.tags.slice(0, 3).map(t => <span key={t} className="idea-tag">{t}</span>)}
          {idea.tags.length > 3 && (
            <span className="idea-tag idea-tag-more">+{idea.tags.length - 3}</span>
          )}
        </div>
      )}

      <div className="idea-card-footer">
        <span className="idea-card-teams">
          {openTeams > 0 ? `${openTeams} فريق متاح` : 'التسجيل مفتوح'}
        </span>
        <Link to={`/student/ideas/${idea.id}`} className="idea-card-cta">
          عرض التفاصيل
        </Link>
      </div>
    </div>
  )
}

/* ================================================================
   IdeasPage
   ================================================================ */
export function IdeasPage() {
  /* ── API state ── */
  const [ideas,     setIdeas]     = useState<Idea[]>([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')

  /* ── Filter state ── */
  const [search,     setSearch]      = useState('')
  const [searchInput,setSearchInput] = useState('')
  const [activeTab,  setActiveTab]   = useState('كل الأفكار')
  const [supervisor, setSupervisor]  = useState('جميع المشرفين')
  const [page,       setPage]        = useState(1)
  const [showModal,  setShowModal]   = useState(false)

  /* ── Dynamic field tabs and supervisor list built from API data ── */
  const [fieldTabs,    setFieldTabs]    = useState<string[]>(['كل الأفكار'])
  const [supervisors,  setSupervisors]  = useState<string[]>(['جميع المشرفين'])

  /* ── Fetch ideas from API ── */
  const fetchIdeas = async (filters: IdeaFilters = {}) => {
    setLoading(true)
    setError('')
    try {
      const res = await ideasApi.index(filters)
      setIdeas(res.ideas)
    } catch (err) {
      if (err instanceof ApiError) setError(err.message)
      else setError('تعذّر تحميل الأفكار، تحقق من الاتصال')
    } finally {
      setLoading(false)
    }
  }

  /* أول تحميل — يبني الـ tabs والـ supervisors من كل الأفكار */
  useEffect(() => {
    void (async () => {
      setLoading(true)
      setError('')
      try {
        const res = await ideasApi.index()
        setIdeas(res.ideas)
        // بناء الـ tabs والـ supervisors مرة واحدة فقط من كل الأفكار
        const fields = ['كل الأفكار', ...Array.from(new Set(res.ideas.map(i => i.field)))]
        const sups   = ['جميع المشرفين', ...Array.from(
          new Set(res.ideas.map(i => i.supervisor).filter(Boolean) as string[])
        )]
        setFieldTabs(fields)
        setSupervisors(sups)
      } catch (err) {
        if (err instanceof ApiError) setError((err as ApiError).message)
        else setError('تعذّر تحميل الأفكار، تحقق من الاتصال')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  /* ── Handlers ── */
  const handleSearch = () => {
    setPage(1)
    const filters: IdeaFilters = {}
    if (searchInput.trim())           filters.search = searchInput.trim()
    if (activeTab !== 'كل الأفكار')  filters.field  = activeTab
    setSearch(searchInput.trim())
    void fetchIdeas(filters)
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    setPage(1)
    const filters: IdeaFilters = {}
    if (search)                       filters.search = search
    if (tab !== 'كل الأفكار')        filters.field  = tab
    void fetchIdeas(filters)
  }

  const handleSupChange = (s: string) => {
    setSupervisor(s)
    setPage(1)
    // الفلترة بالمشرف client-side لأن الـ API لا يقبل اسم المشرف
  }

  /* ── Client-side: supervisor filter + pagination ── */
  const filtered = supervisor === 'جميع المشرفين'
    ? ideas
    : ideas.filter(i => i.supervisor === supervisor)

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  /* ── Skeleton during first load ── */
  if (loading && ideas.length === 0) return <IdeasPageSkeleton />

  return (
    <div className="db-wrap">
      {showModal && <SubmitIdeaModal onClose={() => setShowModal(false)} />}

      {/* ── Topbar ── */}
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
          <span className="db-topbar-current">بنك الأفكار</span>
        </div>
        <CapstoneLogotype height={36} />
      </header>

      {/* ── Body ── */}
      <div className="db-body">
        <div className="db-body-inner">

          {/* Heading */}
          <div className="ideas-page-head">
            <div>
              <div className="ideas-page-eyebrow">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                أفكار المشاريع المعتمدة
              </div>
              <h1 className="db-page-title">بنك الأفكار</h1>
              <p className="db-page-sub">استكشف أفكار اللجنة العلمية وقارن الفرق المتاحة قبل اختيار مسارك.</p>
            </div>
            <button className="btn btn-primary ideas-submit-btn" onClick={() => setShowModal(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              طرح فكرة جديدة
            </button>
          </div>

          {/* Error */}
          {error && <Alert variant="error">{error}</Alert>}

          {/* Filters */}
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
                <input className="ideas-search-input"
                  placeholder="ابحث باسم الفكرة أو التقنية أو الكلمات المفتاحية"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSearch() }}
                />
              </div>
            </div>
            <Dropdown label="المشرف" options={supervisors}
              value={supervisor} onChange={handleSupChange} />
            <button className="btn btn-primary ideas-search-btn" onClick={handleSearch}>
              بحث
            </button>
          </div>

          {/* Tabs + count */}
          <div className="ideas-results-head">
            <span className="ideas-results-count">
              {loading ? 'جارٍ التحميل...' : `عرض ${paginated.length} من ${filtered.length} فكرة`}
            </span>
            <div className="ideas-tabs">
              {fieldTabs.map(tab => (
                <button key={tab}
                  className={`idea-tab${activeTab === tab ? ' idea-tab-active' : ''}`}
                  onClick={() => handleTabChange(tab)}>
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          {!loading && paginated.length === 0 ? (
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="ideas-pagination">
              <button className="ideas-page-btn" disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}>
                الصفحة التالية →
              </button>
              <span className="ideas-page-info">الصفحة {page} من {totalPages}</span>
              <button className="ideas-page-btn" disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}>
                ← الصفحة السابقة
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
