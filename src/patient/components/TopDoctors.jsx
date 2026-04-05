import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DoctorCard from './DoctorCard';
import { fetchTopDoctorsForPatient } from '../utils/doctorApi';

const TopDoctors = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const data = await fetchTopDoctorsForPatient(6);
        setDoctors(data);
      } catch (error) {
        // Keep homepage stable even if public APIs are temporarily unavailable.
        setDoctors([]);
      }
    };

    loadDoctors();
  }, []);

  return (
    <section id="top-doctors-section" className="my-5">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <div>
          <h2 className="h3 fw-bold mb-1">Top Doctors</h2>
          <p className="text-secondary mb-0">Book with trusted specialists across top hospitals.</p>
        </div>
        <button className="btn btn-outline-primary" onClick={() => navigate('/doctors')}>View All Doctors</button>
      </div>

      <div className="row g-4">
        {doctors.map((doctor) => (
          <div className="col-12 col-md-6 col-xl-4" key={doctor._id}>
            <DoctorCard
              doctor={doctor}
              onViewSchedule={() => navigate(`/appointment/${doctor._id}`)}
              onBookAppointment={() => navigate(`/appointment/${doctor._id}`)}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default TopDoctors;