import React, { useState } from 'react';
import { X, Eye, EyeOff, Lock, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import styles from './ChangePasswordModal.module.css';

const ChangePasswordModal = ({ userData, onClose, onSubmit, loading = false }) => {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState({
    new: false,
    confirm: false
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validatePassword = (password) => {
    const errors = [];

    if (password.length < 8) {
      errors.push('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
    }

    if (!/[a-zA-Z]/.test(password)) {
      errors.push('ต้องมีตัวอักษรอย่างน้อย 1 ตัว');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('ต้องมีตัวเลขอย่างน้อย 1 ตัว (0-9)');
    }

    return errors;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting || loading) return;

    const newErrors = {};
    const passwordErrors = validatePassword(formData.newPassword);
    if (passwordErrors.length > 0) {
      newErrors.newPassword = passwordErrors;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = ['รหัสผ่านไม่ตรงกัน'];
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData.newPassword);
    } catch (error) {
      console.error('Password change failed:', error);
      setErrors({
        general: [error.message || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน']
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-zA-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;

    if (score < 2) return { level: 'weak', text: 'อ่อนแอ', color: '#ef4444' };
    if (score < 4) return { level: 'medium', text: 'ปานกลาง', color: '#f59e0b' };
    return { level: 'strong', text: 'แข็งแรง', color: '#10b981' };
  };

  const passwordStrength = formData.newPassword ? getPasswordStrength(formData.newPassword) : null;
  const getDisplayName = () => {
    if (!userData) return '';
    const profile = userData[userData.userType];
    if (profile && profile.firstName && profile.lastName) {
      return `${profile.firstName} ${profile.lastName}`;
    }
    return userData.username || '';
  };

  const isFormValid = () => {
    const passwordErrors = validatePassword(formData.newPassword);
    return passwordErrors.length === 0 &&
      formData.newPassword === formData.confirmPassword &&
      formData.newPassword.length > 0 &&
      formData.confirmPassword.length > 0;
  };

  return (
    <div className={styles.modalOverlay} onClick={(e) => e.stopPropagation()}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>
            <Lock size={24} />
            <h2>เปลี่ยนรหัสผ่าน</h2>
          </div>
          <button
            className={styles.closeButton}
            onClick={onClose}
            disabled={isSubmitting || loading}
          >
            <X size={24} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.userInfo}>
            <p><strong>ชื่อผู้ใช้:</strong> {userData?.username || '-'}</p>
            <p><strong>ชื่อ-นามสกุล:</strong> {getDisplayName() || '-'}</p>
            <p><strong>ประเภทผู้ใช้:</strong> {
              userData?.userType === 'student' ? 'นักศึกษา' :
                userData?.userType === 'teacher' ? 'อาจารย์' :
                  userData?.userType === 'staff' ? 'เจ้าหน้าที่' : '-'
            }</p>
          </div>

          {errors.general && (
            <div className={styles.generalError}>
              {errors.general.map((error, index) => (
                <div key={index} className={styles.errorMessage}>
                  <AlertCircle size={16} />
                  {error}
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <label htmlFor="newPassword">รหัสผ่านใหม่</label>
              <div className={styles.passwordInput}>
                <input
                  type={showPassword.new ? 'text' : 'password'}
                  id="newPassword"
                  value={formData.newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                  placeholder="กรอกรหัสผ่านใหม่"
                  className={errors.newPassword ? styles.inputError : ''}
                  disabled={isSubmitting || loading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className={styles.togglePassword}
                  onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                  disabled={isSubmitting || loading}
                  tabIndex={-1}
                >
                  {showPassword.new ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {passwordStrength && (
                <div className={styles.passwordStrength}>
                  <div className={styles.strengthBar}>
                    <div
                      className={styles.strengthFill}
                      style={{
                        width: `${(passwordStrength.level === 'weak' ? 33 :
                          passwordStrength.level === 'medium' ? 66 : 100)}%`,
                        backgroundColor: passwordStrength.color
                      }}
                    ></div>
                  </div>
                  <span style={{ color: passwordStrength.color }}>
                    ความแข็งแรง: {passwordStrength.text}
                  </span>
                </div>
              )}

              {errors.newPassword && (
                <div className={styles.errorMessages}>
                  {errors.newPassword.map((error, index) => (
                    <div key={index} className={styles.errorMessage}>
                      <AlertCircle size={16} />
                      {error}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword">ยืนยันรหัสผ่านใหม่</label>
              <div className={styles.passwordInput}>
                <input
                  type={showPassword.confirm ? 'text' : 'password'}
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                  className={errors.confirmPassword ? styles.inputError : ''}
                  disabled={isSubmitting || loading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className={styles.togglePassword}
                  onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                  disabled={isSubmitting || loading}
                  tabIndex={-1}
                >
                  {showPassword.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {formData.confirmPassword && formData.newPassword === formData.confirmPassword && (
                <div className={styles.successMessage}>
                  <CheckCircle size={16} />
                  รหัสผ่านตรงกัน
                </div>
              )}

              {errors.confirmPassword && (
                <div className={styles.errorMessages}>
                  {errors.confirmPassword.map((error, index) => (
                    <div key={index} className={styles.errorMessage}>
                      <AlertCircle size={16} />
                      {error}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.passwordRequirements}>
              <h4>ข้อกำหนดรหัสผ่าน:</h4>
              <ul>
                <li className={formData.newPassword.length >= 8 ? styles.valid : ''}>
                  อย่างน้อย 8 ตัวอักษร
                </li>
                <li className={/[a-zA-Z]/.test(formData.newPassword) ? styles.valid : ''}>
                  ตัวอักษรอย่างน้อย 1 ตัว
                </li>
                <li className={/[0-9]/.test(formData.newPassword) ? styles.valid : ''}>
                  ตัวเลข (0-9)
                </li>
              </ul>
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={onClose}
                disabled={isSubmitting || loading}
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={isSubmitting || loading || !isFormValid()}
              >
                {isSubmitting || loading ? (
                  <>
                    <Loader size={16} className={styles.spinning} />
                    กำลังเปลี่ยน...
                  </>
                ) : (
                  <>
                    <Lock size={16} />
                    เปลี่ยนรหัสผ่าน
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;