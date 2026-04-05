import React, { useContext, useState, useEffect } from "react";
import { AdminContext } from "../../context/AdminContext";
import { ADMIN_MESSAGES, showWarning } from "../../utils/adminToast";
import './DeleteDoctor.css'

const DeleteDoctor = () => {
  const { doctors, getAllDoctors, deleteDoctor, aToken } = useContext(AdminContext);

  const [loading, setLoading] = useState(false);
  const [confirmId, setConfirmId] = useState(null);

  useEffect(() => {
    if (aToken) getAllDoctors();
  }, [aToken]);

  const handleDelete = async () => {
    if (!confirmId) return showWarning(ADMIN_MESSAGES.confirmDeleteDoctor);
    setLoading(true);
    try {
      const success = await deleteDoctor(confirmId); // calling context function
      if (success) {
        setConfirmId(null);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="delete-doctor-wrapper">
      <h2 className="delete-doctor-title">
        Delete Doctor
      </h2>

      {/* DOCTOR LIST SECTION */}
      <div className="delete-doctor-selection-grid">
        {doctors.map((item, index) => (
          <div
            key={index}
            className={`delete-doctor-card ${
              confirmId === item._id ? "delete-doctor-card-selected" : ""
            }`}
            onClick={() => setConfirmId(item._id)}
          >
            <p className="delete-doctor-card-name">{item.name}</p>
            <p className="delete-doctor-card-specialty">
              {item.specialization}
            </p>
            <p className="delete-doctor-card-degree">
              {item.degree}
            </p>

            {confirmId === item._id && (
              <p className="delete-doctor-card-selected-text">
                Selected for deletion
              </p>
            )}
          </div>
        ))}
      </div>

      {/* CONFIRM DELETE BUTTON */}
      <div className="delete-doctor-confirmation">
        <div className="delete-doctor-warning">
          <img src={assets.warning_icon} className="delete-doctor-warning-icon" alt="" />
          <p className="delete-doctor-warning-text">
            Select a doctor card above → then press delete.
          </p>
        </div>

        <button
          disabled={loading}
          onClick={handleDelete}
          className={`delete-doctor-button ${
            loading ? "delete-doctor-button-disabled" : "delete-doctor-button-active"
          }`}
        >
          {loading ? "Deleting..." : "Delete Doctor"}
        </button>
      </div>
    </div>
  );
};

export default DeleteDoctor;
