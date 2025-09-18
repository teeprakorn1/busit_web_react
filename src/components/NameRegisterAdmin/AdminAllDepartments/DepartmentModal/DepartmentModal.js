import React, { useEffect } from 'react';
import { X, Building, GraduationCap, Users, MapPin, Loader, AlertTriangle, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './DepartmentModal.module.css';
import { useDepartmentDetail } from '../hooks/useDepartmentDetail';

function DepartmentModal({
  isOpen,
  onClose,
  departmentId
}) {
  const navigate = useNavigate();
  const {
    departmentDetail,
    loading,
    error,
    fetchDepartmentDetail,
    clearDepartmentDetail
  } = useDepartmentDetail();

  useEffect(() => {
    if (isOpen && departmentId) {
      fetchDepartmentDetail(departmentId);
    } else if (!isOpen) {
      clearDepartmentDetail();
    }
  }, [isOpen, departmentId, fetchDepartmentDetail, clearDepartmentDetail]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleViewTeachers = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
    navigate(`/name-register/teacher-name?departmentId=${departmentDetail.Department_ID}`);
  };

  const handleViewStudents = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
    navigate(`/name-register/student-name?departmentId=${departmentDetail.Department_ID}`);
  };

  if (loading) {
    return (
      <div className={styles.modalOverlay} onClick={handleBackdropClick}>
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <div className={styles.loadingHeader}>
              <h2 className={styles.departmentName}>กำลังโหลดข้อมูล...</h2>
            </div>
            <button className={styles.closeButton} onClick={onClose}>
              <X size={24} />
            </button>
          </div>
          <div className={styles.modalBody}>
            <div className={styles.loadingContainer}>
              <Loader className={styles.spinner} />
              <p>กำลังดึงข้อมูลสาขา...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.modalOverlay} onClick={handleBackdropClick}>
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <div className={styles.errorHeader}>
              <h2 className={styles.departmentName}>เกิดข้อผิดพลาด</h2>
            </div>
            <button className={styles.closeButton} onClick={onClose}>
              <X size={24} />
            </button>
          </div>
          <div className={styles.modalBody}>
            <div className={styles.errorContainer}>
              <AlertTriangle className={styles.errorIcon} />
              <p>{error}</p>
              <button
                className={styles.retryButton}
                onClick={() => fetchDepartmentDetail(departmentId)}
              >
                ลองใหม่อีกครั้ง
              </button>
            </div>
          </div>
          <div className={styles.modalFooter}>
            <button className={styles.closeBtn} onClick={onClose}>
              ปิด
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!departmentDetail) {
    return (
      <div className={styles.modalOverlay} onClick={handleBackdropClick}>
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <div className={styles.errorHeader}>
              <h2 className={styles.departmentName}>ไม่พบข้อมูลสาขา</h2>
            </div>
            <button className={styles.closeButton} onClick={onClose}>
              <X size={24} />
            </button>
          </div>
          <div className={styles.modalBody}>
            <div className={styles.errorContainer}>
              <Building className={styles.errorIcon} />
              <p>ไม่สามารถแสดงข้อมูลสาขาได้</p>
            </div>
          </div>
          <div className={styles.modalFooter}>
            <button className={styles.closeBtn} onClick={onClose}>
              ปิด
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.modalOverlay} onClick={handleBackdropClick}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <div className={styles.departmentInfo}>
            <div className={styles.avatar}>
              <Building className={styles.buildingIcon} />
            </div>
            <div className={styles.nameSection}>
              <h2 className={styles.departmentName}>
                {departmentDetail.Department_Name}
              </h2>
              <p className={styles.departmentId}>รหัสสาขา: #{departmentDetail.Department_ID}</p>
              <div className={styles.statusBadges}>
                <span className={styles.badge}>
                  สาขา
                </span>
                <span className={`${styles.badge} ${styles.faculty}`}>
                  {departmentDetail.Faculty_Name}
                </span>
              </div>
            </div>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <div className={styles.modalBody}>
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <Building size={18} />
              ข้อมูลทั่วไป
            </h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <MapPin className={styles.infoIcon} />
                <div>
                  <label>คณะ</label>
                  <span>{departmentDetail.Faculty_Name}</span>
                </div>
              </div>
              <div className={styles.infoItem}>
                <Building className={styles.infoIcon} />
                <div>
                  <label>ชื่อสาขา</label>
                  <span>{departmentDetail.Department_Name}</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <Users size={18} />
              สถิติบุคลากร
            </h3>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <GraduationCap />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>
                    {departmentDetail.teacher_count || 0}
                  </div>
                  <div className={styles.statLabel}>อาจารย์</div>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <Users />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>
                    {departmentDetail.student_count || 0}
                  </div>
                  <div className={styles.statLabel}>นักศึกษา</div>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <Building />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>
                    {(departmentDetail.teacher_count || 0) + (departmentDetail.student_count || 0)}
                  </div>
                  <div className={styles.statLabel}>รวมทั้งหมด</div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <ExternalLink size={18} />
              การดำเนินการ
            </h3>
            <div className={styles.actionGrid}>
              <button 
                className={styles.actionButton}
                onClick={handleViewTeachers}
              >
                <GraduationCap className={styles.actionIcon} />
                <span>ดูรายชื่ออาจารย์</span>
              </button>
              <button 
                className={styles.actionButton}
                onClick={handleViewStudents}
              >
                <Users className={styles.actionIcon} />
                <span>ดูรายชื่อนักศึกษา</span>
              </button>
            </div>
          </div>

          {departmentDetail.description && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <Building size={18} />
                รายละเอียดเพิ่มเติม
              </h3>
              <div className={styles.descriptionContent}>
                <p>{departmentDetail.description}</p>
              </div>
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.closeBtn} onClick={onClose}>
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}

export default DepartmentModal;