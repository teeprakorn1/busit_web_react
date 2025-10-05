// hooks/useUserPermissions.js
import { useState, useEffect, useMemo } from 'react';
import { decryptValue } from '../../../../utils/crypto';

export const useUserPermissions = () => {
  const [userType, setUserType] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    try {
      const storedUserType = sessionStorage.getItem('UsersType');
      const storedUserInfo = sessionStorage.getItem('userInfo');

      if (storedUserType) {
        try {
          const decryptedUserType = decryptValue(storedUserType);
          setUserType(decryptedUserType);
        } catch (decryptError) {
          console.warn('Failed to decrypt UsersType, using as plain text:', decryptError);
          setUserType(storedUserType);
        }
      }

      if (storedUserInfo) {
        try {
          const parsedUserInfo = JSON.parse(storedUserInfo);
          setUserInfo(parsedUserInfo);
        } catch (parseError) {
          console.warn('Failed to parse userInfo:', parseError);
        }
      }
    } catch (error) {
      console.error('Error reading user info from sessionStorage:', error);
    }
  }, []);

  const permissions = useMemo(() => {
    const isStaff = userType === 'staff';
    const isTeacher = userType === 'teacher';
    const isStudent = userType === 'student';

    return {
      canViewActivities: isStaff || isTeacher,
      canManageActivities: isStaff,
      canEditActivities: isStaff,
      canDeleteActivities: isStaff,
      canExportData: isStaff || isTeacher,
      canAccessAdminFeatures: isStaff,
      userType,
      isStaff,
      isTeacher,
      isStudent,
      userInfo
    };
  }, [userType, userInfo]);

  return permissions;
};