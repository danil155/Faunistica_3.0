import React, { useState, useEffect, useMemo } from "react";
import {Autocomplete, debounce, TextField} from "@mui/material";
import { useFormContext } from "../../pages/FormContext";
import { apiService } from "../../api";

const AdminDropdown = ({ debounceTime = 300 }) => {
    const { formState, setFormState, pinnedSections } = useFormContext();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const levels = [
        { name: 'country', placeholder: 'Начните вводить страну...', heading: 'Страна' },
        { name: 'region', placeholder: 'Начните вводить регион...', heading: 'Регион' },
        { name: 'district', placeholder: 'Начните вводить район...', heading: 'Район' }
    ];

    const [options, setOptions] = useState({
        country: [],
        region: [],
        district: []
    });

    const [inputValues, setInputValues] = useState({
        country: '',
        region: '',
        district: '',
    });

    const fetchAdminSuggestions = async (fieldName, searchText, parentId = null) => {
        if (searchText.length < 2) {
            setOptions(prev => ({ ...prev, [fieldName]: [] }));
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = await apiService.suggestGeo({
                query: searchText,
                location_type: fieldName,
                parent_id: parentId
            });

            if (!data || !data.suggestions) {
                throw new Error('Invalid API response format');
            }

            setOptions(prev => ({
                ...prev,
                [fieldName]: data.suggestions.map(item => item.name)
            }));
        } catch (err) {
            console.error("Failed to fetch admin suggestions:", err);
            setError("Не удалось загрузить данные. Попробуйте позже.");
            setOptions(prev => ({ ...prev, [fieldName]: [] }));
        } finally {
            setLoading(false);
        }
    };

    const debouncedFetch = useMemo(
        () => debounce(fetchAdminSuggestions, debounceTime),
        [debounceTime]
    );

    const updateField = (fieldName, value) => {
        setFormState(prev => ({
            ...prev,
            [fieldName]: value
        }));

        // Сбрасываем дочерние поля при изменении родительского
        if (fieldName === 'country') {
            setFormState(prev => ({
                ...prev,
                region: '',
                district: ''
            }));
            setOptions(prev=> ({
                ...prev,
                region: [],
                district: []
            }));
        } else if (fieldName === 'region') {
            setFormState(prev => ({
                ...prev,
                district: ''
            }));
            setOptions(prev=> ({
                ...prev,
                district: []
            }));
        }
    };

    useEffect(() => {
        if (formState.country && inputValues.region) {
            fetchAdminSuggestions('region', inputValues.region, formState.country);
        }
    }, [formState.country, inputValues.region]);

    useEffect(() => {
        if (formState.region && inputValues.district) {
            const regionCode = options.region.findIndex(r => r === formState.region) + 1;
            fetchAdminSuggestions('district', inputValues.district, `${formState.country}.${regionCode}`);
        }
    }, [formState.country, formState.region, inputValues.district, options.region]);

    return (
        <div className="form-group dropdown-container">
            {error && <div className="error-message">{error}</div>}

            {levels.map((level) => (
                <div key={level.name} className="input-group">
                    <label htmlFor={level.name}>
                        {level.heading}:
                    </label>
                    <Autocomplete
                        freeSolo
                        filterOptions={(x) => x}
                        onChange={(event, newValue) => {
                            updateField(level.name, newValue);
                        }}
                        onInputChange={(_, input, reason) => {
                            if (reason === "input") {
                                let parentId = null;
                                if (level.name === 'region' && formState.country) {
                                    parentId = formState.country;
                                } else if (level.name === 'district' && formState.region) {
                                    const regionObj = options.region?.find(r => r.name === formState.region);

                                    if (regionObj) {
                                        parentId = regionObj.id;
                                    }
                                }
                                debouncedFetch(level.name, input, parentId);
                            }
                        }}
                        value={formState[level.name] || ""}
                        options={options[level.name]}
                        loading={loading}
                        disabled={pinnedSections["Административное положение"]}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                placeholder={level.placeholder}
                                size="small"
                                required={level.name === 'country' || level.name === 'region'}
                                error={!!error}
                                helperText={error}
                            />
                        )}
                    />
                </div>
            ))}
        </div>
    );
};

export default AdminDropdown;