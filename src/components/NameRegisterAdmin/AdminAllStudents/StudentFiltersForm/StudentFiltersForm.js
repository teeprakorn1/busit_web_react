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
  showBuddhistYear,
  faculties,
  departments,
  availableAcademicYears,
  availableStudentYears,
  sortedStudents,
  exportToExcel,
  resetFilters,
  setCurrentPage,
  onAddStudent
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

  const handleYearRangeChange = useCallback((e) => {
    setYearRangeFilter(e.target.value);
    resetToFirstPage();
  }, [setYearRangeFilter, resetToFirstPage]);

  const handleStudentYearChange = useCallback((e) => {
    setStudentYearFilter(e.target.value);
    resetToFirstPage();
  }, [setStudentYearFilter, resetToFirstPage]);

  const handleStatusChange = useCallback((e) => {
    setStatusFilter(e.target.value);
    resetToFirstPage();
  }, [setStatusFilter, resetToFirstPage]);

  const handleSortByChange = useCallback((e) => {
    setSortBy(e.target.value);
  }, [setSortBy]);

  const handleSortOrderChange = useCallback((e) => {
    setSortOrder(e.target.value);
  }, [setSortOrder]);

  return (
    <div className={styles.studentsFilter}>
      {permissions.canAddStudents && (
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

      {permissions.isTeacher && (
        <div className={styles.permissionInfo}>
          <span>ระดับการเข้าถึง: ครู (ดูข้อมูล/ส่งออกข้อมูล)</span>
        </div>
      )}

      {permissions.isStaff && (
        <div className={styles.permissionInfo}>
          <span>ระดับการเข้าถึง: เจ้าหน้าที่ (สิทธิ์เต็ม)</span>
        </div>
      )}

      <SearchInput
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder="ค้นหา ชื่อ, รหัส, อีเมล, สาขา, ปีการศึกษา, ชั้นปี..."
        className={styles.studentsSearch}
        ariaLabel="ค้นหาข้อมูล"
      />

      <select
        className={styles.studentsSelect}
        value={sortBy}
        onChange={handleSortByChange}
        aria-label="เรียงลำดับตาม"
      >
        <option value="">เรียงลำดับตาม</option>
        <option value="name">ชื่อ-นามสกุล</option>
        <option value="code">รหัสนักศึกษา</option>
        <option value="email">อีเมล</option>
        <option value="academicYear">ปีการศึกษา</option>
        <option value="studentYear">ชั้นปี</option>
        <option value="department">สาขา</option>
        <option value="faculty">คณะ</option>
        <option value="regisTime">วันที่เพิ่มในระบบ</option>
      </select>

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

      <select
        className={styles.studentsSelect}
        value={yearRangeFilter}
        onChange={handleYearRangeChange}
        aria-label="กรองตามช่วงปี"
      >
        <option value="">ทุกช่วงปี</option>
        <option value="current">ปีปัจจุบัน</option>
        <option value="recent">3 ปีล่าสุด</option>
        <option value="old">มากกว่า 3 ปี</option>
        <option value="graduated_eligible">ควรจบแล้ว (4+ ปี)</option>
      </select>

      <select
        className={styles.studentsSelect}
        value={statusFilter}
        onChange={handleStatusChange}
        aria-label="กรองตามสถานะ"
      >
        <option value="">ทุกสถานะ</option>
        <option value="active">ใช้งาน</option>
        <option value="inactive">ระงับ</option>
        <option value="graduated">สำเร็จการศึกษา</option>
        <option value="not_graduated">ยังไม่สำเร็จการศึกษา</option>
      </select>

      {(searchQuery || facultyFilter || departmentFilter || academicYearFilter ||
        studentYearFilter || yearRangeFilter || statusFilter || sortBy) && (
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