import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../NavigationBar/NavigationBar';
import InfoForm from './InfoForms/InfoForms';
import UserTypeSelector from './UserTypeSelector/UserTypeSelector';
import ExcelImportExport from './ExcelImportExport/ExcelImportExport';
import ImportDataModal from './ImportDataModal/ImportDataModal';
import CustomModal from '../../../services/CustomModal/CustomModal';
import { validateUserForm } from './../../../utils/formValidator';
import { useUserPermissions } from './hooks/useUserPermissions';
import styles from './AddUsersAdmin.module.css';
import { FiBell, FiArrowLeft } from 'react-icons/fi';

const getApiUrl = (endpoint) => {
  return `${process.env.REACT_APP_SERVER_PROTOCOL}${process.env.REACT_APP_SERVER_BASE_URL}${process.env.REACT_APP_SERVER_PORT}${endpoint}`;
};

function AddUsersAdmin() {
  const navigate = useNavigate();
  const location = useLocation();
  const permissions = useUserPermissions();
  
  const referrer = location.state?.from || null;
  const showBackButton = referrer === '/name-register/student-name';

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
    facultyId: '',
    departmentId: '',
    academicYear: '',
    teacherId: '',
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
  const [isLoading, setIsLoading] = useState(false);

  const notifications = ["มีผู้ใช้งานเข้าร่วมกิจกรรม"];

  useEffect(() => {
    if (permissions.userType !== null) {
      if (!permissions.canAddStudents || !permissions.isStaff) {
        navigate('/dashboard');
        return;
      }
    }
  }, [permissions, navigate]);

  const insertTimestamp = async (timestampName, timestampTypeId) => {
    try {
      await axios.post(getApiUrl(process.env.REACT_APP_API_TIMESTAMP_WEBSITE_INSERT), {
        Timestamp_Name: timestampName,
        TimestampType_ID: timestampTypeId
      }, { withCredentials: true });
    } catch (error) {
      console.error('Error inserting timestamp:', error);
    }
  };

  const generateTimestampName = (action, userType, method = 'form') => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('th-TH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const timeStr = now.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const username = formData.email ? formData.email.split('@')[0] : 'anonymous';

    return `${action} ${userType} ${method === 'csv' ? 'via CSV import' : 'via form'} by ${username} at ${dateStr} ${timeStr} in Website.`;
  };

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

  const handleConfirmImport = async (validData) => {
    if (!permissions.canAddStudents || !permissions.isStaff) {
      setAlertMessage("คุณไม่มีสิทธิ์ในการดำเนินการนี้");
      setIsAlertModalOpen(true);
      return;
    }

    setIsLoading(true);

    try {
      let successCount = 0;
      let errorCount = 0;
      const errors = [];

      for (let i = 0; i < validData.length; i++) {
        const record = validData[i];

        try {
          const apiData = transformCSVToAPI(record, selectedUserType);
          const endpoint = selectedUserType === 'student'
            ? process.env.REACT_APP_API_ADMIN_STUDENT_ADD_BULK
            : process.env.REACT_APP_API_ADMIN_TEACHER_ADD_BULK

          const response = await axios.post(getApiUrl(endpoint), apiData, { withCredentials: true });

          if (response.data.status) {
            successCount++;
          } else {
            errorCount++;
            errors.push(`แถวที่ ${i + 1}: ${response.data.message}`);
          }
        } catch (error) {
          errorCount++;
          const errorMessage = error.response?.data?.message || error.message;
          errors.push(`แถวที่ ${i + 1}: ${errorMessage}`);
        }
      }
      const csvTimestampTypeId = selectedUserType === 'student' ? 16 : 17;

      if (successCount > 0 || errorCount > 0) {
        const completeCsvTimestampName = generateTimestampName(
          `Complete CSV import - Success: ${successCount}, Failed: ${errorCount}`,
          selectedUserType,
          'csv'
        );
        await insertTimestamp(completeCsvTimestampName, csvTimestampTypeId);
      }

      let message = `นำเข้าข้อมูลเสร็จสิ้น\nสำเร็จ: ${successCount} รายการ`;
      if (errorCount > 0) {
        message += `\nล้มเหลว: ${errorCount} รายการ`;
        if (errors.length > 0) {
          message += `\n\nรายละเอียดข้อผิดพลาด:\n${errors.slice(0, 5).join('\n')}`;
          if (errors.length > 5) {
            message += `\n... และอีก ${errors.length - 5} ข้อผิดพลาด`;
          }
        }
      }

      setAlertMessage(message);

    } catch (error) {
      console.error('Error importing data:', error);
      const csvTimestampTypeId = selectedUserType === 'student' ? 16 : 17;
      const errorCsvTimestampName = generateTimestampName(
        'Failed CSV import with critical error',
        selectedUserType,
        'csv'
      );
      await insertTimestamp(errorCsvTimestampName, csvTimestampTypeId);

      setAlertMessage('เกิดข้อผิดพลาดในการนำเข้าข้อมูล: ' + error.message);
    } finally {
      setIsLoading(false);
      setIsAlertModalOpen(true);
    }
  };

  const transformCSVToAPI = (csvRecord, userType) => {
    if (userType === 'student') {
      return {
        Users_Email: csvRecord.Users_Email,
        Users_Password: csvRecord.Users_Password,
        Student_Code: csvRecord.Student_Code,
        Student_FirstName: csvRecord.Student_FirstName,
        Student_LastName: csvRecord.Student_LastName,
        Student_Phone: csvRecord.Student_Phone || null,
        Student_Birthdate: csvRecord.Student_Birthdate || null,
        Student_Religion: csvRecord.Student_Religion || null,
        Student_MedicalProblem: csvRecord.Student_MedicalProblem || null,
        Student_AcademicYear: csvRecord.Student_AcademicYear,
        Faculty_Name: csvRecord.Faculty_Name,
        Department_Name: csvRecord.Department_Name,
        Teacher_Code: csvRecord.Teacher_Code,
      };
    } else {
      return {
        Users_Email: csvRecord.Users_Email,
        Users_Password: csvRecord.Users_Password,
        Teacher_Code: csvRecord.Teacher_Code,
        Teacher_FirstName: csvRecord.Teacher_FirstName,
        Teacher_LastName: csvRecord.Teacher_LastName,
        Teacher_Phone: csvRecord.Teacher_Phone || null,
        Teacher_Birthdate: csvRecord.Teacher_Birthdate || null,
        Teacher_Religion: csvRecord.Teacher_Religion || null,
        Teacher_MedicalProblem: csvRecord.Teacher_MedicalProblem || null,
        Teacher_IsDean: csvRecord.Teacher_IsDean === 'true' || csvRecord.Teacher_IsDean === true,
        Faculty_Name: csvRecord.Faculty_Name,
        Department_Name: csvRecord.Department_Name,
      };
    }
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
      facultyId: '',
      departmentId: '',
      academicYear: '',
      teacherId: '',
      isDean: false
    });
    setErrors({});
  };

  const validateForm = () => {
    const validatorData = {
      ...formData,
      faculty: formData.facultyId,
      department: formData.departmentId,
      teacherAdvisor: formData.teacherId
    };

    const validationErrors = validateUserForm(validatorData, selectedUserType);
    const mappedErrors = {};
    Object.keys(validationErrors).forEach(key => {
      if (key === 'faculty') {
        mappedErrors.facultyId = validationErrors[key];
      } else if (key === 'department') {
        mappedErrors.departmentId = validationErrors[key];
      } else if (key === 'teacherAdvisor') {
        mappedErrors.teacherId = validationErrors[key];
      } else {
        mappedErrors[key] = validationErrors[key];
      }
    });

    setErrors(mappedErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const prepareApiData = () => {
    const baseData = {
      Users_Email: formData.email,
      Users_Password: formData.password,
      [selectedUserType === 'student' ? 'Student_Code' : 'Teacher_Code']: formData.code,
      [selectedUserType === 'student' ? 'Student_FirstName' : 'Teacher_FirstName']: formData.firstName,
      [selectedUserType === 'student' ? 'Student_LastName' : 'Teacher_LastName']: formData.lastName,
      [selectedUserType === 'student' ? 'Student_Phone' : 'Teacher_Phone']: formData.phone || null,
      [selectedUserType === 'student' ? 'Student_Birthdate' : 'Teacher_Birthdate']: formData.birthDate || null,
      [selectedUserType === 'student' ? 'Student_Religion' : 'Teacher_Religion']: formData.religion || null,
      [selectedUserType === 'student' ? 'Student_MedicalProblem' : 'Teacher_MedicalProblem']: formData.medicalProblem || null,
      Department_ID: parseInt(formData.departmentId)
    };

    if (selectedUserType === 'student') {
      baseData.Student_AcademicYear = formData.academicYear;
      baseData.Teacher_ID = parseInt(formData.teacherId);
    } else {
      baseData.Teacher_IsDean = formData.isDean;
    }

    return baseData;
  };

  const handleSubmit = async () => {
    if (!permissions.canAddStudents || !permissions.isStaff) {
      setAlertMessage("คุณไม่มีสิทธิ์ในการดำเนินการนี้");
      setIsAlertModalOpen(true);
      return;
    }

    if (!validateForm()) {
      setAlertMessage("กรุณาตรวจสอบข้อมูลให้ครบถ้วนและถูกต้อง");
      setIsAlertModalOpen(true);
      return;
    }

    setIsLoading(true);

    try {
      const apiData = prepareApiData();
      const endpoint = selectedUserType === 'student'
        ? process.env.REACT_APP_API_ADMIN_STUDENT_ADD
        : process.env.REACT_APP_API_ADMIN_TEACHER_ADD;
      const response = await axios.post(getApiUrl(endpoint), apiData, { withCredentials: true });

      if (response.data.status) {
        const successTimestampName = generateTimestampName('Successfully added', selectedUserType, 'form');
        const timestampTypeId = selectedUserType === 'student' ? 14 : 15;
        await insertTimestamp(successTimestampName, timestampTypeId);

        setAlertMessage(`เพิ่ม${selectedUserType === 'student' ? 'นักศึกษา' : 'อาจารย์'}สำเร็จ!`);
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
          facultyId: '',
          departmentId: '',
          academicYear: '',
          teacherId: '',
          isDean: false
        });
        setErrors({});
      } else {
        const failTimestampName = generateTimestampName('Failed to add', selectedUserType, 'form');
        const timestampTypeId = selectedUserType === 'student' ? 14 : 15;
        await insertTimestamp(failTimestampName, timestampTypeId);

        setAlertMessage(response.data.message || 'เกิดข้อผิดพลาดในการเพิ่มข้อมูล');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      const errorTimestampName = generateTimestampName('Error adding', selectedUserType, 'form');
      const timestampTypeId = selectedUserType === 'student' ? 14 : 15;
      await insertTimestamp(errorTimestampName, timestampTypeId);

      let errorMessage = 'เกิดข้อผิดพลาดในการเพิ่มข้อมูล';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 403) {
        errorMessage = 'ไม่มีสิทธิ์ในการดำเนินการนี้';
      } else if (error.response?.status === 409) {
        errorMessage = 'อีเมลหรือรหัสมีผู้ใช้แล้ว';
      } else if (error.response?.status === 401) {
        errorMessage = 'กรุณาเข้าสู่ระบบใหม่';
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้';
      }

      setAlertMessage(errorMessage);
    } finally {
      setIsLoading(false);
      setIsAlertModalOpen(true);
    }
  };

  const handleConfirm = () => {
    handleSubmit();
  };

  const handleGoBack = () => {
    if (referrer) {
      navigate(referrer);
    } else {
      navigate('/admin/all-students');
    }
  };

  if (permissions.userType === null) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingWrapper}>
          <div className={styles.loading}>กำลังตรวจสอบสิทธิ์...</div>
        </div>
      </div>
    );
  }

  if (!permissions.canAddStudents || !permissions.isStaff) {
    return null;
  }

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
            {showBackButton && (
              <div className={styles.backButtonWrapper}>
                <button
                  className={styles.backButton}
                  onClick={handleGoBack}
                  title="กลับไปหน้ารายชื่อนักศึกษา"
                >
                  <FiArrowLeft size={20} />
                </button>
              </div>
            )}
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
            <button
              className={`${styles.formButton} ${isLoading ? styles.loading : ''}`}
              onClick={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? 'กำลังบันทึก...' : 'ยืนยัน'}
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