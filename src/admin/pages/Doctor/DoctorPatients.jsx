import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet } from '../../utils/api';
import { DOCTOR_MESSAGES, showInfo } from '../../utils/doctorToast';
import '../../../patient/styles/appointments.css';
import './DoctorPatients.css';

const DoctorPatients = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState([]);

  const patientRows = useMemo(() => {
    return patients.map((patient) => ({
      ...patient,
      patientId: String(patient.patientId),
      appointmentId: String(patient.appointmentId),
      doctorId: String(patient.doctorId),
      status: patient.status || 'BOOKED',
    }));
  }, [patients]);

  useEffect(() => {
    const loadPatients = async () => {
      const response = await apiGet('doctor/patients');
      if (response?.success && Array.isArray(response.data)) {
        setPatients(response.data);
      } else {
        setPatients([]);
      }
    };

    loadPatients();
  }, []);

  const filteredPatients = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return patientRows.filter((patient) => {
      const searchable = [
        patient.name,
        patient.patientId,
        patient.doctorId,
        patient.phone,
        patient.age,
        patient.weight,
      ]
        .join(' ')
        .toLowerCase();

      const searchMatch = !query || searchable.includes(query);

      return searchMatch;
    });
  }, [patientRows, searchTerm]);

  const onSearchBlur = () => {
    if (!searchTerm.trim()) {
      showInfo(DOCTOR_MESSAGES.enterSearchCriteria);
    }
  };

  return (
    <div className="doctor-patients-page">
      <header className="doctor-patients-header">
        <h1>Patient Management</h1>
        <p>Comprehensive patient table with intelligent filtering and search controls</p>
      </header>

      <section className="doctor-patients-filter-card">
        <div className="doctor-patients-filter-grid">
          <div className="doctor-patients-filter-item search-item">
            <label htmlFor="patientSearch">Search</label>
            <input
              id="patientSearch"
              type="text"
              placeholder="patient id, patient name, doctor id, phone, age, weight"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              onBlur={onSearchBlur}
            />
          </div>
        </div>
      </section>

      <section className="doctor-patients-table-card">
        <div className="table-responsive appointment-table-container">
          <table className="table table-bordered table-hover align-middle appointment-table doctor-patient-table">
            <thead>
              <tr>
                <th>Patient ID</th>
                <th>Patient Name</th>
                <th>Doctor ID</th>
                <th>Phone</th>
                <th>Age</th>
                <th>Weight</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <tr key={patient.patientId}>
                    <td>{patient.patientId}</td>
                    <td>{patient.name}</td>
                    <td>{patient.doctorId}</td>
                    <td>{patient.phone}</td>
                    <td>{patient.age}</td>
                    <td>{patient.weight}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => navigate(`/doctor-patient/${patient.patientId}`)}
                      >
                        View Patient Profile
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="doctor-patient-empty-cell">{DOCTOR_MESSAGES.noAppointmentsFound}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default DoctorPatients;
