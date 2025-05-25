import { useState } from "react";
import {Link, useNavigate} from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useFormContext } from "./FormContext";
import ArticleInfo from "../components/article-info/ArticleInfo";
import { apiService } from "../api";

const TextModePage = () => {
  const { t } = useTranslation('textMode');
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { formState, setFormState, pinnedSections } = useFormContext();

  const handleTextChange = (event) => {
    setText(event.target.value);
    setError(null); // Сбрасываем ошибку при изменении текста
  };

  async function handleSubmit() {
    if (!text.trim()) {
      setError(t("errors.empty"));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await apiService.getInfoFromText(text);
      let specimens = {}

      if (result.count_males || result.count_females || result.count_juv_male || result.count_juv_female || result.count_juv) {
        if (result.count_males) specimens.male_adult = result.count_males;
        if (result.count_females) specimens.female_adult = result.count_females;
        if (result.count_juv_male) specimens.male_juvenile = result.count_juv_male;
        if (result.count_juv_female) specimens.female_juvenile = result.count_juv_female;
        if (result.count_juv) specimens.undefined_juvenile = result.count_juv;
      }
      
      const coordinateUpdates = {};
      if (!pinnedSections["geographical"]) {
        if (result.coordinate_north) {
          const {degrees, minutes, seconds } = result.coordinate_north;
          if (degrees != null) {
            coordinateUpdates.grads_north = degrees.toString();
            if (minutes != null) {
              coordinateUpdates.mins_north = minutes.toString();
              if (seconds != null) {
                coordinateUpdates.secs_north = seconds.toString();
                coordinateUpdates.coordinate_north = `${degrees}°${minutes}'${seconds}"`;
              } else {
                coordinateUpdates.coordinate_north = `${degrees}°${minutes}'`;
              }
            } else {
              coordinateUpdates.coordinate_north = `${degrees}°`;
            }
          }
        }

        if (result.coordinate_east) {
          const {degrees, minutes, seconds} = result.coordinate_east;
          if (degrees != null) {
            coordinateUpdates.grads_east = degrees.toString();
            if (minutes != null) {
              coordinateUpdates.mins_east = minutes.toString();
              if (seconds != null) {
                coordinateUpdates.secs_east = seconds.toString();
                coordinateUpdates.coordinate_east = `${degrees}°${minutes}'${seconds}"`;
              } else {
                coordinateUpdates.coordinate_east = `${degrees}°${minutes}'`;
              }
            } else {
                coordinateUpdates.coordinate_east = `${degrees}°`;
            }
          }
        }
      }
            

      // Обновление состояния формы
      setFormState(prev => {
        const updates = {};
        
        if (result.date != null && !pinnedSections["material_collection"]) updates.begin_date = result.date;
        if (result.biotope != null && !pinnedSections["material_collection"]) updates.biotope = result.biotope;
        if (result.collector != null && !pinnedSections["material_collection"]) updates.collector = result.collector;
        if (result.country != null && !pinnedSections["administrative"]) updates.country = result.country;
        if (result.region != null && !pinnedSections["administrative"]) updates.region = result.region;
        if (result.district != null && !pinnedSections["administrative"]) updates.district = result.district;
        if (result.gathering_place != null && !pinnedSections["administrative"]) updates.gathering_place = result.gathering_place;
        if (result.family != null && !pinnedSections["taxonomy"]) updates.family = result.family;
        if (result.genus != null && !pinnedSections["taxonomy"]) updates.genus = result.genus;
        if (result.species != null && !pinnedSections["taxonomy"]) updates.species = result.species;
        if (result.taxonomic_notes != null && !pinnedSections["taxonomy"]) updates.taxonomic_notes = result.taxonomic_notes;
        
        const newState = {
          ...prev,
          ...updates,
          specimens: {
            ...prev.specimens,
            ...specimens
          }
        };

        if (!pinnedSections["geographical"]) {
          return {
            ...newState,
            ...coordinateUpdates
          };
        }
        
        return newState;
      });

      console.log(formState.genus)
      navigate('/form');

    } catch (error) {
      setError(error.message || t("errors.request"));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="text-container">
      <header>
        <h3>{t("text.insert_text")}</h3>
        <p>{t("text.or")}</p>
        <Link to="/form" className="switch-mode-button">
          {t("text.manual")}
        </Link>
      </header>
      <ArticleInfo />
      
      <div className="content">
        <textarea
          placeholder={t("text.placeholder")}
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
              {t("text.loading")}
            </>
          ) : (
            t("text.button")
          )}
        </button>
      </div>
    </div>
  );
};

export default TextModePage;