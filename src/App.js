import './App.css';
import Login from './components/LoginPage/LoginPage';
import MainAdmin from './components/MainAdmin/MainAdmin';
import DashboardAdmin from './components/DashboardAdmin/DashboardAdmin';
import ActivityAdmin from './components/ActivityAdmin/ActivityAdmin';
import ApplicationAdmin from './components/ApplicationAdmin/ApplicationAdmin';
import NameRegisterAdmin from './components/NameRegisterAdmin/NameRegisterAdmin';
import StaffManagementAdmin from './components/StaffManagementAdmin/StaffManagementAdmin';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
      <Route exact path='/' element={<MainAdmin/>} />
        <Route exact path='/login' element={<Login/>} />
        <Route exact path='/main' element={<MainAdmin/>} />
        <Route exact path='/dashboard' element={<DashboardAdmin/>} />
        <Route exact path='/activity' element={<ActivityAdmin/>} />
        <Route exact path='/application' element={<ApplicationAdmin/>} />
        <Route exact path='/name-register' element={<NameRegisterAdmin/>} />
        <Route exact path='/staff-management' element={<StaffManagementAdmin/>} />
      </Routes>
    </Router>
  );
}

export default App;