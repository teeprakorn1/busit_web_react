import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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

export const useStaff = () => {
  const [staff, setStaff] = useState([]);
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

  const fetchStaff = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      setSecurityAlert(null);
      const staffParams = {
        includeResigned: params.includeResigned !== undefined ? params.includeResigned : true
      };

      const staffRes = await axios.get(getApiUrl('/api/admin/staff'), {
        withCredentials: true,
        timeout: 15000,
        params: staffParams,
        headers: {
          'Cache-Control': 'no-cache',
          'X-Requested-With': 'XMLHttpRequest'
        },
        validateStatus: (status) => status >= 200 && status < 300
      });

      if (staffRes.data && staffRes.data.status) {
        const transformedStaff = staffRes.data.data.map(staff => ({
          id: staff.Staff_ID,
          code: sanitizeInput(staff.Staff_Code || ''),
          firstName: sanitizeInput(staff.Staff_FirstName || ''),
          lastName: sanitizeInput(staff.Staff_LastName || ''),
          fullName: sanitizeInput(staff.Staff_FullName || ''),
          phone: sanitizeInput(staff.Staff_Phone || ''),
          regisTime: staff.Staff_RegisTime,
          isResigned: Boolean(staff.Staff_IsResign),
          email: sanitizeInput(staff.Users?.Users_Email || ''),
          username: sanitizeInput(staff.Users?.Users_Username || ''),
          userRegisTime: staff.Users?.Users_RegisTime,
          imageFile: sanitizeInput(staff.Users?.Users_ImageFile || ''),
          imageUrl: getProfileImageUrl(staff.Users?.Users_ImageFile),
          isActive: Boolean(staff.Users?.Users_IsActive)
        }));
        setStaff(transformedStaff);
      } else {
        setError('ไม่สามารถโหลดข้อมูลเจ้าหน้าที่ได้: ' + (staffRes.data?.message || 'Unknown error'));
        setStaff([]);
      }

    } catch (err) {
      console.error('Fetch staff error:', err);

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
              errorMessage = 'ไม่พบ API สำหรับดึงข้อมูลเจ้าหน้าที่ กรุณาติดต่อผู้ดูแลระบบ';
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
      setStaff([]);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const toggleStaffStatus = useCallback(async (staff) => {
    if (!staff?.id || !validateId(staff.id)) {
      console.error('Invalid staff ID for status toggle:', staff?.id);
      setSecurityAlert('ตรวจพบการพยายามเข้าถึงข้อมูลไม่ถูกต้อง');
      return { success: false, error: 'Invalid staff ID' };
    }

    try {
      setActionLoading(true);

      const response = await axios.patch(
        getApiUrl(`/api/admin/staff/${staff.id}/status`),
        { isActive: !staff.isActive },
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
        setStaff(prevStaff =>
          prevStaff.map(s =>
            s.id === staff.id
              ? { ...s, isActive: !s.isActive }
              : s
          )
        );

        const action = staff.isActive ? 'ระงับ' : 'เปิด';
        return {
          success: true,
          message: `${action}การใช้งานเรียบร้อยแล้ว`,
          updatedStaff: { ...staff, isActive: !staff.isActive }
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
          errorMessage = 'ไม่มีสิทธิ์เปลี่ยนสถานะเจ้าหน้าที่';
        } else if (error.response?.status === 404) {
          errorMessage = 'ไม่พบข้อมูลเจ้าหน้าที่';
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
      }

      return { success: false, error: errorMessage };
    } finally {
      setActionLoading(false);
    }
  }, []);

  const refreshStaff = useCallback(async (staffId) => {
    if (!validateId(staffId)) {
      console.error('Invalid staff ID for refresh:', staffId);
      return;
    }

    try {
      const response = await axios.get(
        getApiUrl(`/api/admin/staff/${staffId}`),
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
        const updatedStaffData = response.data.data;
        setStaff(prevStaff =>
          prevStaff.map(s =>
            s.id === staffId
              ? {
                ...s,
                isActive: Boolean(updatedStaffData.isActive),
                firstName: sanitizeInput(updatedStaffData.staff?.firstName || s.firstName),
                lastName: sanitizeInput(updatedStaffData.staff?.lastName || s.lastName),
                email: sanitizeInput(updatedStaffData.email || s.email),
                imageFile: sanitizeInput(updatedStaffData.imageFile || s.imageFile),
                imageUrl: getProfileImageUrl(updatedStaffData.imageFile)
              }
              : s
          )
        );
      }
    } catch (error) {
      console.warn('Failed to refresh staff data:', error);
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
    staff,
    loading,
    error,
    actionLoading,
    securityAlert,
    imageLoadErrors,
    fetchStaff,
    toggleStaffStatus,
    refreshStaff,
    handleImageError,
    shouldLoadImage,
    getProfileImageUrl,
    setError,
    setSecurityAlert,
    sanitizeInput,
    validateId
  };
};