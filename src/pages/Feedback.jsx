import {apiService} from "../api";
import {useState} from "react";


const FeedbackPage = () => {
    const [error, setError] = useState(null);
    const [feedback, setFeedback] = useState({
        link: "",
        user_name: "",
        text: "",
        type: null
    });
    const [loading, setLoading] = useState(false);
    const handleSubmit = (e) => {

        e.preventDefault();

        for (let item in feedback) {
            if (item !== "type" && feedback[item] === "") {
                setError("Пожалуйста, введите необходимые данные!");

                return;
            }
        }
        try {
            setLoading(true);
            apiService.postSupport(feedback)
                .then(() => {

                    console.log("Успешно отправлено");
                })
                .catch(error => {
                    console.error("Ошибка:", error);
                    setError(error.message);
                })
                .finally(() => {
                        setLoading(false);
                });
        } catch (error) {
            console.log(error.message);
            setError(error.message);

        }
    }

    const onChange = (e) => {
        setFeedback((prev) => ({ ...prev, [e.target.name]: e.target.value.trim() }));
    }

    return (
        <div className="feedback">
            <h1>Форма обратной связи</h1>
            <form className="feedback-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="link">Ваш ID в telegram:</label>
                    <input className={"text-input"} id="link" type="text" name="link" required={true} onChange={onChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="user_name">Ваш никнейм, заданный в боте (необязательно)</label>
                    <input className={"text-input"} id="user_name" type="text" name="user_name" onChange={onChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="type">С чем возникла ваша проблема?</label>
                    <select id="type" className="form-control" onChange={onChange}>
                        <option value="">-</option>
                        <option value="authorisation-website">Пробемы с авторизацией на сайте</option>
                        <option value="authorisation-tg">Пробемы с авторизацией в боте</option>
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
                {error ? <p className="error-message">{error}</p> :""}
                <button type={"submit"} className="button_submit_text submit-button" disabled={loading}>{!loading?"Сообщить о проблеме": "Отправка..."}</button>
            </form>
        </div>
    );
}

export default FeedbackPage;