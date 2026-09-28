import { defineStore } from 'pinia'
import { jwtDecode } from 'jwt-decode'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        accessToken: localStorage.getItem('accessToken') || null,
        refreshToken: localStorage.getItem('refreshToken') || null,
    }),

    getters: {
        isLoggedIn: (state) => !!state.accessToken,
        userId: (state) => {
            if (!state.accessToken) return null;
            try {
                return jwtDecode(state.accessToken).sub;
            } catch (e) {
                return null;
            }
        },
        username: (state) => {
            if (!state.accessToken) return null;
            try {
                return jwtDecode(state.accessToken).username;
            } catch (e) {
                return null;
            }
        }
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
