import React from 'react';
import styles from './UserTypeSelector.module.css';

function UserTypeSelector({ selectedType, onTypeChange }) {
  const handleTypeChange = (type) => {
    if (onTypeChange) {
      onTypeChange(type);
    }
  };

  return (
    <div className={styles.userTypeSelector}>
      <h3 className={styles.selectorTitle}>เลือกประเภทผู้ใช้ที่ต้องการเพิ่มข้อมูล</h3>

      <div className={styles.typeButtons}>
        <button
          type="button"
          className={`${styles.typeBtn} ${selectedType === 'student' ? styles.active : ''}`}
          onClick={() => handleTypeChange('student')}
        >
          <div className={styles.btnContent}>
            <div className={styles.btnText}>
              <span className={styles.btnTitle}>นักศึกษา</span>
              <span className={styles.btnSubtitle}>Student</span>
            </div>
          </div>
        </button>

        <button
          type="button"
          className={`${styles.typeBtn} ${selectedType === 'teacher' ? styles.active : ''}`}
          onClick={() => handleTypeChange('teacher')}
        >
          <div className={styles.btnContent}>
            <div className={styles.btnText}>
              <span className={styles.btnTitle}>อาจารย์</span>
              <span className={styles.btnSubtitle}>Teacher</span>
            </div>
          </div>
        </button>
      </div>

      <div className={styles.selectedInfo}>
        <p className={styles.infoText}>
          ประเภทที่เลือก: <strong>{selectedType === 'student' ? 'นักศึกษา' : 'อาจารย์'}</strong>
        </p>
      </div>
    </div>
  );
}

export default UserTypeSelector;