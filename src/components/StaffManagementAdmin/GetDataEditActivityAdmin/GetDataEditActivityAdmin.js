import React, { useState, useEffect } from 'react';
import Navbar from '../../NavigationBar/NavigationBar';
import styles from './GetDataEditActivityAdmin.module.css';

function GetDataEditActivityAdmin() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);

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
          <h1 className={styles.heading}>ประวัติแก้ไขกิจกรรม</h1>
          <div className={styles.headerRight}>
          </div>
        </div>
      </main>
    </div>
  );
}

export default GetDataEditActivityAdmin;