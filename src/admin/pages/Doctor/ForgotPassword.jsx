import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DOCTOR_MESSAGES, showError, showSuccess } from '../../utils/doctorToast';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const verifyEmail = () => {
    if (!email) {
      showError(DOCTOR_MESSAGES.accountNotFoundWithIdentifier);
      return;
    }
    setStep(2);
  };

  const verifyOtp = () => {
    if (otp !== '123456') {
      showError(DOCTOR_MESSAGES.accountNotFoundWithIdentifier);
      return;
    }
    setStep(3);
  };

  const resetPassword = () => {
    if (!newPassword) {
      showError(DOCTOR_MESSAGES.newPasswordCannotBeEmpty);
      return;
    }
    if (!confirmPassword) {
      showError(DOCTOR_MESSAGES.fillRequiredFields);
      return;
    }
    if (newPassword !== confirmPassword) {
      showError(DOCTOR_MESSAGES.passwordsDoNotMatch);
      return;
    }
    showSuccess(DOCTOR_MESSAGES.passwordResetSuccess);
    navigate('/admin-dashboard');
  };

  return (
    <div className="doctor-forgot-page">
      <div className="doctor-forgot-card">
        <h1>Doctor Forgot Password</h1>
        <p>This page is for doctor login recovery only.</p>

        {step === 1 && (
          <>
            <label>Email</label>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="doctor email" />
            <button type="button" onClick={verifyEmail}>Verify Email</button>
          </>
        )}

        {step === 2 && (
          <>
            <label>OTP</label>
            <input type="text" value={otp} onChange={(event) => setOtp(event.target.value)} placeholder="Enter OTP" />
            <button type="button" onClick={verifyOtp}>Verify OTP</button>
          </>
        )}

        {step === 3 && (
          <>
            <label>New Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="New password"
            />
            <label>Confirm Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirm password"
            />
            <button type="button" className="doctor-forgot-toggle" onClick={() => setShowPassword((prev) => !prev)}>
              {showPassword ? 'Hide Password' : 'Show Password'}
            </button>
            <button type="button" onClick={resetPassword}>Reset Password</button>
          </>
        )}

        <Link to="/admin-dashboard" className="doctor-forgot-back-link">Back to Login</Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
