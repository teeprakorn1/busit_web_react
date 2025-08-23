import React, { useState, useEffect } from 'react';
import Navbar from '../NavigationBar/NavigationBar';
import styles from './ApplicationAdmin.module.css';
import { useNavigate } from "react-router-dom";
import { FiBell, FiAirplay, FiUserCheck, FiClipboard, FiUserPlus, FiUserX } from "react-icons/fi";

function ApplicationAdmin() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const navigate = useNavigate();

  const notifications = ["มีผู้ใช้งานเข้ารวมกิจกรรม"];

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(`.${styles.notifyWrapper}`)) {
        setNotifyOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
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
          <div className={styles.headerRight}>
            <div className={styles.notifyWrapper}>
              <button
                className={styles.notifyButton}
                onClick={() => setNotifyOpen(!notifyOpen)}
              >
                <FiBell size={24} color="currentColor" />
                {notifications.length > 0 && (
                  <span className={styles.badge}>{notifications.length}</span>
                )}
              </button>

              {notifyOpen && (
                <div className={styles.notifyDropdown}>
                  {notifications.map((n, i) => (
                    <div key={i} className={styles.notifyItem}>
                      {n}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Menu Section */}
        <div className={styles.dashboardSection}>
          <div className={`${styles.card} ${styles.card01}`} onClick={() => navigate("/create-activity")}>
            <FiAirplay size={36} />
            <span>จัดการประชาสัมพันธ์</span>
          </div>
          <div className={`${styles.card} ${styles.card02}`} onClick={() => navigate("/application/get-person-timestamp")}>
            <FiUserCheck  size={36} />
            <span>ประวัติการใช้งานรายบุคคล</span>
          </div>
          <div className={`${styles.card} ${styles.card03}`} onClick={() => navigate("/application/get-timestamp")}>
            <FiClipboard  size={36} />
            <span>ประวัติการใช้งานทั้งหมด</span>
          </div>
          <div className={`${styles.card} ${styles.card04}`} onClick={() => navigate("/all-activities")}>
            <FiUserPlus  size={36} />
            <span>เพิ่มบัญชีผู้ใช้งาน</span>
          </div>
          <div className={`${styles.card} ${styles.card05}`} onClick={() => navigate("/all-activities")}>
            <FiUserX  size={36} />
            <span>ลบบัญชีผู้ใช้งาน</span>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ApplicationAdmin;

