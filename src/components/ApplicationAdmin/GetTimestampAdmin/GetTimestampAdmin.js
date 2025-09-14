import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '../../NavigationBar/NavigationBar';
import styles from './GetTimestampAdmin.module.css';
import { AlertCircle, Loader, Calendar, ArrowLeft, Activity, Users } from 'lucide-react';
import { FiBell } from 'react-icons/fi';

// Components
import TimestampFiltersForm from './TimestampFiltersForm/TimestampFiltersForm';
import TimestampTable from './TimestampTable/TimestampTable';
import TimestampModal from './TimestampModal/TimestampModal';
import TimestampPagination from './TimestampPagination/TimestampPagination';

// Custom Hooks
import { useTimestamps } from './hooks/useTimestamps';
import { useTimestampFilters } from './hooks/useTimestampFilters';
import { useTimestampActions } from './hooks/useTimestampActions';
import { useUIState } from './hooks/useUIState';

function GetTimestamp() {
  const rowsPerPage = 10;
  const notifications = ["มีผู้ใช้งานเข้าร่วมกิจกรรม"];

  // Custom hooks
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
    notifyOpen,
    setNotifyOpen
  } = useUIState();

  // Modal states for timestamp details
  const [selectedTimestamp, setSelectedTimestamp] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Apply search criteria to filters
  useEffect(() => {
    if (searchCriteria) {
      setSearchFromCriteria(searchCriteria);
    }
  }, [searchCriteria, setSearchFromCriteria]);

  // Get filtered timestamps
  const filteredTimestamps = useMemo(() => {
    return getFilteredTimestamps(timestamps);
  }, [getFilteredTimestamps, timestamps]);

  // Get unique event types for filter dropdown
  const uniqueEventTypes = useMemo(() => {
    return getUniqueEventTypes(timestamps);
  }, [getUniqueEventTypes, timestamps]);

  // Pagination
  const totalPages = Math.ceil(filteredTimestamps.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredTimestamps.slice(indexOfFirstRow, indexOfLastRow);

  // Handle view timestamp
  const handleViewTimestamp = (timestamp) => {
    setSelectedTimestamp(timestamp);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedTimestamp(null);
  };

  // Handle export
  const handleExport = () => {
    exportToExcel(filteredTimestamps, searchCriteria);
  };

  // Handle reset filters
  const handleResetFilters = () => {
    resetFilters(!isPersonSearch); // Keep search criteria if it's a person search
  };

  // Loading state
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

  // Error state
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
          <div className={styles.headerRight}>
            <div className={styles.notifyWrapper}>
              <button
                className={styles.notifyButton}
                onClick={() => setNotifyOpen(!notifyOpen)}
              >
                <FiBell size={24} />
                {notifications.length > 0 && (
                  <span className={styles.badge}>
                    {notifications.length}
                  </span>
                )}
              </button>

              {notifyOpen && (
                <div className={styles.notifyDropdown}>
                  {notifications.map((n, i) => (
                    <div key={i} className={styles.notifyItem}>
                      {n}
                    </div>
                  ))}
                </div>
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
        <TimestampModal
          isOpen={modalOpen}
          onClose={closeModal}
          timestamp={selectedTimestamp}
        />

      </main>
    </div>
  );
}

export default GetTimestamp;