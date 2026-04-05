import React from 'react'
import { useNavigate } from 'react-router-dom'

const Banner = () => {

    const navigate = useNavigate()

    return (
        <section id="healthcare-banners" className="my-5">
            <div className="row g-3">
                <div className="col-12 col-lg-6">
                    <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(140deg, #5F6FFF, #7f8cff)' }}>
                        <div className="card-body p-4 text-white">
                            <h3 className="h4 fw-bold mb-2">24/7 Digital Care Support</h3>
                            <p className="mb-3">Book specialist consultations and follow-up care with real-time tracking.</p>
                            <button
                                onClick={() => navigate('/doctors')}
                                className="btn btn-light fw-semibold"
                            >
                                BOOK APPOINTMENT
                            </button>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-lg-6">
                    <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(140deg, #5F6FFF, #7f8cff)' }}>
                        <div className="card-body p-4 text-white">
                            <h3 className="h4 fw-bold mb-2">Secure Records and Fast Access</h3>
                            <p className="mb-3">Access prescriptions, reports, and appointment history in one secure dashboard.</p>
                            <button
                                onClick={() => navigate('/doctors')}
                                className="btn btn-light fw-semibold"
                            >
                                VIEW DOCTORS
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="card border-0 shadow-sm mt-3" style={{ background: '#e9edff' }}>
                <div className="card-body d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2">
                    <div>
                        <h4 className="h5 mb-1 fw-bold" style={{ color: '#2d3dbf' }}>Need immediate consultation?</h4>
                        <p className="mb-0 text-secondary">Find available doctors, view schedule, and confirm your slot in minutes.</p>
                    </div>
                    <button onClick={() => navigate('/doctors')} className="btn btn-primary" style={{ background: '#5F6FFF', borderColor: '#5F6FFF' }}>
                        View Doctors
                    </button>
                </div>
            </div>
        </section>
    )
}

export default Banner