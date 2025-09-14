import { useState, useEffect, useMemo } from 'react';
import { decryptValue } from '../../../../utils/crypto';

export const useUserPermissions = () => {
  const [userType, setUserType] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  // Get user info from sessionStorage
  useEffect(() => {
    try {
      const storedUserType = sessionStorage.getItem('UsersType');
      const storedUserInfo = sessionStorage.getItem('userInfo');
      
      if (storedUserType) {
        try {
          // Decrypt the userType
          const decryptedUserType = decryptValue(storedUserType);
          setUserType(decryptedUserType);
        } catch (decryptError) {
          console.warn('Failed to decrypt UsersType, using as plain text:', decryptError);
          // Fallback to plain text if decryption fails
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

  // Permission checks
  const permissions = useMemo(() => {
    const isStaff = userType === 'staff';
    const isTeacher = userType === 'teacher';
    const isStudent = userType === 'student';

    return {
      // View permissions
      canViewStudents: isStaff || isTeacher,
      canViewStudentDetails: isStaff || isTeacher,
      
      // Edit permissions - Only Staff can edit and add
      canEditStudents: isStaff,
      canAddStudents: isStaff,
      canToggleStudentStatus: isStaff, // Only Staff can toggle status
      
      // Export permissions
      canExportData: isStaff || isTeacher,
      
      // Staff permissions (highest level)
      canManageUsers: isStaff,
      canAccessAdminFeatures: isStaff,
      
      // User type info
      userType,
      isStaff,
      isTeacher,
      isStudent,
      userInfo
    };
  }, [userType, userInfo]);

  return permissions;
};