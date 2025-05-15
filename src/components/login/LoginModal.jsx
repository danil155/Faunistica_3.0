/* Это popup регистрации через бот телеграм
При вводе пароля (и по идее проверке, но там надо Даню или кого-то ещё, наверное, 
чтобы добавить взаимодействие с тг ботом, выдающим эти пароли), так вот по нажатию "Войти" 
он пересылает нас на route формы*/

import React, { useState } from 'react';
import { ReactComponent as QrCode } from '../../img/qr-code.svg';
import { useNavigate } from 'react-router-dom';
import "./LoginModal.css";

const LoginModal = ({ onClose, onLogin }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTooManyRequests, setIsTooManyRequests] = useState(false);

  const handleSubmit = async e =>{
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const loginSuccess = await onLogin(username, password);
      console.log(loginSuccess);

      if (loginSuccess) {
        onClose();
        navigate('/form');
      }
    } catch (err) {
      console.error('Ошибка авторизации: ', err);

      if (err.message === 'Неверный пароль') {
        setError('Неверный пароль. Попробуйте снова.');
      } else if (err.message === 'Пользователь не найден') {
        setError('Пользователь не найден')
      } else if (err.message === 'Количество попыток превышено'){
        setIsTooManyRequests(true);
        setError('Количество попыток превышено. Попробуйте через минуту.');
        setTimeout(() => {
          setIsTooManyRequests(false);
          setError('');
        }, 30000);
      } else {
        setError('Ошибка входа. Попробуйте позже.')

      }
    } finally {
      setIsLoading(false);
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
            <a href="https://t.me/FaunisticaV3Bot" target="_blank" rel="noopener noreferrer">
                <QrCode className="qr-code" />
            </a>
            <p>Наведите камеру или нажмите на QR-код</p>
          </div>

        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Данные из Telegram:</label>
            <input
                className="text-input"
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
                className="text-input"
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

          <button
              id="button_submit_text"
              type="submit"
              className="submit-button"
              disabled={isLoading || isTooManyRequests}
          >
            {isLoading ? (
                <>
                  <span className="spinner"></span> Вход...
                </>
            ) : 'Войти'}
          </button>
        </form>

        <div className="help-text">
          <p>Не получили пароль? Перейдите в бота и нажмите /start</p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;