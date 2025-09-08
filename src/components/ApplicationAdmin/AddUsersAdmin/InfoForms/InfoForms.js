import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import styles from './FormFields.module.css';
import { FiEye, FiEyeOff, FiCheck, FiX } from 'react-icons/fi';

const getApiUrl = (endpoint) => {
    return `${process.env.REACT_APP_SERVER_PROTOCOL}${process.env.REACT_APP_SERVER_BASE_URL}${process.env.REACT_APP_SERVER_PORT}${endpoint}`;
};

function InfoForms({ formData, setFormData, userType = 'student', errors = {} }) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [faculties, setFaculties] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState({
        faculties: false,
        departments: false,
        teachers: false
    });
    const [apiErrors, setApiErrors] = useState({});

    const fetchFaculties = useCallback(async () => {
        setLoading(prev => ({ ...prev, faculties: true }));
        try {
            const response = await axios.get(getApiUrl(process.env.REACT_APP_API_ADMIN_FACULTIES_GET), { withCredentials: true });

            if (response.data.status) {
                setFaculties(response.data.data);
            } else {
                setApiErrors(prev => ({ ...prev, faculties: response.data.message }));
            }
        } catch (error) {
            console.error('Error fetching faculties:', error);
            setApiErrors(prev => ({
                ...prev,
                faculties: error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลคณะ'
            }));
        } finally {
            setLoading(prev => ({ ...prev, faculties: false }));
        }
    }, []);

    const fetchDepartmentsByFaculty = useCallback(async (facultyId) => {
        setLoading(prev => ({ ...prev, departments: true }));
        try {
            const response = await axios.get(getApiUrl(`${process.env.REACT_APP_API_ADMIN_FACULTIES_GET}${facultyId}${process.env.REACT_APP_API_ADMIN_DEPARTMENTS}`),
                { withCredentials: true });

            if (response.data.status) {
                setDepartments(response.data.data);
            } else {
                setApiErrors(prev => ({ ...prev, departments: response.data.message }));
            }
        } catch (error) {
            console.error('Error fetching departments:', error);
            setApiErrors(prev => ({
                ...prev,
                departments: error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลภาควิชา'
            }));
        } finally {
            setLoading(prev => ({ ...prev, departments: false }));
        }
    }, []);

    const fetchTeachersByDepartment = useCallback(async (departmentId) => {
        setLoading(prev => ({ ...prev, teachers: true }));
        try {
            const response = await axios.get(getApiUrl(`${process.env.REACT_APP_API_ADMIN_DEPARTMENTS_GET}${departmentId}${process.env.REACT_APP_API_ADMIN_TEACHERS}`),
                { withCredentials: true });

            if (response.data.status) {
                setTeachers(response.data.data);
            } else {
                setApiErrors(prev => ({ ...prev, teachers: response.data.message }));
            }
        } catch (error) {
            console.error('Error fetching teachers:', error);
            setApiErrors(prev => ({
                ...prev,
                teachers: error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลอาจารย์'
            }));
        } finally {
            setLoading(prev => ({ ...prev, teachers: false }));
        }
    }, []);

    useEffect(() => {
        fetchFaculties();
    }, [fetchFaculties]);

    useEffect(() => {
        if (formData?.facultyId) {
            fetchDepartmentsByFaculty(formData.facultyId);
        } else {
            setDepartments([]);
            setFormData(prev => ({ ...prev, departmentId: '' }));
        }
    }, [formData?.facultyId, fetchDepartmentsByFaculty, setFormData]);

    useEffect(() => {
        if (userType === 'student' && formData?.departmentId) {
            fetchTeachersByDepartment(formData.departmentId);
        }
    }, [formData?.departmentId, userType, fetchTeachersByDepartment]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'facultyId') {
            setFormData(prev => ({
                ...prev,
                [name]: value,
                departmentId: '',
                teacherId: ''
            }));
            return;
        }

        if (name === 'departmentId') {
            setFormData(prev => ({
                ...prev,
                [name]: value,
                teacherId: ''
            }));
            return;
        }

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

            {/* Personal Information */}
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
                        placeholder={
                            userType === 'student'
                                ? 'เช่น 026530461001-6'
                                : 'เช่น 026530461001-6'
                        }
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
                        className={styles.inputField}
                        placeholder="เช่น 0812345678"
                    />
                    {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
                </div>

                <div className={styles.fieldGroup}>
                    <label htmlFor="birthDate" className={styles.label}>
                        วันเกิด
                    </label>
                    <input
                        type="text"
                        id="birthDate"
                        name="birthDate"
                        value={formData?.birthDate || ''}
                        onChange={handleChange}
                        className={styles.inputField}
                        placeholder="เช่น 15-01-2545 (dd-mm-yyyy พ.ศ.)"
                    />
                    {errors.birthDate && <span className={styles.errorText}>{errors.birthDate}</span>}
                    <small className={styles.helpText}>
                        รูปแบบ: dd-mm-yyyy (พ.ศ.) เช่น 15-01-2545
                    </small>
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
                        placeholder="เช่น พุทธ"
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

            {/* Education/Work Information */}
            <div className={styles.formContainer}>
                <h3 className={styles.formTitle}>
                    {userType === 'student' ? 'ข้อมูลการศึกษา' : 'ข้อมูลการทำงาน'}
                </h3>

                <div className={styles.fieldGroup}>
                    <label htmlFor="facultyId" className={styles.label}>
                        คณะ <span className={styles.required}>*</span>
                    </label>
                    <select
                        id="facultyId"
                        name="facultyId"
                        value={formData?.facultyId || ''}
                        onChange={handleChange}
                        className={`${styles.selectField} ${errors.facultyId ? styles.error : ''}`}
                        required
                        disabled={loading.faculties}
                    >
                        <option value="">
                            {loading.faculties ? 'กำลังโหลด...' : 'เลือกคณะ'}
                        </option>
                        {faculties.map((faculty) => (
                            <option key={faculty.Faculty_ID} value={faculty.Faculty_ID}>
                                {faculty.Faculty_Name}
                            </option>
                        ))}
                    </select>
                    {errors.facultyId && <span className={styles.errorText}>{errors.facultyId}</span>}
                    {apiErrors.faculties && <span className={styles.errorText}>{apiErrors.faculties}</span>}
                </div>

                <div className={styles.fieldGroup}>
                    <label htmlFor="departmentId" className={styles.label}>
                        {userType === 'student' ? 'สาขาวิชา' : 'ภาควิชา'} <span className={styles.required}>*</span>
                    </label>
                    <select
                        id="departmentId"
                        name="departmentId"
                        value={formData?.departmentId || ''}
                        onChange={handleChange}
                        className={`${styles.selectField} ${errors.departmentId ? styles.error : ''}`}
                        required
                        disabled={loading.departments || !formData?.facultyId}
                    >
                        <option value="">
                            {loading.departments
                                ? 'กำลังโหลด...'
                                : !formData?.facultyId
                                    ? 'เลือกคณะก่อน'
                                    : userType === 'student' ? 'เลือกสาขาวิชา' : 'เลือกภาควิชา'
                            }
                        </option>
                        {departments.map((dept) => (
                            <option key={dept.Department_ID} value={dept.Department_ID}>
                                {dept.Department_Name}
                            </option>
                        ))}
                    </select>
                    {errors.departmentId && <span className={styles.errorText}>{errors.departmentId}</span>}
                    {apiErrors.departments && <span className={styles.errorText}>{apiErrors.departments}</span>}
                </div>

                {/* Student Information */}
                {userType === 'student' && (
                    <>
                        <div className={styles.fieldGroup}>
                            <label htmlFor="teacherId" className={styles.label}>
                                อาจารย์ที่ปรึกษา <span className={styles.required}>*</span>
                            </label>
                            <select
                                id="teacherId"
                                name="teacherId"
                                value={formData?.teacherId || ''}
                                onChange={handleChange}
                                className={`${styles.selectField} ${errors.teacherId ? styles.error : ''}`}
                                required
                                disabled={loading.teachers || !formData?.departmentId}
                            >
                                <option value="">
                                    {loading.teachers
                                        ? 'กำลังโหลด...'
                                        : !formData?.departmentId
                                            ? 'เลือกภาควิชาก่อน'
                                            : 'เลือกอาจารย์ที่ปรึกษา'
                                    }
                                </option>
                                {teachers.map((t) => (
                                    <option key={t.Teacher_ID} value={t.Teacher_ID}>
                                        {t.Teacher_FullName}{t.Teacher_IsDean === 1 ? ' (คณบดี)' : ' (อาจารย์)'}
                                    </option>
                                ))}

                            </select>
                            {errors.teacherId && <span className={styles.errorText}>{errors.teacherId}</span>}
                            {apiErrors.teachers && <span className={styles.errorText}>{apiErrors.teachers}</span>}
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
                            <small className={styles.helpText}>
                                รองรับทั้ง พ.ศ. (2567) และ ค.ศ. (2024)
                            </small>
                        </div>
                    </>
                )}

                {/* Teacher Information */}
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
                        <small className={styles.helpText}>
                            หากเลือก จะต้องไม่มีคณบดีอื่นในคณะเดียวกัน
                        </small>
                    </div>
                )}
            </div>
        </>
    );
}

export default InfoForms;