// AdminJoinActivity.js - Updated with Certificate Support
import React, { useEffect } from 'react';
import { Users, Filter, AlertCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';

import Navbar from '../../NavigationBar/NavigationBar';
import styles from './AdminJoinActivity.module.css';

import ActivitySelector from './components/ActivitySelector/ActivitySelector';
import ParticipantsTable from './components/ParticipantsTable/ParticipantsTable';
import FilterPanel from './components/FilterPanel/FilterPanel';
import BulkActions from './components/BulkActions/BulkActions';
import ParticipantStats from './components/ParticipantStats/ParticipantStats';
import ImageGallery from './components/ImageGallery/ImageGallery';

import { useUIState } from './hooks/useUIState';
import { useActivities } from './hooks/useActivities';
import { useParticipants } from './hooks/useParticipants';
import { useFilters } from './hooks/useFilters';
import { useSelection } from './hooks/useSelection';
import { useBulkActions } from './hooks/useBulkActions';
import { useCertificateStatus } from './hooks/useCertificateStatus';

function AdminJoinActivity() {
  const location = useLocation();

  const {
    isMobile,
    sidebarOpen,
    setSidebarOpen,
    showFilters,
    setShowFilters,
    showImageGallery,
    setShowImageGallery,
    selectedImages,
    setSelectedImages
  } = useUIState();

  const {
    activities,
    selectedActivity,
    setSelectedActivity,
    loading: activitiesLoading,
    error: activitiesError,
    fetchActivities
  } = useActivities();

  const {
    participants,
    participantImages,
    loading: participantsLoading,
    error: participantsError,
    fetchParticipants,
    fetchParticipantImages,
    refreshParticipants
  } = useParticipants(selectedActivity?.Activity_ID);

  const {
    certificates,
    certificateMap,
    hasCertificate,
    refreshCertificates
  } = useCertificateStatus(selectedActivity?.Activity_ID);

  const {
    filters,
    filteredParticipants,
    updateFilter,
    resetFilters,
    searchQuery,
    setSearchQuery
  } = useFilters(participants);

  const {
    selectedParticipants,
    selectAll,
    deselectAll,
    toggleSelection,
    isSelected,
    isAllSelected,
    selectedCount
  } = useSelection(filteredParticipants);

  const {
    bulkApproving,
    bulkRejecting,
    bulkCheckingIn,
    bulkCheckingOut,
    handleBulkApprove,
    handleBulkReject,
    handleBulkCheckIn,
    handleBulkCheckOut,
    handleExportSelected
  } = useBulkActions(selectedParticipants, selectedActivity, async () => {
    await refreshParticipants();
    await refreshCertificates();
  });

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  useEffect(() => {
    const preselectedActivityId = location.state?.preselectedActivityId;

    if (preselectedActivityId && activities.length > 0 && !selectedActivity) {
      const activity = activities.find(a => a.Activity_ID === preselectedActivityId);
      if (activity) {
        setSelectedActivity(activity);
      }
    }
  }, [location.state, activities, selectedActivity, setSelectedActivity]);

  const handleActivityChange = (activity) => {
    setSelectedActivity(activity);
    deselectAll();
  };

  const handleViewImages = (participant) => {
    const images = participantImages[participant.Users_ID] || [];
    setSelectedImages(images);
    setShowImageGallery(true);
  };

  const getSelectedParticipantsData = () => {
    return filteredParticipants.filter(p =>
      selectedParticipants.has(p.Users_ID)
    );
  };

  const getSelectedPictureIds = () => {
    const pictureIds = [];
    selectedParticipants.forEach(userId => {
      const images = participantImages[userId] || [];
      images.forEach(img => {
        if (img.RegistrationPictureStatus_ID === 1) {
          pictureIds.push(img.RegistrationPicture_ID);
        }
      });
    });
    return pictureIds;
  };

  if (activitiesLoading && !activities.length) {
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
            <p>กำลังโหลดข้อมูลกิจกรรม...</p>
          </div>
        </main>
      </div>
    );
  }

  if (activitiesError) {
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
            <p>{activitiesError}</p>
            <button onClick={fetchActivities} className={styles.retryButton}>
              ลองใหม่อีกครั้ง
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
        <div className={styles.headerBar}>
          <div className={styles.headerLeft}>
            <div>
              <h1 className={styles.heading}>
                จัดการผู้เข้าร่วมกิจกรรม
              </h1>
            </div>
          </div>
          <div className={styles.headerRight}>
            <button
              className={`${styles.filterButton} ${showFilters ? styles.active : ''}`}
              onClick={() => setShowFilters(!showFilters)}
              title="กรอง"
            >
              <Filter size={18} />
              {!isMobile && <span>กรอง</span>}
            </button>
          </div>
        </div>

        {/* Activity Selector */}
        <ActivitySelector
          activities={activities}
          selectedActivity={selectedActivity}
          onActivityChange={handleActivityChange}
          loading={activitiesLoading}
        />

        {selectedActivity && (
          <>
            {/* Statistics */}
            <ParticipantStats
              participants={participants}
              filteredCount={filteredParticipants.length}
              selectedCount={selectedCount}
              activity={selectedActivity}
              certificateCount={certificates.length}
            />

            {/* Filter Panel */}
            {showFilters && (
              <FilterPanel
                filters={filters}
                updateFilter={updateFilter}
                resetFilters={resetFilters}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                activity={selectedActivity}
              />
            )}

            {/* Bulk Actions */}
            {selectedCount > 0 && (
              <BulkActions
                selectedCount={selectedCount}
                selectedParticipants={selectedParticipants}
                selectedActivity={selectedActivity}
                onApprove={() => {
                  const pictureIds = getSelectedPictureIds();
                  if (pictureIds.length > 0) {
                    handleBulkApprove(pictureIds, true); // true = auto generate certificate
                  } else {
                    alert('ไม่มีรูปภาพที่รออนุมัติในรายการที่เลือก');
                  }
                }}
                onReject={() => {
                  const pictureIds = getSelectedPictureIds();
                  if (pictureIds.length > 0) {
                    handleBulkReject(pictureIds);
                  } else {
                    alert('ไม่มีรูปภาพที่รออนุมัติในรายการที่เลือก');
                  }
                }}
                onCheckIn={() => handleBulkCheckIn(Array.from(selectedParticipants))}
                onCheckOut={() => handleBulkCheckOut(Array.from(selectedParticipants))}
                onExport={() => {
                  const data = getSelectedParticipantsData();
                  handleExportSelected(data);
                }}
                onDeselectAll={deselectAll}
                approving={bulkApproving}
                rejecting={bulkRejecting}
                checkingIn={bulkCheckingIn}
                checkingOut={bulkCheckingOut}
                getSelectedParticipantsData={getSelectedParticipantsData}
              />
            )}

            {/* Participants Table */}
            {participantsLoading && !participants.length ? (
              <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>กำลังโหลดรายชื่อผู้เข้าร่วม...</p>
              </div>
            ) : participantsError ? (
              <div className={styles.errorBox}>
                <AlertCircle size={20} />
                <span>{participantsError}</span>
                <button onClick={() => fetchParticipants()} className={styles.retryButtonSmall}>
                  ลองใหม่
                </button>
              </div>
            ) : (
              <ParticipantsTable
                participants={filteredParticipants}
                selectedParticipants={selectedParticipants}
                isSelected={isSelected}
                toggleSelection={toggleSelection}
                selectAll={selectAll}
                deselectAll={deselectAll}
                isAllSelected={isAllSelected}
                onViewImages={handleViewImages}
                onRefresh={refreshParticipants}
                participantImages={participantImages}
                fetchParticipantImages={fetchParticipantImages}
                activity={selectedActivity}
                hasCertificate={hasCertificate}
                certificateMap={certificateMap}
              />
            )}
          </>
        )}

        {!selectedActivity && !activitiesLoading && (
          <div className={styles.emptyState}>
            <Users size={64} />
            <h3>เลือกกิจกรรมเพื่อเริ่มต้น</h3>
            <p>กรุณาเลือกกิจกรรมจากรายการด้านบนเพื่อดูและจัดการผู้เข้าร่วม</p>
          </div>
        )}

        {/* Image Gallery Modal */}
        {showImageGallery && (
          <ImageGallery
            images={selectedImages}
            onClose={() => setShowImageGallery(false)}
            onApprove={(pictureIds) => handleBulkApprove(pictureIds, true)}
            onReject={handleBulkReject}
            onRefresh={async () => {
              await refreshParticipants();
              await refreshCertificates();
            }}
            selectedActivity={selectedActivity}
          />
        )}
      </main>
    </div>
  );
}

export default AdminJoinActivity;