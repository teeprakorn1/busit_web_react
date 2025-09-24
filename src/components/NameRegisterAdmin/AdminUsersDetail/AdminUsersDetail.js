import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, AlertCircle, Shield, Lock, CheckCircle } from 'lucide-react';
import { FiBell } from 'react-icons/fi';

import Navbar from '../../NavigationBar/NavigationBar';
import StudentProfileForm from './forms/StudentProfileForm';
import TeacherProfileForm from './forms/TeacherProfileForm';
import StaffProfileForm from './forms/StaffProfileForm';
import RecentActivitiesForm from './activityForms/RecentActivitiesForm';
import IncompleteActivitiesForm from './activityForms/IncompleteActivitiesForm';
import ExportExcelButton from './utils/ExportExcelButton';
import ChangePasswordModal from './modals/ChangePasswordModal';

import useAdminUserDetail from './hooks/useAdminUserDetail';
import useUIState from './hooks/useUIState';
import useUserUtils from './hooks/useUserUtils';
import { useUserPermissions } from './hooks/useUserPermissions';

import styles from './AdminUsersDetail.module.css';

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.replace(/[<>"'&]/g, '').trim();
};

function AdminUsersDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const permissions = useUserPermissions();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const {
    loading,
    userData,
    error,
    updateLoading,
    passwordChangeLoading,
    securityAlert,
    imageUrls,
    // เพิ่ม dropdown states และฟังก์ชันใหม่
    faculties,
    departments,
    teachers,
    dropdownLoading,
    dropdownError,
    handleUserDataUpdate,
    handlePasswordChange,
    handleAssignmentChange,
    handleGoBack,
    retryFetch,
    handleImageError,
    shouldLoadImage,
    loadImageWithCredentials,
    loadDropdownData,
    retryLoadDropdownData,
    formatDateForInput,
    formatDateForSubmit
  } = useAdminUserDetail(id);

  const {
    isMobile,
    sidebarOpen,
    setSidebarOpen,
    notifyOpen,
    setNotifyOpen,
    activeTab,
    handleTabChange,
    notifications
  } = useUIState();

  const { userInfo, formatRegisterDate } = useUserUtils(userData);

  // Permission check - redirect if not staff
  useEffect(() => {
    if (permissions.userType !== null) {
      if (!permissions.isStaff || !permissions.canAccessAdminFeatures) {
        navigate('/dashboard');
        return;
      }
    }
  }, [permissions, navigate]);

  useEffect(() => {
    if (userData?.imageFile && shouldLoadImage(userData.imageFile)) {
      loadImageWithCredentials(userData.imageFile);
    }
  }, [userData?.imageFile, shouldLoadImage, loadImageWithCredentials]);

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleChangePassword = () => {
    setShowPasswordModal(true);
  };

  const handlePasswordChangeSubmit = async (newPassword) => {
    try {
      const result = await handlePasswordChange(newPassword);
      if (result.success) {
        setShowPasswordModal(false);
        setSuccessMessage(result.message || 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว');
      }
    } catch (error) {
      // Error will be handled by the modal component
      throw error;
    }
  };

  const renderProfileForm = () => {
    if (!userData) return null;

    const commonProps = {
      userData,
      onUpdate: handleUserDataUpdate,
      loading: updateLoading,
      imageUrls,
      handleImageError,
      shouldLoadImage,
      loadImageWithCredentials,
      canEdit: permissions.canEditStudents
    };

    switch (userData.userType) {
      case 'student':
        return (
          <StudentProfileForm 
            {...commonProps}
            // เพิ่ม props ใหม่สำหรับ dropdown และการจัดการข้อมูล
            faculties={faculties}
            departments={departments}
            teachers={teachers}
            dropdownLoading={dropdownLoading}
            dropdownError={dropdownError}
            loadDropdownData={loadDropdownData}
            retryLoadDropdownData={retryLoadDropdownData}
            handleAssignmentChange={handleAssignmentChange}
            formatDateForInput={formatDateForInput}
            formatDateForSubmit={formatDateForSubmit}
          />
        );
      case 'teacher':
        return <TeacherProfileForm {...commonProps} />;
      case 'staff':
        return <StaffProfileForm {...commonProps} />;
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

  const renderNotificationDropdown = () => (
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
  );

  const renderUserProfileCard = () => {
    if (!userInfo) return null;

    const displayImageUrl = userInfo.imageFile ? imageUrls.get(userInfo.imageFile) : null;
    const hasValidImage = displayImageUrl && shouldLoadImage(userInfo.imageFile);

    return (
      <div className={styles.profileCard}>
        <div className={styles.profileHeader}>
          <div className={styles.profileAvatar}>
            {hasValidImage ? (
              <img 
                src={displayImageUrl} 
                alt={`รูปโปรไฟล์ของ ${userInfo.displayName}`}
                className={styles.profileImage}
                onError={(e) => {
                  console.error('Image load error for:', userInfo.imageFile);
                  handleImageError(userInfo.imageFile);
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
                onLoad={(e) => {
                  e.target.style.display = 'block';
                  if (e.target.nextSibling) {
                    e.target.nextSibling.style.display = 'none';
                  }
                }}
                style={{ display: 'block' }}
              />
            ) : null}
            <div 
              className={styles.defaultAvatar}
              style={{ 
                display: (!hasValidImage) ? 'flex' : 'none' 
              }}
            >
              <User size={48} />
            </div>
          </div>
          <div className={styles.profileInfo}>
            <div className={styles.profileInfoContent}>
              <h2>{userInfo.displayName}</h2>
              <p className={styles.userCode}>{userInfo.userCode}</p>
              <div className={styles.profileMeta}>
                <span className={`${styles.statusBadge} ${userInfo.isActive ? styles.active : styles.inactive}`}>
                  {userInfo.isActive ? 'ใช้งาน' : 'ระงับ'}
                </span>
                <span className={`${styles.typeBadge} ${styles[userInfo.userType]}`}>
                  {userInfo.userTypeDisplay}
                </span>
                {userInfo.userType === 'student' && userData.student && (
                  <span className={`${styles.statusBadge} ${userData.student.isGraduated ? styles.graduated : styles.studying}`}>
                    {userData.student.isGraduated ? 'จบการศึกษา' : 'กำลังศึกษา'}
                  </span>
                )}
              </div>
              {userInfo.regisTime && (
                <div className={styles.registerInfo}>
                  <span className={styles.registerLabel}>สมัครสมาชิกเมื่อ:</span>
                  <span className={styles.registerDate}>
                    {formatRegisterDate(userInfo.regisTime)}
                  </span>
                </div>
              )}
            </div>
            
            {/* Action Buttons - ย้ายไปด้านขวา */}
            <div className={styles.profileActions}>
              {permissions.canExportData && (
                <ExportExcelButton userData={userData} />
              )}
              {permissions.canEditUsers && (
                <button 
                  className={styles.changePasswordButton}
                  onClick={handleChangePassword}
                  disabled={passwordChangeLoading}
                >
                  {passwordChangeLoading ? (
                    <>
                      <div className={styles.spinner}></div>
                      กำลังเปลี่ยน...
                    </>
                  ) : (
                    <>
                      <Lock size={16} />
                      เปลี่ยนรหัสผ่าน
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTabNavigation = () => (
    <div className={styles.tabNavigation}>
      <button
        className={`${styles.tabButton} ${activeTab === 'profile' ? styles.active : ''}`}
        onClick={() => handleTabChange('profile')}
      >
        <User size={16} />
        <span>ข้อมูลส่วนตัว</span>
      </button>
      {(userData?.userType === 'student' || userData?.userType === 'teacher') && (
        <button
          className={`${styles.tabButton} ${activeTab === 'activities' ? styles.active : ''}`}
          onClick={() => handleTabChange('activities')}
        >
          <User size={16} />
          <span>กิจกรรม</span>
        </button>
      )}
    </div>
  );

  const renderSuccessMessage = () => {
    if (!successMessage) return null;

    return (
      <div className={styles.successBanner}>
        <CheckCircle size={16} />
        <span>{successMessage}</span>
        <button 
          className={styles.closeSuccess}
          onClick={() => setSuccessMessage('')}
          aria-label="ปิดข้อความ"
        >
          ×
        </button>
      </div>
    );
  };

  const renderLoadingState = () => (
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

  const renderErrorState = () => (
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
              onClick={retryFetch}
              disabled={loading}
            >
              ลองใหม่อีกครั้ง
            </button>
          </div>
        </div>
      </main>
    </div>
  );

  const renderNoDataState = () => (
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

  const renderUnauthorizedState = () => (
    <div className={styles.container}>
      <Navbar
        isMobile={isMobile}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <main className={`${styles.mainContent} ${isMobile ? styles.mobileContent : ""} ${sidebarOpen && !isMobile ? styles.contentShift : ""}`}>
        <div className={styles.errorContainer}>
          <Shield className={styles.errorIcon} />
          <h2>ไม่มีสิทธิ์เข้าถึง</h2>
          <p>คุณไม่มีสิทธิ์ในการเข้าถึงหน้านี้ เฉพาะเจ้าหน้าที่เท่านั้นที่สามารถดูข้อมูลผู้ใช้รายบุคคลได้</p>
          <button 
            className={styles.backButton} 
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft size={16} /> กลับไปหน้าหลัก
          </button>
        </div>
      </main>
    </div>
  );

  const renderPermissionLoadingState = () => (
    <div className={styles.container}>
      <div className={styles.loadingWrapper}>
        <div className={styles.loading}>กำลังตรวจสอบสิทธิ์...</div>
      </div>
    </div>
  );

  // Early returns for permission checks
  if (permissions.userType === null) {
    return renderPermissionLoadingState();
  }

  if (!permissions.isStaff || !permissions.canAccessAdminFeatures) {
    return renderUnauthorizedState();
  }

  // Early returns for different states
  if (loading) return renderLoadingState();
  if (error) return renderErrorState();
  if (!userData) return renderNoDataState();

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
        {/* Success Message */}
        {renderSuccessMessage()}

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
                <span>รายชื่อ{userInfo?.userTypeDisplay}</span>
                <span className={styles.breadcrumbSeparator}>&gt;</span>
                <span className={styles.breadcrumbCurrent}>ข้อมูลรายบุคคล</span>
              </div>
            </div>
          </div>
          <div className={styles.headerRight}>
            {renderNotificationDropdown()}
          </div>
        </div>

        {/* User Profile Card */}
        {renderUserProfileCard()}

        {/* Navigation Tabs */}
        {renderTabNavigation()}

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

        {/* Change Password Modal */}
        {showPasswordModal && (
          <ChangePasswordModal
            userData={userData}
            onClose={() => setShowPasswordModal(false)}
            onSubmit={handlePasswordChangeSubmit}
            loading={passwordChangeLoading}
          />
        )}
      </main>
    </div>
  );
}

export default AdminUsersDetail;