import React from 'react';
import styles from './FormFields.module.css';

function AcademicInfoForm({ formData, setFormData, errors = {} }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const faculties = [
    'บริหารธุรกิจและเทคโนโลยีสารสนเทศ',
  ];

  const academicYears = [
    'อาจารย์ คนดี เมืองทอง', 'อาจารย์ ดาวแดนท์ ทองมี',
  ];

  return (
    <div className={styles.formContainer}>
      <h3 className={styles.formTitle}>ข้อมูลการศึกษา</h3>

      <div className={styles.fieldGroup}>
        <label htmlFor="faculty" className={styles.label}>
          คณะ <span className={styles.required}>*</span>
        </label>
        <select
          id="faculty"
          name="faculty"
          value={formData?.faculty || ''}
          onChange={handleChange}
          className={`${styles.selectField} ${errors.faculty ? styles.error : ''}`}
          required
        >
          <option value="">เลือกคณะ</option>
          {faculties.map((faculty, index) => (
            <option key={index} value={faculty}>{faculty}</option>
          ))}
        </select>
        {errors.faculty && <span className={styles.errorText}>{errors.faculty}</span>}
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="major" className={styles.label}>
          สาขาวิชา <span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          id="major"
          name="major"
          value={formData?.major || ''}
          onChange={handleChange}
          className={`${styles.inputField} ${errors.major ? styles.error : ''}`}
          placeholder="กรอกสาขาวิชา"
          required
        />
        {errors.major && <span className={styles.errorText}>{errors.major}</span>}
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="advisor" className={styles.label}>
          ปีการศึกษา<span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          id="advisor"
          name="advisor"
          value={formData?.advisor || ''}
          onChange={handleChange}
          className={`${styles.inputField} ${errors.advisor ? styles.error : ''}`}
          placeholder="กรอกปีการศึกษา"
          required
        />
        {errors.advisor && <span className={styles.errorText}>{errors.advisor}</span>}
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="academicYear" className={styles.label}>
          อาจารย์ที่ปรึกษา <span className={styles.required}>*</span>
        </label>
        <select
          id="academicYear"
          name="academicYear"
          value={formData?.academicYear || ''}
          onChange={handleChange}
          className={`${styles.selectField} ${errors.academicYear ? styles.error : ''}`}
          required
        >
          <option value="">เลือกอาจารย์ที่ปรึกษา</option>
          {academicYears.map((year, index) => (
            <option key={index} value={year}>{year}</option>
          ))}
        </select>
        {errors.academicYear && <span className={styles.errorText}>{errors.academicYear}</span>}
      </div>
    </div>
  );
}

export default AcademicInfoForm;