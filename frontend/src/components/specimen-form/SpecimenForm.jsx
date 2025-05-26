import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const SpecimenForm = ({value = [], onChange}) => {
    const {t} = useTranslation('specimenForm');
    const [count, setCount] = useState(1);

    const GENDER_OPTIONS = [
        {value: 'male', label: t("male")},
        {value: 'female', label: t("female")},
        {value: 'undefined', label: t("undefined")}
    ];

    const MATURITY_OPTIONS = [
        {value: 'adult', label: t("adult")},
        {value: 'juvenile', label: t("juvenile")}
    ];

    const [currentSpecimen, setCurrentSpecimen] = useState({
        gender: 'undefined',
        maturity: 'adult'
    });

    const getGenderLabel = (gender) => {
        return GENDER_OPTIONS.find(opt => opt.value === gender)?.label || '';
    };

    const getMaturityLabel = (maturity) => {
        return MATURITY_OPTIONS.find(opt => opt.value === maturity)?.label || '';
    };

    const handleGenderChange = (e) => {
        setCurrentSpecimen({...currentSpecimen, gender: e.target.value});
    };

    const handleMaturityChange = (e) => {
        setCurrentSpecimen({...currentSpecimen, maturity: e.target.value});
    };

    const addSpecimen = () => {
        const newSpecimen = {
            ...currentSpecimen,
            count
        };

        const isDuplicate = value.some(
            s => s.gender === newSpecimen.gender && s.maturity === newSpecimen.maturity
        );

        if (isDuplicate) {
            return;
        }

        onChange([...value, newSpecimen]);
        setCount(1);
    };

    const removeSpecimen = (index) => {
        const newSpecimens = value.filter((_, i) => i !== index);
        onChange(newSpecimens);
    };

    return (
        <div style={{border: '1px solid #ddd', padding: '15px', borderRadius: '5px', width: '70%'}}>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '10px'}}>
                <div>
                    <label htmlFor={"gender"} style={{display: 'block', marginBottom: '5px'}}>{t("sex")}</label>
                    <select
                        id="gender"
                        value={currentSpecimen.gender}
                        onChange={handleGenderChange}
                        style={{width: '100%', padding: '8px'}}
                    >
                        {GENDER_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor={"maturity"} style={{display: 'block', marginBottom: '5px'}}>{t("maturity")}</label>
                    <select
                        id={"maturity"}
                        value={currentSpecimen.maturity}
                        onChange={handleMaturityChange}
                        style={{width: '100%', padding: '8px'}}
                    >
                        {MATURITY_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor={"count"} style={{display: 'block', marginBottom: '5px'}}>{t("amount")}</label>
                    <input
                        id={"count"}
                        type="number"
                        min="0"
                        step="0.01"
                        max="8000"
                        value={count}
                        onChange={(e) => {
                            setCount(e.target.value)
                        }}
                        style={{width: '100%', padding: '8px'}}
                    />
                </div>
            </div>

            <button
                type="button"
                onClick={addSpecimen}
                style={{
                    padding: '8px 15px',
                    background: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px'
                }}
            >
                {t("add")}
            </button>

            {value.length > 0 && (
                <div style={{marginTop: '15px'}}>
                    <h4 style={{marginBottom: '10px'}}>{t("added")}</h4>
                    <ul style={{listStyle: 'none', padding: 0}}>
                        {value.map((specimen, index) => (
                            <li
                                key={index}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '8px',
                                    borderBottom: '1px solid #eee'
                                }}
                            >
                <span>
                  {`${getGenderLabel(specimen.gender)}, ${getMaturityLabel(specimen.maturity)}, ${t("count")} ${specimen.count}`}
                </span>
                                <button
                                    type="button"
                                    onClick={() => removeSpecimen(index)}
                                    style={{
                                        padding: '3px 8px',
                                        background: '#f44336',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px'
                                    }}
                                >
                                    ×
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default SpecimenForm;