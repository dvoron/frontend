import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('initializes with null tokens if localStorage is empty', () => {
    const store = useAuthStore()
    expect(store.accessToken).toBeNull()
    expect(store.isLoggedIn).toBe(false)
  })

  it('setTokens sets token in state', () => {
    const store = useAuthStore()
    store.setTokens('token123')
    expect(store.accessToken).toBe('token123')
    expect(localStorage.getItem('accessToken')).toBeNull()
    expect(store.isLoggedIn).toBe(true)
  })

  it('clearTokens removes tokens from state', () => {
    const store = useAuthStore()
    store.setTokens('token123')
    store.clearTokens()
    expect(store.accessToken).toBeNull()
    expect(localStorage.getItem('accessToken')).toBeNull()
    expect(store.isLoggedIn).toBe(false)
  })

  describe('getters with JWT', () => {
    // Helper to create a fake JWT token
    const createToken = (payload) => {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
      const body = btoa(JSON.stringify(payload))
      const signature = 'signature'
      return `${header}.${body}.${signature}`
    }

    it('userId returns sub from token', () => {
      const store = useAuthStore()
      store.accessToken = createToken({ sub: 123 })
      expect(store.userId).toBe(123)
    })

    it('userId returns null if token is invalid', () => {
      const store = useAuthStore()
      store.accessToken = 'invalid.token.here'
      expect(store.userId).toBeNull()
    })

    it('username returns username from token', () => {
      const store = useAuthStore()
      store.accessToken = createToken({ username: 'testuser' })
      expect(store.username).toBe('testuser')
    })

    it('username returns null if token is invalid', () => {
      const store = useAuthStore()
      store.accessToken = 'invalid.token.here'
      expect(store.username).toBeNull()
    })

    it('userId returns null if accessToken is null', () => {
      const store = useAuthStore()
      store.accessToken = null
      expect(store.userId).toBeNull()
    })

    it('username returns null if accessToken is null', () => {
      const store = useAuthStore()
      store.accessToken = null
      expect(store.username).toBeNull()
    })
  })
})
