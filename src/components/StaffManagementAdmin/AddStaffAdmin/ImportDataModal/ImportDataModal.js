import React, { useState, useEffect } from 'react';
import styles from './ImportDataModal.module.css';
import { FiX, FiCheck, FiAlertTriangle, FiUser, FiUsers } from 'react-icons/fi';
import { validateStaffData } from './../ExcelImportExport/csvParser';
import CustomModal from '../../../../services/CustomModal/CustomModal';

function ImportDataModal({ open, setOpen, importedData, userType = 'staff', onConfirmImport }) {
  const [previewData, setPreviewData] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  const [isValidating, setIsValidating] = useState(false);

  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    if (open && importedData && importedData.data) {
      setIsValidating(true);

      setTimeout(() => {
        const processedData = importedData.data.map((row, index) => {
          const errors = validateStaffData(row);

          return {
            ...row,
            rowIndex: index + 2,
            status: errors.length === 0 ? 'valid' : 'error',
            errors: errors
          };
        });

        setPreviewData(processedData);

        const errorRows = processedData.filter(item => item.status === 'error');
        setValidationErrors(errorRows);
        setIsValidating(false);
      }, 800);
    }
  }, [open, importedData, userType]);

  const handleConfirm = () => {
    const validData = previewData.filter(item => item.status === 'valid');
    if (validData.length === 0) {
      setAlertMessage("ไม่มีข้อมูลที่ถูกต้องสำหรับการนำเข้า");
      setIsAlertModalOpen(true);
      return;
    }

    if (onConfirmImport) {
      onConfirmImport(validData);
    }
    setOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
    setPreviewData([]);
    setValidationErrors([]);
  };

  if (!open) return null;

  const validCount = previewData.filter(item => item.status === 'valid').length;
  const errorCount = previewData.filter(item => item.status === 'error').length;

  return (
    <>
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <div className={styles.header}>
            <h3 className={styles.title}>
              <FiUsers className={styles.titleIcon} />
              ตรวจสอบข้อมูลเจ้าหน้าที่
            </h3>
            <button onClick={handleClose} className={styles.closeButton}>
              <FiX />
            </button>
          </div>

          <div className={styles.content}>
            {isValidating ? (
              <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>กำลังตรวจสอบข้อมูล...</p>
              </div>
            ) : (
              <>
                <div className={styles.summary}>
                  <div className={styles.summaryItem}>
                    <FiCheck className={styles.validIcon} />
                    <span>ข้อมูลถูกต้อง: <strong>{validCount}</strong> รายการ</span>
                  </div>
                  {errorCount > 0 && (
                    <div className={styles.summaryItem}>
                      <FiAlertTriangle className={styles.errorIcon} />
                      <span>ข้อมูลผิดพลาด: <strong>{errorCount}</strong> รายการ</span>
                    </div>
                  )}
                </div>

                <div className={styles.tableContainer}>
                  <table className={styles.previewTable}>
                    <thead>
                      <tr>
                        <th>สถานะ</th>
                        <th>แถว</th>
                        <th>อีเมล</th>
                        <th>รหัสเจ้าหน้าที่</th>
                        <th>ชื่อ-นามสกุล</th>
                        <th>เบอร์โทรศัพท์</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((row, index) => (
                        <tr key={index} className={row.status === 'error' ? styles.errorRow : styles.validRow}>
                          <td>
                            {row.status === 'valid' ? (
                              <FiCheck className={styles.validIcon} />
                            ) : (
                              <FiAlertTriangle className={styles.errorIcon} />
                            )}
                          </td>
                          <td>{row.rowIndex}</td>
                          <td className={styles.emailCell}>{row.Users_Email}</td>
                          <td>{row.Staff_Code}</td>
                          <td>
                            {`${row.Staff_FirstName || ''} ${row.Staff_LastName || ''}`}
                          </td>
                          <td>{row.Staff_Phone || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {validationErrors.length > 0 && (
                  <div className={styles.errorSection}>
                    <h4 className={styles.errorTitle}>รายการข้อมูลที่ผิดพลาด:</h4>
                    {validationErrors.map((error, index) => (
                      <div key={index} className={styles.errorItem}>
                        <div className={styles.errorHeader}>
                          <FiUser className={styles.errorIcon} />
                          <span>
                            แถวที่ {error.rowIndex}: {
                              `${error.Staff_FirstName || ''} ${error.Staff_LastName || ''}`
                            }
                          </span>
                        </div>
                        <ul className={styles.errorList}>
                          {error.errors && error.errors.map((err, errIndex) => (
                            <li key={errIndex}>{err}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <div className={styles.footer}>
            <div className={styles.footerButtons}>
              <button onClick={handleClose} className={styles.cancelButton}>
                ยกเลิก
              </button>
              <button
                onClick={handleConfirm}
                className={styles.confirmButton}
                disabled={validCount === 0 || isValidating}
              >
                <FiCheck className={styles.buttonIcon} />
                นำเข้าข้อมูล ({validCount} รายการ)
              </button>
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

export default ImportDataModal;