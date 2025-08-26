import React from 'react';
import styles from './FormFields.module.css';
import { FiEye, FiEyeOff } from 'react-icons/fi';

function AccountInfoForm({ formData, setFormData, showPassword, setShowPassword }) {
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className={styles.formContainer}>
      <h3>ข้อมูลบัญชีผู้ใช้</h3>
      <label>อีเมล *</label>
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        className={styles.inputField}
      />
      <label>ชื่อผู้ใช้ *</label>
      <input
        type="text"
        name="username"
        value={formData.username}
        onChange={handleChange}
        className={styles.inputField}
      />
      <label>รหัสผ่าน *</label>
      <div className={styles.passwordWrapper}>
        <input
          type={showPassword ? 'text' : 'password'}
          name="password"
          value={formData.password}
          onChange={handleChange}
          className={styles.inputField}
        />
        <span onClick={() => setShowPassword(!showPassword)} className={styles.eyeIcon}>
          {showPassword ? <FiEyeOff /> : <FiEye />}
        </span>
      </div>
    </div>
  );
}

export default AccountInfoForm;
