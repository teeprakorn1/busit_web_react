import React, { useState, useEffect } from 'react';
import Navbar from '../NavigationBar/NavigationBar';
import styles from './NameRegisterAdmin.module.css';
import { useNavigate } from "react-router-dom";
import { FiLayers, FiUsers, FiUserCheck, FiAlertTriangle, FiAirplay } from "react-icons/fi";
import { decryptValue } from "../../utils/crypto";

function NameRegisterAdmin() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [userType, setUserType] = useState("");
  const [isLoadingUserType, setIsLoadingUserType] = useState(true);
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

  useEffect(() => {
    const loadUserType = () => {
      try {
        const sessionUsersTypeRaw = sessionStorage.getItem("UsersType");
        if (sessionUsersTypeRaw) {
          try {
            const decryptedUserType = decryptValue(sessionUsersTypeRaw);
            setUserType(decryptedUserType.toLowerCase().trim());
          } catch (err) {
            console.warn("Failed to decrypt UsersType:", err);
            setUserType("");
          }
        } else {
          setUserType("");
        }
      } catch (error) {
        console.error("Error loading user type:", error);
        setUserType("");
      } finally {
        setIsLoadingUserType(false);
      }
    };

    loadUserType();
  }, []);

  const isTeacher = userType === "teacher";
  const menuItems = [
    {
      id: 'department',
      className: styles.card01,
      icon: FiLayers,
      label: 'รายชื่อตามสาขา',
      path: '/name-register/department-name',
      showForAll: true
    },
    {
      id: 'student',
      className: styles.card02,
      icon: FiUsers,
      label: 'รายชื่อนักศึกษา',
      path: '/name-register/student-name',
      showForAll: true
    },
    {
      id: 'teacher',
      className: styles.card03,
      icon: FiUserCheck,
      label: 'รายชื่ออาจารย์',
      path: '/name-register/teacher-name',
      showForAll: true
    },
    {
      id: 'incomplete',
      className: styles.card04,
      icon: FiAlertTriangle,
      label: 'นักศึกษาที่กิจกรรมไม่ครบ',
      path: '/name-register/student-incomplete-activities',
      showForAll: true
    },
    {
      id: 'own-activities',
      className: styles.card05,
      icon: FiAirplay,
      label: 'กิจกรรมของตนเอง (อาจารย์)',
      path: '/name-register/own-teacher-activities',
      showForAll: false,
      showForTeacher: true
    }
  ];

  const filteredMenuItems = menuItems.filter(item => {
    if (item.showForAll) return true;
    if (item.showForTeacher && isTeacher) return true;
    return false;
  });

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

        <div className={styles.dashboardSection}>
          {!isLoadingUserType && filteredMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={`${styles.card} ${item.className}`}
                onClick={() => navigate(item.path)}
              >
                <Icon size={36} />
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default NameRegisterAdmin;