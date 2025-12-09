// src/renderer/src/lib/api.ts
import { useAuthStore } from '@/stores/authStore'
import { router } from '@/routes'

// const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function api<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T | null> {
  const { token, logout } = useAuthStore.getState()

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
      ...options.headers,
    },
  })

  // Auto logout on 401
  if (res.status === 401) {
    logout()
    router.navigate({ to: '/login' })
    throw new ApiError('Unauthorized', 401)
  }

  if (!res.ok) {
    const error = await res.text()
    throw new ApiError(error || res.statusText, res.status)
  }

  // Return JSON or nothing
  const text = await res.text()
  return text ? JSON.parse(text) : null
}

// Helper methods
export const apiGet = (url: string) => api(url, { method: 'GET' })
export const apiPost = (url: string, body?: null | object) =>
  api(url, { method: 'POST', body: body ? JSON.stringify(body) : undefined })
export const apiPut = (url: string, body?: null | object) =>
  api(url, { method: 'PUT', body: body ? JSON.stringify(body) : undefined })
export const apiDelete = (url: string) => api(url, { method: 'DELETE' })
