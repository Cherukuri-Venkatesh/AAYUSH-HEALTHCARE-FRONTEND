import React, { useContext, useMemo } from 'react';
import { DoctorContext } from '../../context/DoctorContext';
import './DoctorAnalytics.css';

const heatColor = (value) => {
  if (value >= 75) return '#ef4444';
  if (value >= 50) return '#f59e0b';
  return '#22c55e';
};

const DoctorAnalytics = () => {
  const { appointments } = useContext(DoctorContext);

  const total = appointments.length || 1;
  const completedCount = appointments.filter((item) => item.status === 'COMPLETED').length;
  const cancelledCount = appointments.filter((item) => item.status === 'CANCELLED').length;
  const bookedCount = Math.max(appointments.length - completedCount - cancelledCount, 0);

  const dailyConsultations = useMemo(() => {
    const byDate = {};
    appointments.forEach((item) => {
      const day = item.appointmentDate || 'N/A';
      byDate[day] = (byDate[day] || 0) + 1;
    });
    return Object.entries(byDate)
      .slice(0, 7)
      .map(([day, value]) => ({ day, value }));
  }, [appointments]);

  const maxConsultation = Math.max(...dailyConsultations.map((item) => item.value), 1);

  const issueKeywords = useMemo(() => {
    const map = {};
    appointments.forEach((item) => {
      const key = (item.issue || 'General').trim() || 'General';
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, cases]) => ({ name, cases }));
  }, [appointments]);

  const revenueGrowth = useMemo(() => {
    const byMonth = {};
    appointments
      .filter((item) => item.status === 'COMPLETED')
      .forEach((item) => {
        const month = String(item.appointmentDate || '').slice(0, 7) || 'N/A';
        byMonth[month] = (byMonth[month] || 0) + Number(item.consultingFees || 0);
      });
    return Object.entries(byMonth)
      .slice(0, 7)
      .map(([month, value]) => ({ month, value }));
  }, [appointments]);

  const maxRevenue = Math.max(...revenueGrowth.map((item) => item.value), 1);

  const utilizationHeatMap = useMemo(() => {
    const slots = ['09:00', '11:00', '13:00', '15:00', '17:00'];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, idx) => {
      const dayItems = appointments.filter((item) => {
        const value = new Date(item.appointmentDate);
        return !Number.isNaN(value.getTime()) && value.getDay() === ((idx + 1) % 7);
      });

      const values = slots.map((slot) => {
        const count = dayItems.filter((item) => String(item.appointmentTime || '').startsWith(slot.slice(0, 2))).length;
        return Math.min(count * 25, 100);
      });

      return { day, slots: values };
    });
  }, [appointments]);

  const patientDemographics = [
    { label: 'Booked', value: Math.round((bookedCount / total) * 100), color: '#3b82f6' },
    { label: 'Completed', value: Math.round((completedCount / total) * 100), color: '#22c55e' },
    { label: 'Cancelled', value: Math.round((cancelledCount / total) * 100), color: '#ef4444' },
  ];

  const treatmentOutcomes = [
    { type: 'Completed', value: Math.round((completedCount / total) * 100) },
    { type: 'Pending', value: Math.round((bookedCount / total) * 100) },
    { type: 'Cancelled', value: Math.round((cancelledCount / total) * 100) },
  ];

  return (
    <div className="doctor-analytics-page">
      <header className="doctor-analytics-header">
        <h1>Analytics & Intelligence Modules</h1>
        <p>Patient analytics, practice performance, revenue analytics, disease trends, and treatment outcomes</p>
      </header>

      <section className="doctor-analytics-kpi-grid">
        <article className="doctor-analytics-kpi-card">
          <h3>Appointment Success Rate</h3>
          <strong>{Math.round((completedCount / total) * 100)}%</strong>
        </article>
        <article className="doctor-analytics-kpi-card">
          <h3>Repeat Patient Rate</h3>
          <strong>{Math.round(((appointments.length - new Set(appointments.map((a) => a.patientId)).size) / total) * 100)}%</strong>
        </article>
        <article className="doctor-analytics-kpi-card">
          <h3>No-show Rate</h3>
          <strong>{Math.round((cancelledCount / total) * 100)}%</strong>
        </article>
      </section>

      <section className="doctor-analytics-grid">
        <article className="doctor-analytics-block">
          <h3>Patient Demographics (Pie)</h3>
          <div className="doctor-analytics-pie-legend">
            {patientDemographics.map((item) => (
              <div key={item.label}>
                <span style={{ background: item.color }} />
                <p>{item.label}</p>
                <strong>{item.value}%</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="doctor-analytics-block">
          <h3>Practice Performance (Bar)</h3>
          <div className="doctor-analytics-bars">
            {dailyConsultations.map((item) => (
              <div key={item.day} className="doctor-analytics-bar-item">
                <div className="doctor-analytics-bar-bg">
                  <div className="doctor-analytics-bar-fill" style={{ height: `${(item.value / maxConsultation) * 100}%` }} />
                </div>
                <span>{item.day}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="doctor-analytics-block doctor-analytics-block-wide">
          <h3>Disease Trends</h3>
          <div className="doctor-disease-list">
            {issueKeywords.map((disease) => (
              <div key={disease.name} className="doctor-disease-row">
                <p>{disease.name}</p>
                <div className="doctor-disease-track">
                  <span style={{ width: `${disease.cases}%` }} />
                </div>
                <strong>{disease.cases}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="doctor-analytics-block">
          <h3>Treatment Outcomes</h3>
          <div className="doctor-outcome-grid">
            {treatmentOutcomes.map((item) => (
              <div key={item.type}>
                <p>{item.type}</p>
                <strong>{item.value}%</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="doctor-analytics-block">
          <h3>Revenue Analytics (Line)</h3>
          <svg viewBox="0 0 100 50" className="doctor-revenue-line">
            <polyline
              fill="none"
              stroke="#1f9dcb"
              strokeWidth="2"
              points={revenueGrowth
                .map((item, index, array) => {
                  const x = (index / (array.length - 1 || 1)) * 100;
                  const y = 50 - (item.value / maxRevenue) * 45;
                  return `${x},${y}`;
                })
                .join(' ')}
            />
          </svg>
          <div className="doctor-revenue-labels">
            {revenueGrowth.map((item) => <span key={item.month}>{item.month}</span>)}
          </div>
        </article>
      </section>

      <section className="doctor-analytics-heatmap-card">
        <h3>Utilization Heat Map</h3>
        <div className="doctor-analytics-heatmap-legend">
          <span><i style={{ backgroundColor: '#22c55e' }} /> Green → Low utilization</span>
          <span><i style={{ backgroundColor: '#f59e0b' }} /> Yellow → Moderate</span>
          <span><i style={{ backgroundColor: '#ef4444' }} /> Red → High utilization</span>
        </div>
        <div className="doctor-analytics-heatmap">
          {utilizationHeatMap.map((row) => (
            <div key={row.day} className="doctor-analytics-heat-row">
              <span>{row.day}</span>
              {row.slots.map((value, index) => (
                <i key={`${row.day}-${index}`} style={{ backgroundColor: heatColor(value) }}>{value}</i>
              ))}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DoctorAnalytics;
