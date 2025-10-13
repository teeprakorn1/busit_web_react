// ActivityEditTable/ActivityEditTable.js
import React, { useCallback } from 'react';
import { Eye } from 'lucide-react';
import styles from './ActivityEditTable.module.css';

const formatDate = (date) => {
  if (!date) return 'N/A';
  try {
    return new Date(date).toLocaleString('th-TH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

const formatEditType = (editType) => {
  if (!editType) return 'Unknown';
  return editType
    .replace(/^dataedit_/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
};

const sanitizeIP = (ip) => {
  if (!ip) return 'N/A';
  const parts = ip.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.xxx.xxx`;
  }
  return ip;
};

const truncateText = (text, maxLength = 30) => {
  if (!text) return 'ไม่มีรายละเอียด';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

function ActivityEditTable({
  activityEdits = [],
  onViewActivityEdit,
  searchCriteria,
  canViewDetails = true
}) {
  const handleViewClick = useCallback((e, activityEdit) => {
    e.preventDefault();
    e.stopPropagation();

    if (onViewActivityEdit && typeof onViewActivityEdit === 'function') {
      onViewActivityEdit(activityEdit);
    }
  }, [onViewActivityEdit]);

  const handleRowClick = useCallback((e) => {
    e.stopPropagation();
  }, []);

  if (!Array.isArray(activityEdits)) {
    return (
      <div className={styles.tableWrapper}>
        <div className={styles.errorMessage}>
          ข้อมูลไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง
        </div>
      </div>
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ชื่อกิจกรรม</th>
            <th>สถานะกิจกรรม</th>
            <th>รหัสเจ้าหน้าที่</th>
            <th>ชื่อ-นามสกุล</th>
            <th>อีเมล</th>
            <th>ประเภทการแก้ไข</th>
            <th>รายละเอียด</th>
            <th>IP Address</th>
            <th>วันที่ / เวลา</th>
            <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {activityEdits.map(ae => (
            <tr
              key={ae.DataEdit_ID || Math.random()}
              onClick={handleRowClick}
              className={styles.tableRow}
            >
              <td onClick={handleRowClick} title={ae.Activity_Title}>
                <span className={styles.activityTitle}>
                  {truncateText(ae.Activity_Title, 35)}
                </span>
              </td>
              <td onClick={handleRowClick}>
                {ae.ActivityStatus_Name ? (
                  <span className={`${styles.statusBadge} ${ae.ActivityStatus_Name === 'เปิดรับสมัคร' ? styles.statusOpen :
                    ae.ActivityStatus_Name === 'กำลังดำเนินการ' ? styles.statusOngoing :
                      ae.ActivityStatus_Name === 'เสร็จสิ้น' ? styles.statusCompleted :
                        styles.statusCancelled
                    }`}>
                    {ae.ActivityStatus_Name}
                  </span>
                ) : (
                  <span className={styles.noData}>N/A</span>
                )}
              </td>
              <td onClick={handleRowClick}>
                <span className={styles.staffCode}>
                  {ae.Staff_Code || 'N/A'}
                </span>
              </td>
              <td onClick={handleRowClick}>
                <div className={styles.staffName}>
                  <span className={styles.firstName}>{ae.Staff_FirstName || 'N/A'}</span>
                  <span className={styles.lastName}>{ae.Staff_LastName || ''}</span>
                </div>
              </td>
              <td onClick={handleRowClick} title={ae.Users_Email}>
                <span className={styles.email}>
                  {ae.Users_Email || 'N/A'}
                </span>
              </td>
              <td onClick={handleRowClick}>
                <span className={styles.editTypeTag} title={ae.DataEditType_Name}>
                  {formatEditType(ae.DataEditType_Name)}
                </span>
              </td>
              <td onClick={handleRowClick} title={ae.DataEdit_Name}>
                <span className={styles.editDetail}>
                  {truncateText(ae.DataEdit_Name)}
                </span>
              </td>
              <td onClick={handleRowClick} title={ae.DataEdit_IP_Address}>
                <span className={styles.ipAddress}>
                  {sanitizeIP(ae.DataEdit_IP_Address)}
                </span>
              </td>
              <td onClick={handleRowClick}>
                <span className={styles.dateTime}>
                  {formatDate(ae.DataEdit_RegisTime)}
                </span>
              </td>
              <td onClick={handleRowClick}>
                <div className={styles.actions}>
                  {canViewDetails ? (
                    <button
                      className={styles.viewBtn}
                      onClick={(e) => handleViewClick(e, ae)}
                      onMouseDown={(e) => e.stopPropagation()}
                      onMouseUp={(e) => e.stopPropagation()}
                      aria-label={`ดูรายละเอียดการแก้ไข ${ae.DataEdit_ID}`}
                      type="button"
                    >
                      <Eye className={styles.iconSmall} />
                    </button>
                  ) : (
                    <span className={styles.noPermission}>-</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {activityEdits.length === 0 && (
            <tr>
              <td colSpan="12" className={styles.emptyState}>
                {searchCriteria
                  ? `ไม่พบประวัติการแก้ไขกิจกรรมสำหรับ ${searchCriteria.type === 'activity_id' ? 'รหัสกิจกรรม' :
                    searchCriteria.type === 'activity_title' ? 'ชื่อกิจกรรม' :
                      searchCriteria.type === 'staff_code' ? 'รหัสเจ้าหน้าที่' : 'อีเมล'
                  }: ${searchCriteria.value}`
                  : "ไม่มีข้อมูลประวัติการแก้ไขกิจกรรม"}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ActivityEditTable;