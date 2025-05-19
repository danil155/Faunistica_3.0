import { useFormContext } from "../pages/FormContext";
import {useEffect, useState} from "react";
import { apiService } from "../api";

export const CoordinatesInput = () => {
    const { formState, setFormState } = useFormContext();
    const [coordFormat, setCoordFormat] = useState(formState.coordinate_format || "grads");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
		
    let disabled = formState.geo_origin === "nothing";

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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let processedValue = value;

        // Градусы в десятичном формате (ГГ.гггг)
        if (name.startsWith("grads_")) {
            if (coordFormat === "grads") {
                // Десятичные градусы (ГГ.гггг°)
                processedValue = value
                    .replace(/[^-0-9.]/g, '')
                    .replace(/(?!^)-/g, '') // Удаляем минусы не в начале
                    .replace(/(\..*)\./g, '$1');

                const parts = processedValue.split('.');
                const maxBeforeDot = name.includes('_east') ? 3 : 2;
                const maxAfterDot = 5;

                if (parts[0]) {
                    parts[0] = parts[0].startsWith('-')
                        ? parts[0].slice(0, maxBeforeDot + 1)
                        : parts[0].slice(0, maxBeforeDot);
                }
                if (parts[1]) {
                    parts[1] = parts[1].slice(0, maxAfterDot);
                }
                processedValue = parts.join('.');
            } else {
                // Целые градусы (ГГ°)
                processedValue = value
                    .replace(/[^-0-9]/g, '')
                    .replace(/(?!^)-/g, '')

                const maxDigits = name.includes('_east') ? 3 : 2;
                processedValue = processedValue.slice(0, processedValue.startsWith('-') ? maxDigits + 1 : maxDigits);
            }
        }
        // Минуты (ММ.ммм)
        else if (name.startsWith("mins_")) {
            if (coordFormat === "mins") {
                // Формат ГГ°ММ.мм' — разрешаем десятичные
                processedValue = value
                    .replace(/[^0-9.]/g, '')
                    .replace(/(\..*)\./g, '$1');

                const parts = processedValue.split('.');
                if (parts[0]) parts[0] = parts[0].slice(0, 2);
                if (parts[1]) parts[1] = parts[1].slice(0, 3);
                processedValue = parts.join('.');
            } else {
                // Формат ГГ°ММ'СС'' — только целые числа (00-59)
                processedValue = value
                    .replace(/[^0-9]/g, '')
                    .slice(0, 2);

                if (processedValue && parseInt(processedValue) > 59) {
                    processedValue = '59';
                }
            }
        }
        // Секунды (СС.сс)
        else if (name.startsWith("secs_")) {
            processedValue = value
                .replace(/[^0-9.]/g, '')
                .replace(/(\..*)\./g, '$1');

            const parts = processedValue.split('.');
            if (parts[0]) parts[0] = parts[0].slice(0, 2);
            if (parts[1]) parts[1] = parts[1].slice(0, 2);
            processedValue = parts.join('.');
        }

        setFormState(prev => ({
            ...prev,
            [name]: processedValue
        }));
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

    const renderInputField = (id, name, value, placeholder, inputMode, unit) => (
        <div className={`input-wrapper ${unit === '"' ? 'sec' : ''}`}>
            <input
                id={id}
                type="text"
                className="coord"
                name={name}
                value={value}
                disabled={disabled}
                onChange={handleInputChange}
                placeholder={placeholder}
                inputMode={inputMode}
            />
            {/*{unit && <span className="unit">{unit}</span>}*/}
            <label htmlFor={id}>{unit}</label>
        </div>
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

            {coordFormat === "grads" ? (
                <div className="form-group">
                    <label htmlFor="grads-north">Широта N°</label>
                    {renderInputField(
                        "grads-north",
                        "grads_north",
                        formState.grads_north,
                        "00.00000",
                        "decimal",
                        ""
                    )}
                    <label htmlFor="grads-east">Долгота E°</label>
                    {renderInputField(
                        "grads-east",
                        "grads_east",
                        formState.grads_east,
                        "000.00000",
                        "decimal",
                        ""
                    )}
                </div>
            ) : coordFormat === "mins" ? (
                <div className="form-group">
                    <label>Широта N°</label>
                    <div className="form-row">
                        {renderInputField(
                            "grads-north",
                            "grads_north",
                            formState.grads_north,
                            "00",
                            "numeric",
                            "°"
                        )}
                        {renderInputField(
                            "mins-north",
                            "mins_north",
                            formState.mins_north,
                            "00.000",
                            "decimal",
                            "'"
                        )}
                    </div>
                    <label>Долгота E°</label>
                    <div className="form-row">
                        {renderInputField(
                            "grads-east",
                            "grads_east",
                            formState.grads_east,
                            "000",
                            "numeric",
                            "°"
                        )}
                        {renderInputField(
                            "mins-east",
                            "mins_east",
                            formState.mins_east,
                            "00.000",
                            "decimal",
                            "'"
                        )}
                    </div>
                </div>
            ) : (
                <div className="form-group">
                    <label>Широта N°</label>
                    <div className="form-row">
                        {renderInputField(
                            "grads-north-secs",
                            "grads_north",
                            formState.grads_north,
                            "00",
                            "numeric",
                            "°"
                        )}
                        {renderInputField(
                            "mins-north-secs",
                            "mins_north",
                            formState.mins_north,
                            "00",
                            "numeric",
                            "'"
                        )}
                        {renderInputField(
                            "secs-north",
                            "secs_north",
                            formState.secs_north,
                            "00.00",
                            "decimal",
                            '"'
                        )}
                    </div>
                    <label>Долгота E°</label>
                    <div className="form-row">
                        {renderInputField(
                            "grads-east-secs",
                            "grads_east",
                            formState.grads_east,
                            "000",
                            "numeric",
                            "°"
                        )}
                        {renderInputField(
                            "mins-east-secs",
                            "mins_east",
                            formState.mins_east,
                            "00",
                            "numeric",
                            "'"
                        )}
                        {renderInputField(
                            "secs-east",
                            "secs_east",
                            formState.secs_east,
                            "00.00",
                            "decimal",
                            '"'
                        )}
                    </div>
                </div>
            )}

            <div className="form-group location-wrapper">
                <button
                    type="button"
                    onClick={getLocationFromCoordinates}
                    disabled={isLoading || disabled}
                    className="location-pin-button"
                    title="Определить местоположение"
                >
                    {isLoading ? (
                        <span className="pulse-icon">✈️</span>
                    ) : (
                        <span className="pin-icon">✈️</span>
                    )}
                </button>
                {error && <div className="location-error">{error}</div>}
            </div>
        </>
    );
};