import React from 'react';
import PatientAppContextProvider from '../patient/context/AppContext.jsx';

const PatientProviders = ({ children }) => (
  <PatientAppContextProvider>
    {children}
  </PatientAppContextProvider>
);

export default PatientProviders;
