import { useState, useCallback } from 'react';
import axios from 'axios';
import { academicYearUtils } from '../utils/academicYearUtils';

const getApiUrl = (endpoint) => {
  const protocol = process.env.REACT_APP_SERVER_PROTOCOL;
  const baseUrl = process.env.REACT_APP_SERVER_BASE_URL;
  const port = process.env.REACT_APP_SERVER_PORT;
  
  if (!protocol || !baseUrl || !port) {
    console.error('Missing environment variables:', { protocol, baseUrl, port });
    throw new Error('Missing required environment variables for API connection');
  }
  
  return `${protocol}${baseUrl}${port}${endpoint}`;
};

export const useStudentDetail = () => {
  const [studentDetail, setStudentDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStudentDetail = useCallback(async (studentId) => {
    // Validate studentId
    if (!studentId) {
      setError('Student ID is required');
      return;
    }

    // Validate studentId is numeric
    const numericStudentId = parseInt(studentId);
    if (isNaN(numericStudentId) || numericStudentId <= 0) {
      setError('รหัสนักศึกษาไม่ถูกต้อง');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setStudentDetail(null);

      console.log('Fetching student detail for ID:', numericStudentId);

      const response = await axios.get(
        getApiUrl(`/api/admin/students/${numericStudentId}`),
        {
          withCredentials: true,
          timeout: 15000,
          headers: {
            'Cache-Control': 'no-cache',
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json'
          },
          validateStatus: (status) => status >= 200 && status < 500 // Allow error status to be handled
        }
      );

      console.log('API Response:', response.status, response.data);

      // Check if response is successful
      if (response.status === 200 && response.data && response.data.status === true) {
        const data = response.data.data;
        
        // Validate required data structure
        if (!data || !data.student) {
          setError('ข้อมูลนักศึกษาไม่สมบูรณ์');
          return;
        }
        
        // Transform data to match StudentModal structure
        const transformedStudent = {
          // Basic user info
          id: data.id,
          email: data.email || '',
          username: data.username || '',
          userType: data.userType || 'student',
          isActive: Boolean(data.isActive),
          userRegisTime: data.regisTime,
          imageFile: data.imageFile,
          
          // Student specific info
          code: data.student.code || '',
          firstName: data.student.firstName || '',
          lastName: data.student.lastName || '',
          phone: data.student.phone || '',
          otherPhones: Array.isArray(data.student.otherPhones) 
            ? data.student.otherPhones.filter(phone => 
                phone && 
                typeof phone === 'object' && 
                phone.phone && 
                phone.phone.trim() !== '' &&
                phone.phone !== 'undefined'
              )
            : [],
          academicYear: data.student.academicYear,
          academicYearBuddhist: data.student.academicYear 
            ? academicYearUtils.convertToBuddhistYear(data.student.academicYear)
            : null,
          birthdate: data.student.birthdate,
          religion: data.student.religion || '',
          medicalProblem: data.student.medicalProblem || '',
          department: data.student.department || '',
          faculty: data.student.faculty || '',
          advisor: data.student.advisor || '',
          isGraduated: Boolean(data.student.isGraduated),
          regisTime: data.student.regisTime,
          studentYear: data.student.academicYear 
            ? academicYearUtils.calculateStudentYear(data.student.academicYear)
            : '',
          
          // Department info (for additional reference if needed)
          departmentInfo: data.department || null
        };

        console.log('Transformed student data:', transformedStudent);
        setStudentDetail(transformedStudent);

      } else {
        // Handle API error responses
        const errorMessage = response.data?.message || 'ไม่สามารถดึงข้อมูลนักศึกษาได้';
        console.error('API Error Response:', response.status, errorMessage);
        setError(errorMessage);
      }

    } catch (err) {
      console.error('Fetch student detail error:', err);
      
      let errorMessage = 'เกิดข้อผิดพลาดในการโหลดข้อมูลนักศึกษา';
      
      if (axios.isAxiosError(err)) {
        if (err.code === 'ECONNABORTED') {
          errorMessage = 'การเชื่อมต่อหมดเวลา กรุณาลองใหม่อีกครั้ง';
        } else if (err.response) {
          // Server responded with error status
          const status = err.response.status;
          const serverMessage = err.response.data?.message;
          
          switch (status) {
            case 400:
              errorMessage = serverMessage || 'รหัสนักศึกษาไม่ถูกต้อง';
              break;
            case 401:
              errorMessage = 'กรุณาเข้าสู่ระบบใหม่';
              // Could redirect to login here
              break;
            case 403:
              errorMessage = 'ไม่มีสิทธิ์เข้าถึงข้อมูลนักศึกษานี้';
              break;
            case 404:
              errorMessage = 'ไม่พบข้อมูลนักศึกษา';
              break;
            case 429:
              errorMessage = 'คำขอเกินขีดจำกัด กรุณารอสักครู่';
              break;
            case 500:
              errorMessage = 'เกิดข้อผิดพลาดในระบบฐานข้อมูล';
              break;
            default:
              errorMessage = serverMessage || `เกิดข้อผิดพลาด (รหัส: ${status})`;
          }
        } else if (err.request) {
          // Network error
          errorMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต';
        }
      } else {
        // Non-axios error
        errorMessage = err.message || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearStudentDetail = useCallback(() => {
    setStudentDetail(null);
    setError(null);
    setLoading(false);
  }, []);

  const retryFetch = useCallback((studentId) => {
    if (studentId) {
      fetchStudentDetail(studentId);
    }
  }, [fetchStudentDetail]);

  return {
    studentDetail,
    loading,
    error,
    fetchStudentDetail,
    clearStudentDetail,
    retryFetch
  };
};