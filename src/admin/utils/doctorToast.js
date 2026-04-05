import { toast } from 'react-toastify';

const toastOptions = {
  position: 'top-center',
  autoClose: 2800,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

const formatMessage = (message) => {
  return `🏥 AAYUSH HEALTH CARE says\n${message}`;
};

export const DOCTOR_MESSAGES = {
  registrationSuccess: 'Registration successful. Please login to continue.',
  emailAlreadyRegistered: 'Email already registered.',
  phoneAlreadyRegistered: 'Phone number already registered.',
  allFieldsRequired: 'All fields are required.',
  invalidEmailFormat: 'Invalid email format.',
  passwordMinimumSix: 'Password must contain at least 6 characters.',

  loginSuccess: 'Login successful. Welcome back!',
  invalidEmailOrPassword: 'Invalid email or password.',
  accountNotFound: 'Account not found.',
  enterEmailAndPassword: 'Please enter email and password.',

  passwordResetSuccess: 'Password reset successfully.',
  accountNotFoundWithIdentifier: 'Account not found with this email or phone number.',
  passwordsDoNotMatch: 'Passwords do not match.',
  newPasswordCannotBeEmpty: 'New password cannot be empty.',

  noDoctorsForSelectedFilters: 'No doctors found for the selected filters.',
  enterSearchCriteria: 'Please enter search criteria.',

  doctorScheduleNotAvailable: 'Doctor schedule not available for selected date.',
  noScheduleFoundForDoctor: 'No schedule found for this doctor.',

  noSlotsForDate: 'No available slots for this date.',
  selectDoctorAndDateFirst: 'Please select doctor and date first.',

  selectTimeSlot: 'Please select a time slot.',
  fillRequiredFields: 'Please fill all required fields.',
  selectPaymentType: 'Please select payment type.',

  appointmentBookedSuccess: 'Appointment booked successfully.',

  doctorAlreadyHasAppointmentAtTime: 'Doctor already has appointment at this time.',
  appointmentWithinNextSevenDays: 'Appointment must be booked within next 7 days.',
  slotNoLongerAvailable: 'Selected slot is no longer available.',
  bookingFailedTryAgain: 'Booking failed. Please try again.',

  cancelAppointmentConfirm: 'Are you sure you want to cancel this appointment?',
  appointmentCancelledSuccess: 'Appointment cancelled successfully.',
  onlyBookedCanCancel: 'Only booked appointments can be cancelled.',
  cancelOwnAppointmentOnly: 'You can only cancel your own appointment.',

  noAppointmentsFound: 'No appointments found.',

  noLabReportsAvailable: 'No lab reports available.',
  reportDownloadedSuccess: 'Report downloaded successfully.',
  unableToDownloadReport: 'Unable to download report.',

  noPrescriptionsAvailable: 'No prescriptions available.',
  prescriptionDownloadedSuccess: 'Prescription downloaded successfully.',

  profileUpdatedSuccess: 'Profile updated successfully.',
  unableToUpdateProfile: 'Unable to update profile.',
  nameCannotBeEmpty: 'Name cannot be empty.',

  logoutConfirm: 'Are you sure you want to logout?',

  sessionExpiredLoginAgain: 'Session expired. Please login again.',
  unauthorizedAccess: 'Unauthorized access.',
  somethingWentWrong: 'Something went wrong. Please try again later.',
};

export const showSuccess = (message) => toast.success(formatMessage(message), toastOptions);
export const showError = (message) => toast.error(formatMessage(message), toastOptions);
export const showInfo = (message) => toast.info(formatMessage(message), toastOptions);
export const showWarning = (message) => toast.warning(formatMessage(message), toastOptions);
