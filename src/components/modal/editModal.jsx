import React, { useState, useEffect } from 'react';
import { Modal } from './confirmModal';

const EditRecordModal = ({ 
  isOpen, 
  record, 
  onSave, 
  onCancel,
  loading,
  error 
}) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  // Initialize form when record changes
  useEffect(() => {
    if (record) {
      setFormData({
        species: record.species || '',
        author: record.author || '',
        abundance: record.abundance || '',
        locality: record.locality || '',
        even_date: record.even_date || '',
        // Add all other fields you need to edit
      });
    }
  }, [record]);

  const validateField = (name, value) => {
    switch (name) {
      case 'species':
        return value.trim() ? '' : 'Species is required';
      case 'abundance':
        return !isNaN(value) ? '' : 'Must be a number';
      // Add validations for other fields
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Validate on change
    setErrors(prev => ({
      ...prev,
      [name]: validateField(name, value)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      newErrors[key] = validateField(key, formData[key]);
    });
    setErrors(newErrors);

    // Submit if no errors
    if (!Object.values(newErrors).some(err => err)) {
      onSave({
        hash: record.hash,
        ...formData
      });
    }
  };

  if (!record) return null;

  return (
    <Modal isOpen={isOpen} onClose={onCancel}>
      <div className="edit-modal">
        <h2>Edit Record</h2>
        
        {error && (
          <div className="error-message">
            {typeof error === 'string' ? error : 'Failed to save record'}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Species</label>
            <input
              name="species"
              value={formData.species}
              onChange={handleChange}
              className={errors.species ? 'error' : ''}
            />
            {errors.species && <span className="error-text">{errors.species}</span>}
          </div>

          <div className="form-group">
            <label>Author</label>
            <input
              name="author"
              value={formData.author}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Abundance</label>
            <input
              name="abundance"
              value={formData.abundance}
              onChange={handleChange}
              className={errors.abundance ? 'error' : ''}
            />
            {errors.abundance && <span className="error-text">{errors.abundance}</span>}
          </div>

          <div className="form-group">
            <label>Locality</label>
            <input
              name="locality"
              value={formData.locality}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Collection Date</label>
            <input
              type="date"
              name="even_date"
              value={formData.even_date}
              onChange={handleChange}
            />
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default EditRecordModal;