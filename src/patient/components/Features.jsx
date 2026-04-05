import React from "react";
import '../styles/features.css'

const Features = () => {
  return (
    <section id="features-section" className="my-5 py-5 features-section-premium">
      <div className="text-center mb-5">
        <h2 className="h3 fw-bold section-title mb-0">Our Features</h2>
        <p className="text-secondary mt-3 mb-0">Comprehensive capabilities across all healthcare modules.</p>
      </div>

      <div className="row g-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="feature-card card-premium card-hover h-100 feature-card-enhanced">
            <div className="card-body p-4 d-flex flex-column">
              <div className="feature-icon-container mb-4">
                <span className="feature-icon">📅</span>
              </div>
              <h3 className="h6 fw-bold mb-3 feature-title" style={{ color: '#2d3bdff' }}>
                Easy Appointment Booking
              </h3>
              <p className="text-secondary mb-0 feature-description flex-grow-1">
                Schedule appointments with doctors from your mobile or desktop in minutes.
              </p>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="feature-card card-premium card-hover h-100 feature-card-enhanced">
            <div className="card-body p-4 d-flex flex-column">
              <div className="feature-icon-container mb-4">
                <span className="feature-icon">📋</span>
              </div>
              <h3 className="h6 fw-bold mb-3 feature-title" style={{ color: '#2d3bdff' }}>
                Digital Medical Records
              </h3>
              <p className="text-secondary mb-0 feature-description flex-grow-1">
                Access prescriptions, reports, and appointment history securely in one place.
              </p>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="feature-card card-premium card-hover h-100 feature-card-enhanced">
            <div className="card-body p-4 d-flex flex-column">
              <div className="feature-icon-container mb-4">
                <span className="feature-icon">🔬</span>
              </div>
              <h3 className="h6 fw-bold mb-3 feature-title" style={{ color: '#2d3bdff' }}>
                Lab Reports Online
              </h3>
              <p className="text-secondary mb-0 feature-description flex-grow-1">
                Receive and download your lab test results as soon as they are uploaded.
              </p>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="feature-card card-premium card-hover h-100 feature-card-enhanced">
            <div className="card-body p-4 d-flex flex-column">
              <div className="feature-icon-container mb-4">
                <span className="feature-icon">🔒</span>
              </div>
              <h3 className="h6 fw-bold mb-3 feature-title" style={{ color: '#2d3bdff' }}>
                Secure and Encrypted
              </h3>
              <p className="text-secondary mb-0 feature-description flex-grow-1">
                Your medical data is protected with role-based access and secure storage.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
