import React, { useContext, useMemo } from "react";
import { Link } from "react-router-dom";
import { AppContext } from '../context/AppContext';
import '../styles/specialities.css'

const SpecialityMenu = () => {
  const { doctors } = useContext(AppContext);

  const specialities = useMemo(() => {
    return [...new Set(doctors.map((doctor) => doctor.speciality).filter(Boolean))].sort();
  }, [doctors]);

  return (
    <section id="speciality-section" className="my-5 speciality-section-premium">
      <div className="text-center mb-5">
        <h2 className="h3 fw-bold section-title mb-0">Doctor Specialities</h2>
        <p className="text-secondary mt-3 mb-0">Explore specialists across all major healthcare departments.</p>
      </div>

      <div className="row g-4">
        {specialities.map((speciality, index) => (
          <div className="col-12 col-sm-6 col-lg-4 col-xl-3" key={speciality}>
            <Link
              to={`/doctors/${encodeURIComponent(speciality)}`}
              onClick={() => window.scrollTo(0, 0)}
              className="text-decoration-none"
            >
              <div className="card speciality-card card-hover glow-on-hover" style={{ animationDelay: `${index * 0.05}s` }}>
                <div className="card-body py-4 text-center">
                  <div className="speciality-icon-container mb-3">
                    {/* Dynamic emoji icons for specialities */}
                    <span className="speciality-icon">
                      {['👨‍⚕️', '🩺', '👶', '👩‍⚕️', '🦴', '❤️', '👂', '👁️', '😁', '🧠', '🧬', '🔬', '💧', '💨', '⚡', '🏃', '🍎', '⚙️'][index % 18]}
                    </span>
                  </div>
                  <p className="mb-0 fw-semibold text-dark speciality-name">{speciality}</p>
                </div>
              </div>
            </Link>
          </div>
        ))}

        {specialities.length === 0 && (
          <div className="col-12">
            <div className="alert alert-info mb-0">No specialities available right now.</div>
          </div>
        )}
      </div>
    </section>
  );
};

export default SpecialityMenu;