import React, { useState } from "react";
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
import { ToastContainer,toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const FIELD_GROUPS = {
  administrative: ["country", "region", "district", "gathering_place", "place_notes", "adm_verbatim"],
  geographical: ["east", "north", "coordinate_north", "coordinate_east", "grads_north", "grads_east", "mins_north", "mins_east", "secs_east", "secs_north", "geo_origin", "geo_REM", "geo_uncert"],
  material_collection: [
        "begin_date",
        "end_date",
        "begin_year",
        "end_year",
        "begin_month",
        "end_month",
        "end_day",
        "begin_day",
        "biotope",
        "collector",
        "measurement_units",
        "selective_gain",
        "eve_REM"
    ],
  taxonomy: ["family", "genus", "species", "taxonomic_notes", "tax_sp_def", "tax_nsp", "type_status"],
};

const SECTION_IDS = {
  GEOGRAPHICAL: "geographical",
  ADMINISTRATIVE: "administrative",
  MATERIAL: "material_collection",
  TAXONOMY: "taxonomy",
  ADD_SPECIMENS: "add_specimens"
};

const SectionControls = ({ 
  sectionName, 
  isPinned, 
  onPinToggle, 
  isCollapsed, 
  onCollapseToggle,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  t
}) => (
  	<div className="section-controls">
		<h4>{sectionName}</h4>
		<div className="section-buttons">
			{!isFirst && (
				<button 
					type="button" 
					className="move-button move-up" 
					onClick={() => onMoveUp(sectionName)}
					aria-label="Move section up"
				>
					<FaArrowUp />
				</button>
			)}
			{!isLast && (
				<button 
					type="button" 
					className="move-button move-down" 
					onClick={() => onMoveDown(sectionName)}
					aria-label="Move section down"
				>
					<FaArrowDown />
				</button>
			)}
			<PinToggle
				isChecked={isPinned}
				onChange={onPinToggle}
			/>
		</div>
		<button
			className={`collapse-toggle ${isCollapsed ? "collapsed" : ""}`}
			type="button"
			onClick={onCollapseToggle}
		>
			{isCollapsed ? t('sections.expand') : t('sections.collapse')}
		</button>
	</div>

);

const FormModePage = ({ isEditMode = false, onSubmit, onCancel }) => {
	const { t } = useTranslation('formPage');

	const fieldsMap = {
	    administrative: FIELD_GROUPS.administrative,
	    geographical: FIELD_GROUPS.geographical,
	    material_collection: FIELD_GROUPS.material_collection,
	    taxonomy: FIELD_GROUPS.taxonomy
	  };

    // Получение контекста формы
    const {
        formState,
        setFormState,
        pinnedSections,
        setPinnedSections,
        resetForm,
        collapsedSections,
        toggleCollapseSection,
    } = useFormContext();

    const [showResetModal, setShowResetModal] = useState(false);
    const [resetMode, setResetMode] = useState("soft");
    const adm = [
        {name: "country", heading: t('adm.country') },
        {name: "region", heading: t('adm.region') },
        {name: "district", heading: t('adm.district') },
        {name: "gathering_place", heading: t('adm.gathering_place') },
    ]

    // Обработчик изменений для текстовых полей
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormState((prev) => ({ ...prev, [name]: value }));
    };

    // Получение данных секции
    const getSectionData = (sectionName) => {
        return FIELD_GROUPS[sectionName].reduce((acc, field) => {
	        acc[field] = formState[field];
	        return acc;
	    }, {});
    };

    // Переключение закрепления секции
    const pinSection = (sectionName) => {
        setPinnedSections((prev) => {
            const newPinned = !prev[sectionName];


            return { ...prev, [sectionName]: newPinned };
        });
    };
		
		// Смена порядка секций
		const [sectionOrder, setSectionOrder] = useState(() => {
			const defaultOrder = [
			    SECTION_IDS.GEOGRAPHICAL,
			    SECTION_IDS.ADMINISTRATIVE,
			    SECTION_IDS.MATERIAL,
			    SECTION_IDS.TAXONOMY,
			    SECTION_IDS.ADD_SPECIMENS
			];
			
			const savedOrder = localStorage.getItem('sectionOrder');
			return savedOrder ? JSON.parse(savedOrder) : defaultOrder;
		});
		
		const moveSectionUp = (sectionName) => {
			setSectionOrder(prevOrder => {
				const index = prevOrder.indexOf(sectionName);
				if (index <= 0) return prevOrder; // Can't move up if already first
				
				const newOrder = [...prevOrder];
				[newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];

				// Save to localStorage
				localStorage.setItem('sectionOrder', JSON.stringify(newOrder));
				return newOrder;
			});
		};
		
		const moveSectionDown = (sectionName) => {
			setSectionOrder(prevOrder => {
				const index = prevOrder.indexOf(sectionName);
				if (index >= prevOrder.length - 1) return prevOrder; // Can't move down if already last
				
				const newOrder = [...prevOrder];
				[newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
				
				// Save to localStorage
				localStorage.setItem('sectionOrder', JSON.stringify(newOrder));
				return newOrder;
			});
		};

    // Обработчик отправки формы
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formState.specimens || Object.keys(formState.specimens).length === 0) {
            toast.error(t("toast.add_specimens"), { autoClose: 3000, position: 'bottom-right' });
            return;
        }

        try {
            const recordData = {
                abu_ind_rem: formState.abu_ind_rem,
                adm_verbatim: formState.adm_verbatim,
                begin_day: formState.begin_day || (parseInt(formState.begin_date.split('-')[2]) || null),
                begin_month: formState.begin_month || (parseInt(formState.begin_date.split('-')[1]) || null),
                begin_year: formState.begin_year || (parseInt(formState.begin_date.split('-')[0]) || null),
                biotope: formState.biotope,
                collector: formState.collector,
                country: formState.country,
                district: formState.district,
                east: formState.coordinate_east || formState.grads_east + (formState.grads_east && '°'),
                end_year: formState.end_year || (parseInt(formState.end_date.split('-')[0]) || null),
                end_month: formState.end_month || (parseInt(formState.end_date.split('-')[1]) || null),
                end_day: formState.end_day || (parseInt(formState.end_date.split('-')[2]) || null),
                eve_REM: formState.eve_REM,
                family: formState.family,
                genus: formState.genus,
                geo_origin: formState.geo_origin === 0 ? 'original' : formState.geo_origin,
                geo_REM: formState.geo_REM,
                geo_uncert: parseFloat(formState.geo_uncert),
                is_defined_species: !formState.tax_sp_def,
                is_in_wsc: formState.tax_nsp,
                is_new_species: formState.is_new_species,
                matherial_notes: formState.matherial_notes,
                measurement_units: formState.measurement_units,
                north: formState.coordinate_north || formState.grads_north + (formState.grads_north && '°'),
                place: formState.gathering_place,
                place_notes: formState.place_notes,
                region: formState.region,
                selective_gain: formState.selective_gain,
                species: formState.species,
                specimens: formState.specimens,
                taxonomic_notes: formState.taxonomic_notes,
                type_status: formState.type_status
            };
            if (isEditMode && onSubmit) {
            	await onSubmit(recordData)
            } else {
	            await apiService.insertRecord(recordData);
	            resetForm();
	            toast.success(t("toast.data_sent"), { autoClose: 3000, position: 'bottom-right'});
	        }
        } catch (error) {
            console.error("Error while sending data:", error);
            toast.error(t("toast.data_fail"), { autoClose: 3000, position: 'bottom-right' });
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

    const renderFormActions = () => (
	    <div className="form-actions">
		    <button type="submit" className="submit-button">
		        {isEditMode ? t("buttons.edit") : t("buttons.send")}
		    </button>
		      
		    {isEditMode ? (
		        <button
					type="button"
					className="cancel-button"
					onClick={onCancel}
		        >
		        	{t("buttons.cancel")}
		        </button>
		    ) : (
		        <div className="reset-buttons">
		          	<button
		            	type="button"
		            	className="reset-button soft-reset"
		            	onClick={() => {
		              		setResetMode("soft");
		              		setShowResetModal(true);
		            	}}
		          	>
		            	{t("buttons.clear")}
		          	</button>
		          	<button
		            	type="button"
		            	className="reset-button hard-reset"
		            	onClick={() => {
		            		setResetMode("hard");
		            		setShowResetModal(true);
		            	}}
		          	>
		            	{t("buttons.obliterate")}
		        	</button>
		        </div>
		     )}
	      	<ToastContainer />
	    </div>
  	);

    return (
        <>
            <div className="form-mode-container">
                {!isEditMode && (
                	<header>
	                    <h3>{t("header.title")}</h3>
	                    <p>{t("header.text")}</p>
	                    <Link to="/text" className="switch-mode-button">
	                        {t("header.button")}
	                    </Link>
	                </header>
	            )}

                <form onSubmit={handleSubmit} className="specimen-form">
					<ArticleInfo isEditMode={isEditMode} />
					
					{sectionOrder.map((sectionName, index) => {
						const isFirst = index === 0;
						const isLast = index === sectionOrder.length - 1;
						
						switch(sectionName) {
							case SECTION_IDS.GEOGRAPHICAL:
								return (
									<div key={sectionName} className={`${getSectionClassName(sectionName)} section`}>
										<div className={`section-header ${collapsedSections[sectionName] ? "collapsed" : ""}`}>
											<SectionControls
												sectionName={t(`sections.${sectionName}`)}
												isPinned={pinnedSections[sectionName] || false}
												onPinToggle={() => pinSection(sectionName)}
												isCollapsed={collapsedSections[sectionName]}
												onCollapseToggle={() => toggleCollapseSection(sectionName)}
												onMoveUp={() => moveSectionUp(sectionName)}
												onMoveDown={() => moveSectionDown(sectionName)}
												isFirst={isFirst}
												isLast={isLast}
												t={t}
											/>
										</div>

										<div className={`form-grid ${collapsedSections[sectionName] ? "collapsed" : ""}`}>
											<CoordinatesInput isDisabled={pinnedSections[sectionName] || false} />
											<div className="form-group">
												<label htmlFor="geo-origin">{t("geo.origin")}</label>
												<select
                                                    disabled={pinnedSections[sectionName] || false}
													id="geo-origin"
													name="geo_origin"
													className="form-control"
													value={formState.geo_origin}
													onChange={handleInputChange}
													required
												>
													<option value="original">{t("geo.origins.publ")}</option>
													<option value="volunteer">{t("geo.origins.own")}</option>
													<option value="nothing">{t("geo.origins.nothing")}</option>
												</select>
											</div>

											<div className="form-group">
												<label htmlFor="geo_uncert">{t("geo.uncert")}</label>
												<input
                                                    disabled={pinnedSections[sectionName] || false}
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
												<label htmlFor="geo_REM">{t("geo.rem")}</label>
												<textarea disabled={pinnedSections[sectionName] || false} id="geo_REM" name="geo_REM" value={formState.geo_REM} onChange={handleInputChange} />
											</div>
										</div>
									</div>
								);
								
							case SECTION_IDS.ADMINISTRATIVE:
								return (
									<div key={sectionName} className={`${getSectionClassName(sectionName)} section`}>
										<div className={`section-header ${collapsedSections[sectionName] ? "collapsed" : ""}`}>
											<SectionControls
												sectionName={t(`sections.${sectionName}`)}
												isPinned={pinnedSections[sectionName] || false}
												onPinToggle={() => pinSection(sectionName)}
												isCollapsed={collapsedSections[sectionName]}
												onCollapseToggle={() => toggleCollapseSection(sectionName)}
												onMoveUp={() => moveSectionUp(sectionName)}
												onMoveDown={() => moveSectionDown(sectionName)}
												isFirst={isFirst}
												isLast={isLast}
												t={t}
											/>
										</div>
										<div className={`form-grid section-content ${collapsedSections[sectionName] ? "collapsed" : ""}`}>
											<div className="form-group">
												<div className="form-row">
													<input
                                                        disabled={pinnedSections[sectionName] || false}
														id="adm_verbatim"
														name="adm_verbatim"
														type="checkbox"
														checked={formState.adm_verbatim ?? false}
														onChange={() => setFormState(prev => ({...prev, adm_verbatim: !formState.adm_verbatim}))}
													/>
													<label htmlFor="adm_verbatim">{t("adm.ural")}</label>
												</div>
											</div>

											{adm.map((field) => (
												<div key={field.name} className="form-group">
													<label htmlFor={field.name}>{field.heading}:</label>
													<input
                                                        disabled={pinnedSections[sectionName] || false}
														id={field.name}
														className="text-input"
														type="text"
														name={field.name}
														value={formState[field.name] || ""}
														onChange={handleInputChange}
														required={field.name !== "gathering_place"}
													/>
												</div>
											))}
										</div>
									</div>
								);
								
							case SECTION_IDS.MATERIAL:
								return (
									<div key={sectionName} className={`${getSectionClassName(sectionName)} section`}>
										<div className={`section-header ${collapsedSections[sectionName] ? "collapsed" : ""}`}>
											<SectionControls
												sectionName={t(`sections.${sectionName}`)}
												isPinned={pinnedSections[sectionName] || false}
												onPinToggle={() => pinSection(sectionName)}
												isCollapsed={collapsedSections[sectionName]}
												onCollapseToggle={() => toggleCollapseSection(sectionName)}
												onMoveUp={() => moveSectionUp(sectionName)}
												onMoveDown={() => moveSectionDown(sectionName)}
												isFirst={isFirst}
												isLast={isLast}
												t={t}
											/>
										</div>

										<div className={`form-grid section-content ${collapsedSections[sectionName] ? "collapsed" : ""}`}>
											<DateSelect getSectionData={getSectionData} disabled={pinnedSections[sectionName] || false} />
											<div className="form-group">
												<label htmlFor="biotope">{t("eve.biotope")}</label>
												<input
                                                    disabled={pinnedSections[sectionName] || false}
													id="biotope"
													className="text-input"
													type="text"
													name="biotope"
													value={formState.biotope}
													onChange={handleInputChange}
												/>
											</div>
											<div className="form-group">
												<label htmlFor="collector">{t("eve.collector")}</label>
												<input
                                                    disabled={pinnedSections[sectionName] || false}
													id="collector"
													className="text-input"
													type="text"
													name="collector"
													value={formState.collector}
													onChange={handleInputChange}
													required
												/>
											</div>

											<div className="form-group">
												<label htmlFor="measurement_units">{t("eve.units")}</label>
												<input
                                                    disabled={pinnedSections[sectionName] || false}
													id="measurement_units"
													className="text-input"
													type="text"
													name="measurement_units"
													value={formState.measurement_units || t("eve.def_units")}
													onChange={handleInputChange}
													required
												/>
											</div>

											<div className="form-group">
												<label htmlFor="selective_gain">{t("eve.effort")}</label>
												<input
                                                    disabled={pinnedSections[sectionName] || false}
													id="selective_gain"
													className="text-input"
													type="text"
													name="selective_gain"
													value={formState.selective_gain}
													onChange={handleInputChange}
												/>
											</div>

											<div className="form-group">
												<label htmlFor="eve_REM">{t("eve.rem")}</label>
												<textarea disabled={pinnedSections[sectionName] || false} id="eve_REM" name="eve_REM" value={formState.eve_REM} onChange={handleInputChange} />
											</div>
										</div>
									</div>
								);
								
							case SECTION_IDS.TAXONOMY:
								return (
									<div key={sectionName} className={`${getSectionClassName(sectionName)} section`}>
										<div className={`section-header ${collapsedSections[sectionName] ? "collapsed" : ""}`}>
											<SectionControls
												sectionName={t(`sections.${sectionName}`)}
												isPinned={pinnedSections[sectionName] || false}
												onPinToggle={() => pinSection(sectionName)}
												isCollapsed={collapsedSections[sectionName]}
												onCollapseToggle={() => toggleCollapseSection(sectionName)}
												onMoveUp={() => moveSectionUp(sectionName)}
												onMoveDown={() => moveSectionDown(sectionName)}
												isFirst={isFirst}
												isLast={isLast}
												t={t}
											/>
										</div>

										<div className={`form-grid section-content ${collapsedSections[sectionName] ? "collapsed" : ""}`}>
											<div className="form-group">
												<div className="form-row">
													<input
                                                        disabled={pinnedSections[sectionName] || false}
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
																setFormState(prev => ({...prev, species: ''}))
															}
														}}
													/>
													<label htmlFor="tax_sp_def">{t("tax.sp_def")}</label>
												</div>

												<div className="form-row">
													<input
                                                        disabled={pinnedSections[sectionName] || false}
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
																setFormState(prev => ({
																	...prev,
																	family: '',
																	genus: '',
																	species: '',
																}))
															}
														}}
													/>
													<label htmlFor="tax_nsp">{t("tax.in_list")}</label>
												</div>

												<div className="form-row">
													<input
                                                        disabled={pinnedSections[sectionName] || false}
														id="is_new_species"
														name="is_new_species"
														type="checkbox"
														checked={formState.is_new_species ?? false}
														onChange={() => setFormState(prev => ({...prev, is_new_species: !prev.is_new_species}))}
													/>
													<label htmlFor="is_new_species">{t("tax.type")}</label>
												</div>

												{formState.is_new_species && (
													<div className='form-group'>
														<label htmlFor="type_status">{t("tax.type")}</label>
														<select
                                                            disabled={pinnedSections[sectionName] || false}
															id="type_status"
															name="type_status"
															value={formState.type_status ?? ''}
															onChange={handleInputChange}
														>
															<option value='holotype'>{t("tax.types.holo")}</option>
															<option value='paratype'>{t("tax.types.para")}</option>
															<option value='neotype'>{t("tax.types.neo")}</option>
															<option value='other'>{t("tax.types.other")}</option>
														</select>
													</div>
												)}
											</div>
											<TaxonDropdown isDisabled={pinnedSections[sectionName] || false} isDefined={formState.tax_sp_def} isInList={formState.tax_nsp} />
											<div className="form-group">
												<label htmlFor="tax_REM">{t("tax.rem")}</label>
												<textarea
                                                    disabled={pinnedSections[sectionName] || false}
													id="tax_REM"
													name="taxonomic_notes"
													value={formState.taxonomic_notes}
													onChange={handleInputChange}
													rows={3}
												/>
											</div>
										</div>
									</div>
								);
								
							case SECTION_IDS.ADD_SPECIMENS:
								return (
									<div key={sectionName} className="section">
										<div className="section-header">
											<div className="section-controls">
												<h4>{t("sections.add_specimens")}</h4>
												{!isFirst && (
													<button 
														type="button" 
														className="move-button move-up" 
														onClick={() => moveSectionUp(sectionName)}
														aria-label="Move section up"
													>
														<FaArrowUp />
													</button>
												)}
												{!isLast && (
													<button 
														type="button" 
														className="move-button move-down" 
														onClick={() => moveSectionDown(sectionName)}
														aria-label="Move section down"
													>
														<FaArrowDown />
													</button>
												)}
											</div>
										</div>
										<div className="form-grid">
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
											<div className="form-group">
												<label htmlFor="comment" style={{ display: 'inline-block', marginBottom: '5px' }}>Комментарий:</label>
												<textarea
													id="comment"
													value={formState.abu_ind_rem}
													onChange={(e) => {
														setFormState({ ...formState, abu_ind_rem: e.target.value });
													}}
													style={{ width: '100%', padding: '8px' }}
												/>
											</div>
										</div>
									</div>
								);
								
							default:
								return null;
						}
					})}
					{renderFormActions()}
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
                            <h3>{t("modal.conf_act")}</h3>
                            <p>
                                {resetMode === "soft" ? t("modal.clear") : t("modal.obliterate")}
                            </p>
                            <div className="modal-actions">
                                <button
                                    className="confirm-button"
                                    onClick={handleResetConfirm}
                                >
                                    {t("modal.conf")}
                                </button>
                                <button
                                    className="cancel-button"
                                    onClick={() => setShowResetModal(false)}
                                >
                                    {t("modal.canc")}
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