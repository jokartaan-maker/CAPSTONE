import { request } from './client'
import type {
  IdeasResponse,
  IdeaDetailResponse,
  IdeaFilters,
} from '../types/api'

export const ideasApi = {
  /**
   * GET /student/ideas?search=&field=&supervisor_id=
   * الأفكار المعتمدة في الفصل الحالي مع بحث وتصفية
   */
  index: (filters: IdeaFilters = {}) => {
    const params = new URLSearchParams()
    if (filters.search)       params.set('search',       filters.search)
    if (filters.field)        params.set('field',        filters.field)
    if (filters.supervisor_id) params.set('supervisor_id', String(filters.supervisor_id))

    const qs = params.toString()
    return request<IdeasResponse>(`/student/ideas${qs ? `?${qs}` : ''}`)
  },

  /**
   * GET /student/ideas/{id}
   * تفاصيل فكرة معتمدة في الفصل الحالي
   */
  show: (id: number) =>
    request<IdeaDetailResponse>(`/student/ideas/${id}`),
}
