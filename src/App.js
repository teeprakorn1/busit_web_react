import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import Login from './components/LoginPage/LoginPage';
import MainAdmin from './components/MainAdmin/MainAdmin';
import DashboardAdmin from './components/DashboardAdmin/DashboardAdmin';
import ActivityAdmin from './components/ActivityAdmin/ActivityAdmin';
import ApplicationAdmin from './components/ApplicationAdmin/ApplicationAdmin';
import NameRegisterAdmin from './components/NameRegisterAdmin/NameRegisterAdmin';
import StaffManagementAdmin from './components/StaffManagementAdmin/StaffManagementAdmin';

// 404 Page
function NotFound() {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>404</h1>
      <p>Page not found</p>
      <button onClick={() => window.location.href = '/'} style={{ padding: '10px 20px', marginTop: '20px', cursor: 'pointer' }}>
        Go to Main
      </button>
    </div>
  );
}

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

        {/* 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;