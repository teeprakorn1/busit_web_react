// DataEditTable/DataEditTable.js
import React, { useCallback } from 'react';
import { Eye, Database } from 'lucide-react';
import styles from './DataEditTable.module.css';

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

const formatSourceTable = (sourceTable) => {
  const tableMap = {
    'Student': 'นักเรียน',
    'Teacher': 'อาจารย์',
    'Staff': 'เจ้าหน้าที่',
    'Users': 'ผู้ใช้',
    'Activity': 'กิจกรรม'
  };
  return tableMap[sourceTable] || sourceTable || 'N/A';
};

const getSourceTableColor = (sourceTable) => {
  const colorMap = {
    'Student': '#3b82f6',
    'Teacher': '#10b981',
    'Staff': '#8b5cf6',
    'Users': '#f59e0b',
    'Activity': '#ef4444'
  };
  return colorMap[sourceTable] || '#6b7280';
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

function DataEditTable({
  dataEdits = [],
  onViewDataEdit,
  searchCriteria,
  canViewDetails = true
}) {
  const handleViewClick = useCallback((e, dataEdit) => {
    e.preventDefault();
    e.stopPropagation();

    if (onViewDataEdit && typeof onViewDataEdit === 'function') {
      onViewDataEdit(dataEdit);
    }
  }, [onViewDataEdit]);

  const handleRowClick = useCallback((e) => {
    e.stopPropagation();
  }, []);

  if (!Array.isArray(dataEdits)) {
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
            <th>รหัส</th>
            <th>รหัสข้อมูล</th>
            <th>ตารางที่มา</th>
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
          {dataEdits.map(de => (
            <tr
              key={de.DataEdit_ID || Math.random()}
              onClick={handleRowClick}
              className={styles.tableRow}
            >
              <td onClick={handleRowClick}>
                <span className={styles.idBadge}>
                  {de.DataEdit_ID || 'N/A'}
                </span>
              </td>
              <td onClick={handleRowClick}>
                <span className={styles.thisIdBadge}>
                  {de.DataEdit_ThisId || 'N/A'}
                </span>
              </td>
              <td onClick={handleRowClick}>
                <span
                  className={styles.sourceTableTag}
                  style={{
                    backgroundColor: `${getSourceTableColor(de.DataEdit_SourceTable)}15`,
                    borderColor: getSourceTableColor(de.DataEdit_SourceTable),
                    color: getSourceTableColor(de.DataEdit_SourceTable)
                  }}
                  title={`ข้อมูลจากตาราง: ${de.DataEdit_SourceTable || 'N/A'}`}
                >
                  <Database className={styles.iconTiny} />
                  {formatSourceTable(de.DataEdit_SourceTable)}
                </span>
              </td>
              <td onClick={handleRowClick}>
                <span className={styles.staffCode}>
                  {de.Staff_Code || 'N/A'}
                </span>
              </td>
              <td onClick={handleRowClick}>
                <div className={styles.staffName}>
                  <span className={styles.firstName}>{de.Staff_FirstName || 'N/A'}</span>
                  <span className={styles.lastName}>{de.Staff_LastName || ''}</span>
                </div>
              </td>
              <td onClick={handleRowClick} title={de.Users_Email}>
                <span className={styles.email}>
                  {de.Users_Email || 'N/A'}
                </span>
              </td>
              <td onClick={handleRowClick}>
                <span className={styles.editTypeTag} title={de.DataEditType_Name}>
                  {formatEditType(de.DataEditType_Name)}
                </span>
              </td>
              <td onClick={handleRowClick} title={de.DataEdit_Name}>
                <span className={styles.editDetail}>
                  {truncateText(de.DataEdit_Name)}
                </span>
              </td>
              <td onClick={handleRowClick} title={de.DataEdit_IP_Address}>
                <span className={styles.ipAddress}>
                  {sanitizeIP(de.DataEdit_IP_Address)}
                </span>
              </td>
              <td onClick={handleRowClick}>
                <span className={styles.dateTime}>
                  {formatDate(de.DataEdit_RegisTime)}
                </span>
              </td>
              <td onClick={handleRowClick}>
                <div className={styles.actions}>
                  {canViewDetails ? (
                    <button
                      className={styles.viewBtn}
                      onClick={(e) => handleViewClick(e, de)}
                      onMouseDown={(e) => e.stopPropagation()}
                      onMouseUp={(e) => e.stopPropagation()}
                      aria-label={`ดูรายละเอียดการแก้ไข ${de.DataEdit_ID}`}
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
          {dataEdits.length === 0 && (
            <tr>
              <td colSpan="11" className={styles.emptyState}>
                {searchCriteria
                  ? `ไม่พบประวัติการแก้ไขบัญชีสำหรับ ${searchCriteria.type === 'email' ? 'อีเมล' :
                    searchCriteria.type === 'staff_code' ? 'รหัสเจ้าหน้าที่' : 'IP'
                  }: ${searchCriteria.value}`
                  : "ไม่มีข้อมูลประวัติการแก้ไขบัญชี"}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DataEditTable;