// AdminAllActivity.js
import React, { useEffect, useMemo } from 'react';
import { AlertCircle, Loader, Activity as ActivityIcon } from 'lucide-react';

import Navbar from '../../NavigationBar/NavigationBar';
import styles from './AdminAllActivity.module.css';

import ActivityFiltersForm from './ActivityFiltersForm/ActivityFiltersForm';
import ActivityTable from './ActivityTable/ActivityTable';
import ActivityModal from './ActivityModal/ActivityModal';
import ActivityPagination from './ActivityPagination/ActivityPagination';
import CustomModal from '../../../services/CustomModal/CustomModal';

import { useActivities } from './hooks/useActivities';
import { useFilters } from './hooks/useFilters';
import { useUIState } from './hooks/useUIState';
import { useActivityActions } from './hooks/useActivityActions';

function AdminAllActivity() {
  const rowsPerPage = 10;

  const {
    activities,
    activityTypes,
    activityStatuses,
    loading,
    error,
    actionLoading,
    fetchActivities,
    loadActivityTypes,
    loadActivityStatuses,
    deleteActivity,
    setError
  } = useActivities();

  const {
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
    dateRangeFilter,
    setDateRangeFilter,
    customDateRange,
    setCustomDateRange,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    currentPage,
    setCurrentPage,
    sortConfig,
    getFilteredAndSortedActivities,
    handleSort,
    resetFilters
  } = useFilters(fetchActivities, rowsPerPage);

  const {
    isMobile,
    sidebarOpen,
    setSidebarOpen,
    modalOpen,
    modalMessage,
    modalButtons,
    activityModalOpen,
    selectedActivityId,
    showModal,
    closeModal,
    openActivityModal,
    closeActivityModal
  } = useUIState();

  const {
    handleViewActivity,
    handleEditActivity,
    handleDeleteActivity,
    handleAddActivity
  } = useActivityActions({
    showModal,
    closeModal,
    openActivityModal,
    deleteActivity,
    fetchActivities
  });

  const sortedActivities = useMemo(() => {
    return getFilteredAndSortedActivities(activities);
  }, [getFilteredAndSortedActivities, activities]);

  const totalPages = Math.ceil(sortedActivities.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = sortedActivities.slice(indexOfFirstRow, indexOfLastRow);

  useEffect(() => {
    loadActivityTypes();
    loadActivityStatuses();
  }, [loadActivityTypes, loadActivityStatuses]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

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
            <Loader className={styles.spinner} />
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
            <button
              className={styles.retryButton}
              onClick={() => {
                setError(null);
                fetchActivities();
              }}
            >
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

      <main className={`${styles.mainContent} ${isMobile ? styles.mobileContent : ""} ${sidebarOpen && !isMobile ? styles.contentShift : ""}`}>
        <div className={styles.headerBar}>
          <div className={styles.headerLeft}>
            <div>
              <h1 className={styles.heading}>จัดการกิจกรรม</h1>
              <div className={styles.summaryStats}>
                <span className={styles.statItem}>
                  <ActivityIcon className={styles.iconSmall} />
                  ทั้งหมด: {sortedActivities.length} กิจกรรม
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.activitiesSection}>
          <ActivityFiltersForm
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            dateRangeFilter={dateRangeFilter}
            setDateRangeFilter={setDateRangeFilter}
            customDateRange={customDateRange}
            setCustomDateRange={setCustomDateRange}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            activityTypes={activityTypes}
            activityStatuses={activityStatuses}
            sortedActivities={sortedActivities}
            resetFilters={resetFilters}
            setCurrentPage={setCurrentPage}
            onAddActivity={handleAddActivity}
          />

          <ActivityTable
            activities={currentRows}
            onViewActivity={handleViewActivity}
            onEditActivity={handleEditActivity}
            onDeleteActivity={handleDeleteActivity}
            actionLoading={actionLoading}
            sortConfig={sortConfig}
            onSort={handleSort}
          />

          <ActivityPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={rowsPerPage}
            totalItems={sortedActivities.length}
          />
        </div>

        {actionLoading && (
          <div className={styles.actionOverlay}>
            <div className={styles.actionSpinner}>
              <div className={styles.spinner}></div>
              <p>กำลังดำเนินการ...</p>
            </div>
          </div>
        )}

        <CustomModal
          isOpen={modalOpen}
          message={modalMessage}
          onClose={closeModal}
          buttons={modalButtons}
        />

        <ActivityModal
          isOpen={activityModalOpen}
          onClose={closeActivityModal}
          activityId={selectedActivityId}
        />
      </main>
    </div>
  );
}

export default AdminAllActivity;