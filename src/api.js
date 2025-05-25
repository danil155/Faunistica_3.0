import axios from 'axios'; 
import i18n from 'i18next';

const api = axios.create({
    // baseURL: "http://localhost:5001",
    withCredentials: true
});

let refreshTokenPromise = null;

const apiService = {
    // Аутентификация
    login: async (username, password) => {
        console.log('login');
        try {
            const response = await api.post('/api/get_user', {username, password});
            console.log('response');
            return response.data;
        } catch (error) {
            if (error.response?.status === 401) {
                throw new Error(i18n.t('api.errors.login.invalid_password'));
            } else if (error.response?.status === 404) {
                throw new Error(i18n.t('api.errors.login.user_not_found'));
            } else if (error.response?.status === 429) {
                throw new Error(i18n.t('api.errors.login.too_many_attempts'));
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
        const response = await api.post('/api/get_info', {text});
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
                throw new Error(error.response.data.message || i18n.t('api.errors.stats.general_error'));
            } else if (error.request) {
                throw new Error(i18n.t('api.errors.common.server_unavailable'));
            } else {
                throw new Error(i18n.t('api.errors.stats.request_error'));
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

    suggestGeo: async (filters) => {
        if (!filters || filters.text.length < 1) {
            return { suggestions: [] };
        }
        try {
            console.log(filters)
            const response = await api.post('/api/geo_search', filters);
            console.log(response)
            return response.data;
        } catch (error) {
            console.error(error);
            return { suggestions: [] };
        }
    },

    autofillTaxon: async (field, text) => {
        try {
            const response = await api.post('/api/autofill_taxon', {field, text});
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

    getPublicationFromHash: async (hash) => {
        try {
            const response = await api.post('/api/publ_from_hash', hash);
            return response.data;
        } catch (error) {
            throw new Error(error);
        }
    },

    ChangePublication: async () => {
        try {
            const response = await api.get('/api/next_publ');
            return response.data;
        }  catch (error) {
            if (error.response?.status === 409) {
                throw new Error(i18n.t('api.errors.publication.not_filled'));
            }
            if (error.response?.status === 404) {
                throw new Error(i18n.t('api.errors.publication.not_available'));
            }
            throw new Error(i18n.t('api.errors.publication.general_error'));
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
                throw new Error(error.response.data.message || i18n.t('api.errors.support.request_error'));
            } else if (error.request) {
                // Запрос был сделан, но ответ не получен (бэкенд недоступен)
                throw new Error(i18n.t('api.errors.common.server_unavailable'));
            } else {
                // Произошла ошибка при настройке запроса
                throw new Error(i18n.t('api.errors.support.general_error'));
            }
        }
    },

    getProfile: async () => {
        try {
            const response = await api.get('/api/get_pers_stats');
            return response;
        } catch (error) {
            if (error.response) {
                throw new Error(error.response.data.message || i18n.t('api.errors.support.request_error'));
            } else if (error.request) {
                throw new Error(i18n.t('api.errors.common.server_unavailable'));
            } else {
                throw new Error(i18n.t('api.errors.support.general_error'));
            }
        }
    },

    getProfilePhoto: async (userId) => {
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
    },

    downloadRecords: async () => {
        try {
            const response = await api.post('/api/get_records_data', {}, {
                responseType: 'blob'
            });
            return response;
        } catch (error) {
            if (error.response?.status === 429) {
                throw new Error(i18n.t('api.errors.records.wait_before_download'));
            } else if (error.response?.status === 404) {
                throw new Error(i18n.t('api.errors.records.not_found'));
            }
            throw error;
        }
    },
		
	getRecord: async (hash) => {
		try {
			const response = await api.post('/api/get_record', { hash });
			return response.data;
		} catch (error) {
            if (error.response?.status === 400) {
                throw new Error(i18n.t('api.errors.records.invalid_token'));
            }
            if (error.response?.status === 404) {
                throw new Error(i18n.t('api.errors.records.not_found_or_no_access'));
            }
            if (error.response?.status === 500) {
                throw new Error(i18n.t('api.errors.common.server_error'));
            }
            throw new Error(i18n.t('api.errors.records.connection_error'));
        }
	},
	
	deleteRecord: async (hash) => {
		try {
			const response = await api.post('/api/del_record', { hash });
			return response.data;
		} catch (error) {
            if (error.response?.status === 400) {
                throw new Error(i18n.t('api.errors.records.invalid_token'));
            }
            if (error.response?.status === 404) {
                throw new Error(i18n.t('api.errors.records.not_found_or_no_access'));
            }
            if (error.response?.status === 500) {
                throw new Error(i18n.t('api.errors.common.server_error'));
            }
            throw new Error(i18n.t('api.errors.records.connection_error'));
        }
	},
        
    editRecord: async (hash, recordData) => {
        try {
            const response = await api.post('/api/edit_record', { hash, ...recordData });
            return response.data;
        } catch (error) {
            if (error.response?.status === 400) {
                Error(i18n.t('api.errors.records.invalid_token'));
            }
            if (error.response?.status === 404) {
                throw new Error(i18n.t('api.errors.records.not_found_or_no_access'));
            }
            if (error.response?.status === 500) {
                throw new Error(i18n.t('api.errors.common.server_error'));
            }
            throw new Error(i18n.t('api.errors.records.connection_error'));
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
				
		const currentPath = window.location.pathname;
		const shouldRedirect = currentPath === '/text' || currentPath === '/form';

        if (error.response?.status === 403 && !originalRequest._retry) {
            originalRequest._retry = true;
						
			if (originalRequest.url.includes('/api/refresh_token')) {
				console.error('Refresh token failed, logging out');
				if (shouldRedirect) {
					window.location.href = '/';
				}
				return Promise.reject(error);
			}

            try {
                await apiService.refreshToken();
                return api(originalRequest);
            } catch (refreshError) {
                console.error('Refresh token failed:', refreshError);
					if (shouldRedirect) {
						window.location.href = '/';
					}
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export {api, apiService};
