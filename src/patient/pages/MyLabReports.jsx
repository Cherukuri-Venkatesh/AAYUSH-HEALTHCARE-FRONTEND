import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { showSuccess, showError, MESSAGES } from '../utils/toastService'
import { patientApiDownload, patientApiGet } from '../utils/api'

const formatUploadedDateTime = (value) => {
    if (!value) return '-'
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return String(value)
    return parsed.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

const MyLabReports = () => {

    const { token } = useContext(AppContext)
    const [reports, setReports] = useState([])

    useEffect(() => {
        const loadReports = async () => {
            const response = await patientApiGet('patient/reports')
            if (!response || !response.success) {
                showError(response?.error || MESSAGES.genericError)
                setReports([])
                return
            }

            const normalized = (response.data || []).map((item) => ({
                _id: item.id,
                appointmentId: item.appointmentId,
                doctorName: item.doctorName || item.doctorId,
                uploadedDate: formatUploadedDateTime(item.uploadedAt),
                reportType: 'Lab Report',
            }))

            setReports(normalized)
        }

        if (token) loadReports()
    }, [token])

    const downloadReport = async (report) => {
        try {
            const blob = await patientApiDownload(`patient/download-report/${report._id}`)
            if (!blob) return

            const url = window.URL.createObjectURL(blob)
            const anchor = document.createElement('a')
            anchor.href = url
            anchor.download = `lab-report-${report._id}.pdf`
            document.body.appendChild(anchor)
            anchor.click()
            anchor.remove()
            window.URL.revokeObjectURL(url)
            showSuccess(MESSAGES.reportDownloaded)
        } catch (error) {
            showError(MESSAGES.reportDownloadFailed)
        }
    }

    return (
        <div className="py-5">
            <h2 className="h4 fw-bold mb-4">Lab Reports</h2>

            {reports.length === 0 ? (
                <div className="alert alert-info text-center" role="alert">
                    <p className="mb-0">{MESSAGES.noReports}</p>
                </div>
            ) : (
                <div>
                    {/* Mobile View */}
                    <div className="d-md-none">
                        {reports.map((report) => (
                            <div key={report._id} className="card mb-3 shadow-sm">
                                <div className="card-body">
                                    <h6 className="card-title fw-bold mb-2">{report.reportType}</h6>
                                    <small className="text-muted d-block">Doctor: {report.doctorName}</small>
                                    <small className="text-muted d-block">Appointment: {report.appointmentId}</small>
                                    <small className="text-muted d-block">Date: {report.uploadedDate}</small>
                                    <button
                                        onClick={() => downloadReport(report)}
                                        className="btn btn-sm btn-primary mt-3 w-100"
                                    >
                                        <i className="bi bi-download"></i> Download
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop View */}
                    <div className="table-responsive d-none d-md-block">
                        <table className="table table-hover">
                            <thead className="table-light">
                                <tr>
                                    <th>Doctor</th>
                                    <th>Appointment ID</th>
                                    <th>Date</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports.map((report) => (
                                    <tr key={report._id}>
                                        <td>{report.doctorName}</td>
                                        <td>{report.appointmentId}</td>
                                        <td>{report.uploadedDate}</td>
                                        <td>
                                            <button
                                                onClick={() => downloadReport(report)}
                                                className="btn btn-sm btn-primary"
                                            >
                                                <i className="bi bi-download"></i> Download
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}

export default MyLabReports
