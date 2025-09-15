import React, { useEffect, useState } from 'react';
import { X, User, Mail, Phone, Calendar, GraduationCap, MapPin, Heart, AlertTriangle, Clock, Loader } from 'lucide-react';
import styles from './StudentModal.module.css';
import { useStudentDetail } from '../hooks/useStudentDetail';

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

function StudentModal({
  isOpen,
  onClose,
  studentId,
  showBuddhistYear = true
}) {
  const {
    studentDetail,
    loading,
    error,
    imageLoadError,
    fetchStudentDetail,
    handleImageError,
    clearStudentDetail
  } = useStudentDetail();

  const [imageDisplayError, setImageDisplayError] = useState(false);

  useEffect(() => {
    if (isOpen && studentId) {
      fetchStudentDetail(studentId);
      setImageDisplayError(false);
    } else if (!isOpen) {
      clearStudentDetail();
      setImageDisplayError(false);
    }
  }, [isOpen, studentId, fetchStudentDetail, clearStudentDetail]);

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
              <h2 className={styles.studentName}>กำลังโหลดข้อมูล...</h2>
            </div>
            <button className={styles.closeButton} onClick={onClose}>
              <X size={24} />
            </button>
          </div>
          <div className={styles.modalBody}>
            <div className={styles.loadingContainer}>
              <Loader className={styles.spinner} />
              <p>กำลังดึงข้อมูลนักศึกษา...</p>
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
              <h2 className={styles.studentName}>เกิดข้อผิดพลาด</h2>
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
                onClick={() => fetchStudentDetail(studentId)}
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

  if (!studentDetail) {
    return (
      <div className={styles.modalOverlay} onClick={handleBackdropClick}>
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <div className={styles.errorHeader}>
              <h2 className={styles.studentName}>ไม่พบข้อมูลนักศึกษา</h2>
            </div>
            <button className={styles.closeButton} onClick={onClose}>
              <X size={24} />
            </button>
          </div>
          <div className={styles.modalBody}>
            <div className={styles.errorContainer}>
              <User className={styles.errorIcon} />
              <p>ไม่สามารถแสดงข้อมูลนักศึกษาได้</p>
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

  const age = studentDetail.birthdate ? calculateAge(studentDetail.birthdate) : null;
  const shouldShowImage = studentDetail.imageUrl && !imageDisplayError && !imageLoadError;

  return (
    <div className={styles.modalOverlay} onClick={handleBackdropClick}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <div className={styles.studentInfo}>
            <div className={styles.avatar}>
              {shouldShowImage ? (
                <img
                  src={studentDetail.imageUrl}
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
              <h2 className={styles.studentName}>
                {studentDetail.firstName} {studentDetail.lastName}
              </h2>
              <p className={styles.studentCode}>รหัสนักศึกษา: {studentDetail.code}</p>
              <div className={styles.statusBadges}>
                <span className={`${styles.badge} ${studentDetail.isActive ? styles.active : styles.inactive}`}>
                  {studentDetail.isActive ? 'ใช้งาน' : 'ระงับ'}
                </span>
                <span className={`${styles.badge} ${studentDetail.isGraduated ? styles.graduated : styles.notGraduated}`}>
                  {studentDetail.isGraduated ? 'สำเร็จการศึกษา' : 'ยังไม่สำเร็จการศึกษา'}
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
                  <span>{studentDetail.email}</span>
                </div>
              </div>
              <div className={styles.infoItem}>
                <Phone className={styles.infoIcon} />
                <div>
                  <label>เบอร์โทร</label>
                  <span>{studentDetail.phone || 'ไม่ระบุ'}</span>
                </div>
              </div>
              {studentDetail.otherPhones && studentDetail.otherPhones.length > 0 && (
                <div className={styles.infoItem}>
                  <Phone className={styles.infoIcon} />
                  <div>
                    <label>เบอร์โทรอื่น ๆ</label>
                    <div className={styles.otherPhonesList}>
                      {studentDetail.otherPhones.map((phone, index) => {
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
                    {studentDetail.birthdate ? (
                      <>
                        {formatBirthdate(studentDetail.birthdate)}
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
                  <span>{studentDetail.religion || 'ไม่ระบุ'}</span>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <GraduationCap size={18} />
              ข้อมูลการศึกษา
            </h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <MapPin className={styles.infoIcon} />
                <div>
                  <label>คณะ</label>
                  <span>{studentDetail.faculty}</span>
                </div>
              </div>
              <div className={styles.infoItem}>
                <GraduationCap className={styles.infoIcon} />
                <div>
                  <label>สาขา</label>
                  <span>{studentDetail.department}</span>
                </div>
              </div>
              {studentDetail.advisor && (
                <div className={styles.infoItem}>
                  <User className={styles.infoIcon} />
                  <div>
                    <label>อาจารย์ที่ปรึกษา</label>
                    <span>{studentDetail.advisor}</span>
                  </div>
                </div>
              )}
              <div className={styles.infoItem}>
                <Calendar className={styles.infoIcon} />
                <div>
                  <label>ปีการศึกษา</label>
                  <span>
                    {showBuddhistYear ? studentDetail.academicYearBuddhist : studentDetail.academicYear}
                    <span className={styles.secondaryYear}>
                      ({showBuddhistYear ? studentDetail.academicYear : studentDetail.academicYearBuddhist})
                    </span>
                  </span>
                </div>
              </div>
              <div className={styles.infoItem}>
                <Calendar className={styles.infoIcon} />
                <div>
                  <label>ชั้นปี</label>
                  <span>{studentDetail.studentYear}</span>
                </div>
              </div>
            </div>
          </div>
          {studentDetail.medicalProblem && (
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
                    <span className={styles.medicalText}>{studentDetail.medicalProblem}</span>
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
                  <label>วันที่เพิ่มข้อมูลนักศึกษา</label>
                  <span>{formatDate(studentDetail.regisTime)}</span>
                </div>
              </div>
              {studentDetail.userRegisTime && (
                <div className={styles.infoItem}>
                  <Clock className={styles.infoIcon} />
                  <div>
                    <label>วันที่สร้างบัญชีผู้ใช้</label>
                    <span>{formatDate(studentDetail.userRegisTime)}</span>
                  </div>
                </div>
              )}
              <div className={styles.infoItem}>
                <User className={styles.infoIcon} />
                <div>
                  <label>ชื่อผู้ใช้</label>
                  <span>{studentDetail.username}</span>
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

export default StudentModal;