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
    let parsedData = error.config.data
    if (typeof error.config.data === 'string') {
      try {
        parsedData = JSON.parse(error.config.data)
      } catch (e) {
        // Ignore parse errors, keep as string
      }
    }

    sanitizedError.config = {
      url: error.config.url,
      method: error.config.method,
      headers: sanitizeLogData(error.config.headers),
      data: error.config.data ? sanitizeLogData(parsedData) : undefined
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
            router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } })
          }
        } catch (refreshError) {
          const auth = useAuthStore()
          auth.clearTokens()
          router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } })
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
    if (axios.isAxiosError(error)) {
      if (error.response) {
        return {
          ok: false,
          status: error.response.status,
          data: error.response.data
        }
      }
      
      // Handle timeout specifically
      if (error.code === 'ECONNABORTED') {
        logger.error('API Request Timeout', sanitizeAxiosError(error))
        return {
          ok: false,
          status: 504,
          data: { message: 'Request timed out' } as any
        }
      }
    }
    
    // Log any other errors (network errors, interceptor errors, etc.)
    logger.error('API Request Failed', error instanceof Error ? error.message : String(error))
    
    return {
      ok: false,
      status: 503,
      data: { message: 'Network error occurred' } as any
    }
  }
}

export default apiClient
