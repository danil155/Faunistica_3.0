import React from "react";
import { Link } from "react-router-dom";

const PublicationErrorModal = ({onRetry}) => {
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
                <Link to={"/"} className="close-button" >×</Link>
              <h3>Ой! Что-пошло не так (</h3>
              <p>Не могу получить Вашу статью.</p>
                {error && <div className="error-message">{error}</div>}
              <div className="publ-err-btn">

                  <Link to={"/"} className="publ-error-btn-left">На главную</Link>
                  <button className="publ-error-btn-right"  onClick={handleRetry}>Попробовать ещё раз</button>
              </div>
            </div>
        </div>
        );
};

export default PublicationErrorModal;