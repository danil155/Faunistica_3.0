import axios from 'axios';

const API_URL = 'http://localhost:5001';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

let refreshTokenPromise = null;

const apiService = {
    // Аутентификация
    login: async (username, password) => {
        console.log('login');
        try {
            const response = await api.post('/api/get_user', { username, password });
            console.log('response');
            return response.data;
        } catch (error) {
            // Обрабатываем ошибку
            if (error.response?.status === 401) {
                throw new Error('Неверный пароль');
            } else if (error.response?.status === 404) {
                throw new Error('Пользователь не найден');
            } else if (error.response?.status === 429) {
                throw new Error('Количество попыток превышено')
            }
            throw error;
        }
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
        try {
            if (!refreshTokenPromise) {
                refreshTokenPromise = api.post('/api/refresh_token')
                    .finally(() => {
                        refreshTokenPromise = null;
                    });
            }
            return await refreshTokenPromise;
        } catch (error) {
            throw error;
        }
    },

    suggestTaxon: async (filters) => {
        if (!filters || filters.text.length < 2) {
            return [];
        }
        try {
            const response = await api.post('/api/suggest_taxon', filters);
            return response.data;
        } catch (error) {
            console.error(error);
            return [];
        }
    },

    getPublication: async () => {
        try {
            const response = await api.get('/api/get_publ');
            return response.data;
        } catch (error) {
            if (error.response?.status === 403) {
                throw new Error('lalallalala');
            }
        }
    }
};

api.interceptors.request.use((config) => {
    return config;
}, (error) => {
    return Promise.reject(error);
});

api.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        if (error.response?.status === 403 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                await apiService.refreshToken();
                return api(originalRequest);
            } catch (refreshError) {
                console.error('Refresh token failed:', refreshError);
                throw refreshError;
            }
        }

        return Promise.reject(error);
    }
);

export { api, apiService };
