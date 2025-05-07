import {useState} from "react";

const FeedbackPage = () => {
    return (
        <div className="feedback">
            <h1>Форма обратной связи</h1>
            <form className="feedback-form" onSubmit={(e) => {}}>
                <div className="form-group">
                    <label htmlFor="telegram-id">Ваш ID в telegram:</label>
                    <input className={"text-input"} id="telegram-id" type="text" name="telegram-id" required={true} />
                </div>
                <div className="form-group">
                    <label htmlFor="nickname">Ваш никнейм, заданный в боте (необязательно)</label>
                    <input className={"text-input"} id="nickname" type="text" name="nickname" />
                </div>
                <div className="form-group">
                    <label htmlFor="problem">С чем возникла ваша проблема?</label>
                    <select id="problem" className="form-control">
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
                    <label htmlFor="problem_description">Опишите вашу проблему здесь:</label>
                    <textarea
                        placeholder="Введите вашу проблему здесь..."
                        className="text-area"
                        id="problem_description"
                        required={true}
                    ></textarea>
                </div>
                <button type={"submit"} className="submit-button">Сообщить о проблеме</button>
            </form>
        </div>
    );
}

export default FeedbackPage;