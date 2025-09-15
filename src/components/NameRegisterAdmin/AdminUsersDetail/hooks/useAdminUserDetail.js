import { useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.replace(/[<>"'&]/g, '').trim();
};

const validateId = (id) => {
  const numId = parseInt(id, 10);
  return !isNaN(numId) && numId > 0 && numId <= 2147483647;
};

const validateUserType = (userType) => {
  const allowedTypes = ['student', 'teacher', 'staff'];
  return allowedTypes.includes(userType);
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

const fetchImageWithCredentials = async (imageUrl) => {
  try {
    const response = await fetch(imageUrl, {
      method: 'GET',
      credentials: 'include',
      mode: 'cors',
      headers: {
        'Accept': 'image/*',
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Failed to fetch image:', error);
    return null;
  }
};

const detectUserTypeFromPath = (pathname) => {
  if (pathname.includes('/student-')) return 'student';
  if (pathname.includes('/teacher-')) return 'teacher';
  if (pathname.includes('/staff-')) return 'staff';
  return 'student';
};

const useAdminUserDetail = (id) => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [securityAlert, setSecurityAlert] = useState(null);
  const [imageLoadErrors, setImageLoadErrors] = useState(new Set());
  const [imageUrls, setImageUrls] = useState(new Map());

  const navigate = useNavigate();
  const location = useLocation();

  const handleImageError = useCallback((filename) => {
    setImageLoadErrors(prev => new Set([...prev, filename]));
  }, []);

  const shouldLoadImage = useCallback((filename) => {
    return filename && !imageLoadErrors.has(filename);
  }, [imageLoadErrors]);

  const loadImageWithCredentials = useCallback(async (filename) => {
    if (!filename || imageLoadErrors.has(filename) || imageUrls.has(filename)) {
      return imageUrls.get(filename) || null;
    }

    const imageUrl = getProfileImageUrl(filename);
    if (!imageUrl) return null;

    try {
      const blobUrl = await fetchImageWithCredentials(imageUrl);
      if (blobUrl) {
        setImageUrls(prev => new Map(prev.set(filename, blobUrl)));
        return blobUrl;
      } else {
        setImageLoadErrors(prev => new Set([...prev, filename]));
        return null;
      }
    } catch (error) {
      console.error('Error loading image:', error);
      setImageLoadErrors(prev => new Set([...prev, filename]));
      return null;
    }
  }, [imageLoadErrors, imageUrls]);

  useEffect(() => {
    return () => {
      imageUrls.forEach(blobUrl => {
        if (blobUrl && blobUrl.startsWith('blob:')) {
          URL.revokeObjectURL(blobUrl);
        }
      });
    };
  }, [imageUrls]);

  const validateAndSanitizeId = useCallback((rawId) => {
    if (!rawId) {
      throw new Error('ไม่พบรหัสผู้ใช้');
    }

    const sanitizedId = sanitizeInput(rawId.toString());

    if (!validateId(sanitizedId)) {
      throw new Error('รหัสผู้ใช้ไม่ถูกต้อง');
    }

    return parseInt(sanitizedId, 10);
  }, []);

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setSecurityAlert(null);

      let validatedId;
      try {
        validatedId = validateAndSanitizeId(id);
      } catch (validationError) {
        setError(validationError.message);
        setLoading(false);
        return;
      }
      let userType = 'student';
      if (location.state?.userData?.userType) {
        const stateUserType = sanitizeInput(location.state.userData.userType);
        if (validateUserType(stateUserType)) {
          userType = stateUserType;
        }
      } else {
        userType = detectUserTypeFromPath(location.pathname);
      }

      let apiEndpoint = '';
      switch (userType) {
        case 'student':
          apiEndpoint = `/api/admin/students/${validatedId}`;
          break;
        case 'teacher':
          apiEndpoint = `/api/admin/teachers/${validatedId}`;
          break;
        case 'staff':
          apiEndpoint = `/api/admin/staff/${validatedId}`;
          break;
        default:
          apiEndpoint = `/api/admin/students/${validatedId}`;
      }

      const response = await axios.get(getApiUrl(apiEndpoint), {
        withCredentials: true,
        timeout: 15000,
        headers: {
          'Cache-Control': 'no-cache',
          'X-Requested-With': 'XMLHttpRequest',
          'Content-Type': 'application/json'
        },
        validateStatus: (status) => {
          return status >= 200 && status < 300;
        }
      });

      if (response.data && response.data.status) {
        const receivedData = response.data.data;
        if (!receivedData || typeof receivedData !== 'object') {
          throw new Error('ข้อมูลที่ได้รับไม่ถูกต้อง');
        }

        if (receivedData.id !== validatedId) {
          setSecurityAlert('ตรวจพบการพยายามเข้าถึงข้อมูลไม่ถูกต้อง');
          throw new Error('ข้อมูลไม่ตรงกับที่ร้องขอ');
        }
        let processedData = { ...receivedData };
        if (userType === 'teacher' && receivedData.teacher) {
          processedData = {
            ...receivedData,
            userType: 'teacher',
            teacher: {
              ...receivedData.teacher,
              position: receivedData.teacher.isDean ? 'คณบดี' : 'อาจารย์',
              isResigned: receivedData.teacher.isResigned || false,
              isDean: receivedData.teacher.isDean || false
            }
          };
        }

        processedData.imageUrl = getProfileImageUrl(processedData.imageFile);
        processedData.originalImageFile = processedData.imageFile;
        setUserData(processedData);

        if (processedData.imageFile) {
          loadImageWithCredentials(processedData.imageFile);
        }
      } else {
        setError(response.data?.message || 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
      }

    } catch (err) {
      console.error('Fetch user data error:', err);

      let errorMessage = 'เกิดข้อผิดพลาดในการโหลดข้อมูล';

      if (axios.isAxiosError(err)) {
        if (err.code === 'ECONNABORTED') {
          errorMessage = 'การเชื่อมต่อหมดเวลา กรุณาลองใหม่อีกครั้ง';
        } else if (err.response) {
          switch (err.response.status) {
            case 400:
              errorMessage = 'ข้อมูลที่ร้องขอไม่ถูกต้อง';
              break;
            case 401:
              errorMessage = 'กรุณาเข้าสู่ระบบใหม่';
              setTimeout(() => navigate('/login'), 2000);
              break;
            case 403:
              errorMessage = 'ไม่มีสิทธิ์เข้าถึงข้อมูลนี้';
              setSecurityAlert('การเข้าถึงถูกปฏิเสธ - ไม่มีสิทธิ์เพียงพอ');
              break;
            case 404:
              errorMessage = 'ไม่พบข้อมูลผู้ใช้ที่ต้องการ';
              break;
            case 429:
              errorMessage = 'คำขอเกินจำนวนที่กำหนด กรุณารอสักครู่แล้วลองใหม่';
              break;
            case 500:
            case 502:
            case 503:
              errorMessage = 'เซิร์ฟเวอร์ขัดข้อง กรุณาลองใหม่อีกครั้ง';
              break;
            default:
              errorMessage = err.response.data?.message || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
          }
        } else if (err.request) {
          errorMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้';
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [id, location.state, location.pathname, validateAndSanitizeId, navigate, loadImageWithCredentials]);

  const handleUserDataUpdate = useCallback(async (updatedData) => {
    try {
      setUpdateLoading(true);
      setError(null);
      setSecurityAlert(null);

      if (!updatedData || typeof updatedData !== 'object') {
        throw new Error('ข้อมูลที่ส่งไม่ถูกต้อง');
      }

      const validatedId = validateAndSanitizeId(id);
      const userType = userData?.userType;

      if (!validateUserType(userType)) {
        throw new Error('ประเภทผู้ใช้ไม่ถูกต้อง');
      }

      const sanitizedData = {};
      if (updatedData[userType]) {
        const formData = updatedData[userType];
        sanitizedData[userType] = {
          ...formData,
          firstName: sanitizeInput(formData.firstName || ''),
          lastName: sanitizeInput(formData.lastName || ''),
          code: sanitizeInput(formData.code || ''),
          phone: sanitizeInput(formData.phone || ''),
          religion: sanitizeInput(formData.religion || ''),
          medicalProblem: sanitizeInput(formData.medicalProblem || ''),
          otherPhones: Array.isArray(formData.otherPhones)
            ? formData.otherPhones.map(phone => ({
              name: sanitizeInput(phone.name || ''),
              phone: sanitizeInput(phone.phone || '')
            }))
            : []
        };

        if (userType === 'teacher') {
          sanitizedData[userType] = {
            ...sanitizedData[userType],
            isDean: formData.position === 'คณบดี' || formData.isDean,
            isResigned: formData.isResigned || false
          };
        }

        if (!sanitizedData[userType].firstName || !sanitizedData[userType].lastName) {
          throw new Error('ชื่อและนามสกุลเป็นข้อมูลที่จำเป็น');
        }

        const phoneRegex = /^[0-9-+\s()]*$/;
        if (sanitizedData[userType].phone && !phoneRegex.test(sanitizedData[userType].phone)) {
          throw new Error('หมายเลขโทรศัพท์ไม่ถูกต้อง');
        }

        for (const phone of sanitizedData[userType].otherPhones) {
          if (phone.phone && !phoneRegex.test(phone.phone)) {
            throw new Error('หมายเลขโทรศัพท์เพิ่มเติมไม่ถูกต้อง');
          }
        }
      }

      let apiEndpoint = '';
      switch (userType) {
        case 'student':
          apiEndpoint = `/api/admin/students/${validatedId}`;
          break;
        case 'teacher':
          apiEndpoint = `/api/admin/teachers/${validatedId}`;
          break;
        case 'staff':
          apiEndpoint = `/api/admin/staff/${validatedId}`;
          break;
        default:
          throw new Error('ประเภทผู้ใช้ไม่ถูกต้อง');
      }

      const response = await axios.put(getApiUrl(apiEndpoint), sanitizedData, {
        withCredentials: true,
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        validateStatus: (status) => status >= 200 && status < 300
      });

      if (response.data && response.data.status) {
        await fetchUserData();
      } else {
        setError(response.data?.message || 'ไม่สามารถอัพเดทข้อมูลได้');
      }

    } catch (err) {
      console.error('Update user data error:', err);

      let errorMessage = 'เกิดข้อผิดพลาดในการอัพเดทข้อมูล';

      if (axios.isAxiosError(err)) {
        if (err.code === 'ECONNABORTED') {
          errorMessage = 'การเชื่อมต่อหมดเวลา กรุณาลองใหม่อีกครั้ง';
        } else if (err.response) {
          switch (err.response.status) {
            case 400:
              errorMessage = 'ข้อมูลที่ส่งไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง';
              break;
            case 401:
              errorMessage = 'กรุณาเข้าสู่ระบบใหม่';
              setTimeout(() => navigate('/login'), 2000);
              break;
            case 403:
              errorMessage = 'ไม่มีสิทธิ์แก้ไขข้อมูลนี้';
              setSecurityAlert('การแก้ไขถูกปฏิเสธ - ไม่มีสิทธิ์เพียงพอ');
              break;
            case 404:
              errorMessage = 'ไม่พบข้อมูลผู้ใช้ที่ต้องการแก้ไข';
              break;
            case 422:
              errorMessage = 'ข้อมูลที่ส่งไม่ผ่านการตรวจสอบ';
              break;
            case 429:
              errorMessage = 'คำขอเกินจำนวนที่กำหนด กรุณารอสักครู่';
              break;
            default:
              errorMessage = err.response.data?.message || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
          }
        }
      } else {
        errorMessage = err.message || errorMessage;
      }

      setError(errorMessage);
    } finally {
      setUpdateLoading(false);
    }
  }, [userData?.userType, id, fetchUserData, validateAndSanitizeId, navigate]);

  const handleGoBack = useCallback(() => {
    const userType = userData?.userType;

    if (!validateUserType(userType)) {
      navigate('/name-register');
      return;
    }

    switch (userType) {
      case 'student':
        navigate('/name-register/student-name');
        break;
      case 'teacher':
        navigate('/name-register/teacher-name');
        break;
      case 'staff':
        navigate('/name-register/staff-name');
        break;
      default:
        navigate('/name-register');
    }
  }, [navigate, userData?.userType]);

  const retryFetch = useCallback(() => {
    setError(null);
    setSecurityAlert(null);
    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    if (id) {
      try {
        validateAndSanitizeId(id);
        fetchUserData();
      } catch (validationError) {
        setError(validationError.message);
        setLoading(false);
      }
    } else {
      setError('ไม่พบรหัสผู้ใช้ในการเรียก URL');
      setLoading(false);
    }
  }, [fetchUserData, id, validateAndSanitizeId]);

  return {
    loading,
    userData,
    error,
    updateLoading,
    securityAlert,
    imageLoadErrors,
    imageUrls,
    handleUserDataUpdate,
    handleGoBack,
    retryFetch,
    handleImageError,
    shouldLoadImage,
    loadImageWithCredentials,
    getProfileImageUrl,
    setError,
    setSecurityAlert
  };
};

export default useAdminUserDetail;