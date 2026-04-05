import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { showSuccess, showError, showWarning, MESSAGES } from '../utils/toastService';
import { BACKENDURL, callApi } from '../../lib';
import '../styles/login.css';

const InputField = ({ label, type = 'text', value, onChange, name, error, required = false, pattern, minLength, maxLength, min, max, placeholder = '' }) => (
  <div className='mb-3'>
    <label className='form-label form-label-custom'>
      {label} {required && <span style={{ color: '#dc3545' }}>*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      pattern={pattern}
      minLength={minLength}
      maxLength={maxLength}
      min={min}
      max={max}
      placeholder={placeholder}
      className='form-control form-input'
      required={required}
      style={error ? { borderColor: '#dc3545', backgroundColor: '#fff5f5' } : {}}
    />
    {error && <div className='form-error'>{error}</div>}
  </div>
);

const Login = () => {

  const [formType, setFormType] = useState('Sign Up');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    age: '',
    gender: ''
  });

  const [errors, setErrors] = useState({});

  const { token, setToken } = useContext(AppContext);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9]+@gmail\.com$/;
    return re.test(email);
  };

  const validatePhone = (phone) => {
    // Accept 10-15 digit numbers, with optional + and dashes
    const phoneRegex = /^[0-9\s\-()]{10,15}$/;
    const digitsOnly = phone.replace(/\D/g, '');
    return phoneRegex.test(phone) && digitsOnly.length >= 10;
  };

  const validatePassword = (password) => {
    return password && password.length >= 6;
  };

  const validateForm = () => {

    const newErrors = {};

    if (formType === 'Sign Up') {
      if (!formData.name.trim()) newErrors.name = MESSAGES.allFieldsRequired;
      
      if (!formData.phone.trim()) {
        newErrors.phone = MESSAGES.allFieldsRequired;
      } else if (!validatePhone(formData.phone)) {
        newErrors.phone = 'Phone must be 10+ digits';
      }
      
      if (!formData.age) {
        newErrors.age = MESSAGES.allFieldsRequired;
      } else if (formData.age < 1 || formData.age >= 120) {
        newErrors.age = 'Age must be between 1 and 119';
      }
      
      if (!formData.gender) newErrors.gender = MESSAGES.allFieldsRequired;
    }

    if (!formData.email.trim()) {
      newErrors.email = MESSAGES.allFieldsRequired;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email must be alphanumeric@gmail.com';
    }

    if (!formData.password.trim()) {
      newErrors.password = MESSAGES.allFieldsRequired;
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      showWarning(Object.values(validationErrors)[0] || MESSAGES.allFieldsRequired);
      return;
    }

    try {

      // =========================
      // SIGN UP (BACKEND CONNECTED)
      // =========================
      if (formType === 'Sign Up') {

        let data = JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          age: parseInt(formData.age),
          gender: formData.gender
        });

        callApi(
          "POST",
          BACKENDURL + "patients/register",
          data,
          (res) => {
            showSuccess(MESSAGES.registrationSuccess);

            setFormType('Login');
            setFormData({
              name: '',
              email: '',
              phone: '',
              password: '',
              age: '',
              gender: ''
            });
          }
        );

        return;
      }

      // =========================
      // LOGIN (BACKEND CONNECTED)
      // =========================
      else {

        if (!formData.email || !formData.password) {
          showWarning(MESSAGES.enterEmailPassword);
          return;
        }

        const response = await fetch(BACKENDURL + 'auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: formData.email.trim().toLowerCase(),
            password: formData.password,
            role: 'PATIENT'
          })
        });

        const tokenText = await response.text();

        if (!response.ok) {
          throw new Error(tokenText || MESSAGES.invalidCredentials);
        }

        localStorage.setItem('pToken', tokenText);
        localStorage.removeItem('token');
        setToken(tokenText);
        showSuccess(MESSAGES.loginSuccess);
        navigate('/');
      }

    } catch (error) {
      const message = error?.message || '';
      if (message.includes('Invalid Email') || message.includes('Invalid Password')) {
        showError(MESSAGES.invalidCredentials);
        return;
      }
      showError(message || MESSAGES.genericError);
    }
  };

  useEffect(() => {
    if (token) navigate('/');
  }, [token, navigate]);

  return (
    <div className='min-vh-100 d-flex align-items-center justify-content-center bg-light py-4'>
      <div className='row w-100 max-w-lg-custom shadow-lg rounded-3 overflow-hidden' style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* LEFT PANEL */}
        <div className='col-md-6 bg-primary-custom text-white p-5 d-flex flex-column justify-content-center' style={{ background: '#5F6FFF' }}>
          <h2 className='fs-3 fw-bold mb-3'>
            {formType === 'Sign Up' ? 'Welcome!' : 'Hello Again!'}
          </h2>
          <p className='mb-4'>
            {formType === 'Sign Up'
              ? 'Sign up to book appointments easily.'
              : 'Login to access your account and manage appointments.'}
          </p>

          <button
            onClick={() => {
              setFormType(formType === 'Sign Up' ? 'Login' : 'Sign Up');
              setErrors({});
              setFormData({
                name: '',
                email: '',
                phone: '',
                password: '',
                age: '',
                gender: ''
              });
            }}
            className='mt-auto btn btn-light fw-semibold'
          >
            {formType === 'Sign Up' ? 'Already have an account? Login' : 'Create new account'}
          </button>
        </div>

        {/* RIGHT FORM */}
        <form onSubmit={handleSubmit} className='col-md-6 p-5 d-flex flex-column justify-content-center'>

          <h2 className='fs-4 fw-semibold mb-4'>
            {formType === 'Sign Up' ? 'Create Account' : 'Login'}
          </h2>

          {formType === 'Sign Up' && (
            <>
              <InputField label='Full Name' value={formData.name} onChange={handleChange} name='name' error={errors.name} required />
              <InputField 
                label='Phone Number' 
                type='tel' 
                value={formData.phone} 
                onChange={handleChange} 
                name='phone' 
                error={errors.phone} 
                required
                placeholder='10-digit mobile number'
                pattern='[0-9\s\-()]{10,15}'
              />
              <InputField label='Age' type='number' value={formData.age} onChange={handleChange} name='age' error={errors.age} required min='1' max='119' />

              {/* Gender (same UI style maintained) */}
              <div className='mb-3'>
                <label className='form-label form-label-custom'>
                  Gender <span style={{ color: '#dc3545' }}>*</span>
                </label>
                <select
                  name='gender'
                  value={formData.gender}
                  onChange={handleChange}
                  className='form-control form-input'
                  required
                >
                  <option value=''>Select Gender</option>
                  <option value='MALE'>Male</option>
                  <option value='FEMALE'>Female</option>
                  <option value='OTHER'>Other</option>
                </select>
                {errors.gender && <div className='form-error'>{errors.gender}</div>}
              </div>
            </>
          )}

          <InputField 
            label='Email' 
            type='email' 
            value={formData.email} 
            onChange={handleChange} 
            name='email' 
            error={errors.email} 
            required
            placeholder='user@gmail.com'
          />
          <InputField 
            label='Password' 
            type='password' 
            value={formData.password} 
            onChange={handleChange} 
            name='password' 
            error={errors.password} 
            required
            minLength='6'
            placeholder='Minimum 6 characters'
          />

          <button type='submit' className='btn btn-primary fw-semibold py-2 mt-3' style={{ background: '#5F6FFF' }}>
            {formType === 'Sign Up' ? 'Sign Up' : 'Login'}
          </button>

          {formType === 'Login' && (
            <div className='text-center mt-3'>
              <a href='/forgot-password' className='text-decoration-none' style={{ color: '#5F6FFF' }}>
                Forgot Password?
              </a>
            </div>
          )}

        </form>

      </div>
    </div>
  );
};

export default Login;