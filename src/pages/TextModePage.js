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
  const { formState, setFormState, pinnedData, resetForm } = useFormContext();

  const handleTextChange = (event) => {
    setText(event.target.value);
    setError(null); // Сбрасываем ошибку при изменении текста
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
      const specimens = {};
      if (result.count_males) specimens.male_adult = result.count_males;
      if (result.count_females) specimens.female_adult = result.count_females;
      if (result.count_juv_male) specimens.male_juvenile = result.count_juv_male;
      if (result.count_juv_female) specimens.female_juvenile = result.count_juv_female;
      if (result.count_juv) specimens.undefined_juvenile = result.count_juv;

      const processResult = {...result};
      if (result.coordinate_north) {
        const {degrees, minutes, seconds } = result.coordinate_north;
        if (degrees) {
          processResult.grads_north = degrees.toString();
          if (minutes) {
            processResult.mins_north = minutes.toString();
            if (seconds) {
              processResult.secs_north = seconds.toString();
              processResult.coordinate_north = degrees.toString() + '°' + minutes.toString() + "'" + seconds.toString() + '"';
            } else {
              processResult.coordinate_north = degrees.toString() + '°' + minutes.toString() + "'";
            }
          } else {
            processResult.coordinate_north = degrees.toString() + '°';
          }
        } else {
          processResult.coordinate_north = "";
        }
      } else {
        processResult.coordinate_north = "";
      }

      if (result.coordinate_east) {
        const {degrees, minutes, seconds } = result.coordinate_east;
        if (degrees) {
          processResult.grads_east = degrees.toString();
          if (minutes) {
            processResult.mins_east = minutes.toString();
            if (seconds) {
              processResult.secs_east = seconds.toString();
              processResult.coordinate_east = degrees.toString() + '°' + minutes.toString() + "'" + seconds.toString() + '"';
            } else {
              processResult.coordinate_east = degrees.toString() + '°' + minutes.toString() + "'";
            }
          } else {
            processResult.coordinate_east = degrees.toString() + '°'
          }
        } else {
          processResult.coordinate_east = "";
        }
      } else {
        processResult.coordinate_east = "";
      }

      // Обновление состояния формы
      setFormState(prev => ({
        ...prev,

        ...result,
        ...processResult,
        specimens: specimens,
        ...Object.entries(pinnedData).reduce((acc, [section, sectionData]) => {
          Object.entries(sectionData).forEach(([field, value]) => {
            if (!(field in result)) {
              acc[field] = value;
            }
          });
          return acc;
        }, {})
      }));
      console.log(result)
      navigate('/form');
    } catch (error) {
      console.error("Ошибка запроса:", error);
      setError(error.message || "Произошла ошибка при обработке текста");
    } finally {
      setIsLoading(false);
      console.log(formState);
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