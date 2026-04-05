import React from 'react'

const DoctorCard = ({ doctor, onViewSchedule, onBookAppointment }) => {
  const fullAddress = [doctor.address?.line1, doctor.address?.line2]
    .filter(Boolean)
    .join(', ');

  const doctorInitials = doctor.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

  return (
    <div className="card doctor-card h-100">
      <div className="doctor-identity-banner" aria-label={doctor.name}>
        <div className="doctor-identity-avatar">{doctorInitials}</div>
        <p className="doctor-identity-subtitle mb-0">Verified Specialist</p>
      </div>
      <div className="card-body d-flex flex-column">
        <h5 className="doctor-name mb-1">{doctor.name}</h5>
        <p className="doctor-speciality mb-2">{doctor.speciality}</p>
        <p className="doctor-detail mb-1"><strong>Doctor ID:</strong> {doctor.doctorId || doctor._id || 'N/A'}</p>
        <p className="doctor-detail mb-1"><strong>Degree:</strong> {doctor.degree}</p>
        <p className="doctor-detail mb-1"><strong>Experience:</strong> {doctor.experience}</p>
        <p className="doctor-detail mb-1"><strong>Hospital:</strong> {doctor.hospital}</p>
        <p className="doctor-detail mb-1"><strong>Hospital ID:</strong> {doctor.hospitalId || 'N/A'}</p>
        <p className="doctor-detail mb-1"><strong>Address:</strong> {fullAddress || 'N/A'}</p>
        <p className="doctor-fee mt-2 mb-3">₹{doctor.fees} Consultation Fee</p>

        <div className="doctor-actions mt-auto">
          <button className="btn btn-outline-primary btn-sm" onClick={onViewSchedule}>
            View Schedule
          </button>
          <button className="btn btn-primary btn-sm" style={{ background: '#5F6FFF', borderColor: '#5F6FFF' }} onClick={onBookAppointment}>
            Book Appointment
          </button>
        </div>
      </div>
    </div>
  )
}

export default DoctorCard
