import {useFormContext} from "../pages/FormContext";
import {useState} from "react";

export const CoordinatesInput = () => {
    const {formState, setFormState} = useFormContext();
    const [coordFormat, setCoordFormat] = useState("grads");

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

    // Функции валидации (теперь разрешают пустую строку)
    const validateDecimal = (value) => {
        return value === '' || /^[0-9]*\.?[0-9]*$/.test(value);
    };

    const validateInteger = (value) => {
        return value === '' || /^[0-9]*$/.test(value);
    };

    const validateMinutes = (value) => {
        return value === '' || (/^[0-5]?[0-9]\.?[0-9]*$/.test(value) && parseFloat(value) < 60);
    };

    const validateSeconds = (value) => {
        return value === '' || (/^[0-5]?[0-9]\.?[0-9]*$/.test(value) && parseFloat(value) < 60);
    };

    function handleInputChange(coordFormat, e) {
        const { name, value } = e.target;

        // Валидация в зависимости от поля
        let isValid = true;

        if (name.includes('grads_') && coordFormat === "grads") {
            isValid = validateDecimal(value);
        } else if (name.includes('grads_')) {
            isValid = validateInteger(value);
        } else if (name.includes('mins_')) {
            isValid = validateMinutes(value);
        } else if (name.includes('secs_')) {
            isValid = validateSeconds(value);
        } else if (name === 'coordinate_north' || name === 'coordinate_east') {
            isValid = validateDecimal(value);
        }

        if (!isValid) return;

        setFormState(prevState => {
            const updatedState = {
                ...prevState,
                [name]: value
            };

            if (coordFormat === "mins") {
                updatedState.coordinate_north = `${updatedState.grads_north || ''}°${updatedState.mins_north || ''}'`;
                updatedState.coordinate_east = `${updatedState.grads_east || ''}°${updatedState.mins_east || ''}'`;
            } else if (coordFormat === "secs") {
                updatedState.coordinate_north = `${updatedState.grads_north || ''}°${updatedState.mins_north || ''}'${updatedState.secs_north || ''}"`;
                updatedState.coordinate_east = `${updatedState.grads_east || ''}°${updatedState.mins_east || ''}'${updatedState.secs_east || ''}"`;
            }

            return updatedState;
        });
    }

    return (
        <>
            <div className="form-group">
                <label htmlFor="coord-format">Формат координат</label>
                <select
                    id="coord-format"
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
                    <label>Широта (N):</label>
                    <input
                        className="text-input"
                        type="text"
                        name="coordinate_north"
                        value={formState.coordinate_north}
                        onChange={(e) => handleInputChange(coordFormat, e)}
                        placeholder="00.0000"
                        pattern="[0-9.]*"
                        inputMode="decimal"
                    />
                    <label>Долгота (E):</label>
                    <input
                        className="text-input"
                        type="text"
                        name="coordinate_east"
                        value={formState.coordinate_east}
                        onChange={(e) => handleInputChange(coordFormat, e)}
                        placeholder="00.0000"
                        pattern="[0-9.]*"
                        inputMode="decimal"
                    />
                </div>
            ) : coordFormat === "mins" ? (
                <div className="form-group">
                    <label>Широта N°</label>
                    <div className="form-row">
                        <input
                            id="grads-north"
                            type="text"
                            className="coord"
                            name="grads_north"
                            value={formState.grads_north}
                            onChange={(e) => handleInputChange(coordFormat, e)}
                            placeholder="00"
                            pattern="[0-9]*"
                            inputMode="numeric"
                            maxLength="2"
                        />
                        <label htmlFor="grads-north">°</label>
                        <input
                            id="mins-north"
                            type="text"
                            className="coord"
                            name="mins_north"
                            value={formState.mins_north}
                            onChange={(e) => handleInputChange(coordFormat, e)}
                            placeholder="00.000"
                            pattern="[0-9.]*"
                            inputMode="decimal"
                            maxLength="6"
                        />
                        <label htmlFor="mins-north">'</label>
                    </div>
                    <label>Долгота E°</label>
                    <div className="form-row">
                        <input
                            id="grads-east"
                            type="text"
                            className="coord"
                            value={formState.grads_east}
                            name="grads_east"
                            onChange={(e) => handleInputChange(coordFormat, e)}
                            placeholder="00"
                            pattern="[0-9]*"
                            inputMode="numeric"
                            maxLength="2"
                        />
                        <label htmlFor="grads-east">°</label>
                        <input
                            id="mins-east"
                            type="text"
                            className="coord"
                            value={formState.mins_east}
                            name="mins_east"
                            onChange={(e) => handleInputChange(coordFormat, e)}
                            placeholder="00.000"
                            pattern="[0-9.]*"
                            inputMode="decimal"
                            maxLength="6"
                        />
                        <label htmlFor="mins-east">'</label>
                    </div>
                </div>
            ) : (
                <div className="form-group">
                    <label>Широта N°</label>
                    <div className="form-row">
                        <input
                            id="grads-north-secs"
                            value={formState.grads_north}
                            className="coord sec"
                            name="grads_north"
                            onChange={(e) => handleInputChange(coordFormat, e)}
                            placeholder="00"
                            pattern="[0-9]*"
                            inputMode="numeric"
                            maxLength="2"
                        />
                        <label htmlFor="grads-north-secs">°</label>
                        <input
                            id="mins-north-secs"
                            value={formState.mins_north}
                            className="coord sec"
                            name="mins_north"
                            onChange={(e) => handleInputChange(coordFormat, e)}
                            placeholder="00"
                            pattern="[0-9]*"
                            inputMode="numeric"
                            maxLength="2"
                        />
                        <label htmlFor="mins-north-secs">'</label>
                        <input
                            id="secs-north"
                            value={formState.secs_north}
                            className="coord sec"
                            name="secs_north"
                            onChange={(e) => handleInputChange(coordFormat, e)}
                            placeholder="00.00"
                            pattern="[0-9.]*"
                            inputMode="decimal"
                            maxLength="5"
                        />
                        <label htmlFor="secs-north">"</label>
                    </div>
                    <label>Долгота E°</label>
                    <div className="form-row">
                        <input
                            id="grads-east-secs"
                            value={formState.grads_east}
                            className="coord sec"
                            onChange={(e) => handleInputChange(coordFormat, e)}
                            name="grads_east"
                            placeholder="00"
                            pattern="[0-9]*"
                            inputMode="numeric"
                            maxLength="3"
                        />
                        <label htmlFor="grads-east-secs">°</label>
                        <input
                            id="mins-east-secs"
                            value={formState.mins_east}
                            className="coord sec"
                            onChange={(e) => handleInputChange(coordFormat, e)}
                            name="mins_east"
                            placeholder="00"
                            pattern="[0-9]*"
                            inputMode="numeric"
                            maxLength="2"
                        />
                        <label htmlFor="mins-east-secs">'</label>
                        <input
                            id="secs-east"
                            value={formState.secs_east}
                            className="coord sec"
                            onChange={(e) => handleInputChange(coordFormat, e)}
                            name="secs_east"
                            placeholder="00.00"
                            pattern="[0-9.]*"
                            inputMode="decimal"
                            maxLength="5"
                        />
                        <label htmlFor="secs-east">"</label>
                    </div>
                </div>
            )}
        </>
    );
};