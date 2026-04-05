import React, { useContext, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext';
import { showError, showSuccess, MESSAGES } from '../utils/toastService';

const Verify = () => {

    const [searchParams] = useSearchParams()

    const success = searchParams.get("success")
    const appointmentId = searchParams.get("appointmentId")

    const { token } = useContext(AppContext)

    const navigate = useNavigate()

    const verifyStripe = async () => {
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            if (success === 'true') {
                showSuccess(MESSAGES.appointmentBooked);
            } else {
                showError(MESSAGES.bookingFailed);
            }
            navigate("/my-appointments");
        } catch (error) {
            showError(MESSAGES.genericError);
        }
    }

    useEffect(() => {
        if (token && appointmentId && success) {
            verifyStripe()
        }
    }, [token, appointmentId, success])

    return (
        <div className='d-flex align-items-center justify-content-center py-5' style={{ minHeight: '50vh' }}>
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    )
}

export default Verify