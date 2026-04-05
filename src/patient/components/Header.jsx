import React from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/header.css'

const Header = () => {
  const navigate = useNavigate()

  const handleScrollDown = () => {
    window.scrollBy({ top: window.innerHeight * 0.75, behavior: 'smooth' })
  }

  return (
    <>
      <section id="home-header" className="home-hero-section mb-5">
        <div className="hero-bg-orb hero-bg-orb-one"></div>
        <div className="hero-bg-orb hero-bg-orb-two"></div>

        <div className="hero-floating-icon hero-icon-heart">❤</div>
        <div className="hero-floating-icon hero-icon-plus">✚</div>
        <div className="hero-floating-icon hero-icon-stethoscope">🩺</div>

        <div className="container hero-content-wrap">
          <div className="row g-4 align-items-center">
            <div className="col-12 col-lg-7">
              <div className="hero-glass-card">
                <p className="hero-chip">Trusted Digital Healthcare Platform</p>
                <h1 className="hero-title">Revolutionizing Healthcare with Intelligent Digital Care</h1>
                <p className="hero-subtitle">
                  Book appointments, connect with certified doctors, access medical records, and
                  experience AI-powered healthcare — all in one secure platform designed for the future
                  of digital medicine.
                </p>

                <div className="hero-cta-group">
                  <button
                    className="hero-btn hero-btn-primary"
                    onClick={() => navigate('/doctors')}
                  >
                    Find a Doctor
                  </button>
                  <button
                    className="hero-btn hero-btn-secondary"
                    onClick={() => navigate('/doctors')}
                  >
                    Book Appointment
                  </button>
                </div>

                <div className="hero-trust-grid">
                  <div className="hero-trust-item">
                    <span className="hero-trust-value">10,000+</span>
                    <span className="hero-trust-label">Doctors</span>
                  </div>
                  <div className="hero-trust-item">
                    <span className="hero-trust-value">500+</span>
                    <span className="hero-trust-label">Hospitals</span>
                  </div>
                  <div className="hero-trust-item">
                    <span className="hero-trust-value">1M+</span>
                    <span className="hero-trust-label">Patients Served</span>
                  </div>
                  <div className="hero-trust-item">
                    <span className="hero-trust-value">24/7</span>
                    <span className="hero-trust-label">Emergency Support</span>
                  </div>
                </div>

                <div className="hero-heartbeat-wrap" aria-hidden="true">
                  <span className="hero-heartbeat-line"></span>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-5">
              <div className="hero-visual-shell">
                <img src="/background1.png" alt="Doctor consultation" className="hero-visual-image" />
                <div className="hero-visual-badge hero-badge-top">Certified Specialists</div>
                <div className="hero-visual-badge hero-badge-bottom">Telemedicine Ready</div>
              </div>
            </div>
          </div>
        </div>

        <button className="hero-scroll-indicator" onClick={handleScrollDown} aria-label="Scroll down">
          <span className="hero-scroll-mouse"></span>
          <span className="hero-scroll-text">Scroll</span>
        </button>
      </section>

      {/* Dashboard Buttons Section */}
      <div className="dashboard-buttons-container mb-5">
        <div className="container">
          <div className="row g-4 justify-content-center">
            <div className="col-12 col-md-5 col-lg-4">
              <button
                className="btn btn-dashboard btn-doctor-dashboard w-100 shadow-elevation-3"
                onClick={() => navigate('/doctor-dashboard')}
              >
                <span className="dashboard-icon">👨‍⚕️</span>
                <div className="dashboard-text">
                  <div className="dashboard-label">Doctor Dashboard</div>
                  <div className="dashboard-sublabel">Access your appointments</div>
                </div>
              </button>
            </div>
            <div className="col-12 col-md-5 col-lg-4">
              <button
                className="btn btn-dashboard btn-admin-dashboard w-100 shadow-elevation-3"
                onClick={() => navigate('/admin-dashboard')}
              >
                <span className="dashboard-icon">⚙️</span>
                <div className="dashboard-text">
                  <div className="dashboard-label">Admin Dashboard</div>
                  <div className="dashboard-sublabel">Manage the system</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Header
