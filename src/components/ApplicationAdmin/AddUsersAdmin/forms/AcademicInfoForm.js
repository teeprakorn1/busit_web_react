import React from 'react';
import styles from './FormFields.module.css';

function AcademicInfoForm() {
  return (
    <div className={styles.formContainer}>
      <h3>ข้อมูลการศึกษา</h3>
      <label>คณะ *</label>
      <input type="text" className={styles.inputField} />
      <label>สาขาวิชา *</label>
      <input type="text" className={styles.inputField} />
      <label>ปีการศึกษา *</label>
      <input type="text" className={styles.inputField} />
      <label>อาจารย์ที่ปรึกษา *</label>
      <input type="text" className={styles.inputField} />
    </div>
  );
}

export default AcademicInfoForm;
