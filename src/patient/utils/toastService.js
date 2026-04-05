import { toast } from 'react-toastify';
import { TOAST_MESSAGES } from '../constants/patientConstants';

const TOAST_DEDUPE_WINDOW_MS = 2500;
const lastToastShownAt = new Map();

export const toastConfig = {
  position: "top-center",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

const formatMessage = (message) => {
  return `🏥 AAYUSH HEALTH CARE says\n${message}`;
};

const shouldShowToast = (type, message) => {
  const key = `${type}:${message}`;
  const now = Date.now();
  const lastShown = lastToastShownAt.get(key) || 0;

  if (now - lastShown < TOAST_DEDUPE_WINDOW_MS) {
    return false;
  }

  lastToastShownAt.set(key, now);
  return true;
};

export const showSuccess = (message) => {
  if (!shouldShowToast('success', message)) return;
  toast.success(formatMessage(message), toastConfig);
};

export const showError = (message) => {
  if (!shouldShowToast('error', message)) return;
  toast.error(formatMessage(message), toastConfig);
};

export const showInfo = (message) => {
  if (!shouldShowToast('info', message)) return;
  toast.info(formatMessage(message), toastConfig);
};

export const showWarning = (message) => {
  if (!shouldShowToast('warning', message)) return;
  toast.warning(formatMessage(message), toastConfig);
};

export const MESSAGES = TOAST_MESSAGES;
