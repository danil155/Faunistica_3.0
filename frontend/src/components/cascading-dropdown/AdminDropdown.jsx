import { Autocomplete, TextField } from "@mui/material";
import React, { useMemo, useState } from "react";
import { useTranslation } from 'react-i18next';
import { useFormContext } from "../../pages/FormContext";
import { apiService } from "../../api";
import "./dropdown.css";

const TaxonDropdown = ({isDefined = true, isInList = true, debounceTime = 300, isDisabled}) => {
    const {t} = useTranslation('adminDropdown');
    const {formState, setFormState, validationErrors, setValidationErrors} = useFormContext();
    const [loading, setLoading] = useState(false);

    const levels = [
        {name: 'country', placeholder: t("placehold_cou"), heading: t("country")},
        {name: 'region', placeholder: t("placehold_reg"), heading: t("region")},
        {name: 'district', placeholder: t("placehold_dis"), heading: t("district")}
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

    const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func(...args), delay);
        };
    };

    const fetchWithFilters = useMemo(() => debounce(async (fieldName, searchText) => {
        if (searchText.length < 1) {
            setOptions(prev => ({...prev, [fieldName]: []}));
            return;
        }

        setLoading(true);
        try {
            const filters = {
                country: null,
                region: null
            };

            if (fieldName === 'region') {
                // filters.country = formState.country;
            }
            if (fieldName === 'district') {
                // filters.country = formState.country;
                filters.region = formState.region;
            }
            const data = await apiService.suggestGeo({
                field: fieldName,
                text: searchText,
                filters: filters
            });
            setOptions(prev => ({
                ...prev,
                [fieldName]: (data?.suggestions || []).filter(Boolean)
            }));
        } finally {
            setLoading(false);
        }
    }, debounceTime), [debounceTime, formState.region]);

    const updateField = (fieldName, value) => {
        setFormState(prev => ({
            ...prev,
            [fieldName]: value
        }));
    };

    return (
        <div className="form-group dropdown-container">
            {levels.map((level) => (
                <div key={level.name} className={`input-group ${validationErrors[level.name] ? "error" : ""}`}>
                    <label htmlFor={level.name}>
                        {level.heading}:<span>{validationErrors[level.name] ? "*":""}</span>
                    </label>
                    <Autocomplete
                        freeSolo
                        filterOptions={(x) => x}
                        getOptionLabel={(option) => (option ? option.toString() : "")}
                        onChange={(event, newValue) => {
                            updateField(level.name, newValue);
                            if (newValue?.length > 0) {
                                setValidationErrors(prev => ({ ...prev, [level.name]: ''
                                }));
                            }
                        }}
                        onInputChange={(_, input, reason) => {
                            if (reason === "clear" || reason === "removeOption" || reason === "reset") {
                                setInputValues({...inputValues, [level.name]: ""});
                            } else if (!options[level.name].includes(input) && level.name !== "country") {
                                setInputValues({...inputValues, [level.name]: input});
                                fetchWithFilters(level.name, input);
                            }
                        }}
                        autoSelect={true}
                        value={formState[level.name]}
                        autoHighlight={true}
                        id={level.name}
                        options={options[level.name]}
                        loading={loading}
                        disabled={isDisabled}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                placeholder={level.placeholder}
                                size="small"
                            />
                        )}

                    />
                    {validationErrors?.[level.name] && (
                        <span className="no-data">{validationErrors[level.name]}</span>
                    )}
                </div>
            ))}
        </div>
    );
};

export default TaxonDropdown;