import { useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import useImageLoader from './useImageLoader';
import useDropdownData from './useDropdownData';
import useValidation from './useValidation';
import useDateFormatter from './useDateFormatter';
import useApiClient from './useApiClient';
import useSingleFetch from './useSingleFetch';

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
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);
  const [securityAlert, setSecurityAlert] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const {
    imageLoadErrors,
    imageUrls,
    loadingImages,
    handleImageError,
    shouldLoadImage,
    loadImageWithCredentials,
    preloadImage,
    getCachedImageUrl,
    getProfileImageUrl,
    clearImageCache
  } = useImageLoader();

  const {
    faculties,
    departments,
    teachers,
    dropdownLoading,
    dropdownError,
    loadDropdownData,
    retryLoadDropdownData
  } = useDropdownData();

  const {
    validateAndSanitizeId,
    validatePassword,
    validateUserData,
    sanitizeUserData,
    validateUserType,
    sanitizeInput
  } = useValidation();

  const {
    formatDateForInput,
    formatDateForSubmit
  } = useDateFormatter();

  const {
    handleApiError,
    fetchUserData: apiFetchUserData,
    updateUserData: apiUpdateUserData,
    changePassword: apiChangePassword,
    updateStudentAssignment
  } = useApiClient();

  const { singleFetch } = useSingleFetch();
  const fetchUserData = useCallback(async () => {
    const fetchKey = `user-${id}`;

    try {
      await singleFetch(fetchKey, async () => {
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

        const response = await apiFetchUserData(validatedId, userType);

        if (response && response.status) {
          const receivedData = response.data;
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
            preloadImage(processedData.imageFile);
          }
        } else {
          setError(response?.message || 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
        }
      });

    } catch (err) {
      const errorMessage = handleApiError(err, 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
      setError(errorMessage);

      if (err.response?.status === 403) {
        setSecurityAlert('การเข้าถึงถูกปฏิเสธ - ไม่มีสิทธิ์เพียงพอ');
      }
    } finally {
      setLoading(false);
    }
  }, [
    id,
    singleFetch,
    location.state,
    location.pathname,
    validateAndSanitizeId,
    apiFetchUserData,
    handleApiError,
    getProfileImageUrl,
    preloadImage,
    validateUserType,
    sanitizeInput
  ]);

  const handleUserDataUpdate = useCallback(async (updatedData) => {
    try {
      setUpdateLoading(true);
      setError(null);
      setSecurityAlert(null);

      const userType = userData?.userType;
      const validation = validateUserData(updatedData, userType);

      if (!validation.isValid) {
        throw new Error(validation.message);
      }

      const validatedId = validateAndSanitizeId(id);
      const sanitizedData = sanitizeUserData(updatedData, userType);
      const response = await apiUpdateUserData(validatedId, userType, sanitizedData);

      if (response && response.status) {
        await fetchUserData();
      } else {
        setError(response?.message || 'ไม่สามารถอัพเดทข้อมูลได้');
      }

    } catch (err) {
      const errorMessage = handleApiError(err, 'เกิดข้อผิดพลาดในการอัพเดทข้อมูล');
      setError(errorMessage);

      if (err.response?.status === 403) {
        setSecurityAlert('การแก้ไขถูกปฏิเสธ - ไม่มีสิทธิ์เพียงพอ');
      }
    } finally {
      setUpdateLoading(false);
    }
  }, [
    userData?.userType,
    id,
    fetchUserData,
    validateAndSanitizeId,
    validateUserData,
    sanitizeUserData,
    apiUpdateUserData,
    handleApiError
  ]);

  const handlePasswordChange = useCallback(async (newPassword) => {
    try {
      setPasswordChangeLoading(true);
      setError(null);
      setSecurityAlert(null);

      if (!newPassword || typeof newPassword !== 'string') {
        throw new Error('รหัสผ่านใหม่ไม่ถูกต้อง');
      }

      if (!userData?.Users_ID) {
        throw new Error('ไม่พบข้อมูล Users_ID สำหรับการเปลี่ยนรหัสผ่าน');
      }

      const passwordValidation = validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.message);
      }

      const sanitizedPassword = sanitizeInput(newPassword);
      const response = await apiChangePassword(userData.Users_ID, sanitizedPassword);

      if (response && response.status) {
        return { success: true, message: 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว' };
      } else {
        throw new Error(response?.message || 'ไม่สามารถเปลี่ยนรหัสผ่านได้');
      }

    } catch (err) {
      const errorMessage = handleApiError(err, 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน');

      if (err.response?.status === 403) {
        setSecurityAlert('การเปลี่ยนรหัสผ่านถูกปฏิเสธ - ไม่มีสิทธิ์เพียงพอ');
      }

      throw new Error(errorMessage);
    } finally {
      setPasswordChangeLoading(false);
    }
  }, [
    userData?.Users_ID,
    validatePassword,
    sanitizeInput,
    apiChangePassword,
    handleApiError
  ]);

  const handleAssignmentChange = useCallback(async (departmentId, advisorId) => {
    if (!departmentId || !advisorId) {
      throw new Error('ข้อมูลภาควิชาและอาจารย์ที่ปรึกษาจำเป็นต้องมี');
    }

    const validatedId = validateAndSanitizeId(id);
    await updateStudentAssignment(validatedId, departmentId, advisorId);
  }, [id, validateAndSanitizeId, updateStudentAssignment]);

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
  }, [navigate, userData?.userType, validateUserType]);

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
    passwordChangeLoading,
    securityAlert,
    imageLoadErrors,
    imageUrls,
    loadingImages,
    handleImageError,
    shouldLoadImage,
    loadImageWithCredentials,
    preloadImage,
    getCachedImageUrl,
    getProfileImageUrl,
    clearImageCache,
    isLoading: filename => loadingImages?.has(filename) || false,
    hasError: filename => imageLoadErrors?.has(filename) || false,
    isLoaded: filename => imageUrls?.has(filename) || false,
    faculties,
    departments,
    teachers,
    dropdownLoading,
    dropdownError,
    loadDropdownData,
    retryLoadDropdownData,
    handleUserDataUpdate,
    handlePasswordChange,
    handleAssignmentChange,
    handleGoBack,
    retryFetch,
    formatDateForInput,
    formatDateForSubmit,
    setError,
    setSecurityAlert
  };
};

export default useAdminUserDetail;