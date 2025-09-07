import React, { useState, useEffect } from 'react';
import Navbar from '../../NavigationBar/NavigationBar';
import InfoForm from './InfoForms/InfoForms';
import UserTypeSelector from './UserTypeSelector/UserTypeSelector';
import ExcelImportExport from './ExcelImportExport/ExcelImportExport';
import ImportDataModal from './ImportDataModal/ImportDataModal';
import CustomModal from '../../../services/CustomModal/CustomModal';
import styles from './AddUsersAdmin.module.css';
import { FiBell } from 'react-icons/fi';

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isStrongPassword = (password) => /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password);
const isValidPhone = (phone) => /^0[0-9]{9}$/.test(phone);
const isValidDate = (date) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;

  const parsedDate = new Date(date);
  const today = new Date();

  return parsedDate.toString() !== "Invalid Date" && parsedDate <= today;
};

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
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "กรุณากรอกอีเมล";
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "รูปแบบอีเมลไม่ถูกต้อง";
    }

    if (!formData.password) {
      newErrors.password = "กรุณากรอกรหัสผ่าน";
    } else if (!isStrongPassword(formData.password)) {
      newErrors.password = "รหัสผ่านต้องมีอย่างน้อย 8 ตัว และมีทั้งตัวอักษรและตัวเลข";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "กรุณายืนยันรหัสผ่าน";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "รหัสผ่านไม่ตรงกัน";
    }
    if (!formData.code) {
      newErrors.code =
        selectedUserType === "student"
          ? "กรุณากรอกรหัสนักศึกษา"
          : "กรุณากรอกรหัสอาจารย์";
    }

    if (!formData.firstName) newErrors.firstName = "กรุณากรอกชื่อจริง";
    if (!formData.lastName) newErrors.lastName = "กรุณากรอกนามสกุล";

    if (formData.phone && !isValidPhone(formData.phone)) {
      newErrors.phone = "เบอร์โทรศัพท์ไม่ถูกต้อง (ต้องมี 10 หลัก)";
    }

    if (formData.birthDate && !isValidDate(formData.birthDate)) {
      newErrors.birthDate = "วันเกิดไม่ถูกต้อง (รูปแบบ YYYY-MM-DD)";
    }

    if (formData.birthDate && !isValidDate(formData.birthDate)) {
      newErrors.birthDate = "วันเกิดไม่ถูกต้อง (YYYY-MM-DD) หรืออยู่ในอนาคตไม่ได้";
    }

    if (!formData.faculty) newErrors.faculty = "กรุณาเลือกคณะ";
    if (!formData.department) {
      newErrors.department =
        selectedUserType === "student"
          ? "กรุณาเลือกสาขาวิชา"
          : "กรุณาเลือกภาควิชา";
    }

    if (selectedUserType === "student") {
      if (!formData.academicYear) newErrors.academicYear = "กรุณากรอกปีการศึกษา";
      if (!formData.teacherAdvisor) newErrors.teacherAdvisor = "กรุณาเลือกอาจารย์ที่ปรึกษา";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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