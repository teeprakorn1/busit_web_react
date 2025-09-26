// formValidator.js - ฟังก์ชันตรวจสอบความถูกต้องของข้อมูล
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const isStrongPassword = (password) => {
    return password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
};

export const isValidThaiPhone = (phone) => {
    const phoneRegex = /^0[0-9]{9}$/;
    return phoneRegex.test(phone);
};

// อัปเดตฟังก์ชันตรวจสอบวันที่ให้รองรับทั้ง พ.ศ. และ ค.ศ. และรูปแบบ - และ /
export const isValidThaiDate = (dateString) => {
    if (!dateString || dateString.trim() === '') return true;

    // รองรับทั้ง - และ / เป็น separator
    const dateRegex = /^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/;
    if (!dateRegex.test(dateString)) return false;

    // แยกส่วนของวันที่ รองรับทั้ง - และ /
    const parts = dateString.split(/[-/]/);
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const year = parseInt(parts[2]);

    if (day < 1 || day > 31) return false;
    if (month < 1 || month > 12) return false;

    let testYear = year;

    // ตรวจสอบว่าเป็น พ.ศ. หรือ ค.ศ.
    if (year > 2400) {
        // พ.ศ. - แปลงเป็น ค.ศ.
        testYear = year - 543;
        if (year < 2400 || year > 2600) return false;
    } else {
        // ค.ศ.
        if (year < 1900 || year > 2100) return false;
    }

    const testDate = new Date(testYear, month - 1, day);
    const today = new Date();

    return testDate.getDate() === day &&
        testDate.getMonth() === (month - 1) &&
        testDate.getFullYear() === testYear &&
        testDate <= today;
};

export const isValidStudentCode = (code) => {
    const studentCodeRegex = /^\d{12}-\d{1}$/;
    return studentCodeRegex.test(code);
};

export const isValidTeacherCode = (code) => {
    const newTeacherCodeRegex = /^\d{12}-\d{1}$/;
    const oldTeacherCodeRegex = /^T\d{6}$/;
    return newTeacherCodeRegex.test(code) || oldTeacherCodeRegex.test(code);
};

export const isValidName = (name) => {
    if (!name || name.trim().length < 2) return false;
    const nameRegex = /^[a-zA-Zก-๙\s]+$/;
    return nameRegex.test(name.trim());
};

// อัปเดตฟังก์ชันตรวจสอบปีการศึกษาให้รองรับทั้ง พ.ศ. และ ค.ศ.
export const isValidAcademicYear = (year) => {
    const yearNum = parseInt(year);
    if (isNaN(yearNum)) return false;

    const currentChristianYear = new Date().getFullYear();
    const currentBuddhistYear = currentChristianYear + 543;

    // ตรวจสอบ ค.ศ. (1950-2040)
    if (yearNum >= 1950 && yearNum <= currentChristianYear + 10) {
        return true;
    }

    // ตรวจสอบ พ.ศ. (2493-2583)
    if (yearNum >= 2493 && yearNum <= currentBuddhistYear + 10) {
        return true;
    }

    return false;
};

// ฟังก์ชันตรวจสอบ boolean value ที่รองรับทั้งตัวเล็กและตัวใหญ่
export const isValidBoolean = (value) => {
    if (value === '' || value === null || value === undefined) return true; // อนุญาตให้ว่าง

    const stringValue = value.toString().toLowerCase().trim();
    return ['true', 'false'].includes(stringValue);
};

// ฟังก์ชันแปลง string เป็น boolean
export const stringToBoolean = (value) => {
    if (value === '' || value === null || value === undefined) return false;

    const stringValue = value.toString().toLowerCase().trim();
    return stringValue === 'true';
};

// เพิ่มฟังก์ชันสำหรับ Staff
export const validateStaffForm = (data) => {
  const errors = {};

  // ตรวจสอบอีเมล
  if (!data.email || data.email.trim() === '') {
    errors.email = 'กรุณากรอกอีเมล';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
  }

  // ตรวจสอบรหัสผ่าน
  if (!data.password || data.password.trim() === '') {
    errors.password = 'กรุณากรอกรหัสผ่าน';
  } else if (data.password.length < 8) {
    errors.password = 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร';
  }

  // ตรวจสอบยืนยันรหัสผ่าน
  if (!data.confirmPassword || data.confirmPassword.trim() === '') {
    errors.confirmPassword = 'กรุณายืนยันรหัสผ่าน';
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'รหัสผ่านไม่ตรงกัน';
  }

  // ตรวจสอบรหัสเจ้าหน้าที่
  if (!data.code || data.code.trim() === '') {
    errors.code = 'กรุณากรอกรหัสเจ้าหน้าที่';
  } else if (!/^\d{12}-\d{1}$/.test(data.code)) {
    errors.code = 'รูปแบบรหัสเจ้าหน้าที่ไม่ถูกต้อง (ตัวอย่าง: 026530461001-6)';
  }

  // ตรวจสอบชื่อ
  if (!data.firstName || data.firstName.trim() === '') {
    errors.firstName = 'กรุณากรอกชื่อจริง';
  } else if (!isValidName(data.firstName)) {
    errors.firstName = 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร และเป็นภาษาไทยหรืออังกฤษเท่านั้น';
  }

  // ตรวจสอบนามสกุล
  if (!data.lastName || data.lastName.trim() === '') {
    errors.lastName = 'กรุณากรอกนามสกุล';
  } else if (!isValidName(data.lastName)) {
    errors.lastName = 'นามสกุลต้องมีอย่างน้อย 2 ตัวอักษร และเป็นภาษาไทยหรืออังกฤษเท่านั้น';
  }

  // ตรวจสอบเบอร์โทรศัพท์ (ถ้ามี)
  if (data.phone && data.phone.trim() !== '') {
    if (!isValidThaiPhone(data.phone)) {
      errors.phone = 'เบอร์โทรศัพท์ต้องเป็นเลข 10 หลัก เริ่มต้นด้วย 0';
    }
  }

  return errors;
};

// ฟังก์ชันตรวจสอบข้อมูล CSV สำหรับเจ้าหน้าที่
export const validateStaffCSVData = (data) => {
  const errors = [];

  // ตรวจสอบข้อมูลจำเป็น
  const requiredFields = [
    { field: 'Users_Email', name: 'อีเมล' },
    { field: 'Users_Password', name: 'รหัสผ่าน' },
    { field: 'Staff_Code', name: 'รหัสเจ้าหน้าที่' },
    { field: 'Staff_FirstName', name: 'ชื่อจริง' },
    { field: 'Staff_LastName', name: 'นามสกุล' }
  ];

  requiredFields.forEach(({ field, name }) => {
    if (!data[field] || data[field].toString().trim() === '') {
      errors.push(`${name} จำเป็นต้องกรอก`);
    }
  });

  // ตรวจสอบรูปแบบอีเมล
  if (data.Users_Email && !isValidEmail(data.Users_Email)) {
    errors.push('รูปแบบอีเมลไม่ถูกต้อง');
  }

  // ตรวจสอบความแข็งแกร่งรหัสผ่าน
  if (data.Users_Password && !isStrongPassword(data.Users_Password)) {
    errors.push('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร และมีทั้งตัวอักษรและตัวเลข');
  }

  // ตรวจสอบรูปแบบรหัสเจ้าหน้าที่
  if (data.Staff_Code && !/^\d{12}-\d{1}$/.test(data.Staff_Code)) {
    errors.push('รูปแบบรหัสเจ้าหน้าที่ไม่ถูกต้อง (ต้องเป็น 12 หลัก ตามด้วย - และเลข 1 หลัก)');
  }

  // ตรวจสอบชื่อ
  if (data.Staff_FirstName && !isValidName(data.Staff_FirstName)) {
    errors.push('ชื่อจริงไม่ถูกต้อง');
  }

  if (data.Staff_LastName && !isValidName(data.Staff_LastName)) {
    errors.push('นามสกุลไม่ถูกต้อง');
  }

  // ตรวจสอบเบอร์โทรศัพท์ (ถ้ามี)
  if (data.Staff_Phone && data.Staff_Phone.toString().trim() !== '') {
    if (!isValidThaiPhone(data.Staff_Phone)) {
      errors.push('เบอร์โทรศัพท์ไม่ถูกต้อง');
    }
  }

  return errors;
};

export const validateUserForm = (formData, userType) => {
    const errors = {};

    if (!formData.email) {
        errors.email = "กรุณากรอกอีเมล";
    } else if (!isValidEmail(formData.email)) {
        errors.email = "รูปแบบอีเมลไม่ถูกต้อง";
    }

    if (!formData.password) {
        errors.password = "กรุณากรอกรหัสผ่าน";
    } else if (!isStrongPassword(formData.password)) {
        errors.password = "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร และมีทั้งตัวอักษรและตัวเลข";
    }

    if (!formData.confirmPassword) {
        errors.confirmPassword = "กรุณายืนยันรหัสผ่าน";
    } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "รหัสผ่านไม่ตรงกัน";
    }

    if (!formData.code) {
        errors.code = userType === "student" ? "กรุณากรอกรหัสนักศึกษา" : "กรุณากรอกรหัสอาจารย์";
    } else {
        if (userType === "student" && !isValidStudentCode(formData.code)) {
            errors.code = "รหัสนักศึกษาต้องเป็นตัวเลข 12 หลัก ตามด้วย - และเลข 1 หลัก (เช่น 026530461001-6)";
        } else if (userType === "teacher" && !isValidTeacherCode(formData.code)) {
            errors.code = "รหัสอาจารย์ต้องเป็นตัวเลข 12 หลัก ตามด้วย - และเลข 1 หลัก (เช่น 026530461001-6) หรือ T ตามด้วยตัวเลข 6 หลัก (เช่น T123456)";
        }
    }

    if (!formData.firstName) {
        errors.firstName = "กรุณากรอกชื่อจริง";
    } else if (!isValidName(formData.firstName)) {
        errors.firstName = "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร และเป็นภาษาไทยหรืออังกฤษเท่านั้น";
    }

    if (!formData.lastName) {
        errors.lastName = "กรุณากรอกนามสกุล";
    } else if (!isValidName(formData.lastName)) {
        errors.lastName = "นามสกุลต้องมีอย่างน้อย 2 ตัวอักษร และเป็นภาษาไทยหรืออังกฤษเท่านั้น";
    }

    if (formData.phone && !isValidThaiPhone(formData.phone)) {
        errors.phone = "เบอร์โทรศัพท์ต้องเป็นเลข 10 หลัก เริ่มต้นด้วย 0";
    }

    if (formData.birthDate && !isValidThaiDate(formData.birthDate)) {
        errors.birthDate = "วันเกิดต้องอยู่ในรูปแบบ dd-mm-yyyy หรือ dd/mm/yyyy (รองรับทั้ง พ.ศ. และ ค.ศ.) เช่น 15-01-2545, 15/01/2002 และไม่อยู่ในอนาคต";
    }

    if (!formData.faculty) {
        errors.faculty = "กรุณาเลือกคณะ";
    }

    if (!formData.department) {
        errors.department = userType === "student" ? "กรุณาเลือกสาขาวิชา" : "กรุณาเลือกภาควิชา";
    }

    if (userType === "student") {
        if (!formData.academicYear) {
            errors.academicYear = "กรุณากรอกปีการศึกษา";
        } else if (!isValidAcademicYear(formData.academicYear)) {
            errors.academicYear = "ปีการศึกษาต้องเป็นปี พ.ศ. (2493-2583) หรือ ค.ศ. (1950-2040) ที่ถูกต้อง";
        }

        if (!formData.teacherAdvisor) {
            errors.teacherAdvisor = "กรุณาเลือกอาจารย์ที่ปรึกษา";
        }
    }

    return errors;
};

// อัปเดตฟังก์ชันตรวจสอบข้อมูล CSV ให้รองรับรูปแบบวันที่และ boolean ที่หลากหลาย
export const validateCSVData = (data, userType) => {
    const errors = [];

    const requiredFields = userType === 'student' ? [
        'Users_Email', 'Users_Password', 'Student_Code', 'Student_FirstName',
        'Student_LastName', 'Faculty_Name', 'Department_Name', 'Teacher_Code', 'Student_AcademicYear'
    ] : [
        'Users_Email', 'Users_Password', 'Teacher_Code', 'Teacher_FirstName',
        'Teacher_LastName', 'Faculty_Name', 'Department_Name'
    ];

    requiredFields.forEach(field => {
        if (!data[field] || data[field].toString().trim() === '') {
            errors.push(`${field} ไม่สามารถเป็นค่าว่างได้`);
        }
    });

    if (data.Users_Email && !isValidEmail(data.Users_Email)) {
        errors.push('รูปแบบอีเมลไม่ถูกต้อง');
    }

    if (data.Users_Password && !isStrongPassword(data.Users_Password)) {
        errors.push('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร และมีทั้งตัวอักษรและตัวเลข');
    }

    if (userType === 'student') {
        if (data.Student_Code && !isValidStudentCode(data.Student_Code)) {
            errors.push('รหัสนักศึกษาต้องเป็น 12 หลัก ตามด้วย - และเลข 1 หลัก (เช่น 026530461001-6)');
        }
        if (data.Student_AcademicYear && !isValidAcademicYear(data.Student_AcademicYear)) {
            errors.push('ปีการศึกษาต้องเป็น พ.ศ. (2493-2583) หรือ ค.ศ. (1950-2040) ที่ถูกต้อง');
        }
    } else {
        if (data.Teacher_Code && !isValidTeacherCode(data.Teacher_Code)) {
            errors.push('รหัสอาจารย์ต้องเป็น 12 หลัก ตามด้วย - และเลข 1 หลัก (เช่น 026530461001-6) หรือ T ตามด้วยตัวเลข 6 หลัก (เช่น T123456)');
        }
    }

    const firstNameField = userType === 'student' ? 'Student_FirstName' : 'Teacher_FirstName';
    const lastNameField = userType === 'student' ? 'Student_LastName' : 'Teacher_LastName';

    if (data[firstNameField] && !isValidName(data[firstNameField])) {
        errors.push('ชื่อจริงไม่ถูกต้อง');
    }

    if (data[lastNameField] && !isValidName(data[lastNameField])) {
        errors.push('นามสกุลไม่ถูกต้อง');
    }

    const phoneField = userType === 'student' ? 'Student_Phone' : 'Teacher_Phone';
    if (data[phoneField] && data[phoneField] !== '' && !isValidThaiPhone(data[phoneField])) {
        errors.push('เบอร์โทรศัพท์ไม่ถูกต้อง');
    }

    const birthDateField = userType === 'student' ? 'Student_Birthdate' : 'Teacher_Birthdate';
    if (data[birthDateField] && data[birthDateField] !== '' && !isValidThaiDate(data[birthDateField])) {
        errors.push('วันเกิดต้องอยู่ในรูปแบบ dd-mm-yyyy หรือ dd/mm/yyyy (รองรับทั้ง พ.ศ. และ ค.ศ.) เช่น 15-01-2545, 15/01/2002');
    }

    // อัปเดตการตรวจสอบ Teacher_IsDean ให้รองรับทั้งตัวเล็กและตัวใหญ่
    if (userType === 'teacher' && data.Teacher_IsDean !== undefined && data.Teacher_IsDean !== '' && !isValidBoolean(data.Teacher_IsDean)) {
        errors.push('Teacher_IsDean ต้องเป็น true หรือ false เท่านั้น (ไม่คำนึงตัวเล็กตัวใหญ่)');
    }

    return errors;
};

export const getPasswordStrength = (password) => {
    let strength = 0;

    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 1;

    return strength;
};

export const getPasswordStrengthText = (strength) => {
    switch (strength) {
        case 0:
        case 1: return 'อ่อนแอ';
        case 2:
        case 3: return 'ปานกลาง';
        case 4:
        case 5: return 'แข็งแกร่ง';
        default: return '';
    }
};

export const getPasswordStrengthColor = (strength) => {
    switch (strength) {
        case 0:
        case 1: return '#ef4444';
        case 2:
        case 3: return '#f59e0b';
        case 4:
        case 5: return '#10b981';
        default: return '#e5e7eb';
    }
};