import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../api';
import FormModePage from './FormModePage';
import { FormProvider, defaultState } from './FormContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/editPage.css';

const EditRecordPage = () => {
  const { hash } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [originalData, setOriginalData] = useState(null);

  const mapRecordToFormState = (record) => {
    if (!record) return defaultState;
    
    return {
      ...defaultState,
      abu_ind_rem: record.abu_ind_rem || '',
      country: record.country || '',
      region: record.region || '',
      district: record.district || '',
      gathering_place: '',
      is_new_species: false,
      coordinate_north: '',
      coordinate_east: '',
      grads_north: '',
      grads_east: '',
      mins_north: '',
      mins_east: '',
      secs_north: '',
      secs_east: '',
      coordinate_format: 'grads',
      geo_origin: '',
      geo_uncert: '',
      adm_verbatim: null,
      geo_REM: '',
      place_notes: '',
      begin_year: 0,
      begin_month: 0,
      end_year: 0,
      end_month: 0,
      begin_date: '',
      end_date: '',
      eve_day_def: true,
      eve_REM: '',
      biotope: '',
      collector: '',
      measurement_units: '',
      selective_gain: '',
      matherial_notes: '',
      taxonomic_notes: '',
      family: '',
      genus: '',
      species: '',
      tax_nsp: null,
      tax_sp_def: null,
      type_status: null,
      specimens: {}
    };
  };

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const record = await apiService.getRecord(hash);
        setOriginalData(record);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        toast.error(`Ошибка загрузки записи: ${err.message}`, { 
          autoClose: 3000, 
          position: 'bottom-right' 
        });
        navigate('/profile');
      }
    };

    fetchRecord();
  }, [hash, navigate]);

  const handleSubmit = async (formData) => {
    try {
      const updatedRecord = {
        ...originalData,
        ...formData,
        is_defined_species: !formData.tax_sp_def,
        is_in_wsc: formData.tax_nsp,
        place: formData.gathering_place,
        east: formData.coordinate_east,
        north: formData.coordinate_north
      };

      await apiService.editRecord(hash, updatedRecord);
      toast.success("Изменения успешно сохранены!", { 
        autoClose: 3000, 
        position: 'bottom-right' 
      });
      navigate('/profile');
    } catch (error) {
      console.error("Ошибка при сохранении изменений:", error);
      toast.error("Произошла ошибка при сохранении изменений", { 
        autoClose: 3000, 
        position: 'bottom-right' 
      });
    }
  };

  if (loading) {
    return <div className="loading-message">Загрузка записи...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="edit-record-container">
      <FormProvider initialState={mapRecordToFormState(originalData)}>
        <FormModePage 
          isEditMode 
          onSubmit={handleSubmit}
          onCancel={() => navigate('/profile')}
        />
      </FormProvider>
      <ToastContainer />
    </div>
  );
};

export default EditRecordPage;