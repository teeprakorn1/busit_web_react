import React, { useState, useEffect } from 'react';
import { FiUpload, FiMapPin, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
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
  const [touched, setTouched] = useState({});
  const [filePreview, setFilePreview] = useState(null);

  useEffect(() => {
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);

  const validateName = (name, type) => {
    if (!name || name.trim() === '') {
      return `กรุณาระบุชื่อ${type === 'templates' ? 'แม่แบบ' : 'ลายเซ็น'}`;
    }

    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      return 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร';
    }

    if (trimmedName.length > 255) {
      return 'ชื่อต้องไม่เกิน 255 ตัวอักษร';
    }

    const invalidChars = /[<>"'`;\\]/;
    if (invalidChars.test(trimmedName)) {
      return 'ชื่อมีตัวอักษรที่ไม่อนุญาต';
    }

    return null;
  };

  const validateFile = (file) => {
    if (!file) {
      if (modalType === 'add') {
        return 'กรุณาเลือกไฟล์รูปภาพ';
      }
      return null;
    }

    if (!(file instanceof File)) {
      return 'ไฟล์ไม่ถูกต้อง';
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return 'กรุณาเลือกไฟล์ JPG, JPEG หรือ PNG เท่านั้น';
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return 'ขนาดไฟล์ต้องไม่เกิน 5 MB';
    }

    if (file.size < 1024) {
      return 'ไฟล์มีขนาดเล็กเกินไป';
    }

    return null;
  };

  const validatePosition = (value, axis) => {
    if (value === '' || value === null || value === undefined) {
      return null;
    }

    const numValue = Number(value);
    if (isNaN(numValue)) {
      return `ตำแหน่ง ${axis} ต้องเป็นตัวเลข`;
    }

    if (numValue < 0) {
      return `ตำแหน่ง ${axis} ต้องมากกว่าหรือเท่ากับ 0`;
    }

    if (numValue > 5000) {
      return `ตำแหน่ง ${axis} ต้องไม่เกิน 5000`;
    }

    if (!Number.isInteger(numValue)) {
      return `ตำแหน่ง ${axis} ต้องเป็นจำนวนเต็ม`;
    }

    return null;
  };

  const validateSignatureId = (signatureId) => {
    if (!signatureId || signatureId === '') {
      return null;
    }

    const numId = Number(signatureId);
    if (isNaN(numId) || numId <= 0 || numId > 2147483647) {
      return 'รหัสลายเซ็นไม่ถูกต้อง';
    }

    const signatureExists = signatures.some(sig => sig.Signature_ID === parseInt(signatureId));
    if (!signatureExists) {
      return 'ไม่พบลายเซ็นที่เลือก';
    }

    return null;
  };

  const validateForm = () => {
    const errors = {};

    const nameError = validateName(formData.name, activeTab);
    if (nameError) errors.name = nameError;

    const fileError = validateFile(selectedFile);
    if (fileError) errors.file = fileError;

    if (activeTab === 'templates') {
      const posXError = validatePosition(formData.positionX, 'X');
      if (posXError) errors.positionX = posXError;

      const posYError = validatePosition(formData.positionY, 'Y');
      if (posYError) errors.positionY = posYError;

      const sigIdError = validateSignatureId(formData.signatureId);
      if (sigIdError) errors.signatureId = sigIdError;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const errors = { ...formErrors };

    switch (field) {
      case 'name':
        const nameError = validateName(formData.name, activeTab);
        if (nameError) {
          errors.name = nameError;
        } else {
          delete errors.name;
        }
        break;

      case 'positionX':
        if (activeTab === 'templates') {
          const posXError = validatePosition(formData.positionX, 'X');
          if (posXError) {
            errors.positionX = posXError;
          } else {
            delete errors.positionX;
          }
        }
        break;

      case 'positionY':
        if (activeTab === 'templates') {
          const posYError = validatePosition(formData.positionY, 'Y');
          if (posYError) {
            errors.positionY = posYError;
          } else {
            delete errors.positionY;
          }
        }
        break;

      case 'signatureId':
        if (activeTab === 'templates') {
          const sigIdError = validateSignatureId(formData.signatureId);
          if (sigIdError) {
            errors.signatureId = sigIdError;
          } else {
            delete errors.signatureId;
          }
        }
        break;

      default:
        break;
    }

    setFormErrors(errors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      name: true,
      file: true,
      positionX: true,
      positionY: true,
      signatureId: true
    });

    if (!validateForm()) {
      return;
    }

    try {
      const submitData = {
        ...formData,
        name: formData.name.trim(),
        imageFile: selectedFile,
        positionX: formData.positionX === '' ? 0 : parseInt(formData.positionX),
        positionY: formData.positionY === '' ? 0 : parseInt(formData.positionY),
        signatureId: formData.signatureId === '' ? null : parseInt(formData.signatureId)
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
      const fileError = validateFile(file);

      if (fileError) {
        setFormErrors(prev => ({ ...prev, file: fileError }));
        setSelectedFile(null);
        setFilePreview(null);
        onFileChange(null);
        e.target.value = '';
        return;
      }
      const previewUrl = URL.createObjectURL(file);
      setFilePreview(previewUrl);
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

  const handleRemoveFile = () => {
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
    }
    setFilePreview(null);
    setSelectedFile(null);
    onFileChange(null);
    if (modalType === 'add') {
      setFormErrors(prev => ({ ...prev, file: 'กรุณาเลือกไฟล์รูปภาพ' }));
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const shouldShowError = (field) => {
    return touched[field] && formErrors[field];
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
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
          className={`${styles.input} ${shouldShowError('name') ? styles.inputError : ''}`}
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          onBlur={() => handleBlur('name')}
          placeholder={`กรอกชื่อ${activeTab === 'templates' ? 'แม่แบบ' : 'ลายเซ็น'}`}
          disabled={loading}
          maxLength={255}
        />
        {shouldShowError('name') && (
          <span className={styles.errorText}>
            <FiAlertCircle className={styles.errorTextIcon} />
            {formErrors.name}
          </span>
        )}
        <span className={styles.fieldHelp}>
          ความยาว 2-255 ตัวอักษร
        </span>
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label}>
          <FiUpload className={styles.labelIcon} />
          ไฟล์รูปภาพ
          {modalType === 'add' && <span className={styles.required}>*</span>}
        </label>
        <input
          type="file"
          className={`${styles.fileInput} ${shouldShowError('file') ? styles.inputError : ''}`}
          accept="image/jpeg,image/jpg,image/png"
          onChange={handleFileInputChange}
          onBlur={() => handleBlur('file')}
          disabled={loading}
        />
        {shouldShowError('file') && (
          <span className={styles.errorText}>
            <FiAlertCircle className={styles.errorTextIcon} />
            {formErrors.file}
          </span>
        )}

        {modalType === 'edit' && formData.imageFile && !selectedFile && (
          <div className={styles.currentFile}>
            <span className={styles.currentFileLabel}>ไฟล์ปัจจุบัน:</span>
            <span className={styles.currentFileName}>{formData.imageFile}</span>
          </div>
        )}

        {selectedFile && (
          <div className={styles.selectedFile}>
            <div className={styles.fileHeader}>
              <span className={styles.selectedFileLabel}>
                <FiCheckCircle className={styles.successIcon} />
                ไฟล์ที่เลือก:
              </span>
              <button
                type="button"
                className={styles.removeFileButton}
                onClick={handleRemoveFile}
                disabled={loading}
                title="ลบไฟล์"
              >
                ×
              </button>
            </div>
            <div className={styles.fileInfo}>
              <span className={styles.fileName}>{selectedFile.name}</span>
              <span className={styles.fileSize}>({formatFileSize(selectedFile.size)})</span>
            </div>
            {filePreview && (
              <div className={styles.filePreviewContainer}>
                <img
                  src={filePreview}
                  alt="Preview"
                  className={styles.filePreview}
                />
              </div>
            )}
          </div>
        )}

        <div className={styles.fileHelp}>
          <small>รองรับไฟล์ JPG, JPEG, PNG ขนาด 1KB - 5MB</small>
        </div>
      </div>
      {activeTab === 'templates' && (
        <>
          {/* Position X */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <FiMapPin className={styles.labelIcon} />
              ตำแหน่ง X ของลายเซ็น
            </label>
            <input
              type="number"
              className={`${styles.input} ${shouldShowError('positionX') ? styles.inputError : ''}`}
              value={formData.positionX}
              onChange={(e) => handleInputChange('positionX', e.target.value)}
              onBlur={() => handleBlur('positionX')}
              placeholder="เช่น 480"
              min="0"
              max="5000"
              step="1"
              disabled={loading}
            />
            {shouldShowError('positionX') && (
              <span className={styles.errorText}>
                <FiAlertCircle className={styles.errorTextIcon} />
                {formErrors.positionX}
              </span>
            )}
            <span className={styles.fieldHelp}>
              ตำแหน่งแนวนอนของลายเซ็น (0-5000 พิกเซล)
            </span>
          </div>

          {/* Position Y */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <FiMapPin className={styles.labelIcon} />
              ตำแหน่ง Y ของลายเซ็น
            </label>
            <input
              type="number"
              className={`${styles.input} ${shouldShowError('positionY') ? styles.inputError : ''}`}
              value={formData.positionY}
              onChange={(e) => handleInputChange('positionY', e.target.value)}
              onBlur={() => handleBlur('positionY')}
              placeholder="เช่น 600"
              min="0"
              max="5000"
              step="1"
              disabled={loading}
            />
            {shouldShowError('positionY') && (
              <span className={styles.errorText}>
                <FiAlertCircle className={styles.errorTextIcon} />
                {formErrors.positionY}
              </span>
            )}
            <span className={styles.fieldHelp}>
              ตำแหน่งแนวตั้งของลายเซ็น (0-5000 พิกเซล)
            </span>
          </div>

          {/* Signature Selection */}
          <div className={styles.formGroup}>
            <label className={styles.label}>เลือกลายเซ็น</label>
            <select
              className={`${styles.select} ${shouldShowError('signatureId') ? styles.inputError : ''}`}
              value={formData.signatureId}
              onChange={(e) => handleInputChange('signatureId', e.target.value)}
              onBlur={() => handleBlur('signatureId')}
              disabled={loading || signatures.length === 0}
            >
              <option value="">เลือกลายเซ็น</option>
              {signatures.map(sig => (
                <option key={sig.Signature_ID} value={sig.Signature_ID}>
                  {sig.Signature_Name}
                </option>
              ))}
            </select>
            {shouldShowError('signatureId') && (
              <span className={styles.errorText}>
                <FiAlertCircle className={styles.errorTextIcon} />
                {formErrors.signatureId}
              </span>
            )}
            {signatures.length === 0 && (
              <span className={styles.warningText}>
                <FiAlertCircle className={styles.warningIcon} />
                ไม่มีลายเซ็นในระบบ กรุณาเพิ่มลายเซ็นก่อน
              </span>
            )}
            <span className={styles.fieldHelp}>
              เลือกลายเซ็นที่จะใช้กับแม่แบบนี้ (ไม่บังคับ)
            </span>
          </div>
        </>
      )}

      {/* Form Actions */}
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