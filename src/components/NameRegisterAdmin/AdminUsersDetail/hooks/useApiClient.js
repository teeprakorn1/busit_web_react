import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const getApiUrl = (endpoint) => {
  const protocol = process.env.REACT_APP_SERVER_PROTOCOL;
  const baseUrl = process.env.REACT_APP_SERVER_BASE_URL;
  const port = process.env.REACT_APP_SERVER_PORT;

  if (!protocol || !baseUrl || !port) {
    throw new Error('Missing required environment variables');
  }

  return `${protocol}${baseUrl}${port}${endpoint}`;
};

const useApiClient = () => {
  const navigate = useNavigate();

  const handleApiError = useCallback((error, defaultMessage = 'เกิดข้อผิดพลาด') => {
    console.error('API Error:', error);

    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        return 'การเชื่อมต่อหมดเวลา กรุณาลองใหม่อีกครั้ง';
      } else if (error.response) {
        switch (error.response.status) {
          case 400:
            return error.response.data?.message || 'ข้อมูลที่ส่งไม่ถูกต้อง';
          case 401:
            setTimeout(() => navigate('/login'), 2000);
            return 'กรุณาเข้าสู่ระบบใหม่';
          case 403:
            return 'ไม่มีสิทธิ์เข้าถึงข้อมูลนี้';
          case 404:
            return 'ไม่พบข้อมูลที่ต้องการ';
          case 422:
            return 'ข้อมูลที่ส่งไม่ผ่านการตรวจสอบ';
          case 429:
            return 'คำขอเกินจำนวนที่กำหนด กรุณารอสักครู่';
          case 500:
          case 502:
          case 503:
            return 'เซิร์ฟเวอร์ขัดข้อง กรุณาลองใหม่อีกครั้ง';
          default:
            return error.response.data?.message || defaultMessage;
        }
      } else if (error.request) {
        return 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้';
      }
    }

    return error.message || defaultMessage;
  }, [navigate]);

  const fetchUserData = useCallback(async (id, userType) => {
    let apiEndpoint = '';
    switch (userType) {
      case 'student':
        apiEndpoint = `/api/admin/students/${id}`;
        break;
      case 'teacher':
        apiEndpoint = `/api/admin/teachers/${id}`;
        break;
      case 'staff':
        apiEndpoint = `/api/admin/staff/${id}`;
        break;
      default:
        throw new Error('ประเภทผู้ใช้ไม่ถูกต้อง');
    }

    const response = await axios.get(getApiUrl(apiEndpoint), {
      withCredentials: true,
      timeout: 15000,
      headers: {
        'Cache-Control': 'no-cache',
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json'
      },
      validateStatus: (status) => status >= 200 && status < 300
    });

    return response.data;
  }, []);

  const updateUserData = useCallback(async (id, userType, data) => {
    let apiEndpoint = '';
    switch (userType) {
      case 'student':
        apiEndpoint = `/api/admin/students/${id}`;
        break;
      case 'teacher':
        apiEndpoint = `/api/admin/teachers/${id}`;
        break;
      case 'staff':
        apiEndpoint = `/api/admin/staff/${id}`;
        break;
      default:
        throw new Error('ประเภทผู้ใช้ไม่ถูกต้อง');
    }

    const response = await axios.put(getApiUrl(apiEndpoint), data, {
      withCredentials: true,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      validateStatus: (status) => status >= 200 && status < 300
    });

    return response.data;
  }, []);

  const changePassword = useCallback(async (userId, newPassword) => {
    const response = await axios.put(getApiUrl(`/api/admin/users/${userId}/change-password`), {
      newPassword: newPassword
    }, {
      withCredentials: true,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      validateStatus: (status) => status >= 200 && status < 300
    });

    return response.data;
  }, []);

  const updateStudentAssignment = useCallback(async (studentId, departmentId, advisorId) => {
    const response = await axios.put(getApiUrl(`/api/admin/students/${studentId}/assignment`), {
      Department_ID: parseInt(departmentId),
      Teacher_ID: parseInt(advisorId)
    }, { withCredentials: true });

    return response.data;
  }, []);

  return {
    getApiUrl,
    handleApiError,
    fetchUserData,
    updateUserData,
    changePassword,
    updateStudentAssignment
  };
};

export default useApiClient;