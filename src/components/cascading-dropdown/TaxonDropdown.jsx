import {Autocomplete, TextField} from "@mui/material";
import React, {useMemo, useState} from "react";
import {useFormContext} from "../../pages/FormContext";
import {apiService} from "../../api";

const TaxonDropdown = ({isDefined=true, isInList=true, debounceTime = 300}) => {
    const { formState, setFormState } = useFormContext();
    const [loading, setLoading] = useState(false);

    const levels = [
        { name: 'family', placeholder: 'Начните печатать семейство...', heading: 'Семейство' },
        { name: 'genus', placeholder: 'Начните печатать род...', heading: 'Род' },
        { name: 'species', placeholder: 'Начните печатать вид...', heading: 'Вид' }
    ];

    const [options, setOptions] = useState({
        family: [],
        genus: [],
        species: []
    });

    const [inputValues, setInputValues] = useState({
        family: '',
        genus: '',
        species: '',
    })

    const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func(...args), delay);
        };
    };

    const fetchWithFilters = useMemo(() => debounce(async (fieldName, searchText) => {
        if (searchText.length < 2) {
            setOptions(prev => ({ ...prev, [fieldName]: [] }));
            return;
        }

        setLoading(true);
        try {
            console.log("send!")
            const filters = {
                family: null,
                genus: null
            };
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
            setOptions(prev => ({ ...prev, [fieldName]: data?.suggestions || [] }));
            console.log(data);
        } finally {
            setLoading(false);
        }
    }, debounceTime), [debounceTime, formState.family, formState.genus, isInList]);

    const updateField = (fieldName, value) => {
        setFormState(prev => ({
            ...prev,
            [fieldName]: value
        }));
    };

    const autoUpdate = useMemo(() => debounce(async (fieldName, option) => {
        try {
            const autofillResult = await apiService.autofillTaxon(fieldName, option);
            console.log(autofillResult)

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
                    setOptions({family: autofillResult.family, genus: [], species: [] });
                }
            } else if (fieldName === 'genus') {
                if (formState.species) {
                    updateField('species', '');
                    setOptions(prev => ({ ...prev, genus: autofillResult.genus, species: [] }));
                }
            }
        } catch (e) {
            new Error("uwu")
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
                            sx={{
                                p: 0
                            }}
                            filterOptions={(x) => x}
                            onChange={(event, newValue) => {
                                if (newValue) {
                                    autoUpdate(level.name, newValue);
                                }
                                updateField(level.name, newValue);
                            }}
                            onInputChange={(_, input, reason) => {
                                if (reason === "clear" || reason === "removeOption" || reason === "reset") {
                                    setInputValues({...inputValues, [level.name]: ""});
                                } else if (!options[level.name].includes(input)) {
                                    setInputValues({...inputValues, [level.name]: input});
                                    fetchWithFilters(level.name, input);
                                    console.log(input)
                                }
                            }}
                            autoSelect={true}
                            value={formState[level.name]}
                            autoHighlight={true}
                            id={level.name}
                            options={options[level.name]}
                            loading={loading}
                            disabled={isDefined}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder={isDefined ? "Не определено" : level.placeholder}
                                    size="small"
                                />
                            )}
                        />
                    ) : (
                        <TextField
                            size="small"
                            id={level.name}
                            value={formState[level.name]?.name || ''}
                            onChange={(e) => {
                                updateField(level.name, {name: e.target.value});
                            }}
                            placeholder={`Введите ${level.heading.toLowerCase()}`}
                            disabled={isDefined}
                            fullWidth
                        />
                    )}
                </div>
            ))}
        </div>
    )
}

export default TaxonDropdown;