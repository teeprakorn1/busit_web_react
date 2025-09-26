import React from 'react';
import { User, Eye, Edit, Ban } from 'lucide-react';
import styles from './StaffTable.module.css';
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

function StaffTable({
  staff,
  onViewStaff,
  onEditStaff,
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
              รหัสเจ้าหน้าที่ {getSortIcon('code')}
            </th>
            <th
              className={styles.sortable}
              onClick={() => handleSort('name')}
            >
              ชื่อ-นามสกุล {getSortIcon('name')}
            </th>
            <th
              className={styles.sortable}
              onClick={() => handleSort('email')}
            >
              อีเมล {getSortIcon('email')}
            </th>
            <th>เบอร์โทร</th>
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
          {staff.map(member => {
            const shouldShowImage = member.imageUrl && 
              (shouldLoadImage ? shouldLoadImage(member.imageFile) : true);
            
            return (
              <tr key={member.id}>
                <td>{member.code}</td>
                <td>
                  <div className={styles.staffName}>
                    <div className={styles.avatar}>
                      {shouldShowImage ? (
                        <img
                          src={member.imageUrl}
                          alt="Profile"
                          onError={(e) => handleImageLoadError(e, member.imageFile)}
                          onLoad={handleImageLoad}
                          crossOrigin="use-credentials"
                        />
                      ) : null}
                      <User 
                        className={styles.userIcon} 
                        style={{ display: shouldShowImage ? 'none' : 'block' }} 
                      />
                    </div>
                    <span>{member.firstName} {member.lastName}</span>
                  </div>
                </td>
                <td title={member.email}>{member.email}</td>
                <td>{member.phone || 'ไม่ระบุ'}</td>
                <td>{formatDate(member.regisTime)}</td>
                <td>
                  <span
                    className={`${styles.badgeType} ${member.isResigned ? styles.resigned : styles.notResigned}`}
                  >
                    {member.isResigned ? "ลาออกแล้ว" : "ยังไม่ลาออก"}
                  </span>
                </td>
                <td>
                  <span
                    className={`${styles.badgeType} ${member.isActive ? styles.active : styles.inactive}`}
                  >
                    {member.isActive ? "ใช้งาน" : "ระงับ"}
                  </span>
                </td>
                <td>
                  <div className={styles.actions}>
                    {permissions.canViewStaffDetails && (
                      <button
                        className={styles.viewBtn}
                        onClick={() => onViewStaff(member)}
                        title={`ดูรายละเอียดของ ${member.firstName} ${member.lastName}`}
                        disabled={!member.id || actionLoading}
                      >
                        <Eye className={styles.iconSmall} />
                      </button>
                    )}
                    {permissions.canEditStaff && (
                      <button
                        className={styles.editBtn}
                        onClick={() => onEditStaff(member)}
                        title="แก้ไขข้อมูลโดยตรง"
                        disabled={!member.id || actionLoading}
                      >
                        <Edit className={styles.iconSmall} />
                      </button>
                    )}
                    {permissions.canToggleStaffStatus && (
                      <button
                        className={styles.deleteBtn}
                        onClick={() => onToggleStatus(member)}
                        title={member.isActive ? "ระงับการใช้งาน" : "เปิดการใช้งาน"}
                        disabled={!member.id || actionLoading}
                      >
                        <Ban className={styles.iconSmall} />
                      </button>
                    )}
                    {!permissions.canViewStaffDetails && (
                      <span className={styles.noPermission} title="ไม่มีสิทธิ์เข้าถึง">
                        ไม่มีสิทธิ์
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
          {staff.length === 0 && (
            <tr>
              <td colSpan="8" style={{ textAlign: "center", padding: "20px" }}>
                ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default StaffTable;