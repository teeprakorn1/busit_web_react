import React, { useEffect, useMemo } from 'react';
import Navbar from '../../NavigationBar/NavigationBar';
import styles from './AdminAllDepartments.module.css';
import { AlertCircle, Loader, Building, GraduationCap, Shield, BookOpen } from 'lucide-react';
import { FiBell } from 'react-icons/fi';

import DepartmentFiltersForm from './DepartmentFiltersForm/DepartmentFiltersForm';
import DepartmentTable from './DepartmentTable/DepartmentTable';
import DepartmentModal from './DepartmentModal/DepartmentModal';
import DepartmentPagination from './DepartmentPagination/DepartmentPagination';
import CustomModal from '../../../services/CustomModal/CustomModal';

import { useDepartments } from './hooks/useDepartments';
import { useFilters } from './hooks/useFilters';
import { useUIState } from './hooks/useUIState';
import { useDepartmentActions } from './hooks/useDepartmentActions';

function AdminAllDepartments() {
  const rowsPerPage = 10;
  const notifications = ["มีผู้ใช้งานเข้าร่วมกิจกรรม"];

  const {
    departments,
    faculties,
    loading,
    error,
    actionLoading,
    securityAlert,
    fetchDepartments,
    loadInitialData,
    loadPersonnelCounts,
    handleImageError,
    shouldLoadImage,
    setError,
    setSecurityAlert,
    sanitizeInput,
    validateId,
    dataLoaded
  } = useDepartments();

  const {
    searchQuery,
    setSearchQuery,
    facultyFilter,
    setFacultyFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    currentPage,
    setCurrentPage,
    sortConfig,
    getFilteredAndSortedDepartments,
    handleSort,
    resetFilters,
    getFilterInfo
  } = useFilters();

  const {
    isMobile,
    sidebarOpen,
    setSidebarOpen,
    notifyOpen,
    setNotifyOpen,
    modalOpen,
    modalMessage,
    modalButtons,
    departmentModalOpen,
    selectedDepartmentId,
    showModal,
    closeModal,
    openDepartmentModal,
    closeDepartmentModal
  } = useUIState();

  const {
    handleViewDepartment,
    handleExportToExcel
  } = useDepartmentActions({
    validateId,
    sanitizeInput,
    setSecurityAlert,
    showModal,
    closeModal,
    openDepartmentModal,
    fetchDepartments
  });

  const sortedDepartments = useMemo(() => {
    return getFilteredAndSortedDepartments(departments);
  }, [getFilteredAndSortedDepartments, departments]);

  const totalPages = Math.ceil(sortedDepartments.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = sortedDepartments.slice(indexOfFirstRow, indexOfLastRow);

  const handleExport = () => {
    const filterInfo = getFilterInfo();
    return handleExportToExcel(sortedDepartments, filterInfo);
  };

  // Count statistics
  const departmentStats = useMemo(() => {
    const totalDepartments = departments.length;
    const facultyCount = new Set(departments.map(d => d.Faculty_Name)).size;
    const teacherCount = departments.reduce((sum, dept) => sum + (dept.teacher_count || 0), 0);
    const studentCount = departments.reduce((sum, dept) => sum + (dept.student_count || 0), 0);

    return {
      total: totalDepartments,
      faculties: facultyCount,
      teachers: teacherCount,
      students: studentCount
    };
  }, [departments]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    if (dataLoaded && departments.length > 0) {
      setTimeout(() => {
        loadPersonnelCounts();
      }, 500);
    }
  }, [dataLoaded, departments.length, loadPersonnelCounts]);

  const refreshData = () => {
    setError(null);
    setSecurityAlert(null);
    loadInitialData();
  };
  
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
                onClick={refreshData}
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
              <h1 className={styles.heading}>รายชื่อสาขาทั้งหมด</h1>
              <div className={styles.summaryStats}>
                <span className={styles.statItem}>
                  <Building className={styles.iconSmall} />
                  ทั้งหมด: {departmentStats.total} สาขา
                </span>
                <span className={styles.statItem}>
                  <GraduationCap className={styles.iconSmall} />
                  นักศึกษา: {departmentStats.students} คน
                </span>
                <span className={styles.statItem}>
                  <BookOpen className={styles.iconSmall} />
                  อาจารย์: {departmentStats.teachers} คน
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
        <div className={styles.departmentsSection}>
          <DepartmentFiltersForm
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            facultyFilter={facultyFilter}
            setFacultyFilter={setFacultyFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            faculties={faculties}
            sortedDepartments={sortedDepartments}
            exportToExcel={handleExport}
            resetFilters={resetFilters}
            setCurrentPage={setCurrentPage}
          />
          <div className={styles.resultsSummary}>
            <span>พบ {sortedDepartments.length} รายการ</span>
            {sortBy && (
              <span className={styles.searchSummary}>
                เรียงตาม{sortBy === 'name' ? 'ชื่อสาขา' :
                  sortBy === 'faculty' ? 'คณะ' :
                    sortBy === 'teachers' ? 'จำนวนอาจารย์' :
                      sortBy === 'students' ? 'จำนวนนักศึกษา' : sortBy}
                ({sortOrder === 'asc' ? 'น้อยไปมาก' : 'มากไปน้อย'})
              </span>
            )}
            {facultyFilter && (
              <span className={styles.filterSummary}>
                คณะ: {facultyFilter}
              </span>
            )}
          </div>
          <DepartmentTable
            departments={currentRows}
            onViewDepartment={handleViewDepartment}
            actionLoading={actionLoading}
            sortConfig={sortConfig}
            onSort={handleSort}
            handleImageError={handleImageError}
            shouldLoadImage={shouldLoadImage}
          />
          <DepartmentPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={rowsPerPage}
            totalItems={sortedDepartments.length}
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
        <DepartmentModal
          isOpen={departmentModalOpen}
          onClose={closeDepartmentModal}
          departmentId={selectedDepartmentId}
        />

      </main>
    </div>
  );
}

export default AdminAllDepartments;