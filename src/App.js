import './App.css';
import Login from './components/LoginPage/LoginPage';
import MainAdmin from './components/MainAdmin/MainAdmin';
import DashboardAdmin from './components/DashboardAdmin/DashboardAdmin';
import ActivityAdmin from './components/ActivityAdmin/ActivityAdmin';
import EditActivityAdmin from './components/EditActivityAdmin/EditActivityAdmin';
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
        <Route exact path='/MainAdmin' element={<MainAdmin/>} />
        <Route exact path='/dashboardAdmin' element={<DashboardAdmin/>} />
        <Route exact path='/ActivityAdmin' element={<ActivityAdmin/>} />
        <Route exact path='/EditActivityAdmin' element={<EditActivityAdmin/>} />
        <Route exact path='/NameRegisterAdmin' element={<NameRegisterAdmin/>} />
        <Route exact path='/StaffManagementAdmin' element={<StaffManagementAdmin/>} />
      </Routes>
    </Router>
  );
}

export default App;