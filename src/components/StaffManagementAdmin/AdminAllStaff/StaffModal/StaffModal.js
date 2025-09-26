import React, { useEffect, useState } from 'react';
import { X, User, Mail, Phone, Clock, Loader, AlertTriangle } from 'lucide-react';
import styles from './StaffModal.module.css';
import { useStaffDetail } from '../hooks/useStaffDetail';

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

function StaffModal({
  isOpen,
  onClose,
  staffId
}) {
  const {
    staffDetail,
    loading,
    error,
    imageLoadError,
    fetchStaffDetail,
    handleImageError,
    clearStaffDetail
  } = useStaffDetail();

  const [imageDisplayError, setImageDisplayError] = useState(false);

  useEffect(() => {
    if (isOpen && staffId) {
      fetchStaffDetail(staffId);
      setImageDisplayError(false);
    } else if (!isOpen) {
      clearStaffDetail();
      setImageDisplayError(false);
    }
  }, [isOpen, staffId, fetchStaffDetail, clearStaffDetail]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleImageLoadError = (e) => {
    setImageDisplayError(true);
    handleImageError();
    e.target.style.display = 'none';
    const nextElement = e.target.nextElementSibling;
    if (nextElement) {
      nextElement.style.display = 'flex';
    }
  };

  const handleImageLoad = (e) => {
    setImageDisplayError(false);
    e.target.style.display = 'block';
    const nextElement = e.target.nextElementSibling;
    if (nextElement) {
      nextElement.style.display = 'none';
    }
  };

  if (loading) {
    return (
      <div className={styles.modalOverlay} onClick={handleBackdropClick}>
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <div className={styles.loadingHeader}>
              <h2 className={styles.staffName}>กำลังโหลดข้อมูล...</h2>
            </div>
            <button className={styles.closeButton} onClick={onClose}>
              <X size={24} />
            </button>
          </div>
          <div className={styles.modalBody}>
            <div className={styles.loadingContainer}>
              <Loader className={styles.spinner} />
              <p>กำลังดึงข้อมูลเจ้าหน้าที่...</p>
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
              <h2 className={styles.staffName}>เกิดข้อผิดพลาด</h2>
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
                onClick={() => fetchStaffDetail(staffId)}
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

  if (!staffDetail) {
    return (
      <div className={styles.modalOverlay} onClick={handleBackdropClick}>
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <div className={styles.errorHeader}>
              <h2 className={styles.staffName}>ไม่พบข้อมูลเจ้าหน้าที่</h2>
            </div>
            <button className={styles.closeButton} onClick={onClose}>
              <X size={24} />
            </button>
          </div>
          <div className={styles.modalBody}>
            <div className={styles.errorContainer}>
              <User className={styles.errorIcon} />
              <p>ไม่สามารถแสดงข้อมูลเจ้าหน้าที่ได้</p>
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

  const shouldShowImage = staffDetail.imageUrl && !imageDisplayError && !imageLoadError;

  return (
    <div className={styles.modalOverlay} onClick={handleBackdropClick}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <div className={styles.staffInfo}>
            <div className={styles.avatar}>
              {shouldShowImage ? (
                <img
                  src={staffDetail.imageUrl}
                  alt="Profile"
                  onError={handleImageLoadError}
                  onLoad={handleImageLoad}
                  crossOrigin="use-credentials"
                />
              ) : null}
              <User 
                className={styles.defaultAvatar} 
                style={{ display: shouldShowImage ? 'none' : 'flex' }} 
              />
            </div>
            <div className={styles.nameSection}>
              <h2 className={styles.staffName}>
                {staffDetail.firstName} {staffDetail.lastName}
              </h2>
              <p className={styles.staffCode}>รหัสเจ้าหน้าที่: {staffDetail.code}</p>
              <div className={styles.statusBadges}>
                <span className={`${styles.badge} ${staffDetail.isActive ? styles.active : styles.inactive}`}>
                  {staffDetail.isActive ? 'ใช้งาน' : 'ระงับ'}
                </span>
                <span className={`${styles.badge} ${staffDetail.isResigned ? styles.resigned : styles.notResigned}`}>
                  {staffDetail.isResigned ? 'ลาออกแล้ว' : 'ยังไม่ลาออก'}
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
              <User size={18} />
              ข้อมูลพื้นฐาน
            </h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <Mail className={styles.infoIcon} />
                <div>
                  <label>อีเมล</label>
                  <span>{staffDetail.email}</span>
                </div>
              </div>
              <div className={styles.infoItem}>
                <Phone className={styles.infoIcon} />
                <div>
                  <label>เบอร์โทร</label>
                  <span>{staffDetail.phone || 'ไม่ระบุ'}</span>
                </div>
              </div>
              {staffDetail.otherPhones && staffDetail.otherPhones.length > 0 && (
                <div className={styles.infoItem}>
                  <Phone className={styles.infoIcon} />
                  <div>
                    <label>เบอร์โทรอื่น ๆ</label>
                    <div className={styles.otherPhonesList}>
                      {staffDetail.otherPhones.map((phone, index) => {
                        const phoneNumber = phone.phone || phone.OtherPhone_Phone || '';
                        const phoneName = phone.name || phone.OtherPhone_Name || '';

                        if (!phoneNumber || phoneNumber.trim() === '') {
                          return null;
                        }

                        return (
                          <div key={phone.id || phone.OtherPhone_ID || index} className={styles.otherPhoneItem}>
                            {phoneName && phoneName.trim() !== '' && (
                              <span className={styles.phoneName}>{phoneName}:</span>
                            )}
                            <span className={styles.phoneNumber}>{phoneNumber}</span>
                          </div>
                        );
                      }).filter(Boolean)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <Clock size={18} />
              ข้อมูลระบบ
            </h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <Clock className={styles.infoIcon} />
                <div>
                  <label>วันที่เพิ่มข้อมูลเจ้าหน้าที่</label>
                  <span>{formatDate(staffDetail.regisTime)}</span>
                </div>
              </div>
              {staffDetail.userRegisTime && (
                <div className={styles.infoItem}>
                  <Clock className={styles.infoIcon} />
                  <div>
                    <label>วันที่สร้างบัญชีผู้ใช้</label>
                    <span>{formatDate(staffDetail.userRegisTime)}</span>
                  </div>
                </div>
              )}
              <div className={styles.infoItem}>
                <User className={styles.infoIcon} />
                <div>
                  <label>ชื่อผู้ใช้</label>
                  <span>{staffDetail.username}</span>
                </div>
              </div>
            </div>
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

export default StaffModal;