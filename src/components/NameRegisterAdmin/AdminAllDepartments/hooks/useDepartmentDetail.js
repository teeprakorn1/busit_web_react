import { useState, useCallback } from 'react';
import axios from 'axios';

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

export const useDepartmentDetail = () => {
  const [departmentDetail, setDepartmentDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDepartmentDetail = useCallback(async (departmentId) => {
    if (!departmentId) {
      setError('Department ID is required');
      return;
    }

    const numericDepartmentId = parseInt(departmentId);
    if (isNaN(numericDepartmentId) || numericDepartmentId <= 0) {
      setError('รหัสสาขาไม่ถูกต้อง');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setDepartmentDetail(null);
      const response = await axios.get(
        getApiUrl(process.env.REACT_APP_API_ADMIN_DEPARTMENTS_GET),
        {
          withCredentials: true,
          timeout: 15000,
          headers: {
            'Cache-Control': 'no-cache',
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json'
          },
          validateStatus: (status) => status >= 200 && status < 500
        }
      );

      if (response.status === 200 && response.data && response.data.status === true) {
        const departments = response.data.data;
        const targetDepartment = departments.find(dept => dept.Department_ID === numericDepartmentId);
        
        if (!targetDepartment) {
          setError('ไม่พบข้อมูลสาขา');
          return;
        }
        
        let teacherCount = 0;
        let studentCount = 0;

        try {
          const teachersResponse = await axios.get(
            getApiUrl(`${process.env.REACT_APP_API_ADMIN_DEPARTMENTS_GET}${numericDepartmentId}${process.env.REACT_APP_API_ADMIN_TEACHERS}`),
            {
              withCredentials: true,
              timeout: 10000,
              headers: {
                'Cache-Control': 'no-cache',
                'X-Requested-With': 'XMLHttpRequest'
              }
            }
          );
          teacherCount = teachersResponse.data?.count || 0;
        } catch (teacherError) {
          console.warn('Error fetching teacher count:', teacherError);
        }

        try {
          const studentsResponse = await axios.get(
            getApiUrl(process.env.REACT_APP_API_ADMIN_STUDENTS_GET),
            {
              params: { departmentId: numericDepartmentId },
              withCredentials: true,
              timeout: 10000,
              headers: {
                'Cache-Control': 'no-cache',
                'X-Requested-With': 'XMLHttpRequest'
              }
            }
          );
          studentCount = studentsResponse.data?.count || 0;
        } catch (studentError) {
          console.warn('Error fetching student count:', studentError);
        }

        const enhancedDepartment = {
          ...targetDepartment,
          teacher_count: teacherCount,
          student_count: studentCount,
          description: `สาขา${targetDepartment.Department_Name} เป็นหนึ่งในสาขาที่มีความเชี่ยวชาญและประสบการณ์ยาวนานในการจัดการศึกษา มุ่งเน้นการพัฒนานักศึกษาให้มีความรู้ความสามารถและทักษะที่จำเป็นสำหรับการทำงานในยุคดิจิทัล`
        };

        setDepartmentDetail(enhancedDepartment);

      } else {
        const errorMessage = response.data?.message || 'ไม่สามารถดึงข้อมูลสาขาได้';
        console.error('API Error Response:', response.status, errorMessage);
        setError(errorMessage);
      }

    } catch (err) {
      console.error('Fetch department detail error:', err);

      let errorMessage = 'เกิดข้อผิดพลาดในการโหลดข้อมูลสาขา';

      if (axios.isAxiosError(err)) {
        if (err.code === 'ECONNABORTED') {
          errorMessage = 'การเชื่อมต่อหมดเวลา กรุณาลองใหม่อีกครั้ง';
        } else if (err.response) {
          const status = err.response.status;
          const serverMessage = err.response.data?.message;

          switch (status) {
            case 400:
              errorMessage = serverMessage || 'รหัสสาขาไม่ถูกต้อง';
              break;
            case 401:
              errorMessage = 'กรุณาเข้าสู่ระบบใหม่';
              break;
            case 403:
              errorMessage = 'ไม่มีสิทธิ์เข้าถึงข้อมูลสาขานี้';
              break;
            case 404:
              errorMessage = 'ไม่พบข้อมูลสาขา';
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
          errorMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต';
        }
      } else {
        errorMessage = err.message || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearDepartmentDetail = useCallback(() => {
    setDepartmentDetail(null);
    setError(null);
    setLoading(false);
  }, []);

  const retryFetch = useCallback((departmentId) => {
    if (departmentId) {
      fetchDepartmentDetail(departmentId);
    }
  }, [fetchDepartmentDetail]);

  return {
    departmentDetail,
    loading,
    error,
    fetchDepartmentDetail,
    clearDepartmentDetail,
    retryFetch
  };
};