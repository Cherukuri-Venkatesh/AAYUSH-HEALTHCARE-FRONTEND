import { createContext, useEffect, useState } from "react";
import { showError, MESSAGES } from '../utils/toastService';
import { fetchDoctorsForPatient } from '../utils/doctorApi';
import { clearTokens } from '../../admin/utils/auth';
import { patientApiGet } from '../utils/api';

export const AppContext = createContext()

// Get initial token only once to avoid multiple reads
const getInitialToken = () => localStorage.getItem('pToken') || localStorage.getItem('token') || '';

const AppContextProvider = (props) => {

    const currencySymbol = '₹'

    const [doctors, setDoctors] = useState([])
    const [token, setToken] = useState(getInitialToken)
    const [userData, setUserData] = useState(false)

    useEffect(() => {
        if (token) {
            localStorage.setItem('pToken', token);
            localStorage.removeItem('token');
        } else {
            localStorage.removeItem('pToken');
            localStorage.removeItem('token');
        }
    }, [token]);

    useEffect(() => {
        const handleAuthError = (event) => {
            setToken('');
            clearTokens();
            showError(event.detail?.message || MESSAGES.genericError);
            setTimeout(() => {
                window.location.href = '/login';
            }, 100);
        };

        window.addEventListener('auth_error', handleAuthError);
        return () => window.removeEventListener('auth_error', handleAuthError);
    }, []);

    // Getting Doctors (backend)
    const getDoctosData = async () => {
        try {
            const normalizedDoctors = await fetchDoctorsForPatient();
            setDoctors(normalizedDoctors);
        } catch (error) {
            setDoctors([]);
            showError(MESSAGES.genericError);
        }
    }

    // Getting User Profile
    const loadUserProfileData = async () => {
        try {
            const response = await patientApiGet('patient/me');

            if (!response || !response.success) {
                throw new Error(response?.error || MESSAGES.genericError);
            }

            const profile = response.data || {};
            setUserData({
                ...profile,
                patientId: profile.id,
                address: {
                    line1: profile.addressLine1 || '',
                    line2: profile.addressLine2 || '',
                },
            });
        } catch (error) {
            setUserData(false);
        }
    }

    useEffect(() => {
        // Only fetch doctors on mount without token (use public endpoint)
        // or if token becomes available - actually, let's not call this on mount
        // because if no token and backend auth-required, it will cause 401 loop
        // Instead, call this from pages when needed
        // Optional: fetch only if token exists
        if (token) {
            getDoctosData()
        }
    }, [])

    useEffect(() => {
        if (token) {
            loadUserProfileData()
        }
    }, [token])

    const value = {
        doctors, getDoctosData,
        currencySymbol,
        token, setToken,
        userData, setUserData, loadUserProfileData
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )

}

export default AppContextProvider