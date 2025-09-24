import React from 'react';
import { Building, Eye, Users, GraduationCap } from 'lucide-react';
import styles from './DepartmentTable.module.css';
import { useUserPermissions } from '../hooks/useUserPermissions';

const getFacultyDisplay = (faculty) => {
  if (faculty === "คณะบริหารธุรกิจและเทคโนโลยีสารสนเทศ") {
    return "บธ.สท.";
  } else if (faculty === "คณะศิลปศาสตร์") {
    return "ศิลปศาสตร์";
  }
  return faculty;
};

const getDepartmentDisplay = (department) => {
  const departmentMap = {
    'วิทยาการคอมพิวเตอร์': 'วิทคอม',
    'เทคโนโลยีสารสนเทศ': 'สารสนเทศ',
    'การตลาด': 'การตลาด',
    'การตลาด (2 ปี ต่อเนื่อง)': 'การตลาด (2ปี)',
    'การจัดการ': 'การจัดการ',
    'การจัดการ (2 ปี ต่อเนื่อง)': 'การจัดการ (2ปี)',
    'เทคโนโลยีโลจิสติกส์และการจัดการระบบขนส่ง': 'โลจิสติกส์',
    'เศรษฐศาสตร์': 'เศรษฐศาสตร์',
    'การโฆษณาและประชาสัมพันธ์': 'โฆษณา-ประชาสัมพันธ์',
    'ระบบสารสนเทศทางคอมพิวเตอร์-คอมพิวเตอร์ธุรกิจ': 'คอมธุรกิจ',
    'ระบบสารสนเทศทางคอมพิวเตอร์-คอมพิวเตอร์ธุรกิจ (2 ปี ต่อเนื่อง)': 'คอมธุรกิจ (2ปี)',
    'การบัญชี': 'การบัญชี',
    'การบัญชี (2 ปี ต่อเนื่อง)': 'การบัญชี (2ปี)',
    'เทคโนโลยีคอมพิวเตอร์': 'เทคโนโลยีคอมพิวเตอร์',
    'มัลติมีเดีย': 'มัลติมีเดีย',
    'ภาษาอังกฤษเพื่อการสื่อสารสากล': 'ภาษาอังกฤษ',
    'การท่องเที่ยวและการโรงแรม (แขนงการท่องเที่ยว)': 'ท่องเที่ยว',
    'การท่องเที่ยวและการโรงแรม (แขนงการโรงแรม)': 'โรงแรม',
    'การจัดการธุรกิจและเทคโนโลยีการกีฬา': 'จัดการธุรกิจกีฬา',
    'คณิตศาสตร์และวิทยาศาสตร์': 'คณิตศาสตร์-วิทยาศาสตร์',
    'ภาษาไทย': 'ภาษาไทย',
    'ภาษาจีน': 'ภาษาจีน'
  };
  return departmentMap[department] || department;
};

function DepartmentTable({
  departments,
  onViewDepartment,
  actionLoading,
  sortConfig,
  onSort
}) {
  const permissions = useUserPermissions();

  const handleSort = (field) => {
    if (sortConfig.field === field) {
      onSort(field, sortConfig.direction === 'asc' ? 'desc' : 'asc');
    } else {
      onSort(field, 'asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortConfig.field !== field) return '⇅';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th
              className={styles.sortable}
              onClick={() => handleSort('name')}
            >
              ชื่อสาขา {getSortIcon('name')}
            </th>
            <th
              className={styles.sortable}
              onClick={() => handleSort('faculty')}
            >
              คณะ {getSortIcon('faculty')}
            </th>
            <th
              className={styles.sortable}
              onClick={() => handleSort('teachers')}
            >
              จำนวนอาจารย์ {getSortIcon('teachers')}
            </th>
            <th
              className={styles.sortable}
              onClick={() => handleSort('students')}
            >
              จำนวนนักศึกษา {getSortIcon('students')}
            </th>
            <th>รวมทั้งหมด</th>
            <th>การดำเนินการ</th>
          </tr>
        </thead>
        <tbody>
          {departments.map(department => (
            <tr key={department.Department_ID}>
              <td>
                <div className={styles.departmentName}>
                  <div className={styles.avatar}>
                    <Building className={styles.buildingIcon} />
                  </div>
                  <div className={styles.nameInfo}>
                    <span className={styles.fullName} title={department.Department_Name}>
                      {getDepartmentDisplay(department.Department_Name)}
                    </span>
                    <span className={styles.fullNameSubtle}>
                      {department.Department_Name}
                    </span>
                  </div>
                </div>
              </td>
              <td>
                <span className={styles.facultyTag} title={department.Faculty_Name}>
                  {getFacultyDisplay(department.Faculty_Name)}
                </span>
              </td>
              <td>
                <div className={styles.countInfo}>
                  <GraduationCap className={styles.countIcon} />
                  <span className={styles.count}>{department.teacher_count || 0} คน</span>
                </div>
              </td>
              <td>
                <div className={styles.countInfo}>
                  <Users className={styles.countIcon} />
                  <span className={styles.count}>{department.student_count || 0} คน</span>
                </div>
              </td>
              <td>
                <div className={styles.totalInfo}>
                  <span className={styles.totalCount}>{(department.teacher_count || 0) + (department.student_count || 0)} คน</span>
                  <span className={styles.totalSubtext}>รวมทั้งหมด</span>
                </div>
              </td>
              <td>
                <div className={styles.actions}>
                  {permissions.canViewStudents && (
                    <button
                      className={styles.viewBtn}
                      onClick={() => onViewDepartment(department)}
                      title={`ดูรายละเอียดของ ${department.Department_Name}`}
                      disabled={!department.Department_ID || actionLoading}
                    >
                      <Eye className={styles.iconSmall} />
                      <span className={styles.buttonText}>ดูรายละเอียด</span>
                    </button>
                  )}
                  {!permissions.canViewStudents && (
                    <span className={styles.noPermission} title="ไม่มีสิทธิ์เข้าถึง">
                      ไม่มีสิทธิ์
                    </span>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {departments.length === 0 && (
            <tr>
              <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DepartmentTable;