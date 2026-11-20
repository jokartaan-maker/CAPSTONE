import { request } from './client'
import type {
  AuthResponse,
  MeResponse,
  MessageResponse,
  LoginPayload,
  RegisterPayload,
  ForgotPasswordPayload,
  VerifyOtpPayload,
  VerifyOtpResponse,
  ResetPasswordPayload,
  RegisterOptions,
} from '../types/api'

export const authApi = {
  /** GET /student/register-options */
  registerOptions: () => request<RegisterOptions>('/student/register-options'),

  /** POST /student/register */
  register: (payload: RegisterPayload) =>
    request<AuthResponse>('/student/register', { method: 'POST', body: payload }),

  /** POST /student/login */
  login: (payload: LoginPayload) =>
    request<AuthResponse>('/student/login', { method: 'POST', body: payload }),

  /** GET /student/me (يتطلب token) */
  me: () => request<MeResponse>('/student/me'),

  /** POST /student/logout (يتطلب token) */
  logout: () => request<MessageResponse>('/student/logout', { method: 'POST' }),

  /** POST /student/forgot-password */
  forgotPassword: (payload: ForgotPasswordPayload) =>
    request<MessageResponse>('/student/forgot-password', { method: 'POST', body: payload }),

  /** POST /student/verify-otp */
  verifyOtp: (payload: VerifyOtpPayload) =>
    request<VerifyOtpResponse>('/student/verify-otp', { method: 'POST', body: payload }),

  /** POST /student/reset-password */
  resetPassword: (payload: ResetPasswordPayload) =>
    request<MessageResponse>('/student/reset-password', { method: 'POST', body: payload }),
}
