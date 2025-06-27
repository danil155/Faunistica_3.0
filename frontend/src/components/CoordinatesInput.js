import { useFormContext } from "../pages/FormContext";
import { useTranslation } from 'react-i18next';
import React, { useState } from "react";
import { apiService } from "../api";

export const CoordinatesInput = ({isDisabled, showRequired}) => {
    const {t} = useTranslation('coordinateInput');
    const {formState, setFormState, validationErrors, setValidationErrors} = useFormContext();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const coordFormat = formState.coordinate_format ?? "grads";

    let disabled = formState.geo_origin === "nothing";

    const clearCoordFields = (newFormat) => {
        setFormState(prev => ({
            ...prev,
            coordinate_format: newFormat ?? prev.coordinate_format,
            coordinate_north: '',
            coordinate_east: '',
            grads_north: '',
            grads_east: '',
            mins_north: '',
            mins_east: '',
            secs_north: '',
            secs_east: ''
        }));
    };

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        let processedValue = value;

        if (name.startsWith("grads_")) {
            if (coordFormat === "grads") {
                processedValue = value
                    .replace(/[^-0-9.]/g, '')
                    .replace(/(?!^)-/g, '')
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
                processedValue = value
                    .replace(/[^-0-9]/g, '')
                    .replace(/(?!^)-/g, '');

                const maxDigits = name.includes('_east') ? 3 : 2;
                processedValue = processedValue.slice(0, processedValue.startsWith('-') ? maxDigits + 1 : maxDigits);
            }
        }
        else if (name.startsWith("mins_")) {
            if (coordFormat === "mins") {
                processedValue = value
                    .replace(/[^0-9.]/g, '')
                    .replace(/(\..*)\./g, '$1');

                const parts = processedValue.split('.');
                if (parts[0]) parts[0] = parts[0].slice(0, 2);
                if (parts[1]) parts[1] = parts[1].slice(0, 3);
                processedValue = parts.join('.');
            } else {
                processedValue = value
                    .replace(/[^0-9]/g, '')
                    .slice(0, 2);

                if (processedValue && parseInt(processedValue) > 59) {
                    processedValue = '59';
                }
            }
        }
        else if (name.startsWith("secs_")) {
            processedValue = value
                .replace(/[^0-9.]/g, '')
                .replace(/(\..*)\./g, '$1');

            const parts = processedValue.split('.');
            if (parts[0]) parts[0] = parts[0].slice(0, 2);
            if (parts[1]) parts[1] = parts[1].slice(0, 2);
            processedValue = parts.join('.');
        }

        if (processedValue.trim().length > 0) {
            if (name === "grads_north" || name === "grads_east") {
                setValidationErrors(prev => ({ ...prev, [name]: ''
                }));
            }
        }

        setFormState(prev => ({
            ...prev,
            [name]: processedValue
        }));
    };

    const getLocationFromCoordinates = async () => {
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
                setError(t("error.detect_coord"));
                return;
            }

            setFormState(prev => ({
                ...prev,
                country: location.country || '',
                region: location.region || '',
                district: location.district || ''
            }));

            setValidationErrors(prev => ({ ...prev,
                country: location.country ? '': t("error.validation"),
                region: location.region ? '': t("error.validation"),
                district: location.district ? '': t("error.validation"),
            }));

        } catch (err) {
            console.error("Error getting location:", err);
            setError(t("error.detect_loc"));
        } finally {
            setIsLoading(false);
        }
    };

    const renderInputField = (id, name, value, placeholder, inputMode, unit) => (
        <div className={`input-wrapper ${unit === '"' ? 'sec' : ''}`}>
            <input
                id={id}
                type="text"
                className={`coord ${validationErrors?.[name] ? "error" : ""}`}
                name={name}
                value={value}
                disabled={disabled || isDisabled}
                onChange={handleInputChange}
                placeholder={placeholder}
                inputMode={inputMode}
            />
            {validationErrors?.[name] && (
                <span className="no-data">{validationErrors[name]}</span>
            )}
        </div>
    );

    return (
        <>
            <div className="form-group">
                <label htmlFor="coord-format">{t("formats.title")}</label>
                <select
                    id="coord-format"
                    name="coordinate_format"
                    onChange={(e) => clearCoordFields(e.target.value)}
                    value={coordFormat}
                    disabled={disabled || isDisabled}
                >
                    <option value="grads">{t("formats.degrees")} (56.83777°)</option>
                    <option value="mins">{t("formats.mins")} (56° 50.266')</option>
                    <option value="secs">{t("formats.secs")} (56° 50' 15.99")</option>
                </select>
            </div>

            <div className="form-group" id={"coordinates"}>



            {coordFormat === "grads" ? (
                <div className="form-group">
                    <label htmlFor="grads-north">{t("formats.lat")} N°<span>{validationErrors["grads_north"] ? "*":""}</span></label>
                    {renderInputField(
                        "grads-north",
                        "grads_north",
                        formState.grads_north,
                        "00.00000",
                        "decimal",
                        ""
                    )}
                    <label htmlFor="grads-east">{t("formats.long")} E°<span>{validationErrors["grads_east"] ? "*":""}</span></label>
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
                    <label>{t("formats.lat")} N°</label>
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
                    <label>{t("formats.long")} E°</label>
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
                    <label>{t("formats.lat")} N°</label>
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
                    <label>{t("formats.long")} E°</label>
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
                <div className="location-wrapper">
                    <p id={"find-location"}>{t("detect_location")}</p>
                    <button
                        type="button"
                        onClick={getLocationFromCoordinates}
                        disabled={isLoading || disabled || isDisabled}
                        className="location-pin-button"
                        title={t("detect_location")}
                    >
                        {isLoading ? (
                            <span className="pulse-icon">✈️</span>
                        ) : (
                            <span className="pin-icon">✈️</span>
                        )}
                    </button>
                    {error && <div className="location-error">{error}</div>}
                </div>
            </div>
        </>
    );
};