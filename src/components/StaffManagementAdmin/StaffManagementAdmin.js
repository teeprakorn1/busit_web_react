import React, { useState, useEffect } from 'react';
import Navbar from '../NavigationBar/NavigationBar';
import styles from './StaffManagementAdmin.module.css';
import { useNavigate } from "react-router-dom";
import { FiAward, FiFileText, FiEdit, FiUsers, FiUserPlus, FiUserMinus } from "react-icons/fi";

function StaffManagementAdmin() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [searchQuery, setSearchQuery] = useState("");
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
          <h1 className={styles.heading}>จัดการเจ้าหน้าที่</h1>

          <div className={styles.headerRight}>
            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="ค้นหา..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className={styles.notifyWrapper}>
              <button
                className={styles.notifyButton}
                onClick={() => setNotifyOpen(!notifyOpen)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor"
                  width="24" height="24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 
                      0118 14V11a6 6 0 00-5-5.917V4a1 1 0 
                      10-2 0v1.083A6 6 0 006 11v3c0 
                      .386-.147.735-.395 1.004L4 17h5m6 
                      0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {notifications.length > 0 && (
                  <span className={styles.badge}>{notifications.length}</span>
                )}
              </button>

              {notifyOpen && (
                <div className={styles.notifyDropdown}>
                  {notifications.map((n, i) => (
                    <div key={i} className={styles.notifyItem}>{n}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Menu Section */}
        <div className={styles.dashboardSection}>
          <div className={`${styles.card} ${styles.card01}`} onClick={() => navigate("/create-activity")}>
            <FiAward size={36} />
            <span>จัดการเกียรติบัตร</span>
          </div>
          <div className={`${styles.card} ${styles.card02}`} onClick={() => navigate("/join-activity")}>
            <FiFileText  size={36} />
            <span>ประวัติสร้างกิจกรรม</span>
          </div>
          <div className={`${styles.card} ${styles.card03}`} onClick={() => navigate("/edit-activity")}>
            <FiEdit  size={36} />
            <span>ประวัติแก้ไขกิจกรรม</span>
          </div>
          <div className={`${styles.card} ${styles.card04}`} onClick={() => navigate("/all-activities")}>
            <FiUsers  size={36} />
            <span>ประวัติแก้ไขบัญชี</span>
          </div>
          <div className={`${styles.card} ${styles.card05}`} onClick={() => navigate("/all-activities")}>
            <FiUserPlus  size={36} />
            <span>เพิ่มบัญชีเจ้าหน้าที่</span>
          </div>
          <div className={`${styles.card} ${styles.card06}`} onClick={() => navigate("/all-activities")}>
            <FiUserMinus  size={36} />
            <span>ลบบัญชีเจ้าหน้าที่</span>
          </div>
        </div>
      </main>
    </div>
  );
}

export default StaffManagementAdmin;


