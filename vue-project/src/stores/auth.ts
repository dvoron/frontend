import { defineStore } from 'pinia'
import { jwtDecode } from 'jwt-decode'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        accessToken: null as string | null,
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
        setTokens(accessToken: string | null) {
            this.accessToken = accessToken
        },
        clearTokens() {
            this.accessToken = null
        },
        async tryRefresh() {
            const { refresh } = await import('@/services/UserService');
            const [data, status] = await refresh();
            if (status === 200 && data.accessToken) {
                this.setTokens(data.accessToken);
                return true;
            }
            return false;
        }
    },
})
