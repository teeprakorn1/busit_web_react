import React from 'react';
import { Eye } from 'lucide-react';
import styles from './TimestampTable.module.css';

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

const formatEventType = (eventType) => {
  if (!eventType) return 'Unknown';
  return eventType
    .replace(/^timestamp_/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
};

const getUserTypeDisplay = (userType) => {
  switch (userType) {
    case 'student': return 'นักเรียน/นักศึกษา';
    case 'teacher': return 'ครู/อาจารย์';
    case 'staff': return 'เจ้าหน้าที่';
    default: return 'ไม่ระบุ';
  }
};

const sanitizeIP = (ip) => {
  if (!ip) return 'N/A';
  const parts = ip.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.xxx.xxx`;
  }
  return ip;
};

function TimestampTable({
  timestamps,
  onViewTimestamp,
  searchCriteria
}) {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>อีเมล</th>
            <th>ประเภทผู้ใช้</th>
            <th>เหตุการณ์</th>
            <th>IP Address</th>
            <th>วันที่ / เวลา</th>
            <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {timestamps.map(ts => (
            <tr key={ts.Timestamp_ID}>
              <td title={ts.Users_Email}>{ts.Users_Email}</td>
              <td>
                <span className={`${styles.badgeType} ${styles[ts.Users_Type]}`}>
                  {getUserTypeDisplay(ts.Users_Type)}
                </span>
              </td>
              <td>
                <span className={styles.eventTag} title={ts.TimestampType_Name}>
                  {formatEventType(ts.TimestampType_Name)}
                </span>
              </td>
              <td title={ts.Timestamp_IP_Address}>
                {sanitizeIP(ts.Timestamp_IP_Address)}
              </td>
              <td>{formatDate(ts.Timestamp_RegisTime)}</td>
              <td>
                <div className={styles.actions}>
                  <button
                    className={styles.viewBtn}
                    onClick={() => onViewTimestamp(ts)}
                    aria-label={`ดูรายละเอียด timestamp ${ts.Timestamp_ID}`}
                  >
                    <Eye className={styles.iconSmall} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {timestamps.length === 0 && (
            <tr>
              <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                {searchCriteria
                  ? `ไม่พบประวัติการใช้งานสำหรับ ${searchCriteria.type === 'email' ? 'อีเมล' : 'IP'}: ${searchCriteria.value}`
                  : "ไม่มีข้อมูล"}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default TimestampTable;