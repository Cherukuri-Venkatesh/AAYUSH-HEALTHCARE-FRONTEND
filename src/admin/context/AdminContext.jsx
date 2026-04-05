import { createContext, useState, useEffect } from 'react';
import { ADMIN_MESSAGES, showError, showSuccess } from '../utils/adminToast';
import { clearTokens } from '../utils/auth';
import { apiDelete, apiGet, apiPut } from '../utils/api';


export const AdminContext = createContext();

// Get initial token only once to avoid multiple reads
const getInitialAToken = () => localStorage.getItem('aToken') || '';

const AdminContextProvider = (props) => {
    // Load token from localStorage (persists across page refresh)
    const [aToken, setAToken] = useState(getInitialAToken);
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [patients, setPatients] = useState([]);
    const [dashData, setDashData] = useState(null);

    const normalizeDoctor = (doctor) => ({
        id: String(doctor.id),
        _id: String(doctor.id),
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization,
        consultingFees: Number(doctor.consultingFees || 0),
        degree: doctor.degree,
        experience: doctor.experience,
        addressLine1: doctor.addressLine1,
        aboutDoctor: doctor.aboutDoctor,
        whatsappNumber: doctor.whatsappNumber,
        photo: '',
        image: '',
        hospital_id: doctor.hospitalId ? String(doctor.hospitalId) : '',
        hospitalName: doctor.hospitalName || '',
    });

    const normalizePatient = (patient) => ({
        id: String(patient.id),
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        gender: patient.gender || '',
        age: patient.age || null,
    });

    const normalizeAppointment = (item) => ({
        _id: String(item.id),
        appointmentId: String(item.id),
        patientId: String(item.patientId),
        doctorId: String(item.doctorId),
        doctorName: item.doctorName,
        specialisation: item.doctorSpecialization,
        hospital: item.hospitalName,
        age: item.age,
        weight: item.weight,
        issue: item.issue,
        appointmentDate: String(item.appointmentDate || ''),
        appointmentTime: String(item.appointmentTime || ''),
        startTime: String(item.appointmentTime || ''),
        endTime: String(item.appointmentTime || ''),
        consultingFees: Number(item.consultingFees || 0),
        paymentType: item.paymentType,
        status: item.status,
    });

    const buildMonthlySeries = (rows, valueSelector) => {
        const map = {};
        rows.forEach((item) => {
            const key = String(item.appointmentDate || '').slice(0, 7);
            if (!key) return;
            map[key] = (map[key] || 0) + valueSelector(item);
        });

        return Object.entries(map)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([label, value]) => ({ label, value: Number(value) }));
    };

    // Only sync when token actually changes - only manage aToken
    useEffect(() => {
        if (aToken) {
            localStorage.setItem('aToken', aToken);
        } else {
            localStorage.removeItem('aToken');
        }
    }, [aToken]);

    // Handle auth errors globally (e.g., 401/403 from API)
    useEffect(() => {
        const handleAuthError = (event) => {
            setAToken('');
            clearTokens();
            showError(event.detail?.message || 'Session expired. Please login again.');
            setTimeout(() => window.location.href = '/', 100);
        };
        
        window.addEventListener('auth_error', handleAuthError);
        return () => window.removeEventListener('auth_error', handleAuthError);
    }, []);

    const buildDashboardAnalytics = (doctorRows, patientRows, appointmentRows, hospitalCount) => {
        const totalRevenue = appointmentRows
            .filter((item) => item.status === 'COMPLETED')
            .reduce((sum, item) => sum + Number(item.consultingFees || 0), 0);

        const totalCompletedAppointments = appointmentRows.filter((item) => item.status === 'COMPLETED').length;
        const totalCancelledAppointments = appointmentRows.filter((item) => item.status === 'CANCELLED').length;
        const totalAppointmentsFromDayOne = appointmentRows.length;

        const appointmentGrowth = buildMonthlySeries(appointmentRows, () => 1);
        const revenueGrowth = buildMonthlySeries(
            appointmentRows.filter((item) => item.status === 'COMPLETED'),
            (item) => Number(item.consultingFees || 0),
        );

        const doctorOnboardingGrowth = appointmentGrowth.map((item, index) => ({
            label: item.label,
            value: Math.max(doctorRows.length - (appointmentGrowth.length - 1 - index), 0),
        }));

        const patientRegistrationGrowth = appointmentGrowth.map((item, index) => ({
            label: item.label,
            value: Math.max(patientRows.length - (appointmentGrowth.length - 1 - index), 0),
        }));

        return {
            totalPatients: patientRows.length,
            totalHospitals: hospitalCount,
            totalDoctors: doctorRows.length,
            totalRevenueEarnedByDoctors: totalRevenue,
            totalAppointmentsFromDayOne,
            totalCompletedAppointments,
            totalCancelledAppointments,
            appointmentGrowth,
            applicationGrowth: appointmentGrowth,
            revenueGrowth,
            doctorOnboardingGrowth,
            patientRegistrationGrowth,
        };
    };

    useEffect(() => {
        if (!aToken) return;

        getAllDoctors();
        getAllPatients();
        getAllAppointments();
    }, [aToken]);

    const getAllDoctors = async () => {
        try {
            const response = await apiGet('admin/doctor/all');
            if (!response || !response.success) throw new Error(response?.error || ADMIN_MESSAGES.errorLoadingDoctors);
            const rows = Array.isArray(response.data) ? response.data.map(normalizeDoctor) : [];
            setDoctors(rows);
        } catch (error) {
            showError(ADMIN_MESSAGES.errorLoadingDoctors);
        }
    };

    const addDoctor = async (doctorPayload) => {
        try {
            const response = await apiGet('admin/doctor/all');
            if (!response || !response.success) throw new Error(response?.error || ADMIN_MESSAGES.errorLoadingDoctors);
            const rows = Array.isArray(response.data) ? response.data.map(normalizeDoctor) : [];
            setDoctors(rows);
            return Boolean(doctorPayload);
        } catch (error) {
            showError(ADMIN_MESSAGES.errorAddingDoctor);
            return false;
        }
    };

    const deleteDoctor = async (docId) => {
        try {
            const response = await apiDelete(`admin/doctor/delete/${docId}`);
            if (!response || !response.success) throw new Error(response?.error || ADMIN_MESSAGES.errorDeletingDoctor);
            await getAllDoctors();
            showSuccess(ADMIN_MESSAGES.doctorDeleted);
            return true;
        } catch (error) {
            showError(error?.message || ADMIN_MESSAGES.errorDeletingDoctor);
            return false;
        }
    };

    const changeAvailability = async (docId) => {
        try {
            const target = doctors.find((doc) => doc.id === docId || doc._id === docId);
            if (!target) return;

            const payload = {
                name: target.name,
                email: target.email,
                specialization: target.specialization,
                consultingFees: target.consultingFees,
                degree: target.degree,
                experience: target.experience,
                addressLine1: target.addressLine1,
                aboutDoctor: target.aboutDoctor,
                whatsappNumber: target.whatsappNumber,
                hospital: target.hospital_id ? { id: Number(target.hospital_id) } : null,
            };

            const response = await apiPut(`admin/doctor/update/${docId}`, payload);
            if (!response || !response.success) throw new Error(response?.error || ADMIN_MESSAGES.errorUpdatingAvailability);
            await getAllDoctors();
            showSuccess(ADMIN_MESSAGES.availabilityUpdated);
        } catch (error) {
            showError(ADMIN_MESSAGES.errorUpdatingAvailability);
        }
    };

    const getAllPatients = async () => {
        try {
            const response = await apiGet('patients/all');
            if (!response || !response.success) throw new Error(response?.error || ADMIN_MESSAGES.somethingWentWrong);
            const rows = Array.isArray(response.data) ? response.data.map(normalizePatient) : [];
            setPatients(rows);
        } catch (error) {
            showError(ADMIN_MESSAGES.somethingWentWrong || 'Something went wrong. Please try again later.');
        }
    };

    const deletePatient = async (patientId) => {
        try {
            const response = await apiDelete(`patients/delete/${patientId}`);
            if (!response || !response.success) throw new Error(response?.error || ADMIN_MESSAGES.somethingWentWrong);
            await getAllPatients();
            showSuccess(ADMIN_MESSAGES.patientDeletedSuccessfully);
            return true;
        } catch (error) {
            showError(error?.message || ADMIN_MESSAGES.somethingWentWrong || 'Something went wrong. Please try again later.');
            return false;
        }
    };

    const getAllAppointments = async () => {
        try {
            const response = await apiGet('appointments/all');
            if (!response || !response.success) throw new Error(response?.error || ADMIN_MESSAGES.errorLoadingAppointments);
            const rows = Array.isArray(response.data) ? response.data.map(normalizeAppointment) : [];
            setAppointments(rows);
        } catch (error) {
            showError(ADMIN_MESSAGES.errorLoadingAppointments);
        }
    };

    const cancelAppointment = async (appointmentId) => {
        try {
            const response = await apiPut(`appointments/status/${appointmentId}?status=CANCELLED`, {});
            if (!response || !response.success) throw new Error(response?.error || ADMIN_MESSAGES.errorCancellingAppointment);
            await getAllAppointments();
            showSuccess(ADMIN_MESSAGES.appointmentCancelled);
        } catch (error) {
            showError(ADMIN_MESSAGES.errorCancellingAppointment);
        }
    };

    const getDashData = async () => {
        try {
            const [dashboardResponse, doctorsResponse, patientsResponse, appointmentsResponse, hospitalsResponse] = await Promise.all([
                apiGet('admin/dashboard'),
                apiGet('admin/doctor/all'),
                apiGet('patients/all'),
                apiGet('appointments/all'),
                apiGet('hospitals/all'),
            ]);

            if (!dashboardResponse?.success) throw new Error(dashboardResponse?.error || ADMIN_MESSAGES.errorLoadingDashboardData);
            if (!doctorsResponse?.success) throw new Error(doctorsResponse?.error || ADMIN_MESSAGES.errorLoadingDashboardData);
            if (!patientsResponse?.success) throw new Error(patientsResponse?.error || ADMIN_MESSAGES.errorLoadingDashboardData);
            if (!appointmentsResponse?.success) throw new Error(appointmentsResponse?.error || ADMIN_MESSAGES.errorLoadingDashboardData);

            const doctorRows = Array.isArray(doctorsResponse.data) ? doctorsResponse.data.map(normalizeDoctor) : [];
            const patientRows = Array.isArray(patientsResponse.data) ? patientsResponse.data.map(normalizePatient) : [];
            const appointmentRows = Array.isArray(appointmentsResponse.data) ? appointmentsResponse.data.map(normalizeAppointment) : [];
            const hospitalCount = Array.isArray(hospitalsResponse?.data) ? hospitalsResponse.data.length : 0;

            setDoctors(doctorRows);
            setPatients(patientRows);
            setAppointments(appointmentRows);

            const computed = buildDashboardAnalytics(doctorRows, patientRows, appointmentRows, hospitalCount);
            const raw = dashboardResponse.data || {};
            setDashData({
                ...computed,
                totalPatients: Number(raw.totalPatients ?? computed.totalPatients),
                totalDoctors: Number(raw.totalDoctors ?? computed.totalDoctors),
                totalAppointmentsFromDayOne: Number(raw.totalAppointments ?? computed.totalAppointmentsFromDayOne),
                totalCompletedAppointments: Number(raw.completedAppointments ?? computed.totalCompletedAppointments),
                totalCancelledAppointments: Number(raw.cancelledAppointments ?? computed.totalCancelledAppointments),
                totalRevenueEarnedByDoctors: Number(raw.totalRevenue ?? computed.totalRevenueEarnedByDoctors),
                totalHospitals: computed.totalHospitals,
            });
        } catch (error) {
            showError(ADMIN_MESSAGES.errorLoadingDashboardData);
        }
    };

    const value = {
        aToken,
        setAToken,
        doctors,
        getAllDoctors,
        addDoctor,
        deleteDoctor,
        changeAvailability,
        patients,
        getAllPatients,
        deletePatient,
        appointments,
        getAllAppointments,
        getDashData,
        cancelAppointment,
        dashData,
    };

    return <AdminContext.Provider value={value}>{props.children}</AdminContext.Provider>;
};

export default AdminContextProvider;