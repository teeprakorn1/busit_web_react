import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  logTeacherStatusChange, 
  logSystemAction,
  logBulkOperation 
} from './../../../..//utils/systemLog';

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

export const useTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [securityAlert, setSecurityAlert] = useState(null);
  const [imageLoadErrors, setImageLoadErrors] = useState(new Set());

  const navigate = useNavigate();

  const handleImageError = useCallback((filename) => {
    setImageLoadErrors(prev => new Set([...prev, filename]));
  }, []);

  const shouldLoadImage = useCallback((filename) => {
    return filename && !imageLoadErrors.has(filename);
  }, [imageLoadErrors]);

  const fetchTeachers = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      setSecurityAlert(null);

      const teacherParams = {
        includeResigned: params.includeResigned !== undefined ? params.includeResigned : true
      };

      if (params.facultyFilter && faculties.length > 0) {
        const sanitizedFaculty = sanitizeInput(params.facultyFilter);
        const selectedFaculty = faculties.find(f => f.Faculty_Name === sanitizedFaculty);
        if (selectedFaculty) {
          teacherParams.facultyId = selectedFaculty.Faculty_ID;
        }
      }

      if (params.departmentFilter && departments.length > 0) {
        const sanitizedDepartment = sanitizeInput(params.departmentFilter);
        const selectedDepartment = departments.find(d => d.Department_Name === sanitizedDepartment);
        if (selectedDepartment) {
          teacherParams.departmentId = selectedDepartment.Department_ID;
        }
      }

      if (params.searchQuery) {
        const sanitizedQuery = sanitizeInput(params.searchQuery);
        if (sanitizedQuery.length >= 2 && sanitizedQuery.length <= 100) {
          teacherParams.search = sanitizedQuery;
        }
      }

      const teachersRes = await axios.get(getApiUrl(process.env.REACT_APP_API_ADMIN_TEACHERS_GET), {
        withCredentials: true,
        timeout: 15000,
        params: teacherParams,
        headers: {
          'Cache-Control': 'no-cache',
          'X-Requested-With': 'XMLHttpRequest'
        },
        validateStatus: (status) => status >= 200 && status < 300
      });

      if (teachersRes.data && teachersRes.data.status) {
        const transformedTeachers = teachersRes.data.data.map(teacher => ({
          id: teacher.Teacher_ID,
          code: sanitizeInput(teacher.Teacher_Code || ''),
          firstName: sanitizeInput(teacher.Teacher_FirstName || ''),
          lastName: sanitizeInput(teacher.Teacher_LastName || ''),
          fullName: sanitizeInput(teacher.Teacher_FullName || ''),
          phone: sanitizeInput(teacher.Teacher_Phone || ''),
          birthdate: teacher.Teacher_Birthdate,
          religion: sanitizeInput(teacher.Teacher_Religion || ''),
          medicalProblem: sanitizeInput(teacher.Teacher_MedicalProblem || ''),
          regisTime: teacher.Teacher_RegisTime,
          isResigned: Boolean(teacher.Teacher_IsResign),
          isDean: Boolean(teacher.Teacher_IsDean),
          department: sanitizeInput(teacher.Department?.Department_Name || ''),
          faculty: sanitizeInput(teacher.Department?.Faculty_Name || ''),
          departmentId: teacher.Department?.Department_ID,
          facultyId: teacher.Department?.Faculty_ID,
          email: sanitizeInput(teacher.Users?.Users_Email || ''),
          username: sanitizeInput(teacher.Users?.Users_Username || ''),
          userRegisTime: teacher.Users?.Users_RegisTime,
          imageFile: sanitizeInput(teacher.Users?.Users_ImageFile || ''),
          imageUrl: getProfileImageUrl(teacher.Users?.Users_ImageFile),
          isActive: Boolean(teacher.Users?.Users_IsActive)
        }));

        setTeachers(transformedTeachers);

        // Log system action for data retrieval (only for filtered searches)
        if (Object.keys(params).length > 1 || params.searchQuery) {
          const searchDescription = `ค้นหาข้อมูลอาจารย์: ${JSON.stringify(params)}`;
          await logSystemAction(0, searchDescription, 'Teacher');
        }
      } else {
        setError('ไม่สามารถโหลดข้อมูลอาจารย์ได้: ' + (teachersRes.data?.message || 'Unknown error'));
        setTeachers([]);
      }

    } catch (err) {
      console.error('Fetch teachers error:', err);

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
              errorMessage = 'ไม่พบ API สำหรับดึงข้อมูลอาจารย์ กรุณาติดต่อผู้ดูแลระบบ';
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
      setTeachers([]);
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

  const toggleTeacherStatus = useCallback(async (teacher) => {
    if (!teacher?.id || !validateId(teacher.id)) {
      console.error('Invalid teacher ID for status toggle:', teacher?.id);
      setSecurityAlert('ตรวจพบการพยายามเข้าถึงข้อมูลไม่ถูกต้อง');
      return { success: false, error: 'Invalid teacher ID' };
    }

    try {
      setActionLoading(true);

      const response = await axios.patch(
        getApiUrl(`${process.env.REACT_APP_API_ADMIN_TEACHERS_GET}/${teacher.id}${process.env.REACT_APP_API_ADMIN_STATUS}`),
        { isActive: !teacher.isActive },
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
        const newStatus = !teacher.isActive;
        const teacherFullName = `${teacher.firstName} ${teacher.lastName}`;

        // Update local state
        setTeachers(prevTeachers =>
          prevTeachers.map(t =>
            t.id === teacher.id
              ? { ...t, isActive: newStatus }
              : t
          )
        );

        // Log the status change to data edit
        const logResult = await logTeacherStatusChange(
          teacher.id,
          teacherFullName,
          newStatus
        );

        if (!logResult.success) {
          console.warn('Failed to log teacher status change:', logResult.error);
        }

        const action = teacher.isActive ? 'ระงับ' : 'เปิด';
        return {
          success: true,
          message: `${action}การใช้งานเรียบร้อยแล้ว`,
          updatedTeacher: { ...teacher, isActive: newStatus }
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
          errorMessage = 'ไม่มีสิทธิ์เปลี่ยนสถานะอาจารย์';
        } else if (error.response?.status === 404) {
          errorMessage = 'ไม่พบข้อมูลอาจารย์';
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
      }

      return { success: false, error: errorMessage };
    } finally {
      setActionLoading(false);
    }
  }, []);

  const refreshTeacher = useCallback(async (teacherId) => {
    if (!validateId(teacherId)) {
      console.error('Invalid teacher ID for refresh:', teacherId);
      return;
    }

    try {
      const response = await axios.get(
        getApiUrl(`${process.env.REACT_APP_API_ADMIN_TEACHERS_GET}/${teacherId}`),
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
        const updatedTeacherData = response.data.data;
        setTeachers(prevTeachers =>
          prevTeachers.map(t =>
            t.id === teacherId
              ? {
                ...t,
                isActive: Boolean(updatedTeacherData.isActive),
                firstName: sanitizeInput(updatedTeacherData.teacher?.firstName || t.firstName),
                lastName: sanitizeInput(updatedTeacherData.teacher?.lastName || t.lastName),
                email: sanitizeInput(updatedTeacherData.email || t.email),
                imageFile: sanitizeInput(updatedTeacherData.imageFile || t.imageFile),
                imageUrl: getProfileImageUrl(updatedTeacherData.imageFile)
              }
              : t
          )
        );

        // Log the refresh action
        await logSystemAction(
          teacherId,
          `รีเฟรชข้อมูลอาจารย์ ID: ${teacherId}`,
          'Teacher'
        );
      }
    } catch (error) {
      console.warn('Failed to refresh teacher data:', error);
    }
  }, []);

  // Function to log bulk operations
  const handleLogBulkOperation = useCallback(async (operationType, affectedCount, details = '') => {
    try {
      await logBulkOperation(operationType, affectedCount, details, 'Teacher');
    } catch (error) {
      console.warn('Failed to log bulk operation:', error);
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
    teachers,
    faculties,
    departments,
    loading,
    error,
    actionLoading,
    securityAlert,
    imageLoadErrors,
    fetchTeachers,
    loadFacultiesAndDepartments,
    toggleTeacherStatus,
    refreshTeacher,
    handleImageError,
    shouldLoadImage,
    getProfileImageUrl,
    setError,
    setSecurityAlert,
    sanitizeInput,
    validateId,
    logBulkOperation: handleLogBulkOperation // Export the wrapped function
  };
};