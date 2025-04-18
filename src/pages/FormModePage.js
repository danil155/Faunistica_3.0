import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormContext} from "./FormContext";
import SpecimenForm from "../components/specimen-form/SpecimenForm";
import "../styles/formMode.css"
import PinToggle from "../components/pin-toggle/PinToggle";

const fieldsMap = {
  'Административное положение': ['country', 'region', 'district', 'place'],
  'Географическое положение': ['north', 'east'],
  'Сбор материала': ['begin_date', 'end_date', 'biotope', 'collector', 'measurement_units', 'selective_gain'],
  'Таксономия': ['family', 'genus', 'species', 'taxonomic_notes']
};


const FormModePage = () => {
  const navigate = useNavigate();
  const {
    formState,
    setFormState,
    pinnedSections,
    setPinnedSections,
    pinnedData,
    setPinnedData,
    resetForm,
    collapsedSections,
    toggleCollapseSection
  } = useFormContext();

  const [showResetModal, setShowResetModal] = useState(false);
  const [resetMode, setResetMode] = useState('soft');

  // Обработчик изменений для текстовых полей
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  // Обработчик изменений для чекбоксов/радио
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormState(prev => ({ ...prev, [name]: checked }));
  };

  // Обработчик для полей даты
  const handleDateChange = (name, value) => {
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  // Получение данных секции
  const getSectionData = (sectionName) => {
    return fieldsMap[sectionName].reduce((acc, field) => {
      acc[field] = formState[field];
      return acc;
    }, {});;
  };

  // Переключение закрепления секции
  const togglePinSection = (sectionName) => {
    setPinnedSections(prev => {
      const newPinned = !prev[sectionName];
      
      // Если секция стала закреплённой, сохраняем её данные
      if (newPinned) {
        setPinnedData(prevData => ({
          ...prevData,
          [sectionName]: getSectionData(sectionName)
        }));
      } else {
        // Если открепляется, удаляем из pinnedData
        setPinnedData(prevData => {
          const newData = { ...prevData };
          delete newData[sectionName];
          return newData;
        });
      }

      return { ...prev, [sectionName]: newPinned };
    });
  };

  // Обработчик отправки формы
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Отправка данных:", formState);
    // Здесь будет логика отправки на сервер
    resetForm(resetMode === 'soft');
    alert("Форма отправлена! Незакреплённые поля очищены.");
  };


  // Обработчик очистки формы
  const handleResetConfirm = () => {
    resetForm(resetMode === 'soft');
    setShowResetModal(false);
  };

  // Генерация класса для закреплённых секций
  const getSectionClassName = (sectionName) => {
    return `section ${pinnedSections[sectionName] ? 'pinned' : ''}`;
  };

  return (
    <div className="form-mode-container">
      <header>
        <h3>Заполните форму вручную</h3>
        <button 
          onClick={() => navigate('/text')} 
          className="switch-mode-button"
          type="button"
        >
          Перейти к текстовому вводу
        </button>
      </header>

      <form onSubmit={handleSubmit} className="specimen-form">
        {/* Секция: Административное положение */}
        <div className={getSectionClassName('Административное положение')}>
          <div className={`section-header ${collapsedSections['Административное положение'] ? 'collapsed' : ''}`}>
          <div className="section-controls">
            <h4>Административное положение</h4>
            <PinToggle isChecked={pinnedSections['Административное положение'] || false} 
            onChange={() => togglePinSection('Административное положение')} />
            </div>
            <button
              className="collapse-toggle"
              type="button"
              onClick={() => toggleCollapseSection('Административное положение')}
            >
              {collapsedSections['Административное положение'] ? 'Развернуть' : 'Свернуть'}
            </button>
            
          </div>
          {!collapsedSections['Административное положение'] && (
          <div className="form-grid">
            <div className="form-group">
              <label>Страна:</label>
              <input
                type="text"
                name="country"
                value={formState.country}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Регион:</label>
              <input
                type="text"
                name="region"
                value={formState.region}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Район:</label>
              <input
                type="text"
                name="district"
                value={formState.district}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Место сбора:</label>
              <input
                type="text"
                name="place"
                value={formState.place}
                onChange={handleInputChange}
              />
            </div>
          </div>
          )}
        </div>
        
        {/* Секция: Географическое положение */}
        <div className={getSectionClassName('Географическое положение')}>
          <div className={`section-header ${collapsedSections['Географическое положение'] ? 'collapsed' : ''}`}>
          <div className="section-controls">
            <h4>Географическое положение</h4>
            
            <PinToggle isChecked={pinnedSections['Географическое положение'] || false} 
            onChange={() => togglePinSection('Географическое положение')} />
            </div>
            <button
              className="collapse-toggle"
              type="button"
              onClick={() => toggleCollapseSection('Географическое положение')}
            >
              {collapsedSections['Географическое положение'] ? 'Развернуть' : 'Свернуть'}
            </button>
            
          </div>

          {!collapsedSections['Географическое положение'] && (
          <div className="form-grid">
            <div className="form-group">
              <label>Широта (N):</label>
              <input
                type="text"
                name="north"
                value={formState.north}
                onChange={handleInputChange}
                placeholder="00.0000"
              />
            </div>

            <div className="form-group">
              <label>Долгота (E):</label>
              <input
                type="text"
                name="east"
                value={formState.east}
                onChange={handleInputChange}
                placeholder="00.0000"
              />
            </div>
          </div>
          )}
        </div>

        {/* Секция: Сбор материала */}
        <div className={getSectionClassName('Сбор материала')}>
          <div className={`section-header ${collapsedSections['Сбор материала'] ? 'collapsed' : ''}`}>
          <div className="section-controls">
            <h4>Сбор материала</h4>
            <PinToggle isChecked={pinnedSections['Сбор материала'] || false} 
            onChange={() => togglePinSection('Сбор материала')} />
            </div>
            <button
              className="collapse-toggle"
              type="button"
              onClick={() => toggleCollapseSection('Сбор материала')}
            >
              {collapsedSections['Сбор материала'] ? 'Развернуть' : 'Свернуть'}
            </button>
            
          </div>

          {!collapsedSections['Сбор материала'] && (

          <div className="form-grid">
            <div className="form-group">
              <label>Дата начала:</label>
              <input
                type="date"
                name="begin_date"
                value={formState.begin_date || ''}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Дата окончания:</label>
              <input
                type="date"
                name="end_date"
                value={formState.end_date || ''}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Биотоп:</label>
              <input
                type="text"
                name="biotope"
                value={formState.biotope}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Коллектор:</label>
              <input
                type="text"
                name="collector"
                value={formState.collector}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Единицы измерения:</label>
              <input
                type="text"
                name="measurement_units"
                value={formState.measurement_units || "Особи, шт."}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Выборочное усиление:</label>
              <input
                type="text"
                name="selective_gain"
                value={formState.selective_gain}
                onChange={handleInputChange}
              />
            </div>
          </div>
          )}
        </div>

        {/* Секция: Таксономия */}
        <div className={getSectionClassName('Таксономия')}>
          <div className={`section-header ${collapsedSections['Таксономия'] ? 'collapsed' : ''}`}>
          <div className="section-controls">
            <h4>Таксономия</h4>
            <PinToggle isChecked={pinnedSections['Таксономия'] || false} 
            onChange={() => togglePinSection('Таксономия')} />
            </div>
            <button
              className="collapse-toggle"
              type="button"
              onClick={() => toggleCollapseSection('Таксономия')}
            >
              {collapsedSections['Таксономия'] ? 'Развернуть' : 'Свернуть'}
            </button>
            
          </div>

          {!collapsedSections['Таксономия'] && (

          <div className="form-grid">
            <div className="form-group">
              <label>Семейство:</label>
              <input
                type="text"
                name="family"
                value={formState.family}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Род:</label>
              <input
                type="text"
                name="genus"
                value={formState.genus}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Вид:</label>
              <input
                type="text"
                name="species"
                value={formState.species}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Таксономические примечания:</label>
              <textarea
                name="taxonomic_notes"
                value={formState.taxonomic_notes}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
          </div>
          )}
        </div>

        {/* Секция: Добавление особей (без возможности закрепления) */}
        <div className="section">
          <h4>Добавление особей</h4>
          <SpecimenForm
            value={Object.keys(formState.specimens).length > 0
              ? Object.entries(formState.specimens).map(([key, count]) => {
                  const [gender, maturity] = key.split('_');
                  return { gender, maturity, count };
                })
              : []}
            onChange={(specimens) => {
              const specimensObject = specimens.reduce((acc, { gender, maturity, count }) => {
                const key = `${gender}_${maturity}`;
                acc[key] = count;
                return acc;
              }, {});
              setFormState(prev => ({ ...prev, specimens: specimensObject }));
            }}
          />
        </div>

        {/* Кнопки действий */}
        <div className="form-actions">
          <button type="submit" className="submit-button">
            Отправить наблюдение
          </button>
          
          <div className="reset-buttons">
            <button
              type="button"
              className="reset-button soft-reset"
              onClick={() => {
                setResetMode('soft');
                setShowResetModal(true);
              }}
            >
              Очистить форму
            </button>
            
            <button
              type="button"
              className="reset-button hard-reset"
              onClick={() => {
                setResetMode('hard');
                setShowResetModal(true);
              }}
            >
              Полная очистка
            </button>
          </div>
        </div>
      </form>

      {/* Модальное окно подтверждения очистки */}
      {showResetModal && (
        <div className="modal-overlay" onClick={() => setShowResetModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Подтвердите действие</h3>
            <p>
              {resetMode === 'soft'
                ? "Вы уверены, что хотите очистить все незакреплённые поля?"
                : "Вы уверены, что хотите полностью очистить форму, включая закреплённые секции?"}
            </p>
            <div className="modal-actions">
              <button
                className="confirm-button"
                onClick={handleResetConfirm}
              >
                Подтвердить
              </button>
              <button
                className="cancel-button"
                onClick={() => setShowResetModal(false)}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormModePage;