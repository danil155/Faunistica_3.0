import {Autocomplete,TextField} from "@mui/material";
import React, {useMemo, useState} from "react";
import {useFormContext} from "../../pages/FormContext";
import {apiService} from "../../api";

const TaxonDropdown = ({isDefined=true, debounceTime = 300}) => {
    const { formState, setFormState } = useFormContext();
    const [loading, setLoading] = useState(false);

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

    const [inputValues, setInputValues] = useState({
        family: '',
        genus: '',
        species: '',
    })

    const [selected, setSelected] = useState({
        family: 'da',
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
        console.log("send!");
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
    }, debounceTime), [debounceTime, formState.family, formState.genus]);


    const updateField = (fieldName, value) => {
        setFormState(prev => ({
            ...prev,
            [fieldName]: value
        }));
    };

    return (
        <div className="form-group dropdown-container">
            {levels.map((level) => (
                <Autocomplete
                    key={level.name}
                    onChange={(event, newValue) => {
                        setSelected(prev => ({...prev, [level.name]: newValue}));
                        updateField(level.name, newValue);
                    }}
                    onInputChange={(e) => {
                        setInputValues({...inputValues, [level.name]: e.target.value});
                        fetchWithFilters(level.name, e.target.value);
                        console.log(e.target.value);
                    }}
                    autoSelect={true}
                    value={inputValues[level.name]}
                    autoHighlight={true}
                    id={level.name}
                    options={options[level.name]}
                    defaultValue={formState[level.name]}
                    disabled={loading || isDefined}
                    renderInput={(params) => (
                        <TextField {...params}
                                   placeholder={level.placeholder}
                        />
                    )} />

                ))}
        </div>
    )
}

export default TaxonDropdown;