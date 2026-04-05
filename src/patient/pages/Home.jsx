import React, { useContext, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import Header from '../components/Header'
import SpecialityMenu from '../components/SpecialityMenu'
import TopDoctors from '../components/TopDoctors'
import TopHospitals from '../components/TopHospitals'
import Banner from '../components/Banner'
import Features from '../components/Features'

const Home = () => {
  const { token, doctors } = useContext(AppContext)
  const navigate = useNavigate()

  const upcomingAppointments = useMemo(() => {
    if (!token) return []
    return doctors.slice(0, 3).map((doctor, index) => ({
      id: `APT10${index + 1}`,
      doctorName: doctor.name,
      hospital: doctor.hospital,
      date: new Date(Date.now() + (index + 1) * 86400000).toLocaleDateString(),
      time: ['10:00 AM', '11:30 AM', '02:00 PM'][index] || '10:00 AM',
      status: 'BOOKED',
    }))
  }, [token, doctors])

  return (
    <div className="pb-4">
      <Header />

      {/* Section 1: Upcoming Appointments */}
      {token && upcomingAppointments.length > 0 && (
        <section id="upcoming-appointments-section" className="mb-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="h3 fw-bold section-title mb-0">Upcoming Appointments</h2>
            <button className="btn btn-outline-primary" onClick={() => navigate('/my-appointments')}>
              View All
            </button>
          </div>

          <div className="row g-4">
            {upcomingAppointments.map((appointment) => (
              <div className="col-12 col-md-6 col-xl-4" key={appointment.id}>
                <div className="appointment-card card-hover h-100">
                  <div className="card-body">
                    <h3 className="h6 fw-bold mb-2">{appointment.doctorName}</h3>
                    <p className="mb-1 text-secondary"><strong>Hospital:</strong> {appointment.hospital}</p>
                    <p className="mb-1 text-secondary"><strong>Date:</strong> {appointment.date}</p>
                    <p className="mb-2 text-secondary"><strong>Time:</strong> {appointment.time}</p>
                    <span className="badge bg-primary">{appointment.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Section 2: Doctor Specialities */}
      <SpecialityMenu />

      {/* Section 3: Premium Banner */}
      <div className="my-5">
        <div className="card card-premium glow-on-hover" style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: '14px',
          padding: '40px',
          textAlign: 'center'
        }}>
          <h3 className="h5 fw-bold mb-2">Book Your First Consultation Today</h3>
          <p className="mb-4">Get expert medical advice from verified specialists at top hospitals near you</p>
          <button
            className="btn btn-light"
            onClick={() => navigate('/doctors')}
          >
            Explore Doctors
          </button>
        </div>
      </div>

      {/* Section 4: Top Hospitals */}
      <TopHospitals />

      {/* Section 5: Another Premium Banner */}
      <div className="my-5">
        <div className="card card-premium glow-on-hover" style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white',
          borderRadius: '14px',
          padding: '40px',
          textAlign: 'center'
        }}>
          <h3 className="h5 fw-bold mb-2">Secure & Encrypted Health Records</h3>
          <p className="mb-4">Your medical information is safely stored and accessible anytime, anywhere</p>
          <button
            className="btn btn-light"
            onClick={() => token ? navigate('/my-profile') : navigate('/login')}
          >
            {token ? 'View Your Records' : 'Create Account'}
          </button>
        </div>
      </div>

      {/* Section 6: Top Doctors */}
      <TopDoctors />

      {/* Section 7: Premium Banners */}
      <Banner />

      {/* Section 8: Features */}
      <Features />

      {/* Final CTA Banner */}
      <div className="my-5">
        <div className="card card-premium glow-on-hover" style={{
          background: 'linear-gradient(135deg, #00BCD4 0%, #009688 100%)',
          color: 'white',
          borderRadius: '14px',
          padding: '40px',
          textAlign: 'center'
        }}>
          <h3 className="h5 fw-bold mb-2">Need 24/7 Medical Support?</h3>
          <p className="mb-4">Call our healthcare experts for immediate consultation and guidance</p>
          <a href="tel:+1234567890" className="btn btn-light">📞 +44 1234 567890</a>
        </div>
      </div>
    </div>
  )
}

export default Home