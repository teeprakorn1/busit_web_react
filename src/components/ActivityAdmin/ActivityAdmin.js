import React, { useState, useEffect } from 'react';
import Navbar from '../NavigationBar/NavigationBar';
import styles from './ActivityAdmin.module.css';
import { useNavigate } from "react-router-dom";
import { FiPlusCircle, FiUsers, FiFileText } from "react-icons/fi";

function ActivityAdmin() {
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
          <h1 className={styles.heading}>จัดการกิจกรรม</h1>
        </div>

        {/* Menu Section */}
        <div className={styles.dashboardSection}>
          <div className={`${styles.card} ${styles.card01}`} onClick={() => navigate("/activity-management/activity-create")}>
            <FiPlusCircle size={36} />
            <span>สร้างกิจกรรม</span>
          </div>
          <div className={`${styles.card} ${styles.card04}`} onClick={() => navigate("/activity-management/activity-name")}>
            <FiFileText size={36} />
            <span>จัดการกิจกรรม</span>
          </div>
          <div className={`${styles.card} ${styles.card02}`} onClick={() => navigate("/activity-management/activity-join")}>
            <FiUsers size={36} />
            <span>จัดการผู้เข้าร่วมกิจกรรม</span>
          </div>

        </div>
      </main>
    </div>
  );
}

export default ActivityAdmin;

