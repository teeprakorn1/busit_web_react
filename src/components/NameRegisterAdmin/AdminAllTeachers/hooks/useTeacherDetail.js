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

export const useTeacherDetail = () => {
  const [teacherDetail, setTeacherDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageLoadError, setImageLoadError] = useState(false);

  const fetchTeacherDetail = useCallback(async (teacherId) => {
    if (!teacherId) {
      setError('Teacher ID is required');
      return;
    }

    const numericTeacherId = parseInt(teacherId);
    if (isNaN(numericTeacherId) || numericTeacherId <= 0) {
      setError('รหัสอาจารย์ไม่ถูกต้อง');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setTeacherDetail(null);
      setImageLoadError(false);

      const response = await axios.get(
        getApiUrl(`${process.env.REACT_APP_API_ADMIN_TEACHERS_GET}/${numericTeacherId}`),
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
        const data = response.data.data;
        if (!data || !data.teacher) {
          setError('ข้อมูลอาจารย์ไม่สมบูรณ์');
          return;
        }

        const transformedTeacher = {
          id: data.id,
          email: data.email || '',
          username: data.username || '',
          userType: data.userType || 'teacher',
          isActive: Boolean(data.isActive),
          userRegisTime: data.regisTime,
          imageFile: data.imageFile,
          imageUrl: getProfileImageUrl(data.imageFile),
          code: data.teacher.code || '',
          firstName: data.teacher.firstName || '',
          lastName: data.teacher.lastName || '',
          phone: data.teacher.phone || '',
          otherPhones: Array.isArray(data.teacher.otherPhones)
            ? data.teacher.otherPhones.filter(phone =>
              phone &&
              typeof phone === 'object' &&
              phone.phone &&
              phone.phone.trim() !== '' &&
              phone.phone !== 'undefined'
            )
            : [],
          birthdate: data.teacher.birthdate,
          religion: data.teacher.religion || '',
          medicalProblem: data.teacher.medicalProblem || '',
          department: data.teacher.department || '',
          faculty: data.teacher.faculty || '',
          isResigned: Boolean(data.teacher.isResigned),
          isDean: Boolean(data.teacher.isDean),
          regisTime: data.teacher.regisTime,
          departmentInfo: data.department || null
        };
        setTeacherDetail(transformedTeacher);

      } else {
        const errorMessage = response.data?.message || 'ไม่สามารถดึงข้อมูลอาจารย์ได้';
        console.error('API Error Response:', response.status, errorMessage);
        setError(errorMessage);
      }

    } catch (err) {
      console.error('Fetch teacher detail error:', err);

      let errorMessage = 'เกิดข้อผิดพลาดในการโหลดข้อมูลอาจารย์';

      if (axios.isAxiosError(err)) {
        if (err.code === 'ECONNABORTED') {
          errorMessage = 'การเชื่อมต่อหมดเวลา กรุณาลองใหม่อีกครั้ง';
        } else if (err.response) {
          const status = err.response.status;
          const serverMessage = err.response.data?.message;

          switch (status) {
            case 400:
              errorMessage = serverMessage || 'รหัสอาจารย์ไม่ถูกต้อง';
              break;
            case 401:
              errorMessage = 'กรุณาเข้าสู่ระบบใหม่';
              break;
            case 403:
              errorMessage = 'ไม่มีสิทธิ์เข้าถึงข้อมูลอาจารย์นี้';
              break;
            case 404:
              errorMessage = 'ไม่พบข้อมูลอาจารย์';
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

  const handleImageError = useCallback(() => {
    setImageLoadError(true);
  }, []);

  const clearTeacherDetail = useCallback(() => {
    setTeacherDetail(null);
    setError(null);
    setLoading(false);
    setImageLoadError(false);
  }, []);

  const retryFetch = useCallback((teacherId) => {
    if (teacherId) {
      fetchTeacherDetail(teacherId);
    }
  }, [fetchTeacherDetail]);

  return {
    teacherDetail,
    loading,
    error,
    imageLoadError,
    fetchTeacherDetail,
    handleImageError,
    clearTeacherDetail,
    retryFetch
  };
};