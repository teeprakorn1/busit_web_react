import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../NavigationBar/NavigationBar';
import StaffForms from './StaffForms/StaffForms';
import StaffImportExport from './StaffImportExport/StaffImportExport';
import ImportDataModal from './ImportDataModal/ImportDataModal';
import CustomModal from '../../../services/CustomModal/CustomModal';
import { validateStaffForm } from './../../../utils/formValidator';
import { useUserPermissions } from './hooks/useUserPermissions';
import styles from './AddStaffAdmin.module.css';
import { FiArrowLeft } from 'react-icons/fi';

const getApiUrl = (endpoint) => {
  return `${process.env.REACT_APP_SERVER_PROTOCOL}${process.env.REACT_APP_SERVER_BASE_URL}${process.env.REACT_APP_SERVER_PORT}${endpoint}`;
};

function AddStaffAdmin() {
  const navigate = useNavigate();
  const location = useLocation();
  const permissions = useUserPermissions();
  const referrer = location.state?.from || null;

  const getBackButtonInfo = () => {
    if (!referrer) return { show: false };

    switch (referrer) {
      case '/staff-management/staff-name':
        return {
          show: true,
          title: "กลับไปหน้ารายชื่อเจ้าหน้าที่",
          destination: referrer
        };
      default:
        return {
          show: true,
          title: "กลับไปหน้าเดิม",
          destination: referrer
        };
    }
  };

  const backButtonInfo = getBackButtonInfo();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    code: '',
    firstName: '',
    lastName: '',
    phone: ''
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [importedData, setImportedData] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [errors, setErrors] = useState({});

  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [isImportLoading, setIsImportLoading] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });

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

  const generateTimestampName = (action, method = 'form') => {
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

    return `${action} staff ${method === 'csv' ? 'via CSV import' : 'via form'} by ${username} at ${dateStr} ${timeStr} in Website.`;
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

  const handleDataImport = (file) => {
    setImportedData(file);
  };

  const handleConfirmImport = async (validData) => {
    if (!permissions.canAddStudents || !permissions.isStaff) {
      setAlertMessage("คุณไม่มีสิทธิ์ในการดำเนินการนี้");
      setIsAlertModalOpen(true);
      return;
    }

    setIsImportLoading(true);
    setImportProgress({ current: 0, total: validData.length });
    setModalOpen(false);

    try {
      let successCount = 0;
      let errorCount = 0;
      const errors = [];

      for (let i = 0; i < validData.length; i++) {
        const record = validData[i];
        setImportProgress({ current: i + 1, total: validData.length });

        try {
          const apiData = transformCSVToAPI(record);
          const endpoint = '/api/admin/users/staff/import';

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

        if (i % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }

      const csvTimestampTypeId = 19;
      if (successCount > 0 || errorCount > 0) {
        const completeCsvTimestampName = generateTimestampName(
          `Complete CSV import - Success: ${successCount}, Failed: ${errorCount}`,
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
      const csvTimestampTypeId = 19;
      const errorCsvTimestampName = generateTimestampName(
        'Failed CSV import with critical error',
        'csv'
      );
      await insertTimestamp(errorCsvTimestampName, csvTimestampTypeId);

      setAlertMessage('เกิดข้อผิดพลาดในการนำเข้าข้อมูล: ' + error.message);
    } finally {
      setIsImportLoading(false);
      setImportProgress({ current: 0, total: 0 });
      setIsAlertModalOpen(true);
    }
  };

  const transformCSVToAPI = (csvRecord) => {
    return {
      Users_Email: csvRecord.Users_Email,
      Users_Password: csvRecord.Users_Password,
      Staff_Code: csvRecord.Staff_Code,
      Staff_FirstName: csvRecord.Staff_FirstName,
      Staff_LastName: csvRecord.Staff_LastName,
      Staff_Phone: csvRecord.Staff_Phone || null,
    };
  };

  const validateForm = () => {
    const validationErrors = validateStaffForm(formData);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const prepareApiData = () => {
    return {
      Users_Email: formData.email,
      Users_Password: formData.password,
      Staff_Code: formData.code,
      Staff_FirstName: formData.firstName,
      Staff_LastName: formData.lastName,
      Staff_Phone: formData.phone || null
    };
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
      const endpoint = '/api/admin/users/staff/add';
      const response = await axios.post(getApiUrl(endpoint), apiData, { withCredentials: true });

      if (response.data.status) {
        const successTimestampName = generateTimestampName('Successfully added', 'form');
        const timestampTypeId = 18;
        await insertTimestamp(successTimestampName, timestampTypeId);

        setAlertMessage(`เพิ่มเจ้าหน้าที่สำเร็จ!`);
        setFormData({
          email: '',
          password: '',
          confirmPassword: '',
          code: '',
          firstName: '',
          lastName: '',
          phone: ''
        });
        setErrors({});
      } else {
        const failTimestampName = generateTimestampName('Failed to add', 'form');
        const timestampTypeId = 18;
        await insertTimestamp(failTimestampName, timestampTypeId);

        setAlertMessage(response.data.message || 'เกิดข้อผิดพลาดในการเพิ่มข้อมูล');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      const errorTimestampName = generateTimestampName('Error adding', 'form');
      const timestampTypeId = 18;
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
    if (backButtonInfo.destination) {
      navigate(backButtonInfo.destination);
    } else {
      navigate('/staff-management/staff-name');
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
            {backButtonInfo.show && (
              <div className={styles.backButtonWrapper}>
                <button
                  className={styles.backButton}
                  onClick={handleGoBack}
                  title={backButtonInfo.title}
                >
                  <FiArrowLeft size={20} />
                </button>
              </div>
            )}
            <h1 className={styles.heading}>เพิ่มบัญชีเจ้าหน้าที่</h1>
            <div className={styles.headerRight} />
          </div>

          <StaffImportExport
            setModalOpen={setModalOpen}
            onDataImport={handleDataImport}
          />

          <StaffForms
            formData={formData}
            setFormData={setFormData}
            errors={errors}
          />

          <div className={styles.buttonWrapper}>
            <button
              className={`${styles.formButton} ${isLoading ? styles.loading : ''}`}
              onClick={handleConfirm}
              disabled={isLoading || isImportLoading}
            >
              {isLoading ? 'กำลังบันทึก...' : 'ยืนยัน'}
            </button>
          </div>

          <ImportDataModal
            open={modalOpen}
            setOpen={setModalOpen}
            importedData={importedData}
            userType="staff"
            onConfirmImport={handleConfirmImport}
          />

          {/* CSV Import Loading Overlay */}
          {isImportLoading && (
            <div className={styles.importLoadingOverlay}>
              <div className={styles.importLoadingModal}>
                <div className={styles.importLoadingContent}>
                  <div className={styles.importLoadingSpinner}></div>
                  <h3>กำลังนำเข้าข้อมูล...</h3>
                  <p>กรุณารอสักครู่ ระบบกำลังประมวลผลข้อมูลของคุณ</p>

                  <div className={styles.progressInfo}>
                    <div className={styles.progressText}>
                      ดำเนินการแล้ว: {importProgress.current} / {importProgress.total} รายการ
                    </div>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{
                          width: importProgress.total > 0
                            ? `${(importProgress.current / importProgress.total) * 100}%`
                            : '0%'
                        }}
                      ></div>
                    </div>
                    <div className={styles.progressPercentage}>
                      {importProgress.total > 0
                        ? Math.round((importProgress.current / importProgress.total) * 100)
                        : 0}%
                    </div>
                  </div>

                  <div className={styles.importWarning}>
                    <strong>หมายเหตุ:</strong> กรุณาอย่าปิดหน้าต่างนี้จนกว่าการจะเสร็จสิ้น
                  </div>
                </div>
              </div>
            </div>
          )}
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

export default AddStaffAdmin;