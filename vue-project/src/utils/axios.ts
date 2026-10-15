import axios from 'axios';
import logger from '@/utils/logger';
import { useAuthStore } from '@/stores/auth';

const apiClient = axios.create({
    // baseURL: import.meta.env.VITE_API_BASE_URL || '',
    timeout: 5000, // 5 seconds timeout to prevent indefinite hanging
});

apiClient.interceptors.request.use(
    (config) => {
        logger.debug(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        logger.error('API Request Error:', error);
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => {
        logger.debug(`API Response: ${response.status} ${response.config.url}`);
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response) {
            logger.warn(`API Response Error: ${error.response.status} ${error.config.url}`, error.response.data);
            
            if (error.response.status === 401 && !originalRequest._retry && originalRequest.url !== '/api/auth/refresh') {
                originalRequest._retry = true;
                
                try {
                    const auth = useAuthStore();
                    const refreshed = await auth.tryRefresh();
                    
                    if (refreshed) {
                        if (originalRequest.headers) {
                            if (typeof originalRequest.headers.set === 'function') {
                                originalRequest.headers.set('Authorization', `Bearer ${auth.accessToken}`);
                            } else {
                                originalRequest.headers.Authorization = `Bearer ${auth.accessToken}`;
                            }
                        }
                        return apiClient(originalRequest);
                    } else {
                        auth.clearTokens();
                        const { default: router } = await import('@/main');
                        router.push({ name: 'login' });
                    }
                } catch (refreshError) {
                    const auth = useAuthStore();
                    auth.clearTokens();
                    const { default: router } = await import('@/main');
                    router.push({ name: 'login' });
                }
            }
        } else if (error.request) {
            logger.error('API No Response:', error.request);
        } else {
            logger.error('API Setup Error:', error.message);
        }
        return Promise.reject(error);
    }
);

export default apiClient;
