import { patientApiGet } from './api';

const normalizeHospital = (hospital, index) => {
  const hospitalId = String(hospital.id ?? `hosp-${index + 1}`);

  return {
    id: hospitalId,
    name: hospital.name || `Hospital ${index + 1}`,
    email: hospital.email || '',
    phone: hospital.phone || '',
    address: hospital.address || '',
    city: hospital.city || '',
    state: hospital.state || '',
    pincode: String(hospital.pincode || ''),
    description: hospital.description || '',
  };
};

export async function fetchHospitalsForPatient() {
  const result = await patientApiGet('hospitals/all', { useAuth: false });

  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch hospitals');
  }

  const payload = result.data;

  if (!Array.isArray(payload)) {
    throw new Error('Invalid hospitals response');
  }

  return payload.map(normalizeHospital);
}

export async function fetchTopHospitalsForPatient(limit = 4) {
  const result = await patientApiGet('hospitals/min-doctors?min=1', { useAuth: false });

  if (!result.success) {
    // Fallback to regular hospitals list if filtering fails
    const fallbackHospitals = await fetchHospitalsForPatient();
    return fallbackHospitals.slice(0, limit);
  }

  const payload = result.data;

  if (!Array.isArray(payload)) {
    throw new Error('Invalid top hospitals response');
  }

  return payload.map(normalizeHospital).slice(0, limit);
}