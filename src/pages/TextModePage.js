import { useState } from "react";
import {Link, useNavigate} from "react-router-dom";
import { useFormContext } from "./FormContext";
import ArticleInfo from "../components/article-info/ArticleInfo";
import { apiService } from "../api";

const TextModePage = () => {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { setFormState, pinnedData, resetForm } = useFormContext();

  const handleTextChange = (event) => {
    setText(event.target.value);
    setError(null); // Сбрасываем ошибку при изменении текста
  };

  // Функция для валидации и преобразования данных с сервера
  const transformServerData = (data) => {
    const transformed = {};
    
    // Обработка дат (пример)
    if (data.begin_date) {
      const [year, month, day] = data.begin_date.split('-');
      transformed.begin_year = year;
      transformed.begin_month = month;
      transformed.begin_day = day;
    }
    
    // Обработка координат (пример)
    if (data.coordinates) {
      const [north, east] = data.coordinates.split(',');
      transformed.north = north.trim();
      transformed.east = east.trim();
    }
    
    // Возвращаем объединенные данные
    return {
      ...data,
      ...transformed
    };
  };

  async function handleSubmit() {
    if (!text.trim()) {
      setError("Введите текст для обработки!");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await apiService.getInfoFromText(text);
      
      // Валидация и преобразование данных
      const validatedData = transformServerData(result);
      
      // Сброс формы с сохранением закрепленных данных
      resetForm(true); // Мягкий сброс (сохраняет закрепленные данные)
      
      // Обновление состояния формы
      setFormState(prev => ({
        ...prev,
        ...validatedData,
        // Сохраняем только те закрепленные данные, поля которых не пришли с сервера
        ...Object.entries(pinnedData).reduce((acc, [section, sectionData]) => {
          Object.entries(sectionData).forEach(([field, value]) => {
            if (!(field in validatedData)) {
              acc[field] = value;
            }
          });
          return acc;
        }, {})
      }));
      
      navigate('/form');
    } catch (error) {
      console.error("Ошибка запроса:", error);
      setError(error.message || "Произошла ошибка при обработке текста");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="text-container">
      <header>
        <h3>Вставьте текст</h3>
        <p>или</p>
        <Link to="/form" className="switch-mode-button">
          Заполните форму вручную
        </Link>
      </header>

      <div className="section article">
          <h4>Ваша статья:</h4>
          <ArticleInfo />
      </div>
      
      <div className="content">
        <textarea
          placeholder="Введите ваш текст здесь..."
          className="text-area"
          value={text}
          onChange={handleTextChange}
          disabled={isLoading}
          id="send_text"
        ></textarea>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <button 
          className="button_submit_text"
          onClick={handleSubmit}
          disabled={isLoading || !text.trim()}
        >
          {isLoading ? (
            <>
              <span className="spinner"></span>
              Обработка...
            </>
          ) : (
            "Автозаполнение"
          )}
        </button>
      </div>
    </div>
  );
};

export default TextModePage;