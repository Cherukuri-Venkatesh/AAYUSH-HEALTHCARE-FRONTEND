import React from 'react';
import AdminContextProvider from '../admin/context/AdminContext.jsx';
import DoctorContextProvider from '../admin/context/DoctorContext.jsx';
import AdminUtilityContextProvider from '../admin/context/AppContext.jsx';

const AdminProviders = ({ children }) => (
  <AdminContextProvider>
    <DoctorContextProvider>
      <AdminUtilityContextProvider>
        {children}
      </AdminUtilityContextProvider>
    </DoctorContextProvider>
  </AdminContextProvider>
);

export default AdminProviders;
