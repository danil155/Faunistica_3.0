import { useState } from 'react';
import { apiService } from '../api';

export default function useToken() {
  const [isAuth, setIsAuth] = useState(false);

  const checkAuth = async () => {
    try {
      const authStatus = await apiService.checkAuth();
      setIsAuth(authStatus);
      return authStatus;
    } catch (error) {
      setIsAuth(false);
      return false;
    }
  };

  const login = async (username, password) => {
    try {
      await apiService.login(username, password);
      const authStatus = await checkAuth();
      setIsAuth(authStatus);
      return authStatus;
    } catch (error) {
      setIsAuth(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiService.refreshToken(); // Инвалидация refresh токена
    } finally {
      setIsAuth(false);
      window.location.href = '/login';
    }
  };

  return {
    isAuth,
    checkAuth,
    login,
    logout
  };
}
