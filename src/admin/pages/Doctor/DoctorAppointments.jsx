const canMarkCompleted = (appointment) => {
  if (appointment.status !== 'BOOKED') return false;

  const appointmentDate = String(appointment.appointmentDate || '');
  const appointmentTime = String(appointment.appointmentTime || '').slice(0, 8);
  const slotDateTime = new Date(`${appointmentDate}T${appointmentTime}`);

  if (Number.isNaN(slotDateTime.getTime())) return false;

  return Date.now() >= slotDateTime.getTime();
};
import React, { useContext, useMemo, useState } from 'react';
import CancellationModal from '../../components/CancellationModal';
import { DoctorContext } from '../../context/DoctorContext';
import { DOCTOR_MESSAGES, showError, showInfo, showSuccess, showWarning } from '../../utils/doctorToast';
import '../../../patient/styles/appointments.css';
import './DoctorAppointments.css';

const formatDate = (value) => new Date(value).toISOString().split('T')[0];
const todayISO = formatDate(new Date());

const sortBySlot = (appointments) =>
  appointments.slice().sort((a, b) => {
    const keyA = `${a.appointmentDate} ${a.startTime}`;
    const keyB = `${b.appointmentDate} ${b.startTime}`;
    return keyA.localeCompare(keyB);
  });

const dateWithinSevenDays = (dateValue) => {
  const start = new Date(todayISO);
  const end = new Date(todayISO);
  end.setDate(end.getDate() + 6);
  const current = new Date(dateValue);
  return current >= start && current <= end;
};

const statusFilters = [
  { id: 'TODAY', label: "Today's Appointments" },
  { id: 'UPCOMING', label: 'Upcoming Appointments' },
  { id: 'PAST', label: 'Past Appointments' },
  { id: 'CANCELLED', label: 'Cancelled Appointments' },
  { id: 'ALL', label: 'All Appointments' },
];

const getStatusBadge = (status) => {
  if (status === 'COMPLETED') return <span className="badge bg-success">COMPLETED</span>;
  if (status === 'CANCELLED') return <span className="badge bg-danger">CANCELLED</span>;
  return <span className="badge bg-primary">BOOKED</span>;
};

const DoctorAppointments = () => {
  const { appointments, cancelAppointment, completeAppointment, uploadFile, getAppointments } = useContext(DoctorContext);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [activeDay, setActiveDay] = useState(todayISO);
  const [activeCancelAppointmentId, setActiveCancelAppointmentId] = useState('');
  const [uploadDraft, setUploadDraft] = useState({ appointmentId: '', patientId: '', doctorId: '', type: '', file: null });

  const nextSevenDays = useMemo(() => {
    const items = [];
    for (let index = 0; index < 7; index += 1) {
      const day = new Date(todayISO);
      day.setDate(day.getDate() + index);
      const iso = formatDate(day);
      items.push({
        date: iso,
        dayLabel: day.toLocaleDateString('en-IN', { weekday: 'short' }),
        dateLabel: day.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        count: appointments.filter((item) => item.appointmentDate === iso).length,
      });
    }
    return items;
  }, [appointments]);

  const queueForSelectedDay = useMemo(() => {
    const dayAppointments = appointments.filter((item) => item.appointmentDate === activeDay);
    return sortBySlot(dayAppointments);
  }, [activeDay, appointments]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((item) => {
      const isPast = new Date(item.appointmentDate) < new Date(todayISO);
      if (activeFilter === 'TODAY') return item.appointmentDate === todayISO;
      if (activeFilter === 'UPCOMING') return !isPast && item.status === 'BOOKED';
      if (activeFilter === 'PAST') return isPast || item.status === 'COMPLETED';
      if (activeFilter === 'CANCELLED') return item.status === 'CANCELLED';
      return true;
    });
  }, [activeFilter, appointments]);

  const openCancelModal = (appointmentId) => {
    const selected = appointments.find((item) => item.appointmentId === appointmentId);
    if (!selected || selected.status !== 'BOOKED') {
      showWarning(DOCTOR_MESSAGES.onlyBookedCanCancel);
      return;
    }
    setActiveCancelAppointmentId(appointmentId);
  };

  const confirmCancellation = (reason) => {
    cancelAppointment(activeCancelAppointmentId, reason);
    setActiveCancelAppointmentId('');
    showSuccess(DOCTOR_MESSAGES.appointmentCancelledSuccess);
  };

  const onCompleteAppointment = (appointmentId) => {
    const selected = appointments.find((item) => item.appointmentId === appointmentId);
    if (!selected || selected.status !== 'BOOKED') {
      showWarning(DOCTOR_MESSAGES.onlyBookedCanCancel);
      return;
    }

    completeAppointment(appointmentId);
  };


  const submitUpload = async () => {
    if (!uploadDraft.file || !uploadDraft.appointmentId || !uploadDraft.type) {
      showError(DOCTOR_MESSAGES.fillRequiredFields);
      return;
    }

    const target = appointments.find((item) => item.appointmentId === uploadDraft.appointmentId);
    if (!target || target.status !== 'COMPLETED') {
      showError('Upload allowed only after completion.');
      return;
    }

    if (uploadDraft.type === 'labreport' && target.labReportPath) {
      showInfo('Lab report already uploaded for this appointment.');
      return;
    }

    if (uploadDraft.type === 'prescription' && target.prescriptionPath) {
      showInfo('Prescription already uploaded for this appointment.');
      return;
    }

    const uploadResult = await uploadFile({
      file: uploadDraft.file,
      type: uploadDraft.type,
      appointmentId: uploadDraft.appointmentId,
      patientId: uploadDraft.patientId,
      doctorId: uploadDraft.doctorId,
      notes: '',
    });

    if (!uploadResult?.success) {
      return;
    }

    setUploadDraft({ appointmentId: '', patientId: '', doctorId: '', type: '', file: null });
    getAppointments();
  };

  return (
    <div className="doctor-appointments-page">
      <header className="doctor-appointments-title-block">
        <h1>Appointment Management</h1>
        <p>Enterprise scheduling with day-wise queue, status filters, and robust appointment controls</p>
      </header>

      <section className="doctor-appointments-card">
        <h2>Appointment Calendar (Next 7 Days)</h2>
        <div className="doctor-calendar-scroll" role="tablist" aria-label="Next 7 days calendar">
          {nextSevenDays.map((day) => (
            <button
              key={day.date}
              type="button"
              className={`doctor-calendar-day ${activeDay === day.date ? 'active' : ''}`}
              onClick={() => setActiveDay(day.date)}
            >
              <strong>{day.dayLabel}</strong>
              <span>{day.dateLabel}</span>
              <small>{day.count} bookings</small>
            </button>
          ))}
        </div>
      </section>

      <section className="doctor-appointments-card">
        <h2>Patient Queue for {activeDay}</h2>
        <div className="doctor-queue-table-wrap">
          <table className="doctor-queue-table">
            <thead>
              <tr>
                <th>Slot (Start → End)</th>
                <th>Patient</th>
                <th>Issue</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {queueForSelectedDay.length > 0 ? (
                queueForSelectedDay.map((appointment) => (
                  <tr key={appointment.appointmentId}>
                    <td>{appointment.startTime} → {appointment.endTime}</td>
                    <td>{appointment.userData.name}</td>
                    <td>{appointment.issue}</td>
                    <td>{getStatusBadge(appointment.status)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="doctor-empty-row">{DOCTOR_MESSAGES.noAppointmentsFound}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="doctor-appointments-card">
        <h2>Appointment Filters</h2>
        <div className="doctor-filter-scroll">
          {statusFilters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              className={`doctor-filter-btn ${activeFilter === filter.id ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </section>

      <section className="doctor-appointments-card">
        <h2>All Appointments Table</h2>
        <div className="table-responsive appointment-table-container">
          <table className="table table-bordered table-hover align-middle appointment-table">
            <thead>
              <tr>
                <th>appointment id</th>
                <th>patient id</th>
                <th>doctor id</th>
                <th>doctor name</th>
                <th>hospital</th>
                <th>specialisation</th>
                <th>age</th>
                <th>weight</th>
                <th>issue</th>
                <th>appointment date</th>
                <th>appointment time</th>
                <th>consulting fees</th>
                <th>payment type</th>
                <th>status</th>
                <th>lab reports upload</th>
                <th>prescriptions upload</th>
                <th>cancel appointment</th>
                <th>complete appointment</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((appointment) => (
                  <tr key={appointment.appointmentId}>
                    <td>{appointment.appointmentId}</td>
                    <td>{appointment.patientId}</td>
                    <td>{appointment.doctorId}</td>
                    <td>{appointment.doctorName}</td>
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
                        const canUpload = appointment.status === 'COMPLETED' && !appointment.labReportPath;
                        const buttonLabel = appointment.labReportPath ? 'Already Uploaded' : appointment.status === 'COMPLETED' ? 'Upload' : 'Complete Appointment First';
                        return (
                      <button
                        className="btn btn-sm btn-outline-primary"
                        type="button"
                        disabled={!canUpload}
                        onClick={() => setUploadDraft({ appointmentId: appointment.appointmentId, patientId: appointment.patientId, doctorId: appointment.doctorId, type: 'labreport', file: null })}
                      >
                        {buttonLabel}
                      </button>
                        );
                      })()}
                    </td>
                    <td>
                      {(() => {
                        const canUpload = appointment.status === 'COMPLETED' && !appointment.prescriptionPath;
                        const buttonLabel = appointment.prescriptionPath ? 'Already Uploaded' : appointment.status === 'COMPLETED' ? 'Upload' : 'Complete Appointment First';
                        return (
                      <button
                        className="btn btn-sm btn-outline-primary"
                        type="button"
                        disabled={!canUpload}
                        onClick={() => setUploadDraft({ appointmentId: appointment.appointmentId, patientId: appointment.patientId, doctorId: appointment.doctorId, type: 'prescription', file: null })}
                      >
                        {buttonLabel}
                      </button>
                        );
                      })()}
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-danger"
                        type="button"
                        disabled={appointment.status !== 'BOOKED'}
                        onClick={() => openCancelModal(appointment.appointmentId)}
                      >
                        Cancel
                      </button>
                    </td>
                    <td>
                        {(() => {
                          const canComplete = canMarkCompleted(appointment);
                          return (
                      <button
                        className="btn btn-sm btn-success"
                        type="button"
                          disabled={!canComplete}
                        onClick={() => onCompleteAppointment(appointment.appointmentId)}
                      >
                          {canComplete ? 'Complete' : 'Available After Slot Time'}
                      </button>
                          );
                        })()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="18" className="doctor-empty-row">{DOCTOR_MESSAGES.noAppointmentsFound}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {uploadDraft.appointmentId && (
        <section className="doctor-appointments-card doctor-reschedule-card">
          <h2>Upload {uploadDraft.type === 'labreport' ? 'Lab Report' : 'Prescription'} - {uploadDraft.appointmentId}</h2>
          <div className="doctor-reschedule-grid">
            <div>
              <label htmlFor="uploadFile">Select File</label>
              <input
                id="uploadFile"
                type="file"
                onChange={(event) => setUploadDraft((prev) => ({ ...prev, file: event.target.files?.[0] || null }))}
              />
            </div>
            <div className="doctor-reschedule-actions">
              <button type="button" className="btn btn-sm btn-success" onClick={submitUpload}>Upload</button>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setUploadDraft({ appointmentId: '', patientId: '', doctorId: '', type: '', file: null })}
              >
                Cancel
              </button>
            </div>
          </div>
        </section>
      )}

      <CancellationModal
        isOpen={Boolean(activeCancelAppointmentId)}
        title={DOCTOR_MESSAGES.cancelAppointmentConfirm}
        onClose={() => setActiveCancelAppointmentId('')}
        onConfirm={confirmCancellation}
      />
    </div>
  );
};

export default DoctorAppointments;
