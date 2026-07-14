import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        accessToken: localStorage.getItem('accessToken') || null,
        refreshToken: localStorage.getItem('refreshToken') || null,
    }),

    getters: {
        isLoggedIn: (state) => !!state.accessToken,
    },

    actions: {
        setTokens(accessToken, refreshToken) {
            this.accessToken = accessToken
            this.refreshToken = refreshToken
            localStorage.setItem('accessToken', accessToken)
            localStorage.setItem('refreshToken', refreshToken)
        },
        clearTokens() {
            this.accessToken = null
            this.refreshToken = null
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
        },
    },
})
