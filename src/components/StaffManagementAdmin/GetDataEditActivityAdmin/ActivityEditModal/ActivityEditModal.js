// ActivityEditModal/ActivityEditModal.js
import React, { useEffect } from 'react';
import { X, Database, Calendar, Monitor, Info, FileText, User } from 'lucide-react';
import styles from './ActivityEditModal.module.css';

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

const truncateUserAgent = (userAgent, maxLength = 80) => {
  if (!userAgent) return 'N/A';
  if (userAgent.length <= maxLength) return userAgent;
  return userAgent.substring(0, maxLength) + '...';
};

function ActivityEditModal({
  isOpen,
  onClose,
  activityEdit
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !activityEdit) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const hasActivityData = activityEdit.Activity_Title || activityEdit.Activity_Description;
  const hasStaffData = activityEdit.Staff_Code || activityEdit.Staff_FirstName;

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
          รายละเอียดการแก้ไขกิจกรรม ID: {activityEdit.DataEdit_ID || 'N/A'}
        </h2>

        <div className={styles.modalBody}>
          {/* ข้อมูลการแก้ไข */}
          <div className={styles.modalSection}>
            <h3 className={styles.sectionTitle}>
              <Database size={16} />
              ข้อมูลการแก้ไข
            </h3>

            <div className={styles.modalRow}>
              <div className={styles.modalLabel}>รายละเอียดการแก้ไข:</div>
              <div className={styles.modalValue}>{activityEdit.DataEdit_Name || 'ไม่มีรายละเอียด'}</div>
            </div>

            <div className={styles.modalRow}>
              <div className={styles.modalLabel}>ประเภทการแก้ไข:</div>
              <div className={styles.modalValue}>{activityEdit.DataEditType_Name || 'N/A'}</div>
            </div>

            <div className={styles.modalRow}>
              <div className={styles.modalLabel}>ตารางที่แก้ไข:</div>
              <div className={styles.modalValue}>{activityEdit.DataEdit_SourceTable || 'N/A'}</div>
            </div>
          </div>

          {/* ข้อมูลเจ้าหน้าที่ที่แก้ไข */}
          {hasStaffData && (
            <div className={styles.modalSection}>
              <h3 className={styles.sectionTitle}>
                <User size={16} />
                ข้อมูลเจ้าหน้าที่ที่แก้ไข
              </h3>

              <div className={styles.modalRow}>
                <div className={styles.modalLabel}>รหัสเจ้าหน้าที่:</div>
                <div className={styles.modalValue}>{activityEdit.Staff_Code || 'N/A'}</div>
              </div>

              <div className={styles.modalRow}>
                <div className={styles.modalLabel}>ชื่อ-นามสกุล:</div>
                <div className={styles.modalValue}>
                  {activityEdit.Staff_FirstName} {activityEdit.Staff_LastName}
                </div>
              </div>

              {activityEdit.Staff_Phone && (
                <div className={styles.modalRow}>
                  <div className={styles.modalLabel}>เบอร์โทรศัพท์:</div>
                  <div className={styles.modalValue}>{activityEdit.Staff_Phone}</div>
                </div>
              )}

              <div className={styles.modalRow}>
                <div className={styles.modalLabel}>อีเมล:</div>
                <div className={styles.modalValue}>{activityEdit.Users_Email || 'N/A'}</div>
              </div>

              <div className={styles.modalRow}>
                <div className={styles.modalLabel}>ประเภทผู้ใช้:</div>
                <div className={styles.modalValue}>{activityEdit.Users_Type || 'N/A'}</div>
              </div>

              {activityEdit.Staff_RegisTime && (
                <div className={styles.modalRow}>
                  <div className={styles.modalLabel}>วันที่ลงทะเบียนเจ้าหน้าที่:</div>
                  <div className={styles.modalValue}>{formatDate(activityEdit.Staff_RegisTime)}</div>
                </div>
              )}
            </div>
          )}

          {/* ข้อมูลกิจกรรม */}
          {hasActivityData && (
            <div className={styles.activityDataSection}>
              <h3 className={styles.sectionTitle}>
                <FileText size={16} />
                ข้อมูลกิจกรรม
              </h3>

              <div className={styles.modalRow}>
                <div className={styles.modalLabel}>รหัสกิจกรรม:</div>
                <div className={styles.modalValue}>{activityEdit.DataEdit_ThisId || 'N/A'}</div>
              </div>

              <div className={styles.modalRow}>
                <div className={styles.modalLabel}>ชื่อกิจกรรม:</div>
                <div className={styles.modalValue}>{activityEdit.Activity_Title || 'N/A'}</div>
              </div>

              <div className={styles.modalRow}>
                <div className={styles.modalLabel}>คำอธิบาย:</div>
                <div className={styles.modalValue}>{activityEdit.Activity_Description || 'ไม่มีคำอธิบาย'}</div>
              </div>

              {activityEdit.ActivityType_Name && (
                <div className={styles.modalRow}>
                  <div className={styles.modalLabel}>ประเภทกิจกรรม:</div>
                  <div className={styles.modalValue}>{activityEdit.ActivityType_Name}</div>
                </div>
              )}

              {activityEdit.ActivityStatus_Name && (
                <div className={styles.modalRow}>
                  <div className={styles.modalLabel}>สถานะ:</div>
                  <div className={styles.modalValue}>{activityEdit.ActivityStatus_Name}</div>
                </div>
              )}

              {activityEdit.Activity_StartTime && (
                <div className={styles.modalRow}>
                  <div className={styles.modalLabel}>วันเริ่มกิจกรรม:</div>
                  <div className={styles.modalValue}>{formatDate(activityEdit.Activity_StartTime)}</div>
                </div>
              )}

              {activityEdit.Activity_EndTime && (
                <div className={styles.modalRow}>
                  <div className={styles.modalLabel}>วันสิ้นสุดกิจกรรม:</div>
                  <div className={styles.modalValue}>{formatDate(activityEdit.Activity_EndTime)}</div>
                </div>
              )}

              {activityEdit.Activity_LocationDetail && (
                <div className={styles.modalRow}>
                  <div className={styles.modalLabel}>สถานที่:</div>
                  <div className={styles.modalValue}>{activityEdit.Activity_LocationDetail}</div>
                </div>
              )}

              {typeof activityEdit.Activity_IsRequire !== 'undefined' && (
                <div className={styles.modalRow}>
                  <div className={styles.modalLabel}>กิจกรรมบังคับ:</div>
                  <div className={styles.modalValue}>
                    {activityEdit.Activity_IsRequire ? 'ใช่' : 'ไม่'}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ข้อมูลเทคนิค */}
          <div className={styles.modalSection}>
            <h3 className={styles.sectionTitle}>
              <Monitor size={16} />
              ข้อมูลเทคนิค
            </h3>

            <div className={styles.modalRow}>
              <div className={styles.modalLabel}>IP Address:</div>
              <div className={styles.modalValue}>{activityEdit.DataEdit_IP_Address || 'N/A'}</div>
            </div>

            <div className={styles.modalRow}>
              <div className={styles.modalLabel}>User Agent:</div>
              <div className={styles.modalValue} title={activityEdit.DataEdit_UserAgent}>
                {truncateUserAgent(activityEdit.DataEdit_UserAgent)}
              </div>
            </div>

            <div className={styles.modalRow}>
              <div className={styles.modalLabel}>วันที่ / เวลา:</div>
              <div className={styles.modalValue}>
                <Calendar size={14} style={{ marginRight: '6px', display: 'inline' }} />
                {formatDate(activityEdit.DataEdit_RegisTime)}
              </div>
            </div>
          </div>

          {/* ข้อมูลเพิ่มเติม */}
          {(activityEdit.DataEditType_ID || activityEdit.Staff_ID) && (
            <div className={styles.modalSection}>
              <h3 className={styles.sectionTitle}>
                <Info size={16} />
                ข้อมูลเพิ่มเติม
              </h3>

              {activityEdit.DataEditType_ID && (
                <div className={styles.modalRow}>
                  <div className={styles.modalLabel}>ID ประเภทการแก้ไข:</div>
                  <div className={styles.modalValue}>{activityEdit.DataEditType_ID}</div>
                </div>
              )}

              {activityEdit.Staff_ID && (
                <div className={styles.modalRow}>
                  <div className={styles.modalLabel}>ID เจ้าหน้าที่:</div>
                  <div className={styles.modalValue}>{activityEdit.Staff_ID}</div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button
            className={styles.closeButton}
            onClick={onClose}
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}

export default ActivityEditModal;