import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../NavigationBar/NavigationBar';
import ActivityForms from './ActivityForms/ActivityForms';
import CustomModal from '../../../services/CustomModal/CustomModal';
import { validateActivityForm } from '../../../utils/activityValidator';
import { useUserPermissions } from './hooks/useUserPermissions';
import styles from './CreateActivity.module.css';
import { FiArrowLeft } from 'react-icons/fi';

const getApiUrl = (endpoint) => {
  return `${process.env.REACT_APP_SERVER_PROTOCOL}${process.env.REACT_APP_SERVER_BASE_URL}${process.env.REACT_APP_SERVER_PORT}${endpoint}`;
};

function CreateActivity() {
  const navigate = useNavigate();
  const location = useLocation();
  const permissions = useUserPermissions();
  const referrer = location.state?.from || null;

  const getBackButtonInfo = () => {
    if (!referrer) return { show: false };

    switch (referrer) {
      case '/activity-management/activity-name':
        return {
          show: true,
          title: "กลับไปหน้ารายการกิจกรรม",
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
    title: '',
    description: '',
    locationDetail: '',
    locationGPS: null,
    startTime: '',
    endTime: '',
    isRequire: false,
    allowTeachers: false,
    activityTypeId: '',
    activityStatusId: '',
    templateId: '',
    imageFile: null,
    selectedDepartments: []
  });

  const [activityTypes, setActivityTypes] = useState([]);
  const [activityStatuses, setActivityStatuses] = useState([]);
  const [templates, setTemplates] = useState([]);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [errors, setErrors] = useState({});

  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (permissions.userType !== null) {
      if (!permissions.canManageActivities || !permissions.isStaff) {
        navigate('/dashboard');
        return;
      }
    }
  }, [permissions, navigate]);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [typesRes, statusesRes, templatesRes] = await Promise.all([
          axios.get(getApiUrl('/api/admin/activity-types'), { withCredentials: true }),
          axios.get(getApiUrl('/api/admin/activity-statuses'), { withCredentials: true }),
          axios.get(getApiUrl('/api/admin/templates'), { withCredentials: true })
        ]);

        if (typesRes.data.status) setActivityTypes(typesRes.data.data);

        if (statusesRes.data.status) {
          const statuses = statusesRes.data.data;
          setActivityStatuses(statuses);
          const openStatus = statuses.find(status =>
            status.ActivityStatus_Name === 'เปิดรับสมัคร'
          );

          if (openStatus) {
            setFormData(prev => ({
              ...prev,
              activityStatusId: openStatus.ActivityStatus_ID
            }));
          }
        }

        if (templatesRes.data.status) setTemplates(templatesRes.data.data);
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
      }
    };

    if (permissions.isStaff) {
      fetchDropdownData();
    }
  }, [permissions.isStaff]);

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

  const generateTimestampName = (action) => {
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

    const activityTitle = formData.title || 'activity';
    const participantType = formData.allowTeachers ? 'students and teachers' : 'students only';
    return `${action} activity "${activityTitle}" (${participantType}) at ${dateStr} ${timeStr} in Website.`;
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

  const validateForm = () => {
    const validationErrors = validateActivityForm(formData);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const prepareFormData = () => {
    const submitData = new FormData();

    submitData.append('activityTitle', formData.title);
    submitData.append('activityDescription', formData.description);
    submitData.append('activityLocationDetail', formData.locationDetail || '');

    if (formData.locationGPS) {
      submitData.append('activityLocationGPS', JSON.stringify(formData.locationGPS));
    }

    submitData.append('activityStartTime', formData.startTime);
    submitData.append('activityEndTime', formData.endTime);
    submitData.append('activityIsRequire', formData.isRequire);
    submitData.append('allowTeachers', formData.allowTeachers); // เพิ่มข้อมูลนี้

    if (formData.activityTypeId) {
      submitData.append('activityTypeId', formData.activityTypeId);
    }
    if (formData.activityStatusId) {
      submitData.append('activityStatusId', formData.activityStatusId);
    }
    if (formData.templateId) {
      submitData.append('templateId', formData.templateId);
    }

    if (formData.selectedDepartments && formData.selectedDepartments.length > 0) {
      submitData.append('selectedDepartments', JSON.stringify(formData.selectedDepartments));
    }

    if (formData.imageFile) {
      submitData.append('activityImage', formData.imageFile);
    }

    return submitData;
  };

  const handleSubmit = async () => {
    if (!permissions.canManageActivities || !permissions.isStaff) {
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
      const submitData = prepareFormData();
      const endpoint = '/api/admin/activities';

      const response = await axios.post(getApiUrl(endpoint), submitData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.status) {
        const successTimestampName = generateTimestampName('Successfully created');
        const timestampTypeId = 50;
        await insertTimestamp(successTimestampName, timestampTypeId);

        const participantInfo = formData.allowTeachers
          ? `รวมนักศึกษา ${response.data.data.totalStudents} คนและอาจารย์ ${response.data.data.totalTeachers} คน`
          : `นักศึกษา ${response.data.data.totalStudents} คน`;

        setAlertMessage(`สร้างกิจกรรมสำเร็จ! (${participantInfo})`);

        setFormData({
          title: '',
          description: '',
          locationDetail: '',
          locationGPS: null,
          startTime: '',
          endTime: '',
          isRequire: false,
          allowTeachers: false,
          activityTypeId: '',
          activityStatusId: '',
          templateId: '',
          imageFile: null,
          selectedDepartments: []
        });
        setErrors({});

        setTimeout(() => {
          navigate('/activity-management/activity-name');
        }, 2500);
      } else {
        const failTimestampName = generateTimestampName('Failed to create');
        const timestampTypeId = 50;
        await insertTimestamp(failTimestampName, timestampTypeId);

        setAlertMessage(response.data.message || 'เกิดข้อผิดพลาดในการสร้างกิจกรรม');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      const errorTimestampName = generateTimestampName('Error creating');
      const timestampTypeId = 50;
      await insertTimestamp(errorTimestampName, timestampTypeId);

      let errorMessage = 'เกิดข้อผิดพลาดในการสร้างกิจกรรม';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 403) {
        errorMessage = 'ไม่มีสิทธิ์ในการดำเนินการนี้';
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
      navigate('/activity-management/activity-name');
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

  if (!permissions.canManageActivities || !permissions.isStaff) {
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
            <h1 className={styles.heading}>สร้างกิจกรรม</h1>
            <div className={styles.headerRight} />
          </div>

          <ActivityForms
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            activityTypes={activityTypes}
            activityStatuses={activityStatuses}
            templates={templates}
          />

          <div className={styles.buttonWrapper}>
            <button
              className={`${styles.formButton} ${isLoading ? styles.loading : ''}`}
              onClick={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? 'กำลังบันทึก...' : 'สร้างกิจกรรม'}
            </button>
          </div>
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

export default CreateActivity;