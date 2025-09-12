import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../../NavigationBar/NavigationBar';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './AdminUsersDetail.module.css';
import { ArrowLeft, User, AlertCircle } from 'lucide-react';
import { FiBell } from 'react-icons/fi';

import StudentProfileForm from './forms/StudentProfileForm';
import TeacherProfileForm from './forms/TeacherProfileForm';
import StaffProfileForm from './forms/StaffProfileForm';
import RecentActivitiesForm from './activityForms/RecentActivitiesForm';
import IncompleteActivitiesForm from './activityForms/IncompleteActivitiesForm';
import ExportExcelButton from './utils/ExportExcelButton';

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

  const navigate = useNavigate();
  const location = useLocation();
  const getMockUserData = (userType = 'student') => {
    const baseData = {
      id: 1,
      email: 'teepakorn.kum@rmutto.ac.th',
      username: 'teepakorn.kum',
      userType: userType,
      isActive: true,
      regisTime: '2024-01-15T08:30:00',
      imageFile: null,
    };

    switch (userType) {
      case 'student':
        return {
          ...baseData,
          student: {
            code: '000000000000-0',
            firstName: 'ทีปกร',
            lastName: 'คุ้มวงศ์',
            phone: '0987654321',
            otherPhones: [
              { name: 'บ้าน', phone: '0812345678' },
              { name: 'ที่ทำงาน', phone: '0923456789' }
            ],
            academicYear: 2022,
            birthdate: '2003-05-15',
            religion: 'พุทธ',
            medicalProblem: null,
            isGraduated: false,
            department: 'วิทยาการคอมพิวเตอร์',
            faculty: 'คณะบริหารธุรกิจและเทคโนโลยีสารสนเทศ',
            advisor: 'Teacher Admin'
          }
        };

      case 'teacher':
        return {
          ...baseData,
          email: 'teacher.admin@rmutto.ac.th',
          username: 'teacher.admin',
          teacher: {
            code: 'T001234',
            firstName: 'สมชาย',
            lastName: 'วิทยาการ',
            phone: '0912345678',
            otherPhones: [
              { name: 'บ้าน', phone: '0823456789' },
              { name: 'สำนักงาน', phone: '0834567890' }
            ],
            birthdate: '1985-03-20',
            religion: 'พุทธ',
            position: 'ผู้ช่วยศาสตราจารย์',
            department: 'ภาควิชาวิทยาการคอมพิวเตอร์',
            faculty: 'คณะบริหารธุรกิจและเทคโนโลยีสารสนเทศ',
            specialization: 'ปัญญาประดิษฐ์และการเรียนรู้ของเครื่อง',
            education: 'ปริญญาเอก วิทยาการคอมพิวเตอร์ จุฬาลงกรณ์มหาวิทยาลัย',
            startDate: '2015-06-01'
          }
        };

      case 'staff':
        return {
          ...baseData,
          email: 'staff.admin@rmutto.ac.th',
          username: 'staff.admin',
          staff: {
            code: 'S001234',
            firstName: 'สมหญิง',
            lastName: 'ธุรการ',
            phone: '0934567890',
            otherPhones: [
              { name: 'บ้าน', phone: '0845678901' },
              { name: 'ฉุกเฉิน', phone: '0956789012' }
            ],
            birthdate: '1990-07-10',
            religion: 'พุทธ',
            employeeType: 'ข้าราชการ',
            position: 'เจ้าหน้าที่บริหารงานทั่วไป',
            department: 'สำนักงานคณบดี',
            workLocation: 'อาคารสำนักงาน ชั้น 2',
            responsibilities: 'ดูแลงานธุรการทั่วไป ประสานงานระหว่างหน่วยงาน จัดเตรียมเอกสาร และให้บริการนักศึกษา',
            startDate: '2018-08-15'
          }
        };

      default:
        return baseData;
    }
  };

  const notifications = ["มีผู้ใช้งานเข้าร่วมกิจกรรม", "มีการอัพเดทข้อมูลกิจกรรมใหม่"];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const receivedData = location.state?.userData;
      if (receivedData) {
        setUserData(receivedData);
      } else {
        const mockData = getMockUserData('student'); //'teacher' 'staff'
        setUserData(mockData);
      }
      setLoading(false);
    }, 1500);
  }, [location.state]);

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

  const handleGoBack = useCallback(() => {
    const userType = userData?.userType;
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
        navigate('/admin/users');
    }
  }, [navigate, userData?.userType]);

  const handleUserDataUpdate = useCallback((updatedData) => {
    setUserData(prev => ({
      ...prev,
      ...updatedData
    }));
  }, []);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
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
        return <StudentProfileForm userData={userData} onUpdate={handleUserDataUpdate} />;
      case 'teacher':
        return <TeacherProfileForm userData={userData} onUpdate={handleUserDataUpdate} />;
      case 'staff':
        return <StaffProfileForm userData={userData} onUpdate={handleUserDataUpdate} />;
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

  // แสดงข้อมูลหลักของผู้ใช้
  const currentUserData = userData[userData.userType] || {};
  const displayName = `${currentUserData.firstName || ''} ${currentUserData.lastName || ''}`.trim() || 'ไม่ระบุชื่อ';
  const userCode = currentUserData.code || 'ไม่ระบุรหัส';

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
                        {notification}
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
                <img src={userData.imageFile} alt="Profile" />
              ) : (
                <User size={48} />
              )}
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
      </main>
    </div>
  );
}

export default AdminUsersDetail;