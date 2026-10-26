import axios from 'axios'
import logger from '@/utils/logger'
import router from '@/router'
import { useAuthStore } from '@/stores/auth'

const apiClient = axios.create({
  // baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 5000 // 5 seconds timeout to prevent indefinite hanging
})


const sanitizeLogData = (data: any): any => {
  if (!data) return data
  if (typeof data !== 'object') return data

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeLogData(item))
  }

  const sanitized = { ...data }
  const sensitiveKeys = ['password', 'token', 'secret', 'authorization', 'credentials']

  for (const key of Object.keys(sanitized)) {
    const lowerKey = key.toLowerCase()
    if (sensitiveKeys.some((k) => lowerKey.includes(k))) {
      sanitized[key] = '[REDACTED]'
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeLogData(sanitized[key])
    }
  }
  return sanitized
}

export const sanitizeAxiosError = (error: any): any => {
  if (!axios.isAxiosError(error)) return error

  const sanitizedError: any = {
    message: error.message,
    name: error.name,
    code: error.code,
    status: error.response?.status
  }

  if (error.config) {
    sanitizedError.config = {
      url: error.config.url,
      method: error.config.method,
      headers: sanitizeLogData(error.config.headers),
      data: error.config.data ? sanitizeLogData(typeof error.config.data === 'string' ? JSON.parse(error.config.data) : error.config.data) : undefined
    }
  }

  if (error.response) {
    sanitizedError.response = {
      status: error.response.status,
      statusText: error.response.statusText,
      data: sanitizeLogData(error.response.data),
      headers: sanitizeLogData(error.response.headers)
    }
  }

  return sanitizedError
}

apiClient.interceptors.request.use(
  (config) => {
    logger.debug(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
    const auth = useAuthStore()
    if (auth.accessToken && !config.headers?.Authorization && config.url !== '/api/auth/refresh') {
      if (config.headers) {
        if (typeof config.headers.set === 'function') {
          config.headers.set('Authorization', `Bearer ${auth.accessToken}`)
        } else {
          config.headers.Authorization = `Bearer ${auth.accessToken}`
        }
      }
    }
    return config
  },
  (error) => {
    logger.error('API Request Error:', sanitizeAxiosError(error))
    return Promise.reject(error)
  }
)


const shouldSkipRefresh = (config: import('axios').InternalAxiosRequestConfig) => {
  const url = config.url || ''
  if (url.startsWith('/api/auth/')) return true

  if (url.match(/^\/api\/users\/\d+$/)) {
    const method = config.method?.toLowerCase()
    if (method === 'put' || method === 'delete') {
      if (config.data) {
        try {
          const data = typeof config.data === 'string' ? JSON.parse(config.data) : config.data
          if (data && (data.oldPassword || data.password)) {
            return true
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
  }

  return false
}

apiClient.interceptors.response.use(
  (response) => {
    logger.debug(`API Response: ${response.status} ${response.config.url}`)
    return response
  },
  async (error) => {
    const originalRequest = error.config

    if (error.response) {
      logger.warn(
        `API Response Error: ${error.response.status} ${error.config.url}`,
        sanitizeLogData(error.response.data)
      )

      if (
        error.response.status === 401 &&
        !originalRequest._retry &&
        !shouldSkipRefresh(originalRequest)
      ) {
        originalRequest._retry = true

        try {
          const auth = useAuthStore()
          const refreshed = await auth.tryRefresh()

          if (refreshed) {
            if (originalRequest.headers) {
              if (typeof originalRequest.headers.set === 'function') {
                originalRequest.headers.set('Authorization', `Bearer ${auth.accessToken}`)
              } else {
                originalRequest.headers.Authorization = `Bearer ${auth.accessToken}`
              }
            }
            return apiClient(originalRequest)
          } else {
            auth.clearTokens()
            router.push({ name: 'login' })
          }
        } catch (refreshError) {
          const auth = useAuthStore()
          auth.clearTokens()
          router.push({ name: 'login' })
        }
      }
    } else if (error.request) {
      logger.error('API No Response:', sanitizeAxiosError(error))
    } else {
      logger.error('API Setup Error:', sanitizeAxiosError(error))
    }
    return Promise.reject(error)
  }
)

export interface ApiResponse<T = any> {
  ok: boolean
  status: number
  data: T
}

export async function request<T = any>(
  config: import('axios').AxiosRequestConfig
): Promise<ApiResponse<T>> {
  try {
    const response = await apiClient(config)
    return {
      ok: true,
      status: response.status,
      data: response.data
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        ok: false,
        status: error.response.status,
        data: error.response.data
      }
    }
    return {
      ok: false,
      status: 503,
      data: { message: 'Network error occurred' } as any
    }
  }
}

export default apiClient
