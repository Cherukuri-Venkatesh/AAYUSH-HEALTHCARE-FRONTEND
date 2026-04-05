import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { showSuccess, showWarning, MESSAGES } from '../utils/toastService';
import '../styles/login.css';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: enter email/phone, 2: reset password
  const [identifier, setIdentifier] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone) => {
    const re = /^[0-9]{10}$/;
    return re.test(phone.replace(/\D/g, ''));
  };

  const handleStep1 = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!identifier.trim()) {
      newErrors.identifier = MESSAGES.allFieldsRequired;
    } else if (!validateEmail(identifier) && !validatePhone(identifier)) {
      newErrors.identifier = MESSAGES.resetAccountNotFound;
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      const isKnownAccount = identifier === 'patient@test.com' || identifier === '1234567890';
      if (!isKnownAccount) {
        showWarning(MESSAGES.resetAccountNotFound);
        return;
      }
      setStep(2);
    }
  };

  const handleStep2 = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!newPassword.trim()) {
      newErrors.newPassword = MESSAGES.newPasswordEmpty;
    } else if (newPassword.length < 6) {
      newErrors.newPassword = MESSAGES.passwordMin6;
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    }

    if (newPassword !== confirmPassword) {
      newErrors.match = MESSAGES.passwordsMismatch;
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      showSuccess(MESSAGES.passwordResetSuccess);
      setTimeout(() => navigate('/login'), 1200);
    }
  };

  return (
    <div className='min-vh-100 d-flex align-items-center justify-content-center bg-light py-4'>
      <div className='row w-100 max-w-lg-custom shadow-lg rounded-3 overflow-hidden' style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Left Side - Info Panel */}
        <div className='col-12 bg-primary-custom text-white p-5 d-flex flex-column justify-content-center' style={{ background: '#5F6FFF' }}>
          <h2 className='fs-3 fw-bold mb-3'>Reset Password</h2>
          <p className='mb-0'>
            {step === 1
              ? 'Enter your email or phone number associated with your account.'
              : 'Enter your new password to complete the reset process.'}
          </p>
        </div>

        {/* Right Side - Form */}
        <div className='col-12 p-5'>
          {step === 1 ? (
            <form onSubmit={handleStep1}>
              <h3 className='fs-5 fw-semibold mb-4'>Verify Your Account</h3>

              <div className='mb-3'>
                <label className='form-label form-label-custom'>Email or Phone Number</label>
                <input
                  type='text'
                  className='form-control form-input'
                  placeholder='Enter email or 10-digit phone'
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (errors.identifier) setErrors({ ...errors, identifier: '' });
                  }}
                />
                {errors.identifier && <div className='form-error'>{errors.identifier}</div>}
              </div>

              <button
                type='submit'
                className='btn btn-primary fw-semibold w-100'
                style={{ background: '#5F6FFF' }}
              >
                Continue
              </button>

              <div className='text-center mt-3'>
                <a href='/login' className='text-decoration-none' style={{ color: '#5F6FFF' }}>
                  Back to Login
                </a>
              </div>
            </form>
          ) : (
            <form onSubmit={handleStep2}>
              <h3 className='fs-5 fw-semibold mb-4'>Set New Password</h3>

              <div className='mb-3'>
                <label className='form-label form-label-custom'>New Password</label>
                <input
                  type='password'
                  className='form-control form-input'
                  placeholder='Enter new password'
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (errors.newPassword) setErrors({ ...errors, newPassword: '' });
                  }}
                />
                {errors.newPassword && <div className='form-error'>{errors.newPassword}</div>}
              </div>

              <div className='mb-3'>
                <label className='form-label form-label-custom'>Confirm Password</label>
                <input
                  type='password'
                  className='form-control form-input'
                  placeholder='Confirm new password'
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                  }}
                />
                {errors.confirmPassword && <div className='form-error'>{errors.confirmPassword}</div>}
              </div>

              {errors.match && <div className='alert alert-danger' role='alert'>{errors.match}</div>}

              <button
                type='submit'
                className='btn btn-primary fw-semibold w-100 mb-3'
                style={{ background: '#5F6FFF' }}
              >
                Reset Password
              </button>

              <button
                type='button'
                onClick={() => {
                  setStep(1);
                  setIdentifier('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setErrors({});
                }}
                className='btn btn-secondary fw-semibold w-100'
              >
                Back
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;