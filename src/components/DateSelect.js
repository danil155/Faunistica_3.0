import { useFormContext } from "../pages/FormContext";
import { useState } from "react";

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const DateSelect = () => {
    const { formState, setFormState } = useFormContext();

    const [isInterval, setIsInterval] = useState(false);
    const [precision, setPrecision] = useState('exact');

    function resetForm() {
        setFormState(prev => ({
            ...prev,
            begin_date: '',
            end_date: '',
            begin_year: '',
            end_year: '',
            begin_month: '',
            end_month: '',
            eve_day_def: null
        }));
    }

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormState(prev => ({
            ...prev,
            [name]: name.includes("year") || name.includes("month") ? Number(value) || '' : value
        }));
    };

    return (
        <>
            <div className="form-group">
                <label htmlFor="is_interval">Тип даты:</label>
                <select
                    id="is_interval"
                    value={isInterval.toString()}
                    onChange={(e) => { setIsInterval(e.target.value === "true"); resetForm(); }}
                    className="form-control"
                >
                    <option value={false}>Одиночная дата</option>
                    <option value={true}>Интервал дат</option>
                </select>

                <label htmlFor="precision">Точность:</label>
                <select
                    id="precision"
                    value={precision}
                    onChange={(e) => {
                        setPrecision(e.target.value);
                        resetForm();
                        setFormState(prev => ({ ...prev, eve_day_def: e.target.value === "exact" }));
                    }}
                    className="form-control"
                >
                    <option value="exact">Точная дата</option>
                    <option value="month">С точностью до месяца</option>
                    <option value="year">С точностью до года</option>
                </select>
            </div>

            <div className="form-group">
                {/* Точная дата */}
                {precision === 'exact' && (
                    <>
                        <label htmlFor="date">Дата:</label>
                        <input
                            id="date"
                            type="date"
                            name="begin_date"
                            value={formState.begin_date}
                            onChange={handleChange}
                            className="text-input"
                            required
                        />
                    </>
                )}

                {/* До месяца */}
                {precision === 'month' && (
                    <>
                        <label htmlFor="month">Месяц:</label>
                        <select
                            id="month"
                            name="begin_month"
                            value={formState.begin_month || ''}
                            onChange={handleChange}
                            required
                        >
                            <option value="" disabled hidden>Выберите месяц</option>
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {capitalize(new Date(0, i).toLocaleString("ru-RU", { month: "long" }))}
                                </option>
                            ))}
                        </select>

                        <label htmlFor="year">Год:</label>
                        <input
                            id="year"
                            className="text-input"
                            type="number"
                            name="begin_year"
                            min="1900"
                            max="2100"
                            value={formState.begin_year || ''}
                            onChange={handleChange}
                            required
                        />
                    </>
                )}

                {/* До года */}
                {precision === 'year' && (
                    <>
                        <label>Год:</label>
                        <input
                            className="text-input"
                            type="number"
                            name="begin_year"
                            min="1900"
                            max="2100"
                            value={formState.begin_year || ''}
                            onChange={handleChange}
                            required
                        />
                    </>
                )}

                {/* Интервал */}
                {isInterval && (
                    <>
                        {/* Точный конец */}
                        {precision === 'exact' && (
                            <>
                                <label>Конечная дата:</label>
                                <input
                                    className="text-input"
                                    type="date"
                                    name="end_date"
                                    value={formState.end_date}
                                    onChange={handleChange}
                                    required
                                />
                            </>
                        )}

                        {/* До месяца */}
                        {precision === 'month' && (
                            <>
                                <label>Конечный месяц:</label>
                                <select
                                    name="end_month"
                                    value={formState.end_month || ''}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="" disabled hidden>Выберите месяц</option>
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <option key={i + 1} value={i + 1}>
                                            {capitalize(new Date(0, i).toLocaleString("ru-RU", { month: "long" }))}
                                        </option>
                                    ))}
                                </select>

                                <label>Конечный год:</label>
                                <input
                                    className="text-input"
                                    type="number"
                                    name="end_year"
                                    min="1900"
                                    max="2100"
                                    value={formState.end_year || ''}
                                    onChange={handleChange}
                                    required
                                />
                            </>
                        )}

                        {/* До года */}
                        {precision === 'year' && (
                            <>
                                <label>Конечный год:</label>
                                <input
                                    className="text-input"
                                    type="number"
                                    name="end_year"
                                    min="1900"
                                    max="2100"
                                    value={formState.end_year || ''}
                                    onChange={handleChange}
                                    required
                                />
                            </>
                        )}
                    </>
                )}
            </div>
        </>
    );
};

export default DateSelect;
