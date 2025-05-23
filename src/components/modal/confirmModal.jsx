import React from 'react';
import './confirmModal.css';

export const Modal = ({ isOpen, onClose, children, type = 'info' }) => {
  if (!isOpen) return null;

  const modalClass = `modal modal-${type}`;

  return (
    <div className="modal-overlay">
      <div className={modalClass}>
        <div className="modal-content">
          {children}
        </div>
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
      </div>
    </div>
  );
};

export const ConfirmationModal = ({ 
  isOpen, 
  onConfirm, 
  onCancel, 
  title, 
  message 
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal modal-confirm">
        <div className="modal-content">
          <h3>{title}</h3>
          <p>{message}</p>
          <div className="modal-actions">
            <button className="modal-button confirm" onClick={onConfirm}>
              Подтвердить
            </button>
            <button className="modal-button cancel" onClick={onCancel}>
              Отмена
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};