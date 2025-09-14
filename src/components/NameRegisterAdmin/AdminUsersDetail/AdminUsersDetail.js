import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../../NavigationBar/NavigationBar';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import styles from './AdminUsersDetail.module.css';
import { ArrowLeft, User, AlertCircle, Shield } from 'lucide-react';
import { FiBell } from 'react-icons/fi';
import axios from 'axios';

import StudentProfileForm from './forms/StudentProfileForm';
import TeacherProfileForm from './forms/TeacherProfileForm';
import StaffProfileForm from './forms/StaffProfileForm';
import RecentActivitiesForm from './activityForms/RecentActivitiesForm';
import IncompleteActivitiesForm from './activityForms/IncompleteActivitiesForm';
import ExportExcelButton from './utils/ExportExcelButton';

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.replace(/[<>\"'&]/g, '').trim();
};

const validateId = (id) => {
  const numId = parseInt(id, 10);
  return !isNaN(numId) && numId > 0 && numId <= 2147483647;
};

const validateUserType = (userType) => {
  const allowedTypes = ['student', 'teacher', 'staff'];
  return allowedTypes.includes(userType);
};

const getApiUrl = (endpoint) => {
  const protocol = process.env.REACT_APP_SERVER_PROTOCOL;
  const baseUrl = process.env.REACT_APP_SERVER_BASE_URL;
  const port = process.env.REACT_APP_SERVER_PORT;

  if (!protocol || !baseUrl || !port) {
    throw new Error('Missing required environment variables');
  }
  
  return `${protocol}${baseUrl}${port}${endpoint}`;
};

const getUserTypeDisplay = (userType) => {
  switch (userType) {
    case 'student': return 'นักเรียน/นักศึกษา';
    case 'teacher': return 'ครู/อาจารย์';
    case 'staff': return 'เจ้าหน้าที่';
    default: return 'ไม่ระบุ';
  }
};

function AdminUsersDetail() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [securityAlert, setSecurityAlert] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const notifications = ["มีผู้ใช้งานเข้าร่วมกิจกรรม", "มีการอัพเดทข้อมูลกิจกรรมใหม่"];

  const validateAndSanitizeId = useCallback((rawId) => {
    if (!rawId) {
      throw new Error('ไม่พบรหัสผู้ใช้');
    }

    const sanitizedId = sanitizeInput(rawId.toString());
    
    if (!validateId(sanitizedId)) {
      throw new Error('รหัสผู้ใช้ไม่ถูกต้อง');
    }

    return parseInt(sanitizedId, 10);
  }, []);

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setSecurityAlert(null);
      let validatedId;
      try {
        validatedId = validateAndSanitizeId(id);
      } catch (validationError) {
        setError(validationError.message);
        setLoading(false);
        return;
      }

      let userType = 'student';
      if (location.state?.userData?.userType) {
        const stateUserType = sanitizeInput(location.state.userData.userType);
        if (validateUserType(stateUserType)) {
          userType = stateUserType;
        }
      }

      let apiEndpoint = '';
      switch (userType) {
        case 'student':
          apiEndpoint = `/api/admin/students/${validatedId}`;
          break;
        case 'teacher':
          apiEndpoint = `/api/admin/teachers/${validatedId}`;
          break;
        case 'staff':
          apiEndpoint = `/api/admin/staff/${validatedId}`;
          break;
        default:
          apiEndpoint = `/api/admin/students/${validatedId}`;
      }

      const response = await axios.get(getApiUrl(apiEndpoint), {
        withCredentials: true,
        timeout: 15000,
        headers: {
          'Cache-Control': 'no-cache',
          'X-Requested-With': 'XMLHttpRequest',
          'Content-Type': 'application/json'
        },
        validateStatus: (status) => {
          return status >= 200 && status < 300;
        }
      });

      if (response.data && response.data.status) {
        const receivedData = response.data.data;
        if (!receivedData || typeof receivedData !== 'object') {
          throw new Error('ข้อมูลที่ได้รับไม่ถูกต้อง');
        }

        if (receivedData.id !== validatedId) {
          setSecurityAlert('ตรวจพบการพยายามเข้าถึงข้อมูลไม่ถูกต้อง');
          throw new Error('ข้อมูลไม่ตรงกับที่ร้องขอ');
        }

        setUserData(receivedData);
      } else {
        setError(response.data?.message || 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
      }

    } catch (err) {
      console.error('Fetch user data error:', err);
      
      let errorMessage = 'เกิดข้อผิดพลาดในการโหลดข้อมูล';
      
      if (axios.isAxiosError(err)) {
        if (err.code === 'ECONNABORTED') {
          errorMessage = 'การเชื่อมต่อหมดเวลา กรุณาลองใหม่อีกครั้ง';
        } else if (err.response) {
          switch (err.response.status) {
            case 400:
              errorMessage = 'ข้อมูลที่ร้องขอไม่ถูกต้อง';
              break;
            case 401:
              errorMessage = 'กรุณาเข้าสู่ระบบใหม่';
              setTimeout(() => navigate('/login'), 2000);
              break;
            case 403:
              errorMessage = 'ไม่มีสิทธิ์เข้าถึงข้อมูลนี้';
              setSecurityAlert('การเข้าถึงถูกปฏิเสธ - ไม่มีสิทธิ์เพียงพอ');
              break;
            case 404:
              errorMessage = 'ไม่พบข้อมูลผู้ใช้ที่ต้องการ';
              break;
            case 429:
              errorMessage = 'คำขอเกินจำนวนที่กำหนด กรุณารอสักครู่แล้วลองใหม่';
              break;
            case 500:
            case 502:
            case 503:
              errorMessage = 'เซิร์ฟเวอร์ขัดข้อง กรุณาลองใหม่อีกครั้ง';
              break;
            default:
              errorMessage = err.response.data?.message || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
          }
        } else if (err.request) {
          errorMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้';
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [id, location.state, validateAndSanitizeId, navigate]);

  const handleUserDataUpdate = useCallback(async (updatedData) => {
    try {
      setUpdateLoading(true);
      setError(null);
      setSecurityAlert(null);

      if (!updatedData || typeof updatedData !== 'object') {
        throw new Error('ข้อมูลที่ส่งไม่ถูกต้อง');
      }

      const validatedId = validateAndSanitizeId(id);
      const userType = userData?.userType;

      if (!validateUserType(userType)) {
        throw new Error('ประเภทผู้ใช้ไม่ถูกต้อง');
      }

      const sanitizedData = {};
      if (updatedData[userType]) {
        const formData = updatedData[userType];
        sanitizedData[userType] = {
          ...formData,
          firstName: sanitizeInput(formData.firstName || ''),
          lastName: sanitizeInput(formData.lastName || ''),
          code: sanitizeInput(formData.code || ''),
          phone: sanitizeInput(formData.phone || ''),
          religion: sanitizeInput(formData.religion || ''),
          medicalProblem: sanitizeInput(formData.medicalProblem || ''),
          otherPhones: Array.isArray(formData.otherPhones) 
            ? formData.otherPhones.map(phone => ({
                name: sanitizeInput(phone.name || ''),
                phone: sanitizeInput(phone.phone || '')
              }))
            : []
        };

        if (!sanitizedData[userType].firstName || !sanitizedData[userType].lastName) {
          throw new Error('ชื่อและนามสกุลเป็นข้อมูลที่จำเป็น');
        }

        const phoneRegex = /^[0-9-+\s()]*$/;
        if (sanitizedData[userType].phone && !phoneRegex.test(sanitizedData[userType].phone)) {
          throw new Error('หมายเลขโทรศัพท์ไม่ถูกต้อง');
        }

        for (const phone of sanitizedData[userType].otherPhones) {
          if (phone.phone && !phoneRegex.test(phone.phone)) {
            throw new Error('หมายเลขโทรศัพท์เพิ่มเติมไม่ถูกต้อง');
          }
        }
      }

      let apiEndpoint = '';
      switch (userType) {
        case 'student':
          apiEndpoint = `/api/admin/students/${validatedId}`;
          break;
        case 'teacher':
          apiEndpoint = `/api/admin/teachers/${validatedId}`;
          break;
        case 'staff':
          apiEndpoint = `/api/admin/staff/${validatedId}`;
          break;
        default:
          throw new Error('ประเภทผู้ใช้ไม่ถูกต้อง');
      }

      const response = await axios.put(getApiUrl(apiEndpoint), sanitizedData, {
        withCredentials: true,
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        validateStatus: (status) => status >= 200 && status < 300
      });

      if (response.data && response.data.status) {
        await fetchUserData();
      } else {
        setError(response.data?.message || 'ไม่สามารถอัพเดทข้อมูลได้');
      }

    } catch (err) {
      console.error('Update user data error:', err);
      
      let errorMessage = 'เกิดข้อผิดพลาดในการอัพเดทข้อมูล';
      
      if (axios.isAxiosError(err)) {
        if (err.code === 'ECONNABORTED') {
          errorMessage = 'การเชื่อมต่อหมดเวลา กรุณาลองใหม่อีกครั้ง';
        } else if (err.response) {
          switch (err.response.status) {
            case 400:
              errorMessage = 'ข้อมูลที่ส่งไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง';
              break;
            case 401:
              errorMessage = 'กรุณาเข้าสู่ระบบใหม่';
              setTimeout(() => navigate('/login'), 2000);
              break;
            case 403:
              errorMessage = 'ไม่มีสิทธิ์แก้ไขข้อมูลนี้';
              setSecurityAlert('การแก้ไขถูกปฏิเสธ - ไม่มีสิทธิ์เพียงพอ');
              break;
            case 404:
              errorMessage = 'ไม่พบข้อมูลผู้ใช้ที่ต้องการแก้ไข';
              break;
            case 422:
              errorMessage = 'ข้อมูลที่ส่งไม่ผ่านการตรวจสอบ';
              break;
            case 429:
              errorMessage = 'คำขอเกินจำนวนที่กำหนด กรุณารอสักครู่';
              break;
            default:
              errorMessage = err.response.data?.message || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
          }
        }
      } else {
        errorMessage = err.message || errorMessage;
      }

      setError(errorMessage);
    } finally {
      setUpdateLoading(false);
    }
  }, [userData?.userType, id, fetchUserData, validateAndSanitizeId, navigate]);

  const handleGoBack = useCallback(() => {
    const userType = userData?.userType;
    
    if (!validateUserType(userType)) {
      navigate('/name-register');
      return;
    }

    switch (userType) {
      case 'student':
        navigate('/name-register/student-name');
        break;
      case 'teacher':
        navigate('/name-register/teacher-name');
        break;
      case 'staff':
        navigate('/name-register/staff-name');
        break;
      default:
        navigate('/name-register');
    }
  }, [navigate, userData?.userType]);

  const handleTabChange = useCallback((tab) => {
    const allowedTabs = ['profile', 'activities'];
    if (allowedTabs.includes(sanitizeInput(tab))) {
      setActiveTab(tab);
    }
  }, []);

  useEffect(() => {
    if (id) {
      try {
        validateAndSanitizeId(id);
        fetchUserData();
      } catch (validationError) {
        setError(validationError.message);
        setLoading(false);
      }
    } else {
      setError('ไม่พบรหัสผู้ใช้ในการเรียก URL');
      setLoading(false);
    }
  }, [fetchUserData, id, validateAndSanitizeId]);

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

  if (loading) {
    return (
      <div className={styles.container}>
        <Navbar
          isMobile={isMobile}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <main className={`${styles.mainContent} ${isMobile ? styles.mobileContent : ""} ${sidebarOpen && !isMobile ? styles.contentShift : ""}`}>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>กำลังโหลดข้อมูล...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <Navbar
          isMobile={isMobile}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <main className={`${styles.mainContent} ${isMobile ? styles.mobileContent : ""} ${sidebarOpen && !isMobile ? styles.contentShift : ""}`}>
          <div className={styles.errorContainer}>
            <AlertCircle className={styles.errorIcon} />
            <h2>เกิดข้อผิดพลาด</h2>
            <p>{error}</p>
            {securityAlert && (
              <div className={styles.securityAlert}>
                <Shield size={16} />
                <span>{securityAlert}</span>
              </div>
            )}
            <div className={styles.errorActions}>
              <button className={styles.backButton} onClick={handleGoBack}>
                <ArrowLeft size={16} /> กลับไปหน้ารายชื่อ
              </button>
              <button 
                className={styles.retryButton} 
                onClick={() => {
                  setError(null);
                  setSecurityAlert(null);
                  fetchUserData();
                }}
                disabled={loading}
              >
                ลองใหม่อีกครั้ง
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className={styles.container}>
        <Navbar
          isMobile={isMobile}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <main className={`${styles.mainContent} ${isMobile ? styles.mobileContent : ""} ${sidebarOpen && !isMobile ? styles.contentShift : ""}`}>
          <div className={styles.errorContainer}>
            <AlertCircle className={styles.errorIcon} />
            <h2>ไม่พบข้อมูลผู้ใช้</h2>
            <p>กรุณาตรวจสอบการเชื่อมโยงหรือลองใหม่อีกครั้ง</p>
            <button className={styles.backButton} onClick={handleGoBack}>
              <ArrowLeft size={16} /> กลับไปหน้ารายชื่อ
            </button>
          </div>
        </main>
      </div>
    );
  }

  const renderProfileForm = () => {
    switch (userData.userType) {
      case 'student':
        return (
          <StudentProfileForm 
            userData={userData} 
            onUpdate={handleUserDataUpdate}
            loading={updateLoading}
          />
        );
      case 'teacher':
        return (
          <TeacherProfileForm 
            userData={userData} 
            onUpdate={handleUserDataUpdate}
            loading={updateLoading}
          />
        );
      case 'staff':
        return (
          <StaffProfileForm 
            userData={userData} 
            onUpdate={handleUserDataUpdate}
            loading={updateLoading}
          />
        );
      default:
        return (
          <div className={styles.unsupportedType}>
            <AlertCircle size={48} />
            <h3>ประเภทผู้ใช้ไม่รองรับ</h3>
            <p>ระบบไม่สามารถแสดงข้อมูลประเภทผู้ใช้นี้ได้</p>
          </div>
        );
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileForm();
      case 'activities':
        return (
          <div className={styles.activitiesContainer}>
            <RecentActivitiesForm userData={userData} />
            {userData.userType === 'student' && (
              <IncompleteActivitiesForm userData={userData} />
            )}
          </div>
        );
      default:
        return renderProfileForm();
    }
  };

  const currentUserData = userData[userData.userType] || {};
  const displayName = `${sanitizeInput(currentUserData.firstName || '')} ${sanitizeInput(currentUserData.lastName || '')}`.trim() || 'ไม่ระบุชื่อ';
  const userCode = sanitizeInput(currentUserData.code || '') || 'ไม่ระบุรหัส';

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
        {/* Security Alert */}
        {securityAlert && (
          <div className={styles.securityBanner}>
            <Shield size={16} />
            <span>{securityAlert}</span>
          </div>
        )}

        {/* Header */}
        <div className={styles.headerBar}>
          <div className={styles.headerLeft}>
            <button className={styles.backButton} onClick={handleGoBack}>
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className={styles.heading}>ข้อมูลผู้ใช้งานรายบุคคล</h1>
              <div className={styles.breadcrumb}>
                <span>รายชื่อ{getUserTypeDisplay(userData.userType)}</span>
                <span className={styles.breadcrumbSeparator}>&gt;</span>
                <span className={styles.breadcrumbCurrent}>ข้อมูลรายบุคคล</span>
              </div>
            </div>
          </div>
          <div className={styles.headerRight}>
            <ExportExcelButton userData={userData} />
            <div className={styles.notifyWrapper}>
              <button
                className={styles.notifyButton}
                onClick={() => setNotifyOpen(!notifyOpen)}
                aria-label="การแจ้งเตือน"
              >
                <FiBell size={24} />
                {notifications.length > 0 && (
                  <span className={styles.badge}>{notifications.length}</span>
                )}
              </button>

              {notifyOpen && (
                <div className={styles.notifyDropdown}>
                  <div className={styles.notifyHeader}>
                    <h4>การแจ้งเตือน</h4>
                  </div>
                  {notifications.length > 0 ? (
                    notifications.map((notification, index) => (
                      <div key={index} className={styles.notifyItem}>
                        <span className={styles.notifyDot}></span>
                        {sanitizeInput(notification)}
                      </div>
                    ))
                  ) : (
                    <div className={styles.noNotifications}>
                      ไม่มีการแจ้งเตือน
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User Profile Card */}
        <div className={styles.profileCard}>
          <div className={styles.profileHeader}>
            <div className={styles.profileAvatar}>
              {userData.imageFile ? (
                <img 
                  src={sanitizeInput(userData.imageFile)} 
                  alt="Profile" 
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : (
                <User size={48} />
              )}
              <div style={{ display: 'none' }}>
                <User size={48} />
              </div>
            </div>
            <div className={styles.profileInfo}>
              <h2>{displayName}</h2>
              <p className={styles.userCode}>{userCode}</p>
              <div className={styles.profileMeta}>
                <span className={`${styles.statusBadge} ${userData.isActive ? styles.active : styles.inactive}`}>
                  {userData.isActive ? 'ใช้งาน' : 'ระงับ'}
                </span>
                <span className={`${styles.typeBadge} ${styles[userData.userType]}`}>
                  {getUserTypeDisplay(userData.userType)}
                </span>
                {userData.userType === 'student' && userData.student && (
                  <span className={`${styles.statusBadge} ${userData.student.isGraduated ? styles.graduated : styles.studying}`}>
                    {userData.student.isGraduated ? 'จบการศึกษา' : 'กำลังศึกษา'}
                  </span>
                )}
              </div>
              {userData.regisTime && (
                <div className={styles.registerInfo}>
                  <span className={styles.registerLabel}>สมัครสมาชิกเมื่อ:</span>
                  <span className={styles.registerDate}>
                    {new Date(userData.regisTime).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className={styles.tabNavigation}>
          <button
            className={`${styles.tabButton} ${activeTab === 'profile' ? styles.active : ''}`}
            onClick={() => handleTabChange('profile')}
          >
            <User size={16} />
            <span>ข้อมูลส่วนตัว</span>
          </button>
          {(userData.userType === 'student' || userData.userType === 'teacher') && (
            <button
              className={`${styles.tabButton} ${activeTab === 'activities' ? styles.active : ''}`}
              onClick={() => handleTabChange('activities')}
            >
              <User size={16} />
              <span>กิจกรรม</span>
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className={styles.tabContent}>
          {renderTabContent()}
        </div>

        {/* Update Loading Indicator */}
        {updateLoading && (
          <div className={styles.updateOverlay}>
            <div className={styles.updateSpinner}>
              <div className={styles.spinner}></div>
              <p>กำลังอัพเดทข้อมูล...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminUsersDetail;