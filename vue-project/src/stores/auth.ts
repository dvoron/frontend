import { defineStore } from 'pinia'
import { jwtDecode } from 'jwt-decode'
import { refresh } from '@/services/UserService'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        accessToken: null as string | null,
    }),

    getters: {
        isLoggedIn: (state) => !!state.accessToken,
        userId: (state) => {
            if (!state.accessToken) return null;
            try {
                const decoded = jwtDecode<{ sub?: string | number, username?: string }>(state.accessToken);
                return decoded.sub ? Number(decoded.sub) : null;
            } catch (e) {
                return null;
            }
        },
        username: (state) => {
            if (!state.accessToken) return null;
            try {
                return jwtDecode<{ sub?: string | number, username?: string }>(state.accessToken).username;
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
            const [data, status] = await refresh();
            if (status === 200 && data.accessToken) {
                this.setTokens(data.accessToken);
                return true;
            }
            return false;
        }
    },
})
