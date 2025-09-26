import React, { useState } from 'react';
import styles from '../../../ApplicationAdmin/AddUsersAdmin/InfoForms/FormFields.module.css';
import { FiEye, FiEyeOff, FiCheck, FiX } from 'react-icons/fi';

function StaffForms({ formData, setFormData, errors = {} }) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === 'password') {
            calculatePasswordStrength(value);
        }
    };

    const calculatePasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength += 1;
        if (/[a-z]/.test(password)) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[^a-zA-Z0-9]/.test(password)) strength += 1;
        setPasswordStrength(strength);
    };

    const getPasswordStrengthText = () => {
        switch (passwordStrength) {
            case 0:
            case 1: return 'อ่อนแอ';
            case 2:
            case 3: return 'ปานกลาง';
            case 4:
            case 5: return 'แข็งแกร่ง';
            default: return '';
        }
    };

    const getPasswordStrengthColor = () => {
        switch (passwordStrength) {
            case 0:
            case 1: return '#ef4444';
            case 2:
            case 3: return '#f59e0b';
            case 4:
            case 5: return '#10b981';
            default: return '#e5e7eb';
        }
    };

    const isEmailValid = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    return (
        <>
            {/* Users Information */}
            <div className={styles.formContainer}>
                <h3 className={styles.formTitle}>ข้อมูลบัญชีผู้ใช้</h3>

                <div className={styles.fieldGroup}>
                    <label htmlFor="email" className={styles.label}>
                        อีเมล <span className={styles.required}>*</span>
                    </label>
                    <div className={styles.inputWrapper}>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData?.email || ''}
                            onChange={handleChange}
                            className={`${styles.inputField} ${errors.email ? styles.error : ''}`}
                            placeholder="example@rmutto.ac.th"
                            required
                        />
                        {formData?.email && (
                            <span className={styles.validationIcon}>
                                {isEmailValid(formData.email) ?
                                    <FiCheck className={styles.validIcon} /> :
                                    <FiX className={styles.invalidIcon} />
                                }
                            </span>
                        )}
                    </div>
                    {errors.email && <span className={styles.errorText}>{errors.email}</span>}
                    <small className={styles.helpText}>
                        ชื่อผู้ใช้จะถูกสร้างอัตโนมัติจากส่วนหน้า @ ของอีเมล
                    </small>
                </div>

                <div className={styles.fieldGroup}>
                    <label htmlFor="password" className={styles.label}>
                        รหัสผ่าน <span className={styles.required}>*</span>
                    </label>
                    <div className={styles.passwordWrapper}>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            name="password"
                            value={formData?.password || ''}
                            onChange={handleChange}
                            className={`${styles.inputField} ${errors.password ? styles.error : ''}`}
                            placeholder="กรอกรหัสผ่าน (อย่างน้อย 8 ตัวอักษร)"
                            required
                        />
                        <span
                            onClick={() => setShowPassword(!showPassword)}
                            className={styles.eyeIcon}
                            role="button"
                            tabIndex="0"
                            onKeyDown={(e) => e.key === 'Enter' && setShowPassword(!showPassword)}
                        >
                            {showPassword ? <FiEyeOff /> : <FiEye />}
                        </span>
                    </div>
                    {formData?.password && (
                        <div className={styles.passwordStrength}>
                            <div className={styles.strengthBarContainer}>
                                <div
                                    className={styles.strengthBar}
                                    style={{
                                        width: `${(passwordStrength / 5) * 100}%`,
                                        backgroundColor: getPasswordStrengthColor()
                                    }}
                                />
                            </div>
                            <span
                                className={styles.strengthText}
                                style={{ color: getPasswordStrengthColor() }}
                            >
                                ความแข็งแกร่ง: {getPasswordStrengthText()}
                            </span>
                        </div>
                    )}
                    {errors.password && <span className={styles.errorText}>{errors.password}</span>}
                </div>

                <div className={styles.fieldGroup}>
                    <label htmlFor="confirmPassword" className={styles.label}>
                        ยืนยันรหัสผ่าน <span className={styles.required}>*</span>
                    </label>
                    <div className={styles.passwordWrapper}>
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData?.confirmPassword || ''}
                            onChange={handleChange}
                            className={`${styles.inputField} ${errors.confirmPassword ? styles.error : ''}`}
                            placeholder="ยืนยันรหัสผ่านอีกครั้ง"
                            required
                        />
                        <span
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className={styles.eyeIcon}
                            role="button"
                            tabIndex="0"
                            onKeyDown={(e) => e.key === 'Enter' && setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                        </span>
                    </div>
                    {formData?.confirmPassword && formData?.password && (
                        <div className={styles.passwordMatch}>
                            {formData.password === formData.confirmPassword ?
                                <span className={styles.matchText}>
                                    <FiCheck /> รหัสผ่านตรงกัน
                                </span> :
                                <span className={styles.mismatchText}>
                                    <FiX /> รหัสผ่านไม่ตรงกัน
                                </span>
                            }
                        </div>
                    )}
                    {errors.confirmPassword && <span className={styles.errorText}>{errors.confirmPassword}</span>}
                </div>
            </div>

            {/* Staff Information */}
            <div className={styles.formContainer}>
                <h3 className={styles.formTitle}>ข้อมูลเจ้าหน้าที่</h3>

                <div className={styles.fieldGroup}>
                    <label htmlFor="code" className={styles.label}>
                        รหัสเจ้าหน้าที่ <span className={styles.required}>*</span>
                    </label>
                    <input
                        type="text"
                        id="code"
                        name="code"
                        value={formData?.code || ''}
                        onChange={handleChange}
                        className={`${styles.inputField} ${errors.code ? styles.error : ''}`}
                        placeholder="เช่น 026530461001-6"
                        required
                    />
                    {errors.code && <span className={styles.errorText}>{errors.code}</span>}
                    <small className={styles.helpText}>
                        รูปแบบ: 12 หลัก ตามด้วย - และเลข 1 หลัก
                    </small>
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
                    <label htmlFor="phone" className={styles.label}>
                        เบอร์โทรศัพท์
                    </label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData?.phone || ''}
                        onChange={handleChange}
                        className={`${styles.inputField} ${errors.phone ? styles.error : ''}`}
                        placeholder="เช่น 0812345678"
                    />
                    {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
                    <small className={styles.helpText}>
                        ไม่จำเป็นต้องกรอก แต่ถ้ากรอกต้องเป็นหมายเลข 10 หลัก
                    </small>
                </div>
            </div>
        </>
    );
}

export default StaffForms;