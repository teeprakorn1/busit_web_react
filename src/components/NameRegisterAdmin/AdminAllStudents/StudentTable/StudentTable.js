import React from 'react';
import { User, Eye, Edit, Ban } from 'lucide-react';
import styles from './StudentTable.module.css';
import { useUserPermissions } from '../hooks/useUserPermissions';

const formatDate = (date) => {
  return new Date(date).toLocaleString('th-TH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

const getDepartmentDisplay = (department) => {
  const departmentMap = {
    'วิทยาการคอมพิวเตอร์': 'วิทยาการคอมพิวเตอร์',
    'เทคโนโลยีสารสนเทศ': 'เทคโนโลยีสารสนเทศ',
    'การตลาด': 'การตลาด',
    'การจัดการ': 'การจัดการ',
    'การบัญชี': 'การบัญชี',
    'ภาษาอังกฤษเพื่อการสื่อสารสากล': 'ภาษาอังกฤษเพื่อการสื่อสารสากล',
    'การท่องเที่ยวและการโรงแรม (แขนงการท่องเที่ยว)': 'การท่องเที่ยวและการโรงแรม (แขนงการท่องเที่ยว)',
    'การท่องเที่ยวและการโรงแรม (แขนงการโรงแรม)': 'การท่องเที่ยวและการโรงแรม (แขนงการโรงแรม)'
  };
  return departmentMap[department] || department;
};

function StudentTable({
  students,
  showBuddhistYear,
  onViewStudent,
  onEditStudent,
  onToggleStatus,
  actionLoading,
  sortConfig,
  onSort,
  handleImageError,
  shouldLoadImage
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

  const handleImageLoadError = (e, filename) => {
    e.target.style.display = 'none';
    const nextElement = e.target.nextElementSibling;
    if (nextElement) {
      nextElement.style.display = 'block';
    }
    if (handleImageError) {
      handleImageError(filename);
    }
  };

  const handleImageLoad = (e) => {
    e.target.style.display = 'block';
    const nextElement = e.target.nextElementSibling;
    if (nextElement) {
      nextElement.style.display = 'none';
    }
  };

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th
              className={styles.sortable}
              onClick={() => handleSort('code')}
            >
              รหัสนักศึกษา {getSortIcon('code')}
            </th>
            <th
              className={styles.sortable}
              onClick={() => handleSort('name')}
            >
              ชื่อ-นามสกุล {getSortIcon('name')}
            </th>
            <th
              className={styles.sortable}
              onClick={() => handleSort('faculty')}
            >
              คณะ {getSortIcon('faculty')}
            </th>
            <th
              className={styles.sortable}
              onClick={() => handleSort('department')}
            >
              สาขา {getSortIcon('department')}
            </th>
            <th
              className={styles.sortable}
              onClick={() => handleSort('academicYear')}
            >
              ปีการศึกษา ({showBuddhistYear ? 'พ.ศ.' : 'ค.ศ.'}) {getSortIcon('academicYear')}
            </th>
            <th
              className={styles.sortable}
              onClick={() => handleSort('email')}
            >
              อีเมล {getSortIcon('email')}
            </th>
            <th
              className={styles.sortable}
              onClick={() => handleSort('regisTime')}
            >
              วันที่เพิ่มในระบบ {getSortIcon('regisTime')}
            </th>
            <th>สำเร็จการศึกษา</th>
            <th>สถานะไอดี</th>
            <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {students.map(student => {
            const shouldShowImage = student.imageUrl &&
              (shouldLoadImage ? shouldLoadImage(student.imageFile) : true);

            return (
              <tr key={student.id}>
                <td>{student.code}</td>
                <td>
                  <div className={styles.studentName}>
                    <div className={styles.avatar}>
                      {shouldShowImage ? (
                        <img
                          src={student.imageUrl}
                          alt="Profile"
                          onError={(e) => handleImageLoadError(e, student.imageFile)}
                          onLoad={handleImageLoad}
                          crossOrigin="use-credentials"
                        />
                      ) : null}
                      <User
                        className={styles.userIcon}
                        style={{ display: shouldShowImage ? 'none' : 'block' }}
                      />
                    </div>
                    <span>{student.firstName} {student.lastName}</span>
                  </div>
                </td>
                <td>
                  <span className={styles.eventTag} title={student.faculty}>
                    {student.faculty === "บริหารธุรกิจและเทคโนโลยีสารสนเทศ"
                      ? "บริหารธุรกิจและเทคโนโลยีสารสนเทศ"
                      : "ศิลปศาสตร์"}
                  </span>
                </td>
                <td>
                  <span className={styles.eventTag} title={student.department}>
                    {getDepartmentDisplay(student.department)}
                  </span>
                </td>
                <td>
                  <div className={styles.academicYearCell}>
                    <span className={styles.primaryYear}>
                      {showBuddhistYear ? student.academicYearBuddhist : student.academicYear}
                    </span>
                    <span className={styles.secondaryYear}>
                      ({showBuddhistYear ? student.academicYear : student.academicYearBuddhist})
                    </span>
                  </div>
                </td>
                <td title={student.email}>{student.email}</td>
                <td>{formatDate(student.regisTime)}</td>
                <td>
                  <span
                    className={`${styles.badgeType} ${student.isGraduated ? styles.graduated : styles.notGraduated}`}
                  >
                    {student.isGraduated ? "สำเร็จการศึกษา" : "ยังไม่สำเร็จการศึกษา"}
                  </span>
                </td>
                <td>
                  <span
                    className={`${styles.badgeType} ${student.isActive ? styles.active : styles.inactive}`}
                  >
                    {student.isActive ? "ใช้งาน" : "ระงับ"}
                  </span>
                </td>
                <td>
                  <div className={styles.actions}>
                    {permissions.canViewStudentDetails && (
                      <button
                        className={styles.viewBtn}
                        onClick={() => onViewStudent(student)}
                        title={`ดูรายละเอียดของ ${student.firstName} ${student.lastName}`}
                        disabled={!student.id || actionLoading}
                      >
                        <Eye className={styles.iconSmall} />
                      </button>
                    )}
                    {permissions.canEditStudents && (
                      <button
                        className={styles.editBtn}
                        onClick={() => onEditStudent(student)}
                        title="แก้ไขข้อมูลโดยตรง"
                        disabled={!student.id || actionLoading}
                      >
                        <Edit className={styles.iconSmall} />
                      </button>
                    )}
                    {permissions.canToggleStudentStatus && (
                      <button
                        className={styles.deleteBtn}
                        onClick={() => onToggleStatus(student)}
                        title={student.isActive ? "ระงับการใช้งาน" : "เปิดการใช้งาน"}
                        disabled={!student.id || actionLoading}
                      >
                        <Ban className={styles.iconSmall} />
                      </button>
                    )}
                    {!permissions.canViewStudentDetails && (
                      <span className={styles.noPermission} title="ไม่มีสิทธิ์เข้าถึง">
                        ไม่มีสิทธิ์
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
          {students.length === 0 && (
            <tr>
              <td colSpan="10" style={{ textAlign: "center", padding: "20px" }}>
                ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default StudentTable;