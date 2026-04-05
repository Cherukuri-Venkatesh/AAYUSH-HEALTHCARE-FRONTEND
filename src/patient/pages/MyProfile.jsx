import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { showError, showSuccess, showWarning, MESSAGES } from '../utils/toastService';
import { patientApiPut } from '../utils/api';
import '../styles/profile.css';

const MyProfile = () => {
  const { token, userData, setUserData, loadUserProfileData } = useContext(AppContext);
  const [isEdit, setIsEdit] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });

  if (!userData) {
    return <div className="alert alert-info">Loading profile...</div>;
  }

  const saveProfile = async () => {
    if (!token) {
      showError(MESSAGES.sessionExpired);
      return;
    }

    if (!userData.name?.trim()) {
      showWarning(MESSAGES.nameCannotBeEmpty);
      return;
    }

    try {
      const response = await patientApiPut('patient/me', {
        name: userData.name,
        age: userData.age ? Number(userData.age) : null,
        gender: userData.gender || '',
        addressLine1: userData.address?.line1 || '',
        addressLine2: userData.address?.line2 || '',
      });

      if (!response || !response.success) {
        throw new Error(response?.error || MESSAGES.profileUpdateFailed);
      }

      showSuccess(MESSAGES.profileUpdated);
      setIsEdit(false);
      await loadUserProfileData();
    } catch (error) {
      showError(error?.message || MESSAGES.profileUpdateFailed);
    }
  };

  const handlePasswordChange = async () => {
    if (!token) {
      showError(MESSAGES.sessionExpired);
      return;
    }

    if (!passwordForm.newPassword.trim()) {
      showWarning(MESSAGES.newPasswordEmpty);
      return;
    }

    if (passwordForm.newPassword.trim().length < 6) {
      showWarning(MESSAGES.passwordMin6);
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showWarning(MESSAGES.passwordsMismatch);
      return;
    }

    try {
      const response = await patientApiPut('patient/password', {
        newPassword: passwordForm.newPassword,
      });

      if (!response || !response.success) {
        throw new Error(response?.error || MESSAGES.profileUpdateFailed);
      }

      showSuccess(MESSAGES.passwordResetSuccess);
      setPasswordForm({ newPassword: '', confirmPassword: '' });
    } catch (error) {
      showError(error?.message || MESSAGES.profileUpdateFailed);
    }
  };

  return (
    <div className="py-4">
      <h1 className="h3 fw-bold mb-4">My Profile</h1>

      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">Name <span style={{ color: '#dc3545' }}>*</span></label>
                  <input
                    className="form-control"
                    value={userData.name || ''}
                    disabled={!isEdit}
                    onChange={(event) => setUserData((prev) => ({ ...prev, name: event.target.value }))}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">Age <span style={{ color: '#dc3545' }}>*</span></label>
                  <input
                    className="form-control"
                    type="number"
                    value={userData.age || ''}
                    disabled={!isEdit}
                    onChange={(event) => setUserData((prev) => ({ ...prev, age: event.target.value }))}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">Gender <span style={{ color: '#dc3545' }}>*</span></label>
                  <select
                    className="form-select"
                    value={userData.gender || ''}
                    disabled={!isEdit}
                    onChange={(event) => setUserData((prev) => ({ ...prev, gender: event.target.value }))}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">Email (Read-only)</label>
                  <input className="form-control" value={userData.email || ''} disabled />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">Phone (Read-only)</label>
                  <input className="form-control" value={userData.phone || ''} disabled />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">Address Line 1 <span style={{ color: '#dc3545' }}>*</span></label>
                  <input
                    className="form-control"
                    value={userData.address?.line1 || ''}
                    disabled={!isEdit}
                    onChange={(event) => setUserData((prev) => ({
                      ...prev,
                      address: { ...prev.address, line1: event.target.value },
                    }))}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">Address Line 2</label>
                  <input
                    className="form-control"
                    value={userData.address?.line2 || ''}
                    disabled={!isEdit}
                    onChange={(event) => setUserData((prev) => ({
                      ...prev,
                      address: { ...prev.address, line2: event.target.value },
                    }))}
                  />
                </div>
              </div>

              <div className="d-flex gap-2 mt-4">
                {isEdit ? (
                  <>
                    <button className="btn btn-primary" style={{ background: '#5F6FFF', borderColor: '#5F6FFF' }} onClick={saveProfile}>
                      Save Profile
                    </button>
                    <button className="btn btn-outline-secondary" onClick={() => setIsEdit(false)}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <button className="btn btn-outline-primary" onClick={() => setIsEdit(true)}>
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <h2 className="h5 fw-bold mb-3">Change Password</h2>
              <div className="mb-3">
                <label className="form-label fw-semibold">New Password <span style={{ color: '#dc3545' }}>*</span></label>
                <input
                  type="password"
                  className="form-control"
                  value={passwordForm.newPassword}
                  onChange={(event) => setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))}
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Confirm Password <span style={{ color: '#dc3545' }}>*</span></label>
                <input
                  type="password"
                  className="form-control"
                  value={passwordForm.confirmPassword}
                  onChange={(event) => setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                />
              </div>
              <button className="btn btn-primary w-100" style={{ background: '#5F6FFF', borderColor: '#5F6FFF' }} onClick={handlePasswordChange}>
                Update Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
