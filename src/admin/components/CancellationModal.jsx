import React, { useState } from 'react';
import './CancellationModal.css';

const CancellationModal = ({ isOpen, title, onClose, onConfirm }) => {
  const [reason, setReason] = useState('Doctor Not Available');
  const [customReason, setCustomReason] = useState('');

  if (!isOpen) return null;

  const submitHandler = () => {
    const finalReason = reason === 'Other' ? customReason.trim() : reason;
    if (!finalReason) return;
    onConfirm(finalReason);
    setReason('Doctor Not Available');
    setCustomReason('');
  };

  const closeHandler = () => {
    setReason('Doctor Not Available');
    setCustomReason('');
    onClose();
  };

  return (
    <div className="doctor-modal-overlay" role="dialog" aria-modal="true" aria-label="Cancellation reason modal">
      <div className="doctor-modal-card">
        <h3 className="doctor-modal-title">{title || 'Confirm Cancellation'}</h3>
        <label className="doctor-modal-label">Cancellation Reason</label>
        <select
          className="doctor-modal-select"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        >
          <option value="Doctor Not Available">Doctor Not Available</option>
          <option value="Medical Emergency">Medical Emergency</option>
          <option value="Hospital Duty Conflict">Hospital Duty Conflict</option>
          <option value="Other">Other</option>
        </select>

        {reason === 'Other' && (
          <textarea
            className="doctor-modal-textarea"
            rows="3"
            placeholder="Enter cancellation reason"
            value={customReason}
            onChange={(event) => setCustomReason(event.target.value)}
          />
        )}

        <div className="doctor-modal-actions">
          <button type="button" className="doctor-modal-btn doctor-modal-btn-secondary" onClick={closeHandler}>
            Cancel
          </button>
          <button
            type="button"
            className="doctor-modal-btn doctor-modal-btn-primary"
            onClick={submitHandler}
            disabled={reason === 'Other' && !customReason.trim()}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancellationModal;
