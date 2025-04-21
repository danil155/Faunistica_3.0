import React, { useEffect, useState} from "react";
import { useFormContext } from "../../pages/FormContext";

function ThreeLevelDropdown() {
    const { formState, setFormState, pinnedData } = useFormContext();
    
    // Mock данные
    const countriesRegionsMock = [
      {
        name: "Россия",
        regions: ["Центральный федеральный округ", "Северо-Западный федеральный округ", "Южный федеральный округ"]
      }
    ];
  
    const regionsDistrictsMock = [
      {
        name: "Центральный федеральный округ",
        districts: ["Москва", "Московская область", "Воронежская область", "Ярославская область"]
      }
    ];
  
    const [availableRegions, setAvailableRegions] = useState([]);
    const [availableDistricts, setAvailableDistricts] = useState([]);
  
    // Получаем текущие значения, учитывая закрепленные данные
    const getFieldValue = (fieldName) => {
      for (const section of Object.values(pinnedData)) {
        if (section[fieldName] !== undefined) {
          return section[fieldName];
        }
      }
      // Затем проверяем основное состояние формы
      return formState[fieldName] || "";
    };
  
    const selectedCountry = getFieldValue(`country`);
    const selectedRegion = getFieldValue(`region`);
    const selectedDistrict = getFieldValue(`district`);
  
    // Обработчики изменений
    const handleCountryChange = (e) => {
      const value = e.target.value;
      setFormState(prev => ({
        ...prev,
        [`country`]: value,
        ...(!pinnedData[`region`] && { [`region`]: "" }),
        ...(!pinnedData[`district`] && { [`district`]: "" })
      }));
    };
  
    const handleRegionChange = (e) => {
      const value = e.target.value;
      setFormState(prev => ({
        ...prev,
        [`region`]: value,
        ...(!pinnedData[`district`] && { [`district`]: "" })
      }));
    };
  
    const handleDistrictChange = (e) => {
      const value = e.target.value;
      setFormState(prev => ({
        ...prev,
        [`district`]: value
      }));
    };
  
    // Эффекты для обновления доступных регионов и районов
    useEffect(() => {
      if (selectedCountry) {
        const country = countriesRegionsMock.find(c => c.name === selectedCountry);
        setAvailableRegions(country ? country.regions : []);
      } else {
        setAvailableRegions([]);
      }
    }, [selectedCountry]);
  
    useEffect(() => {
      if (selectedRegion) {
        const region = regionsDistrictsMock.find(r => r.name === selectedRegion);
        setAvailableDistricts(region ? region.districts : []);
      } else {
        setAvailableDistricts([]);
      }
    }, [selectedRegion]);
  
    // Проверяем, закреплено ли поле
    const isFieldPinned = (fieldName) => {
      return Object.values(pinnedData).some(
        section => section[fieldName] !== undefined
      );
    };
  
    return (
      <>
        <div className="form-group">
          <label >Страна</label>
          <select 
            name={`country`}
            value={selectedCountry} 
            onChange={handleCountryChange}
            disabled={isFieldPinned(`country`)}
          >
            <option value="">Выберите страну</option>
            {countriesRegionsMock.map(country => (
              <option value={country.name}>
                {country.name}
              </option>
            ))}
          </select>
        </div>
  
        <div className="form-group">
          <label>Регион</label>
          <select 
            name={`region`}
            value={selectedRegion} 
            onChange={handleRegionChange}
            disabled={!selectedCountry || isFieldPinned(`region`)}
          >
            <option value="">Выберите регион</option>
            {availableRegions.map(region => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>
  
        <div className="form-group">
          <label>Район</label>
          <select 
            name={`district`}
            value={selectedDistrict} 
            onChange={handleDistrictChange}
            disabled={!selectedRegion || isFieldPinned(`district`)}
          >
            <option value="">Выберите район</option>
            {availableDistricts.map(district => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
        </div>
      </>
    );
  }
  
  export default ThreeLevelDropdown;