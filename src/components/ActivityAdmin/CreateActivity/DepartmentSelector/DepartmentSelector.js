import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './DepartmentSelector.module.css';
import { FiChevronDown, FiChevronUp, FiCheck, FiUsers } from 'react-icons/fi';

function DepartmentSelector({ selectedDepartments, onDepartmentsChange, errors = {} }) {
    const [faculties, setFaculties] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [expandedFaculties, setExpandedFaculties] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);

                const getApiUrl = (endpoint) => {
                    return `${process.env.REACT_APP_SERVER_PROTOCOL}${process.env.REACT_APP_SERVER_BASE_URL}${process.env.REACT_APP_SERVER_PORT}${endpoint}`;
                };

                const facultiesRes = await axios.get(
                    getApiUrl('/api/admin/faculties'),
                    { withCredentials: true }
                );

                const departmentsRes = await axios.get(
                    getApiUrl('/api/admin/departments'),
                    { withCredentials: true }
                );

                if (facultiesRes.data.status) {
                    setFaculties(facultiesRes.data.data);
                }

                if (departmentsRes.data.status) {
                    setDepartments(departmentsRes.data.data);
                }

                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const toggleFaculty = (facultyId) => {
        setExpandedFaculties(prev =>
            prev.includes(facultyId)
                ? prev.filter(id => id !== facultyId)
                : [...prev, facultyId]
        );
    };

    const getDepartmentsByFaculty = (facultyId) => {
        return departments.filter(dept => dept.Faculty_ID === facultyId);
    };

    const isDepartmentSelected = (departmentId) => {
        return selectedDepartments.includes(departmentId);
    };

    const isAllFacultySelected = (facultyId) => {
        const facultyDepts = getDepartmentsByFaculty(facultyId);
        if (facultyDepts.length === 0) return false;
        return facultyDepts.every(dept => isDepartmentSelected(dept.Department_ID));
    };

    const isSomeFacultySelected = (facultyId) => {
        const facultyDepts = getDepartmentsByFaculty(facultyId);
        if (facultyDepts.length === 0) return false;
        const selectedCount = facultyDepts.filter(dept =>
            isDepartmentSelected(dept.Department_ID)
        ).length;
        return selectedCount > 0 && selectedCount < facultyDepts.length;
    };

    const toggleDepartment = (departmentId) => {
        const newSelected = isDepartmentSelected(departmentId)
            ? selectedDepartments.filter(id => id !== departmentId)
            : [...selectedDepartments, departmentId];

        onDepartmentsChange(newSelected);
    };

    const toggleFacultyDepartments = (facultyId) => {
        const facultyDepts = getDepartmentsByFaculty(facultyId);
        const facultyDeptIds = facultyDepts.map(dept => dept.Department_ID);

        if (isAllFacultySelected(facultyId)) {
            const newSelected = selectedDepartments.filter(
                id => !facultyDeptIds.includes(id)
            );
            onDepartmentsChange(newSelected);
        } else {
            const newSelected = [...new Set([...selectedDepartments, ...facultyDeptIds])];
            onDepartmentsChange(newSelected);
        }
    };

    const selectAll = () => {
        const allDeptIds = departments.map(dept => dept.Department_ID);
        onDepartmentsChange(allDeptIds);
    };

    const clearAll = () => {
        onDepartmentsChange([]);
    };

    if (isLoading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>กำลังโหลดข้อมูลคณะและสาขา...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleSection}>
                    <FiUsers className={styles.titleIcon} />
                    <h3 className={styles.title}>เลือกคณะและสาขาที่เข้าร่วม</h3>
                </div>
                <div className={styles.actions}>
                    <button
                        type="button"
                        onClick={selectAll}
                        className={styles.selectAllBtn}
                    >
                        <FiCheck /> เลือกทั้งหมด
                    </button>
                    <button
                        type="button"
                        onClick={clearAll}
                        className={styles.clearAllBtn}
                    >
                        ล้างการเลือก
                    </button>
                </div>
            </div>

            {selectedDepartments.length > 0 && (
                <div className={styles.selectedCount}>
                    เลือกแล้ว: <strong>{selectedDepartments.length}</strong> สาขา
                </div>
            )}

            {errors.departments && (
                <div className={styles.errorText}>{errors.departments}</div>
            )}

            <div className={styles.facultyList}>
                {faculties.map(faculty => {
                    const facultyDepts = getDepartmentsByFaculty(faculty.Faculty_ID);
                    const isExpanded = expandedFaculties.includes(faculty.Faculty_ID);
                    const isAllSelected = isAllFacultySelected(faculty.Faculty_ID);
                    const isSomeSelected = isSomeFacultySelected(faculty.Faculty_ID);

                    return (
                        <div key={faculty.Faculty_ID} className={styles.facultyItem}>
                            <div className={styles.facultyHeader}>
                                <div className={styles.facultyLeft}>
                                    <label className={styles.checkboxLabel}>
                                        <input
                                            type="checkbox"
                                            checked={isAllSelected}
                                            onChange={() => toggleFacultyDepartments(faculty.Faculty_ID)}
                                            className={`${styles.checkbox} ${isSomeSelected ? styles.indeterminate : ''}`}
                                            ref={input => {
                                                if (input) {
                                                    input.indeterminate = isSomeSelected;
                                                }
                                            }}
                                        />
                                        <span className={styles.facultyName}>
                                            {faculty.Faculty_Name}
                                        </span>
                                    </label>
                                    <span className={styles.deptCount}>
                                        ({facultyDepts.length} สาขา)
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => toggleFaculty(faculty.Faculty_ID)}
                                    className={styles.expandBtn}
                                >
                                    {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                                </button>
                            </div>

                            {isExpanded && (
                                <div className={styles.departmentList}>
                                    {facultyDepts.length > 0 ? (
                                        facultyDepts.map(dept => (
                                            <label
                                                key={dept.Department_ID}
                                                className={styles.departmentItem}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isDepartmentSelected(dept.Department_ID)}
                                                    onChange={() => toggleDepartment(dept.Department_ID)}
                                                    className={styles.checkbox}
                                                />
                                                <span className={styles.departmentName}>
                                                    {dept.Department_Name}
                                                </span>
                                            </label>
                                        ))
                                    ) : (
                                        <div className={styles.noDepartments}>
                                            ไม่มีสาขาในคณะนี้
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className={styles.helpText}>
                <strong>คำแนะนำ:</strong> คลิกที่คณะเพื่อเลือก/ยกเลิกสาขาทั้งหมดในคณะ
                หรือคลิกที่ปุ่มขยายเพื่อเลือกสาขาเฉพาะ
            </div>
        </div>
    );
}

export default DepartmentSelector;