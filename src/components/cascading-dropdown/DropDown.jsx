import React, { useState, useCallback} from "react";
import { useFormContext } from "../../pages/FormContext";
import {apiService} from "../../api";

export function DropDown({debounceTime = 300}) {
    const {setFormState} = useFormContext();
    const updateField = (fieldName, value) => {
        setFormState(prev => ({
            ...prev,
            [fieldName]: value
        }));
    };

    const levels = [
        { name: 'family', placeholder: 'Start typing family...' },
        { name: 'genus', placeholder: 'Start typing genus...' },
        { name: 'species', placeholder: 'Start typing species...' }
    ];

    // Состояния
    const [selected, setSelected] = useState({
        family: null,
        genus: null,
        species: null
    });

    const [inputValues, setInputValues] = useState({
        family: '',
        genus: '',
        species: ''
    });

    const [options, setOptions] = useState({
        family: [],
        genus: [],
        species: []
    });

    const [activeDropdown, setActiveDropdown] = useState(null);
    const [loading, setLoading] = useState(false);

    // Debounce функция
    const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func(...args), delay);
        };
    };

    // Запрос данных
    const fetchWithFilters = useCallback(
        debounce(async (fieldName, searchText) => {
            if (searchText.length < 2) {
                setOptions(prev => ({ ...prev, [fieldName]: [] }));
                return;
            }

            setLoading(true);
            try {
                // Формируем фильтры на основе предыдущих выборов
                const filters = {};
                if (fieldName === 'genus' && selected.family) {
                    filters.family = selected.family.id;
                }
                if (fieldName === 'species' && selected.genus) {
                    filters.genus = selected.genus.id;
                }

                const data = await apiService.suggestTaxon({
                    field: fieldName,
                    text: searchText,
                    filters: filters
                });
                setOptions(prev => ({ ...prev, [fieldName]: data }));
            } finally {
                setLoading(false);
            }
        }, debounceTime),
        [selected.family, selected.genus]
    );

    // Обработчики событий
    const handleInputChange = (fieldName, value) => {
        setInputValues(prev => ({ ...prev, [fieldName]: value }));
        fetchWithFilters(fieldName, value);
    };

    const handleSelect = (fieldName, option) => {
        updateField(fieldName, option);

        // Обновляем локальное состояние
        setInputValues(prev => ({
            ...prev,
            [fieldName]: option.name,
            // Сбрасываем последующие поля
            ...(fieldName === 'family' && { genus: '', species: '' }),
            ...(fieldName === 'genus' && { species: '' })
        }));

        // Сбрасываем выбранные значения для зависимых полей
        if (fieldName === 'family') {
            updateField('genus', '');
            updateField('species', '');
        } else if (fieldName === 'genus') {
            updateField('species', '');
        }

        setActiveDropdown(null);
    };

    const isFieldDisabled = (fieldName) => {
        if (fieldName === 'genus') return !selected.family;
        if (fieldName === 'species') return !selected.genus;
        return false;
    };

    return (
        <div className="taxonomic-dropdown">
            {levels.map(level => (
                <div key={level.name} className="taxonomic-level">
                    <input
                        value={inputValues[level.name]}
                        onChange={(e) => handleInputChange(level.name, e.target.value)}
                        placeholder={level.placeholder}
                        disabled={isFieldDisabled(level.name)}
                        onClick={() => setActiveDropdown(level.name)}
                    />

                    {activeDropdown === level.name && options[level.name].length > 0 && (
                        <div className="dropdown-list">
                            {options[level.name].map(option => (
                                <div
                                    key={option.id}
                                    onClick={() => handleSelect(level.name, option)}
                                >
                                    {option.name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}

            {loading && <div className="loading">Loading...</div>}
        </div>
    );
  }