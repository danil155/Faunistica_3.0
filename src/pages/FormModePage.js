import { useState } from "react";
import { Link } from "react-router-dom";
import { useFormContext } from "./FormContext";
import SpecimenForm from "../components/specimen-form/SpecimenForm";
import "../styles/formMode.css";
import PinToggle from "../components/pin-toggle/PinToggle";
import DateSelect from "../components/DateSelect";
import { apiService } from '../api'
import ArticleInfo from "../components/article-info/ArticleInfo";
import TaxonDropdown from "../components/cascading-dropdown/TaxonDropdown";
import {CoordinatesInput} from "../components/CoordinatesInput";

const fieldsMap = {
    "Административное положение": ["country", "region", "district", "gathering_place", "place_notes", "adm_verbatim"],
    "Географическое положение": ["coordinate_north", "coordinate_east", "geo_origin", "geo_REM", "geo_unsert"],
    "Сбор материала": [
        "begin_date",
        "end_date",
        "begin_year",
        "end_year",
        "begin_month",
        "end_month",
        "biotope",
        "collector",
        "measurement_units",
        "selective_gain",
        "eve_REM"
    ],
    'Таксономия': ["family", "genus", "species", "taxonomic_notes", "tax_sp_def", "tax_nsp", "type_status"],
};

const FormModePage = () => {
    // Получение контекста формы
    const {
        formState,
        setFormState,
        pinnedSections,
        setPinnedSections,
        setPinnedData,
        resetForm,
        collapsedSections,
        toggleCollapseSection,
    } = useFormContext();

    const [showResetModal, setShowResetModal] = useState(false);
    const [resetMode, setResetMode] = useState("soft");
    const adm = [
        {name: "country", heading: "Страна" },
        {name: "region", heading: "Регион" },
        {name: "district", heading: "Район" },
        {name: "gathering_place", heading: "Место сбора" },
    ]

    // Обработчик изменений для текстовых полей
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormState((prev) => ({ ...prev, [name]: value }));
    };


    // Получение данных секции
    const getSectionData = (sectionName) => {
        return fieldsMap[sectionName].reduce((acc, field) => {
            acc[field] = formState[field];
            return acc;
        }, {});
    };

    // Переключение закрепления секции
    const pinSection = (sectionName) => {
        setPinnedSections((prev) => {
            const newPinned = !prev[sectionName];

            // Если секция стала закреплённой, сохраняем её данные
            if (newPinned) {
                setPinnedData((prevData) => ({
                    ...prevData,
                    [sectionName]: getSectionData(sectionName),
                }));
            } else {
                // Если открепляется, удаляем из pinnedData
                setPinnedData((prevData) => {
                    const newData = { ...prevData };
                    delete newData[sectionName];
                    return newData;
                });
            }

            return { ...prev, [sectionName]: newPinned };
        });
    };

    // Обработчик отправки формы
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const recordData = {
                begin_day: formState.begin_day || parseInt(formState.begin_date.split('-')[2]),
                begin_month: formState.begin_month || parseInt(formState.begin_date.split('-')[1]),
                begin_year: formState.begin_year || parseInt(formState.begin_date.split('-')[0]),
                biotope: formState.biotope,
                collector: formState.collector,
                country: formState.country,
                district: formState.district,
                east: formState.coordinate_east,
                end_year: formState.end_year || parseInt(formState.end_date.split('-')[0]),
                end_month: formState.end_month || parseInt(formState.end_date.split('-')[1]),
                end_day: formState.end_day || parseInt(formState.end_date.split('-')[2]),
                eve_REM: formState.eve_REM,
                family: formState.family,
                genus: formState.genus,
                geo_origin: formState.geo_origin,
                geo_REM: formState.geo_REM,
                geo_uncert: formState.geo_uncert,
                is_defined_species: !formState.tax_sp_def,
                is_in_wsc: formState.tax_nsp,
                is_new_species: formState.is_new_species,
                matherial_notes: formState.matherial_notes,
                measurement_units: formState.measurement_units,
                north: formState.coordinate_north,
                place: formState.gathering_place,
                place_notes: formState.place_notes,
                region: formState.region,
                selective_gain: formState.selective_gain,
                species: formState.species,
                specimens: formState.specimens,
                taxonomic_notes: formState.taxonomic_notes,
                type_status: formState.type_status
            };
            console.log("Отправка данных:", recordData);
            await apiService.insertRecord(recordData);
            resetForm(resetMode === "soft");
            alert("Данные успешно отправлены! Незакреплённые поля очищены.");
        } catch (error) {
            console.error("Ошибка при отправке данных:", error);
            alert("Произошла ошибка при отправке данных");
        }
    };

    // Обработчик очистки формы
    const handleResetConfirm = () => {
        resetForm(resetMode === "soft");
        setShowResetModal(false);
    };

    // Генерация класса для закреплённых секций
    const getSectionClassName = (sectionName) => {
        return `section ${pinnedSections[sectionName] ? "pinned" : ""}`;
    };

    return (
        <>
        <div className="form-mode-container">
            <header>
                <h3>Заполните форму вручную</h3>
                <p>или</p>
                <Link to="/text" className="switch-mode-button">
                    Введите текст
                </Link>
            </header>

            <form onSubmit={handleSubmit} className="specimen-form">

                <ArticleInfo />
                {/* Секция: Географическое положение */}
                <div className={`${getSectionClassName("Географическое положение")} section`}>
                    <div className={`section-header ${
                            collapsedSections["Географическое положение"] ? "collapsed" : ""
                    }`}>
                        <div className="section-controls">
                            <h4>Географическое положение</h4>

                            <PinToggle
                                isChecked={
                                    pinnedSections[
                                        "Географическое положение"
                                        ] || false
                                }
                                onChange={() =>
                                    pinSection("Географическое положение")
                                }
                            />
                        </div>
                        <button
                            className={`collapse-toggle ${
                                collapsedSections["Географическое положение"] ? "collapsed" : ""
                            }`}
                            type="button"
                            onClick={() =>
                                toggleCollapseSection(
                                    "Географическое положение"
                                )
                            }
                        >
                            {collapsedSections["Географическое положение"]
                                ? "Развернуть"
                                : "Свернуть"}
                        </button>
                    </div>

                    <div className={`form-grid ${
                        collapsedSections["Географическое положение"] ? "collapsed" : ""
                    }`}>
                        <CoordinatesInput />
                        <div className="form-group">
                            <label htmlFor="geo-origin">Происхождение координат:</label>
                            <select id="geo-origin"
                                    name="geo_origin"
                                    className="form-control"
                                    onChange={handleInputChange}>
                                <option value="original">Из статьи</option>
                                <option value="volunteer">Моя привязка</option>
                                <option value="nothing">Координат не будет</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor={"geo_uncert"}>Радиус неточности координат, м:</label>
                            <input
                                className="text-input"
                                id="geo_uncert"
                                type="number"
                                step="0.1"
                                name="geo_uncert"
                                value={formState.geo_uncert}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="geo_REM">Примечания к расположению</label>
                            <textarea id = "geo_REM" name="geo_REM" />
                        </div>
                        </div>
                </div>


                {/* Секция: Административное положение */}

                <div className={`${getSectionClassName("Административное положение")} section`}>
                    <div
                        className={`section-header ${
                            collapsedSections["Административное положение"]
                                ? "collapsed"
                                : ""
                        }`}
                    >
                        <div className="section-controls">
                            <h4>Административное положение</h4>
                            <PinToggle
                                isChecked={
                                    pinnedSections[
                                        "Административное положение"
                                        ] || false
                                }
                                onChange={() =>
                                    pinSection(
                                        "Административное положение"
                                    )
                                }
                            />
                        </div>
                        <button
                            className={`collapse-toggle ${
                                collapsedSections["Административное положение"] ? "collapsed" : ""
                            }`}
                            type="button"
                            onClick={() =>
                                toggleCollapseSection(
                                    "Административное положение"
                                )
                            }
                        >
                            {collapsedSections["Административное положение"]
                                ? "Развернуть"
                                : "Свернуть"}
                        </button>
                    </div>
                    <div className={`form-grid section-content ${
                        collapsedSections["Административное положение"] ? "collapsed" : ""
                    }`}>
                        <div className="form-group">
                            <div className="form-row">
                                <input id="adm_verbatim"
                                       name={"adm_verbatim"}
                                       type="checkbox"
                                       checked={formState.adm_verbatim || false}
                                       onChange={(e) => setFormState(prev => ({...prev, adm_verbatim: e.target.checked}))}
                                />
                                <label htmlFor="adm_verbatim" >Местоположение относится к Уралу</label>
                            </div>
                        </div>

                        {adm.map((field) => (
                            <div  key={field.name} className="form-group">
                                <label htmlFor={field.name}>{field.heading}:</label>
                                <input
                                    key={field.name}
                                    id={field.name}
                                    className="text-input"
                                    type="text"
                                    name={field.name}
                                    value={formState[field.name] || ""}
                                    onChange={handleInputChange}
                                />
                            </div>
                        ))}
                    </div>

                </div>

                {/* Секция: Сбор материала */}
                <div className={`${getSectionClassName("Сбор материала")} section`}>
                    <div
                        className={`section-header ${
                            collapsedSections["Сбор материала"]
                                ? "collapsed"
                                : ""
                        }`}
                    >
                        <div className="section-controls">
                            <h4>Сбор материала</h4>
                            <PinToggle
                                isChecked={
                                    pinnedSections["Сбор материала"] || false
                                }
                                onChange={() =>
                                    pinSection("Сбор материала")
                                }
                            />
                        </div>
                        <button
                            className={`collapse-toggle ${
                                collapsedSections["Сбор материала"] ? "collapsed" : ""
                            }`}
                            type="button"
                            onClick={() =>
                                toggleCollapseSection("Сбор материала")
                            }
                        >
                            {collapsedSections["Сбор материала"]
                                ? "Развернуть"
                                : "Свернуть"}
                        </button>
                    </div>

                    <div className={`form-grid section-content ${
                        collapsedSections["Сбор материала"] ? "collapsed" : ""
                    }`}>
                        <DateSelect getSectionData={getSectionData} />
                        <div className="form-group">
                            <label htmlFor="biotope">Биотоп:</label>
                            <input
                                id="biotope"
                                className="text-input"
                                type="text"
                                name="biotope"
                                value={formState.biotope}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="collector">Коллектор:</label>
                            <input
                                id="collector"
                                className="text-input"
                                type="text"
                                name="collector"
                                value={formState.collector}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="measurement_units">Единицы измерения:</label>
                            <input
                                id="measurement_units"
                                className="text-input"
                                type="text"
                                name="measurement_units"
                                value={
                                    formState.measurement_units ||
                                    "Особи, шт."
                                }
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="selective_gain">Выборочное усиление:</label>
                            <input
                                id="selective_gain"
                                className="text-input"
                                type="text"
                                name="selective_gain"
                                value={formState.selective_gain}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="eve_REM">Примечания к сбору материала</label>
                            <textarea id = "eve_REM" name="eve_REM" />
                        </div>
                    </div>
                </div>

                {/* Секция: Таксономия */}
                <div className={`${getSectionClassName("Таксономия")} section`}>
                    <div
                        className={`section-header ${
                            collapsedSections["Таксономия"] ? "collapsed" : ""
                        }`}
                    >
                        <div className="section-controls">
                            <h4>Таксономия</h4>
                            <PinToggle
                                isChecked={
                                    pinnedSections["Таксономия"] || false
                                }
                                onChange={() => pinSection("Таксономия")}
                            />
                        </div>
                        <button
                            className={`collapse-toggle ${
                                collapsedSections["Таксономия"] ? "collapsed" : ""
                            }`}
                            type="button"
                            onClick={() => toggleCollapseSection("Таксономия")}
                        >
                            {collapsedSections["Таксономия"]
                                ? "Развернуть"
                                : "Свернуть"}
                        </button>
                    </div>

                    <div className={`form-grid section-content ${
                        collapsedSections["Таксономия"] ? "collapsed" : ""
                    }`}>
                        <div className="form-group">
                            <div className="form-row">
                                <input
                                    id="tax_sp_def"
                                    name="tax_sp_def"
                                    type="checkbox"
                                    checked={!(formState.tax_sp_def ?? false)}
                                    onChange={(e) => {
                                        setFormState(prev => ({
                                            ...prev,
                                            tax_sp_def: !e.target.checked
                                        }));
                                        if (!e.target.checked) {
                                            setFormState(prev => ({...prev,
                                                species: ''}))
                                        }
                                    }
                                    }
                                />
                                <label htmlFor="tax_sp_def">Вид определён</label>
                            </div>

                            <div className="form-row">
                                <input
                                    id="tax_nsp"
                                    name="tax_nsp"
                                    type="checkbox"
                                    checked={formState.tax_nsp || false}
                                    onChange={(e) => {
                                        setFormState(prev => ({
                                            ...prev,
                                            tax_nsp: e.target.checked
                                        }));
                                        if (!e.target.checked) {
                                            setFormState(prev => ({...prev,
                                                family: '',
                                                genus: '',
                                                species: '',}))
                                        }
                                    }


                                    }
                                />
                                <label htmlFor="tax_nsp">Отсутствует в списке</label>
                            </div>

                            <div className="form-row">
                                <input
                                    id="is_new_species"
                                    name="is_new_species"
                                    type="checkbox"
                                    checked={formState.is_new_species ?? false}
                                    onChange={() => setFormState(prev => ({...prev, is_new_species : !prev.is_new_species }))}
                                />
                                <label htmlFor="is_new_species">Описан, как новый вид</label>
                            </div>

                            {formState.is_new_species && (
                                <div className='form-group'>
                                    <label htmlFor="type_status">Типовой статус:</label>
                                    <select
                                        id="type_status"
                                        name="type_status"
                                        value={formState.type_status ?? ''}
                                        onChange={handleInputChange}
                                    >
                                        <option value='holotype'>Голотип</option>
                                        <option value='paratype'>Паратип</option>
                                        <option value='neotype'>Неотип</option>
                                        <option value='other'>Другое</option>
                                    </select>
                                </div>
                            )}
                        </div>
                        <TaxonDropdown isDefined={formState.tax_sp_def} isInList={formState.tax_nsp} />
                        <div className="form-group">
                            <label htmlFor={"tax_REM"}>Таксономические примечания:</label>
                            <textarea
                                id={"tax_REM"}
                                name="taxonomic_notes"
                                value={formState.taxonomic_notes}
                                onChange={handleInputChange}
                                rows={3}
                            />
                        </div>
                    </div>
                </div>

                {/* Секция: Добавление особей (без возможности закрепления) */}
                <div className="section">
                    <h4>Добавление особей</h4>
                    <SpecimenForm
                        value={
                            Object.keys(formState.specimens).length > 0
                                ? Object.entries(formState.specimens).map(
                                    ([key, count]) => {
                                        const [gender, maturity] = key.split("_");
                                        return { gender, maturity, count };
                                    }
                                )
                                : []
                        }
                        onChange={(specimens) => {
                            const specimensObject = specimens.reduce(
                                (acc, { gender, maturity, count }) => {
                                    const key = `${gender}_${maturity}`;
                                    acc[key] = count;
                                    return acc;
                                },
                                {}
                            );
                            setFormState((prev) => ({
                                ...prev,
                                specimens: specimensObject,
                            }));
                        }}
                    />
                </div>

                {/* Кнопки действий */}
                <div className="form-actions">
                    <button type="submit" className="submit-button">
                        Отправить наблюдение
                    </button>

                    <div className="reset-buttons">
                        <button
                            type="button"
                            className="reset-button soft-reset"
                            onClick={() => {
                                setResetMode("soft");
                                setShowResetModal(true);
                            }}
                        >
                            Очистить форму
                        </button>

                        <button
                            type="button"
                            className="reset-button hard-reset"
                            onClick={() => {
                                setResetMode("hard");
                                setShowResetModal(true);
                            }}
                        >
                            Полная очистка
                        </button>
                    </div>
                </div>
            </form>

            {/* Модальное окно подтверждения очистки */}
            {showResetModal && (
                <div
                    className="modal-overlay"
                    onClick={() => setShowResetModal(false)}
                >
                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3>Подтвердите действие</h3>
                        <p>
                            {resetMode === "soft"
                                ? "Вы уверены, что хотите очистить все незакреплённые поля?"
                                : "Вы уверены, что хотите полностью очистить форму, включая закреплённые секции?"}
                        </p>
                        <div className="modal-actions">
                            <button
                                className="confirm-button"
                                onClick={handleResetConfirm}
                            >
                                Подтвердить
                            </button>
                            <button
                                className="cancel-button"
                                onClick={() => setShowResetModal(false)}
                            >
                                Отмена
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
        </>
    );
};

export default FormModePage;
