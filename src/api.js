import axios from 'axios';

const api = axios.create({
    withCredentials: true
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
        try {
            const response = await api.get('/api/get_gen_stats');
            return response.data;
        } catch (error) {
            if (error.response) {
                throw new Error(error.response.data.message || 'Ошибка при получении общей статистики');
            } else if (error.request) {
                throw new Error('Сервер недоступен. Пожалуйста, попробуйте позже.');
            } else {
                throw new Error('Произошла ошибка при запросе общей статистики');
            }
        }
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

    autofillTaxon: async (field, text) => {
        try {
            const response = await api.post('/api/autofill_taxon', { field, text });
            return response.data;
        } catch (error) {
            console.error("Autofill error:", error);
            return {};
        }
    },

    getPublication: async () => {
        try {
            const response = await api.get('/api/get_publ');
            return response.data;
        } catch (error) {
            throw new Error(error);
        }
    },
		
		getLocationFromCoordinates: async (coordinates) => {
				try {
						const response = await api.post('/api/get_loc', coordinates);
						return response.data;
				} catch (error) {
						console.error("Error getting location:", error);
						throw error;
				}
		},

    postSupport: async (data) => {
        try {
            await api.post('/api/support', data);
        } catch (error) {
            if (error.response) {
                // Сервер ответил с кодом состояния, выходящим за пределы 2xx
                throw new Error(error.response.data.message || 'Произошла ошибка при отправке запроса');
            } else if (error.request) {
                // Запрос был сделан, но ответ не получен (бэкенд недоступен)
                throw new Error('Сервер недоступен. Пожалуйста, попробуйте позже.');
            } else {
                // Произошла ошибка при настройке запроса
                throw new Error('Произошла ошибка при отправке запроса');
            }
        }
    },

    getProfile: async() => {
        try {
            const response = await api.get('/api/get_pers_stats');
            return response;
        } catch (error) {
            if (error.response) {
                throw new Error(error.response.data.message || 'Ошибка при получении профиля');
            } else if (error.request) {
                throw new Error('Сервер недоступен. Пожалуйста, попробуйте позже.');
            } else {
                throw new Error('Произошла ошибка при запросе профиля');
            }
        }
    },

    getProfilePhoto: async(userId) => {
        try {
            const response = await api.get('/api/user_photo', {
                params: {
                    user_id: userId
                },
                responseType: 'blob'
            });
            return URL.createObjectURL(response.data);
        } catch (error) {
            return null;
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
