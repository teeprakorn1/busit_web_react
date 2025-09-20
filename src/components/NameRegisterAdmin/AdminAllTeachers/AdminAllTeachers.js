import React, { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../../NavigationBar/NavigationBar';
import styles from './AdminAllTeachers.module.css';
import { AlertCircle, Loader, Calendar, GraduationCap, Shield, ArrowLeft } from 'lucide-react';
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

  const [searchParams] = useSearchParams();

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

  // แก้ไข: เพิ่ม fetchTeachers และ rowsPerPage เป็น parameters
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
    handleAddTeacher,
    handleGoBack
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

  // แก้ไข: กลับมาใช้ client-side pagination
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

  const teacherStats = useMemo(() => {
    const totalTeachers = teachers.length;
    const activeTeachers = teachers.filter(t => t.isActive).length;
    const deanCount = teachers.filter(t => t.isDean).length;
    const resignedCount = teachers.filter(t => t.isResigned).length;
    const facultyCount = departmentFromURL ? 1 : new Set(teachers.map(t => t.faculty)).size;

    return {
      total: totalTeachers,
      active: activeTeachers,
      dean: deanCount,
      resigned: resignedCount,
      faculties: facultyCount
    };
  }, [teachers, departmentFromURL]);

  useEffect(() => {
    loadFacultiesAndDepartments();
  }, [loadFacultiesAndDepartments]);

  useEffect(() => {
    if (departmentFromURL && departments.length > 0) {
      const { departmentName, facultyName } = departmentFromURL;

      setFacultyFilter(facultyName);
      setTimeout(() => {
        setDepartmentFilter(departmentName);
      }, 100);
    }
  }, [departmentFromURL, departments.length, setFacultyFilter, setDepartmentFilter]);

  useEffect(() => {
    const params = {
      facultyFilter,
      departmentFilter,
      searchQuery,
      includeResigned: resignedFilter === 'all' || resignedFilter === 'resigned'
    };
    fetchTeachers(params);
  }, [fetchTeachers, facultyFilter, departmentFilter, searchQuery, resignedFilter]);

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
                <button className={styles.backButton} onClick={handleGoBack}>
                  <ArrowLeft size={16} /> กลับไปหน้าสาขา
                </button>
              )}
              <button
                className={styles.retryButton}
                onClick={() => {
                  setError(null);
                  setSecurityAlert(null);
                  fetchTeachers({
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
            {departmentFromURL && (
              <button className={styles.backButton} onClick={handleGoBack}>
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
            {(facultyFilter || departmentFilter || statusFilter || resignedFilter || deanFilter) && (
              <span className={styles.filterSummary}>
                {facultyFilter && `คณะ: ${facultyFilter} `}
                {departmentFilter && `สาขา: ${departmentFilter} `}
                {statusFilter && `สถานะ: ${statusFilter === 'active' ? 'ใช้งาน' : 'ระงับ'} `}
                {resignedFilter && `การลาออก: ${resignedFilter === 'active' ? 'ยังไม่ลาออก' : resignedFilter === 'resigned' ? 'ลาออกแล้ว' : 'ทั้งหมด'} `}
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