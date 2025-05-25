import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../api';
import FormModePage from './FormModePage';
import { FormProvider, defaultState } from './FormContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/editPage.css';
import { useTranslation } from 'react-i18next';

const EditRecordPage = () => {
    const {t} = useTranslation('editRecord');
    const {hash} = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [initialFormState, setInitialFormState] = useState(null);

    function transformSpecimens(specimens) {
        if (!specimens) return {};
        const codes = {
            mmm: {gender: 'male', maturity: 'adult'},
            fff: {gender: 'female', maturity: 'adult'},
            ssm: {gender: 'male', maturity: 'juvenile'},
            ssf: {gender: 'female', maturity: 'juvenile'},
            adu: {gender: 'undefined', maturity: 'adult'},
            juv: {gender: 'undefined', maturity: 'juvenile'},
        };

        const result = {};

        specimens
            .split('|')
            .map(entry => entry.trim())
            .filter(Boolean)
            .forEach(entry => {
                const [countStr, code] = entry.split(/\s+/);
                const count = parseInt(countStr);
                const specimenType = codes[code];

                if (!specimenType) {
                    throw new Error(`Unknown code: "${code}"`);
                }

                const key = `${specimenType.gender}_${specimenType.maturity}`;

                result[key] = (result[key] || 0) + count;
            });
        
        return result;
    }

    const parseCoordinate = (raw) => {
        if (!raw) return {grads: '', mins: '', secs: ''};

        if (raw.includes('.') && raw.includes('°')) {
            const grads = parseFloat(raw.replace('°', ''));
            
            return {
                grads: grads.toString(),
                mins: '',
                secs: ''
            };
        }

        const gradsMatch = raw.match(/(\d+)°/);
        const minsMatch = raw.match(/(\d+)'/);
        const secsMatch = raw.match(/([\d.]+)"/);

        return {
            grads: gradsMatch ? gradsMatch[1] : '',
            mins: minsMatch ? minsMatch[1] : '',
            secs: secsMatch ? secsMatch[1] : ''
        };
    };

    const mapRecordToFormState = (record) => {
        if (!record) {
            return defaultState;
        }

        const beginDate = record.eve_YY
            ? `${record.eve_YY}-${record.eve_MM ? String(record.eve_MM).padStart(2, '0') : '01'}-${record.eve_DD ? String(record.eve_DD).padStart(2, '0') : '01'}`
            : '';
        const endDate = record.eve_YY_end
            ? `${record.eve_YY_end}-${record.eve_MM_end ? String(record.eve_MM_end).padStart(2, '0') : '01'}-${record.eve_DD_end ? String(record.eve_DD_end).padStart(2, '0') : '01'}`
            : '';

        const north = parseCoordinate(record.geo_nn_raw);
        const east = parseCoordinate(record.geo_ee_raw);

        return {
            ...defaultState,
            abu_ind_rem: record.abu_ind_rem || '',
            country: record.adm_country || '',
            region: record.adm_region || '',
            district: record.adm_district || '',
            gathering_place: record.adm_loc || '',
            place_notes: record.geo_REM || '',
            adm_verbatim: "1",
            grads_north: north.grads,
            mins_north: north.mins,
            secs_north: north.secs,
            grads_east: east.grads,
            mins_east: east.mins,
            secs_east: east.secs,
            geo_origin: record.geo_origin || 'original',
            geo_REM: record.geo_REM || '',
            geo_uncert: record.geo_uncert || '',
            begin_date: beginDate,
            end_date: endDate,
            begin_year: record.eve_YY || '',
            begin_month: record.eve_MM || '',
            begin_day: record.eve_DD || '',
            end_year: record.eve_YY_end || '',
            end_month: record.eve_MM_end || '',
            end_day: record.eve_DD_end || '',
            eve_day_def: record.eve_DD !== null,
            biotope: record.eve_habitat || '',
            collector: record.abu_coll || '',
            measurement_units: 'Особи, шт.',
            selective_gain: record.eve_effort || '',
            eve_REM: record.eve_REM || '',
            family: record.tax_fam || '',
            genus: record.tax_gen || '',
            species: record.tax_sp || '',
            tax_sp_def: !record.tax_sp_def !== undefined ? !record.tax_sp_def : true,
            tax_nsp: record.tax_nsp || false,
            is_new_species: record.is_new_species || false,
            taxonomic_notes: record.tax_REM || '',
            type_status: record.type_status || '',
            specimens: transformSpecimens(record.abu_details) || {}
        };
    };

    useEffect(() => {
        const fetchRecord = async () => {
            try {
                const record = await apiService.getRecord(hash);
                const formState = mapRecordToFormState(record);
                setInitialFormState(formState);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
                toast.error(t('errors.load_record', {error: err.message}));
                navigate('/profile');
            }
        };

        fetchRecord();
    }, [hash, navigate, t]);

    const cleanValue = (value) => {
        if (value === "" || value === null || value === undefined ||
            (Array.isArray(value) && value.length === 0) ||
            value === 0 || value === 0.0) {
            return null;
        }

        return value;
    };

    const specimenParse = (specimens) => {
        if (!specimens) return [null, 0];

        const entries = [];
        let total = 0;
        const values = [];

        const addEntry = (count, label) => {
            if (count !== null && count !== 0) {
                values.push(count);
                entries.push(`${Number.isInteger(count) ? count : count} ${label}`);
                total += count;
            }
        };

        if ("male_adult" in specimens) addEntry(specimens.male_adult, "mmm");
        if ("female_adult" in specimens) addEntry(specimens.female_adult, "fff");
        if ("male_juvenile" in specimens) addEntry(specimens.male_juvenile, "ssm");
        if ("female_juvenile" in specimens) addEntry(specimens.female_juvenile, "ssf");
        if ("undefined_adult" in specimens) addEntry(specimens.undefined_adult, "adu");
        if ("undefined_juvenile" in specimens) addEntry(specimens.undefined_juvenile, "juv");

        if (entries.length > 0) {
            const allWhole = values.every(v => Number.isInteger(v));
            const result = entries.join(" | ");
            return [result, allWhole ? parseInt(total) : parseFloat(total.toFixed(6))];
        }
        return [null, 0];
    };

    const numOfSpecimen = (specimens) => {
        if (!specimens) return 0;
        let count = 0;

        const counts = [
            cleanValue(specimens.male_adult),
            cleanValue(specimens.female_adult),
            cleanValue(specimens.male_juvenile),
            cleanValue(specimens.female_juvenile),
            cleanValue(specimens.undefined_adult),
            cleanValue(specimens.undefined_juvenile)
        ];

        counts.forEach(c => {
            if (c !== null) {
                count += c;
            }
        });

        return count;
    };

    const reevalCoordinate = (coord) => {
        if (!coord) return null;
        const str = coord.trim();

        // Degree only: 59°
        const degOnlyMatch = str.match(/^(-?\d+(?:\.\d+)?)°(?!\S)$/);
        if (degOnlyMatch) {
            return parseFloat(degOnlyMatch[1]);
        }

        // Degree + minutes: 59°29'
        const degMinMatch = str.match(/^(\d{1,3})°\s*(\d{1,2})'$/);
        if (degMinMatch) {
            const degrees = parseInt(degMinMatch[1]);
            const minutes = parseInt(degMinMatch[2]);
            return parseFloat((degrees + (minutes / 60)).toFixed(6));
        }

        // Degree + minutes + seconds: 56°51'10"
        const degMinSecMatch = str.match(/^(\d{1,3})°\s*(\d{1,2})'\s*(\d{1,2})(?:["″])?$/);
        if (degMinSecMatch) {
            const degrees = parseInt(degMinSecMatch[1]);
            const minutes = parseInt(degMinSecMatch[2]);
            const seconds = parseInt(degMinSecMatch[3]);
            return parseFloat((degrees + (minutes / 60) + (seconds / 3600)).toFixed(6));
        }

        throw new Error(`Invalid coordinate format: ${coord}`);
    };

    const safeCoordParse = (coord) => {
        if (!coord) return null;
        try {
            return reevalCoordinate(coord);
        } catch (e) {
            console.error(`Value error: ${e}`);
            return null;
        }
    };

    const handleSubmit = async (formData) => {
        try {
            const north = safeCoordParse(formData.coordinate_north);
            const east = safeCoordParse(formData.coordinate_east);
            const [specimenDetails, specimenCount] = specimenParse(formData.specimens);

            const updatedRecord = {
                hash,
                abu: specimenCount,
                abu_details: specimenDetails,
                abu_coll: cleanValue(formData.collector),
                abu_ind_rem: cleanValue(formData.abu_ind_rem),
                adm_country: cleanValue(formData.country),
                adm_region: cleanValue(formData.region),
                adm_district: cleanValue(formData.district),
                adm_loc: cleanValue(formData.gathering_place),
                geo_nn_raw: cleanValue(formData.coordinate_north),
                geo_ee_raw: cleanValue(formData.coordinate_east),
                geo_origin: cleanValue(formData.geo_origin),
                geo_REM: cleanValue(formData.geo_REM),
                geo_uncert: cleanValue(formData.geo_uncert),
                eve_YY: cleanValue(formData.eve_YY),
                eve_YY_end: cleanValue(formData.eve_YY_end),
                eve_MM: cleanValue(formData.eve_MM),
                eve_MM_end: cleanValue(formData.eve_MM_end),
                eve_DD: cleanValue(formData.eve_DD),
                eve_DD_end: cleanValue(formData.eve_DD_end),
                eve_day_def: cleanValue(formData.eve_DD !== null),
                eve_habitat: cleanValue(formData.biotope),
                eve_effort: cleanValue(formData.selective_gain),
                eve_REM: cleanValue(formData.eve_REM),
                tax_fam: cleanValue(formData.family),
                tax_gen: cleanValue(formData.genus),
                tax_sp: cleanValue(formData.species),
                tax_sp_def: !cleanValue(formData.tax_sp_def),
                tax_nsp: cleanValue(formData.tax_nsp),
                tax_REM: cleanValue(formData.taxonomic_notes),
                type_status: cleanValue(formData.type_status)
            };

            await apiService.editRecord(hash, updatedRecord);
            toast.success(t('success.saved'));
            navigate('/profile');
        } catch (error) {
            console.error(t('errors.save_failed'), error);
            toast.error(t('errors.save_failed'));
        }
    };

    if (loading) {
        return <div className="loading-message">{t('status.loading')}</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    if (!initialFormState) {
        return <div className="loading-message">{t('status.preparing_form')}</div>;
    }

    return (
        <div className="edit-record-container">
            <FormProvider key={hash} initialState={initialFormState} isEditMode>
                <FormModePage
                    isEditMode
                    onSubmit={handleSubmit}
                    onCancel={() => navigate('/profile')}
                />
            </FormProvider>
            <ToastContainer/>
        </div>
    );
};

export default EditRecordPage;