import React, { useEffect } from 'react';
import { X, User, Mail, Calendar, GraduationCap, BookOpen, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import styles from './StudentModal.module.css';
import { useStudentDetail } from '../hooks/useStudentDetail';

const formatDate = (date) => {
  if (!date) return 'ไม่ระบุ';
  return new Date(date).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatDateTime = (date) => {
  if (!date) return 'ไม่ระบุ';
  return new Date(date).toLocaleString('th-TH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

function StudentModal({ isOpen, onClose, studentId, showBuddhistYear }) {
  const {
    studentDetail,
    loading,
    error,
    imageLoadError,
    fetchStudentDetail,
    handleImageError,
    clearStudentDetail
  } = useStudentDetail();

  useEffect(() => {
    if (isOpen && studentId) {
      fetchStudentDetail(studentId);
    }

    return () => {
      if (!isOpen) {
        clearStudentDetail();
      }
    };
  }, [isOpen, studentId, fetchStudentDetail, clearStudentDetail]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={handleBackdropClick}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>รายละเอียดนักศึกษา</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            title="ปิด"
          >
            <X size={24} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {loading && (
            <div className={styles.loadingState}>
              <Loader className={styles.spinner} />
              <p>กำลังโหลดข้อมูล...</p>
            </div>
          )}

          {error && (
            <div className={styles.errorState}>
              <AlertCircle className={styles.errorIcon} />
              <h3>เกิดข้อผิดพลาด</h3>
              <p>{error}</p>
              <button
                className={styles.retryButton}
                onClick={() => fetchStudentDetail(studentId)}
              >
                ลองใหม่อีกครั้ง
              </button>
            </div>
          )}

          {!loading && !error && studentDetail && (
            <>
              {/* Profile Section */}
              <div className={styles.profileSection}>
                <div className={styles.avatarContainer}>
                  {studentDetail.imageUrl && !imageLoadError ? (
                    <img
                      src={studentDetail.imageUrl}
                      alt="Profile"
                      onError={handleImageError}
                      crossOrigin="use-credentials"
                      className={styles.avatar}
                    />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      <User size={48} />
                    </div>
                  )}
                </div>

                <div className={styles.profileInfo}>
                  <h3 className={styles.studentName}>
                    {studentDetail.firstName} {studentDetail.lastName}
                  </h3>
                  <p className={styles.studentCode}>{studentDetail.code}</p>
                  <div className={styles.statusBadges}>
                    <span className={`${styles.badge} ${studentDetail.isActive ? styles.badgeActive : styles.badgeInactive}`}>
                      {studentDetail.isActive ? 'ใช้งาน' : 'ระงับการใช้งาน'}
                    </span>
                    <span className={`${styles.badge} ${studentDetail.isGraduated ? styles.badgeGraduated : styles.badgeStudying}`}>
                      {studentDetail.isGraduated ? 'สำเร็จการศึกษา' : 'กำลังศึกษา'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Warning for Incomplete Activities */}
              <div className={styles.warningBox}>
                <AlertCircle className={styles.warningIcon} />
                <div>
                  <h4>กิจกรรมไม่ครบ</h4>
                  <p>นักศึกษารายนี้มีจำนวนกิจกรรมที่สำเร็จ <strong>{studentDetail.completedActivities || 0} กิจกรรม</strong> ซึ่งน้อยกว่าเกณฑ์ขั้นต่ำ (10 กิจกรรม)
                    {studentDetail.totalActivities && (
                      <> - ยังขาดอีก <strong>{studentDetail.totalActivities - (studentDetail.completedActivities || 0)} กิจกรรม</strong></>
                    )}
                  </p>
                </div>
              </div>

              {/* Details Grid */}
              <div className={styles.detailsGrid}>
                {/* Contact Information */}
                <div className={styles.detailSection}>
                  <h4 className={styles.sectionTitle}>
                    <Mail size={18} />
                    ข้อมูลการติดต่อ
                  </h4>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>อีเมล:</span>
                    <span className={styles.detailValue}>{studentDetail.email || 'ไม่ระบุ'}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>เบอร์โทร:</span>
                    <span className={styles.detailValue}>{studentDetail.phone || 'ไม่ระบุ'}</span>
                  </div>
                  {studentDetail.otherPhones && studentDetail.otherPhones.length > 0 && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>เบอร์โทรอื่นๆ:</span>
                      <div className={styles.phoneList}>
                        {studentDetail.otherPhones.map((phoneObj, index) => (
                          <span key={index} className={styles.phoneItem}>
                            {phoneObj.phone}
                            {phoneObj.name && ` (${phoneObj.name})`}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Academic Information */}
                <div className={styles.detailSection}>
                  <h4 className={styles.sectionTitle}>
                    <GraduationCap size={18} />
                    ข้อมูลการศึกษา
                  </h4>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>คณะ:</span>
                    <span className={styles.detailValue}>{studentDetail.faculty || 'ไม่ระบุ'}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>สาขา:</span>
                    <span className={styles.detailValue}>{studentDetail.department || 'ไม่ระบุ'}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>ปีการศึกษา:</span>
                    <span className={styles.detailValue}>
                      {showBuddhistYear
                        ? `${studentDetail.academicYearBuddhist} (${studentDetail.academicYear})`
                        : `${studentDetail.academicYear} (${studentDetail.academicYearBuddhist})`
                      }
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>ชั้นปี:</span>
                    <span className={styles.detailValue}>{studentDetail.studentYear || 'ไม่ระบุ'}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>อาจารย์ที่ปรึกษา:</span>
                    <span className={styles.detailValue}>{studentDetail.advisor || 'ไม่ระบุ'}</span>
                  </div>
                </div>

                {/* Activity Summary */}
                <div className={styles.detailSection}>
                  <h4 className={styles.sectionTitle}>
                    <BookOpen size={18} />
                    สรุปกิจกรรม
                  </h4>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>จำนวนกิจกรรมที่สำเร็จ:</span>
                    <span className={`${styles.detailValue} ${styles.activityCount}`}>
                      {studentDetail.completedActivities || 0} / {studentDetail.totalActivities || 10} กิจกรรม
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className={styles.progressContainer}>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{ width: `${studentDetail.activityProgress || 0}%` }}
                      />
                    </div>
                    <span className={styles.progressText}>{studentDetail.activityProgress || 0}%</span>
                  </div>

                  <div className={styles.activityStatus}>
                    {(studentDetail.completedActivities || 0) === 0 && (
                      <span className={styles.statusCritical}>
                        ยังไม่มีกิจกรรมที่สำเร็จ
                      </span>
                    )}
                    {(studentDetail.completedActivities || 0) > 0 && (studentDetail.completedActivities || 0) <= 3 && (
                      <span className={styles.statusDanger}>
                        กิจกรรมน้อยมาก
                      </span>
                    )}
                    {(studentDetail.completedActivities || 0) > 3 && (studentDetail.completedActivities || 0) <= 6 && (
                      <span className={styles.statusWarning}>
                        กิจกรรมค่อนข้างน้อย
                      </span>
                    )}
                    {(studentDetail.completedActivities || 0) > 6 && (studentDetail.completedActivities || 0) < 10 && (
                      <span className={styles.statusModerate}>
                        กิจกรรมยังไม่ครบ
                      </span>
                    )}
                    {(studentDetail.completedActivities || 0) >= 10 && (
                      <span className={styles.statusComplete}>
                        กิจกรรมครบแล้ว
                      </span>
                    )}
                  </div>
                </div>

                {/* Personal Information */}
                <div className={styles.detailSection}>
                  <h4 className={styles.sectionTitle}>
                    <User size={18} />
                    ข้อมูลส่วนตัว
                  </h4>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>วันเกิด:</span>
                    <span className={styles.detailValue}>{formatDate(studentDetail.birthdate)}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>ศาสนา:</span>
                    <span className={styles.detailValue}>{studentDetail.religion || 'ไม่ระบุ'}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>ปัญหาสุขภาพ:</span>
                    <span className={styles.detailValue}>{studentDetail.medicalProblem || 'ไม่มี'}</span>
                  </div>
                </div>

                {/* System Information */}
                <div className={styles.detailSection}>
                  <h4 className={styles.sectionTitle}>
                    <Calendar size={18} />
                    ข้อมูลระบบ
                  </h4>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>ชื่อผู้ใช้:</span>
                    <span className={styles.detailValue}>{studentDetail.username || 'ไม่ระบุ'}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>วันที่เพิ่มในระบบ:</span>
                    <span className={styles.detailValue}>{formatDateTime(studentDetail.regisTime)}</span>
                  </div>
                  {studentDetail.userRegisTime && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>วันที่สร้างบัญชี:</span>
                      <span className={styles.detailValue}>{formatDateTime(studentDetail.userRegisTime)}</span>
                    </div>
                  )}
                </div>
              </div>
              {studentDetail.activities && studentDetail.activities.length > 0 && (
                <div className={styles.activitiesSection}>
                  <h3 className={styles.activitiesSectionTitle}>
                    <CheckCircle size={20} />
                    รายการกิจกรรมที่สำเร็จ ({studentDetail.activities.length} กิจกรรม)
                  </h3>
                  <div className={styles.activitiesList}>
                    {studentDetail.activities.map((activity, index) => (
                      <div key={activity.id || index} className={styles.activityCard}>
                        <div className={styles.activityHeader}>
                          <div className={styles.activityNumber}>{index + 1}</div>
                          <div className={styles.activityInfo}>
                            <h4 className={styles.activityTitle}>{activity.title}</h4>
                            {activity.type && (
                              <span className={styles.activityType}>{activity.type}</span>
                            )}
                          </div>
                        </div>
                        {activity.date && (
                          <div className={styles.activityDate}>
                            <Calendar size={14} />
                            <span>{formatDateTime(activity.date)}</span>
                          </div>
                        )}
                        {activity.approvedDate && (
                          <div className={styles.activityApproved}>
                            <CheckCircle size={14} />
                            <span>อนุมัติเมื่อ: {formatDateTime(activity.approvedDate)}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {(!studentDetail.activities || studentDetail.activities.length === 0) && (
                <div className={styles.noActivities}>
                  <AlertCircle size={32} />
                  <p>ยังไม่มีกิจกรรมที่สำเร็จ</p>
                </div>
              )}
            </>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button
            className={styles.closeFooterButton}
            onClick={onClose}
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}

export default StudentModal;