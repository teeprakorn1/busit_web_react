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
import AddUsersAdmin from './components/ApplicationAdmin/AddUsersAdmin/AddUsersAdmin';

import AdminAllStudents from './components/NameRegisterAdmin/AdminAllStudents/AdminAllStudents';
import AdminAllTeachers from './components/NameRegisterAdmin/AdminAllTeachers/AdminAllTeachers';
import AdminAllDepartments from './components/NameRegisterAdmin/AdminAllDepartments/AdminAllDepartments';
import AdminUsersDetail from './components/NameRegisterAdmin/AdminUsersDetail/AdminUsersDetail';

import AddStaffAdmin from './components/StaffManagementAdmin/AddStaffAdmin/AddStaffAdmin';
import AdminAllStaff from './components/StaffManagementAdmin/AdminAllStaff/AdminAllStaff';
import GetDataEditUserAdmin from './components/StaffManagementAdmin/GetDataEditUserAdmin/GetDataEditUserAdmin';

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
        <Route path='/application/add-user' element={<ProtectedRoute><AddUsersAdmin /></ProtectedRoute>} />

        {/* Name Register Redirects */}
        <Route path='/name-register/student-name' element={<ProtectedRoute><AdminAllStudents /></ProtectedRoute>} />
        <Route path='/name-register/teacher-name' element={<ProtectedRoute><AdminAllTeachers /></ProtectedRoute>} />
        <Route path='/name-register/department-name' element={<ProtectedRoute><AdminAllDepartments /></ProtectedRoute>} />
        <Route path='/name-register/users-detail/:id' element={<ProtectedRoute><AdminUsersDetail /></ProtectedRoute>} />
        <Route path='/name-register/student-detail/:id' element={<ProtectedRoute><AdminUsersDetail /></ProtectedRoute>} />
        <Route path='/name-register/teacher-detail/:id' element={<ProtectedRoute><AdminUsersDetail /></ProtectedRoute>} />

        {/* Staff Management Redirects */}
        <Route path='/staff-management/add-staff' element={<ProtectedRoute><AddStaffAdmin /></ProtectedRoute>} />
        <Route path='/staff-management/staff-name' element={<ProtectedRoute><AdminAllStaff /></ProtectedRoute>} />
        <Route path="/staff-management/staff-detail/:id" element={<AdminUsersDetail />} />
        <Route path="/staff-management/get-dataedit-user" element={<GetDataEditUserAdmin />} />

        {/* 404 Page */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
