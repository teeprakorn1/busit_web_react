import React from 'react';
import { X } from 'lucide-react';
import styles from './TimestampModal.module.css';

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

function TimestampModal({
  isOpen,
  onClose,
  timestamp
}) {
  if (!isOpen || !timestamp) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={handleBackdropClick}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button
          className={styles.modalClose}
          onClick={onClose}
          aria-label="ปิด modal"
        >
          <X size={20} />
        </button>

        <h2 className={styles.modalHeading}>
          รายละเอียด Timestamp ID: {timestamp.Timestamp_ID}
        </h2>

        <div className={styles.modalBody}>
          <div className={styles.modalRow}>
            <div className={styles.modalLabel}>ชื่อเหตุการณ์:</div>
            <div className={styles.modalValue}>{timestamp.Timestamp_Name || 'N/A'}</div>
          </div>
          
          <div className={styles.modalRow}>
            <div className={styles.modalLabel}>อีเมล:</div>
            <div className={styles.modalValue}>{timestamp.Users_Email || 'N/A'}</div>
          </div>
          
          <div className={styles.modalRow}>
            <div className={styles.modalLabel}>ประเภทผู้ใช้:</div>
            <div className={styles.modalValue}>{getUserTypeDisplay(timestamp.Users_Type)}</div>
          </div>
          
          <div className={styles.modalRow}>
            <div className={styles.modalLabel}>ประเภทเหตุการณ์:</div>
            <div className={styles.modalValue}>{formatEventType(timestamp.TimestampType_Name)}</div>
          </div>
          
          <div className={styles.modalRow}>
            <div className={styles.modalLabel}>IP Address:</div>
            <div className={styles.modalValue}>{timestamp.Timestamp_IP_Address || 'N/A'}</div>
          </div>
          
          <div className={styles.modalRow}>
            <div className={styles.modalLabel}>User Agent:</div>
            <div className={styles.modalValue} title={timestamp.Timestamp_UserAgent}>
              {timestamp.Timestamp_UserAgent || 'N/A'}
            </div>
          </div>
          
          <div className={styles.modalRow}>
            <div className={styles.modalLabel}>วันที่ / เวลา:</div>
            <div className={styles.modalValue}>
              {timestamp.Timestamp_RegisTime ? formatDate(timestamp.Timestamp_RegisTime) : 'N/A'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TimestampModal;