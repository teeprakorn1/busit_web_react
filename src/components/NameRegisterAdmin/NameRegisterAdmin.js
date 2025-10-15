import React, { useState, useEffect } from 'react';
import Navbar from '../NavigationBar/NavigationBar';
import styles from './NameRegisterAdmin.module.css';
import { useNavigate } from "react-router-dom";
import { FiLayers, FiUsers, FiUserCheck, FiAlertTriangle, FiAirplay } from "react-icons/fi";

function NameRegisterAdmin() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={styles.container}>
      <Navbar
        isMobile={isMobile}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <main
        className={`${styles.mainContent} 
          ${isMobile ? styles.mobileContent : ""} 
          ${sidebarOpen && !isMobile ? styles.contentShift : ""}`}
      >
        <div className={styles.headerBar}>
          <h1 className={styles.heading}>ทะเบียนรายชื่อ</h1>
        </div>

        {/* Menu Section */}
        <div className={styles.dashboardSection}>
          <div className={`${styles.card} ${styles.card01}`} onClick={() => navigate("/name-register/department-name")}>
            <FiLayers size={36} />
            <span>รายชื่อตามสาขา</span>
          </div>
          <div className={`${styles.card} ${styles.card02}`} onClick={() => navigate("/name-register/student-name")}>
            <FiUsers size={36} />
            <span>รายชื่อนักศึกษา</span>
          </div>
          <div className={`${styles.card} ${styles.card03}`} onClick={() => navigate("/name-register/teacher-name")}>
            <FiUserCheck size={36} />
            <span>รายชื่ออาจารย์</span>
          </div>
          <div className={`${styles.card} ${styles.card04}`} onClick={() => navigate("/name-register/student-incomplete-activities")}>
            <FiAlertTriangle size={36} />
            <span>นักศึกษาที่กิจกรรมไม่ครบ</span>
          </div>
          <div className={`${styles.card} ${styles.card05}`} onClick={() => navigate("/name-register/own-teacher-activities")}>
            <FiAirplay size={36} />
            <span>กิจกรรมของตนเอง (อาจารย์)</span>
          </div>
        </div>
      </main>
    </div>
  );
}

export default NameRegisterAdmin;