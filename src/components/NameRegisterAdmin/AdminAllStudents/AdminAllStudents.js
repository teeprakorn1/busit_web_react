import React, { useEffect, useMemo } from 'react';
import Navbar from '../../NavigationBar/NavigationBar';
import styles from './AdminAllStudents.module.css';
import { AlertCircle, Loader, Calendar, GraduationCap, Shield } from 'lucide-react';
import { FiBell } from 'react-icons/fi';

// Components
import StudentFiltersForm from './StudentFiltersForm/StudentFiltersForm';
import StudentTable from './StudentTable/StudentTable';
import StudentModal from './StudentModal/StudentModal';
import StudentPagination from './StudentPagination/StudentPagination';
import CustomModal from '../../../services/CustomModal/CustomModal';

// Custom Hooks
import { useStudents } from './hooks/useStudents';
import { useFilters } from './hooks/useFilters';
import { useUIState } from './hooks/useUIState';
import { useStudentActions } from './hooks/useStudentActions';

function AdminAllStudents() {
  const rowsPerPage = 10;
  const notifications = ["มีผู้ใช้งานเข้าร่วมกิจกรรม"];

  // Custom hooks
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
    toggleStudentStatus,
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
    yearRangeFilter,
    setYearRangeFilter,
    studentYearFilter,
    setStudentYearFilter,
    statusFilter,
    setStatusFilter,
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
  } = useFilters();

  const {
    isMobile,
    sidebarOpen,
    setSidebarOpen,
    notifyOpen,
    setNotifyOpen,
    showBuddhistYear,
    setShowBuddhistYear,
    modalOpen,
    modalMessage,
    modalButtons,
    studentModalOpen,
    selectedStudentId, // เปลี่ยนจาก selectedStudent เป็น selectedStudentId
    showModal,
    closeModal,
    openStudentModal,
    closeStudentModal
  } = useUIState();

  const {
    handleViewStudent,
    handleEditStudent,
    handleToggleStatus,
    handleExportToExcel,
    handleAddStudent
  } = useStudentActions({
    validateId,
    sanitizeInput,
    setSecurityAlert,
    showModal,
    closeModal,
    openStudentModal,
    toggleStudentStatus,
    fetchStudents
  });

  // Get filtered and sorted students
  const sortedStudents = useMemo(() => {
    return getFilteredAndSortedStudents(students);
  }, [getFilteredAndSortedStudents, students]);

  // Pagination
  const totalPages = Math.ceil(sortedStudents.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = sortedStudents.slice(indexOfFirstRow, indexOfLastRow);

  // Handle export with filter info
  const handleExport = () => {
    const filterInfo = getFilterInfo();
    return handleExportToExcel(sortedStudents, filterInfo);
  };

  // Effects
  useEffect(() => {
    loadFacultiesAndDepartments();
  }, [loadFacultiesAndDepartments]);

  useEffect(() => {
    const params = {
      currentPage,
      rowsPerPage,
      facultyFilter,
      departmentFilter,
      academicYearFilter,
      searchQuery
    };
    fetchStudents(params);
  }, [fetchStudents, currentPage, facultyFilter, departmentFilter, academicYearFilter, searchQuery]);

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
                  fetchStudents({
                    currentPage,
                    rowsPerPage,
                    facultyFilter,
                    departmentFilter,
                    academicYearFilter,
                    searchQuery
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
        {/* Security Alert */}
        {securityAlert && (
          <div className={styles.securityBanner}>
            <Shield size={16} />
            <span>{securityAlert}</span>
          </div>
        )}

        {/* Header */}
        <div className={styles.headerBar}>
          <div className={styles.headerLeft}>
            <div>
              <h1 className={styles.heading}>รายชื่อนักศึกษาทั้งหมด</h1>
              <div className={styles.summaryStats}>
                <span className={styles.statItem}>
                  <GraduationCap className={styles.iconSmall} />
                  ทั้งหมด: {students.length} คน
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

        {/* Filters and Table Section */}
        <div className={styles.studentsSection}>
          <StudentFiltersForm
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            facultyFilter={facultyFilter}
            setFacultyFilter={setFacultyFilter}
            departmentFilter={departmentFilter}
            setDepartmentFilter={setDepartmentFilter}
            academicYearFilter={academicYearFilter}
            setAcademicYearFilter={setAcademicYearFilter}
            yearRangeFilter={yearRangeFilter}
            setYearRangeFilter={setYearRangeFilter}
            studentYearFilter={studentYearFilter}
            setStudentYearFilter={setStudentYearFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
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
          />

          {/* Results Summary */}
          <div className={styles.resultsSummary}>
            <span>พบ {sortedStudents.length} รายการ</span>
            {sortBy && (
              <span className={styles.searchSummary}>
                เรียงตาม{sortBy === 'name' ? 'ชื่อ-นามสกุล' :
                  sortBy === 'code' ? 'รหัสนักศึกษา' :
                    sortBy === 'email' ? 'อีเมล' :
                      sortBy === 'academicYear' ? 'ปีการศึกษา' :
                        sortBy === 'studentYear' ? 'ชั้นปี' :
                          sortBy === 'department' ? 'สาขา' :
                            sortBy === 'faculty' ? 'คณะ' :
                              sortBy === 'regisTime' ? 'วันที่เพิ่มในระบบ' : sortBy}
                ({sortOrder === 'asc' ? 'น้อยไปมาก' : 'มากไปน้อย'})
              </span>
            )}
            {(academicYearFilter || studentYearFilter || yearRangeFilter) && (
              <span className={styles.filterSummary}>
                {academicYearFilter && `ปีการศึกษา: ${academicYearFilter} `}
                {studentYearFilter && `ชั้นปี: ${studentYearFilter} `}
                {yearRangeFilter && `ช่วง: ${yearRangeFilter === 'current' ? 'ปีปัจจุบัน' :
                  yearRangeFilter === 'recent' ? '3 ปีล่าสุด' :
                    yearRangeFilter === 'old' ? 'มากกว่า 3 ปี' :
                      yearRangeFilter === 'graduated_eligible' ? 'ควรจบแล้ว' : ''
                  }`}
              </span>
            )}
          </div>

          {/* Students Table */}
          <StudentTable
            students={currentRows}
            showBuddhistYear={showBuddhistYear}
            onViewStudent={handleViewStudent}
            onEditStudent={handleEditStudent}
            onToggleStatus={handleToggleStatus}
            actionLoading={actionLoading}
            sortConfig={sortConfig}
            onSort={handleSort}
          />

          {/* Pagination */}
          <StudentPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={rowsPerPage}
            totalItems={sortedStudents.length}
          />
        </div>

        {/* Action Loading Overlay */}
        {actionLoading && (
          <div className={styles.actionOverlay}>
            <div className={styles.actionSpinner}>
              <div className={styles.spinner}></div>
              <p>กำลังดำเนินการ...</p>
            </div>
          </div>
        )}

        {/* Custom Modal */}
        <CustomModal
          isOpen={modalOpen}
          message={modalMessage}
          onClose={closeModal}
          buttons={modalButtons}
        />

        {/* Student Detail Modal - เปลี่ยนจาก student prop เป็น studentId prop */}
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

export default AdminAllStudents;