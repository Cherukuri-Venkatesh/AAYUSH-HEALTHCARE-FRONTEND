import { patientApiGet } from './api';

const SPECIALITY_MAP = {
  'General physician': 'General Physician (General Medicine)',
  Gynecology: 'Gynecologist / Obstetrician',
  Cardiology: 'Cardiologist',
  Dermatology: 'Dermatologist',
  Pediatrics: 'Pediatrician',
  ENT: 'ENT Specialist',
  Eye: 'Ophthalmologist (Eye Specialist)',
};

const normalizeDoctor = (doctor) => {
  const normalizedSpeciality = SPECIALITY_MAP[doctor.specialization] || doctor.specialization;
  const doctorId = String(doctor.id ?? '');

  return {
    _id: doctorId,
    doctorId,
    name: doctor.name || '',
    email: doctor.email || '',
    speciality: normalizedSpeciality || '',
    degree: doctor.degree || '',
    experience: doctor.experience || '',
    about: doctor.aboutDoctor || '',
    fees: Number(doctor.consultingFees || 0),
    hospitalId: doctor.hospitalId ? String(doctor.hospitalId) : '',
    hospital: doctor.hospitalName || '',
    address: {
      line1: doctor.addressLine1 || '',
      line2: doctor.addressLine2 || '',
    },
    whatsappNumber: doctor.whatsappNumber || '',
    slots_booked: {},
  };
};

export async function fetchDoctorsForPatient() {
  const result = await patientApiGet('patient/doctors', { useAuth: false });

  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch doctors');
  }

  const payload = result.data;

  if (!Array.isArray(payload)) {
    throw new Error('Invalid doctors response');
  }

  return payload.map(normalizeDoctor);
}

export async function fetchTopDoctorsForPatient(limit = 6) {
  const result = await patientApiGet('patient/doctors/top', { useAuth: false });

  if (!result.success) {
    // Fallback to regular doctors list if sorting fails
    const fallbackDoctors = await fetchDoctorsForPatient();
    return fallbackDoctors.slice(0, limit);
  }

  const payload = result.data;

  if (!Array.isArray(payload)) {
    throw new Error('Invalid top doctors response');
  }

  const sortedDoctors = payload.map(normalizeDoctor);
  return sortedDoctors.slice(-limit).reverse();
}
