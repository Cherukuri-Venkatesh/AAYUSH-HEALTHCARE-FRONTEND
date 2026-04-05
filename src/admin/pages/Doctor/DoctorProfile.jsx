import React, { useContext, useEffect, useMemo, useState } from 'react';
import { DoctorContext } from '../../context/DoctorContext';
import { DOCTOR_MESSAGES, showError, showSuccess } from '../../utils/doctorToast';
import './DoctorProfile.css';

const readOnlyFields = ['id', 'hospital_id', 'hospitalName', 'email', 'whatsappNumber'];

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

const DoctorProfile = () => {
  const { dToken, profileData, setProfileData, updateProfileData } = useContext(DoctorContext);
  const [draftProfile, setDraftProfile] = useState(profileData || {});
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (profileData) {
      setDraftProfile(profileData);
    }
  }, [profileData]);

  const fieldRows = useMemo(
    () => [
      { key: 'id', label: 'id' },
      { key: 'name', label: 'name' },
      { key: 'email', label: 'email' },
      { key: 'password', label: 'password', type: 'password' },
      { key: 'specialization', label: 'specialization', type: 'select', options: SPECIALIZATION_OPTIONS },
      { key: 'consultingFees', label: 'consultingFees', type: 'number' },
      { key: 'degree', label: 'degree' },
      { key: 'experience', label: 'experience', type: 'select', options: EXPERIENCE_OPTIONS },
      { key: 'addressLine1', label: 'addressLine1' },
      { key: 'hospitalName', label: 'hospitalName' },
      { key: 'aboutDoctor', label: 'aboutDoctor', multiline: true },
      { key: 'whatsappNumber', label: 'whatsappNumber' },
      { key: 'hospital_id', label: 'hospital_id' },
    ],
    [],
  );

  const onFieldChange = (key, value) => {
    setDraftProfile((prev) => ({ ...prev, [key]: value }));
  };

  const onSave = async () => {
    if (!dToken) {
      showError(DOCTOR_MESSAGES.sessionExpiredLoginAgain);
      return;
    }

    if (!draftProfile.name) {
      showError(DOCTOR_MESSAGES.nameCannotBeEmpty);
      return;
    }

    if (!draftProfile.specialization) {
      showError(DOCTOR_MESSAGES.unableToUpdateProfile);
      return;
    }

    if (draftProfile.password && draftProfile.password.length < 6) {
      showError(DOCTOR_MESSAGES.passwordMinimumSix);
      return;
    }

    const payload = {
      name: draftProfile.name,
      specialization: draftProfile.specialization,
      consultingFees: Number(draftProfile.consultingFees || 0),
      degree: draftProfile.degree,
      experience: draftProfile.experience,
      addressLine1: draftProfile.addressLine1,
      aboutDoctor: draftProfile.aboutDoctor,
      whatsappNumber: draftProfile.whatsappNumber,
      password: draftProfile.password || '',
    };

    const updated = await updateProfileData(payload);
    if (!updated) {
      showError(DOCTOR_MESSAGES.unableToUpdateProfile);
      return;
    }

    const nextProfile = {
      ...updated,
      password: '',
      speciality: draftProfile.specialization,
      fees: Number(draftProfile.consultingFees || 0),
      image: updated.photo,
      _id: draftProfile.id,
    };

    setProfileData(nextProfile);
    setDraftProfile(nextProfile);
    setIsEditMode(false);
    showSuccess(DOCTOR_MESSAGES.profileUpdatedSuccess);
  };

  const onCancel = () => {
    setDraftProfile(profileData);
    setIsEditMode(false);
  };

  if (!profileData) {
    return (
      <div className="doctor-profile-page">
        <div className="doctor-profile-container">
          <header className="doctor-profile-header">
            <div className="doctor-profile-head-content">
              <h1>Loading profile...</h1>
            </div>
          </header>
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-profile-page">
      <div className="doctor-profile-container">
        <header className="doctor-profile-header">
          <div className="doctor-profile-head-content">
            <h1>{profileData.name}</h1>
            <p>{profileData.specialization} • {profileData.degree}</p>
            <small>Doctor ID: {profileData.id} | Hospital ID: {profileData.hospital_id}</small>
          </div>
        </header>

        <section className="doctor-profile-grid">
          {fieldRows.map((row) => {
            const readOnly = readOnlyFields.includes(row.key);
            const value = isEditMode ? draftProfile[row.key] : profileData[row.key];

            return (
              <article key={row.key} className="doctor-profile-field">
                <label>{row.label}</label>
                {isEditMode && !readOnly ? (
                  row.multiline ? (
                    <textarea
                      rows="4"
                      value={value}
                      onChange={(event) => onFieldChange(row.key, event.target.value)}
                    />
                  ) : row.type === 'select' ? (
                    <select
                      value={value || ''}
                      onChange={(event) => onFieldChange(row.key, event.target.value)}
                    >
                      {row.options.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={row.type || 'text'}
                      value={value}
                      onChange={(event) => onFieldChange(row.key, event.target.value)}
                    />
                  )
                ) : (
                  <div className={`doctor-profile-static ${readOnly ? 'doctor-profile-static-readonly' : ''}`}>
                    {row.key === 'password' ? '••••••••' : value}
                  </div>
                )}
              </article>
            );
          })}
        </section>

        <div className="doctor-profile-actions">
          {isEditMode ? (
            <>
              <button type="button" className="doctor-profile-btn doctor-profile-btn-save" onClick={onSave}>Save</button>
              <button type="button" className="doctor-profile-btn doctor-profile-btn-cancel" onClick={onCancel}>Cancel</button>
            </>
          ) : (
            <button type="button" className="doctor-profile-btn doctor-profile-btn-edit" onClick={() => setIsEditMode(true)}>Edit Profile</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
