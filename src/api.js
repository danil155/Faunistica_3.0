import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_URL = 'http://localhost:5001';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

const apiService = {
    // Аутентификация
    login: async (username, password) => {
        const response = await api.post('/api/get_user', { username, password });
        return response.data;
    },

    // Выход из системы
    logout: async () => {
        const response = await api.post('/api/logout');
        return response.data;
    },

    checkAuth: async () => {
        try {
            await api.post('/api/check_auth');
            return true;
        } catch {
            return false;
        }
    },


    // Получение информации из текста
    getInfoFromText: async (text) => {
        const response = await api.post('/api/get_info', { text });
        return response.data;
    },

    // Добавление записи
    insertRecord: async (recordData) => {
        const response = await api.post('/api/insert_record', recordData);
        return response.data;
    },

    // Получение статистики
    getGeneralStats: async () => {
        const response = await api.get('/api/get_gen_stats');
        return response.data;
    },

    // Обновление токена
    refreshToken: async () => {
        const response = await api.post('/api/refresh_token');
        return response.data;
    }
};

api.interceptors.request.use(async (config) => {

    return config;
});

api.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Пытаемся обновить токен
                await apiService.refreshToken();
                return api(originalRequest);
            } catch (refreshError) {
                // Если refresh не удался - разлогиниваем
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export { api, apiService };
