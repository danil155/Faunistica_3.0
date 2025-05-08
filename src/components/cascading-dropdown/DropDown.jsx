import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useFormContext } from "../../pages/FormContext";
import { apiService } from "../../api";
import "./dropdown.css";

export function DropDown({ debounceTime = 300 }) {
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

    // Эффект для закрытия dropdown при клике вне элемента
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

    const fetchWithFilters = useCallback(
        useMemo(() => debounce(async (fieldName, searchText) => {
            if (searchText.length < 2) {
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
        }, debounceTime), [debounceTime, formState.family, formState.genus]),
        [debounceTime, formState.family, formState.genus]
    );

    const handleInputChange = (fieldName, value) => {
        setInputValues(prev => ({ ...prev, [fieldName]: value }));
        setActiveDropdown(fieldName);
        fetchWithFilters(fieldName, value);
    };

    const handleSelect = async (fieldName, option) => {
        updateField(fieldName, option);
        setInputValues(prev => ({
            ...prev,
            [fieldName]: option
        }));

        let autofillField = '';
        if (fieldName === 'genus') autofillField = 'genus';
        else if (fieldName === 'species') autofillField = 'species';

        if (autofillField) {
            const autofillResult = await apiService.autofillTaxon(autofillField, option);

            if (autofillResult.family) {
                updateField('family', autofillResult.family);
                setInputValues(prev => ({ ...prev, family: autofillResult.family }));
            }

            if (autofillResult.genus) {
                updateField('genus', autofillResult.genus);
                setInputValues(prev => ({ ...prev, genus: autofillResult.genus }));
            }
        }

        if (fieldName === 'family') {
            if (formState.genus || formState.species) {
                updateField('genus', null);
                updateField('species', null);
                setInputValues(prev => ({ ...prev, genus: '', species: '' }));
                setOptions(prev => ({ ...prev, genus: [], species: [] }));
            }
        } else if (fieldName === 'genus') {
            if (formState.species) {
                updateField('species', null);
                setInputValues(prev => ({ ...prev, species: '' }));
                setOptions(prev => ({ ...prev, species: [] }));
            }
        }

        setActiveDropdown(null);
    };


    const isFieldDisabled = (fieldName) => {
        // if (fieldName === 'genus') return !formState.family;
        // if (fieldName === 'species') return !formState.genus;
        return false;
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
                            value={inputValues[level.name]}
                            onChange={(e) => handleInputChange(level.name, e.target.value)}
                            placeholder={level.placeholder}
                            disabled={isFieldDisabled(level.name)}
                            onFocus={() => setActiveDropdown(level.name)}
                        />

                        {activeDropdown === level.name && (
                            <div className="dropdown-menu">
                                {loading ? (
                                    <div className="dropdown-item">Loading...</div>
                                ) : options[level.name].length > 0 ? (
                                    options[level.name].map(option => (
                                        <div
                                            key={option}
                                            className="dropdown-item"
                                            onClick={() => handleSelect(level.name, option)}
                                        >
                                            {option}
                                        </div>
                                    ))
                                ) : (
                                    inputValues[level.name].length >= 2 &&
                                    <div className="dropdown-item no-results">No results found</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}