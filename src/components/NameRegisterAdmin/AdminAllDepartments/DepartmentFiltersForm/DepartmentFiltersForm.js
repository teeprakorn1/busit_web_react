import React from 'react';
import { Upload, X } from 'lucide-react';
import { useUserPermissions } from '../hooks/useUserPermissions';
import styles from './DepartmentFiltersForm.module.css';

const DepartmentFiltersForm = ({
  searchQuery,
  setSearchQuery,
  facultyFilter,
  setFacultyFilter,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  faculties,
  sortedDepartments,
  exportToExcel,
  resetFilters,
  setCurrentPage
}) => {
  const permissions = useUserPermissions();

  return (
    <div className={styles.departmentFilter}>
      {permissions.canExportData && (
        <button
          className={styles.exportButton}
          onClick={exportToExcel}
          disabled={sortedDepartments.length === 0}
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
          <span>ระดับการเข้าถึง: เจ้าหน้าที่ (ดูข้อมูล/ส่งออกข้อมูล)</span>
        </div>
      )}

      <input
        type="text"
        placeholder="ค้นหา ชื่อสาขา, คณะ..."
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setCurrentPage(1);
        }}
        className={styles.departmentSearch}
        aria-label="ค้นหาข้อมูล"
      />

      <select
        className={styles.departmentSelect}
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        aria-label="เรียงลำดับตาม"
      >
        <option value="">เรียงลำดับตาม</option>
        <option value="name">ชื่อสาขา</option>
        <option value="faculty">คณะ</option>
        <option value="teachers">จำนวนอาจารย์</option>
        <option value="students">จำนวนนักศึกษา</option>
      </select>

      {sortBy && (
        <select
          className={styles.departmentSelect}
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          aria-label="ลำดับการเรียง"
        >
          <option value="asc">น้อยไปมาก (A-Z)</option>
          <option value="desc">มากไปน้อย (Z-A)</option>
        </select>
      )}

      <select
        className={styles.departmentSelect}
        value={facultyFilter}
        onChange={(e) => {
          setFacultyFilter(e.target.value);
          setCurrentPage(1);
        }}
        aria-label="กรองตามคณะ"
      >
        <option value="">ทุกคณะ</option>
        {faculties.map((faculty) => (
          <option key={faculty.Faculty_ID} value={faculty.Faculty_Name}>
            {faculty.Faculty_Name}
          </option>
        ))}
      </select>

      {(searchQuery || facultyFilter || sortBy) && (
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
};

export default DepartmentFiltersForm;