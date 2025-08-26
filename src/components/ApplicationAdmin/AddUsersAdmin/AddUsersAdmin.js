import React, { useState, useEffect } from 'react';
import Navbar from '../../NavigationBar/NavigationBar';
import AccountInfoForm from './forms/AccountInfoForm';
import PersonalInfoForm from './forms/PersonalInfoForm';
import AcademicInfoForm from './forms/AcademicInfoForm';
import UserTypeSelector from './UserTypeSelector/UserTypeSelector';
import ExcelImportExport from './ExcelImportExport/ExcelImportExport';
import ImportDataModal from './ImportDataModal/ImportDataModal';
import styles from './AddUsersAdmin.module.css';
import { FiBell } from 'react-icons/fi';

function AddUsersAdmin() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', username: '', password: '' });
  const [modalOpen, setModalOpen] = useState(false);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [notifyOpen, setNotifyOpen] = useState(false);

  const notifications = [
    "มีผู้ใช้งานเข้ารวมกิจกรรม",
  ];

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
        <div className={styles.headerBar}>
          <h1 className={styles.heading}>หน้าหลัก</h1>
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
        <UserTypeSelector />
        <ExcelImportExport setModalOpen={setModalOpen} />

        <AccountInfoForm
          formData={formData}
          setFormData={setFormData}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
        />

        <PersonalInfoForm />
        <AcademicInfoForm />

        <ImportDataModal open={modalOpen} setOpen={setModalOpen} />
      </main>
    </div>
  );
}

export default AddUsersAdmin;