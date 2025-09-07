import React, { useState } from 'react';
import styles from './FormFields.module.css';
import { FiEye, FiEyeOff, FiCheck, FiX } from 'react-icons/fi';

function InfoForms({ formData, setFormData, userType = 'student', errors = {} }) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
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

    // ข้อมูลคณะและสาขา
    const faculties = [
        'บริหารธุรกิจและเทคโนโลยีสารสนเทศ',
        'วิศวกรรมศาสตร์',
        'เทคโนโลยีการเกษตร',
        'อุตสาหกรรมเกษตร'
    ];

    const departments = {
        student: [
            'วิทยาการคอมพิวเตอร์', 
            'เทคโนโลยีสารสนเทศ', 
            'การจัดการธุรกิจดิจิทัล', 
            'การตลาดดิจิทัล', 
            'การจัดการทรัพยากรมนุษย์', 
            'การเงินและการลงทุน', 
            'บัญชี'
        ],
        teacher: [
            'ภาควิชาเทคโนโลยีสารสนเทศ',
            'ภาควิชาการจัดการธุรกิจ',
            'ภาควิชาการบัญชีและการเงิน',
            'ภาควิชาการตลาด'
        ]
    };

    const teacherAdvisors = [
        'อาจารย์ คนดี เมืองทอง', 
        'อาจารย์ ดาวแดนท์ ทองมี',
        'อาจารย์ สมชาย ใจดี',
        'อาจารย์ สมหญิง เก่งมาก'
    ];

    return (
        <>
            {/* ข้อมูลบัญชีผู้ใช้ */}
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

            {/* ข้อมูลส่วนตัว */}
            <div className={styles.formContainer}>
                <h3 className={styles.formTitle}>ข้อมูลส่วนตัว</h3>

                <div className={styles.fieldGroup}>
                    <label htmlFor="code" className={styles.label}>
                        {userType === 'student' ? 'รหัสนักศึกษา' : 'รหัสอาจารย์'} <span className={styles.required}>*</span>
                    </label>
                    <input
                        type="text"
                        id="code"
                        name="code"
                        value={formData?.code || ''}
                        onChange={handleChange}
                        className={`${styles.inputField} ${errors.code ? styles.error : ''}`}
                        placeholder={userType === 'student' ? 'กรอกรหัสนักศึกษา' : 'กรอกรหัสอาจารย์'}
                        required
                    />
                    {errors.code && <span className={styles.errorText}>{errors.code}</span>}
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
                        className={styles.inputField}
                        placeholder="กรอกเบอร์โทรศัพท์"
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
                    <input
                        type="text"
                        id="religion"
                        name="religion"
                        value={formData?.religion || ''}
                        onChange={handleChange}
                        className={styles.inputField}
                        placeholder="กรอกศาสนา"
                    />
                </div>

                <div className={styles.fieldGroup}>
                    <label htmlFor="medicalProblem" className={styles.label}>
                        ข้อมูลทางการแพทย์/ปัญหาสุขภาพ
                    </label>
                    <textarea
                        id="medicalProblem"
                        name="medicalProblem"
                        value={formData?.medicalProblem || ''}
                        onChange={handleChange}
                        className={styles.textAreaField}
                        placeholder="กรอกข้อมูลทางการแพทย์หรือปัญหาสุขภาพ (ถ้ามี)"
                        rows="3"
                    />
                </div>
            </div>

            {/* ข้อมูลการศึกษา/การทำงาน */}
            <div className={styles.formContainer}>
                <h3 className={styles.formTitle}>
                    {userType === 'student' ? 'ข้อมูลการศึกษา' : 'ข้อมูลการทำงาน'}
                </h3>

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
                    <label htmlFor="department" className={styles.label}>
                        {userType === 'student' ? 'สาขาวิชา' : 'ภาควิชา'} <span className={styles.required}>*</span>
                    </label>
                    <select
                        id="department"
                        name="department"
                        value={formData?.department || ''}
                        onChange={handleChange}
                        className={`${styles.selectField} ${errors.department ? styles.error : ''}`}
                        required
                    >
                        <option value="">{userType === 'student' ? 'เลือกสาขาวิชา' : 'เลือกภาควิชา'}</option>
                        {departments[userType].map((dept, index) => (
                            <option key={index} value={dept}>{dept}</option>
                        ))}
                    </select>
                    {errors.department && <span className={styles.errorText}>{errors.department}</span>}
                </div>

                {/* ฟิลด์สำหรับนักศึกษา */}
                {userType === 'student' && (
                    <>
                        <div className={styles.fieldGroup}>
                            <label htmlFor="teacherAdvisor" className={styles.label}>
                                อาจารย์ที่ปรึกษา <span className={styles.required}>*</span>
                            </label>
                            <select
                                id="teacherAdvisor"
                                name="teacherAdvisor"
                                value={formData?.teacherAdvisor || ''}
                                onChange={handleChange}
                                className={`${styles.selectField} ${errors.teacherAdvisor ? styles.error : ''}`}
                                required
                            >
                                <option value="">เลือกอาจารย์ที่ปรึกษา</option>
                                {teacherAdvisors.map((advisor, index) => (
                                    <option key={index} value={advisor}>{advisor}</option>
                                ))}
                            </select>
                            {errors.teacherAdvisor && <span className={styles.errorText}>{errors.teacherAdvisor}</span>}
                        </div>

                        <div className={styles.fieldGroup}>
                            <label htmlFor="academicYear" className={styles.label}>
                                ปีการศึกษา <span className={styles.required}>*</span>
                            </label>
                            <input
                                type="text"
                                id="academicYear"
                                name="academicYear"
                                value={formData?.academicYear || ''}
                                onChange={handleChange}
                                className={`${styles.inputField} ${errors.academicYear ? styles.error : ''}`}
                                placeholder="เช่น 2567"
                                required
                            />
                            {errors.academicYear && <span className={styles.errorText}>{errors.academicYear}</span>}
                        </div>
                    </>
                )}

                {/* ฟิลด์สำหรับอาจารย์ */}
                {userType === 'teacher' && (
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>
                            <input
                                type="checkbox"
                                name="isDean"
                                checked={formData?.isDean || false}
                                onChange={handleChange}
                                style={{ marginRight: '8px' }}
                            />
                            เป็นคณบดี
                        </label>
                    </div>
                )}
            </div>
        </>
    );
}

export default InfoForms;