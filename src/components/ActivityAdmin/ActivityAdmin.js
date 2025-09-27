import React, { useState, useEffect } from 'react';
import Navbar from '../NavigationBar/NavigationBar';
import styles from './ActivityAdmin.module.css';
import { useNavigate } from "react-router-dom";
import { FiPlusCircle, FiUsers, FiEdit, FiList } from "react-icons/fi";

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
          <div className={`${styles.card} ${styles.card01}`} onClick={() => navigate("/create-activity")}>
            <FiPlusCircle size={36} />
            <span>สร้างกิจกรรม</span>
          </div>
          <div className={`${styles.card} ${styles.card02}`} onClick={() => navigate("/join-activity")}>
            <FiUsers size={36} />
            <span>การเข้าร่วมกิจกรรม</span>
          </div>
          <div className={`${styles.card} ${styles.card03}`} onClick={() => navigate("/edit-activity")}>
            <FiEdit size={36} />
            <span>แก้ไขข้อมูลกิจกรรม</span>
          </div>
          <div className={`${styles.card} ${styles.card04}`} onClick={() => navigate("/all-activities")}>
            <FiList size={36} />
            <span>กิจกรรมทั้งหมด</span>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ActivityAdmin;

