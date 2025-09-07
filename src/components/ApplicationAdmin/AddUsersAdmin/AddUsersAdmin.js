import React, { useState, useEffect } from 'react';
import Navbar from '../../NavigationBar/NavigationBar';
import InfoForm from './InfoForms/InfoForms';
import UserTypeSelector from './UserTypeSelector/UserTypeSelector';
import ExcelImportExport from './ExcelImportExport/ExcelImportExport';
import ImportDataModal from './ImportDataModal/ImportDataModal';
import CustomModal from '../../../services/CustomModal/CustomModal';
import { validateUserForm } from './../../../utils/formValidator';
import styles from './AddUsersAdmin.module.css';
import { FiBell } from 'react-icons/fi';

function AddUsersAdmin() {
  const [selectedUserType, setSelectedUserType] = useState('student');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    code: '',
    firstName: '',
    lastName: '',
    phone: '',
    birthDate: '',
    religion: '',
    medicalProblem: '',
    faculty: '',
    department: '',
    academicYear: '',
    teacherAdvisor: '',
    isDean: false
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [importedData, setImportedData] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [errors, setErrors] = useState({});

  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const notifications = ["มีผู้ใช้งานเข้าร่วมกิจกรรม"];

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

  const handleDataImport = (file) => {
    setImportedData(file);
  };

  const handleConfirmImport = (validData) => {
    console.log("ข้อมูลที่นำเข้า:", validData);
    console.log("ประเภทผู้ใช้:", selectedUserType);
    setAlertMessage(`นำเข้าข้อมูลสำเร็จ จำนวน ${validData.length} รายการ`);
    setIsAlertModalOpen(true);
  };

  const handleUserTypeChange = (type) => {
    setSelectedUserType(type);
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      code: '',
      firstName: '',
      lastName: '',
      phone: '',
      birthDate: '',
      religion: '',
      medicalProblem: '',
      faculty: '',
      department: '',
      academicYear: '',
      teacherAdvisor: '',
      isDean: false
    });
    setErrors({});
  };

  const validateForm = () => {
    const validationErrors = validateUserForm(formData, selectedUserType);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleConfirm = () => {
    if (validateForm()) {
      console.log("ประเภทผู้ใช้:", selectedUserType);
      console.log("ข้อมูลฟอร์ม:", formData);
      setAlertMessage("บันทึกข้อมูลเรียบร้อย!");
      setIsAlertModalOpen(true);
    } else {
      setAlertMessage("กรุณาตรวจสอบข้อมูลให้ครบถ้วน");
      setIsAlertModalOpen(true);
    }
  };

  return (
    <>
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
            <h1 className={styles.heading}>เพิ่มข้อมูลผู้ใช้</h1>
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

          {/* User Type Selector */}
          <UserTypeSelector
            selectedType={selectedUserType}
            onTypeChange={handleUserTypeChange}
          />

          {/* Excel Import / Export */}
          <ExcelImportExport
            setModalOpen={setModalOpen}
            onDataImport={handleDataImport}
            userType={selectedUserType}
          />

          {/* Forms */}
          <InfoForm
            formData={formData}
            setFormData={setFormData}
            userType={selectedUserType}
            errors={errors}
          />

          <div className={styles.buttonWrapper}>
            <button className={styles.formButton} onClick={handleConfirm}>
              ยืนยัน
            </button>
          </div>

          {/* Import Data Modal */}
          <ImportDataModal
            open={modalOpen}
            setOpen={setModalOpen}
            importedData={importedData}
            userType={selectedUserType}
            onConfirmImport={handleConfirmImport}
          />
        </main>
      </div>

      <CustomModal
        isOpen={isAlertModalOpen}
        message={alertMessage}
        onClose={() => setIsAlertModalOpen(false)}
      />
    </>
  );
}

export default AddUsersAdmin;