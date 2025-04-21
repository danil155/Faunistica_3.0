/* Это popup регистрации через бота телеграм
При вводе пароля (и по идее проверке, но там надо Даню или кого-то ещё, наверное, 
чтобы добавить взаимодействие с тг ботом, выдающим эти пароли), так вот по нажатию "Войти" 
он пересылает нас на route формы*/

import React, { useState } from 'react';
import { ReactComponent as QrCode } from '../../img/qr-code.svg';
import { useNavigate } from 'react-router-dom';
import "./LoginModal.css"

const LoginModal = ({ onClose, onLogin }) => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit (e){
    e.preventDefault();
    
    if (!password) {
      setError('Введите пароль');
      return;
    }
    
    // Здесь должна быть проверка пароля через API
    // Для демо просто имитируем успешный вход
    onLogin({
      id: 1,
      name: 'Иван Волонтеров',
      telegram: '@volunteer123',
      joinedAt: new Date().toISOString()
    });
    navigate('/text')
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
            <label>Пароль из Telegram:</label>
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