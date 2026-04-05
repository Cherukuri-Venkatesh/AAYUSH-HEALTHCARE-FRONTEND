import React, { useContext } from "react";
import { assets } from "../assets/assets";
import { NavLink } from "react-router-dom";
import { DoctorContext } from "../context/DoctorContext";
import { AdminContext } from "../context/AdminContext";
import './Sidebar.css'

const Sidebar = ({ isOpen, onClose }) => {
  const { dToken } = useContext(DoctorContext);
  const { aToken } = useContext(AdminContext);

  return (
    <div
      className={`admin-sidebar ${isOpen ? 'is-open' : ''}`}
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      {/* LOGO / HEADER */}
      <div className="admin-sidebar-header">
        <h2>⚕️ Clinic Panel</h2>
      </div>

      {/* ADMIN MENU */}
      {aToken && (
        <ul className="admin-sidebar-menu">
          <NavLink
            to="/admin-dashboard"
            className={({ isActive }) =>
              `admin-sidebar-menu-item ${isActive ? 'active' : ''}`
            }
            onClick={onClose}
          >
            <span className="admin-sidebar-icon-wrapper">
              <img src={assets.home_icon} alt="" />
            </span>
            Dashboard
          </NavLink>

          <NavLink
            to="/add-doctor"
            className={({ isActive }) =>
              `admin-sidebar-menu-item ${isActive ? 'active' : ''}`
            }
            onClick={onClose}
          >
            <span className="admin-sidebar-icon-wrapper">
              <img src={assets.add_icon} alt="" />
            </span>
            Add Doctor
          </NavLink>

          <NavLink
            to="/add-hospital"
            className={({ isActive }) =>
              `admin-sidebar-menu-item ${isActive ? 'active' : ''}`
            }
            onClick={onClose}
          >
            <span className="admin-sidebar-icon-wrapper">
              <img src={assets.add_icon} alt="" />
            </span>
            Add Hospital
          </NavLink>

          <NavLink
            to="/doctor-list"
            className={({ isActive }) =>
              `admin-sidebar-menu-item ${isActive ? 'active' : ''}`
            }
            onClick={onClose}
          >
            <span className="admin-sidebar-icon-wrapper">
              <img src={assets.people_icon} alt="" />
            </span>
            Doctors Management
          </NavLink>

          <NavLink
            to="/all-appointments"
            className={({ isActive }) =>
              `admin-sidebar-menu-item ${isActive ? 'active' : ''}`
            }
            onClick={onClose}
          >
            <span className="admin-sidebar-icon-wrapper">
              <img src={assets.appointment_icon} alt="" />
            </span>
            Patients Management
          </NavLink>

        </ul>
      )}

      {/* DOCTOR MENU */}
      {dToken && (
        <ul className="admin-sidebar-menu">
          <NavLink
            to="/doctor-dashboard"
            className={({ isActive }) =>
              `admin-sidebar-menu-item ${isActive ? 'active' : ''}`
            }
            onClick={onClose}
          >
            <span className="admin-sidebar-icon-wrapper">
              <img src={assets.home_icon} alt="" />
            </span>
            Dashboard
          </NavLink>

          <NavLink
            to="/doctor-appointments"
            className={({ isActive }) =>
              `admin-sidebar-menu-item ${isActive ? 'active' : ''}`
            }
            onClick={onClose}
          >
            <span className="admin-sidebar-icon-wrapper">
              <img src={assets.appointment_icon} alt="" />
            </span>
            Appointment Management
          </NavLink>

          <NavLink
            to="/doctor-patients"
            className={({ isActive }) =>
              `admin-sidebar-menu-item ${isActive ? 'active' : ''}`
            }
            onClick={onClose}
          >
            <span className="admin-sidebar-icon-wrapper">
              <img src={assets.people_icon} alt="" />
            </span>
            Patient Management
          </NavLink>

          <NavLink
            to="/doctor-schedule"
            className={({ isActive }) =>
              `admin-sidebar-menu-item ${isActive ? 'active' : ''}`
            }
            onClick={onClose}
          >
            <span className="admin-sidebar-icon-wrapper">
              <img src={assets.add_icon} alt="" />
            </span>
            Schedule Uploading
          </NavLink>

          <NavLink
            to="/doctor-analytics"
            className={({ isActive }) =>
              `admin-sidebar-menu-item ${isActive ? 'active' : ''}`
            }
            onClick={onClose}
          >
            <span className="admin-sidebar-icon-wrapper">
              <img src={assets.earning_icon} alt="" />
            </span>
            Analytics & Intelligence
          </NavLink>
        </ul>
      )}
    </div>
  );
};

export default Sidebar;
