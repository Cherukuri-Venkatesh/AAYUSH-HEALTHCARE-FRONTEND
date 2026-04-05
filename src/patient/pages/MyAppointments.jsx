import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { showError, showSuccess, showWarning, MESSAGES } from '../utils/toastService';
import { patientApiGet, patientApiPut } from '../utils/api';
import '../styles/appointments.css'

const MyAppointments = () => {
  const navigate = useNavigate();
  const { token, doctors, userData } = useContext(AppContext);

  const [appointments, setAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateRangeFilter, setDateRangeFilter] = useState('all');
  const [rescheduleDraft, setRescheduleDraft] = useState({ appointmentId: '', doctorId: '', date: '', time: '' });
  const [availableDates, setAvailableDates] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingRescheduleOptions, setLoadingRescheduleOptions] = useState(false);

  const formatDateLabel = (dateValue) => {
    const parsed = new Date(dateValue);
    if (Number.isNaN(parsed.getTime())) return dateValue;
    return parsed.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getNextSevenDays = () => {
    const items = [];
    const today = new Date();
    for (let index = 0; index < 7; index += 1) {
      const next = new Date(today);
      next.setDate(today.getDate() + index);
      items.push(next.toISOString().split('T')[0]);
    }
    return items;
  };

  const loadAvailableSlotsForDate = async (doctorId, date) => {
    if (!doctorId || !date) {
      setAvailableSlots([]);
      return;
    }

    const response = await patientApiGet(`schedule/available-slots?doctorId=${doctorId}&date=${date}`);
    if (!response || !response.success || !Array.isArray(response.data)) {
      setAvailableSlots([]);
      return;
    }

    const slots = response.data.map((slot) => String(slot || '').slice(0, 5)).filter(Boolean);
    setAvailableSlots(slots);
  };

  const loadAvailableDatesAndSlots = async (doctorId) => {
    if (!doctorId) {
      setAvailableDates([]);
      setAvailableSlots([]);
      return;
    }

    try {
      setLoadingRescheduleOptions(true);
      const dates = getNextSevenDays();

      const checks = await Promise.all(
        dates.map(async (date) => {
          const response = await patientApiGet(`schedule/available-slots?doctorId=${doctorId}&date=${date}`);
          const slotCount = response?.success && Array.isArray(response.data) ? response.data.length : 0;
          return { date, slotCount };
        }),
      );

      const filteredDates = checks.filter((item) => item.slotCount > 0);
      setAvailableDates(filteredDates);

      if (filteredDates.length > 0) {
        const firstDate = filteredDates[0].date;
        setRescheduleDraft((prev) => ({ ...prev, date: firstDate, time: '' }));
        await loadAvailableSlotsForDate(doctorId, firstDate);
      } else {
        setAvailableSlots([]);
      }
    } finally {
      setLoadingRescheduleOptions(false);
    }
  };

  useEffect(() => {
    const loadAppointments = async () => {
      const response = await patientApiGet('patient/appointments');

      if (!response || !response.success) {
        showError(response?.error || MESSAGES.genericError);
        setAppointments([]);
        return;
      }

      const normalized = (response.data || []).map((item) => ({
        appointmentId: item.id,
        patientId: item.patientId,
        doctorId: item.doctorId,
        doctorName: item.doctorName,
        hospital: item.hospitalName || '-',
        specialisation: item.doctorSpecialization || '-',
        age: item.age,
        weight: item.weight,
        issue: item.issue,
        appointmentDate: item.appointmentDate,
        appointmentTime: item.appointmentTime,
        consultingFees: item.consultingFees,
        paymentType: item.paymentType || '-',
        status: item.status,
        prescriptionPath: item.prescriptionPath || '',
        labReportPath: item.labReportPath || '',
      }));

      setAppointments(normalized);
    };

    if (!token) {
      navigate('/login');
      return;
    }

    loadAppointments();
  }, [token, navigate]);

  const filteredAppointments = useMemo(() => {
    let filtered = appointments;

    // Status filter
    if (statusFilter === 'UPCOMING') {
      filtered = filtered.filter(apt => apt.status === 'BOOKED');
    } else if (statusFilter === 'PAST') {
      filtered = filtered.filter(apt => apt.status === 'COMPLETED');
    } else if (statusFilter === 'CANCELLED') {
      filtered = filtered.filter(apt => apt.status === 'CANCELLED');
    }

    // Date range filter
    if (dateRangeFilter !== 'all') {
      const today = new Date();
      let startDate = new Date();

      if (dateRangeFilter === '6months') {
        startDate.setMonth(startDate.getMonth() - 6);
      } else if (dateRangeFilter === '1year') {
        startDate.setFullYear(startDate.getFullYear() - 1);
      }

      filtered = filtered.filter(apt => {
        const aptDate = new Date(apt.appointmentDate);
        return aptDate >= startDate && aptDate <= today;
      });
    }

    return filtered;
  }, [appointments, statusFilter, dateRangeFilter]);

  const getStatusBadge = (status) => {
    if (status === 'COMPLETED') return <span className="badge bg-success">COMPLETED</span>;
    if (status === 'CANCELLED') return <span className="badge bg-danger">CANCELLED</span>;
    return <span className="badge bg-primary">BOOKED</span>;
  };

  const cancelAppointment = async (appointmentId) => {
    const target = appointments.find((item) => item.appointmentId === appointmentId);

    if (!target) {
      showError(MESSAGES.cancelOwnOnly);
      return;
    }

    if (target.status !== 'BOOKED') {
      showWarning(MESSAGES.onlyBookedCanCancel);
      return;
    }

    if (!window.confirm(MESSAGES.cancelConfirm)) {
      return;
    }

    const response = await patientApiPut(`patient/appointments/${appointmentId}/cancel`, {});
    if (!response || !response.success) {
      showError(response?.error || MESSAGES.genericError);
      return;
    }

    setAppointments((prev) => prev.map((item) =>
      item.appointmentId === appointmentId ? { ...item, status: 'CANCELLED' } : item));

    showSuccess(MESSAGES.appointmentCancelled);
  };

  const openReschedule = (appointment) => {
    if (appointment.status !== 'BOOKED') {
      showWarning(MESSAGES.onlyBookedCanCancel);
      return;
    }

    const appointmentDateTime = new Date(`${appointment.appointmentDate}T${String(appointment.appointmentTime || '').slice(0, 8)}`);
    if (!Number.isNaN(appointmentDateTime.getTime())) {
      const hoursLeft = (appointmentDateTime.getTime() - Date.now()) / (1000 * 60 * 60);
      if (hoursLeft < 24) {
        showWarning('Reschedule is allowed only until 24 hours before appointment slot.');
        return;
      }
    }

    setRescheduleDraft({
      appointmentId: appointment.appointmentId,
      doctorId: appointment.doctorId,
      date: '',
      time: '',
    });

    loadAvailableDatesAndSlots(appointment.doctorId);
  };

  const onRescheduleDateChange = async (dateValue) => {
    setRescheduleDraft((prev) => ({ ...prev, date: dateValue, time: '' }));
    await loadAvailableSlotsForDate(rescheduleDraft.doctorId, dateValue);
  };

  const saveReschedule = async () => {
    if (!rescheduleDraft.appointmentId || !rescheduleDraft.doctorId || !rescheduleDraft.date || !rescheduleDraft.time) {
      showWarning(MESSAGES.fillRequiredFields);
      return;
    }

    const response = await patientApiPut(
      `patient/appointments/${rescheduleDraft.appointmentId}/reschedule`,
      {
        date: rescheduleDraft.date,
        time: rescheduleDraft.time,
      },
    );

    if (!response || !response.success) {
      showError(response?.error || MESSAGES.genericError);
      return;
    }

    setAppointments((prev) => prev.map((item) => (
      item.appointmentId === rescheduleDraft.appointmentId
        ? {
            ...item,
            appointmentDate: response.data?.appointmentDate || rescheduleDraft.date,
            appointmentTime: response.data?.appointmentTime || rescheduleDraft.time,
            status: response.data?.status || item.status,
          }
        : item
    )));

    setRescheduleDraft({ appointmentId: '', doctorId: '', date: '', time: '' });
    setAvailableDates([]);
    setAvailableSlots([]);
    showSuccess('Appointment rescheduled successfully.');
  };

  return (
    <>
      {/* Professional Appointment Header Section with Image */}
      <section
        className="appointments-header"
        style={{
          backgroundImage: "linear-gradient(135deg, rgba(32, 54, 158, 0.7) 0%, rgba(95, 111, 255, 0.7) 100%), url('/background1.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center right',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="appointments-header-content">
          <div style={{ maxWidth: '800px' }}>
            <h1>Your Medical Appointments</h1>
            <p>Track, manage, and monitor all your appointments effortlessly in one centralized location</p>
          </div>
        </div>
      </section>

      <div className="py-4">
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-4">My Appointments</h1>

        {/* Filter Section */}
        <div className="filter-section card border-0 shadow-sm p-4 mb-4" style={{ backgroundColor: '#f8f9ff' }}>
          <div className="row g-3">
            {/* Status Filter */}
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold">Filter by Status</label>
              <div className="btn-group w-100" role="group">
                {['ALL', 'UPCOMING', 'PAST', 'CANCELLED'].map(status => (
                  <button
                    key={status}
                    type="button"
                    className={`btn ${statusFilter === status ? 'btn-primary' : 'btn-outline-primary'} flex-fill`}
                    onClick={() => setStatusFilter(status)}
                  >
                    {status === 'UPCOMING' ? '📅 Upcoming' : status === 'PAST' ? '✅ Past' : status === 'CANCELLED' ? '❌ Cancelled' : '📋 All'}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold">Filter by Date Range</label>
              <select
                className="form-select"
                value={dateRangeFilter}
                onChange={(e) => setDateRangeFilter(e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="6months">Last 6 Months</option>
                <option value="1year">Last 1 Year</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {filteredAppointments.length === 0 ? (
        <div className="alert alert-info text-center py-5">
          <h5>No appointments found</h5>
          <p className="mb-0">Try adjusting your filters or book a new appointment</p>
          <button className="btn btn-primary mt-3" onClick={() => navigate('/doctors')}>
            Book Appointment
          </button>
        </div>
      ) : (
        <div className="table-responsive appointment-table-container">
          <table className="table table-bordered table-hover align-middle appointment-table">
            <thead className="">
              <tr>
                <th>Appointment ID</th>
                <th>Patient ID</th>
                <th>Doctor ID</th>
                <th>Doctor Name</th>
                <th>Hospital</th>
                <th>Specialisation</th>
                <th>Age</th>
                <th>Weight</th>
                <th>Issue</th>
                <th>Appointment Date</th>
                <th>Appointment Time</th>
                <th>Consulting Fees</th>
                <th>Payment Type</th>
                <th>Status</th>
                <th>Lab Reports</th>
                <th>Prescriptions</th>
                <th>Cancel Appointment</th>
                <th>Reschedule</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((appointment) => (
                <tr key={appointment.appointmentId} style={{ transition: 'all 0.2s ease' }}>
                  <td><strong>{appointment.appointmentId}</strong></td>
                  <td>{appointment.patientId}</td>
                  <td>{appointment.doctorId}</td>
                  <td className="fw-semibold">{appointment.doctorName}</td>
                  <td>{appointment.hospital}</td>
                  <td>{appointment.specialisation}</td>
                  <td>{appointment.age}</td>
                  <td>{appointment.weight}</td>
                  <td>{appointment.issue}</td>
                  <td>{appointment.appointmentDate}</td>
                  <td>{appointment.appointmentTime}</td>
                  <td>₹{appointment.consultingFees}</td>
                  <td>{appointment.paymentType}</td>
                  <td>{getStatusBadge(appointment.status)}</td>
                  <td>
                    {(() => {
                      const labEnabled = appointment.status === 'COMPLETED' && Boolean(appointment.labReportPath);
                      return (
                        <button
                          className="btn btn-sm btn-outline-primary"
                          disabled={!labEnabled}
                          onClick={() => labEnabled && navigate('/my-labreports')}
                        >
                          {labEnabled ? 'View' : 'Not Uploaded'}
                        </button>
                      );
                    })()}
                  </td>
                  <td>
                    {(() => {
                      const prescriptionEnabled = appointment.status === 'COMPLETED' && Boolean(appointment.prescriptionPath);
                      return (
                        <button
                          className="btn btn-sm btn-outline-primary"
                          disabled={!prescriptionEnabled}
                          onClick={() => prescriptionEnabled && navigate('/my-prescriptions')}
                        >
                          {prescriptionEnabled ? 'View' : 'Not Uploaded'}
                        </button>
                      );
                    })()}
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-danger"
                      disabled={appointment.status !== 'BOOKED'}
                      onClick={() => cancelAppointment(appointment.appointmentId)}
                    >
                      Cancel
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-warning"
                      disabled={appointment.status !== 'BOOKED'}
                      onClick={() => openReschedule(appointment)}
                    >
                      Reschedule
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {rescheduleDraft.appointmentId && (
        <div className="card border-0 shadow-sm p-4 mt-4" style={{ backgroundColor: '#fff8e1' }}>
          <h5 className="fw-bold mb-3">Reschedule Appointment #{rescheduleDraft.appointmentId}</h5>
          <div className="row g-3 align-items-end">
            <div className="col-12 col-md-4">
              <label className="form-label fw-semibold">New Date</label>
              <select
                className="form-select"
                value={rescheduleDraft.date}
                disabled={loadingRescheduleOptions || availableDates.length === 0}
                onChange={(event) => onRescheduleDateChange(event.target.value)}
              >
                <option value="">Select Available Date</option>
                {availableDates.map((item) => (
                  <option key={item.date} value={item.date}>
                    {formatDateLabel(item.date)} ({item.slotCount} slots)
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label fw-semibold">New Time</label>
              <select
                className="form-select"
                value={rescheduleDraft.time}
                disabled={!rescheduleDraft.date || availableSlots.length === 0}
                onChange={(event) => setRescheduleDraft((prev) => ({ ...prev, time: event.target.value }))}
              >
                <option value="">Select Available Slot</option>
                {availableSlots.map((slot) => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-4 d-flex gap-2">
              <button className="btn btn-primary" onClick={saveReschedule} disabled={!rescheduleDraft.date || !rescheduleDraft.time}>Save</button>
              <button
                className="btn btn-outline-secondary"
                onClick={() => {
                  setRescheduleDraft({ appointmentId: '', doctorId: '', date: '', time: '' });
                  setAvailableDates([]);
                  setAvailableSlots([]);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
          {!loadingRescheduleOptions && availableDates.length === 0 && (
            <p className="text-muted mt-3 mb-0">No available dates/slots in the next 7 days for this doctor.</p>
          )}
        </div>
      )}
    </div>
    </>
  );
};

export default MyAppointments;
