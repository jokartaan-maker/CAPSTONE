// أنواع البيانات المشتركة مع الـ backend (Laravel API)

export interface Student {
  id: number
  name: string
  email: string
  phone: string | null
  university_number: string
  major: string
  study_year: number
  skills: string[]
}

export interface StudentProfile extends Student {
  member_since: string | null
}

export interface RegisterOptions {
  majors: string[]
  study_years: number[]
  max_skills: number
}

export interface AuthResponse {
  message: string
  token: string
  expires_at: string
  student: Student
}

export interface MeResponse {
  student: Student
}

export interface ProfileResponse {
  student: StudentProfile
}

export interface MessageResponse {
  message: string
}

// شكل خطأ التحقق القادم من Laravel:
// { message, errors: { field: string[] } }
export interface ApiErrorResponse {
  message: string
  errors?: Record<string, string[]>
}

// ===== Payloads =====

export interface RegisterPayload {
  name: string
  email: string
  password: string
  password_confirmation: string
  university_number: string
  major: string
  study_year: number
  skills?: string[]
  terms: boolean
}

export interface LoginPayload {
  email: string
  password: string
  remember?: boolean
}

export interface ForgotPasswordPayload {
  email: string
}

export interface VerifyOtpPayload {
  email: string
  otp: string
}

export interface VerifyOtpResponse {
  message: string
  reset_token: string
  email: string
}

export interface ResetPasswordPayload {
  token: string
  email: string
  password: string
  password_confirmation: string
}

export interface UpdateProfilePayload {
  name?: string
  phone?: string | null
  study_year?: number
  skills?: string[]
}

export interface ChangePasswordPayload {
  current_password: string
  password: string
  password_confirmation: string
}

// ===== Project / Team (future endpoints) =====

/** حالة مشروع التخرج */
export type ProjectStatus =
  | 'pending_approval'   // قيد المراجعة
  | 'approved'           // معتمد
  | 'in_progress'        // قيد التنفيذ
  | 'under_review'       // تحت المراجعة
  | 'completed'          // مكتمل
  | 'rejected'           // مرفوض

/** مشروع التخرج المرتبط بالطالب */
export interface StudentProject {
  id: number
  name: string
  status: ProjectStatus
  progress: number          // 0-100
  team_name: string | null
  supervisor_name: string | null
  major: string | null
  semester: string | null
  tasks_total: number
  tasks_completed: number
  reports_submitted: number
  open_notes: number
  team_members: TeamMember[]
}

export interface TeamMember {
  id: number
  name: string
  role: string   // e.g. 'قائد الفريق' | 'عضو'
}

/** الاستجابة من endpoint المشروع الحالي */
export interface StudentProjectResponse {
  project: StudentProject | null
}

// ===== Ideas Bank =====

export type IdeaStatus = 'approved' | 'pending' | 'rejected'

export type TeamStatus = 'open' | 'full' | 'your_team'

export interface IdeaTeam {
  id: number
  name: string
  status: TeamStatus
  members: number
  capacity: number
}

/** مطابق لـ IdeaResource في الـ Backend */
export interface Idea {
  id:                number
  code:              string        // e.g. IDEA-001
  title:             string
  field:             string        // e.g. هندسة البرمجيات
  status:            IdeaStatus
  supervisor:        string | null // اسم المشرف
  supervisor_email:  string | null
  supervisor_title:  string | null // اللقب العلمي والتخصص
  tags:              string[]
  teams:             IdeaTeam[]    // يُملأ لاحقاً مع ميزة الفرق
  description:       string
  problem:           string | null
  features:          string[]
  requirements:      string[]
  tech_stack:        string[]
  approved_at:       string | null // YYYY-MM-DD
  approved_by:       string | null // 'اللجنة العلمية'
  academic_term:     string | null // اسم الفصل الدراسي
}

/** فلاتر GET /student/ideas */
export interface IdeaFilters {
  search?:        string
  field?:         string
  supervisor_id?: number
}

/** استجابة GET /student/ideas */
export interface IdeasResponse {
  ideas: Idea[]
  total: number
}

/** استجابة GET /student/ideas/{id} */
export interface IdeaDetailResponse {
  idea: Idea
}
