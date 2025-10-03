// ActivityTable/ActivityTable.jsx
import React from 'react';
import { Eye, Edit, Trash2, MapPin, Calendar } from 'lucide-react';
import styles from './ActivityTable.module.css';
import { useUserPermissions } from '../hooks/useUserPermissions';

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('th-TH', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStatusClass = (statusName) => {
  switch (statusName) {
    case 'เปิดรับสมัคร':
      return styles.statusOpen;
    case 'กำลังดำเนินการ':
      return styles.statusOngoing;
    case 'เสร็จสิ้น':
      return styles.statusCompleted;
    case 'ยกเลิก':
      return styles.statusCancelled;
    default:
      return '';
  }
};

function ActivityTable({
  activities,
  onViewActivity,
  onEditActivity,
  onDeleteActivity,
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
            <th className={styles.sortable} onClick={() => handleSort('title')}>
              ชื่อกิจกรรม {getSortIcon('title')}
            </th>
            <th>ประเภท</th>
            <th>สถานะ</th>
            <th className={styles.sortable} onClick={() => handleSort('startTime')}>
              วันที่เริ่ม {getSortIcon('startTime')}
            </th>
            <th className={styles.sortable} onClick={() => handleSort('endTime')}>
              วันที่สิ้นสุด {getSortIcon('endTime')}
            </th>
            <th>สถานที่</th>
            <th>บังคับเข้าร่วม</th>
            <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {activities.map(activity => (
            <tr key={activity.id}>
              <td>
                <div className={styles.activityTitle}>
                  <span className={styles.titleText}>{activity.title}</span>
                </div>
              </td>
              <td>
                <span className={styles.typeTag}>
                  {activity.typeName || '-'}
                </span>
              </td>
              <td>
                <span className={`${styles.statusBadge} ${getStatusClass(activity.statusName)}`}>
                  {activity.statusName || '-'}
                </span>
              </td>
              <td>
                <div className={styles.dateCell}>
                  <Calendar className={styles.iconSmall} />
                  {formatDate(activity.startTime)}
                </div>
              </td>
              <td>
                <div className={styles.dateCell}>
                  <Calendar className={styles.iconSmall} />
                  {formatDate(activity.endTime)}
                </div>
              </td>
              <td>
                <div className={styles.locationCell}>
                  {activity.locationDetail ? (
                    <>
                      <MapPin className={styles.iconSmall} />
                      <span title={activity.locationDetail}>
                        {activity.locationDetail.length > 20 
                          ? `${activity.locationDetail.substring(0, 20)}...` 
                          : activity.locationDetail}
                      </span>
                    </>
                  ) : '-'}
                </div>
              </td>
              <td>
                <span className={`${styles.requireBadge} ${activity.isRequire ? styles.required : styles.optional}`}>
                  {activity.isRequire ? 'บังคับ' : 'ไม่บังคับ'}
                </span>
              </td>
              <td>
                <div className={styles.actions}>
                  <button
                    className={styles.viewBtn}
                    onClick={() => onViewActivity(activity)}
                    title="ดูรายละเอียด"
                    disabled={actionLoading}
                  >
                    <Eye className={styles.iconSmall} />
                  </button>

                  {permissions.canManageActivities && (
                    <>
                      <button
                        className={styles.editBtn}
                        onClick={() => onEditActivity(activity)}
                        title="แก้ไข"
                        disabled={actionLoading}
                      >
                        <Edit className={styles.iconSmall} />
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => onDeleteActivity(activity)}
                        title="ลบ"
                        disabled={actionLoading}
                      >
                        <Trash2 className={styles.iconSmall} />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {activities.length === 0 && (
            <tr>
              <td colSpan="8" style={{ textAlign: "center", padding: "20px" }}>
                ไม่พบข้อมูลกิจกรรม
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ActivityTable;