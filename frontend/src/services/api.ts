import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const tokens = useAuthStore.getState().tokens
  if (tokens?.access) {
    config.headers.Authorization = `Bearer ${tokens.access}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const tokens = useAuthStore.getState().tokens
      if (tokens?.refresh) {
        try {
          const response = await axios.post(`${API_URL}/api/auth/refresh/`, {
            refresh: tokens.refresh,
          })
          const newTokens = response.data
          useAuthStore.getState().setTokens(newTokens)
          originalRequest.headers.Authorization = `Bearer ${newTokens.access}`
          return api(originalRequest)
        } catch {
          useAuthStore.getState().logout()
        }
      }
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  login: (username: string, password: string) =>
    api.post('/auth/login/', { username, password }),
  register: (data: {
    username: string
    email: string
    password: string
    password_confirm: string
    first_name: string
    last_name: string
    role: string
  }) => api.post('/auth/register/', data),
  me: () => api.get('/auth/me/'),
}

export const usersApi = {
  list: (params?: { role?: string; subjects?: number }) =>
    api.get('/users/', { params }),
  tutors: () => api.get('/users/tutors/'),
  get: (id: number) => api.get(`/users/${id}/`),
}

export const subjectsApi = {
  list: () => api.get('/auth/subjects/'),
}

export const materialsApi = {
  list: (params?: { subject?: number; search?: string }) =>
    api.get('/materials/', { params }),
  get: (id: number) => api.get(`/materials/${id}/`),
  create: (data: FormData) =>
    api.post('/materials/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id: number) => api.delete(`/materials/${id}/`),
}

export const sessionsApi = {
  list: (params?: { subject?: number; tutor?: number; status?: string }) =>
    api.get('/sessions/', { params }),
  upcoming: (params?: { subject?: number; tutor?: number }) =>
    api.get('/sessions/upcoming/', { params }),
  completed: (params?: { subject?: number; tutor?: number }) =>
    api.get('/sessions/completed/', { params }),
  my: () => api.get('/sessions/my/'),
  get: (id: number) => api.get(`/sessions/${id}/`),
  create: (data: {
    tutor?: number
    student?: number
    subject: number
    title: string
    date: string
    time: string
    duration?: number
  }) => api.post('/sessions/', data),
  update: (id: number, data: Partial<{ status: string; notes: string }>) =>
    api.patch(`/sessions/${id}/`, data),
  confirm: (id: number) => api.post(`/sessions/${id}/confirm/`),
  cancel: (id: number, reason?: string) =>
    api.post(`/sessions/${id}/cancel/`, { reason }),
  reviews: {
    list: () => api.get('/sessions/reviews/'),
    create: (data: { session: number; rating: number; comment?: string }) =>
      api.post('/sessions/reviews/', data),
    update: (id: number, data: { rating: number; comment?: string }) =>
      api.patch(`/sessions/reviews/${id}/`, data),
  },
}

export const forumApi = {
  list: (params?: { subject?: number; search?: string }) =>
    api.get('/discussions/', { params }),
  get: (id: number) => api.get(`/discussions/${id}/`),
  create: (data: { title: string; content: string; subject?: number }) =>
    api.post('/discussions/', data),
  addReply: (discussionId: number, data: { content: string; parent?: number }) =>
    api.post(`/discussions/${discussionId}/replies/`, data),
}

export const supportApi = {
  create: (data: { name: string; email: string; subject: string; message: string }) =>
    api.post('/support/', data),
}
