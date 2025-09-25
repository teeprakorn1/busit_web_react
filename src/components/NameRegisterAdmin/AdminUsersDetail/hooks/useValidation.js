import { useCallback } from 'react';

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

const useValidation = () => {
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

  const validatePassword = useCallback((password) => {
    if (password.length < 8) {
      return { isValid: false, message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' };
    }

    if (!/[a-zA-Z]/.test(password)) {
      return { isValid: false, message: 'รหัสผ่านต้องประกอบด้วยตัวอักษรอย่างน้อย 1 ตัว' };
    }

    if (!/[0-9]/.test(password)) {
      return { isValid: false, message: 'รหัสผ่านต้องประกอบด้วยตัวเลขอย่างน้อย 1 ตัว' };
    }

    return { isValid: true, message: '' };
  }, []);

  const validatePhoneNumber = useCallback((phone) => {
    if (!phone) return { isValid: true, message: '' };

    const phoneRegex = /^[0-9-+\s()]*$/;
    if (!phoneRegex.test(phone)) {
      return { isValid: false, message: 'หมายเลขโทรศัพท์ไม่ถูกต้อง' };
    }

    return { isValid: true, message: '' };
  }, []);

  const validateUserData = useCallback((userData, userType) => {
    if (!userData || typeof userData !== 'object') {
      return { isValid: false, message: 'ข้อมูลที่ส่งไม่ถูกต้อง' };
    }

    if (!validateUserType(userType)) {
      return { isValid: false, message: 'ประเภทผู้ใช้ไม่ถูกต้อง' };
    }

    const formData = userData[userType];
    if (!formData) {
      return { isValid: false, message: 'ไม่พบข้อมูลฟอร์ม' };
    }

    if (!formData.firstName || !formData.lastName) {
      return { isValid: false, message: 'ชื่อและนามสกุลเป็นข้อมูลที่จำเป็น' };
    }

    const phoneValidation = validatePhoneNumber(formData.phone);
    if (!phoneValidation.isValid) {
      return phoneValidation;
    }

    if (Array.isArray(formData.otherPhones)) {
      for (const phoneObj of formData.otherPhones) {
        const phoneValidation = validatePhoneNumber(phoneObj.phone);
        if (!phoneValidation.isValid) {
          return { isValid: false, message: 'หมายเลขโทรศัพท์เพิ่มเติมไม่ถูกต้อง' };
        }
      }
    }

    return { isValid: true, message: '' };
  }, [validatePhoneNumber]);

  const sanitizeUserData = useCallback((userData, userType) => {
    const formData = userData[userType];
    const sanitizedData = {
      [userType]: {
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
      }
    };

    if (userType === 'teacher') {
      sanitizedData[userType] = {
        ...sanitizedData[userType],
        isDean: formData.position === 'คณบดี' || formData.isDean,
        isResigned: formData.isResigned || false
      };
    }

    if (userType === 'staff') {
      sanitizedData[userType] = {
        ...sanitizedData[userType],
        isResigned: formData.isResigned || false
      };
    }

    if (userType === 'student') {
      sanitizedData[userType] = {
        ...sanitizedData[userType],
        academicYear: formData.academicYear || null,
        isGraduated: formData.isGraduated || false
      };
    }

    return sanitizedData;
  }, []);

  return {
    sanitizeInput,
    validateId,
    validateUserType,
    validateAndSanitizeId,
    validatePassword,
    validatePhoneNumber,
    validateUserData,
    sanitizeUserData
  };
};

export default useValidation;