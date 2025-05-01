import {useState, useCallback, useEffect} from 'react';
import { apiService } from '../api';

export default function useToken() {
  const [isAuth, setIsAuth] = useState(null);

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
      return await checkAuth();
    } catch (error) {
      setIsAuth(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } finally {
      setIsAuth(false);
      window.location.href = '/';
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return {
    isAuth,
    checkAuth,
    login,
    logout
  };
}
