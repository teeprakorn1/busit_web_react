import React, { useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../../NavigationBar/NavigationBar';
import styles from './AdminAllTeachers.module.css';
import { AlertCircle, Loader, Calendar, GraduationCap, Shield, ArrowLeft } from 'lucide-react';

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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

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
  } = useFilters(fetchTeachers, rowsPerPage);

  const {
    isMobile,
    sidebarOpen,
    setSidebarOpen,
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
    handleAddTeacher,
    handleShowTeacherSummary,
    handleRefreshTeachers,
    handleSearch,
    handleFilter
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

  const handleExport = useCallback(() => {
    const filterInfo = getFilterInfo();
    return handleExportToExcel(sortedTeachers, filterInfo);
  }, [getFilterInfo, handleExportToExcel, sortedTeachers]);

  // เพิ่มฟังก์ชันสำหรับ log search และ filter actions
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

  const departmentFromURL = useMemo(() => {
    const departmentIdParam = searchParams.get('departmentId');

    if (departmentIdParam && departments.length > 0) {
      const departmentId = parseInt(departmentIdParam, 10);
      if (validateId(departmentId)) {
        const selectedDepartment = departments.find(d => d.Department_ID === departmentId);
        if (selectedDepartment) {
          return {
            departmentId,
            departmentName: selectedDepartment.Department_Name,
            facultyName: selectedDepartment.Faculty_Name
          };
        }
      }
    }
    return null;
  }, [searchParams, departments, validateId]);

  const handleGoBackFromURL = useCallback(() => {
    if (departmentFromURL) {
      navigate('/name-register/department-name');
    }
  }, [departmentFromURL, navigate]);

  const teacherStats = useMemo(() => {
    const filteredTeachers = getFilteredAndSortedTeachers(teachers);
    const totalTeachers = filteredTeachers.length;
    const activeTeachers = filteredTeachers.filter(t => t.isActive).length;
    const deanCount = filteredTeachers.filter(t => t.isDean).length;
    const resignedCount = filteredTeachers.filter(t => t.isResigned).length;
    const facultyCount = departmentFromURL ? 1 : new Set(filteredTeachers.map(t => t.faculty)).size;

    return {
      total: totalTeachers,
      active: activeTeachers,
      dean: deanCount,
      resigned: resignedCount,
      faculties: facultyCount
    };
  }, [getFilteredAndSortedTeachers, teachers, departmentFromURL]);

  useEffect(() => {
    loadFacultiesAndDepartments();
  }, [loadFacultiesAndDepartments]);

  useEffect(() => {
    fetchTeachers({ includeResigned: true });
  }, [fetchTeachers]);

  useEffect(() => {
    if (departmentFromURL && departments.length > 0) {
      const { departmentName, facultyName } = departmentFromURL;

      setFacultyFilter(facultyName);
      setTimeout(() => {
        setDepartmentFilter(departmentName);
      }, 100);
    }
  }, [departmentFromURL, departments.length, setFacultyFilter, setDepartmentFilter]);

  // เพิ่ม useEffect สำหรับ log filter actions
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
    if (statusFilter) {
      handleFilterWithLogging('status', statusFilter);
    }
  }, [statusFilter, handleFilterWithLogging]);

  useEffect(() => {
    if (resignedFilter && resignedFilter !== 'all') {
      handleFilterWithLogging('resigned', resignedFilter);
    }
  }, [resignedFilter, handleFilterWithLogging]);

  useEffect(() => {
    if (deanFilter) {
      handleFilterWithLogging('dean', deanFilter);
    }
  }, [deanFilter, handleFilterWithLogging]);

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
              {departmentFromURL && (
                <button className={styles.backButton} onClick={handleGoBackFromURL}>
                  <ArrowLeft size={16} /> กลับไปหน้าสาขา
                </button>
              )}
              <button
                className={styles.retryButton}
                onClick={() => {
                  setError(null);
                  setSecurityAlert(null);
                  fetchTeachers({ includeResigned: true });
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
            {departmentFromURL && (
              <button className={styles.backButton} onClick={handleGoBackFromURL}>
                <ArrowLeft size={20} />
              </button>
            )}
            <div>
              <h1 className={styles.heading}>
                {departmentFromURL ?
                  `รายชื่ออาจารย์ - ${departmentFromURL.departmentName}` :
                  'รายชื่ออาจารย์ทั้งหมด'
                }
              </h1>
              {departmentFromURL && (
                <div className={styles.breadcrumb}>
                  <span>รายชื่อสาขา</span>
                  <span className={styles.breadcrumbSeparator}>&gt;</span>
                  <span className={styles.breadcrumbCurrent}>อาจารย์ในสาขา</span>
                </div>
              )}
              <div className={styles.summaryStats}>
                <span className={styles.statItem}>
                  <GraduationCap className={styles.iconSmall} />
                  {departmentFromURL ?
                    `ของสาขา: ${teacherStats.total} คน` :
                    `ทั้งหมด: ${teacherStats.total} คน`
                  }
                </span>
                {departmentFromURL && (
                  <span className={styles.statItem}>
                    คณะ: {departmentFromURL.facultyName}
                  </span>
                )}
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
        </div>

        <div className={styles.teachersSection}>
          <TeacherFiltersForm
            searchQuery={searchQuery}
            setSearchQuery={handleSearchWithLogging}
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
            onRefresh={handleRefreshTeachers}
            onShowSummary={() => handleShowTeacherSummary(sortedTeachers, getFilterInfo())}
          />

          <div className={styles.resultsSummary}>
            <span>พบ {sortedTeachers.length} รายการ</span>
            <span className={styles.pageInfo}>
              (แสดงหน้า {currentPage} จาก {totalPages} หน้า)
            </span>
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
            {(facultyFilter || departmentFilter || statusFilter || resignedFilter !== 'all' || deanFilter) && (
              <span className={styles.filterSummary}>
                {facultyFilter && `คณะ: ${facultyFilter} `}
                {departmentFilter && `สาขา: ${departmentFilter} `}
                {statusFilter && `สถานะ: ${statusFilter === 'active' ? 'ใช้งาน' : 'ระงับ'} `}
                {resignedFilter !== 'all' && `การลาออก: ${resignedFilter === 'active' ? 'ยังไม่ลาออก' : resignedFilter === 'resigned' ? 'ลาออกแล้ว' : 'ทั้งหมด'} `}
                {deanFilter && `ตำแหน่ง: ${deanFilter === 'dean' ? 'คณบดี' : 'อาจารย์ทั่วไป'} `}
              </span>
            )}
            {departmentFromURL && (
              <span className={styles.departmentSummary}>
                แสดงอาจารย์ของสาขา: {departmentFromURL.departmentName}
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