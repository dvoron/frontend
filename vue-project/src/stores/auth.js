import { defineStore } from 'pinia'

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
                const base64Url = state.accessToken.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                return JSON.parse(jsonPayload).sub;
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
