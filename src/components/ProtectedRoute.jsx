/**
 * Route Protection Component
 * Ensures only authenticated users with proper role can access routes
 */

import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AdminContext } from '../admin/context/AdminContext';
import { DoctorContext } from '../admin/context/DoctorContext';
import { AppContext } from '../patient/context/AppContext';
import { clearTokens, getRoleFromToken, isTokenExpired } from '../admin/utils/auth';

/**
 * ProtectedRoute component
 * Only renders children if user has valid JWT token for the specified role
 * 
 * @param {React.ReactNode} children - Routes to protect
 * @param {string} requiredRole - 'ADMIN' | 'DOCTOR' | 'PATIENT'
 * @returns {React.ReactNode} - Children or redirect to login
 */
export const ProtectedRoute = ({ children, requiredRole = 'ADMIN' }) => {
  const adminCtx = useContext(AdminContext) || {};
  const doctorCtx = useContext(DoctorContext) || {};
  const patientCtx = useContext(AppContext) || {};

  const aToken = adminCtx.aToken || '';
  const dToken = doctorCtx.dToken || '';
  const pToken = patientCtx.token || '';

  const activeToken = requiredRole === 'ADMIN'
    ? aToken
    : requiredRole === 'DOCTOR'
      ? dToken
      : pToken;

  if (!activeToken) {
    // Redirect to login page if no token
    return <Navigate to="/login" replace />;
  }

  if (isTokenExpired(activeToken)) {
    clearTokens();
    return <Navigate to="/login" replace />;
  }

  const role = getRoleFromToken(activeToken);
  if (role !== requiredRole) {
    clearTokens();
    return <Navigate to="/login" replace />;
  }

  // User is authenticated with correct role
  return children;
};

/**
 * Redirect to appropriate dashboard if already logged in
 * Used to prevent accessing /login page when already authenticated
 */
export const GuestOnlyRoute = ({ children }) => {
  const adminCtx = useContext(AdminContext) || {};
  const doctorCtx = useContext(DoctorContext) || {};
  const patientCtx = useContext(AppContext) || {};

  const aToken = adminCtx.aToken || '';
  const dToken = doctorCtx.dToken || '';
  const pToken = patientCtx.token || '';

  if (aToken) {
    return <Navigate to="/admin-dashboard" replace />;
  }

  if (dToken) {
    return <Navigate to="/doctor-dashboard" replace />;
  }

  if (pToken) {
    return <Navigate to="/" replace />;
  }

  return children;
};
