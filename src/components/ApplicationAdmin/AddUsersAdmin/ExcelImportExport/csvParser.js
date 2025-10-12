// csvParser.js 
import { validateCSVData, stringToBoolean } from './../../../../utils/formValidator';

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
              if (header === 'Teacher_IsDean' && value !== '') {
                value = stringToBoolean(value);
              }

              row[header] = value;
            });
            data.push(row);
          }
        }

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

export const validateStudentData = (data) => {
  return validateCSVData(data, 'student');
};

export const validateTeacherData = (data) => {
  return validateCSVData(data, 'teacher');
};