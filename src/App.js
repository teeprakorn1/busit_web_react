import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NotFoundPage from './components/NotFoundPage/NotFoundPage';

import Login from './components/LoginPage/LoginPage';
import MainAdmin from './components/MainAdmin/MainAdmin';
import DashboardAdmin from './components/DashboardAdmin/DashboardAdmin';
import ActivityAdmin from './components/ActivityAdmin/ActivityAdmin';
import ApplicationAdmin from './components/ApplicationAdmin/ApplicationAdmin';
import NameRegisterAdmin from './components/NameRegisterAdmin/NameRegisterAdmin';
import StaffManagementAdmin from './components/StaffManagementAdmin/StaffManagementAdmin';

import GetPersonTimestampAdmin from './components/ApplicationAdmin/GetPersonTimestampAdmin/GetPersonTimestampAdmin';
import GetTimestampAdmin from './components/ApplicationAdmin/GetTimestampAdmin/GetTimestampAdmin';
import StudentNameAll from './components/NameRegisterAdmin/StudentNameAll/StudentNameAll';

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = sessionStorage.getItem("userSession");
  return isLoggedIn ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path='/login' element={<Login />} />

        {/* Protected Routes */}
        <Route path='/' element={<ProtectedRoute><MainAdmin /></ProtectedRoute>} />
        <Route path='/main' element={<ProtectedRoute><MainAdmin /></ProtectedRoute>} />
        <Route path='/dashboard' element={<ProtectedRoute><DashboardAdmin /></ProtectedRoute>} />
        <Route path='/activity' element={<ProtectedRoute><ActivityAdmin /></ProtectedRoute>} />
        <Route path='/application' element={<ProtectedRoute><ApplicationAdmin /></ProtectedRoute>} />
        <Route path='/name-register' element={<ProtectedRoute><NameRegisterAdmin /></ProtectedRoute>} />
        <Route path='/staff-management' element={<ProtectedRoute><StaffManagementAdmin /></ProtectedRoute>} />

        {/* Application Redirects */}
        <Route path='/application/get-person-timestamp' element={<ProtectedRoute><GetPersonTimestampAdmin /></ProtectedRoute>} />
        <Route path='/application/get-timestamp' element={<ProtectedRoute><GetTimestampAdmin /></ProtectedRoute>} />

        {/* Name Register Redirects */}
        <Route path='/name-register/student-name' element={<ProtectedRoute><StudentNameAll /></ProtectedRoute>} />

        {/* 404 Page */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
