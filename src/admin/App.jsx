import React, { useContext, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { DoctorContext } from './context/DoctorContext';
import { AdminContext } from './context/AdminContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import ForgotPassword from './pages/Doctor/ForgotPassword';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

const App = () => {
  const { dToken, dashData: doctorDashData } = useContext(DoctorContext);
  const { aToken } = useContext(AdminContext);
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!dToken && !aToken) {
    return (
      <>
        <ToastContainer />
        {location.pathname === '/doctor-forgot-password' ? <ForgotPassword /> : <Login />}
      </>
    );
  }

  return (
    <div className="admin-app-container">
      <ToastContainer />
      <Navbar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />
      <div className="admin-app-layout">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        {isSidebarOpen && <div className="admin-sidebar-backdrop" onClick={() => setIsSidebarOpen(false)} />}
        <div className="admin-app-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default App;