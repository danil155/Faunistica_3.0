import { createContext, useContext, useState, useEffect } from 'react';

const FormContext = createContext(undefined);

export const defaultState = {
  abu_ind_rem: '',
  country: '',
  region: '',
  district: '',
  gathering_place: '',
  is_new_species: false,
  coordinate_north: '',
  coordinate_east: '',
  grads_north: '',
  grads_east: '',
  mins_north: '',
  mins_east: '',
  secs_north: '',
  secs_east: '',
  coordinate_format: 'grads',
  geo_origin: '',
  geo_uncert: '',
  adm_verbatim: null,
  geo_REM: '',
  place_notes: '',
  begin_year: 0,
  begin_month: 0,
  end_year: 0,
  end_month: 0,
  begin_date: '',
  end_date: '',
  eve_day_def: true,
  eve_REM: '',
  biotope: '',
  collector: '',
  measurement_units: '',
  selective_gain: '',
  matherial_notes: '',
  taxonomic_notes: '',
  family: '',
  genus: '',
  species: '',
  tax_nsp: null,
  tax_sp_def: null,
  type_status: null,
  specimens: {}
};

export const fieldsMap = {
  "Административное положение": ["country", "region", "district", "gathering_place", "place_notes", "adm_verbatim"],
  "Географическое положение": ["east", "north", "coordinate_north", "coordinate_east", "grads_north", "grads_east", "mins_north", "mins_east", "secs_east", "secs_north", "geo_origin", "geo_REM", "geo_uncert"],
  "Сбор материала": [
    "begin_date",
    "end_date",
    "begin_year",
    "end_year",
    "begin_month",
    "end_month",
    "end_day",
    "begin_day",
    "biotope",
    "collector",
    "measurement_units",
    "selective_gain",
    "eve_REM"
  ],
  'Таксономия': ["family", "genus", "species", "taxonomic_notes", "tax_sp_def", "tax_nsp", "type_status"],
};

export const FormProvider = ({ children }) => {
  const [formState, setFormState] = useState(() => {
    const saved = localStorage.getItem('formData');
    const parsed = saved ? JSON.parse(saved) : defaultState;
    return {
      ...defaultState,
      ...parsed,
      specimens: parsed.specimens || {}
    };
  });

  const [pinnedSections, setPinnedSections] = useState(() => {
    const saved = localStorage.getItem('pinnedSections');
    return saved ? JSON.parse(saved) : {};
  });

  const [collapsedSections, setCollapsedSections] = useState(() => {
    const saved = localStorage.getItem('collapsedSections');
    return saved ? JSON.parse(saved) : {};
  });

  // Функция сброса формы
  const resetForm = (keepPinned = true) => {
    if (keepPinned) {
      // Создаем объект с полями, которые нужно сохранить
      const fieldsToKeep = Object.entries(pinnedSections)
          .filter(([_, isPinned]) => isPinned) // Берем только закрепленные секции
          .reduce((acc, [sectionName]) => {
            // Добавляем все поля из закрепленной секции
            const sectionFields = fieldsMap[sectionName] || [];
            sectionFields.forEach(field => {
              // Сохраняем текущее значение поля, если оно есть в formState
              if (formState.hasOwnProperty(field)) {
                acc[field] = formState[field];
              }
            });
            return acc;
          }, {});


      setFormState({
        ...defaultState, // Сначала берем значения по умолчанию
        ...fieldsToKeep // Затем перезаписываем сохраненными полями
      });
    } else {
      // Полный сброс
      setFormState(defaultState);
      setPinnedSections({});
    }
  };

  const toggleCollapseSection = (sectionName) => {
    setCollapsedSections(prev => {
      const newState = { ...prev, [sectionName]: !prev[sectionName] };
      localStorage.setItem('collapsedSections', JSON.stringify(newState));
      return newState;
    });
  };

  // Сохранение в localStorage
  useEffect(() => {
    localStorage.setItem('formData', JSON.stringify(formState));
    localStorage.setItem('pinnedSections', JSON.stringify(pinnedSections));
  }, [formState, pinnedSections]);

  return (
      <FormContext.Provider
          value={{
            formState,
            setFormState,
            pinnedSections,
            setPinnedSections,
            resetForm,
            collapsedSections,
            toggleCollapseSection
          }}
      >
        {children}
      </FormContext.Provider>
  );
};

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
};