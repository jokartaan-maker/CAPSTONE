import { request } from './client'
import type {
  ProfileResponse,
  MessageResponse,
  UpdateProfilePayload,
  ChangePasswordPayload,
} from '../types/api'

export const profileApi = {
  /** GET /student/profile */
  show: () => request<ProfileResponse>('/student/profile'),

  /** PATCH /student/profile */
  update: (payload: UpdateProfilePayload) =>
    request<ProfileResponse>('/student/profile', { method: 'PATCH', body: payload }),

  /** PUT /student/profile/password */
  changePassword: (payload: ChangePasswordPayload) =>
    request<MessageResponse>('/student/profile/password', { method: 'PUT', body: payload }),
}
