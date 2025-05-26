import { createContext, useContext, useState, useEffect } from 'react';
import i18n from 'i18next';

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

const SECTION_KEYS = {
    ADMIN: 'administrative',
    GEO: 'geographical',
    MATERIAL: 'material_collection',
    TAXONOMY: 'taxonomy'
};

export const fieldsMap = {
    [SECTION_KEYS.ADMIN]: ["country", "region", "district", "gathering_place", "place_notes", "adm_verbatim"],
    [SECTION_KEYS.GEO]: ["east", "north", "coordinate_north", "coordinate_east", "grads_north", "grads_east", "mins_north", "mins_east", "secs_east", "secs_north", "geo_origin", "geo_REM", "geo_uncert"],
    [SECTION_KEYS.MATERIAL]: [
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
    [SECTION_KEYS.TAXONOMY]: ["family", "genus", "species", "taxonomic_notes", "tax_sp_def", "tax_nsp", "type_status"],
};

export const FormProvider = ({children, initialState, isEditMode = false}) => {
    {
        i18n.t(`FormContext.sections.${SECTION_KEYS.ADMIN}`)
    }
    const [formState, setFormState] = useState(() => {
        if (initialState) return initialState;
        if (!isEditMode) {
            const saved = localStorage.getItem('formData');
            return saved ? JSON.parse(saved) : defaultState;
        }
        return defaultState;
    });

    const keyMap = {
        "Административное положение": "administrative",
        "Географическое положение": "geographical",
        "Сбор материала": "material_collection",
        "Таксономия": "taxonomy"
    };

    const allowedNewKeys = Object.values(keyMap);

    const [pinnedSections, setPinnedSections] = useState(() => {
        const saved = localStorage.getItem('pinnedSections');
        let newData = {};
        if (saved) {
            const data = JSON.parse(saved);

            for (const [oldKey, newKey] of Object.entries(keyMap)) {
                if (Object.prototype.hasOwnProperty.call(data, newKey)) {
                    newData[newKey] = data[newKey];
                } else if (Object.prototype.hasOwnProperty.call(data, oldKey)) {
                    newData[newKey] = data[oldKey];
                }
            }
        }
        localStorage.setItem('pinnedSections', JSON.stringify(newData));
        const finalData = localStorage.getItem('pinnedSections');
        return finalData ? JSON.parse(finalData) : {};
    });

    const [collapsedSections, setCollapsedSections] = useState(() => {
        const saved = localStorage.getItem('collapsedSections');
        let newData = {};
        if (saved) {
            const data = JSON.parse(saved);

            for (const [oldKey, newKey] of Object.entries(keyMap)) {
                if (Object.prototype.hasOwnProperty.call(data, newKey)) {
                    newData[newKey] = data[newKey];
                } else if (Object.prototype.hasOwnProperty.call(data, oldKey)) {
                    newData[newKey] = data[oldKey];
                }
            }
        }
        localStorage.setItem('collapsedSections', JSON.stringify(newData));
        const finalData = localStorage.getItem('collapsedSections');
        return finalData ? JSON.parse(finalData) : {};
    });

    const resetForm = (keepPinned = true) => {
        if (keepPinned) {
            const fieldsToKeep = Object.entries(pinnedSections)
                .filter(([_, isPinned]) => isPinned)
                .reduce((acc, [sectionName]) => {
                    const sectionFields = fieldsMap[sectionName] || [];
                    sectionFields.forEach(field => {
                        if (formState.hasOwnProperty(field)) {
                            acc[field] = formState[field];
                        }
                    });
                    return acc;
                }, {});


            setFormState({
                ...defaultState,
                ...fieldsToKeep
            });
        } else {
            setFormState(defaultState);
            setPinnedSections({});
        }
    };

    const toggleCollapseSection = (sectionName) => {
        setCollapsedSections(prev => {
            const newState = {...prev, [sectionName]: !prev[sectionName]};
            localStorage.setItem('collapsedSections', JSON.stringify(newState));
            return newState;
        });
    };

    useEffect(() => {
        if (!isEditMode) {
            localStorage.setItem('formData', JSON.stringify(formState));
        }
        localStorage.setItem('pinnedSections', JSON.stringify(pinnedSections));
    }, [formState, pinnedSections, collapsedSections, isEditMode]);

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