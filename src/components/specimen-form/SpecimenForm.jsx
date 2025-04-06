import React, { useState } from 'react';

const SpecimenForm = ({ value = [], onChange }) => {
  const GENDER_OPTIONS = [
    { value: 'male', label: 'Мужской' },
    { value: 'female', label: 'Женский' },
    { value: 'undefined', label: 'Не определён' }
  ];

  const MATURITY_OPTIONS = [
    { value: 'adult', label: 'Взрослый' },
    { value: 'juvenile', label: 'Ювенильный' }
  ];

  const [currentSpecimen, setCurrentSpecimen] = useState({
    gender: 'undefined',
    maturity: 'adult'
  });
  const [count, setCount] = useState(1);

  const getGenderLabel = (gender) => {
    return GENDER_OPTIONS.find(opt => opt.value === gender)?.label || '';
  };

  const getMaturityLabel = (maturity) => {
    return MATURITY_OPTIONS.find(opt => opt.value === maturity)?.label || '';
  };

  const handleGenderChange = (e) => {
    setCurrentSpecimen({ ...currentSpecimen, gender: e.target.value });
  };

  const handleMaturityChange = (e) => {
    setCurrentSpecimen({ ...currentSpecimen, maturity: e.target.value });
  };

  const handleCountChange = (e) => {
    setCount(Math.max(1, parseInt(e.target.value) || 1));
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
      alert('Особь с такими характеристиками уже добавлена');
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
    <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Пол:</label>
          <select 
            value={currentSpecimen.gender} 
            onChange={handleGenderChange}
            style={{ width: '100%', padding: '8px' }}
          >
            {GENDER_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Зрелость:</label>
          <select 
            value={currentSpecimen.maturity} 
            onChange={handleMaturityChange}
            style={{ width: '100%', padding: '8px' }}
          >
            {MATURITY_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Количество:</label>
          <input 
            type="number" 
            min="1" 
            value={count} 
            onChange={handleCountChange}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
      </div>
      
      <button 
        type="button" 
        onClick={addSpecimen}
        style={{ padding: '8px 15px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}
      >
        Добавить особь
      </button>
      
      {value.length > 0 && (
        <div style={{ marginTop: '15px' }}>
          <h4 style={{ marginBottom: '10px' }}>Добавленные особи:</h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
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
                  {`${getGenderLabel(specimen.gender)}, ${getMaturityLabel(specimen.maturity)}, кол-во: ${specimen.count}`}
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