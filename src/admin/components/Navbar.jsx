import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { DoctorContext } from '../context/DoctorContext'
import { AdminContext } from '../context/AdminContext'
import { useNavigate } from 'react-router-dom'
import './Navbar.css'

const Navbar = ({ isSidebarOpen, onToggleSidebar }) => {

  const { dToken, setDToken } = useContext(DoctorContext)
  const { aToken, setAToken } = useContext(AdminContext)
  const [isDoctorMenuOpen, setIsDoctorMenuOpen] = useState(false)

  const navigate = useNavigate()

  const logout = () => {
    navigate('/')
    dToken && setDToken('')
    dToken && localStorage.removeItem('dToken')
    aToken && setAToken('')
    aToken && localStorage.removeItem('aToken')
  }

  return (
    <div className='admin-navbar'>
      <div className='admin-navbar-left'>
        {(aToken || dToken) && (
          <button
            type='button'
            className='admin-navbar-menu-btn'
            onClick={onToggleSidebar}
            aria-label='Toggle sidebar menu'
            aria-expanded={isSidebarOpen}
          >
            ☰
          </button>
        )}
        <div className="admin-navbar-logo-section">
          <img className="admin-navbar-logo" src={assets.admin_logo} alt="Aayush Logo" />
          <h1 className="admin-navbar-title">Aayush Healthcare</h1>
        </div>
        {dToken && <p className='admin-navbar-badge'>Doctor</p>}
      </div>

      {aToken && (
        <button onClick={() => logout()} className='admin-navbar-logout'>Logout</button>
      )}

      {!aToken && !dToken && (
        <div className='admin-navbar-auth-links'>
          <button type='button' className='admin-navbar-ghost-btn' onClick={() => navigate('/admin-dashboard')}>Login</button>
        </div>
      )}

      {!aToken && dToken && (
        <div className='admin-navbar-profile-wrap'>
          <button
            type='button'
            className='admin-navbar-profile-btn'
            onClick={() => setIsDoctorMenuOpen((prev) => !prev)}
            aria-label='Open doctor profile menu'
          >
            👤
          </button>

          {isDoctorMenuOpen && (
            <div className='admin-navbar-profile-dropdown'>
              <button
                type='button'
                onClick={() => {
                  navigate('/doctor-profile')
                  setIsDoctorMenuOpen(false)
                }}
              >
                My Profile
              </button>
              <button
                type='button'
                onClick={() => {
                  setIsDoctorMenuOpen(false)
                  logout()
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Navbar