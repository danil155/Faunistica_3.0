import { useState, useCallback, useEffect } from 'react';
import { apiService } from '../api';

export default function useToken() {
    const [isAuth, setIsAuth] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkAuth = useCallback(async () => {
        try {
            setIsLoading(true);
            const authStatus = await apiService.checkAuth();
            setIsAuth(authStatus);
            return authStatus;
        } catch (error) {
            setIsAuth(false);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const login = async (username, password) => {
        try {
            setIsLoading(true);
            await apiService.login(username, password);
            return await checkAuth();
        } catch (error) {
            setIsAuth(false);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            setIsLoading(true);
            await apiService.logout();
        } finally {
            setIsAuth(false);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    return {
        isAuth,
        isLoading,
        checkAuth,
        login,
        logout
    };
};