// csvParser.js - Utility functions for parsing CSV files

export const parseCSV = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const csv = e.target.result;
        const lines = csv.split('\n').filter(line => line.trim() !== '');
        
        if (lines.length < 2) {
          reject(new Error('ไฟล์ CSV ต้องมีอย่างน้อย 2 แถว (header และ data)'));
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const data = [];
        for (let i = 1; i < lines.length; i++) {
          const values = parseCSVLine(lines[i]);
          const hasData = values.some(value => value && value.trim() !== '');
          
          if (hasData && values.length === headers.length) {
            const row = {};
            headers.forEach((header, index) => {
              row[header] = values[index] || '';
            });
            data.push(row);
          }
        }
        
        resolve({ headers, data });
      } catch (error) {
        reject(new Error('เกิดข้อผิดพลาดในการอ่านไฟล์ CSV: ' + error.message));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('ไม่สามารถอ่านไฟล์ได้'));
    };
    
    reader.readAsText(file, 'UTF-8');
  });
};

const parseCSVLine = (line) => {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim().replace(/"/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim().replace(/"/g, ''));
  return result;
};

export const convertThaiDateToISO = (thaiDate) => {
  if (!thaiDate || thaiDate.trim() === '') return '';
  
  const parts = thaiDate.split('-');
  if (parts.length !== 3) return '';
  
  const day = parts[0].padStart(2, '0');
  const month = parts[1].padStart(2, '0');
  const buddhistYear = parseInt(parts[2]);
  const christianYear = buddhistYear - 543;
  
  return `${christianYear}-${month}-${day}`;
};

const isValidThaiDate = (dateString) => {
  if (!dateString || dateString.trim() === '') return true;
  
  const dateRegex = /^\d{1,2}-\d{1,2}-\d{4}$/;
  if (!dateRegex.test(dateString)) return false;
  
  const parts = dateString.split('-');
  const day = parseInt(parts[0]);
  const month = parseInt(parts[1]);
  const year = parseInt(parts[2]);
  
  if (day < 1 || day > 31) return false;
  if (month < 1 || month > 12) return false;
  if (year < 2400 || year > 2600) return false;
  
  return true;
};

export const validateStudentData = (data) => {
  const requiredFields = [
    'Users_Email',
    'Users_Password', 
    'Student_Code',
    'Student_FirstName',
    'Student_LastName',
    'Faculty_Name',
    'Department_Name',
    'Teacher_Code',
    'Student_AcademicYear'
  ];

  const errors = [];

  requiredFields.forEach(field => {
    if (!data[field] || data[field].toString().trim() === '') {
      errors.push(`${field} ไม่สามารถเป็นค่าว่างได้`);
    }
  });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (data.Users_Email && !emailRegex.test(data.Users_Email)) {
    errors.push('อีเมลไม่ถูกต้อง');
  }

  if (data.Users_Password && data.Users_Password.length < 8) {
    errors.push('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
  }

  if (data.Student_Birthdate && data.Student_Birthdate !== '') {
    if (!isValidThaiDate(data.Student_Birthdate)) {
      errors.push('วันเกิดต้องอยู่ในรูปแบบ dd-mm-yyyy (พ.ศ.) เช่น 15-01-2545');
    }
  }

  if (data.Student_Code && data.Student_Code.length < 5) {
    errors.push('รหัสนักศึกษาต้องมีอย่างน้อย 5 ตัว');
  }

  return errors;
};

export const validateTeacherData = (data) => {
  const requiredFields = [
    'Users_Email',
    'Users_Password',
    'Teacher_Code', 
    'Teacher_FirstName',
    'Teacher_LastName',
    'Faculty_Name',
    'Department_Name'
  ];

  const errors = [];

  requiredFields.forEach(field => {
    if (!data[field] || data[field].toString().trim() === '') {
      errors.push(`${field} ไม่สามารถเป็นค่าว่างได้`);
    }
  });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (data.Users_Email && !emailRegex.test(data.Users_Email)) {
    errors.push('อีเมลไม่ถูกต้อง');
  }

  if (data.Users_Password && data.Users_Password.length < 8) {
    errors.push('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
  }

  if (data.Teacher_Birthdate && data.Teacher_Birthdate !== '') {
    if (!isValidThaiDate(data.Teacher_Birthdate)) {
      errors.push('วันเกิดต้องอยู่ในรูปแบบ dd-mm-yyyy (พ.ศ.) เช่น 20-05-2523');
    }
  }

  if (data.Teacher_IsDean && !['true', 'false', true, false, ''].includes(data.Teacher_IsDean)) {
    errors.push('Teacher_IsDean ต้องเป็น true หรือ false เท่านั้น');
  }

  return errors;
};
