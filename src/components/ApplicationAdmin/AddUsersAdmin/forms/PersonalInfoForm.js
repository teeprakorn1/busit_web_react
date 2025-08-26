import React from 'react';
import styles from './FormFields.module.css';

function PersonalInfoForm() {
  return (
    <div className={styles.formContainer}>
      <h3>ข้อมูลบุคคล</h3>
      <label>รหัสนักศึกษา *</label>
      <input type="text" className={styles.inputField} />
      <label>ชื่อจริง *</label>
      <input type="text" className={styles.inputField} />
      <label>นามสกุล *</label>
      <input type="text" className={styles.inputField} />
      <label>เบอร์โทรศัพท์</label>
      <input type="text" className={styles.inputField} />
      <label>วันเกิด</label>
      <input type="text" className={styles.inputField} />
      <label>ศาสนา</label>
      <input type="text" className={styles.inputField} />
      <label>ปัญหาสุขภาพ/ข้อมูลทางการแพทย์</label>
      <textarea type="text" className={styles.inputField} rows="3" />
    </div>
  );
}

export default PersonalInfoForm;
