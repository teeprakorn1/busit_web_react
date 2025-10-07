import React, { useState } from 'react';
import { FiUpload, FiMapPin, FiAlertCircle } from 'react-icons/fi';
import styles from './CertificateForm.module.css';

const CertificateForm = ({
  activeTab,
  modalType,
  formData,
  signatures,
  onSubmit,
  onCancel,
  onFormDataChange,
  onFileChange,
  loading = false,
  error = null
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};

    if (!formData.name || formData.name.trim() === '') {
      errors.name = `กรุณาระบุชื่อ${activeTab === 'templates' ? 'แม่แบบ' : 'ลายเซ็น'}`;
    }

    if (modalType === 'add' && !selectedFile) {
      errors.file = 'กรุณาเลือกไฟล์รูปภาพ';
    }

    if (selectedFile) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(selectedFile.type)) {
        errors.file = 'กรุณาเลือกไฟล์ JPG, JPEG หรือ PNG เท่านั้น';
      }

      if (selectedFile.size > 10 * 1024 * 1024) {
        errors.file = 'ขนาดไฟล์ต้องไม่เกิน 10MB';
      }
    }

    if (activeTab === 'templates') {
      if (formData.positionX !== '' && (isNaN(formData.positionX) || parseInt(formData.positionX) < 0)) {
        errors.positionX = 'ตำแหน่ง X ต้องเป็นตัวเลขที่มากกว่าหรือเท่ากับ 0';
      }

      if (formData.positionY !== '' && (isNaN(formData.positionY) || parseInt(formData.positionY) < 0)) {
        errors.positionY = 'ตำแหน่ง Y ต้องเป็นตัวเลขที่มากกว่าหรือเท่ากับ 0';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const submitData = {
        ...formData,
        imageFile: selectedFile
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleInputChange = (field, value) => {
    onFormDataChange(field, value);
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      onFileChange(file);
      if (formErrors.file) {
        setFormErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.file;
          return newErrors;
        });
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && (
        <div className={styles.errorAlert}>
          <FiAlertCircle className={styles.errorIcon} />
          <span>{error}</span>
        </div>
      )}
      <div className={styles.formGroup}>
        <label className={styles.label}>
          ชื่อ{activeTab === 'templates' ? 'แม่แบบ' : 'ลายเซ็น'}
          <span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          className={`${styles.input} ${formErrors.name ? styles.inputError : ''}`}
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder={`กรอกชื่อ${activeTab === 'templates' ? 'แม่แบบ' : 'ลายเซ็น'}`}
          disabled={loading}
        />
        {formErrors.name && (
          <span className={styles.errorText}>{formErrors.name}</span>
        )}
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label}>
          <FiUpload className={styles.labelIcon} />
          ไฟล์รูปภาพ
          {modalType === 'add' && <span className={styles.required}>*</span>}
        </label>
        <input
          type="file"
          className={`${styles.fileInput} ${formErrors.file ? styles.inputError : ''}`}
          accept="image/jpeg,image/jpg,image/png"
          onChange={handleFileInputChange}
          disabled={loading}
        />
        {formErrors.file && (
          <span className={styles.errorText}>{formErrors.file}</span>
        )}
        {modalType === 'edit' && formData.imageFile && !selectedFile && (
          <div className={styles.currentFile}>
            <span className={styles.currentFileLabel}>ไฟล์ปัจจุบัน:</span>
            <span className={styles.currentFileName}>{formData.imageFile}</span>
          </div>
        )}
        {selectedFile && (
          <div className={styles.selectedFile}>
            <span className={styles.selectedFileLabel}>ไฟล์ที่เลือก:</span>
            <div className={styles.fileInfo}>
              <span className={styles.fileName}>{selectedFile.name}</span>
              <span className={styles.fileSize}>({formatFileSize(selectedFile.size)})</span>
            </div>
          </div>
        )}

        <div className={styles.fileHelp}>
          <small>รองรับไฟล์ JPG, JPEG, PNG ขนาดไม่เกิน 10MB</small>
        </div>
      </div>
      {activeTab === 'templates' && (
        <>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <FiMapPin className={styles.labelIcon} />
              ตำแหน่ง X ของลายเซ็น
            </label>
            <input
              type="number"
              className={`${styles.input} ${formErrors.positionX ? styles.inputError : ''}`}
              value={formData.positionX}
              onChange={(e) => handleInputChange('positionX', e.target.value)}
              placeholder="เช่น 480"
              min="0"
              disabled={loading}
            />
            {formErrors.positionX && (
              <span className={styles.errorText}>{formErrors.positionX}</span>
            )}
            <span className={styles.fieldHelp}>
              ตำแหน่งแนวนอนของลายเซ็นในเกียรติบัตร (หน่วย: พิกเซล)
            </span>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <FiMapPin className={styles.labelIcon} />
              ตำแหน่ง Y ของลายเซ็น
            </label>
            <input
              type="number"
              className={`${styles.input} ${formErrors.positionY ? styles.inputError : ''}`}
              value={formData.positionY}
              onChange={(e) => handleInputChange('positionY', e.target.value)}
              placeholder="เช่น 600"
              min="0"
              disabled={loading}
            />
            {formErrors.positionY && (
              <span className={styles.errorText}>{formErrors.positionY}</span>
            )}
            <span className={styles.fieldHelp}>
              ตำแหน่งแนวตั้งของลายเซ็นในเกียรติบัตร (หน่วย: พิกเซล)
            </span>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>เลือกลายเซ็น</label>
            <select
              className={styles.select}
              value={formData.signatureId}
              onChange={(e) => handleInputChange('signatureId', e.target.value)}
              disabled={loading}
            >
              <option value="">เลือกลายเซ็น</option>
              {signatures.map(sig => (
                <option key={sig.Signature_ID} value={sig.Signature_ID}>
                  {sig.Signature_Name}
                </option>
              ))}
            </select>
            <span className={styles.fieldHelp}>
              เลือกลายเซ็นที่จะใช้กับแม่แบบนี้
            </span>
          </div>
        </>
      )}
      <div className={styles.modalActions}>
        <button
          type="button"
          className={styles.cancelButton}
          onClick={onCancel}
          disabled={loading}
        >
          ยกเลิก
        </button>
        <button
          type="submit"
          className={styles.saveButton}
          disabled={loading}
        >
          {loading ? (
            <span className={styles.loadingText}>
              <span className={styles.loadingSpinner}></span>
              {modalType === 'add' ? 'กำลังเพิ่ม...' : 'กำลังบันทึก...'}
            </span>
          ) : (
            modalType === 'add' ? 'เพิ่ม' : 'บันทึก'
          )}
        </button>
      </div>
    </form>
  );
};

export default CertificateForm;