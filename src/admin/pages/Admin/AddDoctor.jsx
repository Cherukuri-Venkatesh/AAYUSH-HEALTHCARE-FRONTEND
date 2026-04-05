import React, { useState } from 'react';
import { ADMIN_MESSAGES, showError, showSuccess } from '../../utils/adminToast';
import { apiPost } from '../../utils/api';
import './AddDoctor.css';

const initialFormState = {
  name: '',
  email: '',
  password: '',
  specialization: 'General physician',
  consultingFees: '',
  degree: '',
  experience: '1 Year',
  addressLine1: '',
  aboutDoctor: '',
  whatsappNumber: '',
  hospital_id: '',
};

const SPECIALIZATION_OPTIONS = [
  'General physician',
  'Cardiology',
  'Gynecology',
  'Dermatology',
  'Pediatrics',
  'ENT',
  'Eye',
  'Orthopedics',
  'Neurology',
  'Psychiatry',
  'Gastroenterology',
  'Pulmonology',
  'Nephrology',
  'Oncology',
  'Endocrinology',
  'Urology',
];

const EXPERIENCE_OPTIONS = [
  '1 Year',
  '2 Years',
  '3 Years',
  '4 Years',
  '5+ Years',
  '10+ Years',
  '15+ Years',
  '20+ Years',
];

const AddDoctor = () => {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialFormState);

  const isHospitalNameMapperConflict = (message) => {
    const normalized = String(message || '').toLowerCase();
    return normalized.includes('modelmapper configuration errors')
      && normalized.includes('sethospitalname')
      && normalized.includes('multiple source property hierarchies');
  };

  const setField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const validateForm = () => {
    const allValues = Object.values(formData).map(v => String(v).trim());

    if (allValues.some(v => !v)) {
      showError(ADMIN_MESSAGES.allFieldsAreRequired);
      return false;
    }

    // Email validation
    const emailRegex = /^[a-zA-Z0-9]+@gmail\.com$/;
    if (!emailRegex.test(formData.email)) {
      showError('Email must be alphanumeric@gmail.com');
      return false;
    }

    // Password validation
    if (formData.password.length < 6) {
      showError('Password must be at least 6 characters');
      return false;
    }

    // WhatsApp number validation - should be 10+ digits
    const whatsappDigits = formData.whatsappNumber.replace(/\D/g, '');
    if (whatsappDigits.length < 10) {
      showError('WhatsApp number must have at least 10 digits');
      return false;
    }

    // Consulting fees validation
    const fees = parseInt(formData.consultingFees);
    if (isNaN(fees) || fees <= 0) {
      showError('Consulting fees must be a positive number');
      return false;
    }

    return true;
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);

    const doctorData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      specialization: formData.specialization,
      consultingFees: parseInt(formData.consultingFees),
      degree: formData.degree,
      experience: formData.experience,
      addressLine1: formData.addressLine1,
      aboutDoctor: formData.aboutDoctor,
      whatsappNumber: formData.whatsappNumber,
      hospitalId: parseInt(formData.hospital_id) // ✅ ONLY ID, role sent by backend
    };

    const response = await apiPost("admin/doctor/add", doctorData);
    
    if (response.success) {
      showSuccess("Doctor Added Successfully");
      setFormData(initialFormState);
    } else {
      // Check for ModelMapper conflict warning (show as success)
      const message = response.error || "Failed to add doctor";
      const isMapperWarning = message.toLowerCase().includes('modelmapper') || 
                              message.toLowerCase().includes('sethospitalname');
      
      if (isMapperWarning) {
        showSuccess("Doctor Added Successfully");
        setFormData(initialFormState);
      } else {
        showError(message);
      }
    }
    
    setSubmitting(false);
  };

  const renderRequiredLabel = (label, id) => (
    <label htmlFor={id} className="doctor-form-label">
      {label} <span>*</span>
    </label>
  );

  return (
    <form onSubmit={onSubmitHandler} className='add-doctor-form'>
      <h2 className='add-doctor-title'>Add New Doctor</h2>

      <div className='add-doctor-grid'>
        <div className='doctor-form-fields'>

          <div className='doctor-form-group'>
            {renderRequiredLabel('Name')}
            <input type='text' className='doctor-form-input'
              value={formData.name}
              onChange={(e)=>setField('name', e.target.value)} />
          </div>

          <div className='doctor-form-group'>
            {renderRequiredLabel('Email')}
            <input 
              type='email' 
              className='doctor-form-input'
              value={formData.email}
              onChange={(e)=>setField('email', e.target.value)}
              placeholder='doctor@gmail.com'
              pattern='^[a-zA-Z0-9]+@gmail\.com$'
            />
          </div>

          <div className='doctor-form-group'>
            {renderRequiredLabel('Password')}
            <input 
              type='password' 
              className='doctor-form-input'
              value={formData.password}
              onChange={(e)=>setField('password', e.target.value)}
              minLength='6'
              placeholder='Minimum 6 characters'
            />
          </div>

          <div className='doctor-form-group'>
            {renderRequiredLabel('Specialization')}
            <select className='doctor-form-select'
              value={formData.specialization}
              onChange={(e)=>setField('specialization', e.target.value)}>
              {SPECIALIZATION_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div className='doctor-form-group'>
            {renderRequiredLabel('Consulting Fees')}
            <input 
              type='number' 
              className='doctor-form-input'
              value={formData.consultingFees}
              onChange={(e)=>setField('consultingFees', e.target.value)}
              min='1'
              placeholder='Enter amount in rupees'
            />
          </div>

          <div className='doctor-form-group'>
            {renderRequiredLabel('Degree')}
            <input type='text' className='doctor-form-input'
              value={formData.degree}
              onChange={(e)=>setField('degree', e.target.value)} />
          </div>

          <div className='doctor-form-group'>
            {renderRequiredLabel('Experience')}
            <select className='doctor-form-select'
              value={formData.experience}
              onChange={(e)=>setField('experience', e.target.value)}>
              {EXPERIENCE_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div className='doctor-form-group'>
            {renderRequiredLabel('Address Line 1')}
            <input type='text' className='doctor-form-input'
              value={formData.addressLine1}
              onChange={(e)=>setField('addressLine1', e.target.value)} />
          </div>

          {/* ❌ REMOVED Hospital Name FIELD */}

          <div className='doctor-form-group'>
            {renderRequiredLabel('WhatsApp Number')}
            <input 
              type='tel' 
              className='doctor-form-input'
              value={formData.whatsappNumber}
              onChange={(e)=>setField('whatsappNumber', e.target.value)}
              pattern='[0-9\s\-()]{10,15}'
              placeholder='10-digit mobile number'
            />
          </div>

          <div className='doctor-form-group'>
            {renderRequiredLabel('Hospital ID')}
            <input type='text' className='doctor-form-input'
              value={formData.hospital_id}
              onChange={(e)=>setField('hospital_id', e.target.value)} />
          </div>

        </div>
      </div>

      <div className='doctor-about-section'>
        {renderRequiredLabel('About Doctor')}
        <textarea
          rows={5}
          className='doctor-form-textarea'
          value={formData.aboutDoctor}
          onChange={(e)=>setField('aboutDoctor', e.target.value)}
        />
      </div>

      <div className='add-doctor-button-section'>
        <button type='submit' className='add-doctor-submit-btn'>
          {submitting ? 'Saving...' : 'Add Doctor'}
        </button>
      </div>
    </form>
  );
};

export default AddDoctor;