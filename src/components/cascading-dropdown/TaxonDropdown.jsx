import { Autocomplete, TextField } from "@mui/material";
import React, { useMemo, useState } from "react";
import { useTranslation } from 'react-i18next';
import { useFormContext } from "../../pages/FormContext";
import { apiService } from "../../api";

const TaxonDropdown = ({ isDefined = true, isInList = true, debounceTime = 300, isDisabled }) => {
    const { t } = useTranslation('taxonDropdown');
    const { formState, setFormState, pinnedSections } = useFormContext();
    const [loading, setLoading] = useState(false);

    const levels = [
        { name: 'family', placeholder: t("placehold_fam"), heading: t("family") },
        { name: 'genus', placeholder: t("placehold_gen"), heading: t("genus") },
        { name: 'species', placeholder: t("placehold_sp"), heading: t("species") }
    ];

    const [options, setOptions] = useState({
        family: [],
        genus: [t("undefined")],
        species: [t("undefined")]
    });

    const [inputValues, setInputValues] = useState({
        family: '',
        genus: '',
        species: '',
    });

    const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func(...args), delay);
        };
    };
    
    const toArray = (val) => Array.isArray(val) ? val : [val];

    const fetchWithFilters = useMemo(() => debounce(async (fieldName, searchText) => {
        if (searchText.length < 2) {
            setOptions(prev => ({ ...prev, [fieldName]: [] }));
            return;
        }

        setLoading(true);
        try {
            const filters = {
                family: null,
                genus: null
            };

            if (fieldName === 'genus') {
                filters.family = formState.family;
            }
            if (fieldName === 'species') {
                filters.family = formState.family;
                filters.genus = formState.genus;
            }
            const data = await apiService.suggestTaxon({
                field: fieldName,
                text: searchText,
                filters: filters
            });
            if (fieldName === 'family') {
                setOptions(prev => ({
                    ...prev,
                    [fieldName]: (data?.suggestions || []).filter(Boolean)
                }));
            } else {
                const opt = [t("undefined")].concat((data?.suggestions || []).filter(Boolean));
                setOptions(prev => ({ ...prev, [fieldName]: opt }));
            }
        } finally {
            setLoading(false);
        }
    }, debounceTime), [debounceTime, formState.family, formState.genus]);

    const updateField = (fieldName, value) => {
        if (value === t("undefined")) {
            setFormState(prev => ({
                ...prev,
                [fieldName]: "unknown"
            }));
        } else {
            setFormState(prev => ({
                ...prev,
                [fieldName]: value
            }));
        }
    };

    const autoUpdate = useMemo(() => debounce(async (fieldName, option) => {
        try {
            const autofillResult = await apiService.autofillTaxon(fieldName, option);

            if (autofillResult.family) {
                updateField('family', autofillResult.family);
            }

            if (autofillResult.genus) {
                updateField('genus', autofillResult.genus);
            }

            if (fieldName === 'family') {
                if (formState.genus || formState.species) {
                    updateField('genus', '');
                    updateField('species', '');
                    setOptions({ family: toArray(autofillResult.family), genus: [], species: [] });
                }
            } else if (fieldName === 'genus') {
                if (formState.species) {
                    updateField('species', '');
                    setOptions(prev => ({ ...prev, genus: toArray(autofillResult.genus), species: [] }));
                }
            }
        } catch (e) {
            console.error("Error in autoUpdate:", e);
        }
    }, debounceTime), [formState.genus, formState.species, isInList]);

    return (
        <div className="form-group dropdown-container">
            {levels.map((level) => (
                <div key={level.name} className="input-group">
                    <label htmlFor={level.name}>
                        {level.heading}:
                    </label>
                    {!isInList ? (
                        <Autocomplete
                            filterOptions={(x) => x}
                            onChange={(event, newValue) => {
                                if (newValue) {
                                    autoUpdate(level.name, newValue);
                                }
                                updateField(level.name, newValue);
                            }}
                            getOptionLabel={(option) => (option ? option.toString() : "")}
                            onInputChange={(_, input, reason) => {
                                if (reason === "clear" || reason === "removeOption" || reason === "reset") {
                                    setInputValues({ ...inputValues, [level.name]: "" });
                                } else if (!options[level.name].includes(input)) {
                                    setInputValues({ ...inputValues, [level.name]: input });
                                    fetchWithFilters(level.name, input);
                                }
                            }}
                            autoSelect={true}
                            value={formState[level.name] === "unknown" ? t("undefined") : formState[level.name]}
                            autoHighlight={true}
                            id={level.name}
                            options={options[level.name]}
                            loading={loading}
                            disabled={level.name === "species" || isDisabled ? isDefined || isDisabled : false}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder={level.name === "species" && isDefined ? t("undefined") : level.placeholder}
                                    size="small"
                                    required={level.name !== "species" || !isDefined}
                                />
                            )}
                        />
                    ) : (
                        <TextField
                            size="small"
                            id={level.name}
                            value={formState[level.name]}
                            disabled={level.name === "species" || isDisabled ? isDefined || isDisabled : false}
                            onChange={(e) => {
                                updateField(level.name, e.target.value)}}
                            placeholder={`${t("input")} ${level.heading.toLowerCase()}`}
                            fullWidth
                            required={true}
                        />
                    )}
                </div>
            ))}
        </div>
    );
};

export default TaxonDropdown;