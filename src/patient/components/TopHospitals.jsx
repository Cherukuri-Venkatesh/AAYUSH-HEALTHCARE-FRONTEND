import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchTopHospitalsForPatient } from '../utils/hospitalApi'
import '../styles/hospitals.css'

const TopHospitals = () => {
  const navigate = useNavigate()
  const [hospitals, setHospitals] = useState([])

  useEffect(() => {
    const loadHospitals = async () => {
      try {
        const data = await fetchTopHospitalsForPatient(4)
        setHospitals(data)
      } catch (error) {
        // Keep homepage stable even if public APIs are temporarily unavailable.
        setHospitals([])
      }
    }

    loadHospitals()
  }, [])

  return (
    <section id="top-hospitals-section" className="my-5">
      <div className="text-center mb-5">
        <h2 className="h3 fw-bold section-title mb-0">Top Hospitals</h2>
        <p className="text-secondary mt-3 mb-0">Trusted healthcare institutions across major regions.</p>
      </div>

      <div className="row g-4">
        {hospitals.map((hospital) => (
          <div className="col-12 col-md-6 col-lg-6 col-xl-3" key={hospital.id}>
            <div className="hospital-card card-premium card-hover h-100 hospital-card-enhanced">
              <div className="card-body p-4">
                <div className="hospital-header mb-3">
                  <h3 className="h6 fw-bold mb-2" style={{ color: '#2d3dbf' }}>
                    {hospital.name}
                  </h3>
                  <span className="badge bg-light text-primary">#{hospital.id}</span>
                </div>

                <div className="hospital-info">
                  <div className="info-item mb-2">
                    <span className="text-secondary">Location</span>
                    <p className="mb-0 fw-semibold text-dark">{hospital.city}, {hospital.state}</p>
                  </div>

                  <div className="info-item mb-2">
                    <span className="text-secondary">Contact</span>
                    <p className="mb-0 fw-semibold text-dark">{hospital.phone || hospital.email || 'N/A'}</p>
                  </div>

                  <div className="info-item">
                    <span className="text-secondary">Address</span>
                    <p className="mb-0 fw-semibold text-dark">{hospital.address || 'N/A'}</p>
                  </div>
                </div>

                <button
                  className="btn btn-sm btn-outline-primary w-100 mt-3"
                  onClick={() => navigate('/all-hospitals')}
                >
                  Learn More
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {hospitals.length === 0 && (
        <div className="alert alert-info text-center mt-4 mb-0">No hospitals available right now.</div>
      )}

      <div className="text-center mt-5">
        <button
          className="btn btn-primary btn-lg px-5"
          onClick={() => navigate('/all-hospitals')}
        >
          View All Hospitals
        </button>
      </div>
    </section>
  )
}

export default TopHospitals
