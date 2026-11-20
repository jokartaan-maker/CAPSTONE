import type { ApiErrorResponse } from '../types/api'

// عنوان الـ API. الافتراضي "/api" يعمل مع Vite proxy أثناء التطوير.
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

/** خطأ منظّم يحمل رسالة الخادم ورمز الحالة وأخطاء الحقول. */
export class ApiError extends Error {
  status: number
  errors?: Record<string, string[]>
  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

/** يحوّل خريطة أخطاء Laravel (كل حقل = مصفوفة رسائل) إلى رسالة واحدة لكل حقل. */
export function toFieldErrors(
  errors?: Record<string, string[]>,
): Record<string, string> {
  if (!errors) return {}
  const map: Record<string, string> = {}
  for (const [key, messages] of Object.entries(errors)) {
    map[key] = messages[0]
  }
  return map
}

// الـ token يُحفظ في الذاكرة فقط (localStorage منفصل في AuthContext).
let authToken: string | null = null

export function setAuthToken(token: string | null): void {
  authToken = token
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: unknown
  /** إرسال Authorization إذا وُجد token (الافتراضي true). */
  auth?: boolean
}

/** دالة fetch عامة تضيف JSON headers + الـ Bearer token وتحوّل الأخطاء إلى ApiError. */
export async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true } = opts

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }
  if (auth && authToken) {
    headers.Authorization = `Bearer ${authToken}`
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const text = await res.text()
  let data: unknown = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = null
    }
  }

  if (!res.ok) {
    const err = (data ?? {}) as ApiErrorResponse
    throw new ApiError(
      err.message ?? `حدث خطأ غير متوقع (${res.status})`,
      res.status,
      err.errors,
    )
  }

  return data as T
}
