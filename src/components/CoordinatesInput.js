import { useFormContext } from "../pages/FormContext";
import {useEffect, useState} from "react";
import { apiService } from "../api";

export const CoordinatesInput = () => {
    const { formState, setFormState } = useFormContext();
    const [coordFormat, setCoordFormat] = useState(formState.coordinate_format || "grads");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
		
    let disabled = formState.geo_origin === "nothing";
    useEffect(() => {
        disabled = formState.geo_origin === "nothing"
    }, [formState.geo_origin])

    const clearCoordFields = () => {
        setFormState({
            ...formState,
            coordinate_north: '',
            coordinate_east: '',
            grads_north: '',
            grads_east: '',
            mins_north: '',
            mins_east: '',
            secs_north: '',
            secs_east: ''
        });
    };

    const validateInteger = (value) => value === '' || /^\d*$/.test(value);
    const validateSeconds = (value) => value === '' || (/^[0-5]?\d\.?\d*$/.test(value) && parseFloat(value) < 60);

    const handleDecimalInput = (value, beforeLimit, afterLimit) => {
        let processedValue = value.replace(/[^0-9.]/g, '');

        // Автоматически добавляем точку после beforeLimit цифр, если её нет
        if (processedValue.length > beforeLimit && !processedValue.includes('.')) {
            processedValue = `${processedValue.slice(0, beforeLimit)}.${processedValue.slice(beforeLimit)}`;
        }

        // Удаляем лишние точки
        const parts = processedValue.split('.');
        if (parts.length > 2) {
            processedValue = `${parts[0]}.${parts.slice(1).join('')}`;
        }

        // Ограничиваем длину
        if (processedValue.includes('.')) {
            const [beforeDot, afterDot] = processedValue.split('.');
            if (beforeDot.length > beforeLimit) {
                processedValue = `${beforeDot.slice(0, beforeLimit)}.${afterDot || ''}`;
            }
            if (afterDot && afterDot.length > afterLimit) {
                processedValue = `${beforeDot}.${afterDot.slice(0, afterLimit)}`;
            }
        } else if (processedValue.length > beforeLimit) {
            processedValue = processedValue.slice(0, beforeLimit);
        }

        return processedValue;
    };

    const handleInputChange = (coordFormat, e) => {
        const { name, value } = e.target;

        // Обработка полей в зависимости от формата
        let processedValue = value;
        if (name.includes('mins_')) {
            processedValue = handleDecimalInput(value, 2, 3);
        } else if (name.includes('grads_') && coordFormat === "grads") {
            processedValue = handleDecimalInput(value, 2, 5);
        } else if (name.includes('secs_')) {
            processedValue = handleDecimalInput(value, 2, 2);
        } else if (name.includes('grads_')) {
            if (!validateInteger(value)) return;
        } else if (name.includes('secs_')) {
            if (!validateSeconds(value)) return;
        }

        setFormState(prevState => {
            const updatedState = {
                ...prevState,
                [name]: processedValue
            };

            // Формируем строку координат в зависимости от формата
            if (coordFormat === "mins") {
                updatedState.coordinate_north = `${updatedState.grads_north || ''}°${updatedState.mins_north || ''}'`;
                updatedState.coordinate_east = `${updatedState.grads_east || ''}°${updatedState.mins_east || ''}'`;
            } else if (coordFormat === "secs") {
                updatedState.coordinate_north = `${updatedState.grads_north || ''}°${updatedState.mins_north || ''}'${updatedState.secs_north || ''}"`;
                updatedState.coordinate_east = `${updatedState.grads_east || ''}°${updatedState.mins_east || ''}'${updatedState.secs_east || ''}"`;
            }

            return updatedState;
        });
    };
		
		const getLocationFromCoordinates = async () => {
        if (coordFormat === "grads") {
            if (!formState.grads_north || !formState.grads_east) {
                setError("Пожалуйста, заполните координаты");
                return;
            }
        } else if (coordFormat === "mins") {
            if (!formState.grads_north || !formState.mins_north || 
                !formState.grads_east || !formState.mins_east) {
                setError("Пожалуйста, заполните координаты");
                return;
            }
        } else if (coordFormat === "secs") {
            if (!formState.grads_north || !formState.mins_north || !formState.secs_north ||
                !formState.grads_east || !formState.mins_east || !formState.secs_east) {
                setError("Пожалуйста, заполните координаты");
                return;
            }
        }

        setIsLoading(true);
        setError(null);

        try {
            let requestData = {};
            
            if (coordFormat === "grads") {
                requestData = {
                    degrees_n: parseFloat(formState.grads_north),
                    degrees_e: parseFloat(formState.grads_east)
                };
            } else if (coordFormat === "mins") {
                requestData = {
                    degrees_n: parseInt(formState.grads_north),
                    minutes_n: parseFloat(formState.mins_north),
                    degrees_e: parseInt(formState.grads_east),
                    minutes_e: parseFloat(formState.mins_east)
                };
            } else if (coordFormat === "secs") {
                requestData = {
                    degrees_n: parseInt(formState.grads_north),
                    minutes_n: parseInt(formState.mins_north),
                    seconds_n: parseFloat(formState.secs_north),
                    degrees_e: parseInt(formState.grads_east),
                    minutes_e: parseInt(formState.mins_east),
                    seconds_e: parseFloat(formState.secs_east)
                };
            }

            const location = await apiService.getLocationFromCoordinates(requestData);
            
            if (!location.country && !location.region && !location.district) {
                setError("Не удалось определить местоположение по координатам");
                return;
            }

            setFormState(prev => ({
                ...prev,
                country: location.country || '',
                region: location.region || '',
                district: location.district || ''
            }));

        } catch (err) {
            console.error("Error getting location:", err);
            setError("Произошла ошибка при определении местоположения");
        } finally {
            setIsLoading(false);
        }
    };

    const renderInputField = (id, name, value, placeholder, pattern, inputMode, maxLength, unit) => (
        <>
            <input
                id={id}
                type="text"
                className={`coord ${unit === '"' ? 'sec' : ''}`}
                name={name}
                value={value}
                disabled={disabled}
                onChange={(e) => handleInputChange(coordFormat, e)}
                placeholder={placeholder}
                pattern={pattern}
                inputMode={inputMode}
                maxLength={maxLength}
            />
            <label htmlFor={id}>{unit}</label>
        </>
    );

    return (
        <>
            <div className="form-group">
                <label htmlFor="coord-format">Формат координат</label>
                <select
                    id="coord-format"
                    name="coordinate_format"
                    onChange={(e) => {
                        setCoordFormat(e.target.value);

                        clearCoordFields();
                    }}
                    value={coordFormat}
                >
                    <option value="grads">ГГ.гггг° (56.83777°)</option>
                    <option value="mins">ГГ°ММ.мм' (56° 50.266')</option>
                    <option value="secs">ГГ°ММ'СС'' (56° 50' 15.99")</option>
                </select>
            </div>

            {coordFormat === "grads"  ? (
                <div className="form-group">
                    <label htmlFor="grads-north">Широта N°</label>
                    {renderInputField("grads-north", "grads_north", formState.grads_north, "00.00000", "[0-9.]*", "decimal", 8, "")}
                    <label htmlFor="grads-east">Долгота E°</label>
                    {renderInputField("grads-east", "grads_east", formState.grads_east, "00.00000", "[0-9.]*", "decimal", 8, "")}
                </div>
            ) : coordFormat === "mins" ? (
                <div className="form-group">
                    <label>Широта N°</label>
                    <div className="form-row">
                        {renderInputField("grads-north", "grads_north", formState.grads_north, "00", "[0-9]*", "numeric", 2, "°")}
                        {renderInputField("mins-north", "mins_north", formState.mins_north, "00.000", "[0-9.]*", "decimal", 6, "'")}
                    </div>
                    <label>Долгота E°</label>
                    <div className="form-row">
                        {renderInputField("grads-east", "grads_east", formState.grads_east, "00", "[0-9]*", "numeric", 2, "°")}
                        {renderInputField("mins-east", "mins_east", formState.mins_east, "00.000", "[0-9.]*", "decimal", 6, "'")}
                    </div>
                </div>
            ) : (
                <div className="form-group">
                    <label>Широта N°</label>
                    <div className="form-row">
                        {renderInputField("grads-north-secs", "grads_north", formState.grads_north, "00", "[0-9]*", "numeric", 2, "°")}
                        {renderInputField("mins-north-secs", "mins_north", formState.mins_north, "00", "[0-9]*", "numeric", 2, "'")}
                        {renderInputField("secs-north", "secs_north", formState.secs_north, "00.00", "[0-9.]*", "decimal", 5, '"')}
                    </div>
                    <label>Долгота E°</label>
                    <div className="form-row">
                        {renderInputField("grads-east-secs", "grads_east", formState.grads_east, "00", "[0-9]*", "numeric", 2, "°")}
                        {renderInputField("mins-east-secs", "mins_east", formState.mins_east, "00", "[0-9]*", "numeric", 2, "'")}
                        {renderInputField("secs-east", "secs_east", formState.secs_east, "00.00", "[0-9.]*", "decimal", 5, '"')}
                    </div>
                </div>
            )}
						<div className="form-group">
                <button 
                    type="button" 
                    onClick={getLocationFromCoordinates}
                    disabled={isLoading || disabled}
                    className="location-button"
                >
                    {isLoading ? "Определение..." : "Определить местоположение"}
                </button>
                
                {error && <div className="location-error">{error}</div>}
            </div>
        </>
    );
};