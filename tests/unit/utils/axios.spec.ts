import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import axios from 'axios'
import apiClient, { sanitizeAxiosError, setAuthFailCallback, request } from '@/utils/axios'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import logger from '@/utils/logger'

vi.mock('@/utils/logger', () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}))

let mockRefreshCalls = 0
vi.mock('@/services/UserService', () => ({
  refresh: vi.fn(async () => {
    mockRefreshCalls++
    await new Promise((r) => setTimeout(r, 20))
    return { data: { accessToken: 'new-token' }, status: 200 }
  })
}))

describe('axios util', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    setAuthFailCallback(() => {})
    mockRefreshCalls = 0
  })

  afterEach(() => {
    setAuthFailCallback(() => {})
  })

  describe('log redaction and sanitization', () => {
    it('redacts sensitive fields in response data', () => {
      const error = new axios.AxiosError('Network Error')
      error.response = {
        status: 400,
        statusText: 'Bad Request',
        headers: {},
        data: {
          username: 'test',
          password: 'mysecretpassword',
          nested: {
            token: '12345'
          }
        },
        config: {} as any
      }

      const sanitized = sanitizeAxiosError(error)
      expect(sanitized.response.data.password).toBe('[REDACTED]')
      expect(sanitized.response.data.nested.token).toBe('[REDACTED]')
      expect(sanitized.response.data.username).toBe('test')
    })

    it('redacts sensitive fields in request config headers', () => {
      const error = new axios.AxiosError('Auth Error')
      error.config = {
        url: '/api/test',
        method: 'post',
        headers: new axios.AxiosHeaders({
          Authorization: 'Bearer secret-token'
        })
      } as any

      const sanitized = sanitizeAxiosError(error)
      expect(sanitized.config.headers.Authorization).toBe('[REDACTED]')
    })

    it('handles JSON string data in config', () => {
      const error = new axios.AxiosError('JSON Error')
      error.config = {
        url: '/api/login',
        method: 'post',
        data: JSON.stringify({ username: 'user', password: 'password123' })
      } as any

      const sanitized = sanitizeAxiosError(error)
      expect(sanitized.config.data.password).toBe('[REDACTED]')
    })

    it('handles non-JSON string data gracefully', () => {
      const error = new axios.AxiosError('String Error')
      error.config = {
        url: '/api/upload',
        method: 'post',
        data: 'Just a plain string body'
      } as any

      const sanitized = sanitizeAxiosError(error)
      expect(sanitized.config.data).toBe('Just a plain string body')
    })
  })

  describe('interceptors', () => {
    it('does not add Authorization header if url starts with /api/auth/refresh', async () => {
      const auth = useAuthStore()
      auth.setTokens('valid-token')

      const response = await apiClient.get('/api/auth/refresh', {
        adapter: async (config) => {
          return { data: 'ok', status: 200, statusText: 'OK', headers: {}, config }
        }
      })
      expect(response.config.headers?.Authorization).toBeUndefined()
    })

    it('adds Authorization header to normal requests', async () => {
      const auth = useAuthStore()
      auth.setTokens('valid-token')

      const response = await apiClient.get('/api/test', {
        adapter: async (config) => {
          return { data: 'ok', status: 200, statusText: 'OK', headers: {}, config }
        }
      })
      expect(response.config.headers?.Authorization).toBe('Bearer valid-token')
    })
  })

  describe('refresh-and-retry logic', () => {
    it('shouldSkipRefresh skips refresh for /api/auth/ endpoints', async () => {
      const auth = useAuthStore()
      auth.setTokens('old-token')
      const refreshSpy = vi.spyOn(auth, 'tryRefresh')

      try {
        await apiClient.get('/api/auth/login', {
          adapter: async () => {
            throw new axios.AxiosError('Unauthorized', '401', undefined, undefined, {
              status: 401,
              data: {},
              statusText: 'Unauthorized',
              headers: {},
              config: {} as any
            })
          }
        })
      } catch (e) {
        //
      }

      expect(refreshSpy).not.toHaveBeenCalled()
    })

    it('retries original request on 401 after successful refresh', async () => {
      const auth = useAuthStore()
      auth.setTokens('expired-token')

      let attempt = 0

      const response = await apiClient.get('/api/test', {
        adapter: async (config) => {
          attempt++
          if (attempt === 1) {
            const error = new axios.AxiosError('Unauthorized', '401', config)
            error.response = {
              status: 401,
              data: {},
              statusText: 'Unauthorized',
              headers: {},
              config
            }
            throw error
          }
          return { data: 'success', status: 200, statusText: 'OK', headers: {}, config }
        }
      })

      expect(mockRefreshCalls).toBe(1)
      expect(response.data).toBe('success')
      // Original config will have the new token
      expect(response.config.headers?.Authorization).toBe('Bearer new-token')
    })

    it('clears token and calls authFailCallback on failed refresh', async () => {
      const auth = useAuthStore()
      auth.setTokens('expired-token')

      // Override the mock for just this test
      const { refresh } = await import('@/services/UserService')
      vi.mocked(refresh).mockResolvedValueOnce({ data: {}, status: 401 } as any)

      const callbackSpy = vi.fn()
      setAuthFailCallback(callbackSpy)

      let thrown = false
      try {
        await apiClient.get('/api/test', {
          adapter: async (config) => {
            const error = new axios.AxiosError('Unauthorized', '401', config)
            error.response = {
              status: 401,
              data: {},
              statusText: 'Unauthorized',
              headers: {},
              config
            }
            throw error
          }
        })
      } catch (e) {
        thrown = true
      }

      expect(thrown).toBe(true)
      expect(auth.accessToken).toBeNull()
      expect(callbackSpy).toHaveBeenCalled()
    })

    it('deduplicates concurrent 401 requests via the auth store', async () => {
      const auth = useAuthStore()
      auth.setTokens('expired-token')

      const makeRequest = () =>
        apiClient.get('/api/test', {
          adapter: async (config) => {
            // If using the old token, return 401
            if (config.headers?.Authorization === 'Bearer expired-token') {
              const error = new axios.AxiosError('Unauthorized', '401', config)
              error.response = {
                status: 401,
                data: {},
                statusText: 'Unauthorized',
                headers: {},
                config
              }
              throw error
            }
            return { data: 'success', status: 200, statusText: 'OK', headers: {}, config }
          }
        })

      // Fire two requests concurrently
      const results = await Promise.allSettled([makeRequest(), makeRequest()])

      expect(results[0].status).toBe('fulfilled')
      expect(results[1].status).toBe('fulfilled')
      // Service refresh should only be called once due to deduplication in auth store
      expect(mockRefreshCalls).toBe(1)
    })
  })
})
