import axios from 'axios';
import i18n from 'i18next';

const api = axios.create({
    // baseURL: "http://localhost:5001",
    withCredentials: true
});

let refreshTokenPromise = null;

const apiService = {
    login: async (username, password) => {
        try {
            const response = await api.post('/api/get_user', {username, password});
            return response.data;
        } catch (error) {
            if (error.response?.status === 401) {
                throw new Error('wrong_pass');
            } else if (error.response?.status === 404) {
                throw new Error('not_user');
            } else if (error.response?.status === 429) {
                throw new Error('many_attempts');
            }
            throw error;
        }
    },

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

    getInfoFromText: async (text) => {
        const response = await api.post('/api/get_info', {text});
        return response.data;
    },

    insertRecord: async (recordData, t) => {
        try {
            const response = await api.post('/api/insert_record', recordData);
            return response.data;
        } catch (error) {
            if (error.response?.status === 422) {
                throw new Error(error);
            } else if (error.response?.status === 500) {
                throw new Error(t("errors.records.server_error"))
            }
        }
        
    },

    getGeneralStats: async (t) => {
        try {
            const response = await api.get('/api/get_gen_stats');
            return response.data;
        } catch (error) {
            if (error.response) {
                throw new Error(error.response.data.message || t('errors.stats.general_error'));
            } else if (error.request) {
                throw new Error(t('errors.common.server_unavailable'));
            } else {
                throw new Error(t('errors.stats.request_error'));
            }
        }
    },

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
            return {suggestions: []};
        }
        try {
            const response = await api.post('/api/geo_search', filters);
            return response.data;
        } catch (error) {
            console.error(error);
            return {suggestions: []};
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

    ChangePublication: async (t) => {
        try {
            const response = await api.get('/api/next_publ');
            return response.data;
        } catch (error) {
            if (error.response?.status === 409) {
                throw new Error(t('errors.publication.not_filled'));
            }
            if (error.response?.status === 404) {
                throw new Error(t('errors.publication.not_available'));
            }
            throw new Error(t('errors.publication.general_error'));
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

    postSupport: async (data, t) => {
        try {
            await api.post('/api/support', data);
        } catch (error) {
            if (error.response) {
                throw new Error(error.response.data.message || t('errors.support.request_error'));
            } else if (error.request) {
                throw new Error(t('errors.common.server_unavailable'));
            } else {
                throw new Error(t('errors.support.general_error'));
            }
        }
    },

    getProfile: async (t) => {
        try {
            const response = await api.get('/api/get_pers_stats');
            return response;
        } catch (error) {
            if (error.response) {
                throw new Error(error.response.data.message || t('errors.support.request_error'));
            } else if (error.request) {
                throw new Error(t('errors.common.server_unavailable'));
            } else {
                throw new Error(t('errors.support.general_error'));
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

    downloadRecords: async (t) => {
        try {
            const response = await api.post('/api/get_records_data', {}, {
                responseType: 'blob'
            });
            return response;
        } catch (error) {
            if (error.response?.status === 429) {
                throw new Error(t('errors.records.wait_before_download'));
            } else if (error.response?.status === 404) {
                throw new Error(t('errors.records.not_found'));
            }
            throw error;
        }
    },

    getRecord: async (hash, t) => {
        try {
            const response = await api.post('/api/get_record', {hash});
            return response.data;
        } catch (error) {
            if (error.response?.status === 400) {
                throw new Error(t('errors.records.invalid_token'));
            }
            if (error.response?.status === 404) {
                throw new Error(t('errors.records.not_found_or_no_access'));
            }
            if (error.response?.status === 500) {
                throw new Error(t('errors.common.server_error'));
            }
            throw new Error(t('errors.records.connection_error'));
        }
    },

    deleteRecord: async (hash, t) => {
        try {
            const response = await api.post('/api/del_record', {hash});
            return response.data;
        } catch (error) {
            if (error.response?.status === 400) {
                throw new Error(t('errors.records.invalid_token'));
            }
            if (error.response?.status === 404) {
                throw new Error(t('errors.records.not_found_or_no_access'));
            }
            if (error.response?.status === 500) {
                throw new Error(t('errors.common.server_error'));
            }
            throw new Error(t('errors.records.connection_error'));
        }
    },

    editRecord: async (hash, recordData, t) => {
        try {
            const response = await api.post('/api/edit_record', {hash, ...recordData});
            return response.data;
        } catch (error) {
            if (error.response?.status === 400) {
                Error(t('errors.records.invalid_token'));
            }
            if (error.response?.status === 404) {
                throw new Error(t('errors.records.not_found_or_no_access'));
            }
            if (error.response?.status === 500) {
                throw new Error(t('errors.common.server_error'));
            }
            throw new Error(t('errors.records.connection_error'));
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
