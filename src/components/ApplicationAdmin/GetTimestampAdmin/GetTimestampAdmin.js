import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../NavigationBar/NavigationBar';
import styles from './GetTimestampAdmin.module.css';
import { AlertCircle, Loader, Calendar, ArrowLeft, Activity, Users, Shield } from 'lucide-react';

import TimestampFiltersForm from './TimestampFiltersForm/TimestampFiltersForm';
import TimestampTable from './TimestampTable/TimestampTable';
import TimestampModal from './TimestampModal/TimestampModal';
import TimestampPagination from './TimestampPagination/TimestampPagination';

import { useTimestamps } from './hooks/useTimestamps';
import { useTimestampFilters } from './hooks/useTimestampFilters';
import { useTimestampActions } from './hooks/useTimestampActions';
import { useUIState } from './hooks/useUIState';
import { useUserPermissions } from './hooks/useUserPermissions';

function GetTimestamp() {
  const navigate = useNavigate();
  const permissions = useUserPermissions();
  const rowsPerPage = 10;

  const {
    timestamps,
    timestampStats,
    searchCriteria,
    isPersonSearch,
    loading,
    error,
    fetchTimestamps,
    goBackToPersonSearch
  } = useTimestamps();

  const {
    searchQuery,
    setSearchQuery,
    userTypeFilter,
    setUserTypeFilter,
    eventTypeFilter,
    setEventTypeFilter,
    dateFilter,
    setDateFilter,
    currentPage,
    setCurrentPage,
    hasActiveFilters,
    getFilteredTimestamps,
    getUniqueEventTypes,
    resetFilters,
    setSearchFromCriteria
  } = useTimestampFilters();

  const { exportToExcel } = useTimestampActions();

  const {
    isMobile,
    sidebarOpen,
    setSidebarOpen,
  } = useUIState();

  const [selectedTimestamp, setSelectedTimestamp] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (permissions.userType !== null) {
      if (!permissions.isStaff || !permissions.canAccessTimestampLogs) {
        navigate('/dashboard');
        return;
      }
    }
  }, [permissions, navigate]);

  useEffect(() => {
    if (searchCriteria) {
      setSearchFromCriteria(searchCriteria);
    }
  }, [searchCriteria, setSearchFromCriteria]);

  const filteredTimestamps = useMemo(() => {
    return getFilteredTimestamps(timestamps);
  }, [getFilteredTimestamps, timestamps]);

  const uniqueEventTypes = useMemo(() => {
    return getUniqueEventTypes(timestamps);
  }, [getUniqueEventTypes, timestamps]);

  const totalPages = Math.ceil(filteredTimestamps.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredTimestamps.slice(indexOfFirstRow, indexOfLastRow);
  const handleViewTimestamp = (timestamp) => {
    if (!permissions.canViewTimestampDetails) {
      return;
    }
    setSelectedTimestamp(timestamp);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedTimestamp(null);
  };

  const handleExport = () => {
    if (!permissions.canExportTimestampData) {
      return;
    }
    exportToExcel(filteredTimestamps, searchCriteria);
  };

  const handleResetFilters = () => {
    resetFilters(!isPersonSearch);
  };

  const renderPermissionLoadingState = () => (
    <div className={styles.container}>
      <div className={styles.loadingWrapper}>
        <div className={styles.loading}>กำลังตรวจสอบสิทธิ์...</div>
      </div>
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
          <p>คุณไม่มีสิทธิ์ในการเข้าถึงประวัติการใช้งานระบบ เฉพาะเจ้าหน้าที่เท่านั้นที่สามารถดูข้อมูลนี้ได้</p>
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

  const renderLoadingState = () => (
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
          <div className={styles.errorActions}>
            <button className={styles.retryButton} onClick={fetchTimestamps}>
              ลองใหม่อีกครั้ง
            </button>
            {isPersonSearch && (
              <button className={styles.backButton} onClick={goBackToPersonSearch}>
                <ArrowLeft size={16} /> กลับไปค้นหาใหม่
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );

  if (permissions.userType === null) {
    return renderPermissionLoadingState();
  }

  if (!permissions.isStaff || !permissions.canAccessTimestampLogs) {
    return renderUnauthorizedState();
  }

  if (loading) return renderLoadingState();
  if (error) return renderErrorState();

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
            {isPersonSearch && (
              <button
                className={styles.backButton}
                onClick={goBackToPersonSearch}
                aria-label="กลับไปหน้าค้นหา"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <div>
              <h1 className={styles.heading}>
                {isPersonSearch ? 'ผลการค้นหาประวัติการใช้งาน' : 'ประวัติการใช้งาน'}
              </h1>
              <div className={styles.summaryStats}>
                <span className={styles.statItem}>
                  <Activity className={styles.iconSmall} />
                  ทั้งหมด: {timestampStats.total} รายการ
                </span>
                <span className={styles.statItem}>
                  <Users className={styles.iconSmall} />
                  ผู้ใช้: {timestampStats.uniqueUsers} คน
                </span>
                <span className={styles.statItem}>
                  <Calendar className={styles.iconSmall} />
                  เหตุการณ์: {timestampStats.eventTypes} ประเภท
                </span>
              </div>
              {searchCriteria && (
                <p className={styles.searchInfo}>
                  ค้นหาด้วย {searchCriteria.type === 'email' ? 'อีเมล' : 'IP Address'}:
                  <span className={styles.searchValue}>{searchCriteria.value}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Filter & Table */}
        <div className={styles.timestampSection}>
          <TimestampFiltersForm
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            userTypeFilter={userTypeFilter}
            setUserTypeFilter={setUserTypeFilter}
            eventTypeFilter={eventTypeFilter}
            setEventTypeFilter={setEventTypeFilter}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            uniqueEventTypes={uniqueEventTypes}
            filteredTimestamps={filteredTimestamps}
            exportToExcel={handleExport}
            resetFilters={handleResetFilters}
            hasActiveFilters={hasActiveFilters}
            setCurrentPage={setCurrentPage}
            canExport={permissions.canExportTimestampData}
          />

          {/* Results Summary */}
          <div className={styles.resultsSummary}>
            <span>พบ {filteredTimestamps.length} รายการ</span>
            {searchCriteria && (
              <span className={styles.searchSummary}>
                จากการค้นหา {searchCriteria.type === 'email' ? 'อีเมล' : 'IP'}: {searchCriteria.value}
              </span>
            )}
          </div>

          {/* Timestamp Table */}
          <TimestampTable
            timestamps={currentRows}
            onViewTimestamp={handleViewTimestamp}
            searchCriteria={searchCriteria}
            canViewDetails={permissions.canViewTimestampDetails}
          />

          {/* Pagination */}
          <TimestampPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={rowsPerPage}
            totalItems={filteredTimestamps.length}
          />
        </div>

        {/* Timestamp Detail Modal */}
        {permissions.canViewTimestampDetails && (
          <TimestampModal
            isOpen={modalOpen}
            onClose={closeModal}
            timestamp={selectedTimestamp}
          />
        )}

      </main>
    </div>
  );
}

export default GetTimestamp;