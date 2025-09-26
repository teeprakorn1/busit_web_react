import React, { useCallback, useRef, useEffect, memo } from 'react';
import { Plus, Upload, X } from 'lucide-react';
import { useUserPermissions } from '../hooks/useUserPermissions';
import styles from './StaffFiltersForm.module.css';

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

const StaffFiltersForm = memo(({
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
  sortedStaff,
  exportToExcel,
  resetFilters,
  setCurrentPage,
  onAddStaff
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

  const handleStatusChange = useCallback((e) => {
    setStatusFilter(e.target.value);
    resetToFirstPage();
  }, [setStatusFilter, resetToFirstPage]);

  const handleResignedChange = useCallback((e) => {
    setResignedFilter(e.target.value);
    resetToFirstPage();
  }, [setResignedFilter, resetToFirstPage]);

  const handleSortByChange = useCallback((e) => {
    setSortBy(e.target.value);
  }, [setSortBy]);

  const handleSortOrderChange = useCallback((e) => {
    setSortOrder(e.target.value);
  }, [setSortOrder]);

  return (
    <div className={styles.staffFilter}>
      {permissions.canAddStaff && (
        <button
          className={styles.addButton}
          onClick={onAddStaff}
        >
          <Plus className={styles.icon} />
          เพิ่มเจ้าหน้าที่
        </button>
      )}

      {permissions.canExportData && (
        <button
          className={styles.exportButton}
          onClick={exportToExcel}
          disabled={sortedStaff.length === 0}
          aria-label="ส่งออกข้อมูลเป็น Excel"
        >
          <Upload className={styles.icon} />
          Export Excel
        </button>
      )}

      {permissions.isStaff && (
        <div className={styles.permissionInfo}>
          <span>ระดับการเข้าถึง: เจ้าหน้าที่ (สิทธิ์เต็ม)</span>
        </div>
      )}

      <SearchInput
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder="ค้นหา ชื่อ, รหัส, อีเมล..."
        className={styles.staffSearch}
        ariaLabel="ค้นหาข้อมูล"
      />

      <select
        className={styles.staffSelect}
        value={sortBy}
        onChange={handleSortByChange}
        aria-label="เรียงลำดับตาม"
      >
        <option value="">เรียงลำดับตาม</option>
        <option value="name">ชื่อ-นามสกุล</option>
        <option value="code">รหัสเจ้าหน้าที่</option>
        <option value="email">อีเมล</option>
        <option value="regisTime">วันที่เพิ่มในระบบ</option>
      </select>

      {sortBy && (
        <select
          className={styles.staffSelect}
          value={sortOrder}
          onChange={handleSortOrderChange}
          aria-label="ลำดับการเรียง"
        >
          <option value="asc">น้อยไปมาก (A-Z)</option>
          <option value="desc">มากไปน้อย (Z-A)</option>
        </select>
      )}

      <select
        className={styles.staffSelect}
        value={statusFilter}
        onChange={handleStatusChange}
        aria-label="กรองตามสถานะ"
      >
        <option value="">ทุกสถานะ</option>
        <option value="active">ใช้งาน</option>
        <option value="inactive">ระงับ</option>
      </select>

      <select
        className={styles.staffSelect}
        value={resignedFilter}
        onChange={handleResignedChange}
        aria-label="กรองตามการลาออก"
      >
        <option value="all">ทั้งหมด</option>
        <option value="active">ยังไม่ลาออก</option>
        <option value="resigned">ลาออกแล้ว</option>
      </select>

      {(searchQuery || statusFilter || resignedFilter !== "all" || sortBy) && (
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

StaffFiltersForm.displayName = 'StaffFiltersForm';

export default StaffFiltersForm;