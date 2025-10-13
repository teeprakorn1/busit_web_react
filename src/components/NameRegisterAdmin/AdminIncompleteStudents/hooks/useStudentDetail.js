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

export const useStudentDetail = () => {
  const [studentDetail, setStudentDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageLoadError, setImageLoadError] = useState(false);

  const fetchStudentDetail = useCallback(async (studentId) => {
    if (!studentId) {
      setError('Student ID is required');
      return;
    }

    const numericStudentId = parseInt(studentId);
    if (isNaN(numericStudentId) || numericStudentId <= 0) {
      setError('รหัสนักศึกษาไม่ถูกต้อง');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setStudentDetail(null);
      setImageLoadError(false);

      const response = await axios.get(
        getApiUrl(`${process.env.REACT_APP_API_ADMIN_STUDENTS_GET}/${numericStudentId}`),
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
        if (!data || !data.student) {
          setError('ข้อมูลนักศึกษาไม่สมบูรณ์');
          return;
        }

        const completedActivities =
          data.student.completedActivities ||
          data.student.completed_activities ||
          data.completedActivities ||
          data.completed_activities ||
          0;

        const activities = Array.isArray(data.activities) ? data.activities : [];
        const transformedStudent = {
          id: data.id,
          email: data.email || '',
          username: data.username || '',
          userType: data.userType || 'student',
          isActive: Boolean(data.isActive),
          userRegisTime: data.regisTime,
          imageFile: data.imageFile,
          imageUrl: getProfileImageUrl(data.imageFile),
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
          departmentInfo: data.department || null,
          completedActivities: completedActivities,
          totalActivities: 10,
          activityStatus: completedActivities >= 10 ? 'complete' : 'incomplete',
          activityProgress: Math.min(Math.round((completedActivities / 10) * 100), 100),
          activities: activities.map(act => ({
            id: act.id || act.Activity_ID,
            title: act.title || act.Activity_Title || 'ไม่มีชื่อกิจกรรม',
            type: act.type || act.ActivityType_Name || null,
            date: act.date || act.startTime || act.Activity_StartTime,
            startTime: act.startTime || act.Activity_StartTime,
            endTime: act.endTime || act.Activity_EndTime,
            approvedDate: act.approvedDate || act.RegistrationPicture_ApprovedTime
          }))
        };
        setStudentDetail(transformedStudent);

      } else {
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
          const status = err.response.status;
          const serverMessage = err.response.data?.message;

          switch (status) {
            case 400:
              errorMessage = serverMessage || 'รหัสนักศึกษาไม่ถูกต้อง';
              break;
            case 401:
              errorMessage = 'กรุณาเข้าสู่ระบบใหม่';
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

  const clearStudentDetail = useCallback(() => {
    setStudentDetail(null);
    setError(null);
    setLoading(false);
    setImageLoadError(false);
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
    imageLoadError,
    fetchStudentDetail,
    handleImageError,
    clearStudentDetail,
    retryFetch
  };
};