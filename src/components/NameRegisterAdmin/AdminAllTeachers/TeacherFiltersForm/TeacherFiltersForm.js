import React from 'react';
import { Plus, Upload, X } from 'lucide-react';
import { useUserPermissions } from '../hooks/useUserPermissions';
import styles from './TeacherFiltersForm.module.css';

const TeacherFiltersForm = ({
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
      <input
        type="text"
        placeholder="ค้นหา ชื่อ, รหัส, อีเมล, สาขา, คณะ..."
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setCurrentPage(1);
        }}
        className={styles.teachersSearch}
        aria-label="ค้นหาข้อมูล"
      />
      <select
        className={styles.teachersSelect}
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
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
          onChange={(e) => setSortOrder(e.target.value)}
          aria-label="ลำดับการเรียง"
        >
          <option value="asc">น้อยไปมาก (A-Z)</option>
          <option value="desc">มากไปน้อย (Z-A)</option>
        </select>
      )}
      <select
        className={styles.teachersSelect}
        value={facultyFilter}
        onChange={(e) => {
          setFacultyFilter(e.target.value);
          setDepartmentFilter("");
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
      <select
        className={styles.teachersSelect}
        value={departmentFilter}
        onChange={(e) => {
          setDepartmentFilter(e.target.value);
          setCurrentPage(1);
        }}
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
        onChange={(e) => {
          setStatusFilter(e.target.value);
          setCurrentPage(1);
        }}
        aria-label="กรองตามสถานะ"
      >
        <option value="">ทุกสถานะ</option>
        <option value="active">ใช้งาน</option>
        <option value="inactive">ระงับ</option>
      </select>
      <select
        className={styles.teachersSelect}
        value={resignedFilter}
        onChange={(e) => {
          setResignedFilter(e.target.value);
          setCurrentPage(1);
        }}
        aria-label="กรองตามการลาออก"
      >
        <option value="active">ยังไม่ลาออก</option>
        <option value="resigned">ลาออกแล้ว</option>
        <option value="all">ทั้งหมด</option>
      </select>
      <select
        className={styles.teachersSelect}
        value={deanFilter}
        onChange={(e) => {
          setDeanFilter(e.target.value);
          setCurrentPage(1);
        }}
        aria-label="กรองตามตำแหน่ง"
      >
        <option value="">ทุกตำแหน่ง</option>
        <option value="dean">คณบดี</option>
        <option value="regular">อาจารย์ทั่วไป</option>
      </select>
      {(searchQuery || facultyFilter || departmentFilter || statusFilter ||
        resignedFilter !== "active" || deanFilter || sortBy) && (
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

export default TeacherFiltersForm;