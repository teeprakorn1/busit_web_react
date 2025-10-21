import { useState } from 'react';

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

  const openModal = (type, item = null, activeTab = 'templates') => {
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
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    setFormData({
      name: '',
      imageFile: null,
      positionX: '',
      positionY: '',
      signatureId: ''
    });
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (file) => {
    if (file && file instanceof File) {
      setFormData(prev => ({ ...prev, imageFile: file }));
    } else if (file === null) {
      setFormData(prev => ({ ...prev, imageFile: null }));
    }
  };

  const resetFormData = () => {
    setFormData({
      name: '',
      imageFile: null,
      positionX: '',
      positionY: '',
      signatureId: ''
    });
  };

  const validateFormData = (activeTab) => {
    const errors = [];

    if (!formData.name || formData.name.trim() === '') {
      errors.push(`กรุณาระบุชื่อ${activeTab === 'templates' ? 'แม่แบบ' : 'ลายเซ็น'}`);
    }

    if (modalType === 'add' && !formData.imageFile) {
      errors.push('กรุณาเลือกไฟล์รูปภาพ');
    }

    if (formData.imageFile && formData.imageFile instanceof File) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(formData.imageFile.type)) {
        errors.push('กรุณาเลือกไฟล์ JPG, JPEG หรือ PNG เท่านั้น');
      }

      if (formData.imageFile.size > 10 * 1024 * 1024) {
        errors.push('ขนาดไฟล์ต้องไม่เกิน 10MB');
      }
    }

    if (activeTab === 'templates') {
      if (formData.positionX !== '' && (isNaN(formData.positionX) || parseInt(formData.positionX) < 0)) {
        errors.push('ตำแหน่ง X ต้องเป็นตัวเลขที่มากกว่าหรือเท่ากับ 0');
      }

      if (formData.positionY !== '' && (isNaN(formData.positionY) || parseInt(formData.positionY) < 0)) {
        errors.push('ตำแหน่ง Y ต้องเป็นตัวเลขที่มากกว่าหรือเท่ากับ 0');
      }
    }

    return errors;
  };

  const getFilePreviewUrl = () => {
    if (formData.imageFile && formData.imageFile instanceof File) {
      return URL.createObjectURL(formData.imageFile);
    }
    return null;
  };

  const cleanupPreviewUrl = (url) => {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  };

  const hasUnsavedChanges = (originalItem, activeTab) => {
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
  };

  return {
    showModal,
    modalType,
    selectedItem,
    formData,
    openModal,
    closeModal,
    updateFormData,
    handleFileChange,
    resetFormData,
    validateFormData,
    getFilePreviewUrl,
    cleanupPreviewUrl,
    hasUnsavedChanges,
    setFormData,
    setShowModal,
    setModalType,
    setSelectedItem
  };
};