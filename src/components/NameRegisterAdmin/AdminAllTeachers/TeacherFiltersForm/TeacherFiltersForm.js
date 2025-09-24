import React, { useCallback, useRef, useEffect, memo } from 'react';
import { Plus, Upload, X } from 'lucide-react';
import { useUserPermissions } from '../hooks/useUserPermissions';
import styles from './TeacherFiltersForm.module.css';

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
          console.error("requestAnimationFrame Error");
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

const TeacherFiltersForm = memo(({
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
  faculties,
  departments,
  sortedTeachers,
  exportToExcel,
  resetFilters,
  setCurrentPage,
  onAddTeacher
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

  const handleStatusChange = useCallback((e) => {
    setStatusFilter(e.target.value);
    resetToFirstPage();
  }, [setStatusFilter, resetToFirstPage]);

  const handleResignedChange = useCallback((e) => {
    setResignedFilter(e.target.value);
    resetToFirstPage();
  }, [setResignedFilter, resetToFirstPage]);

  const handleDeanChange = useCallback((e) => {
    setDeanFilter(e.target.value);
    resetToFirstPage();
  }, [setDeanFilter, resetToFirstPage]);

  const handleSortByChange = useCallback((e) => {
    setSortBy(e.target.value);
  }, [setSortBy]);

  const handleSortOrderChange = useCallback((e) => {
    setSortOrder(e.target.value);
  }, [setSortOrder]);

  return (
    <div className={styles.teachersFilter}>
      {permissions.canAddTeachers && (
        <button
          className={styles.addButton}
          onClick={onAddTeacher}
        >
          <Plus className={styles.icon} />
          เพิ่มอาจารย์
        </button>
      )}

      {permissions.canExportData && (
        <button
          className={styles.exportButton}
          onClick={exportToExcel}
          disabled={sortedTeachers.length === 0}
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
        placeholder="ค้นหา ชื่อ, รหัส, อีเมล, สาขา, คณะ..."
        className={styles.teachersSearch}
        ariaLabel="ค้นหาข้อมูล"
      />

      <select
        className={styles.teachersSelect}
        value={sortBy}
        onChange={handleSortByChange}
        aria-label="เรียงลำดับตาม"
      >
        <option value="">เรียงลำดับตาม</option>
        <option value="name">ชื่อ-นามสกุล</option>
        <option value="code">รหัสอาจารย์</option>
        <option value="email">อีเมล</option>
        <option value="department">สาขา</option>
        <option value="faculty">คณะ</option>
        <option value="position">ตำแหน่ง</option>
        <option value="regisTime">วันที่เพิ่มในระบบ</option>
      </select>

      {sortBy && (
        <select
          className={styles.teachersSelect}
          value={sortOrder}
          onChange={handleSortOrderChange}
          aria-label="ลำดับการเรียง"
        >
          <option value="asc">น้อยไปมาก (A-Z)</option>
          <option value="desc">มากไปน้อย (Z-A)</option>
        </select>
      )}

      <select
        className={styles.teachersSelect}
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
        className={styles.teachersSelect}
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
        className={styles.teachersSelect}
        value={statusFilter}
        onChange={handleStatusChange}
        aria-label="กรองตามสถานะ"
      >
        <option value="">ทุกสถานะ</option>
        <option value="active">ใช้งาน</option>
        <option value="inactive">ระงับ</option>
      </select>

      <select
        className={styles.teachersSelect}
        value={resignedFilter}
        onChange={handleResignedChange}
        aria-label="กรองตามการลาออก"
      >
        <option value="all">ทั้งหมด</option>
        <option value="active">ยังไม่ลาออก</option>
        <option value="resigned">ลาออกแล้ว</option>
      </select>

      <select
        className={styles.teachersSelect}
        value={deanFilter}
        onChange={handleDeanChange}
        aria-label="กรองตามตำแหน่ง"
      >
        <option value="">ทุกตำแหน่ง</option>
        <option value="dean">คณบดี</option>
        <option value="regular">อาจารย์ทั่วไป</option>
      </select>

      {(searchQuery || facultyFilter || departmentFilter || statusFilter ||
        resignedFilter !== "all" || deanFilter || sortBy) && (
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

TeacherFiltersForm.displayName = 'TeacherFiltersForm';

export default TeacherFiltersForm;