import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { clearTokens, getCurrentRole, getCurrentToken, isTokenExpired } from '../admin/utils/auth';

const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;

const InactivityLogout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const timeoutRef = useRef(null);

  const redirectToLogin = () => {
    const role = getCurrentRole();
    if (role === 'PATIENT') {
      navigate('/login', { replace: true });
      return;
    }

    // Admin/doctor login is rendered by admin layout when tokens are missing.
    navigate('/', { replace: true });
  };

  const logoutForInactivity = () => {
    clearTokens();
    window.dispatchEvent(new CustomEvent('auth_error', {
      detail: { message: 'Session expired due to inactivity. Please login again.' }
    }));
    redirectToLogin();
  };

  const resetTimer = () => {
    const token = getCurrentToken();
    if (!token) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(logoutForInactivity, INACTIVITY_TIMEOUT_MS);
  };

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'touchstart'];

    const handleActivity = () => {
      resetTimer();
    };

    events.forEach((eventName) => {
      window.addEventListener(eventName, handleActivity);
    });

    const expiryCheck = setInterval(() => {
      const token = getCurrentToken();
      if (token && isTokenExpired(token)) {
        logoutForInactivity();
      }
    }, 30 * 1000);

    resetTimer();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      clearInterval(expiryCheck);
      events.forEach((eventName) => {
        window.removeEventListener(eventName, handleActivity);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return null;
};

export default InactivityLogout;
