import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiGet, getApiBaseUrl } from '../../utils/api';
import { DOCTOR_MESSAGES, showError, showSuccess } from '../../utils/doctorToast';
import '../../../patient/styles/appointments.css';
import './DoctorPatientProfile.css';

const DoctorPatientProfile = () => {
  const { patientId } = useParams();
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    const loadPatient = async () => {
      if (!patientId) return;
      const response = await apiGet(`patient-history/${patientId}`);
      if (response?.success && response.data) {
        setPatient(response.data);
      } else {
        setPatient(null);
      }
    };

    loadPatient();
  }, [patientId]);

  const visitHistory = useMemo(() => patient?.appointments || [], [patient]);
  const latestVisit = useMemo(() => {
    if (!visitHistory.length) return null;

    return [...visitHistory].sort((left, right) => {
      const leftKey = `${left.appointmentDate || ''} ${left.appointmentTime || ''}`;
      const rightKey = `${right.appointmentDate || ''} ${right.appointmentTime || ''}`;
      return rightKey.localeCompare(leftKey);
    })[0];
  }, [visitHistory]);

  if (!patient) {
    return (
      <div className="doctor-patient-profile-page">
        <div className="doctor-patient-profile-card">
          <h2>Patient not found</h2>
        </div>
      </div>
    );
  }

  const triggerDownload = async (path, successMessage, emptyMessage) => {
    if (!path) {
      showError(emptyMessage);
      return;
    }

    try {
      const token = localStorage.getItem('dToken') || localStorage.getItem('aToken');
      const response = await fetch(`${getApiBaseUrl()}files/download?path=${encodeURIComponent(path)}`, {
        method: 'GET',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Download failed (${response.status})`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = path.split('/').pop() || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showSuccess(successMessage);
    } catch (error) {
      showError(error?.message || DOCTOR_MESSAGES.unableToDownloadReport);
    }
  };

  const downloadPrescription = (path) => triggerDownload(path, DOCTOR_MESSAGES.prescriptionDownloadedSuccess, DOCTOR_MESSAGES.noPrescriptionsAvailable);

  const downloadLabReport = (path) => triggerDownload(path, DOCTOR_MESSAGES.reportDownloadedSuccess, DOCTOR_MESSAGES.noLabReportsAvailable);

  return (
    <div className="doctor-patient-profile-page">
      <div className="doctor-patient-profile-card">
        <header className="doctor-patient-profile-header">
          <h1>Patient Profile</h1>
          <p>Dedicated patient details with complete visit history timeline table</p>
        </header>

        <section className="doctor-patient-basic-card">
          <div className="table-responsive appointment-table-container">
            <table className="table table-bordered table-hover align-middle appointment-table doctor-patient-basic-table">
              <thead>
                <tr>
                  <th>patient id</th>
                  <th>name</th>
                  <th>phone</th>
                  <th>age</th>
                  <th>weight</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{patient.patientId}</td>
                  <td>{patient.patientName}</td>
                  <td>{patient.phone || 'N/A'}</td>
                  <td>{latestVisit?.age ?? 'N/A'}</td>
                  <td>{latestVisit?.weight ?? 'N/A'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="doctor-patient-history-card">
          <h2>Visit History Timeline</h2>
          <div className="table-responsive appointment-table-container">
            <table className="table table-bordered table-hover align-middle appointment-table doctor-patient-history-table">
              <thead>
                <tr>
                  <th>Appointment ID</th>
                  <th>Patient ID</th>
                  <th>Doctor ID</th>
                  <th>Issue</th>
                  <th>Appointment Date</th>
                  <th>Appointment Time</th>
                  <th>Consulting Fees</th>
                  <th>Payment Type</th>
                  <th>Prescription Download</th>
                  <th>Lab Report Download</th>
                </tr>
              </thead>
              <tbody>
                {visitHistory.map((visit) => (
                  <tr key={visit.appointmentId}>
                    <td>{visit.appointmentId}</td>
                    <td>{patient.patientId}</td>
                    <td>{visit.doctorId}</td>
                    <td>{visit.issue}</td>
                    <td>{visit.appointmentDate}</td>
                    <td>{visit.appointmentTime}</td>
                    <td>₹{visit.consultingFees ?? 'N/A'}</td>
                    <td>{visit.paymentType || 'N/A'}</td>
                    <td>
                      {(() => {
                        const canDownloadPrescription = visit.status === 'COMPLETED' && Boolean(visit.prescriptionPath);
                        return (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        disabled={!canDownloadPrescription}
                        onClick={() => canDownloadPrescription && downloadPrescription(visit.prescriptionPath)}
                      >
                        {canDownloadPrescription ? 'Download' : 'Not Uploaded'}
                      </button>
                        );
                      })()}
                    </td>
                    <td>
                      {(() => {
                        const canDownloadLabReport = visit.status === 'COMPLETED' && Boolean(visit.labReportPath);
                        return (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        disabled={!canDownloadLabReport}
                        onClick={() => canDownloadLabReport && downloadLabReport(visit.labReportPath)}
                      >
                        {canDownloadLabReport ? 'Download' : 'Not Uploaded'}
                      </button>
                        );
                      })()}
                    </td>
                  </tr>
                ))}
                {visitHistory.length === 0 && (
                  <tr>
                    <td colSpan="10" className="doctor-patient-empty-cell">{DOCTOR_MESSAGES.noAppointmentsFound}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DoctorPatientProfile;
