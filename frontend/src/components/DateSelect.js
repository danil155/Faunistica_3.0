import { useFormContext } from "../pages/FormContext";
import { useState } from "react";
import { useTranslation } from 'react-i18next';

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const DateSelect = ({disabled}) => {
    const {t} = useTranslation('dateSelect');
    const {formState, setFormState, pinnedSections} = useFormContext();

    const initialPrecision = formState.eve_day_def ? 'exact' : 
                           formState.begin_month ? 'month' : 
                           'year';

    const [isInterval, setIsInterval] = useState(false);
    const [precision, setPrecision] = useState(initialPrecision);

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
        const {name, value} = e.target;

        setFormState(prev => ({
            ...prev,
            [name]: name.includes("year") || name.includes("month") ? Number(value) || '' : value
        }));
    };

    return (
        <>
            <div className="form-group">
                <label htmlFor="is_interval">{t("type")}</label>
                <select
                    disabled={disabled}
                    id="is_interval"
                    value={isInterval.toString()}
                    onChange={(e) => {
                        setIsInterval(e.target.value === "true");
                        resetForm();
                    }}
                    className="form-control"
                >
                    <option value={false}>{t("single")}</option>
                    <option value={true}>{t("interval")}</option>
                </select>

                <label htmlFor="precision">{t("precision")}</label>
                <select
                    disabled={disabled}
                    id="precision"
                    value={precision}
                    onChange={(e) => {
                        setPrecision(e.target.value);
                        resetForm();
                        setFormState(prev => ({...prev, eve_day_def: e.target.value === "exact"}));
                    }}
                    className="form-control"
                >
                    <option value="exact">{t("exact")}</option>
                    <option value="month">{t("up_to_month")}</option>
                    <option value="year">{t("up_to_year")}</option>
                </select>
            </div>

            <div className="form-group">
                {precision === 'exact' && (
                    <>
                        <label htmlFor="date">{t("date")}</label>
                        <input
                            disabled={disabled}
                            id="date"
                            type="date"
                            name="begin_date"
                            value={formState.begin_date}
                            onChange={handleChange}
                            className="text-input"
                        />
                    </>
                )}

                {precision === 'month' && (
                    <>
                        <label htmlFor="month">{t("month")}</label>
                        <select
                            disabled={disabled}
                            id="month"
                            name="begin_month"
                            value={formState.begin_month || ''}
                            onChange={handleChange}
                        >
                            <option value="" disabled hidden>{t("select_month")}</option>
                            {Array.from({length: 12}, (_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {capitalize(new Date(0, i).toLocaleString(t("locale"), {month: "long"}))}
                                </option>
                            ))}
                        </select>

                        <label htmlFor="year">{t("year")}</label>
                        <input
                            disabled={disabled}
                            id="year"
                            className="text-input"
                            type="number"
                            name="begin_year"
                            min="1900"
                            max="2100"
                            value={formState.begin_year || ''}
                            onChange={handleChange}
                        />
                    </>
                )}

                {precision === 'year' && (
                    <>
                        <label>{t("year")}</label>
                        <input
                            disabled={disabled}
                            className="text-input"
                            type="number"
                            name="begin_year"
                            min="1900"
                            max="2100"
                            value={formState.begin_year || ''}
                            onChange={handleChange}
                        />
                    </>
                )}

                {isInterval && (
                    <>
                        {precision === 'exact' && (
                            <>
                                <label>{t("end_date")}</label>
                                <input
                                    disabled={disabled}
                                    className="text-input"
                                    type="date"
                                    name="end_date"
                                    value={formState.end_date}
                                    onChange={handleChange}
                                />
                            </>
                        )}

                        {precision === 'month' && (
                            <>
                                <label>{t("end_month")}</label>
                                <select
                                    disabled={disabled}
                                    name="end_month"
                                    value={formState.end_month || ''}
                                    onChange={handleChange}
                                >
                                    <option value="" disabled hidden>{t("select_month")}</option>
                                    {Array.from({length: 12}, (_, i) => (
                                        <option key={i + 1} value={i + 1}>
                                            {capitalize(new Date(0, i).toLocaleString(t("locale"), {month: "long"}))}
                                        </option>
                                    ))}
                                </select>

                                <label>{t("end_year")}</label>
                                <input
                                    disabled={disabled}
                                    className="text-input"
                                    type="number"
                                    name="end_year"
                                    min="1900"
                                    max="2100"
                                    value={formState.end_year || ''}
                                    onChange={handleChange}
                                />
                            </>
                        )}

                        {precision === 'year' && (
                            <>
                                <label>{t("end_year")}</label>
                                <input
                                    disabled={disabled}
                                    className="text-input"
                                    type="number"
                                    name="end_year"
                                    min="1900"
                                    max="2100"
                                    value={formState.end_year || ''}
                                    onChange={handleChange}
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