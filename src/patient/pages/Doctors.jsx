import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DoctorCard from '../components/DoctorCard';
import { showError, showWarning, MESSAGES } from '../utils/toastService';
import { fetchDoctorsForPatient } from '../utils/doctorApi';
import '../styles/doctors.css';

const Doctors = () => {
  const { speciality } = useParams();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);

  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    hospital: '',
    doctorId: '',
    specialisation: speciality ? decodeURIComponent(speciality) : '',
    degree: '',
    address: '',
  });

  useEffect(() => {
    if (speciality) {
      setFilters((prev) => ({ ...prev, specialisation: decodeURIComponent(speciality) }));
    }
  }, [speciality]);

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const data = await fetchDoctorsForPatient();
        setDoctors(data);
      } catch (error) {
        setDoctors([]);
        showError(MESSAGES.genericError);
      }
    };

    loadDoctors();
  }, []);

  const filteredDoctors = useMemo(() => {
    let result = [...doctors];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((doctor) => doctor.name.toLowerCase().includes(term));
    }

    if (filters.hospital.trim()) {
      const term = filters.hospital.toLowerCase();
      result = result.filter((doctor) => doctor.hospital.toLowerCase().includes(term));
    }

    if (filters.doctorId.trim()) {
      const term = filters.doctorId.toLowerCase();
      result = result.filter((doctor) => doctor._id.toLowerCase().includes(term));
    }

    if (filters.specialisation.trim()) {
      result = result.filter((doctor) => doctor.speciality === filters.specialisation);
    }

    if (filters.degree.trim()) {
      const term = filters.degree.toLowerCase();
      result = result.filter((doctor) => doctor.degree.toLowerCase().includes(term));
    }

    if (filters.address.trim()) {
      const term = filters.address.toLowerCase();
      result = result.filter((doctor) => `${doctor.address?.line1 || ''} ${doctor.address?.line2 || ''}`.toLowerCase().includes(term));
    }

    return result;
  }, [doctors, searchTerm, filters]);

  const availableSpecialities = useMemo(() => {
    return [...new Set(doctors.map((doctor) => doctor.speciality).filter(Boolean))].sort();
  }, [doctors]);

  const hasCriteria =
    searchTerm.trim() ||
    filters.hospital.trim() ||
    filters.doctorId.trim() ||
    filters.specialisation.trim() ||
    filters.degree.trim() ||
    filters.address.trim();

  const handleApplySearch = () => {
    if (!searchInput.trim() && !hasCriteria) {
      showWarning(MESSAGES.enterSearchCriteria);
      return;
    }
    setSearchTerm(searchInput.trim());
  };

  useEffect(() => {
    if (hasCriteria && filteredDoctors.length === 0) {
      showError(MESSAGES.doctorsNoResults);
    }
  }, [hasCriteria, filteredDoctors.length]);

  return (
    <div className="py-4">
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-1">Doctor Discovery</h1>
        <p className="text-secondary mb-0">Search and book appointments with experienced specialists.</p>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold">Doctor Name</label>
              <input
                type="text"
                className="form-control form-input"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search by doctor name"
              />
            </div>

            <div className="col-12 col-md-6 d-flex gap-2">
              <button className="btn btn-primary flex-fill" style={{ background: '#5F6FFF', borderColor: '#5F6FFF' }} onClick={handleApplySearch}>
                Search Doctors
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={() => {
                  setSearchInput('');
                  setSearchTerm('');
                  setFilters({ hospital: '', doctorId: '', specialisation: '', degree: '', address: '' });
                  navigate('/doctors');
                }}
              >
                Reset
              </button>
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label fw-semibold">Hospital Name</label>
              <input
                type="text"
                className="form-control form-input"
                value={filters.hospital}
                onChange={(event) => setFilters((prev) => ({ ...prev, hospital: event.target.value }))}
                placeholder="Filter by hospital"
              />
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label fw-semibold">Doctor ID</label>
              <input
                type="text"
                className="form-control form-input"
                value={filters.doctorId}
                onChange={(event) => setFilters((prev) => ({ ...prev, doctorId: event.target.value }))}
                placeholder="Filter by doctor ID"
              />
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label fw-semibold">Specialisation</label>
              <select
                className="form-select form-input"
                value={filters.specialisation}
                onChange={(event) => {
                  const value = event.target.value;
                  setFilters((prev) => ({ ...prev, specialisation: value }));
                  if (value) {
                    navigate(`/doctors/${encodeURIComponent(value)}`);
                  } else {
                    navigate('/doctors');
                  }
                }}
              >
                <option value="">All Specialisations</option>
                {availableSpecialities.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold">Degree</label>
              <input
                type="text"
                className="form-control form-input"
                value={filters.degree}
                onChange={(event) => setFilters((prev) => ({ ...prev, degree: event.target.value }))}
                placeholder="Filter by degree"
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold">Address</label>
              <input
                type="text"
                className="form-control form-input"
                value={filters.address}
                onChange={(event) => setFilters((prev) => ({ ...prev, address: event.target.value }))}
                placeholder="Filter by address"
              />
            </div>
          </div>
        </div>
      </div>

      {filteredDoctors.length === 0 ? (
        <div className="alert alert-info mb-0">No doctors found for the selected filters.</div>
      ) : (
        <div className="row g-4">
          {filteredDoctors.map((doctor) => (
            <div className="col-12 col-md-6 col-xl-4" key={doctor._id}>
              <DoctorCard
                doctor={doctor}
                onViewSchedule={() => navigate(`/appointment/${doctor._id}`)}
                onBookAppointment={() => navigate(`/appointment/${doctor._id}`)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Doctors;
