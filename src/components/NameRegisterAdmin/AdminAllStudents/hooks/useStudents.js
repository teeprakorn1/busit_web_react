import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { academicYearUtils } from '../utils/academicYearUtils';

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.replace(/[<>"'&]/g, '').trim();
};

const validateId = (id) => {
  const numId = parseInt(id, 10);
  return !isNaN(numId) && numId > 0 && numId <= 2147483647;
};

const getApiUrl = (endpoint) => {
  const protocol = process.env.REACT_APP_SERVER_PROTOCOL;
  const baseUrl = process.env.REACT_APP_SERVER_BASE_URL;
  const port = process.env.REACT_APP_SERVER_PORT;

  if (!protocol || !baseUrl || !port) {
    throw new Error('Missing required environment variables');
  }

  return `${protocol}${baseUrl}${port}${endpoint}`;
};

const getProfileImageUrl = (filename) => {
  if (!filename || filename === 'undefined' || filename.trim() === '') {
    return null;
  }

  if (!filename.match(/^[a-zA-Z0-9._-]+$/)) {
    return null;
  }

  const allowedExt = ['.jpg', '.jpeg', '.png'];
  const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();

  if (!allowedExt.includes(ext)) {
    return null;
  }

  return getApiUrl(`${process.env.REACT_APP_API_ADMIN_IMAGES_GET}${filename}`);
};

export const useStudents = () => {
  const [students, setStudents] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [securityAlert, setSecurityAlert] = useState(null);
  const [imageLoadErrors, setImageLoadErrors] = useState(new Set());

  const navigate = useNavigate();

  const availableAcademicYears = useMemo(() => {
    const years = Array.from(new Set(students.map(s => s.academicYear).filter(Boolean)))
      .sort((a, b) => b - a);
    return years;
  }, [students]);

  const availableStudentYears = useMemo(() => {
    const years = Array.from(new Set(students.map(s =>
      academicYearUtils.calculateStudentYear(s.academicYear)
    ).filter(Boolean))).sort();
    return years;
  }, [students]);

  const handleImageError = useCallback((filename) => {
    setImageLoadErrors(prev => new Set([...prev, filename]));
  }, []);

  const shouldLoadImage = useCallback((filename) => {
    return filename && !imageLoadErrors.has(filename);
  }, [imageLoadErrors]);

  const fetchStudents = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      setSecurityAlert(null);

      // แก้ไข: ลบ page และ limit parameters ออก
      const studentParams = {
        includeGraduated: true
      };

      if (params.facultyFilter && faculties.length > 0) {
        const sanitizedFaculty = sanitizeInput(params.facultyFilter);
        const selectedFaculty = faculties.find(f => f.Faculty_Name === sanitizedFaculty);
        if (selectedFaculty) {
          studentParams.facultyId = selectedFaculty.Faculty_ID;
        }
      }

      if (params.departmentFilter && departments.length > 0) {
        const sanitizedDepartment = sanitizeInput(params.departmentFilter);
        const selectedDepartment = departments.find(d => d.Department_Name === sanitizedDepartment);
        if (selectedDepartment) {
          studentParams.departmentId = selectedDepartment.Department_ID;
        }
      }

      if (params.academicYearFilter) {
        const year = parseInt(params.academicYearFilter, 10);
        if (!isNaN(year) && year >= 2000 && year <= 2030) {
          studentParams.academicYear = year;
        }
      }

      if (params.searchQuery) {
        const sanitizedQuery = sanitizeInput(params.searchQuery);
        if (sanitizedQuery.length >= 2 && sanitizedQuery.length <= 100) {
          studentParams.search = sanitizedQuery;
        }
      }

      const studentsRes = await axios.get(getApiUrl(process.env.REACT_APP_API_ADMIN_STUDENTS_GET), {
        withCredentials: true,
        timeout: 15000,
        params: studentParams,
        headers: {
          'Cache-Control': 'no-cache',
          'X-Requested-With': 'XMLHttpRequest'
        },
        validateStatus: (status) => status >= 200 && status < 300
      });

      if (studentsRes.data && studentsRes.data.status) {
        const transformedStudents = studentsRes.data.data.map(student => ({
          id: student.Student_ID,
          code: sanitizeInput(student.Student_Code || ''),
          firstName: sanitizeInput(student.Student_FirstName || ''),
          lastName: sanitizeInput(student.Student_LastName || ''),
          phone: sanitizeInput(student.Student_Phone || ''),
          academicYear: student.Student_AcademicYear,
          birthdate: student.Student_Birthdate,
          religion: sanitizeInput(student.Student_Religion || ''),
          medicalProblem: sanitizeInput(student.Student_MedicalProblem || ''),
          regisTime: student.Student_RegisTime,
          isGraduated: Boolean(student.Student_IsGraduated),
          department: sanitizeInput(student.Department?.Department_Name || ''),
          faculty: sanitizeInput(student.Department?.Faculty_Name || ''),
          email: sanitizeInput(student.Users?.Users_Email || ''),
          username: sanitizeInput(student.Users?.Users_Username || ''),
          userRegisTime: student.Users?.Users_RegisTime,
          imageFile: sanitizeInput(student.Users?.Users_ImageFile || ''),
          imageUrl: getProfileImageUrl(student.Users?.Users_ImageFile),
          isActive: Boolean(student.Users?.Users_IsActive),
          studentYear: academicYearUtils.calculateStudentYear(student.Student_AcademicYear),
          academicYearBuddhist: academicYearUtils.convertToBuddhistYear(student.Student_AcademicYear)
        }));

        setStudents(transformedStudents);
      } else {
        setError('ไม่สามารถโหลดข้อมูลนักศึกษาได้: ' + (studentsRes.data?.message || 'Unknown error'));
        setStudents([]);
      }

    } catch (err) {
      console.error('Fetch students error:', err);

      let errorMessage = 'เกิดข้อผิดพลาดในการโหลดข้อมูล';

      if (axios.isAxiosError(err)) {
        if (err.code === 'ECONNABORTED') {
          errorMessage = 'การเชื่อมต่อหมดเวลา กรุณาลองใหม่อีกครั้ง';
        } else if (err.response) {
          switch (err.response.status) {
            case 401:
              errorMessage = 'กรุณาเข้าสู่ระบบใหม่';
              setTimeout(() => navigate('/login'), 2000);
              break;
            case 403:
              errorMessage = 'ไม่มีสิทธิ์เข้าถึงข้อมูลนี้';
              setSecurityAlert('การเข้าถึงถูกปฏิเสธ - ไม่มีสิทธิ์เพียงพอ');
              break;
            case 404:
              errorMessage = 'ไม่พบ API สำหรับดึงข้อมูลนักศึกษา กรุณาติดต่อผู้ดูแลระบบ';
              break;
            case 429:
              errorMessage = 'คำขอเกินจำนวนที่กำหนด กรุณารอสักครู่แล้วลองใหม่';
              break;
            default:
              errorMessage = err.response.data?.message || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
          }
        } else if (err.request) {
          errorMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้';
        }
      }

      setError(errorMessage);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [faculties, departments, navigate]);

  const loadFacultiesAndDepartments = useCallback(async () => {
    try {
      const [facultiesRes, departmentsRes] = await Promise.all([
        axios.get(getApiUrl(process.env.REACT_APP_API_ADMIN_FACULTIES_GET), {
          withCredentials: true,
          timeout: 10000,
          headers: {
            'Cache-Control': 'no-cache',
            'X-Requested-With': 'XMLHttpRequest'
          }
        }),
        axios.get(getApiUrl(process.env.REACT_APP_API_ADMIN_DEPARTMENTS_GET), {
          withCredentials: true,
          timeout: 10000,
          headers: {
            'Cache-Control': 'no-cache',
            'X-Requested-With': 'XMLHttpRequest'
          }
        })
      ]);

      if (facultiesRes.data?.status) {
        setFaculties(facultiesRes.data.data);
      }
      if (departmentsRes.data?.status) {
        setDepartments(departmentsRes.data.data);
      }
    } catch (err) {
      console.error('Load faculties/departments error:', err);
    }
  }, []);

  const toggleStudentStatus = useCallback(async (student) => {
    if (!student?.id || !validateId(student.id)) {
      console.error('Invalid student ID for status toggle:', student?.id);
      setSecurityAlert('ตรวจพบการพยายามเข้าถึงข้อมูลไม่ถูกต้อง');
      return { success: false, error: 'Invalid student ID' };
    }

    try {
      setActionLoading(true);

      const response = await axios.patch(
        getApiUrl(`${process.env.REACT_APP_API_ADMIN_STUDENTS_GET}/${student.id}${process.env.REACT_APP_API_ADMIN_STATUS}`),
        { isActive: !student.isActive },
        {
          withCredentials: true,
          timeout: 15000,
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          validateStatus: (status) => status >= 200 && status < 300
        }
      );

      if (response.data?.status) {
        setStudents(prevStudents =>
          prevStudents.map(s =>
            s.id === student.id
              ? { ...s, isActive: !s.isActive }
              : s
          )
        );

        const action = student.isActive ? 'ระงับ' : 'เปิด';
        return {
          success: true,
          message: `${action}การใช้งานเรียบร้อยแล้ว`,
          updatedStudent: { ...student, isActive: !student.isActive }
        };
      } else {
        return {
          success: false,
          error: 'ไม่สามารถเปลี่ยนสถานะได้: ' + (response.data?.message || 'Unknown error')
        };
      }
    } catch (error) {
      console.error('Toggle status error:', error);

      let errorMessage = 'เกิดข้อผิดพลาดในการเปลี่ยนสถานะ';

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          errorMessage = 'ไม่มีสิทธิ์เปลี่ยนสถานะนักศึกษา';
        } else if (error.response?.status === 404) {
          errorMessage = 'ไม่พบข้อมูลนักศึกษา';
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
      }

      return { success: false, error: errorMessage };
    } finally {
      setActionLoading(false);
    }
  }, []);

  const refreshStudent = useCallback(async (studentId) => {
    if (!validateId(studentId)) {
      console.error('Invalid student ID for refresh:', studentId);
      return;
    }

    try {
      const response = await axios.get(
        getApiUrl(`${process.env.REACT_APP_API_ADMIN_STUDENTS_GET}/${studentId}`),
        {
          withCredentials: true,
          timeout: 10000,
          headers: {
            'Cache-Control': 'no-cache',
            'X-Requested-With': 'XMLHttpRequest'
          }
        }
      );

      if (response.data?.status) {
        const updatedStudentData = response.data.data;
        setStudents(prevStudents =>
          prevStudents.map(s =>
            s.id === studentId
              ? {
                ...s,
                isActive: Boolean(updatedStudentData.isActive),
                firstName: sanitizeInput(updatedStudentData.student?.firstName || s.firstName),
                lastName: sanitizeInput(updatedStudentData.student?.lastName || s.lastName),
                email: sanitizeInput(updatedStudentData.email || s.email),
                imageFile: sanitizeInput(updatedStudentData.imageFile || s.imageFile),
                imageUrl: getProfileImageUrl(updatedStudentData.imageFile)
              }
              : s
          )
        );
      }
    } catch (error) {
      console.warn('Failed to refresh student data:', error);
    }
  }, []);

  useEffect(() => {
    if (securityAlert) {
      const timer = setTimeout(() => {
        setSecurityAlert(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [securityAlert]);

  return {
    students,
    faculties,
    departments,
    availableAcademicYears,
    availableStudentYears,
    loading,
    error,
    actionLoading,
    securityAlert,
    imageLoadErrors,
    fetchStudents,
    loadFacultiesAndDepartments,
    toggleStudentStatus,
    refreshStudent,
    handleImageError,
    shouldLoadImage,
    getProfileImageUrl,
    setError,
    setSecurityAlert,
    sanitizeInput,
    validateId
  };
};