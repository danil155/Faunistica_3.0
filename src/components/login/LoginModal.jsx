/* Это popup регистрации через бота телеграм
При вводе пароля (и по идее проверке, но там надо Даню или кого-то ещё, наверное, 
чтобы добавить взаимодействие с тг ботом, выдающим эти пароли), так вот по нажатию "Войти" 
он пересылает нас на route формы*/

import React, { useState } from 'react';
import { ReactComponent as QrCode } from '../../img/qr-code.svg';
import { useNavigate } from 'react-router-dom';
import "./LoginModal.css"
import {api, apiService} from '../../api'

const LoginModal = ({ onClose, onLogin }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async e =>{
    e.preventDefault();

    try {
      const response = await apiService.login(username, password);
      console.log(response)

      if (response.access_token) {
        localStorage.setItem('access_token', response.access_token);
      }

      onLogin();
    } catch (err) {
      setError('Ошибка входа. Проверьте данные.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal telegram-login-modal">
        <button className="close-button" onClick={onClose}>×</button>
        <h2>Вход через Telegram</h2>
        
        <div className="telegram-instructions">
          <p>Войдите с помощью нашего Telegram бота</p>
          
          <div className="qr-code-container">
            <a href="https://t.me/faunistica_2_bot" target="_blank" rel="noopener noreferrer">
                <QrCode className="qr-code" />
            </a>
            <p>Наведите камеру или нажмите на QR-код</p>
          </div>
          
          <p>После получения пароля введите его ниже:</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Данные из Telegram:</label>
            <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                }}
                placeholder="Введите имя пользователя"
                required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="Введите пароль, полученный от бота"
              required
            />
            {error && <div className="error-message">{error}</div>}
          </div>
          
          <button type="submit" className="submit-button">Войти</button>
        </form>

        <div className="help-text">
          <p>Не получили пароль? Перейдите в бота и нажмите /start</p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;