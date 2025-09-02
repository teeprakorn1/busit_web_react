import React from 'react';
import styles from './FormFields.module.css';

function PersonalInfoForm({ formData, setFormData, errors = {} }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className={styles.formContainer}>
      <h3 className={styles.formTitle}>ข้อมูลบุคคล</h3>

      <div className={styles.fieldGroup}>
        <label htmlFor="studentId" className={styles.label}>
          รหัสนักศึกษา <span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          id="studentId"
          name="studentId"
          value={formData?.studentId || ''}
          onChange={handleChange}
          className={`${styles.inputField} ${errors.studentId ? styles.error : ''}`}
          placeholder="กรอกรหัสนักศึกษา"
          required
        />
        {errors.studentId && <span className={styles.errorText}>{errors.studentId}</span>}
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="firstName" className={styles.label}>
          ชื่อจริง <span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          id="firstName"
          name="firstName"
          value={formData?.firstName || ''}
          onChange={handleChange}
          className={`${styles.inputField} ${errors.firstName ? styles.error : ''}`}
          placeholder="กรอกชื่อจริง"
          required
        />
        {errors.firstName && <span className={styles.errorText}>{errors.firstName}</span>}
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="lastName" className={styles.label}>
          นามสกุล <span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          id="lastName"
          name="lastName"
          value={formData?.lastName || ''}
          onChange={handleChange}
          className={`${styles.inputField} ${errors.lastName ? styles.error : ''}`}
          placeholder="กรอกนามสกุล"
          required
        />
        {errors.lastName && <span className={styles.errorText}>{errors.lastName}</span>}
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="phoneNumber" className={styles.label}>
          เบอร์โทรศัพท์
        </label>
        <input
          type="tel"
          id="phoneNumber"
          name="phoneNumber"
          value={formData?.phoneNumber || ''}
          onChange={handleChange}
          className={styles.inputField}
          placeholder="08X-XXX-XXXX"
          pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
        />
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="birthDate" className={styles.label}>
          วันเกิด
        </label>
        <input
          type="date"
          id="birthDate"
          name="birthDate"
          value={formData?.birthDate || ''}
          onChange={handleChange}
          className={styles.inputField}
        />
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="religion" className={styles.label}>
          ศาสนา
        </label>
        <select
          id="religion"
          name="religion"
          value={formData?.religion || ''}
          onChange={handleChange}
          className={styles.selectField}
        >
          <option value="">เลือกศาสนา</option>
          <option value="buddhism">พุทธ</option>
          <option value="islam">อิสลาม</option>
          <option value="christianity">คริสต์</option>
          <option value="hinduism">ฮินดู</option>
          <option value="other">อื่นๆ</option>
        </select>
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="medicalInfo" className={styles.label}>
          ปัญหาสุขภาพ/ข้อมูลทางการแพทย์
        </label>
        <textarea
          id="medicalInfo"
          name="medicalInfo"
          value={formData?.medicalInfo || ''}
          onChange={handleChange}
          className={styles.textAreaField}
          rows="4"
          placeholder="กรอกข้อมูลปัญหาสุขภาพหรือข้อมูลทางการแพทย์ที่สำคัญ (หากมี)"
        />
      </div>
    </div>
  );
}

export default PersonalInfoForm;