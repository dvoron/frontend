import { defineStore } from 'pinia'
import { jwtDecode } from 'jwt-decode'
import { refresh } from '@/services/UserService'

let refreshPromise: Promise<boolean> | null = null

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
        return decoded.sub ? Number(decoded.sub) : null
      } catch (e) {
        return null
      }
    },
    username: (state) => {
      if (!state.accessToken) return null
      try {
        return jwtDecode<{ sub?: string | number; username?: string }>(state.accessToken).username
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
    },
    async tryRefresh() {
      if (refreshPromise) {
        return refreshPromise
      }

      refreshPromise = (async () => {
        try {
          const { data, status } = await refresh()
          if (status === 200 && data.accessToken) {
            this.setTokens(data.accessToken)
            return true
          }
          this.clearTokens()
          return false
        } finally {
          refreshPromise = null
        }
      })()

      return refreshPromise
    }
  }
})
