import axios from 'axios';
import logger from '@/utils/logger';

const apiClient = axios.create({
    // baseURL: import.meta.env.VITE_API_BASE_URL || '',
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
    (error) => {
        if (error.response) {
            logger.warn(`API Response Error: ${error.response.status} ${error.config.url}`, error.response.data);
        } else if (error.request) {
            logger.error('API No Response:', error.request);
        } else {
            logger.error('API Setup Error:', error.message);
        }
        return Promise.reject(error);
    }
);

export default apiClient;
