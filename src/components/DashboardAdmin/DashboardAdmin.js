import React from 'react';
import Navbar from '../NavigationBar/NavigationBar';
import styles from './DashboardAdmin.module.css';

function DashboardAdmin() {

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.mainContent}>
        <h1 className={styles.heading}>DashboardAdmin</h1>
        
        </div>
    </div>
  );
}

export default DashboardAdmin;