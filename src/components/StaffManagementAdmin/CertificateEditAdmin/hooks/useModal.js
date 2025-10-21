import { useState, useCallback } from 'react';

export const useModal = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    imageFile: null,
    positionX: '',
    positionY: '',
    signatureId: ''
  });

  const sanitizeInput = useCallback((input) => {
    if (typeof input !== 'string') return input;
    return input.replace(/[<>"'`;\\]/g, '').trim();
  }, []);

  const validateName = useCallback((name, activeTab) => {
    if (!name || name.trim() === '') {
      return `กรุณาระบุชื่อ${activeTab === 'templates' ? 'แม่แบบ' : 'ลายเซ็น'}`;
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
  }, []);

  const validateFile = useCallback((file, modalType) => {
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
  }, []);

  const validatePosition = useCallback((value, axis) => {
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
  }, []);

  const validateSignatureId = useCallback((signatureId, signatures = []) => {
    if (!signatureId || signatureId === '') {
      return null;
    }

    const numId = Number(signatureId);
    if (isNaN(numId) || numId <= 0 || numId > 2147483647) {
      return 'รหัสลายเซ็นไม่ถูกต้อง';
    }

    if (signatures.length > 0) {
      const signatureExists = signatures.some(sig => sig.Signature_ID === parseInt(signatureId));
      if (!signatureExists) {
        return 'ไม่พบลายเซ็นที่เลือก';
      }
    }

    return null;
  }, []);

  const validateFormData = useCallback((activeTab, signatures = []) => {
    const errors = [];
    const nameError = validateName(formData.name, activeTab);
    if (nameError) errors.push(nameError);

    const fileError = validateFile(formData.imageFile, modalType);
    if (fileError) errors.push(fileError);
    if (activeTab === 'templates') {
      const posXError = validatePosition(formData.positionX, 'X');
      if (posXError) errors.push(posXError);

      const posYError = validatePosition(formData.positionY, 'Y');
      if (posYError) errors.push(posYError);

      const sigIdError = validateSignatureId(formData.signatureId, signatures);
      if (sigIdError) errors.push(sigIdError);
    }

    return errors;
  }, [formData, modalType, validateName, validateFile, validatePosition, validateSignatureId]);

  const openModal = useCallback((type, item = null, activeTab = 'templates') => {
    setModalType(type);
    setSelectedItem(item);

    if (item) {
      if (activeTab === 'templates') {
        setFormData({
          name: item.Template_Name || '',
          imageFile: null,
          positionX: item.Template_PositionX?.toString() || '',
          positionY: item.Template_PositionY?.toString() || '',
          signatureId: item.Signature_ID?.toString() || ''
        });
      } else {
        setFormData({
          name: item.Signature_Name || '',
          imageFile: null,
          positionX: '',
          positionY: '',
          signatureId: ''
        });
      }
    } else {
      setFormData({
        name: '',
        imageFile: null,
        positionX: '',
        positionY: '',
        signatureId: ''
      });
    }

    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setSelectedItem(null);
    setFormData({
      name: '',
      imageFile: null,
      positionX: '',
      positionY: '',
      signatureId: ''
    });
  }, []);

  const updateFormData = useCallback((field, value) => {
    setFormData(prev => {
      if (field === 'name' && typeof value === 'string') {
        value = sanitizeInput(value);
      }

      if ((field === 'positionX' || field === 'positionY') && value !== '') {
        const numValue = Number(value);
        if (!isNaN(numValue) && numValue >= 0 && numValue <= 5000) {
          return { ...prev, [field]: value };
        } else if (value === '') {
          return { ...prev, [field]: '' };
        }
        return prev;
      }

      if (field === 'signatureId' && value !== '') {
        const numValue = Number(value);
        if (!isNaN(numValue) && numValue > 0) {
          return { ...prev, [field]: value };
        } else if (value === '') {
          return { ...prev, [field]: '' };
        }
        return prev;
      }

      return { ...prev, [field]: value };
    });
  }, [sanitizeInput]);

  const handleFileChange = useCallback((file) => {
    if (file && file instanceof File) {
      const fileError = validateFile(file, modalType);
      if (!fileError) {
        setFormData(prev => ({ ...prev, imageFile: file }));
      }
    } else if (file === null) {
      setFormData(prev => ({ ...prev, imageFile: null }));
    }
  }, [modalType, validateFile]);

  const resetFormData = useCallback(() => {
    setFormData({
      name: '',
      imageFile: null,
      positionX: '',
      positionY: '',
      signatureId: ''
    });
  }, []);

  const getFilePreviewUrl = useCallback(() => {
    if (formData.imageFile && formData.imageFile instanceof File) {
      return URL.createObjectURL(formData.imageFile);
    }
    return null;
  }, [formData.imageFile]);

  const cleanupPreviewUrl = useCallback((url) => {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }, []);

  const hasUnsavedChanges = useCallback((originalItem, activeTab) => {
    if (!originalItem) {
      return formData.name.trim() !== '' ||
        formData.imageFile !== null ||
        formData.positionX !== '' ||
        formData.positionY !== '' ||
        formData.signatureId !== '';
    }

    if (activeTab === 'templates') {
      return formData.name !== (originalItem.Template_Name || '') ||
        formData.positionX !== (originalItem.Template_PositionX?.toString() || '') ||
        formData.positionY !== (originalItem.Template_PositionY?.toString() || '') ||
        formData.signatureId !== (originalItem.Signature_ID?.toString() || '') ||
        (formData.imageFile instanceof File);
    } else {
      return formData.name !== (originalItem.Signature_Name || '') ||
        (formData.imageFile instanceof File);
    }
  }, [formData]);

  const prepareSubmitData = useCallback((activeTab) => {
    const submitData = {
      name: formData.name.trim(),
      imageFile: formData.imageFile
    };

    if (activeTab === 'templates') {
      submitData.positionX = formData.positionX === '' ? 0 : parseInt(formData.positionX);
      submitData.positionY = formData.positionY === '' ? 0 : parseInt(formData.positionY);
      submitData.signatureId = formData.signatureId === '' ? null : parseInt(formData.signatureId);
    }

    return submitData;
  }, [formData]);

  const getFormSummary = useCallback((activeTab) => {
    const summary = {
      name: formData.name.trim(),
      hasFile: formData.imageFile instanceof File,
      fileName: formData.imageFile?.name || null,
      fileSize: formData.imageFile?.size || 0
    };

    if (activeTab === 'templates') {
      summary.positionX = formData.positionX === '' ? 0 : parseInt(formData.positionX);
      summary.positionY = formData.positionY === '' ? 0 : parseInt(formData.positionY);
      summary.hasSignature = formData.signatureId !== '';
      summary.signatureId = formData.signatureId === '' ? null : parseInt(formData.signatureId);
    }

    return summary;
  }, [formData]);

  return {
    showModal,
    modalType,
    selectedItem,
    formData,
    openModal,
    closeModal,
    setShowModal,
    setModalType,
    setSelectedItem,
    updateFormData,
    handleFileChange,
    resetFormData,
    setFormData,
    validateFormData,
    validateName,
    validateFile,
    validatePosition,
    validateSignatureId,
    hasUnsavedChanges,
    getFilePreviewUrl,
    cleanupPreviewUrl,
    prepareSubmitData,
    getFormSummary,
    sanitizeInput
  };
};