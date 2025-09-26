import React, { useState, useRef } from 'react';
import styles from './ExcelImportExport.module.css';
import { FiUpload, FiDownload, FiFile, FiX } from 'react-icons/fi';
import CustomModal from '../../../../services/CustomModal/CustomModal';
import { parseCSV } from '../csvParser';

function StaffImportExport({ setModalOpen, onDataImport }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [parseError, setParseError] = useState(null);
  const fileInputRef = useRef(null);

  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv',
        'application/csv'
      ];

      const validExtensions = ['.xlsx', '.xls', '.csv'];
      const fileExtension = file.name.toLowerCase();

      if (validTypes.includes(file.type) || validExtensions.some(ext => fileExtension.endsWith(ext))) {
        setSelectedFile(file);
        setParseError(null);
      } else {
        setAlertMessage('กรุณาเลือกไฟล์ Excel (.xlsx, .xls) หรือ CSV (.csv) เท่านั้น');
        setIsAlertModalOpen(true);
        event.target.value = '';
      }
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setAlertMessage('กรุณาเลือกไฟล์ก่อน');
      setIsAlertModalOpen(true);
      return;
    }

    setIsUploading(true);
    setParseError(null);

    try {
      let parsedData;

      if (selectedFile.name.toLowerCase().endsWith('.csv')) {
        parsedData = await parseCSV(selectedFile);
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000));
        throw new Error('การ import Excel ยังไม่ได้ implement กรุณาใช้ไฟล์ CSV');
      }

      if (setModalOpen && onDataImport) {
        onDataImport(parsedData);
        setModalOpen(true);
      }

    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการ import:', error);
      setParseError(error.message);
      setAlertMessage('เกิดข้อผิดพลาดในการอ่านไฟล์: ' + error.message);
      setIsAlertModalOpen(true);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const headers = [
      'Users_Email',
      'Users_Password',
      'Staff_Code',
      'Staff_FirstName',
      'Staff_LastName',
      'Staff_Phone'
    ];
    
    const templateData = [
      'staff001@rmutto.ac.th',
      'password12345',
      '333333333333-3',
      'สมพงษ์',
      'ใจดี',
      '0834567890'
    ];
    
    const filename = 'staff_template.csv';

    const csvContent = [headers.join(','), templateData.join(',')].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setParseError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <h3 className={styles.title}>
            นำเข้าข้อมูลเจ้าหน้าที่จาก CSV
          </h3>

          <div className={styles.uploadSection}>
            <div className={styles.fileInputWrapper}>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className={styles.fileInput}
                id="csv-file"
              />
              <label htmlFor="csv-file" className={styles.fileInputLabel}>
                <FiUpload className={styles.icon} />
                {selectedFile ? 'เปลี่ยนไฟล์' : 'เลือกไฟล์ CSV'}
              </label>
            </div>

            {selectedFile && (
              <div className={styles.selectedFile}>
                <div className={styles.fileInfo}>
                  <FiFile className={styles.fileIcon} />
                  <span className={styles.fileName}>{selectedFile.name}</span>
                  <span className={styles.fileSize}>
                    ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <button
                  onClick={clearFile}
                  className={styles.clearButton}
                  type="button"
                >
                  <FiX />
                </button>
              </div>
            )}

            {parseError && (
              <div className={styles.errorMessage}>
                <FiX className={styles.errorIcon} />
                <span>{parseError}</span>
              </div>
            )}
          </div>

          <div className={styles.actionButtons}>
            <button
              onClick={handleImport}
              disabled={!selectedFile || isUploading}
              className={`${styles.importButton} ${!selectedFile ? styles.disabled : ''}`}
            >
              {isUploading ? (
                <>
                  <div className={styles.spinner}></div>
                  กำลังประมวลผล...
                </>
              ) : (
                <>
                  <FiUpload className={styles.buttonIcon} />
                  นำเข้าข้อมูล
                </>
              )}
            </button>

            <button
              onClick={handleDownloadTemplate}
              className={styles.templateButton}
              type="button"
            >
              <FiDownload className={styles.buttonIcon} />
              ดาวน์โหลดแม่แบบ CSV
            </button>
          </div>

          <div className={styles.instructions}>
            <h4>คำแนะนำ:</h4>
            <ul>
              <li><strong>ดาวน์โหลดไฟล์แม่แบบ CSV</strong> ก่อนเพื่อดูรูปแบบข้อมูลที่ถูกต้อง</li>
              <li>กรอกข้อมูลในไฟล์ CSV ตามรูปแบบที่กำหนด</li>
              <li>ชื่อ columns <strong>ต้องตรงกับแม่แบบ</strong> ที่กำหนด</li>
              <li>จำกัดการนำเข้าไม่เกิน <strong>1,000</strong> รายการต่อครั้ง และสามารถนำเข้าข้อมูล ได้ <strong>1</strong> ครั้งต่อนาที</li>
              <li>รหัสผ่านต้องมี<strong>อย่างน้อย 8 ตัวอักษร</strong></li>
              <li><strong>ห้ามมีแถวว่าง</strong>ในไฟล์ CSV</li>
              <li>อัปโหลดไฟล์ที่กรอกข้อมูลเรียบร้อยแล้ว</li>
              <li><strong>ตรวจสอบข้อมูลในหน้า Preview</strong> ก่อนบันทึก</li>
            </ul>
          </div>

          <div className={styles.schemaInfo}>
            <h4>ข้อมูล Columns ที่ต้องการ:</h4>
            <div className={styles.schemaTable}>
              <strong>สำหรับเจ้าหน้าที่:</strong>
              <ul>
                <li><code>Users_Email</code> - อีเมล (จำเป็น)</li>
                <li><code>Users_Password</code> - รหัสผ่าน อย่างน้อย 8 ตัว (จำเป็น)</li>
                <li><code>Staff_Code</code> - รหัสเจ้าหน้าที่ (จำเป็น)</li>
                <li><code>Staff_FirstName</code> - ชื่อจริง (จำเป็น)</li>
                <li><code>Staff_LastName</code> - นามสกุล (จำเป็น)</li>
                <li><code>Staff_Phone</code> - เบอร์โทรศัพท์</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <CustomModal
        isOpen={isAlertModalOpen}
        message={alertMessage}
        onClose={() => setIsAlertModalOpen(false)}
      />
    </>
  );
}

export default StaffImportExport;