import React, { useContext, useEffect, useMemo, useState } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { ADMIN_MESSAGES, showInfo } from '../../utils/adminToast';
import './AllAppointments.css';

const PAGE_SIZE = 8;

const AllAppointments = () => {
  const { aToken, patients, getAllPatients, deletePatient } = useContext(AdminContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmPatientId, setConfirmPatientId] = useState(null);

  useEffect(() => {
    if (aToken) getAllPatients();
  }, [aToken]);

  const filteredPatients = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const rows = patients.filter((patient) => {
      if (!query) return true;
      return [patient.id, patient.name, patient.email, patient.phone].join(' ').toLowerCase().includes(query);
    });

    return rows.sort((left, right) => {
      const leftValue = String(left[sortConfig.key] ?? '').toLowerCase();
      const rightValue = String(right[sortConfig.key] ?? '').toLowerCase();
      if (leftValue === rightValue) return 0;
      const compareValue = leftValue > rightValue ? 1 : -1;
      return sortConfig.direction === 'asc' ? compareValue : -compareValue;
    });
  }, [patients, searchQuery, sortConfig.direction, sortConfig.key]);

  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / PAGE_SIZE));

  const pageRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredPatients.slice(start, start + PAGE_SIZE);
  }, [currentPage, filteredPatients]);

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
    if (!confirmPatientId) return;
    await deletePatient(confirmPatientId);
    setConfirmPatientId(null);
  };

  return (
    <div className="admin-patients-page">
      <header className="admin-patients-header">
        <h1>Patients Management</h1>
        <p>Registered patient records with quick search, sorting, and controlled deletion</p>
      </header>

      <section className="admin-patients-panel">
        <div className="admin-patients-filters">
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Quick filter by ID, name, email or phone"
          />
          <button type="button" onClick={() => showInfo(ADMIN_MESSAGES.confirmDeletePatient)}>
            Delete Help
          </button>
        </div>

        <div className="admin-patients-table-wrap">
          <table className="admin-patients-table">
            <thead>
              <tr>
                <th><button type="button" onClick={() => toggleSort('id')}>ID</button></th>
                <th><button type="button" onClick={() => toggleSort('name')}>Name</button></th>
                <th><button type="button" onClick={() => toggleSort('email')}>Email</button></th>
                <th><button type="button" onClick={() => toggleSort('phone')}>Phone</button></th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((patient) => (
                <tr key={patient.id}>
                  <td>{patient.id}</td>
                  <td>{patient.name}</td>
                  <td>{patient.email}</td>
                  <td>{patient.phone}</td>
                  <td>
                    <button type="button" className="admin-patient-delete-btn" onClick={() => setConfirmPatientId(patient.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {!pageRows.length && (
                <tr>
                  <td colSpan="5" className="admin-patients-empty">No patients found for current filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="admin-patients-footer">
          <span>Page {currentPage} of {totalPages}</span>
          <div>
            <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}>Previous</button>
            <button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}>Next</button>
          </div>
        </div>
      </section>

      {confirmPatientId && (
        <div className="admin-patient-confirm-overlay" role="dialog" aria-modal="true">
          <div className="admin-patient-confirm-card">
            <p>{ADMIN_MESSAGES.confirmDeletePatient}</p>
            <div>
              <button type="button" onClick={() => setConfirmPatientId(null)}>Cancel</button>
              <button type="button" onClick={onDeleteConfirmed}>Confirm Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllAppointments;
