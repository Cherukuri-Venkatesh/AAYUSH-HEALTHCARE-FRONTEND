export const TOAST_MESSAGES = {
  registrationSuccess: 'Registration successful. Please login to continue.',
  emailExists: 'Email already registered.',
  phoneExists: 'Phone number already registered.',
  allFieldsRequired: 'All fields are required.',
  invalidEmail: 'Invalid email format.',
  passwordMin6: 'Password must contain at least 6 characters.',

  loginSuccess: 'Login successful. Welcome back!',
  invalidCredentials: 'Invalid email or password.',
  accountNotFound: 'Account not found.',
  enterEmailPassword: 'Please enter email and password.',

  passwordResetSuccess: 'Password reset successfully.',
  resetAccountNotFound: 'Account not found with this email or phone number.',
  passwordsMismatch: 'Passwords do not match.',
  newPasswordEmpty: 'New password cannot be empty.',

  doctorsNoResults: 'No doctors found for the selected filters.',
  enterSearchCriteria: 'Please enter search criteria.',

  scheduleNotAvailable: 'Doctor schedule not available for selected date.',
  scheduleNotFound: 'No schedule found for this doctor.',

  noSlotsDate: 'No available slots for this date.',
  selectDoctorDateFirst: 'Please select doctor and date first.',

  selectTimeSlot: 'Please select a time slot.',
  fillRequiredFields: 'Please fill all required fields.',
  selectPaymentType: 'Please select payment type.',

  appointmentBooked: 'Appointment booked successfully.',

  doctorAlreadyBooked: 'Doctor already has appointment at this time.',
  bookWithin7Days: 'Appointment must be booked within next 7 days.',
  slotNoLongerAvailable: 'Selected slot is no longer available.',
  bookingFailed: 'Booking failed. Please try again.',

  cancelConfirm: 'Are you sure you want to cancel this appointment?',
  appointmentCancelled: 'Appointment cancelled successfully.',
  onlyBookedCanCancel: 'Only booked appointments can be cancelled.',
  cancelOwnOnly: 'You can only cancel your own appointment.',

  noAppointments: 'No appointments found.',

  noReports: 'No lab reports available.',
  reportDownloaded: 'Report downloaded successfully.',
  reportDownloadFailed: 'Unable to download report.',

  noPrescriptions: 'No prescriptions available.',
  prescriptionDownloaded: 'Prescription downloaded successfully.',

  profileUpdated: 'Profile updated successfully.',
  profileUpdateFailed: 'Unable to update profile.',
  nameCannotBeEmpty: 'Name cannot be empty.',

  logoutConfirm: 'Are you sure you want to logout?',

  sessionExpired: 'Session expired. Please login again.',
  unauthorized: 'Unauthorized access.',
  genericError: 'Something went wrong. Please try again later.',
}
