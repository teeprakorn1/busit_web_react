import './App.css';
import Login from './components/LoginPage/LoginPage';
import AuthExample from './components/Crypto-test/AuthExample';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
      <Route exact path='/' element={<Login/>} />
        <Route exact path='/login' element={<Login/>} />
        <Route exact path='/AuthExample' element={<AuthExample/>} />
      </Routes>
    </Router>
  );
}

export default App;