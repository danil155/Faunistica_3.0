import {apiService} from "../api";
import {useState} from "react";
import { useTranslation } from 'react-i18next';

const FeedbackPage = () => {
    const { t } = useTranslation('feedback');
    const [error, setError] = useState(null);
    const [feedback, setFeedback] = useState({
        link: "",
        user_name: "",
        text: "",
        issue_type: ""
    });
    const [linkError, setLinkError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const validateTelegramLink = (link) => {
        const telegramPattern = /^(?:@|(?:https?:\/\/)?(?:t\.me\/|telegram\.me\/)?)(\w{5,32})$/;
        return telegramPattern.test(link.trim());
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLinkError(null);

        // Validate Telegram link
        if (!validateTelegramLink(feedback.link)) {
            setLinkError(t('errors.invalid_telegram'));
            return;
        }

        // Check required fields
        if (!feedback.issue_type || !feedback.text) {
            setError(t('errors.required_fields'));
            return;
        }

        try {
            setLoading(true);
            await apiService.postSupport(feedback);
            setSuccess(true);
        } catch (error) {
            console.error("Error:", error);
            setError(error.message || t('errors.submission_error'));
        } finally {
            setLoading(false);
        }
    };

    const onChange = (e) => {
        const {name, value} = e.target;
        setFeedback(prev => ({...prev, [name]: value}));
        if (name === 'link') setLinkError(null);
    };

    return (
        <div className="feedback">
            <h1>{t('title')}</h1>
            {success ? (
                <div className="success-message" style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '4px', color: '#2e7d32' }}>
                    {t('success.message')}
                </div>
            ) : (
                <form className="feedback-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="link">{t('form.telegram_label')}</label>
                        <input 
                            className={"text-input"} 
                            id="link" 
                            type="text" 
                            name="link" 
                            required 
                            onChange={onChange}
                            value={feedback.link}
                            placeholder={t('form.telegram_placeholder')}
                        />
                        {linkError && <p className="error-message">{linkError}</p>}
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="user_name">{t('form.username_label')}</label>
                        <input className={"text-input"} id="user_name" type="text" name="user_name" onChange={onChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="issue_type">{t('form.issue_label')}</label>
                        <select id="issue_type" className="form-control" name="issue_type" value={feedback.issue_type} onChange={onChange}>
                            <option value="">-</option>
                            {Object.entries(t('form.issue_types', { returnObjects: true })).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="content">
                        <label htmlFor="text">{t('form.problem_label')}</label>
                        <textarea
                            placeholder={t('form.problem_placeholder')}
                            className="text-area"
                            id="text"
                            name="text"
                            onChange={onChange}
                            required={true}
                        ></textarea>
                    </div>
                    
                    {error && <p className="error-message">{error}</p>}
                    <button 
                        type="submit" 
                        className="button_submit_text submit-button" 
                        disabled={loading}
                    >
                        {loading ? t('form.submitting') : t('form.submit_button')}
                    </button>
                </form>
            )}
        </div>
    );
};

export default FeedbackPage;