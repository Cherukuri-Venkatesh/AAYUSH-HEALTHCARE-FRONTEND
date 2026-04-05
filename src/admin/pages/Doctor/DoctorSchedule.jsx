import React, { useContext, useEffect, useMemo, useState } from 'react';
import CancellationModal from '../../components/CancellationModal';
import { DOCTOR_MESSAGES, showError, showSuccess } from '../../utils/doctorToast';
import { DoctorContext } from '../../context/DoctorContext';
import { apiGet, apiPost, apiPut, apiDelete } from '../../utils/api';
import './DoctorSchedule.css';

const toISO = (value) => new Date(value).toISOString().split('T')[0];
const today = toISO(new Date());

const within7Days = (date) => {
  const start = new Date(today);
  const end = new Date(today);
  end.setDate(end.getDate() + 6);
  const target = new Date(date);
  return target >= start && target <= end;
};

const parseDoctorId = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const numeric = String(value || '').match(/\d+/)?.[0];
  return numeric ? Number(numeric) : null;
};

const formatTimeForInput = (value) => String(value || '').slice(0, 5);

const normalizeSchedule = (schedule, fallbackDoctorId) => {
  const startTime = formatTimeForInput(schedule.startTime || schedule.start || '09:00');
  const endTime = formatTimeForInput(schedule.endTime || schedule.end || '17:00');

  const startMinutes = Number(startTime.split(':')[0]) * 60 + Number(startTime.split(':')[1]);
  const endMinutes = Number(endTime.split(':')[0]) * 60 + Number(endTime.split(':')[1]);

  const slotDuration = Number(schedule.slotDuration || 30);
  const derivedSlots = endMinutes > startMinutes
    ? Math.max(1, Math.floor((endMinutes - startMinutes) / slotDuration))
    : 0;

  return {
    scheduleUploadId: String(schedule.id || schedule.scheduleUploadId || `SCH-${Date.now()}`),
    doctor_id: String(schedule.doctor?.id || schedule.doctorId || schedule.doctor_id || fallbackDoctorId || ''),
    date: String(schedule.scheduleDate || schedule.date || ''),
    startTime,
    endTime,
    slotDuration,
    totalSlots: Number(schedule.totalSlots || schedule.total_slots || derivedSlots),
    isCancelled: Boolean(schedule.isCancelled || false),
  };
};

const parseJsonFromText = (text) => {
  if (!text) return [];

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const isRecursiveSchedulePayloadError = (text) => {
  const raw = String(text || '').toLowerCase();
  return raw.includes('document nesting depth') || raw.includes('could not write json');
};

const DoctorSchedule = () => {
  const { profileData } = useContext(DoctorContext);
  const resolvedDoctorId = profileData?.id || '';
  const [backendDoctorId, setBackendDoctorId] = useState(parseDoctorId(resolvedDoctorId));

  const [activeTab, setActiveTab] = useState('UPLOAD');
  const [schedules, setSchedules] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [resolvingDoctorId, setResolvingDoctorId] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingScheduleId, setDeletingScheduleId] = useState('');
  const [scheduleLoadError, setScheduleLoadError] = useState('');
  const [cancelScheduleId, setCancelScheduleId] = useState('');
  const [editDraft, setEditDraft] = useState({
    scheduleUploadId: '',
    startTime: '',
    endTime: '',
    slotDuration: 30,
  });

  const [formData, setFormData] = useState({
    scheduleDate: '',
    startTime: '09:00',
    endTime: '17:00',
    slotDuration: 30,
    doctor_id: String(parseDoctorId(resolvedDoctorId) || resolvedDoctorId || ''),
  });

  useEffect(() => {
    setFormData((prev) => ({ ...prev, doctor_id: String(backendDoctorId || resolvedDoctorId || '') }));
  }, [backendDoctorId, resolvedDoctorId]);

  const allowedDays = useMemo(() => {
    const days = [];
    for (let index = 0; index < 10; index += 1) {
      const next = new Date(today);
      next.setDate(next.getDate() + index);
      const iso = toISO(next);
      days.push({
        date: iso,
        label: next.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' }),
        allowed: within7Days(iso),
      });
    }
    return days;
  }, []);

  const availableSlotLabels = useMemo(() => {
    if (availableSlots.length) {
      return availableSlots.map((slot) => formatTimeForInput(slot));
    }
    return [];
  }, [availableSlots]);

  useEffect(() => {
    const resolveDoctorId = async () => {
      const directId = parseDoctorId(resolvedDoctorId);

      if (directId) {
        setBackendDoctorId(directId);
        setResolvingDoctorId(false);
        return;
      }

      try {
        setResolvingDoctorId(true);
        // Use doctor-safe endpoint only; admin endpoints can trigger 403 and logout.
        const result = await apiGet('doctor/me');
        if (!result || !result.success) throw new Error(result?.error || 'Unable to resolve doctor profile');

        const matchedId = parseDoctorId(result.data?.id);
        if (matchedId) setBackendDoctorId(matchedId);
      } catch {
        setBackendDoctorId(null);
      } finally {
        setResolvingDoctorId(false);
      }
    };

    resolveDoctorId();
  }, [resolvedDoctorId]);

  const fetchSchedules = async () => {
    if (!backendDoctorId) {
      setSchedules([]);
      setScheduleLoadError('');
      return;
    }

    try {
      setLoadingSchedules(true);
      setScheduleLoadError('');
      const result = await apiGet(`schedule/${backendDoctorId}`);

      if (!result.success) {
        const message = result.error || DOCTOR_MESSAGES.somethingWentWrong;
        const isRecursive = message.toLowerCase().includes('recursive');
        if (isRecursive) {
          throw new Error('Schedule API returned recursive JSON. Please fix backend by returning Schedule DTO or ignoring doctor.schedules recursion.');
        }
        throw new Error(message);
      }

      const payload = Array.isArray(result.data) ? result.data : [];
      const normalized = payload.map((item) => normalizeSchedule(item, backendDoctorId)).reverse();
      setSchedules(normalized);
    } catch (error) {
      setSchedules([]);
      const errorMessage = error.message || DOCTOR_MESSAGES.somethingWentWrong;
      setScheduleLoadError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoadingSchedules(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [backendDoctorId]);

  useEffect(() => {
    const loadAvailableSlots = async () => {
      if (!backendDoctorId || !formData.scheduleDate || !within7Days(formData.scheduleDate)) {
        setAvailableSlots([]);
        return;
      }

      try {
        const params = new URLSearchParams({
          doctorId: String(backendDoctorId),
          date: formData.scheduleDate,
        });
        const result = await apiGet(`schedule/available-slots?${params.toString()}`);

        if (!result.success) throw new Error(result.error);

        const payload = Array.isArray(result.data) ? result.data : [];
        setAvailableSlots(payload);
      } catch {
        setAvailableSlots([]);
      }
    };

    loadAvailableSlots();
  }, [backendDoctorId, formData.scheduleDate]);

  const addSchedule = async () => {
    if (!formData.scheduleDate || !within7Days(formData.scheduleDate)) {
      showError(DOCTOR_MESSAGES.doctorScheduleNotAvailable);
      return;
    }

    if (!backendDoctorId) {
      showError('Unable to resolve doctor ID for schedule upload.');
      return;
    }

    const start = Number(formData.startTime.split(':')[0]) * 60 + Number(formData.startTime.split(':')[1]);
    const end = Number(formData.endTime.split(':')[0]) * 60 + Number(formData.endTime.split(':')[1]);

    if (end <= start) {
      showError(DOCTOR_MESSAGES.fillRequiredFields);
      return;
    }

    try {
      setSubmitting(true);
      const params = new URLSearchParams({
        doctorId: String(backendDoctorId),
        scheduleDate: formData.scheduleDate,
        start: formData.startTime,
        end: formData.endTime,
        slotDuration: String(formData.slotDuration),
      });

      const result = await apiPost(`schedule/add?${params.toString()}`, {});

      if (!result.success) throw new Error(result.error);

      showSuccess('Schedule uploaded successfully.');
      setFormData((prev) => ({ ...prev, scheduleDate: '' }));
      await fetchSchedules();
    } catch (error) {
      showError(error.message || DOCTOR_MESSAGES.somethingWentWrong);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditSchedule = (schedule) => {
    setEditDraft({
      scheduleUploadId: schedule.scheduleUploadId,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      slotDuration: schedule.slotDuration,
    });
  };

  const saveEditSchedule = async () => {
    if (!editDraft.startTime || !editDraft.endTime || !editDraft.slotDuration) {
      showError(DOCTOR_MESSAGES.fillRequiredFields);
      return;
    }

    try {
      const params = new URLSearchParams({
        startTime: editDraft.startTime,
        endTime: editDraft.endTime,
        slotDuration: String(editDraft.slotDuration),
      });

      const result = await apiPut(`schedule/update/${editDraft.scheduleUploadId}?${params.toString()}`, {});

      if (!result.success) throw new Error(result.error);

      const payload = result.data;

      if (payload) {
        const normalized = normalizeSchedule(payload, backendDoctorId);
        setSchedules((prev) => prev.map((item) => (
          item.scheduleUploadId === editDraft.scheduleUploadId ? normalized : item
        )));
      }

      showSuccess('Schedule updated successfully.');
      setEditDraft({ scheduleUploadId: '', startTime: '', endTime: '', slotDuration: 30 });
    } catch (error) {
      showError(error.message || DOCTOR_MESSAGES.somethingWentWrong);
    }
  };

  const cancelSchedule = async () => {
    if (!cancelScheduleId) return;

    try {
      setDeletingScheduleId(cancelScheduleId);
      const result = await apiDelete(`schedule/delete/${cancelScheduleId}`);

      if (!result.success) throw new Error(result.error);

      const successMsg = typeof result.data === 'string' ? result.data : 'Schedule cancelled successfully.';
      showSuccess(successMsg);
      await fetchSchedules();
    } catch (error) {
      showError(error.message || DOCTOR_MESSAGES.somethingWentWrong);
    } finally {
      setDeletingScheduleId('');
      setCancelScheduleId('');
    }
  };

  return (
    <div className="doctor-schedule-page">
      <header className="doctor-schedule-header">
        <h1>Schedule Uploading / Updation</h1>
        <p>Doctor schedules are restricted to next 7 days from today</p>
      </header>

      <section className="doctor-schedule-card">
        <h2>Schedule Calendar</h2>
        <div className="doctor-schedule-calendar-grid">
          {allowedDays.map((day) => (
            <div key={day.date} className={`doctor-schedule-day ${day.allowed ? 'allowed' : 'blocked'}`}>
              <strong>{day.label}</strong>
              <span>{day.date}</span>
              <small>{day.allowed ? 'Upload allowed' : 'Not allowed'}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="doctor-schedule-card">
        <div className="doctor-schedule-tab-header">
          <button type="button" className={activeTab === 'UPLOAD' ? 'active' : ''} onClick={() => setActiveTab('UPLOAD')}>Upload Schedule</button>
          <button type="button" className={activeTab === 'UPCOMING' ? 'active' : ''} onClick={() => setActiveTab('UPCOMING')}>Upcoming Schedule</button>
        </div>

        {activeTab === 'UPLOAD' ? (
          <div className="doctor-schedule-upload-form">
            <label>
              scheduleDate
              <input
                type="date"
                value={formData.scheduleDate}
                onChange={(event) => setFormData((prev) => ({ ...prev, scheduleDate: event.target.value }))}
              />
            </label>
            <label>
              startTime
              <input
                type="time"
                value={formData.startTime}
                onChange={(event) => setFormData((prev) => ({ ...prev, startTime: event.target.value }))}
              />
            </label>
            <label>
              endTime
              <input
                type="time"
                value={formData.endTime}
                onChange={(event) => setFormData((prev) => ({ ...prev, endTime: event.target.value }))}
              />
            </label>
            <label>
              slotDuration
              <select
                value={formData.slotDuration}
                onChange={(event) => setFormData((prev) => ({ ...prev, slotDuration: Number(event.target.value) }))}
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>60 minutes</option>
              </select>
            </label>
            <label>
              doctor_id (auto filled)
              <input type="text" value={formData.doctor_id} readOnly />
            </label>
            <button type="button" onClick={addSchedule} disabled={submitting}>
              {submitting ? 'Uploading...' : 'Upload Schedule'}
            </button>

            <div className="doctor-schedule-placeholder-slots">
              <h4>Available Slots (from backend)</h4>
              <div>
                {availableSlotLabels.length > 0 ? (
                  availableSlotLabels.map((slot) => <span key={slot}>{slot}</span>)
                ) : (
                  <span>No available slots for selected date.</span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="doctor-schedule-table-wrap">
            <table className="doctor-schedule-table">
              <thead>
                <tr>
                  <th>schedule upload id</th>
                  <th>doctor id</th>
                  <th>date</th>
                  <th>start time</th>
                  <th>end time</th>
                  <th>slot duration</th>
                  <th>total slots</th>
                  <th>Edit Schedule</th>
                  <th>Cancel Schedule</th>
                </tr>
              </thead>
              <tbody>
                {!resolvingDoctorId && !loadingSchedules && schedules.length > 0 ? schedules.map((schedule) => (
                  <tr key={schedule.scheduleUploadId}>
                    <td>{schedule.scheduleUploadId}</td>
                    <td>{schedule.doctor_id}</td>
                    <td>{schedule.date}</td>
                    <td>{schedule.startTime}</td>
                    <td>{schedule.endTime}</td>
                    <td>{schedule.slotDuration} min</td>
                    <td>{schedule.totalSlots}</td>
                    <td>
                      <button
                        type="button"
                        className="doctor-table-btn edit"
                        onClick={() => openEditSchedule(schedule)}
                        disabled={schedule.isCancelled}
                      >
                        Edit
                      </button>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="doctor-table-btn cancel"
                        onClick={() => setCancelScheduleId(schedule.scheduleUploadId)}
                        disabled={schedule.isCancelled || deletingScheduleId === schedule.scheduleUploadId}
                      >
                        {deletingScheduleId === schedule.scheduleUploadId
                          ? 'Cancelling...'
                          : schedule.isCancelled
                            ? 'Cancelled'
                            : 'Cancel'}
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="9" className="doctor-schedule-empty-row">
                      {resolvingDoctorId || loadingSchedules
                        ? 'Loading schedules from backend...'
                        : scheduleLoadError
                          ? `Unable to load schedules. ${scheduleLoadError}`
                          : `${DOCTOR_MESSAGES.noScheduleFoundForDoctor} (Doctor ID: ${backendDoctorId || 'N/A'})`}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {editDraft.scheduleUploadId && (
              <div className="doctor-schedule-edit-strip">
                <h4>Edit Schedule — {editDraft.scheduleUploadId}</h4>
                <div className="doctor-schedule-edit-grid">
                  <div>
                    <label htmlFor="editStart">start time</label>
                    <input
                      id="editStart"
                      type="time"
                      value={editDraft.startTime}
                      onChange={(event) => setEditDraft((prev) => ({ ...prev, startTime: event.target.value }))}
                    />
                  </div>
                  <div>
                    <label htmlFor="editEnd">end time</label>
                    <input
                      id="editEnd"
                      type="time"
                      value={editDraft.endTime}
                      onChange={(event) => setEditDraft((prev) => ({ ...prev, endTime: event.target.value }))}
                    />
                  </div>
                  <div>
                    <label htmlFor="editSlot">slot duration</label>
                    <select
                      id="editSlot"
                      value={editDraft.slotDuration}
                      onChange={(event) => setEditDraft((prev) => ({ ...prev, slotDuration: Number(event.target.value) }))}
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={60}>60 minutes</option>
                    </select>
                  </div>
                  <div className="doctor-schedule-edit-actions">
                    <button type="button" className="doctor-table-btn edit" onClick={saveEditSchedule}>Save</button>
                    <button
                      type="button"
                      className="doctor-table-btn cancel"
                      onClick={() => setEditDraft({ scheduleUploadId: '', startTime: '', endTime: '', slotDuration: 30 })}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      <CancellationModal
        isOpen={Boolean(cancelScheduleId)}
        title="Cancel Schedule"
        onClose={() => setCancelScheduleId('')}
        onConfirm={cancelSchedule}
      />
    </div>
  );
};

export default DoctorSchedule;
