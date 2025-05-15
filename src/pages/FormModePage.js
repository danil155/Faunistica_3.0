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
    const [isNewSpecies, setIsNewSpecies] = useState(false);
    const [isTaxDefined, setIsTaxDefined] = useState(!formState.tax_sp_def);
    const adm = [
        {name: "country", heading: "Страна" },
        {name: "region", heading: "Регион" },
        {name: "district", heading: "Район" },
        {name: "gathering_place", heading: "Место сбора" },
    ]
    const [coodrFormat, setCoodrFormat] = useState("grads")

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

        console.log("Отправка данных:", formState);

        try {
            const recordData = {
                country: formState.country,
                region: formState.region,
                district: formState.district,
                place: formState.gathering_place,
                north: formState.coordinate_north,
                east: formState.coordinate_east,
                geo_REM: formState.geo_REM,
                begin_year: formState.begin_year,
                begin_month: formState.begin_month,
                begin_day: formState.begin_day,
                end_year: formState.end_year,
                end_month: formState.end_month,
                end_day: formState.end_day,
                family: formState.family,
                genus: formState.genus,
                species: formState.species,
                taxonomic_notes: formState.taxonomic_notes,
                tax_sp_def: formState.tax_sp_def,
                tax_nsp: formState.tax_nsp,
                type_status: formState.type_status,
                geo_origin: formState.geo_origin,
                collector: formState.collector,
                eve_effort: formState.selective_gain,
                eve_habitat: formState.biotope,
                eve_REM: formState.eve_REM,
                geo_uncert: formState.geo_uncert,
                adm_verbatim: formState.adm_verbatim
            };

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
                <div
                    className={getSectionClassName("Географическое положение")}
                >
                    <div
                        className={`section-header ${
                            collapsedSections["Географическое положение"]
                                ? "collapsed"
                                : ""
                        }`}
                    >
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
                            className="collapse-toggle"
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

                    {!collapsedSections["Географическое положение"] && (
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="coord-format">
                                    Формат координат
                                </label>
                                <select id="coord-format" onChange={
                                    (e) => {setCoodrFormat(e.target.value)}
                                }>
                                    <option value="grads">ГГ.гггг° (56.83777°)</option>
                                    <option value="mins">ГГ°ММ.мм' (56° 50.266')</option>
                                    <option value="secs">ГГ°ММ'СС'' (56° 50' 15.99")</option>
                                </select>
                            </div>
                            {coodrFormat === "grads" ?
                                <>
                                <div className="form-group">

                                    <label>Широта (N):</label>
                                    <input
                                        className="text-input"
                                        type="text"
                                        name="coordinate_north"
                                        value={formState.coordinate_north}
                                        onChange={handleInputChange}
                                        placeholder="00.0000"
                                    />
                                    <label>Долгота (E):</label>
                                    <input
                                        className="text-input"
                                        type="text"
                                        name="coordinate_east"
                                        value={formState.coordinate_east}
                                        onChange={handleInputChange}
                                        placeholder="00.0000"
                                    />
                                </div>
                                </>:
                                coodrFormat === "mins" ?


                                    <div className="form-group">
                                        <label>Широта N°</label>
                                        <div className="form-row">
                                            <input id="grads" className="coord"/><label htmlFor="grads">°</label>
                                            <input id="mins" className="coord"/><label htmlFor="mins">'</label>
                                        </div>
                                        <label>Долгота E°</label>
                                        <div className="form-row">
                                            <input id="grads" className="coord"/><label htmlFor="grads">°</label>
                                            <input id="mins" className="coord"/><label htmlFor="mins">'</label>
                                        </div>
                                    </div>

                            :
                                    <div className="form-group">
                                        <label>Широта N°</label>
                                        <div className="form-row">
                                            <input id="grads" className="coord sec"/><label htmlFor="grads">°</label>
                                            <input id="mins" className="coord sec"/><label htmlFor="mins">'</label>
                                            <input id="mins" className="coord sec"/><label htmlFor="secs">"</label>
                                        </div>
                                        <label>Долгота E°</label>
                                        <div className="form-row">
                                            <input id="grads" className="coord sec"/><label htmlFor="grads">°</label>
                                            <input id="mins" className="coord sec"/><label htmlFor="mins">'</label>
                                            <input id="mins" className="coord sec"/><label htmlFor="secs">"</label>
                                        </div>
                                    </div>
                            }


                            <div className="form-group">
                                <label htmlFor="geo-origin">Происхождение координат:</label>
                                <select id="geo-origin"
                                        name="geo_origin"
                                        className="form-control"
                                        onChange={handleInputChange}>
                                    <option value=''></option>
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
                    )}
                </div>


                {/* Секция: Административное положение */}

                <div
                    className={getSectionClassName(
                        "Административное положение"
                    )}
                >
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
                            className="collapse-toggle"
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
                    {!collapsedSections["Административное положение"] && (
                        <div className="form-grid">
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
                                        value={formState[field.name]}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            ))}


                        </div>
                    )}
                </div>

                {/* Секция: Сбор материала */}
                <div className={getSectionClassName("Сбор материала")}>
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
                            className="collapse-toggle"
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

                    {!collapsedSections["Сбор материала"] && (
                        <div className="form-grid">
                            <DateSelect getSectionData={getSectionData} />
                            <div className="form-group">
                                <label>Коллектор:</label>
                                <input
                                    className="text-input"
                                    type="text"
                                    name="collector"
                                    value={formState.collector}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Единицы измерения:</label>
                                <input
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
                                <label>Выборочное усиление:</label>
                                <input
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
                    )}
                </div>

                {/* Секция: Таксономия */}
                <div className={getSectionClassName("Таксономия")}>
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
                            className="collapse-toggle"
                            type="button"
                            onClick={() => toggleCollapseSection("Таксономия")}
                        >
                            {collapsedSections["Таксономия"]
                                ? "Развернуть"
                                : "Свернуть"}
                        </button>
                    </div>

                    {!collapsedSections["Таксономия"] && (
                        <div className="form-grid">

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
                                                    family: '',
                                                    genus: '',
                                                    species: '',}))
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
                                        checked={isNewSpecies}
                                        onChange={() => setIsNewSpecies(!isNewSpecies)}
                                    />
                                    <label htmlFor="is_new_species">Описан, как новый вид</label>
                                </div>

                                {isNewSpecies && (
                                    <div className='form-group'>
                                        <label htmlFor="type_status">Типовой статус:</label>
                                        <select
                                            id="type_status"
                                            name="type_status"
                                            value={formState.type_status ?? ''}
                                            onChange={handleInputChange}
                                        >
                                            <option value=''></option>
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
                                <label>Таксономические примечания:</label>
                                <textarea
                                    name="taxonomic_notes"
                                    value={formState.taxonomic_notes}
                                    onChange={handleInputChange}
                                    rows={3}
                                />
                            </div>


                        </div>
                    )}
                </div>

                {/* Секция: Добавление особей (без возможности закрепления) */}
                <div className="section">
                    <h4>Добавление особей</h4>
                    <SpecimenForm
                        value={
                            Object.keys(formState.specimens).length > 0
                                ? Object.entries(formState.specimens).map(
                                    ([key, count]) => {
                                        const [gender, maturity] =
                                            key.split("_");
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
