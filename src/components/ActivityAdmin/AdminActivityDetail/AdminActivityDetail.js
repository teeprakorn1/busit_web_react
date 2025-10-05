import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, AlertCircle, Shield, Users, CheckCircle, Building2, Trash2 } from 'lucide-react';

import Navbar from '../../NavigationBar/NavigationBar';
import ActivityBasicForm from './forms/ActivityBasicForm';
import ActivityParticipantsForm from './forms/ActivityParticipantsForm';
import ActivityDepartmentsForm from './forms/ActivityDepartmentsForm';
import ActivityStatsForm from './forms/ActivityStatsForm';
import ExportActivityButton from './utils/ExportActivityButton';

import useAdminActivityDetail from './hooks/useAdminActivityDetail';
import useActivityDetailActions from './hooks/useActivityDetailActions';
import useUIState from './hooks/useUIState';
import useActivityUtils from './hooks/useActivityUtils';
import { useUserPermissions } from './hooks/useUserPermissions';

import styles from './AdminActivityDetail.module.css';

function AdminActivityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const permissions = useUserPermissions();
  const [successMessage, setSuccessMessage] = useState('');

  const {
    loading,
    activityData,
    error,
    updateLoading,
    securityAlert,
    imageUrls,
    handleActivityDataUpdate,
    retryFetch,
    handleImageError,
    shouldLoadImage,
    loadImageWithCredentials,
    getCachedImageUrl
  } = useAdminActivityDetail(id);

  const {
    handleDeleteActivity,
    handleGoBack
  } = useActivityDetailActions(activityData);

  const {
    isMobile,
    sidebarOpen,
    setSidebarOpen,
    activeTab,
    handleTabChange,
  } = useUIState();

  const { activityInfo, formatActivityDate } = useActivityUtils(activityData);

  useEffect(() => {
    if (permissions.userType !== null) {
      if (!permissions.isStaff || !permissions.canAccessAdminFeatures) {
        navigate('/dashboard');
        return;
      }
    }
  }, [permissions, navigate]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const renderActivityProfileCard = () => {
    if (!activityInfo) return null;

    const hasImageFile = activityInfo.imageFile && activityInfo.imageFile.trim() !== '';
    const cachedImageUrl = getCachedImageUrl ? getCachedImageUrl(activityInfo.imageFile) : null;
    const shouldShowImage = hasImageFile && cachedImageUrl;

    return (
      <div className={styles.profileCard}>
        <div className={styles.profileHeader}>
          <div className={styles.profileAvatar}>
            {shouldShowImage && (
              <img
                src={cachedImageUrl}
                alt={`รูปกิจกรรม ${activityInfo.title}`}
                className={styles.profileImage}
                onError={(e) => {
                  handleImageError && handleImageError(activityInfo.imageFile);
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
              <Activity size={48} />
            </div>
          </div>

          <div className={styles.profileInfo}>
            <div className={styles.profileInfoContent}>
              <h2>{activityInfo.title}</h2>

              <div className={styles.profileMeta}>
                <span className={`${styles.statusBadge} ${styles[activityInfo.statusClass]}`}>
                  {activityInfo.statusName}
                </span>
                <span className={`${styles.typeBadge} ${styles.activity}`}>
                  {activityInfo.typeName}
                </span>
              </div>

              {activityInfo.startTime && (
                <div className={styles.registerInfo}>
                  <span className={styles.registerLabel}>เริ่มกิจกรรม:</span>
                  <span className={styles.registerDate}>
                    {formatActivityDate(activityInfo.startTime)}
                  </span>
                </div>
              )}
            </div>

            <div className={styles.profileActions}>
              {permissions.canExportData && (
                <ExportActivityButton activityData={activityData} />
              )}
              {permissions.canManageActivities && (
                <button
                  className={styles.deleteButton}
                  onClick={handleDeleteActivity}
                  title="ลบกิจกรรม"
                >
                  <Trash2 size={16} />
                  ลบ
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
        className={`${styles.tabButton} ${activeTab === 'basic' ? styles.active : ''}`}
        onClick={() => handleTabChange('basic')}
      >
        <Activity size={16} />
        <span>ข้อมูลกิจกรรม</span>
      </button>
      <button
        className={`${styles.tabButton} ${activeTab === 'departments' ? styles.active : ''}`}
        onClick={() => handleTabChange('departments')}
      >
        <Building2 size={16} />
        <span>สาขาที่เข้าร่วม</span>
      </button>
      <button
        className={`${styles.tabButton} ${activeTab === 'participants' ? styles.active : ''}`}
        onClick={() => handleTabChange('participants')}
      >
        <Users size={16} />
        <span>ผู้เข้าร่วม</span>
      </button>
      <button
        className={`${styles.tabButton} ${activeTab === 'stats' ? styles.active : ''}`}
        onClick={() => handleTabChange('stats')}
      >
        <Activity size={16} />
        <span>สถิติ</span>
      </button>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <ActivityBasicForm
            activityData={activityData}
            onUpdate={handleActivityDataUpdate}
            loading={updateLoading}
            imageUrls={imageUrls}
            handleImageError={handleImageError}
            shouldLoadImage={shouldLoadImage}
            loadImageWithCredentials={loadImageWithCredentials}
            canEdit={permissions.canManageActivities}
          />
        );
      case 'participants':
        return (
          <ActivityParticipantsForm activityData={activityData} />
        );
      case 'departments':
        return (
          <ActivityDepartmentsForm
            activityData={activityData}
            canEdit={permissions.canManageActivities}
          />
        );
      case 'stats':
        return (
          <ActivityStatsForm activityData={activityData} />
        );
      default:
        return null;
    }
  };

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

  if (permissions.userType === null) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingWrapper}>
          <div className={styles.loading}>กำลังตรวจสอบสิทธิ์...</div>
        </div>
      </div>
    );
  }

  if (!permissions.isStaff || !permissions.canAccessAdminFeatures) {
    return (
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
            <p>คุณไม่มีสิทธิ์ในการเข้าถึงหน้านี้ เฉพาะเจ้าหน้าที่เท่านั้นที่สามารถดูข้อมูลกิจกรรมได้</p>
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
  }

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
                <ArrowLeft size={16} /> กลับไปหน้ารายการ
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
  }

  if (!activityData) {
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
            <h2>ไม่พบข้อมูลกิจกรรม</h2>
            <p>กรุณาตรวจสอบการเชื่อมโยงหรือลองใหม่อีกครั้ง</p>
            <button className={styles.backButton} onClick={handleGoBack}>
              <ArrowLeft size={16} /> กลับไปหน้ารายการ
            </button>
          </div>
        </main>
      </div>
    );
  }

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
              <h1 className={styles.heading}>ข้อมูลรายละเอียดกิจกรรม</h1>
              <div className={styles.breadcrumb}>
                <span>จัดการกิจกรรม</span>
                <span className={styles.breadcrumbSeparator}>&gt;</span>
                <span className={styles.breadcrumbCurrent}>ข้อมูลรายละเอียดกิจกรรม</span>
              </div>
            </div>
          </div>
        </div>

        {renderActivityProfileCard()}
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
      </main>
    </div>
  );
}

export default AdminActivityDetail;