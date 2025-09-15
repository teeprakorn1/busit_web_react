import { useMemo } from 'react';

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.replace(/[<>"'&]/g, '').trim();
};

const getUserTypeDisplay = (userType) => {
  switch (userType) {
    case 'student': return 'นักเรียน/นักศึกษา';
    case 'teacher': return 'ครู/อาจารย์';
    case 'staff': return 'เจ้าหน้าที่';
    default: return 'ไม่ระบุ';
  }
};

const useUserUtils = (userData) => {
  const userInfo = useMemo(() => {
    if (!userData) return null;

    const currentUserData = userData[userData.userType] || {};
    const displayName = `${sanitizeInput(currentUserData.firstName || '')} ${sanitizeInput(currentUserData.lastName || '')}`.trim() || 'ไม่ระบุชื่อ';
    const userCode = sanitizeInput(currentUserData.code || '') || 'ไม่ระบุรหัส';
    const userTypeDisplay = getUserTypeDisplay(userData.userType);

    return {
      displayName,
      userCode,
      userTypeDisplay,
      currentUserData,
      userType: userData.userType,
      isActive: userData.isActive,
      regisTime: userData.regisTime,
      imageFile: userData.imageFile,
      imageUrl: userData.imageUrl
    };
  }, [userData]);

  const formatRegisterDate = (regisTime) => {
    if (!regisTime) return null;
    
    return new Date(regisTime).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return {
    userInfo,
    formatRegisterDate,
    getUserTypeDisplay
  };
};

export default useUserUtils;