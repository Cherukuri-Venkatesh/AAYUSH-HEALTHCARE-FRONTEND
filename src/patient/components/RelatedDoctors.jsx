import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DoctorCard from './DoctorCard'
import { fetchDoctorsForPatient } from '../utils/doctorApi'
import { showError, MESSAGES } from '../utils/toastService'
const RelatedDoctors = ({ speciality, docId }) => {

    const navigate = useNavigate()
    const [doctors, setDoctors] = useState([])

    const [relDoc, setRelDoc] = useState([])

    useEffect(() => {
        const loadDoctors = async () => {
            try {
                const data = await fetchDoctorsForPatient()
                setDoctors(data)
            } catch (error) {
                setDoctors([])
                showError(MESSAGES.genericError)
            }
        }

        loadDoctors()
    }, [])

    useEffect(() => {
        if (doctors.length > 0 && speciality) {
            const doctorsData = doctors.filter((doc) => doc.speciality === speciality && doc._id !== docId)
            setRelDoc(doctorsData)
        }
    }, [doctors, speciality, docId])

    return (
        <section className='my-5'>
            <h2 className='h4 fw-bold mb-1'>Related Doctors</h2>
            <p className='text-secondary mb-3'>Explore more specialists from the same department.</p>
            <div className='row g-4'>
                {relDoc.map((item) => (
                    <div className='col-12 col-md-6 col-xl-4' key={item._id}>
                        <DoctorCard
                            doctor={item}
                            onViewSchedule={() => navigate(`/appointment/${item._id}`)}
                            onBookAppointment={() => navigate(`/appointment/${item._id}`)}
                        />
                    </div>
                ))}
            </div>
        </section>
    )
}

export default RelatedDoctors