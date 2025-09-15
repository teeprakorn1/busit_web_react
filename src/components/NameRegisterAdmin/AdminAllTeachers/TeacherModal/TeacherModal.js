import React, { useEffect, useState } from 'react';
import { X, User, Mail, Phone, Calendar, GraduationCap, MapPin, Heart, AlertTriangle, Clock, Loader, Crown } from 'lucide-react';
import styles from './TeacherModal.module.css';
import { useTeacherDetail } from '../hooks/useTeacherDetail';

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

const formatBirthdate = (date) => {
  return new Date(date).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const calculateAge = (birthdate) => {
  const today = new Date();
  const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};

function TeacherModal({
  isOpen,
  onClose,
  teacherId
}) {
  const {
    teacherDetail,
    loading,
    error,
    imageLoadError,
    fetchTeacherDetail,
    handleImageError,
    clearTeacherDetail
  } = useTeacherDetail();

  const [imageDisplayError, setImageDisplayError] = useState(false);

  useEffect(() => {
    if (isOpen && teacherId) {
      fetchTeacherDetail(teacherId);
      setImageDisplayError(false);
    } else if (!isOpen) {
      clearTeacherDetail();
      setImageDisplayError(false);
    }
  }, [isOpen, teacherId, fetchTeacherDetail, clearTeacherDetail]);

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
              <h2 className={styles.teacherName}>กำลังโหลดข้อมูล...</h2>
            </div>
            <button className={styles.closeButton} onClick={onClose}>
              <X size={24} />
            </button>
          </div>
          <div className={styles.modalBody}>
            <div className={styles.loadingContainer}>
              <Loader className={styles.spinner} />
              <p>กำลังดึงข้อมูลอาจารย์...</p>
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
              <h2 className={styles.teacherName}>เกิดข้อผิดพลาด</h2>
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
                onClick={() => fetchTeacherDetail(teacherId)}
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

  if (!teacherDetail) {
    return (
      <div className={styles.modalOverlay} onClick={handleBackdropClick}>
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <div className={styles.errorHeader}>
              <h2 className={styles.teacherName}>ไม่พบข้อมูลอาจารย์</h2>
            </div>
            <button className={styles.closeButton} onClick={onClose}>
              <X size={24} />
            </button>
          </div>
          <div className={styles.modalBody}>
            <div className={styles.errorContainer}>
              <User className={styles.errorIcon} />
              <p>ไม่สามารถแสดงข้อมูลอาจารย์ได้</p>
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

  const age = teacherDetail.birthdate ? calculateAge(teacherDetail.birthdate) : null;
  const shouldShowImage = teacherDetail.imageUrl && !imageDisplayError && !imageLoadError;

  return (
    <div className={styles.modalOverlay} onClick={handleBackdropClick}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <div className={styles.teacherInfo}>
            <div className={styles.avatar}>
              {shouldShowImage ? (
                <img
                  src={teacherDetail.imageUrl}
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
              <div className={styles.nameWithPosition}>
                <h2 className={styles.teacherName}>
                  {teacherDetail.firstName} {teacherDetail.lastName}
                </h2>
                {teacherDetail.isDean && (
                  <Crown className={styles.crownIcon} title="คณบดี" />
                )}
              </div>
              <p className={styles.teacherCode}>รหัสอาจารย์: {teacherDetail.code}</p>
              <div className={styles.statusBadges}>
                <span className={`${styles.badge} ${teacherDetail.isDean ? styles.dean : styles.regular}`}>
                  {teacherDetail.isDean ? 'คณบดี' : 'อาจารย์'}
                </span>
                <span className={`${styles.badge} ${teacherDetail.isActive ? styles.active : styles.inactive}`}>
                  {teacherDetail.isActive ? 'ใช้งาน' : 'ระงับ'}
                </span>
                <span className={`${styles.badge} ${teacherDetail.isResigned ? styles.resigned : styles.notResigned}`}>
                  {teacherDetail.isResigned ? 'ลาออกแล้ว' : 'ยังไม่ลาออก'}
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
                  <span>{teacherDetail.email}</span>
                </div>
              </div>
              <div className={styles.infoItem}>
                <Phone className={styles.infoIcon} />
                <div>
                  <label>เบอร์โทร</label>
                  <span>{teacherDetail.phone || 'ไม่ระบุ'}</span>
                </div>
              </div>
              {teacherDetail.otherPhones && teacherDetail.otherPhones.length > 0 && (
                <div className={styles.infoItem}>
                  <Phone className={styles.infoIcon} />
                  <div>
                    <label>เบอร์โทรอื่น ๆ</label>
                    <div className={styles.otherPhonesList}>
                      {teacherDetail.otherPhones.map((phone, index) => {
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
              <div className={styles.infoItem}>
                <Calendar className={styles.infoIcon} />
                <div>
                  <label>วันเกิด</label>
                  <span>
                    {teacherDetail.birthdate ? (
                      <>
                        {formatBirthdate(teacherDetail.birthdate)}
                        {age && <span className={styles.age}> (อายุ {age} ปี)</span>}
                      </>
                    ) : 'ไม่ระบุ'}
                  </span>
                </div>
              </div>
              <div className={styles.infoItem}>
                <Heart className={styles.infoIcon} />
                <div>
                  <label>ศาสนา</label>
                  <span>{teacherDetail.religion || 'ไม่ระบุ'}</span>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <GraduationCap size={18} />
              ข้อมูลการทำงาน
            </h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <MapPin className={styles.infoIcon} />
                <div>
                  <label>คณะ</label>
                  <span>{teacherDetail.faculty}</span>
                </div>
              </div>
              <div className={styles.infoItem}>
                <GraduationCap className={styles.infoIcon} />
                <div>
                  <label>สาขา</label>
                  <span>{teacherDetail.department}</span>
                </div>
              </div>
              <div className={styles.infoItem}>
                <Crown className={styles.infoIcon} />
                <div>
                  <label>ตำแหน่ง</label>
                  <span>{teacherDetail.isDean ? 'คณบดี' : 'อาจารย์'}</span>
                </div>
              </div>
            </div>
          </div>
          {teacherDetail.medicalProblem && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <AlertTriangle size={18} />
                ข้อมูลสุขภาพ
              </h3>
              <div className={styles.medicalInfo}>
                <div className={styles.medicalItem}>
                  <AlertTriangle className={styles.medicalIcon} />
                  <div>
                    <label>ปัญหาสุขภาพ </label>
                    <span className={styles.medicalText}>{teacherDetail.medicalProblem}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <Clock size={18} />
              ข้อมูลระบบ
            </h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <Clock className={styles.infoIcon} />
                <div>
                  <label>วันที่เพิ่มข้อมูลอาจารย์</label>
                  <span>{formatDate(teacherDetail.regisTime)}</span>
                </div>
              </div>
              {teacherDetail.userRegisTime && (
                <div className={styles.infoItem}>
                  <Clock className={styles.infoIcon} />
                  <div>
                    <label>วันที่สร้างบัญชีผู้ใช้</label>
                    <span>{formatDate(teacherDetail.userRegisTime)}</span>
                  </div>
                </div>
              )}
              <div className={styles.infoItem}>
                <User className={styles.infoIcon} />
                <div>
                  <label>ชื่อผู้ใช้</label>
                  <span>{teacherDetail.username}</span>
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

export default TeacherModal;