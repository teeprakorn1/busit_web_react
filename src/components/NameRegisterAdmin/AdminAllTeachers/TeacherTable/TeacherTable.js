import React from 'react';
import { User, Eye, Edit, Ban, Crown } from 'lucide-react';
import styles from './TeacherTable.module.css';
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
    'วิทยาการคอมพิวเตอร์': 'คอมพิวเตอร์',
    'เทคโนโลยีสารสนเทศ': 'สารสนเทศ',
    'การตลาด': 'การตลาด',
    'การจัดการ': 'การจัดการ',
    'การบัญชี': 'การบัญชี',
    'ภาษาอังกฤษเพื่อการสื่อสารสากล': 'ภาษาอังกฤษ',
    'การท่องเที่ยวและการโรงแรม (แขนงการท่องเที่ยว)': 'ท่องเที่ยว',
    'การท่องเที่ยวและการโรงแรม (แขนงการโรงแรม)': 'โรงแรม'
  };
  return departmentMap[department] || department;
};

function TeacherTable({
  teachers,
  onViewTeacher,
  onEditTeacher,
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
              รหัสอาจารย์ {getSortIcon('code')}
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
              onClick={() => handleSort('position')}
            >
              ตำแหน่ง {getSortIcon('position')}
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
            <th>สถานะการลาออก</th>
            <th>สถานะไอดี</th>
            <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {teachers.map(teacher => {
            const shouldShowImage = teacher.imageUrl && 
              (shouldLoadImage ? shouldLoadImage(teacher.imageFile) : true);
            
            return (
              <tr key={teacher.id}>
                <td>{teacher.code}</td>
                <td>
                  <div className={styles.teacherName}>
                    <div className={styles.avatar}>
                      {shouldShowImage ? (
                        <img
                          src={teacher.imageUrl}
                          alt="Profile"
                          onError={(e) => handleImageLoadError(e, teacher.imageFile)}
                          onLoad={handleImageLoad}
                          crossOrigin="use-credentials"
                        />
                      ) : null}
                      <User 
                        className={styles.userIcon} 
                        style={{ display: shouldShowImage ? 'none' : 'block' }} 
                      />
                    </div>
                    <span>{teacher.firstName} {teacher.lastName}</span>
                  </div>
                </td>
                <td>
                  <span className={styles.eventTag} title={teacher.faculty}>
                    {teacher.faculty === "คณะบริหารธุรกิจและเทคโนโลยีสารสนเทศ"
                      ? "บธ.สท."
                      : "ศิลปศาสตร์"}
                  </span>
                </td>
                <td>
                  <span className={styles.eventTag} title={teacher.department}>
                    {getDepartmentDisplay(teacher.department)}
                  </span>
                </td>
                <td>
                  <div className={styles.positionCell}>
                    {teacher.isDean && (
                      <Crown className={styles.crownIcon} title="คณบดี" />
                    )}
                    <span className={`${styles.badgeType} ${teacher.isDean ? styles.dean : styles.regular}`}>
                      {teacher.isDean ? "คณบดี" : "อาจารย์"}
                    </span>
                  </div>
                </td>
                <td title={teacher.email}>{teacher.email}</td>
                <td>{formatDate(teacher.regisTime)}</td>
                <td>
                  <span
                    className={`${styles.badgeType} ${teacher.isResigned ? styles.resigned : styles.notResigned}`}
                  >
                    {teacher.isResigned ? "ลาออกแล้ว" : "ยังไม่ลาออก"}
                  </span>
                </td>
                <td>
                  <span
                    className={`${styles.badgeType} ${teacher.isActive ? styles.active : styles.inactive}`}
                  >
                    {teacher.isActive ? "ใช้งาน" : "ระงับ"}
                  </span>
                </td>
                <td>
                  <div className={styles.actions}>
                    {permissions.canViewTeacherDetails && (
                      <button
                        className={styles.viewBtn}
                        onClick={() => onViewTeacher(teacher)}
                        title={`ดูรายละเอียดของ ${teacher.firstName} ${teacher.lastName}`}
                        disabled={!teacher.id || actionLoading}
                      >
                        <Eye className={styles.iconSmall} />
                      </button>
                    )}
                    {permissions.canEditTeachers && (
                      <button
                        className={styles.editBtn}
                        onClick={() => onEditTeacher(teacher)}
                        title="แก้ไขข้อมูลโดยตรง"
                        disabled={!teacher.id || actionLoading}
                      >
                        <Edit className={styles.iconSmall} />
                      </button>
                    )}
                    {permissions.canToggleTeacherStatus && (
                      <button
                        className={styles.deleteBtn}
                        onClick={() => onToggleStatus(teacher)}
                        title={teacher.isActive ? "ระงับการใช้งาน" : "เปิดการใช้งาน"}
                        disabled={!teacher.id || actionLoading}
                      >
                        <Ban className={styles.iconSmall} />
                      </button>
                    )}
                    {!permissions.canViewTeacherDetails && (
                      <span className={styles.noPermission} title="ไม่มีสิทธิ์เข้าถึง">
                        ไม่มีสิทธิ์
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
          {teachers.length === 0 && (
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

export default TeacherTable;