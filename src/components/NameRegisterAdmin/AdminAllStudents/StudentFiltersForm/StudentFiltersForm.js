import React from 'react';
import { Plus, Upload, X } from 'lucide-react';
import { academicYearUtils } from '../utils/academicYearUtils';
import { useUserPermissions } from '../hooks/useUserPermissions';
import styles from './StudentFiltersForm.module.css';

const StudentFiltersForm = ({
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

  return (
    <div className={styles.studentsFilter}>
      {/* Action Buttons */}
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

      {/* Show permission info for different user types */}
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

      {/* Search Input */}
      <input
        type="text"
        placeholder="ค้นหา ชื่อ, รหัส, อีเมล, สาขา, ปีการศึกษา, ชั้นปี..."
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setCurrentPage(1);
        }}
        className={styles.studentsSearch}
        aria-label="ค้นหาข้อมูล"
      />

      {/* Sort Controls */}
      <select
        className={styles.studentsSelect}
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
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
          onChange={(e) => setSortOrder(e.target.value)}
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

      {/* Department Filter */}
      <select
        className={styles.studentsSelect}
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

      {/* Academic Year Filter */}
      <select
        className={styles.studentsSelect}
        value={academicYearFilter}
        onChange={(e) => {
          setAcademicYearFilter(e.target.value);
          setCurrentPage(1);
        }}
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
        onChange={(e) => {
          setStudentYearFilter(e.target.value);
          setCurrentPage(1);
        }}
        aria-label="กรองตามชั้นปี"
      >
        <option value="">ทุกชั้นปี</option>
        {availableStudentYears.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>

      {/* Year Range Filter */}
      <select
        className={styles.studentsSelect}
        value={yearRangeFilter}
        onChange={(e) => {
          setYearRangeFilter(e.target.value);
          setCurrentPage(1);
        }}
        aria-label="กรองตามช่วงปี"
      >
        <option value="">ทุกช่วงปี</option>
        <option value="current">ปีปัจจุบัน</option>
        <option value="recent">3 ปีล่าสุด</option>
        <option value="old">มากกว่า 3 ปี</option>
        <option value="graduated_eligible">ควรจบแล้ว (4+ ปี)</option>
      </select>

      {/* Status Filter */}
      <select
        className={styles.studentsSelect}
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
        <option value="graduated">สำเร็จการศึกษา</option>
        <option value="not_graduated">ยังไม่สำเร็จการศึกษา</option>
      </select>

      {/* Reset Filters Button */}
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
};

export default StudentFiltersForm;