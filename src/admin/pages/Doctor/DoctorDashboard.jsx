import React, { useContext, useMemo } from 'react';
import { assets } from '../../assets/assets';
import { DoctorContext } from '../../context/DoctorContext';
import './DoctorDashboard.css';

const statusClass = {
  BOOKED: 'doctor-status-booked',
  COMPLETED: 'doctor-status-completed',
  CANCELLED: 'doctor-status-cancelled',
};

const toPath = (data) => {
  const max = Math.max(...data.map((item) => item.value));
  return data
    .map((item, index) => {
      const x = (index / (data.length - 1 || 1)) * 100;
      const y = 100 - (item.value / max) * 92;
      return `${x},${y}`;
    })
    .join(' ');
};

const PieLegend = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let start = 0;

  return (
    <div className="doctor-dashboard-pie-wrap">
      <svg viewBox="0 0 42 42" className="doctor-dashboard-pie" aria-label="Pie chart">
        {data.map((item) => {
          const percent = (item.value / total) * 100;
          const dashArray = `${percent} ${100 - percent}`;
          const dashOffset = 25 - start;
          start += percent;
          return (
            <circle
              key={item.label}
              cx="21"
              cy="21"
              r="15.915"
              fill="none"
              stroke={item.color}
              strokeWidth="7"
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
            />
          );
        })}
      </svg>
      <div className="doctor-dashboard-legend">
        {data.map((item) => (
          <div key={item.label} className="doctor-dashboard-legend-item">
            <span className="doctor-dashboard-dot" style={{ backgroundColor: item.color }} />
            <span>{item.label}</span>
            <strong>{item.value}%</strong>
          </div>
        ))}
      </div>
    </div>
  );
};

const DoctorDashboard = () => {
  const { appointments, dashData } = useContext(DoctorContext);

  const dailyConsultations = useMemo(() => {
    const byDate = {};
    appointments.forEach((item) => {
      const key = item.appointmentDate || 'N/A';
      byDate[key] = (byDate[key] || 0) + 1;
    });
    return Object.entries(byDate)
      .slice(0, 7)
      .map(([day, value]) => ({ day, value }));
  }, [appointments]);

  const statusDistribution = useMemo(() => {
    const total = appointments.length || 1;
    const completed = appointments.filter((item) => item.status === 'COMPLETED').length;
    const cancelled = appointments.filter((item) => item.status === 'CANCELLED').length;
    const booked = Math.max(total - completed - cancelled, 0);

    const percent = (value) => Math.round((value / total) * 100);

    return [
      { label: 'Completed', value: percent(completed), color: '#22c55e' },
      { label: 'Cancelled', value: percent(cancelled), color: '#ef4444' },
      { label: 'Booked', value: percent(booked), color: '#3b82f6' },
    ];
  }, [appointments]);

  const revenueGrowth = useMemo(() => {
    const buckets = {};
    appointments
      .filter((item) => item.status === 'COMPLETED')
      .forEach((item) => {
        const month = String(item.appointmentDate || '').slice(0, 7) || 'N/A';
        buckets[month] = (buckets[month] || 0) + Number(item.consultingFees || 0);
      });

    return Object.entries(buckets)
      .slice(0, 7)
      .map(([month, value]) => ({ month, value }));
  }, [appointments]);

  const summaryCards = [
    { label: "Today's Appointments", value: dashData?.todaysAppointments || 0, icon: assets.appointments_icon, gradient: 'card-blue' },
    { label: "Today's Revenue", value: `₹${Number(dashData?.todaysRevenue || 0).toLocaleString()}`, icon: assets.earning_icon, gradient: 'card-emerald' },
    { label: 'Completed Appointments From Day 1', value: dashData?.completedAppointmentsFromDay1 || 0, icon: assets.tick_icon, gradient: 'card-violet' },
    { label: 'Cancelled Appointments From Day 1', value: dashData?.cancelledAppointmentsFromDay1 || 0, icon: assets.cancel_icon, gradient: 'card-rose' },
    { label: 'Total Revenue From Day 1', value: `₹${Number(dashData?.totalRevenueFromDay1 || 0).toLocaleString()}`, icon: assets.earning_icon, gradient: 'card-amber' },
    { label: 'Total Appointments From Day 1', value: dashData?.totalAppointmentsFromDay1 || 0, icon: assets.appointments_icon, gradient: 'card-indigo' },
    { label: 'Pending Consultations', value: dashData?.pendingConsultations || 0, icon: assets.list_icon, gradient: 'card-cyan' },
  ];

  const linePath = toPath(revenueGrowth.length ? revenueGrowth : [{ month: 'N/A', value: 0 }]);

  return (
    <div className="doctor-dashboard-wrapper">
      <header className="doctor-dashboard-header">
        <h1 className="doctor-dashboard-title">AAYUSH HEALTH CARE — Doctor Intelligence Dashboard</h1>
        <p className="doctor-dashboard-subtitle">Enterprise-grade insights for appointments, patients, alerts, and revenue</p>
      </header>

      <section className="doctor-dashboard-cards-grid">
        {summaryCards.map((card) => (
          <article key={card.label} className={`doctor-summary-card ${card.gradient}`}>
            <div>
              <p className="doctor-summary-label">{card.label}</p>
              <h3 className="doctor-summary-value">{card.value}</h3>
            </div>
            <img src={card.icon} alt="" className="doctor-summary-icon" />
          </article>
        ))}
      </section>

      <section className="doctor-dashboard-analytics-grid">
        <article className="doctor-analytics-card">
          <h3>Appointment Status Distribution</h3>
          <PieLegend data={statusDistribution} />
        </article>

        <article className="doctor-analytics-card">
          <h3>Daily Consultations (Bar)</h3>
          <div className="doctor-dashboard-bars">
            {dailyConsultations.map((item) => (
              <div key={item.day} className="doctor-dashboard-bar-col">
                <div className="doctor-dashboard-bar-track">
                  <span className="doctor-dashboard-bar-fill" style={{ height: `${Math.min(item.value * 2.7, 100)}%` }} />
                </div>
                <small>{item.day}</small>
              </div>
            ))}
          </div>
        </article>

        <article className="doctor-analytics-card doctor-analytics-card-wide">
          <h3>Revenue Growth Trend (Line)</h3>
          <svg viewBox="0 0 100 100" className="doctor-dashboard-line-chart" role="img" aria-label="Revenue line chart">
            <polyline points={linePath} fill="none" stroke="#1f9dcb" strokeWidth="2.6" strokeLinecap="round" />
          </svg>
          <div className="doctor-dashboard-line-labels">
            {revenueGrowth.map((item) => (
              <span key={item.month}>{item.month}</span>
            ))}
          </div>
        </article>
      </section>

      <section className="doctor-dashboard-table-card">
        <div className="doctor-dashboard-table-header">
          <h3>Recent Clinical Queue</h3>
          <span>Sorted by appointment slot</span>
        </div>
        <div className="doctor-dashboard-table-scroll">
          <table className="doctor-dashboard-table">
            <thead>
              <tr>
                <th>Appointment</th>
                <th>Patient</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Issue</th>
              </tr>
            </thead>
            <tbody>
              {appointments
                .slice()
                .sort((a, b) => `${a.appointmentDate} ${a.startTime}`.localeCompare(`${b.appointmentDate} ${b.startTime}`))
                .slice(0, 7)
                .map((appointment) => (
                  <tr key={appointment.appointmentId}>
                    <td>{appointment.appointmentId}</td>
                    <td>{appointment.userData.name}</td>
                    <td>{appointment.appointmentDate}</td>
                    <td>{appointment.appointmentTime}</td>
                    <td>
                      <span className={`doctor-status-badge ${statusClass[appointment.status]}`}>{appointment.status}</span>
                    </td>
                    <td>{appointment.issue}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default DoctorDashboard;
