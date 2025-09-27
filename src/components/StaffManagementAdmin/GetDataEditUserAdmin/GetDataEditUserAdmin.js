import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../NavigationBar/NavigationBar';
import styles from './GetDataEditUserAdmin.module.css';
import { AlertCircle, Loader, ArrowLeft, Activity, Users, Shield, Edit, Database } from 'lucide-react';

import DataEditFiltersForm from './DataEditFiltersForm/DataEditFiltersForm';
import DataEditTable from './DataEditTable/DataEditTable';
import DataEditModal from './DataEditModal/DataEditModal';
import DataEditPagination from './DataEditPagination/DataEditPagination';

import { useDataEdits } from './hooks/useDataEdits';
import { useDataEditFilters } from './hooks/useDataEditFilters';
import { useDataEditActions } from './hooks/useDataEditActions';
import { useUIState } from './hooks/useUIState';
import { useUserPermissions } from './hooks/useUserPermissions';

function GetDataEditUserAdmin() {
  const navigate = useNavigate();
  const permissions = useUserPermissions();
  const rowsPerPage = 10;

  const {
    dataEdits,
    dataEditStats,
    searchCriteria,
    isPersonSearch,
    loading,
    error,
    fetchDataEdits,
    goBackToPersonSearch
  } = useDataEdits();

  const {
    searchQuery,
    setSearchQuery,
    editTypeFilter,
    setEditTypeFilter,
    sourceTableFilter,
    setSourceTableFilter,
    dateFilter,
    setDateFilter,
    currentPage,
    setCurrentPage,
    hasActiveFilters,
    getFilteredDataEdits,
    getUniqueEditTypes,
    getUniqueSourceTables,
    resetFilters,
    setSearchFromCriteria,
    getFilterSummary
  } = useDataEditFilters();

  const { exportToExcel } = useDataEditActions();

  const { isMobile, sidebarOpen, setSidebarOpen } = useUIState();

  const [selectedDataEdit, setSelectedDataEdit] = useState(null);
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

  const filteredDataEdits = useMemo(() => {
    return getFilteredDataEdits(dataEdits);
  }, [getFilteredDataEdits, dataEdits]);

  const uniqueEditTypes = useMemo(() => {
    return getUniqueEditTypes(dataEdits);
  }, [getUniqueEditTypes, dataEdits]);

  const uniqueSourceTables = useMemo(() => {
    return getUniqueSourceTables(dataEdits);
  }, [getUniqueSourceTables, dataEdits]);

  const totalPages = Math.ceil(filteredDataEdits.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredDataEdits.slice(indexOfFirstRow, indexOfLastRow);

  const handleViewDataEdit = (dataEdit) => {
    if (!permissions.canViewDataEditDetails) {
      return;
    }
    setSelectedDataEdit(dataEdit);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedDataEdit(null);
  };

  const handleExport = async () => {
    if (!permissions.canExportDataEditData || filteredDataEdits.length === 0) {
      return;
    }

    try {
      setExportLoading(true);
      const result = exportToExcel(filteredDataEdits, searchCriteria);

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
    setSourceTableFilter('');
    setDateFilter(null);
    setCurrentPage(1);

    if (typeof resetFilters === 'function') {
      resetFilters();
    }
  };

  const handleRefresh = () => {
    fetchDataEdits();
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
          <p>คุณไม่มีสิทธิ์ในการเข้าถึงประวัติการแก้ไขบัญชี เฉพาะเจ้าหน้าที่เท่านั้นที่สามารถดูข้อมูลนี้ได้</p>
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
                {isPersonSearch ? 'ผลการค้นหาประวัติการแก้ไขบัญชี' : 'ประวัติการแก้ไขบัญชี'}
              </h1>

              {/* Summary Statistics */}
              <div className={styles.summaryStats}>
                <span className={styles.statItem}>
                  <Edit className={styles.iconSmall} />
                  ทั้งหมด: {dataEditStats.total || 0} รายการ
                </span>
                <span className={styles.statItem}>
                  <Users className={styles.iconSmall} />
                  เจ้าหน้าที่: {dataEditStats.uniqueStaff || 0} คน
                </span>
                <span className={styles.statItem}>
                  <Activity className={styles.iconSmall} />
                  ประเภทการแก้ไข: {dataEditStats.editTypes || 0} ประเภท
                </span>
                {dataEditStats.sourceTableStats && Object.keys(dataEditStats.sourceTableStats).length > 0 && (
                  <span className={styles.statItem}>
                    <Database className={styles.iconSmall} />
                    ตารางที่มา: {Object.keys(dataEditStats.sourceTableStats).length} ตาราง
                  </span>
                )}
              </div>

              {/* Search Criteria Display */}
              {searchCriteria && (
                <p className={styles.searchInfo}>
                  ค้นหาด้วย {
                    searchCriteria.type === 'email' ? 'อีเมล' :
                      searchCriteria.type === 'staff_code' ? 'รหัสเจ้าหน้าที่' : 'IP Address'
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
          <DataEditFiltersForm
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            editTypeFilter={editTypeFilter}
            setEditTypeFilter={setEditTypeFilter}
            sourceTableFilter={sourceTableFilter}
            setSourceTableFilter={setSourceTableFilter}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            uniqueEditTypes={uniqueEditTypes}
            uniqueSourceTables={uniqueSourceTables}
            filteredDataEdits={filteredDataEdits}
            exportToExcel={handleExport}
            resetFilters={handleResetFilters}
            hasActiveFilters={hasActiveFilters}
            setCurrentPage={setCurrentPage}
            canExport={permissions.canExportDataEditData && !exportLoading}
          />

          {/* Results Summary */}
          <div className={styles.resultsSummary}>
            <span>พบ {filteredDataEdits.length} รายการ</span>
            {searchCriteria && (
              <span className={styles.searchSummary}>
                จากการค้นหา {
                  searchCriteria.type === 'email' ? 'อีเมล' :
                    searchCriteria.type === 'staff_code' ? 'รหัสเจ้าหน้าที่' : 'IP'
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
          <DataEditTable
            dataEdits={currentRows}
            onViewDataEdit={handleViewDataEdit}
            searchCriteria={searchCriteria}
            canViewDetails={permissions.canViewDataEditDetails}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <DataEditPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={rowsPerPage}
              totalItems={filteredDataEdits.length}
              showInfo={true}
            />
          )}
        </div>

        {/* Detail Modal */}
        {permissions.canViewDataEditDetails && (
          <DataEditModal
            isOpen={modalOpen}
            onClose={closeModal}
            dataEdit={selectedDataEdit}
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

export default GetDataEditUserAdmin;