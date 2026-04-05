import React, { useContext, useEffect, useMemo, useState } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { ADMIN_MESSAGES, showInfo } from '../../utils/adminToast';
import './DoctorsList.css';

const PAGE_SIZE = 6;

const DoctorsList = () => {
  const { doctors, aToken, getAllDoctors, deleteDoctor } = useContext(AdminContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('ALL');
  const [hospitalFilter, setHospitalFilter] = useState('ALL');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDoctorId, setConfirmDoctorId] = useState(null);

  useEffect(() => {
    if (aToken) getAllDoctors();
  }, [aToken]);

  const specializationOptions = useMemo(
    () => ['ALL', ...new Set(doctors.map((doctor) => doctor.specialization))],
    [doctors],
  );

  const hospitalOptions = useMemo(
    () => ['ALL', ...new Set(doctors.map((doctor) => doctor.hospitalName).filter(Boolean))],
    [doctors],
  );

  const filteredDoctors = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const rows = doctors.filter((doctor) => {
      const matchesQuery =
        !query ||
        [
          doctor.id,
          doctor.name,
          doctor.email,
          doctor.specialization,
          doctor.consultingFees,
          doctor.degree,
          doctor.experience,
          doctor.hospitalName,
          doctor.hospital_id,
          doctor.whatsappNumber,
        ]
          .join(' ')
          .toLowerCase()
          .includes(query);

      const matchesSpecialization = specializationFilter === 'ALL' || doctor.specialization === specializationFilter;
      const matchesHospital = hospitalFilter === 'ALL' || doctor.hospitalName === hospitalFilter;

      return matchesQuery && matchesSpecialization && matchesHospital;
    });

    return rows.sort((left, right) => {
      const leftValue = String(left[sortConfig.key] ?? '').toLowerCase();
      const rightValue = String(right[sortConfig.key] ?? '').toLowerCase();
      if (leftValue === rightValue) return 0;
      const compareValue = leftValue > rightValue ? 1 : -1;
      return sortConfig.direction === 'asc' ? compareValue : -compareValue;
    });
  }, [doctors, hospitalFilter, searchQuery, sortConfig.direction, sortConfig.key, specializationFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredDoctors.length / PAGE_SIZE));

  const pageRows = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredDoctors.slice(startIndex, startIndex + PAGE_SIZE);
  }, [currentPage, filteredDoctors]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const toggleSort = (key) => {
    setSortConfig((previous) =>
      previous.key === key
        ? { key, direction: previous.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' },
    );
  };

  const onDeleteConfirmed = async () => {
    if (!confirmDoctorId) return;
    await deleteDoctor(confirmDoctorId);
    setConfirmDoctorId(null);
  };

  return (
    <div className="admin-table-page">
      <header className="admin-table-page-header">
        <h1>Doctors Management</h1>
        <p>Enterprise doctor master records with full-field filtering, sorting and secure actions</p>
      </header>

      <section className="admin-table-panel">
        <div className="admin-table-filters">
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Quick search by ID, name, email, fees, degree, experience..."
          />
          <select value={specializationFilter} onChange={(event) => setSpecializationFilter(event.target.value)}>
            {specializationOptions.map((option) => (
              <option key={option} value={option}>
                {option === 'ALL' ? 'All Specializations' : option}
              </option>
            ))}
          </select>
          <select value={hospitalFilter} onChange={(event) => setHospitalFilter(event.target.value)}>
            {hospitalOptions.map((option) => (
              <option key={option} value={option}>
                {option === 'ALL' ? 'All Hospitals' : option}
              </option>
            ))}
          </select>
          <button type="button" onClick={() => showInfo(ADMIN_MESSAGES.confirmDeleteDoctor)}>
            Delete Help
          </button>
        </div>

        <div className="admin-table-scroll">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th><button type="button" onClick={() => toggleSort('id')}>ID</button></th>
                <th><button type="button" onClick={() => toggleSort('name')}>Name</button></th>
                <th><button type="button" onClick={() => toggleSort('email')}>Email</button></th>
                <th><button type="button" onClick={() => toggleSort('specialization')}>Specialization</button></th>
                <th><button type="button" onClick={() => toggleSort('consultingFees')}>Consulting Fees</button></th>
                <th><button type="button" onClick={() => toggleSort('degree')}>Degree</button></th>
                <th><button type="button" onClick={() => toggleSort('experience')}>Experience</button></th>
                <th><button type="button" onClick={() => toggleSort('addressLine1')}>Address Line 1</button></th>
                <th><button type="button" onClick={() => toggleSort('hospitalName')}>Hospital Name</button></th>
                <th><button type="button" onClick={() => toggleSort('aboutDoctor')}>About Doctor</button></th>
                <th><button type="button" onClick={() => toggleSort('whatsappNumber')}>Whatsapp Number</button></th>
                <th><button type="button" onClick={() => toggleSort('hospital_id')}>Hospital ID</button></th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((doctor) => (
                <tr key={doctor.id}>
                  <td>{doctor.id}</td>
                  <td>{doctor.name}</td>
                  <td>{doctor.email}</td>
                  <td>{doctor.specialization}</td>
                  <td>₹{Number(doctor.consultingFees).toLocaleString()}</td>
                  <td>{doctor.degree}</td>
                  <td>{doctor.experience}</td>
                  <td>{doctor.addressLine1}</td>
                  <td>{doctor.hospitalName}</td>
                  <td className="table-about-cell">{doctor.aboutDoctor}</td>
                  <td>{doctor.whatsappNumber}</td>
                  <td>{doctor.hospital_id}</td>
                  <td>
                    <button type="button" className="table-delete-btn" onClick={() => setConfirmDoctorId(doctor.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {!pageRows.length && (
                <tr>
                  <td colSpan="13" className="table-empty-cell">No doctors found for current filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="admin-table-footer">
          <span>Page {currentPage} of {totalPages}</span>
          <div>
            <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}>Previous</button>
            <button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}>Next</button>
          </div>
        </div>
      </section>

      {confirmDoctorId && (
        <div className="admin-confirm-overlay" role="dialog" aria-modal="true">
          <div className="admin-confirm-card">
            <p>{ADMIN_MESSAGES.confirmDeleteDoctor}</p>
            <div>
              <button type="button" onClick={() => setConfirmDoctorId(null)}>Cancel</button>
              <button type="button" onClick={onDeleteConfirmed}>Confirm Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorsList;
