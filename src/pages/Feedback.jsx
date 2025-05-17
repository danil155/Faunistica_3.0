import {apiService} from "../api";
import {useState} from "react";

const FeedbackPage = () => {
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
            setLinkError("Пожалуйста, введите корректный Telegram ID (например, @username или t.me/username)");
            return;
        }

        // Check required fields
        if (!feedback.issue_type || !feedback.text) {
            setError("Пожалуйста, заполните все обязательные поля!");
            return;
        }

        try {
            setLoading(true);
            await apiService.postSupport(feedback);
            setSuccess(true);
            console.log("Успешно отправлено");
        } catch (error) {
            console.error("Ошибка:", error);
            setError(error.message || "Произошла ошибка при отправке");
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
            <h1>Форма обратной связи</h1>
            {success ? (
                <div className="success-message" style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '4px', color: '#2e7d32' }}>
                    Ваше сообщение успешно отправлено! Ожидайте, с Вами свяжется администратор / организатор проекта.
                </div>
            ) : (
                <form className="feedback-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="link">Ссылка на Вас в Telegram:</label>
                        <input 
                            className={"text-input"} 
                            id="link" 
                            type="text" 
                            name="link" 
                            required 
                            onChange={onChange}
                            value={feedback.link}
                            placeholder="@username или t.me/username"
                        />
                        {linkError && <p className="error-message">{linkError}</p>}
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="user_name">Ваш никнейм, заданный в боте (необязательно)</label>
                        <input className={"text-input"} id="user_name" type="text" name="user_name" onChange={onChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="issue_type">С чем возникла ваша проблема?</label>
                        <select id="issue_type" className="form-control" name="issue_type" value={feedback.issue_type} onChange={onChange}>
                            <option value="">-</option>
                            <option value="authorisation-website">Проблемы с авторизацией на сайте</option>
                            <option value="authorisation-tg">Проблемы с авторизацией в боте</option>
                            <option value="registration">Проблемы с регистрацией в боте</option>
                            <option value="get-publication">Проблемы с получением статьи</option>
                            <option value="autofill">Проблемы с автозаполнением</option>
                            <option value="fill-by-hand">Проблемы с заполнением вручную</option>
                            <option value="confirmation">Проблемы с отправкой формы</option>
                            <option value="other">Другое</option>
                        </select>
                    </div>

                    <div className="content">
                        <label htmlFor="text">Опишите вашу проблему здесь:</label>
                        <textarea
                            placeholder="Введите вашу проблему здесь..."
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
                        {loading ? "Отправка..." : "Сообщить о проблеме"}
                    </button>
                </form>
            )}
        </div>
    );
};

export default FeedbackPage;