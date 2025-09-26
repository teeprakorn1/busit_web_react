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
              let value = values[index] || '';
              row[header] = value;
            });
            data.push(row);
          }
        }
        
        // ตรวจสอบจำนวนข้อมูลไม่เกิน 1,000 รายการ
        if (data.length > 1000) {
          reject(new Error(`จำนวนข้อมูลเกินกำหนด: ${data.length} รายการ (จำกัดไม่เกิน 1,000 รายการต่อครั้ง)`));
          return;
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

export const validateStaffData = (data) => {
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
  if (data.Users_Email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.Users_Email)) {
      errors.push('รูปแบบอีเมลไม่ถูกต้อง');
    }
  }

  // ตรวจสอบความแข็งแกร่งรหัสผ่าน
  if (data.Users_Password && data.Users_Password.length < 8) {
    errors.push('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
  }

  // ตรวจสอบรูปแบบรหัสเจ้าหน้าที่
  if (data.Staff_Code && !/^\d{12}-\d{1}$/.test(data.Staff_Code)) {
    errors.push('รูปแบบรหัสเจ้าหน้าที่ไม่ถูกต้อง (ต้องเป็น 12 หลัก ตามด้วย - และเลข 1 หลัก)');
  }

  // ตรวจสอบเบอร์โทรศัพท์ (ถ้ามี)
  if (data.Staff_Phone && data.Staff_Phone.toString().trim() !== '') {
    const phone = data.Staff_Phone.toString().replace(/[-\s]/g, '');
    if (!/^[0-9]{10}$/.test(phone)) {
      errors.push('รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง');
    }
  }

  return errors;
};