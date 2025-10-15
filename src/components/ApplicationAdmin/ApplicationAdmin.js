import React, { useState, useEffect } from 'react';
import Navbar from '../NavigationBar/NavigationBar';
import styles from './ApplicationAdmin.module.css';
import { useNavigate } from "react-router-dom";
import { FiUserCheck, FiClipboard, FiUserPlus } from "react-icons/fi";

function ApplicationAdmin() {
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
        {/* Header */}
        <div className={styles.headerBar}>
          <h1 className={styles.heading}>จัดการแอปพลิเคชัน</h1>
        </div>

        {/* Menu Section */}
        <div className={styles.dashboardSection}>
          <div className={`${styles.card} ${styles.card01}`} onClick={() => navigate("/application/get-person-timestamp")}>
            <FiUserCheck size={36} />
            <span>ประวัติการใช้งานรายบุคคล</span>
          </div>
          <div className={`${styles.card} ${styles.card02}`} onClick={() => navigate("/application/get-timestamp")}>
            <FiClipboard size={36} />
            <span>ประวัติการใช้งาน</span>
          </div>
          <div className={`${styles.card} ${styles.card03}`} onClick={() => navigate("/application/add-user")}>
            <FiUserPlus size={36} />
            <span>เพิ่มบัญชีนักศึกษา/อาจารย์</span>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ApplicationAdmin;

