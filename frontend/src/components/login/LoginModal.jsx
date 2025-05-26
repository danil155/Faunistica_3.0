import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ReactComponent as QrCode } from '../../img/qr-code.svg';
import { useNavigate } from 'react-router-dom';
import "./LoginModal.css";
import { apiService } from '../../api';

const LoginModal = ({onClose, onLogin}) => {
    const {t} = useTranslation('loginModal');
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isTooManyRequests, setIsTooManyRequests] = useState(false);

    const handleSubmit = async e => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const loginSuccess = await apiService.login(username, password);

            if (loginSuccess) {
                onClose();
                navigate('/form');
                window.location.reload();
            }
        } catch (err) {
            console.error('Login error: ', err);

            if (err.message === "wrong_pass") {
                setError(t("error.wrong_pass"));
            } else if (err.message === "not_user") {
                setError(t("error.no_user"))
            } else if (err.message === "many_attempts") {
                setIsTooManyRequests(true);
                setError(t("error.request_limit"));
                setTimeout(() => {
                    setIsTooManyRequests(false);
                    setError('');
                }, 30000);
            } else {
                setError(t("error.login_error"))
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal telegram-login-modal">
                <button className="close-button" onClick={onClose}>×</button>
                <h2>{t("modal.tg_title")}</h2>

                <div className="telegram-instructions">
                    <p>{t("modal.tg_text")}</p>

                    <div className="qr-code-container">
                        <a href="https://t.me/FaunisticaV3Bot" target="_blank" rel="noopener noreferrer">
                            <QrCode className="qr-code"/>
                        </a>
                        <p>{t("modal.tg_qr")}</p>
                    </div>

                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">{t("modal.tg_data")}</label>
                        <input
                            id="username"
                            name="username"
                            className="text-input"
                            type="text"
                            value={username}
                            autoComplete="on"
                            onChange={(e) => {
                                setUsername(e.target.value);
                                setError('');
                            }}
                            placeholder={t("modal.username")}
                            required
                        />
                        <input
                            name="password"
                            autoComplete="on"
                            className="text-input"
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError('');
                            }}
                            placeholder={t("modal.pass")}
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
                                <span className="spinner"></span> {t("modal.loading")}
                            </>
                        ) : t("modal.button")}
                    </button>
                </form>

                <div className="help-text">
                    <p>{t("modal.issue")}</p>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;