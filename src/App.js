import './App.css';
import Login from './components/LoginPage/LoginPage';
import Dashboard from './components/DashboardAdmin/DashboardAdmin';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
      <Route exact path='/' element={<Dashboard/>} />
        <Route exact path='/login' element={<Login/>} />
        <Route exact path='/dashboard' element={<Dashboard/>} />
      </Routes>
    </Router>
  );
}

export default App;