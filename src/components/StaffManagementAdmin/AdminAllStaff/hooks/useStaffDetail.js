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

export const useStaffDetail = () => {
  const [staffDetail, setStaffDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageLoadError, setImageLoadError] = useState(false);

  const fetchStaffDetail = useCallback(async (staffId) => {
    if (!staffId) {
      setError('Staff ID is required');
      return;
    }

    const numericStaffId = parseInt(staffId);
    if (isNaN(numericStaffId) || numericStaffId <= 0) {
      setError('รหัสเจ้าหน้าที่ไม่ถูกต้อง');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setStaffDetail(null);
      setImageLoadError(false);

      const response = await axios.get(
        getApiUrl(`/api/admin/staff/${numericStaffId}`),
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
        if (!data || !data.staff) {
          setError('ข้อมูลเจ้าหน้าที่ไม่สมบูรณ์');
          return;
        }

        const transformedStaff = {
          id: data.id,
          email: data.email || '',
          username: data.username || '',
          userType: data.userType || 'staff',
          isActive: Boolean(data.isActive),
          userRegisTime: data.regisTime,
          imageFile: data.imageFile,
          imageUrl: getProfileImageUrl(data.imageFile),
          code: data.staff.code || '',
          firstName: data.staff.firstName || '',
          lastName: data.staff.lastName || '',
          phone: data.staff.phone || '',
          otherPhones: Array.isArray(data.staff.otherPhones)
            ? data.staff.otherPhones.filter(phone =>
              phone &&
              typeof phone === 'object' &&
              phone.phone &&
              phone.phone.trim() !== '' &&
              phone.phone !== 'undefined'
            )
            : [],
          isResigned: Boolean(data.staff.isResigned),
          regisTime: data.staff.regisTime
        };
        setStaffDetail(transformedStaff);

      } else {
        const errorMessage = response.data?.message || 'ไม่สามารถดึงข้อมูลเจ้าหน้าที่ได้';
        console.error('API Error Response:', response.status, errorMessage);
        setError(errorMessage);
      }

    } catch (err) {
      console.error('Fetch staff detail error:', err);

      let errorMessage = 'เกิดข้อผิดพลาดในการโหลดข้อมูลเจ้าหน้าที่';

      if (axios.isAxiosError(err)) {
        if (err.code === 'ECONNABORTED') {
          errorMessage = 'การเชื่อมต่อหมดเวลา กรุณาลองใหม่อีกครั้ง';
        } else if (err.response) {
          const status = err.response.status;
          const serverMessage = err.response.data?.message;

          switch (status) {
            case 400:
              errorMessage = serverMessage || 'รหัสเจ้าหน้าที่ไม่ถูกต้อง';
              break;
            case 401:
              errorMessage = 'กรุณาเข้าสู่ระบบใหม่';
              break;
            case 403:
              errorMessage = 'ไม่มีสิทธิ์เข้าถึงข้อมูลเจ้าหน้าที่นี้';
              break;
            case 404:
              errorMessage = 'ไม่พบข้อมูลเจ้าหน้าที่';
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

  const clearStaffDetail = useCallback(() => {
    setStaffDetail(null);
    setError(null);
    setLoading(false);
    setImageLoadError(false);
  }, []);

  const retryFetch = useCallback((staffId) => {
    if (staffId) {
      fetchStaffDetail(staffId);
    }
  }, [fetchStaffDetail]);

  return {
    staffDetail,
    loading,
    error,
    imageLoadError,
    fetchStaffDetail,
    handleImageError,
    clearStaffDetail,
    retryFetch
  };
};