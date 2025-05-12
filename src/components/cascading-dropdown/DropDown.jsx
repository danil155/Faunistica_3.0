import React, { useState, useMemo, useRef, useEffect } from "react";
import { useFormContext } from "../../pages/FormContext";
import { apiService } from "../../api";
import "./dropdown.css";

export function DropDown({ allowFreeInput, debounceTime = 300 }) {
    const { formState, setFormState } = useFormContext();
    const dropdownRefs = useRef({});

    const updateField = (fieldName, value) => {
        setFormState(prev => ({
            ...prev,
            [fieldName]: value
        }));
    };

    const levels = [
        { name: 'family', placeholder: 'Начните печатать семейство...', heading: 'Семейство:' },
        { name: 'genus', placeholder: 'Начните печатать род...', heading: 'Род:' },
        { name: 'species', placeholder: 'Начните печатать вид...', heading: 'Вид:' }
    ];

    const [options, setOptions] = useState({
        family: [],
        genus: [],
        species: []
    });

    const [activeDropdown, setActiveDropdown] = useState(null);
    const [loading, setLoading] = useState(false);
    const [missingInList, setMissingInList] = useState({
        family: false,
        genus: false,
        species: false
    });

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (activeDropdown && !dropdownRefs.current[activeDropdown]?.contains(event.target)) {
                setActiveDropdown(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [activeDropdown]);

    const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func(...args), delay);
        };
    };

    const fetchWithFilters = useMemo(() => debounce(async (fieldName, searchText) => {
        if (searchText.length < 2 || missingInList[fieldName]) {
            setOptions(prev => ({ ...prev, [fieldName]: [] }));
            return;
        }

        setLoading(true);
        try {
            const filters = {};
            if (fieldName === 'genus' && formState.family) {
                filters.family = formState.family.id;
            }
            if (fieldName === 'species' && formState.genus) {
                filters.genus = formState.genus.id;
            }

            const data = await apiService.suggestTaxon({
                field: fieldName,
                text: searchText,
                filters: filters
            });
            setOptions(prev => ({ ...prev, [fieldName]: data?.suggestions }));
        } finally {
            setLoading(false);
        }
    }, debounceTime), [debounceTime, formState.family, formState.genus]);

    const handleInputChange = (fieldName, value) => {
        updateField(fieldName, value);

        if (allowFreeInput || missingInList[fieldName]) {
            // При свободном вводе или если выбрано "missing"


            // Если пользователь начал редактировать поле с "missing"
            if (missingInList[fieldName] && value !== "") {
                setMissingInList(prev => ({ ...prev, [fieldName]: false }));
                setActiveDropdown(fieldName);
                fetchWithFilters(fieldName, value);
            }
        } else {
            // При выборе из списка показываем предложения
            setActiveDropdown(fieldName);
            fetchWithFilters(fieldName, value);
        }
    };

    const handleSelect = async (fieldName, option) => {
        if (option === "missing") {
            // 1. Сначала обновляем missingInList
            const newMissingState = { ...missingInList, [fieldName]: true };
            setMissingInList(newMissingState);

            // 2. Затем очищаем значение в форме
            updateField(fieldName, "");

            // 3. Закрываем дропдаун
            setActiveDropdown(null);

            console.log("Missing selected for", fieldName, "New state:", newMissingState);
            return;
        }

        // Обычный выбор значения
        setMissingInList(prev => ({ ...prev, [fieldName]: false }));
        updateField(fieldName, option);
        setActiveDropdown(null);

        let autofillField = '';
        if (fieldName === 'genus') autofillField = 'genus';
        else if (fieldName === 'species') autofillField = 'species';

        if (autofillField) {
            const autofillResult = await apiService.autofillTaxon(autofillField, option);

            if (autofillResult.family) {
                updateField('family', autofillResult.family);
            }

            if (autofillResult.genus) {
                updateField('genus', autofillResult.genus);
            }
        }

        if (fieldName === 'family') {
            if (formState.genus || formState.species) {
                updateField('genus', '');
                updateField('species', '');
                setOptions(prev => ({ ...prev, genus: [], species: [] }));
                setMissingInList(prev => ({ ...prev, genus: false, species: false }));
            }
        } else if (fieldName === 'genus') {
            if (formState.species) {
                updateField('species', '');
                setOptions(prev => ({ ...prev, species: [] }));
                setMissingInList(prev => ({ ...prev, species: false }));
            }
        }

        setActiveDropdown(null);
    };

    return (
        <div className="form-group dropdown-container">
            {levels.map((level) => (
                <div
                    key={level.name}
                    className="dropdown-group"
                    ref={el => dropdownRefs.current[level.name] = el}
                >
                    <label htmlFor={`input-${level.name}`}>{level.heading}</label>
                    <div className="dropdown-wrapper">
                        <input
                            className="dropdown-input text-input"
                            id={`input-${level.name}`}
                            value={ formState[level.name]}
                            onChange={(e) => handleInputChange(level.name, e.target.value)}
                            placeholder={level.placeholder}
                            onFocus={() => !allowFreeInput && !missingInList[level.name] && setActiveDropdown(level.name)}
                        />

                        {!allowFreeInput && !missingInList[level.name] && activeDropdown === level.name && (
                            <div className="dropdown-menu">
                                {loading ? (
                                    <div className="dropdown-item">Loading...</div>
                                ) : options[level.name].length > 0 ? (
                                    <>
                                        {options[level.name].map(option => (
                                            <div
                                                key={option}
                                                className="dropdown-item"
                                                onClick={() => handleSelect(level.name, option)}
                                            >
                                                {option}
                                            </div>
                                        ))}
                                        <div
                                            className="dropdown-item missing-item"
                                            onClick={() => handleSelect(level.name, "missing")}
                                        >
                                            missing
                                        </div>
                                    </>
                                ) : (
                                    formState[level.name].length >= 2 && (
                                        <>
                                            <div className="dropdown-item no-results">No results found</div>
                                            <div
                                                className="dropdown-item missing-item"
                                                onClick={() => handleSelect(level.name, "missing")}
                                            >
                                                missing
                                            </div>
                                        </>
                                    )
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}