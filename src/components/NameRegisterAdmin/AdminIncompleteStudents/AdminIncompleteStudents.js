import React, { useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../NavigationBar/NavigationBar';
import styles from './AdminIncompleteStudents.module.css';
import { AlertCircle, Loader, Calendar, GraduationCap, Shield, ArrowLeft, AlertTriangle } from 'lucide-react';

import StudentFiltersForm from './StudentFiltersForm/StudentFiltersForm';
import StudentTable from './StudentTable/StudentTable';
import StudentModal from './StudentModal/StudentModal';
import StudentPagination from './StudentPagination/StudentPagination';
import CustomModal from '../../../services/CustomModal/CustomModal';

import { useStudents } from './hooks/useStudents';
import { useFilters } from './hooks/useFilters';
import { useUIState } from './hooks/useUIState';
import { useStudentActions } from './hooks/useStudentActions';

function AdminIncompleteStudents() {
  const rowsPerPage = 10;
  const navigate = useNavigate();

  const {
    students,
    faculties,
    departments,
    availableAcademicYears,
    availableStudentYears,
    loading,
    error,
    actionLoading,
    securityAlert,
    fetchStudents,
    loadFacultiesAndDepartments,
    handleImageError,
    shouldLoadImage,
    setError,
    setSecurityAlert,
    sanitizeInput,
    validateId
  } = useStudents();

  const {
    searchQuery,
    setSearchQuery,
    facultyFilter,
    setFacultyFilter,
    departmentFilter,
    setDepartmentFilter,
    academicYearFilter,
    setAcademicYearFilter,
    studentYearFilter,
    setStudentYearFilter,
    statusFilter,
    setStatusFilter,
    activityCompletionFilter,
    setActivityCompletionFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    currentPage,
    setCurrentPage,
    sortConfig,
    getFilteredAndSortedStudents,
    handleSort,
    resetFilters,
    getFilterInfo
  } = useFilters(fetchStudents, rowsPerPage);

  const {
    isMobile,
    sidebarOpen,
    setSidebarOpen,
    showBuddhistYear,
    setShowBuddhistYear,
    modalOpen,
    modalMessage,
    modalButtons,
    studentModalOpen,
    selectedStudentId,
    showModal,
    closeModal,
    openStudentModal,
    closeStudentModal
  } = useUIState();

  const {
    handleViewStudent,
    handleEditStudent,
    handleExportToExcel,
    handleAddStudent,
    handleShowStudentSummary,
    handleRefreshStudents,
    handleSearch,
    handleFilter
  } = useStudentActions({
    validateId,
    sanitizeInput,
    setSecurityAlert,
    showModal,
    closeModal,
    openStudentModal,
    fetchStudents
  });

  const sortedStudents = useMemo(() => {
    return getFilteredAndSortedStudents(students);
  }, [getFilteredAndSortedStudents, students]);

  const totalPages = Math.ceil(sortedStudents.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = sortedStudents.slice(indexOfFirstRow, indexOfLastRow);

  const handleExport = useCallback(() => {
    const filterInfo = getFilterInfo();
    return handleExportToExcel(sortedStudents, filterInfo);
  }, [getFilterInfo, handleExportToExcel, sortedStudents]);

  const handleSearchWithLogging = useCallback(async (query) => {
    setSearchQuery(query);
    if (query && query.length > 0) {
      await handleSearch({ searchQuery: query });
    }
  }, [setSearchQuery, handleSearch]);

  const handleFilterWithLogging = useCallback(async (filterType, value) => {
    if (value) {
      const filterCriteria = { [filterType]: value };
      await handleFilter(filterCriteria);
    }
  }, [handleFilter]);

  const studentStats = useMemo(() => {
    const filteredStudents = getFilteredAndSortedStudents(students);
    const totalStudents = filteredStudents.length;
    const criticalStudents = filteredStudents.filter(s => (s.completedActivities || 0) === 0).length;
    const completeStudents = filteredStudents.filter(s => (s.completedActivities || 0) >= 10).length;
    const incompleteStudents = filteredStudents.filter(s => (s.completedActivities || 0) < 10).length;

    return {
      total: totalStudents,
      critical: criticalStudents,
      complete: completeStudents,
      incomplete: incompleteStudents
    };
  }, [getFilteredAndSortedStudents, students]);

  useEffect(() => {
    loadFacultiesAndDepartments();
  }, [loadFacultiesAndDepartments]);

  useEffect(() => {
    fetchStudents({ includeGraduated: false });
  }, [fetchStudents]);

  useEffect(() => {
    if (facultyFilter) {
      handleFilterWithLogging('faculty', facultyFilter);
    }
  }, [facultyFilter, handleFilterWithLogging]);

  useEffect(() => {
    if (departmentFilter) {
      handleFilterWithLogging('department', departmentFilter);
    }
  }, [departmentFilter, handleFilterWithLogging]);

  useEffect(() => {
    if (academicYearFilter) {
      handleFilterWithLogging('academicYear', academicYearFilter);
    }
  }, [academicYearFilter, handleFilterWithLogging]);

  useEffect(() => {
    if (statusFilter) {
      handleFilterWithLogging('status', statusFilter);
    }
  }, [statusFilter, handleFilterWithLogging]);

  useEffect(() => {
    if (activityCompletionFilter) {
      handleFilterWithLogging('activityCompletion', activityCompletionFilter);
    }
  }, [activityCompletionFilter, handleFilterWithLogging]);

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
                  fetchStudents({ includeGraduated: false });
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
            <button
              className={styles.backButton}
              onClick={() => navigate('/name-register')}
              title="กลับไปหน้าหลัก"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className={styles.heading}>
                นักศึกษาที่กิจกรรมไม่ครบ
              </h1>
              <div className={styles.breadcrumb}>
                <span>รายชื่อนักศึกษา</span>
                <span className={styles.breadcrumbSeparator}>&gt;</span>
                <span className={styles.breadcrumbCurrent}>กิจกรรมไม่ครบ</span>
              </div>
              <div className={styles.summaryStats}>
                <span className={styles.statItem}>
                  <GraduationCap className={styles.iconSmall} />
                  ทั้งหมด: {studentStats.total} คน
                </span>
                <span className={styles.statItem}>
                  <AlertTriangle className={styles.iconSmall} />
                  ยังไม่ครบ: {studentStats.incomplete} คน
                </span>
                <span className={styles.statItem}>
                  <Calendar className={styles.iconSmall} />
                  ปีการศึกษา: {availableAcademicYears.length} ปี
                </span>
              </div>
            </div>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.yearToggle}>
              <button
                className={`${styles.toggleBtn} ${showBuddhistYear ? styles.active : ''}`}
                onClick={() => setShowBuddhistYear(true)}
                title="แสดงปี พ.ศ."
              >
                พ.ศ.
              </button>
              <button
                className={`${styles.toggleBtn} ${!showBuddhistYear ? styles.active : ''}`}
                onClick={() => setShowBuddhistYear(false)}
                title="แสดงปี ค.ศ."
              >
                ค.ศ.
              </button>
            </div>
          </div>
        </div>

        <div className={styles.studentsSection}>
          <StudentFiltersForm
            searchQuery={searchQuery}
            setSearchQuery={handleSearchWithLogging}
            facultyFilter={facultyFilter}
            setFacultyFilter={setFacultyFilter}
            departmentFilter={departmentFilter}
            setDepartmentFilter={setDepartmentFilter}
            academicYearFilter={academicYearFilter}
            setAcademicYearFilter={setAcademicYearFilter}
            studentYearFilter={studentYearFilter}
            setStudentYearFilter={setStudentYearFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            activityCompletionFilter={activityCompletionFilter}
            setActivityCompletionFilter={setActivityCompletionFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            showBuddhistYear={showBuddhistYear}
            faculties={faculties}
            departments={departments}
            availableAcademicYears={availableAcademicYears}
            availableStudentYears={availableStudentYears}
            sortedStudents={sortedStudents}
            exportToExcel={handleExport}
            resetFilters={resetFilters}
            setCurrentPage={setCurrentPage}
            onAddStudent={handleAddStudent}
            onRefresh={handleRefreshStudents}
            onShowSummary={() => handleShowStudentSummary(sortedStudents, getFilterInfo())}
          />
          <div className={styles.resultsSummary}>
            <span>พบ {sortedStudents.length} รายการ</span>
            <span className={styles.pageInfo}>
              (แสดงหน้า {currentPage} จาก {totalPages} หน้า)
            </span>
            {sortBy && (
              <span className={styles.searchSummary}>
                เรียงตาม{sortBy === 'name' ? 'ชื่อ-นามสกุล' :
                  sortBy === 'code' ? 'รหัสนักศึกษา' :
                    sortBy === 'completedActivities' ? 'จำนวนกิจกรรม' :
                      sortBy === 'academicYear' ? 'ปีการศึกษา' :
                        sortBy === 'studentYear' ? 'ชั้นปี' :
                          sortBy === 'department' ? 'สาขา' :
                            sortBy === 'faculty' ? 'คณะ' : sortBy}
                ({sortOrder === 'asc' ? 'น้อยไปมาก' : 'มากไปน้อย'})
              </span>
            )}
            {(academicYearFilter || studentYearFilter || statusFilter || activityCompletionFilter || facultyFilter || departmentFilter) && (
              <span className={styles.filterSummary}>
                {facultyFilter && `คณะ: ${facultyFilter} `}
                {departmentFilter && `สาขา: ${departmentFilter} `}
                {academicYearFilter && `ปีการศึกษา: ${academicYearFilter} `}
                {studentYearFilter && `ชั้นปี: ${studentYearFilter} `}
                {statusFilter && `สถานะ: ${statusFilter === 'active' ? 'ใช้งาน' : statusFilter === 'inactive' ? 'ระงับ' : statusFilter} `}
                {activityCompletionFilter && `กิจกรรม: ${activityCompletionFilter === 'complete' ? 'ครบ 10' :
                  activityCompletionFilter === 'incomplete' ? 'ยังไม่ครบ 10' :
                    activityCompletionFilter === 'critical' ? '0 กิจกรรม' :
                      activityCompletionFilter === 'veryLow' ? '1-3 กิจกรรม' :
                        activityCompletionFilter === 'low' ? '4-6 กิจกรรม' :
                          activityCompletionFilter === 'moderate' ? '7-9 กิจกรรม' : activityCompletionFilter
                  } `}
              </span>
            )}
          </div>
          <StudentTable
            students={currentRows}
            showBuddhistYear={showBuddhistYear}
            onViewStudent={handleViewStudent}
            onEditStudent={handleEditStudent}
            actionLoading={actionLoading}
            sortConfig={sortConfig}
            onSort={handleSort}
            handleImageError={handleImageError}
            shouldLoadImage={shouldLoadImage}
          />
          <StudentPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={rowsPerPage}
            totalItems={sortedStudents.length}
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
        <StudentModal
          isOpen={studentModalOpen}
          onClose={closeStudentModal}
          studentId={selectedStudentId}
          showBuddhistYear={showBuddhistYear}
        />
      </main>
    </div>
  );
}

export default AdminIncompleteStudents;