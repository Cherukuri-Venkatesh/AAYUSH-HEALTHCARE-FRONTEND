import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import RelatedDoctors from '../components/RelatedDoctors';
import { showError, showSuccess, showWarning, MESSAGES } from '../utils/toastService';
import { fetchDoctorsForPatient } from '../utils/doctorApi';
import { patientApiGet, patientApiPost } from '../utils/api';

const SLOT_TIMES = ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM'];

const formatDateKey = (date) => date.toISOString().split('T')[0];

const formatTo12Hour = (time24) => {
  const [hoursRaw, minutesRaw] = String(time24).split(':');
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw || 0);
  const period = hours >= 12 ? 'PM' : 'AM';
  const normalizedHour = hours % 12 === 0 ? 12 : hours % 12;
  return `${String(normalizedHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
};

const formatTo24Hour = (time12) => {
  const [time, modifier] = String(time12).trim().split(' ');
  if (!time || !modifier) return time12;
  let [hours, minutes] = time.split(':').map(Number);

  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
};

const Appointment = () => {
  const { docId } = useParams();
  const navigate = useNavigate();
  const { token, userData } = useContext(AppContext);
  const [doctors, setDoctors] = useState([]);

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [availableSlotsByDate, setAvailableSlotsByDate] = useState({});
  const [formData, setFormData] = useState({
    age: '',
    weight: '',
    symptoms: '',
    paymentType: '',
  });

  const doctor = useMemo(() => doctors.find((item) => item._id === docId), [doctors, docId]);
  const doctorInitials = useMemo(() => {
    if (!doctor?.name) return 'DR';
    return doctor.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase();
  }, [doctor]);

  const upcoming7Days = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() + index);
      return {
        key: formatDateKey(date),
        label: date.toLocaleDateString(),
      };
    });
  }, []);

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

  const loadAvailableSlots = async (dateKey) => {
    if (!doctor?.doctorId || !dateKey) return;

    const response = await patientApiGet(`schedule/available-slots?doctorId=${doctor.doctorId}&date=${dateKey}`);
    if (!response || !response.success) {
      showWarning(response?.error || MESSAGES.scheduleNotAvailable);
      return;
    }

    const slots = Array.isArray(response.data)
      ? response.data.map((slot) => formatTo12Hour(slot))
      : [];

    setAvailableSlotsByDate((prev) => ({ ...prev, [dateKey]: slots }));
  };

  useEffect(() => {
    if (!doctor) return;

    const initialDate = upcoming7Days[0]?.key || '';
    setSelectedDate(initialDate);
    if (initialDate) {
      loadAvailableSlots(initialDate);
    }
  }, [doctor, upcoming7Days]);

  useEffect(() => {
    if (!doctor && doctors.length > 0) {
      showError(MESSAGES.scheduleNotFound);
      navigate('/doctors');
    }
  }, [doctor, doctors.length, navigate]);

  const availableSlots = availableSlotsByDate[selectedDate] ?? SLOT_TIMES;
  const bookedSlots = SLOT_TIMES.filter((slot) => !availableSlots.includes(slot));

  const handleDateChange = (dateKey) => {
    setSelectedDate(dateKey);
    setSelectedSlot('');

    if (!doctor) {
      showError(MESSAGES.scheduleNotFound);
      return;
    }

    loadAvailableSlots(dateKey);
  };

  const handleBookAppointment = async (event) => {
    event.preventDefault();

    if (!token) {
      showError(MESSAGES.unauthorized);
      navigate('/login');
      return;
    }

    if (!selectedDate) {
      showWarning(MESSAGES.selectDoctorDateFirst);
      return;
    }

    if (!selectedSlot) {
      showWarning(MESSAGES.selectTimeSlot);
      return;
    }

    if (!formData.age || !formData.weight || !formData.symptoms) {
      showWarning(MESSAGES.fillRequiredFields);
      return;
    }

    if (!formData.paymentType) {
      showWarning(MESSAGES.selectPaymentType);
      return;
    }

    const selectedDateObj = new Date(selectedDate);
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 7);
    if (selectedDateObj > maxDate) {
      showError(MESSAGES.bookWithin7Days);
      return;
    }

    if (bookedSlots.includes(selectedSlot)) {
      showError(MESSAGES.slotNoLongerAvailable);
      return;
    }

    const response = await patientApiPost('patient/appointments/book', {
      doctorId: Number(doctor.doctorId),
      date: selectedDate,
      time: formatTo24Hour(selectedSlot),
      age: Number(formData.age),
      weight: Number(formData.weight),
      issue: formData.symptoms,
      paymentType: formData.paymentType,
    });

    if (!response || !response.success) {
      showError(response?.error || MESSAGES.genericError);
      return;
    }

    setAvailableSlotsByDate((prev) => ({
      ...prev,
      [selectedDate]: (prev[selectedDate] || []).filter((slot) => slot !== selectedSlot),
    }));
    showSuccess(MESSAGES.appointmentBooked);
    navigate('/my-appointments');
  };

  if (!doctor) {
    return null;
  }

  return (
    <div className="py-4">
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <div className="row g-4 align-items-center">
            <div className="col-12 col-md-4 col-lg-3">
              <div className="appointment-doctor-profile-card">
                <div className="appointment-doctor-profile-avatar">{doctorInitials}</div>
                <p className="appointment-doctor-profile-tag mb-0">Consultation Ready</p>
              </div>
            </div>
            <div className="col-12 col-md-8 col-lg-9">
              <h1 className="h3 fw-bold mb-2">{doctor.name}</h1>
              <p className="mb-1 text-secondary"><strong>Specialisation:</strong> {doctor.speciality}</p>
              <p className="mb-1 text-secondary"><strong>Degree:</strong> {doctor.degree}</p>
              <p className="mb-1 text-secondary"><strong>Experience:</strong> {doctor.experience}</p>
              <p className="mb-1 text-secondary"><strong>Hospital:</strong> {doctor.hospital}</p>
              <p className="mb-0 text-secondary"><strong>Consultation Fee:</strong> ₹{doctor.fees}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <h2 className="h4 fw-bold mb-3">Step 1: Doctor Schedule</h2>
          <div className="row g-2">
            {upcoming7Days.map((day) => (
              <div className="col-6 col-md-4 col-lg-2" key={day.key}>
                <button
                  className={`btn w-100 ${selectedDate === day.key ? 'btn-primary' : 'btn-outline-primary'}`}
                  style={selectedDate === day.key ? { background: '#5F6FFF', borderColor: '#5F6FFF' } : {}}
                  onClick={() => handleDateChange(day.key)}
                >
                  {day.label}
                </button>
              </div>
            ))}
          </div>

          <h3 className="h5 fw-bold mt-4 mb-3">Step 2: Available Slots</h3>
          {!selectedDate ? (
            <div className="alert alert-warning mb-0">Please select doctor and date first.</div>
          ) : (
            <div className="d-flex flex-wrap gap-2">
              {availableSlots.length === 0 ? (
                <div className="alert alert-warning mb-0 w-100">No available slots for this date.</div>
              ) : (
                availableSlots.map((slot) => (
                  <button
                    key={slot}
                    className={`btn ${selectedSlot === slot ? 'btn-success' : 'btn-outline-success'}`}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    {slot}
                  </button>
                ))
              )}
            </div>
          )}

          <h3 className="h5 fw-bold mt-4 mb-3">Step 3: Already Booked Slots</h3>
          <div className="d-flex flex-wrap gap-2">
            {bookedSlots.length === 0 ? (
              <span className="text-secondary">No booked slots for this date.</span>
            ) : (
              bookedSlots.map((slot) => (
                <span key={slot} className="badge bg-danger px-3 py-2">{slot}</span>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <h2 className="h4 fw-bold mb-3">Book Appointment Form</h2>

          <form onSubmit={handleBookAppointment}>
            <div className="row g-3">
              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold">Patient ID</label>
                <input className="form-control" value={userData?.patientId || ''} readOnly />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold">Doctor ID</label>
                <input className="form-control" value={doctor._id} readOnly />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold">Doctor Name</label>
                <input className="form-control" value={doctor.name} readOnly />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold">Hospital</label>
                <input className="form-control" value={doctor.hospital} readOnly />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold">Specialisation</label>
                <input className="form-control" value={doctor.speciality} readOnly />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold">Consulting Fees</label>
                <input className="form-control" value={`₹${doctor.fees}`} readOnly />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold">Age <span style={{ color: '#dc3545' }}>*</span></label>
                <input
                  className="form-control"
                  type="number"
                  value={formData.age}
                  onChange={(event) => setFormData((prev) => ({ ...prev, age: event.target.value }))}
                />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold">Weight <span style={{ color: '#dc3545' }}>*</span></label>
                <input
                  className="form-control"
                  type="number"
                  value={formData.weight}
                  onChange={(event) => setFormData((prev) => ({ ...prev, weight: event.target.value }))}
                />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold">Payment Type <span style={{ color: '#dc3545' }}>*</span></label>
                <select
                  className="form-select"
                  value={formData.paymentType}
                  onChange={(event) => setFormData((prev) => ({ ...prev, paymentType: event.target.value }))}
                >
                  <option value="">Select Payment Type</option>
                  <option value="ONLINE">ONLINE</option>
                  <option value="CASH">CASH</option>
                </select>
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold">Appointment Date <span style={{ color: '#dc3545' }}>*</span></label>
                <input className="form-control" value={selectedDate} readOnly />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold">Appointment Time <span style={{ color: '#dc3545' }}>*</span></label>
                <input className="form-control" value={selectedSlot} readOnly />
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold">Issue / Symptoms <span style={{ color: '#dc3545' }}>*</span></label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={formData.symptoms}
                  onChange={(event) => setFormData((prev) => ({ ...prev, symptoms: event.target.value }))}
                />
              </div>

              <div className="col-12">
                <button type="submit" className="btn btn-primary px-4" style={{ background: '#5F6FFF', borderColor: '#5F6FFF' }}>
                  Book Appointment
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <RelatedDoctors speciality={doctor.speciality} docId={doctor._id} />
    </div>
  );
};

export default Appointment;
