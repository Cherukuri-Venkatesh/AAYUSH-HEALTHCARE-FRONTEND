import { toast } from 'react-toastify';

const toastOptions = {
  position: 'top-center',
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

const formatMessage = (message) => `🏥 AAYUSH HEALTH CARE says\n${message}`;

export const ADMIN_MESSAGES = {
  adminLoginSuccessful: 'Admin login successful',
  invalidAdminCredentials: 'Invalid admin credentials',
  doctorLoginSuccessful: 'Doctor login successful',
  invalidDoctorCredentials: 'Invalid doctor credentials',
  imageNotSelected: 'Image Not Selected',
  failedToCropImage: 'Failed to crop image',
  doctorAddedSuccessfully: 'Doctor added successfully',
  errorAddingDoctor: 'Error adding doctor',
  doctorDeleted: 'Doctor deleted',
  errorDeletingDoctor: 'Error deleting doctor',
  availabilityUpdated: 'Availability updated',
  errorUpdatingAvailability: 'Error updating availability',
  appointmentCancelled: 'Appointment cancelled',
  errorCancellingAppointment: 'Error cancelling appointment',
  errorLoadingDoctors: 'Error loading doctors',
  errorLoadingAppointments: 'Error loading appointments',
  errorLoadingDashboardData: 'Error loading dashboard data',
  somethingWentWrong: 'Something went wrong. Please try again later.',
  patientDeletedSuccessfully: 'Patient deleted successfully.',
  confirmDeleteDoctor: 'Are you sure you want to delete this doctor?',
  confirmDeletePatient: 'Are you sure you want to delete this patient?',
  allFieldsAreRequired: 'All fields are required.',
  invalidEmailFormat: 'Invalid email format.',
  passwordMinimumSix: 'Password must contain at least 6 characters.',
};

export const showSuccess = (message) => toast.success(formatMessage(message), toastOptions);
export const showError = (message) => toast.error(formatMessage(message), toastOptions);
export const showInfo = (message) => toast.info(formatMessage(message), toastOptions);
export const showWarning = (message) => toast.warning(formatMessage(message), toastOptions);
