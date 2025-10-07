import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../NavigationBar/NavigationBar';
import styles from './GetDataEditActivityAdmin.module.css';
import { AlertCircle, Loader, ArrowLeft, Activity, Users, Shield, Edit, Database } from 'lucide-react';

import ActivityEditFiltersForm from './ActivityEditFiltersForm/ActivityEditFiltersForm';
import ActivityEditTable from './ActivityEditTable/ActivityEditTable';
import ActivityEditModal from './ActivityEditModal/ActivityEditModal';
import ActivityEditPagination from './ActivityEditPagination/ActivityEditPagination';

import { useActivityEdits } from './hooks/useActivityEdits';
import { useActivityEditFilters } from './hooks/useActivityEditFilters';
import { useActivityEditActions } from './hooks/useActivityEditActions';
import { useUIState } from './hooks/useUIState';
import { useUserPermissions } from './hooks/useUserPermissions';

function GetDataEditActivityAdmin() {
  const navigate = useNavigate();
  const permissions = useUserPermissions();
  const rowsPerPage = 10;

  const {
    activityEdits,
    activityEditStats,
    searchCriteria,
    isActivitySearch,
    loading,
    error,
    fetchActivityEdits,
    goBackToActivitySearch
  } = useActivityEdits();

  const {
    searchQuery,
    setSearchQuery,
    editTypeFilter,
    setEditTypeFilter,
    dateFilter,
    setDateFilter,
    currentPage,
    setCurrentPage,
    hasActiveFilters,
    getFilteredActivityEdits,
    getUniqueEditTypes,
    resetFilters,
    setSearchFromCriteria,
    getFilterSummary
  } = useActivityEditFilters();

  const { exportToExcel } = useActivityEditActions();

  const { isMobile, sidebarOpen, setSidebarOpen } = useUIState();

  const [selectedActivityEdit, setSelectedActivityEdit] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    if (permissions.userType !== null) {
      if (!permissions.isStaff || !permissions.canAccessAdminFeatures) {
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

  const filteredActivityEdits = useMemo(() => {
    return getFilteredActivityEdits(activityEdits);
  }, [getFilteredActivityEdits, activityEdits]);

  const uniqueEditTypes = useMemo(() => {
    return getUniqueEditTypes(activityEdits);
  }, [getUniqueEditTypes, activityEdits]);

  const totalPages = Math.ceil(filteredActivityEdits.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredActivityEdits.slice(indexOfFirstRow, indexOfLastRow);

  const handleViewActivityEdit = (activityEdit) => {
    if (!permissions.canViewDataEditDetails) {
      return;
    }
    setSelectedActivityEdit(activityEdit);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedActivityEdit(null);
  };

  const handleExport = async () => {
    if (!permissions.canExportDataEditData || filteredActivityEdits.length === 0) {
      return;
    }

    try {
      setExportLoading(true);
      const result = exportToExcel(filteredActivityEdits, searchCriteria);

      if (result.success) {
        console.log(`Exported ${result.recordCount} records to ${result.filename}`);
      } else {
        console.error('Export failed:', result.error);
      }
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setExportLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setEditTypeFilter('');
    setDateFilter(null);
    setCurrentPage(1);

    if (typeof resetFilters === 'function') {
      resetFilters();
    }
  };

  const handleRefresh = () => {
    fetchActivityEdits();
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
          <p>คุณไม่มีสิทธิ์ในการเข้าถึงประวัติการแก้ไขกิจกรรม เฉพาะเจ้าหน้าที่เท่านั้นที่สามารถดูข้อมูลนี้ได้</p>
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
            <button className={styles.retryButton} onClick={handleRefresh}>
              ลองใหม่อีกครั้ง
            </button>
            {isActivitySearch && (
              <button className={styles.backButton} onClick={goBackToActivitySearch}>
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

  if (!permissions.isStaff || !permissions.canAccessAdminFeatures) {
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
        {/* Header Section */}
        <div className={styles.headerBar}>
          <div className={styles.headerLeft}>
            {isActivitySearch && (
              <button
                className={styles.backButton}
                onClick={goBackToActivitySearch}
                aria-label="กลับไปหน้าค้นหา"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <div>
              <h1 className={styles.heading}>
                {isActivitySearch ? 'ผลการค้นหาประวัติการแก้ไขกิจกรรม' : 'ประวัติการแก้ไขกิจกรรม'}
              </h1>

              {/* Summary Statistics */}
              <div className={styles.summaryStats}>
                <span className={styles.statItem}>
                  <Edit className={styles.iconSmall} />
                  ทั้งหมด: {activityEditStats.total || 0} รายการ
                </span>
                <span className={styles.statItem}>
                  <Users className={styles.iconSmall} />
                  เจ้าหน้าที่: {activityEditStats.uniqueStaff || 0} คน
                </span>
                <span className={styles.statItem}>
                  <Activity className={styles.iconSmall} />
                  ประเภทการแก้ไข: {activityEditStats.editTypes || 0} ประเภท
                </span>
                <span className={styles.statItem}>
                  <Database className={styles.iconSmall} />
                  กิจกรรมที่แก้ไข: {activityEditStats.uniqueActivities || 0} กิจกรรม
                </span>
              </div>

              {/* Search Criteria Display */}
              {searchCriteria && (
                <p className={styles.searchInfo}>
                  ค้นหาด้วย {
                    searchCriteria.type === 'activity_id' ? 'รหัสกิจกรรม' :
                      searchCriteria.type === 'activity_title' ? 'ชื่อกิจกรรม' :
                        searchCriteria.type === 'staff_code' ? 'รหัสเจ้าหน้าที่' : 'อีเมล'
                  }:
                  <span className={styles.searchValue}>{searchCriteria.value}</span>
                </p>
              )}

              {/* Active Filters Summary */}
              {hasActiveFilters && (
                <p className={styles.filterInfo}>
                  ฟิลเตอร์ที่ใช้: {getFilterSummary}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Section */}
        <div className={styles.dataEditSection}>
          {/* Filters */}
          <ActivityEditFiltersForm
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            editTypeFilter={editTypeFilter}
            setEditTypeFilter={setEditTypeFilter}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            uniqueEditTypes={uniqueEditTypes}
            filteredActivityEdits={filteredActivityEdits}
            exportToExcel={handleExport}
            resetFilters={handleResetFilters}
            hasActiveFilters={hasActiveFilters}
            setCurrentPage={setCurrentPage}
            canExport={permissions.canExportDataEditData && !exportLoading}
          />

          {/* Results Summary */}
          <div className={styles.resultsSummary}>
            <span>พบ {filteredActivityEdits.length} รายการ</span>
            {searchCriteria && (
              <span className={styles.searchSummary}>
                จากการค้นหา {
                  searchCriteria.type === 'activity_id' ? 'รหัสกิจกรรม' :
                    searchCriteria.type === 'activity_title' ? 'ชื่อกิจกรรม' :
                      searchCriteria.type === 'staff_code' ? 'รหัสเจ้าหน้าที่' : 'อีเมล'
                }: {searchCriteria.value}
              </span>
            )}
            {hasActiveFilters && !searchCriteria && (
              <span className={styles.filterSummary}>
                (มีการใช้ฟิลเตอร์)
              </span>
            )}
          </div>

          {/* Data Table */}
          <ActivityEditTable
            activityEdits={currentRows}
            onViewActivityEdit={handleViewActivityEdit}
            searchCriteria={searchCriteria}
            canViewDetails={permissions.canViewDataEditDetails}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <ActivityEditPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={rowsPerPage}
              totalItems={filteredActivityEdits.length}
              showInfo={true}
            />
          )}
        </div>

        {/* Detail Modal */}
        {permissions.canViewDataEditDetails && (
          <ActivityEditModal
            isOpen={modalOpen}
            onClose={closeModal}
            activityEdit={selectedActivityEdit}
          />
        )}

        {/* Export Loading Overlay */}
        {exportLoading && (
          <div className={styles.exportOverlay}>
            <div className={styles.exportSpinner}>
              <Loader className={styles.spinner} />
              <p>กำลังส่งออกข้อมูล...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default GetDataEditActivityAdmin;