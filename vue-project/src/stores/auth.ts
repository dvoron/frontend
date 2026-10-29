import { defineStore } from 'pinia'
import { jwtDecode } from 'jwt-decode'
import { refresh } from '@/services/UserService'

let refreshPromise: Promise<boolean> | null = null
let currentSessionId = 0

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: null as string | null
  }),

  getters: {
    isLoggedIn: (state) => !!state.accessToken,
    userId: (state) => {
      if (!state.accessToken) return null
      try {
        const decoded = jwtDecode<{ sub?: string | number; username?: string }>(state.accessToken)
        const sub = decoded.sub
        if (typeof sub === 'string' && isNaN(Number(sub))) return null
        return sub ? Number(sub) : null
      } catch (e) {
        return null
      }
    },
    username: (state) => {
      if (!state.accessToken) return null
      try {
        const decoded = jwtDecode<{ sub?: string | number; username?: string }>(state.accessToken)
        return decoded.username || null
      } catch (e) {
        return null
      }
    }
  },

  actions: {
    setTokens(accessToken: string | null) {
      this.accessToken = accessToken
    },
    clearTokens() {
      this.accessToken = null
      refreshPromise = null
      currentSessionId++
    },
    async tryRefresh() {
      if (refreshPromise) {
        return refreshPromise
      }

      const sessionId = currentSessionId

      refreshPromise = (async () => {
        try {
          const { data, status } = await refresh()
          if (sessionId !== currentSessionId) {
            return false
          }
          if (status === 200 && data.accessToken) {
            this.setTokens(data.accessToken)
            return true
          }
          this.clearTokens()
          return false
        } finally {
          if (sessionId === currentSessionId) {
            refreshPromise = null
          }
        }
      })()

      return refreshPromise
    }
  }
})
