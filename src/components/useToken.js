import { useState } from 'react';
import { api } from '../api';

export default function useToken() {
  const getToken = () => {
    return localStorage.getItem('access_token');
  };

  const [token, setToken] = useState(getToken());

  const saveToken = (userToken) => {
    localStorage.setItem('access_token', userToken);
    setToken(userToken);
  };

  const removeToken = () => {
    localStorage.removeItem('access_token');
    setToken(null);
    //api.post('/auth/logout', {}, { withCredentials: true });
  };

  return {
    token,
    setToken: saveToken,
    removeToken,
  };
}