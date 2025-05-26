import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';

const PublicationErrorModal = ({onRetry}) => {
    const {t} = useTranslation('PublicationError');
    const [error, setError] = React.useState(null);

    const handleRetry = () => {
        try {
            onRetry();
            setError(null);
        } catch (err) {
            setError(err);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal telegram-login-modal">
                <Link to={"/"} className="close-button">×</Link>
                <h3>{t("title")}</h3>
                <p>{t("text")}</p>
                {error && <div className="error-message">{error}</div>}
                <div className="publ-err-btn">

                    <Link to={"/"} className="publ-error-btn-left">{t("button1")}</Link>
                    <button className="publ-error-btn-right" onClick={handleRetry}>{t("button2")}</button>
                </div>
            </div>
        </div>
    );
};

export default PublicationErrorModal;