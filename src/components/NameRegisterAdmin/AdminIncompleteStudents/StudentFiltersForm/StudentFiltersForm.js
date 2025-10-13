import React, { useCallback, useRef, useEffect, memo } from 'react';
import { Plus, Upload, X } from 'lucide-react';
import { academicYearUtils } from '../utils/academicYearUtils';
import { useUserPermissions } from '../hooks/useUserPermissions';
import styles from './StudentFiltersForm.module.css';

const SearchInput = memo(({ value, onChange, placeholder, className, ariaLabel }) => {
  const inputRef = useRef(null);
  const selectionRef = useRef({ start: 0, end: 0 });
  const isComposingRef = useRef(false);

  const handleBeforeInput = useCallback(() => {
    if (inputRef.current && !isComposingRef.current) {
      selectionRef.current = {
        start: inputRef.current.selectionStart || 0,
        end: inputRef.current.selectionEnd || 0
      };
    }
  }, []);

  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    const input = e.target;

    if (!isComposingRef.current) {
      selectionRef.current = {
        start: input.selectionStart || 0,
        end: input.selectionEnd || 0
      };
    }

    onChange(newValue);
  }, [onChange]);

  const handleCompositionStart = useCallback(() => {
    isComposingRef.current = true;
  }, []);

  const handleCompositionEnd = useCallback(() => {
    isComposingRef.current = false;
  }, []);

  useEffect(() => {
    if (inputRef.current && document.activeElement === inputRef.current) {
      const input = inputRef.current;
      const { start, end } = selectionRef.current;

      const maxPos = value.length;
      const safeStart = Math.min(start, maxPos);
      const safeEnd = Math.min(end, maxPos);

      requestAnimationFrame(() => {
        try {
          if (input === document.activeElement) {
            input.setSelectionRange(safeStart, safeEnd);
          }
        } catch (error) {
          console.error("requestAnimationFrame error");
        }
      });
    }
  }, [value]);

  return (
    <input
      ref={inputRef}
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      onBeforeInput={handleBeforeInput}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      className={className}
      aria-label={ariaLabel}
      autoComplete="off"
      spellCheck="false"
    />
  );
});

SearchInput.displayName = 'SearchInput';

const StudentFiltersForm = memo(({
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
  showBuddhistYear,
  faculties,
  departments,
  availableAcademicYears,
  availableStudentYears,
  sortedStudents,
  exportToExcel,
  resetFilters,
  setCurrentPage,
  onAddStudent,
  onRefresh,
  onShowSummary
}) => {
  const permissions = useUserPermissions();

  const resetToFirstPage = useCallback(() => {
    if (setCurrentPage) {
      setCurrentPage(1);
    }
  }, [setCurrentPage]);

  const handleSearchChange = useCallback((newValue) => {
    setSearchQuery(newValue);
    resetToFirstPage();
  }, [setSearchQuery, resetToFirstPage]);

  const handleFacultyChange = useCallback((e) => {
    setFacultyFilter(e.target.value);
    setDepartmentFilter("");
    resetToFirstPage();
  }, [setFacultyFilter, setDepartmentFilter, resetToFirstPage]);

  const handleDepartmentChange = useCallback((e) => {
    setDepartmentFilter(e.target.value);
    resetToFirstPage();
  }, [setDepartmentFilter, resetToFirstPage]);

  const handleAcademicYearChange = useCallback((e) => {
    setAcademicYearFilter(e.target.value);
    resetToFirstPage();
  }, [setAcademicYearFilter, resetToFirstPage]);

  const handleStudentYearChange = useCallback((e) => {
    setStudentYearFilter(e.target.value);
    resetToFirstPage();
  }, [setStudentYearFilter, resetToFirstPage]);

  const handleStatusChange = useCallback((e) => {
    setStatusFilter(e.target.value);
    resetToFirstPage();
  }, [setStatusFilter, resetToFirstPage]);

  const handleActivityCompletionChange = useCallback((e) => {
    setActivityCompletionFilter(e.target.value);
    resetToFirstPage();
  }, [setActivityCompletionFilter, resetToFirstPage]);

  const handleSortByChange = useCallback((e) => {
    setSortBy(e.target.value);
  }, [setSortBy]);

  const handleSortOrderChange = useCallback((e) => {
    setSortOrder(e.target.value);
  }, [setSortOrder]);

  return (
    <div className={styles.studentsFilter}>
      {/* Action Buttons */}
      {permissions.canAddStudents && onAddStudent && (
        <button
          className={styles.addButton}
          onClick={onAddStudent}
        >
          <Plus className={styles.icon} />
          เพิ่มนักศึกษา
        </button>
      )}

      {permissions.canExportData && (
        <button
          className={styles.exportButton}
          onClick={exportToExcel}
          disabled={sortedStudents.length === 0}
          aria-label="ส่งออกข้อมูลเป็น Excel"
        >
          <Upload className={styles.icon} />
          Export Excel
        </button>
      )}

      {/* Permission Info */}
      {permissions.isTeacher && (
        <div className={styles.permissionInfo}>
          <span>
            ระดับการเข้าถึง: {permissions.isDean ? 'คณบดี' : 'อาจารย์'}
            {' '}(ดูข้อมูล/ส่งออกข้อมูล{permissions.isDean ? ' [ทั้งหมด] ' : ' [สาขาของตนเอง] '})
          </span>
        </div>
      )}

      {permissions.isStaff && (
        <div className={styles.permissionInfo}>
          <span>ระดับการเข้าถึง: เจ้าหน้าที่ (สิทธิ์เต็ม)</span>
        </div>
      )}

      {/* Search Input */}
      <SearchInput
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder="ค้นหา ชื่อ, รหัส, อีเมล, สาขา..."
        className={styles.studentsSearch}
        ariaLabel="ค้นหาข้อมูล"
      />

      {/* Sort By */}
      <select
        className={styles.studentsSelect}
        value={sortBy}
        onChange={handleSortByChange}
        aria-label="เรียงลำดับตาม"
      >
        <option value="">เรียงลำดับตาม</option>
        <option value="completedActivities">จำนวนกิจกรรม</option>
        <option value="name">ชื่อ-นามสกุล</option>
        <option value="code">รหัสนักศึกษา</option>
        <option value="academicYear">ปีการศึกษา</option>
        <option value="studentYear">ชั้นปี</option>
        <option value="department">สาขา</option>
        <option value="faculty">คณะ</option>
      </select>

      {/* Sort Order */}
      {sortBy && (
        <select
          className={styles.studentsSelect}
          value={sortOrder}
          onChange={handleSortOrderChange}
          aria-label="ลำดับการเรียง"
        >
          <option value="asc">น้อยไปมาก (A-Z)</option>
          <option value="desc">มากไปน้อย (Z-A)</option>
        </select>
      )}

      {/* Faculty Filter */}
      <select
        className={styles.studentsSelect}
        value={facultyFilter}
        onChange={handleFacultyChange}
        aria-label="กรองตามคณะ"
      >
        <option value="">ทุกคณะ</option>
        {faculties.map((faculty) => (
          <option key={faculty.Faculty_ID} value={faculty.Faculty_Name}>
            {faculty.Faculty_Name}
          </option>
        ))}
      </select>

      {/* Department Filter */}
      <select
        className={styles.studentsSelect}
        value={departmentFilter}
        onChange={handleDepartmentChange}
        aria-label="กรองตามสาขา"
      >
        <option value="">ทุกสาขา</option>
        {departments
          .filter(dept => !facultyFilter || dept.Faculty_Name === facultyFilter)
          .map((dept) => (
            <option key={dept.Department_ID} value={dept.Department_Name}>
              {dept.Department_Name}
            </option>
          ))}
      </select>

      {/* Academic Year Filter */}
      <select
        className={styles.studentsSelect}
        value={academicYearFilter}
        onChange={handleAcademicYearChange}
        aria-label="กรองตามปีการศึกษา"
      >
        <option value="">ทุกปีการศึกษา</option>
        {availableAcademicYears.map((year) => (
          <option key={year} value={year}>
            {showBuddhistYear
              ? `${academicYearUtils.convertToBuddhistYear(year)} (${year})`
              : `${year} (${academicYearUtils.convertToBuddhistYear(year)})`
            }
          </option>
        ))}
      </select>

      {/* Student Year Filter */}
      <select
        className={styles.studentsSelect}
        value={studentYearFilter}
        onChange={handleStudentYearChange}
        aria-label="กรองตามชั้นปี"
      >
        <option value="">ทุกชั้นปี</option>
        {availableStudentYears.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>

      {/* Status Filter */}
      <select
        className={styles.studentsSelect}
        value={statusFilter}
        onChange={handleStatusChange}
        aria-label="กรองตามสถานะ"
      >
        <option value="">ทุกสถานะ</option>
        <option value="active">ใช้งาน</option>
        <option value="inactive">ระงับ</option>
      </select>

      {/* Activity Completion Filter */}
      <select
        className={styles.studentsSelect}
        value={activityCompletionFilter}
        onChange={handleActivityCompletionChange}
        aria-label="กรองตามสถานะกิจกรรม"
      >
        <option value="">ทุกสถานะกิจกรรม</option>
        <option value="complete">✓ ครบ 10 กิจกรรม</option>
        <option value="incomplete">ยังไม่ครบ 10 กิจกรรม</option>
        <option value="critical">0 กิจกรรม (วิกฤต)</option>
        <option value="veryLow">1-3 กิจกรรม</option>
        <option value="low">4-6 กิจกรรม</option>
        <option value="moderate">7-9 กิจกรรม</option>
      </select>

      {/* Reset Button */}
      {(searchQuery || facultyFilter || departmentFilter || academicYearFilter ||
        studentYearFilter || statusFilter || activityCompletionFilter || sortBy) && (
          <button
            className={styles.resetButton}
            onClick={resetFilters}
            aria-label="ล้างฟิลเตอร์ทั้งหมด"
          >
            <X className={styles.iconSmall} style={{ marginRight: '5px' }} />
            ล้างฟิลเตอร์
          </button>
        )}
    </div>
  );
});

StudentFiltersForm.displayName = 'StudentFiltersForm';

export default StudentFiltersForm;