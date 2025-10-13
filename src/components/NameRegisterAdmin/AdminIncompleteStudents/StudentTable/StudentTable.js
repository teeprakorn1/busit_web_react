import React, { memo, useCallback } from 'react';
import { User, Eye, Edit } from 'lucide-react';
import { useUserPermissions } from '../hooks/useUserPermissions';
import styles from './StudentTable.module.css';

const StudentTable = memo(({
  students,
  showBuddhistYear,
  onViewStudent,
  onEditStudent,
  actionLoading,
  sortConfig,
  onSort,
  handleImageError,
  shouldLoadImage
}) => {
  const permissions = useUserPermissions();

  const getSortIndicator = useCallback((column) => {
    if (sortConfig.key === column) {
      return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
    }
    return '';
  }, [sortConfig]);

  const handleSort = useCallback((column) => {
    if (onSort) {
      onSort(column);
    }
  }, [onSort]);

  const getActivityWarningLevel = useCallback((completed, total = 10) => {
    if (completed >= total) return 'complete';
    if (completed === 0) return 'criticalLow';
    if (completed <= 3) return 'veryLow';
    if (completed <= 6) return 'low';
    return 'moderate';
  }, []);

  const getActivityStatusText = useCallback((completed, total = 10) => {
    if (completed >= total) {
      return `✓ ครบ ${total} กิจกรรม`;
    }
    const remaining = total - completed;
    return `เหลืออีก ${remaining} กิจกรรม`;
  }, []);

  if (!students || students.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '60px 20px',
        color: '#6b7280',
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #e5e7eb'
      }}>
        <p style={{ fontSize: '16px', margin: 0 }}>ไม่พบข้อมูลนักศึกษา</p>
      </div>
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th
              className={styles.sortable}
              onClick={() => handleSort('code')}
              style={{ cursor: 'pointer' }}
            >
              รหัสนักศึกษา{getSortIndicator('code')}
            </th>
            <th
              className={styles.sortable}
              onClick={() => handleSort('name')}
              style={{ cursor: 'pointer' }}
            >
              ชื่อ-นามสกุล{getSortIndicator('name')}
            </th>
            <th
              className={styles.sortable}
              onClick={() => handleSort('academicYear')}
              style={{ cursor: 'pointer' }}
            >
              ปีการศึกษา{getSortIndicator('academicYear')}
            </th>
            <th
              className={styles.sortable}
              onClick={() => handleSort('department')}
              style={{ cursor: 'pointer' }}
            >
              สาขา{getSortIndicator('department')}
            </th>
            <th
              className={styles.sortable}
              onClick={() => handleSort('completedActivities')}
              style={{ cursor: 'pointer' }}
            >
              จำนวนกิจกรรม{getSortIndicator('completedActivities')}
            </th>
            <th>สถานะการทำกิจกรรม</th>
            <th style={{ textAlign: 'center' }}>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => {
            const warningLevel = getActivityWarningLevel(student.completedActivities);
            const statusText = getActivityStatusText(student.completedActivities);

            return (
              <tr key={student.id}>
                <td style={{ fontWeight: '600', fontFamily: 'monospace' }}>
                  {student.code || '-'}
                </td>
                <td>
                  <div className={styles.studentName}>
                    <div className={styles.avatar}>
                      {shouldLoadImage(student.imageFile) && student.imageUrl ? (
                        <img
                          src={student.imageUrl}
                          alt={`${student.firstName} ${student.lastName}`}
                          onError={() => handleImageError(student.imageFile)}
                        />
                      ) : (
                        <User className={styles.userIcon} />
                      )}
                    </div>
                    <span title={`${student.firstName} ${student.lastName}`}>
                      {student.firstName} {student.lastName}
                    </span>
                  </div>
                </td>
                <td>
                  <div className={styles.academicYearCell}>
                    <span className={styles.primaryYear}>
                      {showBuddhistYear
                        ? student.academicYearBuddhist
                        : student.academicYear}
                    </span>
                    <span className={styles.secondaryYear}>
                      {showBuddhistYear
                        ? `(${student.academicYear})`
                        : student.academicYearBuddhist
                          ? `(${student.academicYearBuddhist})`
                          : ''}
                    </span>
                  </div>
                </td>
                <td>
                  <span className={styles.eventTag} title={student.department}>
                    {student.department || '-'}
                  </span>
                </td>
                <td>
                  <div
                    className={`${styles.activityBadge} ${styles[warningLevel]}`}
                    title={`ทำเสร็จ ${student.completedActivities} กิจกรรมจากทั้งหมด 10 กิจกรรม`}
                  >
                    <span style={{ fontSize: '16px', fontWeight: '700' }}>
                      {student.completedActivities || 0}
                    </span>
                    <span style={{ fontSize: '14px' }}>/</span>
                    <span style={{ fontSize: '14px' }}>10</span>
                  </div>
                </td>
                <td>
                  <div
                    className={`${styles.activityStatus} ${styles[`status${warningLevel.charAt(0).toUpperCase() + warningLevel.slice(1)}`]}`}
                  >
                    {statusText}
                  </div>
                </td>
                <td>
                  <div className={styles.actions}>
                    <button
                      className={styles.viewBtn}
                      onClick={() => onViewStudent(student)}
                      disabled={actionLoading}
                      title="ดูรายละเอียด"
                      aria-label={`ดูรายละเอียดของ ${student.firstName} ${student.lastName}`}
                    >
                      <Eye className={styles.iconSmall} />
                    </button>

                    {permissions.canEditStudents ? (
                      <button
                        className={styles.editBtn}
                        onClick={() => onEditStudent(student)}
                        disabled={actionLoading}
                        title="แก้ไขข้อมูล"
                        aria-label={`แก้ไขข้อมูลของ ${student.firstName} ${student.lastName}`}
                      >
                        <Edit className={styles.iconSmall} />
                      </button>
                    ) : (
                      <span className={styles.noPermission} title="ไม่มีสิทธิ์แก้ไข">
                        -
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
});

StudentTable.displayName = 'StudentTable';

export default StudentTable;