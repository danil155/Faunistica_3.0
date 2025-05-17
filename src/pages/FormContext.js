import { createContext, useContext, useState, useEffect } from 'react';

const FormContext = createContext();

export const defaultState = {
  country: '',
  region: '',
  district: '',
  gathering_place: '',
  coordinate_north: '',
  coordinate_east: '',
  grads_north: '',
  grads_east: '',
  mins_north: '',
  mins_east: '',
  secs_north: '',
  secs_east: '',
  geo_origin: '',
  geo_uncert: 0,
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

  const [pinnedData, setPinnedData] = useState(() => {
    const saved = localStorage.getItem('pinnedData');
    return saved ? JSON.parse(saved) : {};
  });

  const [collapsedSections, setCollapsedSections] = useState(() => {
    const saved = localStorage.getItem('collapsedSections');
    return saved ? JSON.parse(saved) : {};
  });

  // Функция сброса формы
  const resetForm = (keepPinned = true) => {

    if (keepPinned) {
      // Сохраняем закреплённые данные
      const pinnedValues = Object.values(pinnedData).reduce((acc, section) => {
        return { ...acc, ...section };
      }, {});
      setFormState({ ...defaultState, ...pinnedValues });
    } else {
      // Полный сброс
      setFormState(defaultState);
      setPinnedSections({});
      setPinnedData({});
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
    localStorage.setItem('pinnedData', JSON.stringify(pinnedData));
  }, [formState, pinnedSections, pinnedData]);

  return (
      <FormContext.Provider
          value={{
            formState,
            setFormState,
            pinnedSections,
            setPinnedSections,
            pinnedData,
            setPinnedData,
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