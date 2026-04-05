import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from './admin/App.jsx';
import Dashboard from './admin/pages/Admin/Dashboard.jsx';
import AllAppointments from './admin/pages/Admin/AllAppointments.jsx';
import AddDoctor from './admin/pages/Admin/AddDoctor.jsx';
import AddHospital from './admin/pages/Admin/AddHospital.jsx';
import DeleteDoctor from './admin/pages/Admin/DeleteDoctor.jsx';
import DoctorsList from './admin/pages/Admin/DoctorsList.jsx';
import DoctorAppointments from './admin/pages/Doctor/DoctorAppointments.jsx';
import DoctorDashboard from './admin/pages/Doctor/DoctorDashboard.jsx';
import DoctorProfile from './admin/pages/Doctor/DoctorProfile.jsx';
import DoctorPatients from './admin/pages/Doctor/DoctorPatients.jsx';
import DoctorPatientProfile from './admin/pages/Doctor/DoctorPatientProfile.jsx';
import DoctorSchedule from './admin/pages/Doctor/DoctorSchedule.jsx';
import DoctorAnalytics from './admin/pages/Doctor/DoctorAnalytics.jsx';
import DoctorForgotPassword from './admin/pages/Doctor/ForgotPassword.jsx';
import PatientLayout from './patient/App.jsx';
import About from './patient/pages/About.jsx';
import AllHospitals from './patient/pages/AllHospitals.jsx';
import Appointment from './patient/pages/Appointment.jsx';
import Contact from './patient/pages/Contact.jsx';
import Doctors from './patient/pages/Doctors.jsx';
import Home from './patient/pages/Home.jsx';
import Login from './patient/pages/Login.jsx';
import ForgotPassword from './patient/pages/ForgotPassword.jsx';
import MyAppointments from './patient/pages/MyAppointments.jsx';
import MyLabReports from './patient/pages/MyLabReports.jsx';
import MyPrescriptions from './patient/pages/MyPrescriptions.jsx';
import MyProfile from './patient/pages/MyProfile.jsx';
import Verify from './patient/pages/Verify.jsx';
import AdminProviders from './providers/AdminProviders.jsx';
import PatientProviders from './providers/PatientProviders.jsx';
import { ProtectedRoute, GuestOnlyRoute } from './components/ProtectedRoute.jsx';
import InactivityLogout from './components/InactivityLogout.jsx';

const App = () => {
  return (
    <>
      <InactivityLogout />
      <Routes>
        <Route
          element={(
            <PatientProviders>
              <PatientLayout />
            </PatientProviders>
          )}
        >
          <Route path="/" element={<Home />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/doctors/:speciality" element={<Doctors />} />
          <Route path="/all-hospitals" element={<AllHospitals />} />
          <Route path="/login" element={<GuestOnlyRoute><Login /></GuestOnlyRoute>} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/appointment/:docId" element={<ProtectedRoute requiredRole="PATIENT"><Appointment /></ProtectedRoute>} />
          <Route path="/my-appointments" element={<ProtectedRoute requiredRole="PATIENT"><MyAppointments /></ProtectedRoute>} />
          <Route path="/my-profile" element={<ProtectedRoute requiredRole="PATIENT"><MyProfile /></ProtectedRoute>} />
          <Route path="/verify" element={<ProtectedRoute requiredRole="PATIENT"><Verify /></ProtectedRoute>} />
          <Route path="/my-prescriptions" element={<ProtectedRoute requiredRole="PATIENT"><MyPrescriptions /></ProtectedRoute>} />
          <Route path="/my-labreports" element={<ProtectedRoute requiredRole="PATIENT"><MyLabReports /></ProtectedRoute>} />
        </Route>

        <Route
          element={(
            <AdminProviders>
              <AdminLayout />
            </AdminProviders>
          )}
        >
          {/* Admin Routes - Protected by ADMIN token */}
          <Route path="/admin-dashboard" element={<ProtectedRoute requiredRole="ADMIN"><Dashboard /></ProtectedRoute>} />
          <Route path="/all-appointments" element={<ProtectedRoute requiredRole="ADMIN"><AllAppointments /></ProtectedRoute>} />
          <Route path="/add-doctor" element={<ProtectedRoute requiredRole="ADMIN"><AddDoctor /></ProtectedRoute>} />
          <Route path="/add-hospital" element={<ProtectedRoute requiredRole="ADMIN"><AddHospital /></ProtectedRoute>} />
          <Route path="/delete-doctor" element={<ProtectedRoute requiredRole="ADMIN"><DeleteDoctor /></ProtectedRoute>} />
          <Route path="/doctor-list" element={<ProtectedRoute requiredRole="ADMIN"><DoctorsList /></ProtectedRoute>} />

          {/* Doctor Routes - Protected by DOCTOR token */}
          <Route path="/doctor-dashboard" element={<ProtectedRoute requiredRole="DOCTOR"><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/doctor-appointments" element={<ProtectedRoute requiredRole="DOCTOR"><DoctorAppointments /></ProtectedRoute>} />
          <Route path="/doctor-profile" element={<ProtectedRoute requiredRole="DOCTOR"><DoctorProfile /></ProtectedRoute>} />
          <Route path="/doctor-patients" element={<ProtectedRoute requiredRole="DOCTOR"><DoctorPatients /></ProtectedRoute>} />
          <Route path="/doctor-patient/:patientId" element={<ProtectedRoute requiredRole="DOCTOR"><DoctorPatientProfile /></ProtectedRoute>} />
          <Route path="/doctor-schedule" element={<ProtectedRoute requiredRole="DOCTOR"><DoctorSchedule /></ProtectedRoute>} />
          <Route path="/doctor-analytics" element={<ProtectedRoute requiredRole="DOCTOR"><DoctorAnalytics /></ProtectedRoute>} />
          <Route path="/doctor-forgot-password" element={<DoctorForgotPassword />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;
