import React, { useState, useEffect } from 'react';
import Navbar from '../NavigationBar/NavigationBar';
import styles from './StaffManagementAdmin.module.css';
import { useNavigate } from "react-router-dom";
import { FiAward, FiFileText, FiEdit, FiUsers, FiUserPlus, FiClipboard } from "react-icons/fi";

function StaffManagementAdmin() {
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
          <h1 className={styles.heading}>จัดการเจ้าหน้าที่</h1>
          <div className={styles.headerRight}>
          </div>
        </div>

        {/* Menu Section */}
        <div className={styles.dashboardSection}>
          <div className={`${styles.card} ${styles.card01}`} onClick={() => navigate("/staff-management/manage-certificate")}>
            <FiAward size={36} />
            <span>จัดการเกียรติบัตร</span>
          </div>
          <div className={`${styles.card} ${styles.card02}`} onClick={() => navigate("/staff-management/staff-name")}>
            <FiUsers size={36} />
            <span>รายชื่อเจ้าหน้าที่</span>
          </div>
          <div className={`${styles.card} ${styles.card03}`} onClick={() => navigate("/staff-management/add-staff")}>
            <FiUserPlus size={36} />
            <span>เพิ่มบัญชีเจ้าหน้าที่</span>
          </div>
          <div className={`${styles.card} ${styles.card04}`} onClick={() => navigate("/staff-management/get-activity-create")}>
            <FiFileText size={36} />
            <span>ประวัติสร้างกิจกรรม</span>
          </div>
          <div className={`${styles.card} ${styles.card05}`} onClick={() => navigate("/staff-management/get-activity-edit")}>
            <FiEdit size={36} />
            <span>ประวัติแก้ไขกิจกรรม</span>
          </div>
          <div className={`${styles.card} ${styles.card06}`} onClick={() => navigate("/staff-management/get-dataedit-user")}>
            <FiClipboard size={36} />
            <span>ประวัติแก้ไขบัญชี</span>
          </div>
        </div>
      </main>
    </div>
  );
}

export default StaffManagementAdmin;


