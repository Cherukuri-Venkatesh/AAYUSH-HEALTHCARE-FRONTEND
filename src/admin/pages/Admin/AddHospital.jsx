import React, { useState } from 'react';
import { ADMIN_MESSAGES, showError, showSuccess } from '../../utils/adminToast';
import { apiPost } from '../../utils/api';
import './AddDoctor.css';

const initialFormState = {
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  description: '',
};

const AddHospital = () => {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialFormState);

  const setField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const getPayloadFromForm = (formElement) => {
    const rawForm = new FormData(formElement);

    return {
      name: String(rawForm.get('name') || '').trim(),
      email: String(rawForm.get('email') || '').trim(),
      phone: String(rawForm.get('phone') || '').trim(),
      address: String(rawForm.get('address') || '').trim(),
      city: String(rawForm.get('city') || '').trim(),
      state: String(rawForm.get('state') || '').trim(),
      pincode: String(rawForm.get('pincode') || '').trim(),
      description: String(rawForm.get('description') || '').trim(),
    };
  };

  const validateForm = (payload) => {
    const requiredValues = Object.values(payload);

    if (requiredValues.some((value) => !value)) {
      showError(ADMIN_MESSAGES.allFieldsAreRequired);
      return false;
    }

    // Email validation
    const emailRegex = /^[a-zA-Z0-9]+@gmail\.com$/;
    if (!emailRegex.test(payload.email)) {
      showError('Email must be alphanumeric@gmail.com');
      return false;
    }

    // Phone validation - should have at least 10 digits
    const phoneDigits = payload.phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      showError('Phone number must have at least 10 digits');
      return false;
    }

    // Pincode validation
    const pincodeRegex = /^\d{6}$/;
    if (!pincodeRegex.test(payload.pincode)) {
      showError('Pincode must be exactly 6 digits.');
      return false;
    }

    return true;
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    const payload = getPayloadFromForm(event.currentTarget);

    if (!validateForm(payload)) return;

    setSubmitting(true);

    const response = await apiPost("hospitals/add", payload);
    
    if (response.success) {
      showSuccess('Hospital Added Successfully');
      setFormData(initialFormState);
    } else {
      showError(response.error || 'Failed to add hospital');
    }
    
    setSubmitting(false);
  };

  const renderRequiredLabel = (label, id) => (
    <label htmlFor={id} className="doctor-form-label">
      {label} <span>*</span>
    </label>
  );

  return (
    <form onSubmit={onSubmitHandler} className="add-doctor-form">
      <h2 className="add-doctor-title">Add New Hospital</h2>

      <div className="add-doctor-grid">
        <div className="doctor-form-fields">
          <div className="doctor-form-group">
            {renderRequiredLabel('Name')}
            <input
              name="name"
              type="text"
              className="doctor-form-input"
              value={formData.name}
              onChange={(e) => setField('name', e.target.value)}
            />
          </div>

          <div className="doctor-form-group">
            {renderRequiredLabel('Email')}
            <input
              name="email"
              type="email"
              className="doctor-form-input"
              value={formData.email}
              onChange={(e) => setField('email', e.target.value)}
              placeholder='hospital@gmail.com'
              pattern='^[a-zA-Z0-9]+@gmail\.com$'
            />
          </div>

          <div className="doctor-form-group">
            {renderRequiredLabel('Phone')}
            <input
              name="phone"
              type="tel"
              className="doctor-form-input"
              value={formData.phone}
              onChange={(e) => setField('phone', e.target.value)}
              placeholder='10-digit phone number'
              pattern='[0-9\s\-()]{10,15}'
            />
          </div>

          <div className="doctor-form-group">
            {renderRequiredLabel('Address')}
            <input
              name="address"
              type="text"
              className="doctor-form-input"
              value={formData.address}
              onChange={(e) => setField('address', e.target.value)}
            />
          </div>

          <div className="doctor-form-group">
            {renderRequiredLabel('City')}
            <input
              name="city"
              type="text"
              className="doctor-form-input"
              value={formData.city}
              onChange={(e) => setField('city', e.target.value)}
            />
          </div>

          <div className="doctor-form-group">
            {renderRequiredLabel('State')}
            <input
              name="state"
              type="text"
              className="doctor-form-input"
              value={formData.state}
              onChange={(e) => setField('state', e.target.value)}
            />
          </div>

          <div className="doctor-form-group">
            {renderRequiredLabel('Pincode')}
            <input
              name="pincode"
              type="text"
              className="doctor-form-input"
              value={formData.pincode}
              onChange={(e) => setField('pincode', e.target.value)}
              pattern='^\d{6}$'
              placeholder='6-digit pincode'
            />
          </div>
        </div>
      </div>

      <div className="doctor-about-section">
        {renderRequiredLabel('Description')}
        <textarea
          name="description"
          rows={5}
          className="doctor-form-textarea"
          value={formData.description}
          onChange={(e) => setField('description', e.target.value)}
        />
      </div>

      <div className="add-doctor-button-section">
        <button type="submit" className="add-doctor-submit-btn" disabled={submitting}>
          {submitting ? 'Saving...' : 'Add Hospital'}
        </button>
      </div>
    </form>
  );
};

export default AddHospital;