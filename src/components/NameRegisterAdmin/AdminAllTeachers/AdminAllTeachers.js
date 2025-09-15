import React, { useEffect, useMemo } from 'react';
import Navbar from '../../NavigationBar/NavigationBar';
import styles from './AdminAllTeachers.module.css';
import { AlertCircle, Loader, Calendar, GraduationCap, Shield } from 'lucide-react';
import { FiBell } from 'react-icons/fi';

import TeacherFiltersForm from './TeacherFiltersForm/TeacherFiltersForm';
import TeacherTable from './TeacherTable/TeacherTable';
import TeacherModal from './TeacherModal/TeacherModal';
import TeacherPagination from './TeacherPagination/TeacherPagination';
import CustomModal from '../../../services/CustomModal/CustomModal';

import { useTeachers } from './hooks/useTeachers';
import { useFilters } from './hooks/useFilters';
import { useUIState } from './hooks/useUIState';
import { useTeacherActions } from './hooks/useTeacherActions';

function AdminAllTeachers() {
  const rowsPerPage = 10;
  const notifications = ["มีผู้ใช้งานเข้าร่วมกิจกรรม"];

  const {
    teachers,
    faculties,
    departments,
    loading,
    error,
    actionLoading,
    securityAlert,
    fetchTeachers,
    loadFacultiesAndDepartments,
    toggleTeacherStatus,
    handleImageError,
    shouldLoadImage,
    setError,
    setSecurityAlert,
    sanitizeInput,
    validateId
  } = useTeachers();

  const {
    searchQuery,
    setSearchQuery,
    facultyFilter,
    setFacultyFilter,
    departmentFilter,
    setDepartmentFilter,
    statusFilter,
    setStatusFilter,
    resignedFilter,
    setResignedFilter,
    deanFilter,
    setDeanFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    currentPage,
    setCurrentPage,
    sortConfig,
    getFilteredAndSortedTeachers,
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
    teacherModalOpen,
    selectedTeacherId,
    showModal,
    closeModal,
    openTeacherModal,
    closeTeacherModal
  } = useUIState();

  const {
    handleViewTeacher,
    handleEditTeacher,
    handleToggleStatus,
    handleExportToExcel,
    handleAddTeacher
  } = useTeacherActions({
    validateId,
    sanitizeInput,
    setSecurityAlert,
    showModal,
    closeModal,
    openTeacherModal,
    toggleTeacherStatus,
    fetchTeachers
  });

  const sortedTeachers = useMemo(() => {
    return getFilteredAndSortedTeachers(teachers);
  }, [getFilteredAndSortedTeachers, teachers]);

  const totalPages = Math.ceil(sortedTeachers.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = sortedTeachers.slice(indexOfFirstRow, indexOfLastRow);

  const handleExport = () => {
    const filterInfo = getFilterInfo();
    return handleExportToExcel(sortedTeachers, filterInfo);
  };

  // Count statistics
  const teacherStats = useMemo(() => {
    const totalTeachers = teachers.length;
    const activeTeachers = teachers.filter(t => t.isActive).length;
    const deanCount = teachers.filter(t => t.isDean).length;
    const resignedCount = teachers.filter(t => t.isResigned).length;
    const facultyCount = new Set(teachers.map(t => t.faculty)).size;

    return {
      total: totalTeachers,
      active: activeTeachers,
      dean: deanCount,
      resigned: resignedCount,
      faculties: facultyCount
    };
  }, [teachers]);

  useEffect(() => {
    loadFacultiesAndDepartments();
  }, [loadFacultiesAndDepartments]);

  useEffect(() => {
    const params = {
      currentPage,
      rowsPerPage,
      facultyFilter,
      departmentFilter,
      searchQuery,
      includeResigned: resignedFilter === 'all' || resignedFilter === 'resigned'
    };
    fetchTeachers(params);
  }, [fetchTeachers, currentPage, facultyFilter, departmentFilter, searchQuery, resignedFilter]);
  
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
                  fetchTeachers({
                    currentPage,
                    rowsPerPage,
                    facultyFilter,
                    departmentFilter,
                    searchQuery,
                    includeResigned: resignedFilter === 'all' || resignedFilter === 'resigned'
                  });
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
              <h1 className={styles.heading}>รายชื่ออาจารย์ทั้งหมด</h1>
              <div className={styles.summaryStats}>
                <span className={styles.statItem}>
                  <GraduationCap className={styles.iconSmall} />
                  ทั้งหมด: {teacherStats.total} คน
                </span>
                <span className={styles.statItem}>
                  <Calendar className={styles.iconSmall} />
                  คณบดี: {teacherStats.dean} คน
                </span>
                <span className={styles.statItem}>
                  <Shield className={styles.iconSmall} />
                  คณะ: {teacherStats.faculties} คณะ
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
        <div className={styles.teachersSection}>
          <TeacherFiltersForm
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            facultyFilter={facultyFilter}
            setFacultyFilter={setFacultyFilter}
            departmentFilter={departmentFilter}
            setDepartmentFilter={setDepartmentFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            resignedFilter={resignedFilter}
            setResignedFilter={setResignedFilter}
            deanFilter={deanFilter}
            setDeanFilter={setDeanFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            faculties={faculties}
            departments={departments}
            sortedTeachers={sortedTeachers}
            exportToExcel={handleExport}
            resetFilters={resetFilters}
            setCurrentPage={setCurrentPage}
            onAddTeacher={handleAddTeacher}
          />
          <div className={styles.resultsSummary}>
            <span>พบ {sortedTeachers.length} รายการ</span>
            {sortBy && (
              <span className={styles.searchSummary}>
                เรียงตาม{sortBy === 'name' ? 'ชื่อ-นามสกุล' :
                  sortBy === 'code' ? 'รหัสอาจารย์' :
                    sortBy === 'email' ? 'อีเมล' :
                      sortBy === 'department' ? 'สาขา' :
                        sortBy === 'faculty' ? 'คณะ' :
                          sortBy === 'regisTime' ? 'วันที่เพิ่มในระบบ' : sortBy}
                ({sortOrder === 'asc' ? 'น้อยไปมาก' : 'มากไปน้อย'})
              </span>
            )}
            {(facultyFilter || departmentFilter || statusFilter || resignedFilter || deanFilter) && (
              <span className={styles.filterSummary}>
                {facultyFilter && `คณะ: ${facultyFilter} `}
                {departmentFilter && `สาขา: ${departmentFilter} `}
                {statusFilter && `สถานะ: ${statusFilter === 'active' ? 'ใช้งาน' : 'ระงับ'} `}
                {resignedFilter && `การลาออก: ${resignedFilter === 'active' ? 'ยังไม่ลาออก' : resignedFilter === 'resigned' ? 'ลาออกแล้ว' : 'ทั้งหมด'} `}
                {deanFilter && `ตำแหน่ง: ${deanFilter === 'dean' ? 'คณบดี' : 'อาจารย์ทั่วไป'} `}
              </span>
            )}
          </div>
          <TeacherTable
            teachers={currentRows}
            onViewTeacher={handleViewTeacher}
            onEditTeacher={handleEditTeacher}
            onToggleStatus={handleToggleStatus}
            actionLoading={actionLoading}
            sortConfig={sortConfig}
            onSort={handleSort}
            handleImageError={handleImageError}
            shouldLoadImage={shouldLoadImage}
          />
          <TeacherPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={rowsPerPage}
            totalItems={sortedTeachers.length}
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
        <TeacherModal
          isOpen={teacherModalOpen}
          onClose={closeTeacherModal}
          teacherId={selectedTeacherId}
        />

      </main>
    </div>
  );
}

export default AdminAllTeachers;