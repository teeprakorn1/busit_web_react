import React, { useEffect, useMemo } from 'react';
import Navbar from '../../NavigationBar/NavigationBar';
import styles from './AdminAllStaff.module.css';
import { AlertCircle, Loader, Calendar, Users, Shield } from 'lucide-react';
import { FiBell } from 'react-icons/fi';

import StaffFiltersForm from './StaffFiltersForm/StaffFiltersForm';
import StaffTable from './StaffTable/StaffTable';
import StaffModal from './StaffModal/StaffModal';
import StaffPagination from './StaffPagination/StaffPagination';
import CustomModal from '../../../services/CustomModal/CustomModal';

import { useStaff } from './hooks/useStaff';
import { useFilters } from './hooks/useFilters';
import { useUIState } from './hooks/useUIState';
import { useStaffActions } from './hooks/useStaffActions';

function AdminAllStaff() {
  const rowsPerPage = 10;
  const notifications = ["มีผู้ใช้งานเข้าร่วมกิจกรรม"];

  const {
    staff,
    loading,
    error,
    actionLoading,
    securityAlert,
    fetchStaff,
    toggleStaffStatus,
    handleImageError,
    shouldLoadImage,
    setError,
    setSecurityAlert,
    sanitizeInput,
    validateId
  } = useStaff();

  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    resignedFilter,
    setResignedFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    currentPage,
    setCurrentPage,
    sortConfig,
    getFilteredAndSortedStaff,
    handleSort,
    resetFilters,
    getFilterInfo
  } = useFilters(fetchStaff, rowsPerPage);

  const {
    isMobile,
    sidebarOpen,
    setSidebarOpen,
    notifyOpen,
    setNotifyOpen,
    modalOpen,
    modalMessage,
    modalButtons,
    staffModalOpen,
    selectedStaffId,
    showModal,
    closeModal,
    openStaffModal,
    closeStaffModal
  } = useUIState();

  const {
    handleViewStaff,
    handleEditStaff,
    handleToggleStatus,
    handleExportToExcel,
    handleAddStaff,
  } = useStaffActions({
    validateId,
    sanitizeInput,
    setSecurityAlert,
    showModal,
    closeModal,
    openStaffModal,
    toggleStaffStatus,
    fetchStaff
  });

  const sortedStaff = useMemo(() => {
    return getFilteredAndSortedStaff(staff);
  }, [getFilteredAndSortedStaff, staff]);

  const totalPages = Math.ceil(sortedStaff.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = sortedStaff.slice(indexOfFirstRow, indexOfLastRow);

  const handleExport = () => {
    const filterInfo = getFilterInfo();
    return handleExportToExcel(sortedStaff, filterInfo);
  };

  const staffStats = useMemo(() => {
    const filteredStaff = getFilteredAndSortedStaff(staff);
    const totalStaff = filteredStaff.length;
    const activeStaff = filteredStaff.filter(s => s.isActive).length;
    const resignedCount = filteredStaff.filter(s => s.isResigned).length;

    return {
      total: totalStaff,
      active: activeStaff,
      resigned: resignedCount
    };
  }, [getFilteredAndSortedStaff, staff]);

  useEffect(() => {
    fetchStaff({ includeResigned: true });
  }, [fetchStaff]);

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
            {securityAlert && (
              <div className={styles.securityAlert}>
                <Shield size={16} />
                <span>{securityAlert}</span>
              </div>
            )}
            <div className={styles.errorActions}>
              <button
                className={styles.retryButton}
                onClick={() => {
                  setError(null);
                  setSecurityAlert(null);
                  fetchStaff({ includeResigned: true });
                }}
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
        {securityAlert && (
          <div className={styles.securityBanner}>
            <Shield size={16} />
            <span>{securityAlert}</span>
          </div>
        )}
        <div className={styles.headerBar}>
          <div className={styles.headerLeft}>
            <div>
              <h1 className={styles.heading}>รายชื่อเจ้าหน้าที่ทั้งหมด</h1>
              <div className={styles.summaryStats}>
                <span className={styles.statItem}>
                  <Users className={styles.iconSmall} />
                  ทั้งหมด: {staffStats.total} คน
                </span>
                <span className={styles.statItem}>
                  <Calendar className={styles.iconSmall} />
                  ใช้งาน: {staffStats.active} คน
                </span>
                <span className={styles.statItem}>
                  <Shield className={styles.iconSmall} />
                  ลาออกแล้ว: {staffStats.resigned} คน
                </span>
              </div>
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
                      {sanitizeInput(n)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.staffSection}>
          <StaffFiltersForm
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            resignedFilter={resignedFilter}
            setResignedFilter={setResignedFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            sortedStaff={sortedStaff}
            exportToExcel={handleExport}
            resetFilters={resetFilters}
            setCurrentPage={setCurrentPage}
            onAddStaff={handleAddStaff}
          />

          <div className={styles.resultsSummary}>
            <span>พบ {sortedStaff.length} รายการ</span>
            <span className={styles.pageInfo}>
              (แสดงหน้า {currentPage} จาก {totalPages} หน้า)
            </span>
            {sortBy && (
              <span className={styles.searchSummary}>
                เรียงตาม{sortBy === 'name' ? 'ชื่อ-นามสกุล' :
                  sortBy === 'code' ? 'รหัสเจ้าหน้าที่' :
                    sortBy === 'email' ? 'อีเมล' :
                      sortBy === 'regisTime' ? 'วันที่เพิ่มในระบบ' : sortBy}
                ({sortOrder === 'asc' ? 'น้อยไปมาก' : 'มากไปน้อย'})
              </span>
            )}
            {(statusFilter || resignedFilter !== 'all') && (
              <span className={styles.filterSummary}>
                {statusFilter && `สถานะ: ${statusFilter === 'active' ? 'ใช้งาน' : 'ระงับ'} `}
                {resignedFilter !== 'all' && `การลาออก: ${resignedFilter === 'active' ? 'ยังไม่ลาออก' : resignedFilter === 'resigned' ? 'ลาออกแล้ว' : 'ทั้งหมด'} `}
              </span>
            )}
          </div>

          <StaffTable
            staff={currentRows}
            onViewStaff={handleViewStaff}
            onEditStaff={handleEditStaff}
            onToggleStatus={handleToggleStatus}
            actionLoading={actionLoading}
            sortConfig={sortConfig}
            onSort={handleSort}
            handleImageError={handleImageError}
            shouldLoadImage={shouldLoadImage}
          />

          <StaffPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={rowsPerPage}
            totalItems={sortedStaff.length}
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

        <StaffModal
          isOpen={staffModalOpen}
          onClose={closeStaffModal}
          staffId={selectedStaffId}
        />

      </main>
    </div>
  );
}

export default AdminAllStaff;