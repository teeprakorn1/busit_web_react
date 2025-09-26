import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, User, AlertCircle, Shield, Lock, CheckCircle } from 'lucide-react';

import Navbar from '../../NavigationBar/NavigationBar';
import StaffProfileForm from './forms/StaffProfileForm';
import ExportExcelButton from './utils/ExportExcelButton';
import ChangePasswordModal from './modals/ChangePasswordModal';

import useAdminUserDetail from './hooks/useAdminUserDetail';
import useUIState from './hooks/useUIState';
import useUserUtils from './hooks/useUserUtils';
import { useUserPermissions } from './hooks/useUserPermissions';

import styles from './AdminUsersDetail.module.css';

function AdminStaffDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
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
    getCachedImageUrl,
    clearImageCache,
    handleUserDataUpdate,
    handlePasswordChange,
    handleGoBack: originalHandleGoBack,
    retryFetch,
    handleImageError,
    shouldLoadImage,
    loadImageWithCredentials
  } = useAdminUserDetail(id);

  const {
    isMobile,
    sidebarOpen,
    setSidebarOpen,
    activeTab,
    handleTabChange
  } = useUIState();

  const { userInfo, formatRegisterDate } = useUserUtils(userData);

  // Override handleGoBack สำหรับ staff
  const handleGoBack = () => {
    navigate('/staff-management/staff-name');
  };

  useEffect(() => {
    if (permissions.userType !== null) {
      if (!permissions.isStaff || !permissions.canAccessAdminFeatures) {
        navigate('/dashboard');
        return;
      }
    }
  }, [permissions, navigate]);

  useEffect(() => {
    if (userData?.imageFile) {
      if (userData.originalImageFile && userData.originalImageFile !== userData.imageFile && clearImageCache) {
        clearImageCache(userData.originalImageFile);
      }

      if (shouldLoadImage && shouldLoadImage(userData.imageFile)) {
        loadImageWithCredentials(userData.imageFile);
      }
    }
  }, [userData?.imageFile, userData?.originalImageFile, shouldLoadImage, loadImageWithCredentials, clearImageCache]);

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
      canEdit: permissions.canEditStaff
    };

    if (userData.userType === 'staff') {
      return <StaffProfileForm {...commonProps} />;
    }

    return (
      <div className={styles.unsupportedType}>
        <AlertCircle size={48} />
        <h3>ประเภทผู้ใช้ไม่รองรับ</h3>
        <p>ระบบไม่สามารถแสดงข้อมูลประเภทผู้ใช้นี้ได้</p>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileForm();
      default:
        return renderProfileForm();
    }
  };

  const renderUserProfileCard = () => {
    if (!userInfo) return null;

    const hasImageFile = userInfo.imageFile && userInfo.imageFile.trim() !== '';
    const cachedImageUrl = getCachedImageUrl ? getCachedImageUrl(userInfo.imageFile) : null;
    const shouldShowImage = hasImageFile && cachedImageUrl;

    return (
      <div className={styles.profileCard}>
        <div className={styles.profileHeader}>
          <div className={styles.profileAvatar}>
            {shouldShowImage && (
              <img
                src={cachedImageUrl}
                alt={`รูปโปรไฟล์ของ ${userInfo.displayName}`}
                className={styles.profileImage}
                onError={(e) => {
                  e.target.style.display = 'none';
                  const fallback = e.target.parentElement.querySelector('.fallback-avatar');
                  if (fallback) {
                    fallback.style.display = 'flex';
                  }
                }}
                style={{ display: 'block' }}
              />
            )}

            <div
              className={`${styles.defaultAvatar} fallback-avatar`}
              style={{
                display: !shouldShowImage ? 'flex' : 'none'
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
                {userData.staff && (
                  <span className={`${styles.statusBadge} ${userData.staff.isResigned ? styles.resigned : styles.working}`}>
                    {userData.staff.isResigned ? 'ลาออกแล้ว' : 'ปฏิบัติงาน'}
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
          <h2>ไม่พบข้อมูลเจ้าหน้าที่</h2>
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
          <p>คุณไม่มีสิทธิ์ในการเข้าถึงหน้านี้ เฉพาะเจ้าหน้าที่เท่านั้นที่สามารถดูข้อมูลเจ้าหน้าที่รายบุคคลได้</p>
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

  if (permissions.userType === null) {
    return renderPermissionLoadingState();
  }

  if (!permissions.isStaff || !permissions.canAccessAdminFeatures) {
    return renderUnauthorizedState();
  }

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
        {renderSuccessMessage()}

        {securityAlert && (
          <div className={styles.securityBanner}>
            <Shield size={16} />
            <span>{securityAlert}</span>
          </div>
        )}

        <div className={styles.headerBar}>
          <div className={styles.headerLeft}>
            <button className={styles.backButton} onClick={handleGoBack}>
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className={styles.heading}>ข้อมูลเจ้าหน้าที่รายบุคคล</h1>
              <div className={styles.breadcrumb}>
                <span>รายชื่อเจ้าหน้าที่</span>
                <span className={styles.breadcrumbSeparator}>&gt;</span>
                <span className={styles.breadcrumbCurrent}>ข้อมูลรายบุคคล</span>
              </div>
            </div>
          </div>
        </div>

        {renderUserProfileCard()}
        {renderTabNavigation()}

        <div className={styles.tabContent}>
          {renderTabContent()}
        </div>

        {updateLoading && (
          <div className={styles.updateOverlay}>
            <div className={styles.updateSpinner}>
              <div className={styles.spinner}></div>
              <p>กำลังอัพเดทข้อมูล...</p>
            </div>
          </div>
        )}

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

export default AdminStaffDetail;