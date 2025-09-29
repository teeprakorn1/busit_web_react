import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  logSystemAction,
  logBulkOperation,
  logCertificateTemplateAddTimestamp,
  logCertificateTemplateEditTimestamp,
  logCertificateTemplateDeleteTimestamp,
  logCertificateTemplateSearchTimestamp,
  logCertificateSignatureAddTimestamp,
  logCertificateSignatureEditTimestamp,
  logCertificateSignatureDeleteTimestamp,
  logCertificateSignatureSearchTimestamp,
  logCertificateGenerateTimestamp
} from './../../../../utils/systemLog';

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.replace(/[<>"'&]/g, '').trim();
};

const validateId = (id) => {
  const numId = parseInt(id, 10);
  return !isNaN(numId) && numId > 0 && numId <= 2147483647;
};

const validatePosition = (position) => {
  const numPos = parseFloat(position);
  return !isNaN(numPos) && numPos >= 0 && numPos <= 5000;
};

const validateFile = (file, allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'], maxSize = 5 * 1024 * 1024) => {
  if (!file || !(file instanceof File)) {
    return { valid: false, error: 'ไฟล์ไม่ถูกต้อง' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'รองรับเฉพาะไฟล์ JPG, JPEG, PNG เท่านั้น' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: `ไฟล์ต้องมีขนาดไม่เกิน ${maxSize / 1024 / 1024} MB` };
  }

  return { valid: true };
};

const getApiUrl = (endpoint) => {
  const protocol = process.env.REACT_APP_SERVER_PROTOCOL;
  const baseUrl = process.env.REACT_APP_SERVER_BASE_URL;
  const port = process.env.REACT_APP_SERVER_PORT;

  if (!protocol || !baseUrl || !port) {
    throw new Error('Missing required environment variables');
  }

  return `${protocol}${baseUrl}${port}${endpoint}`;
};

const getImageUrl = (filename) => {
  if (!filename || filename === 'undefined' || filename.trim() === '') {
    return null;
  }

  if (!filename.match(/^[a-zA-Z0-9._-]+$/)) {
    return null;
  }

  const allowedExt = ['.jpg', '.jpeg', '.png'];
  const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();

  if (!allowedExt.includes(ext)) {
    return null;
  }

  return getApiUrl(`${process.env.REACT_APP_API_ADMIN_IMAGES_CERTIFICATE_GET}${filename}`);
};

export const useCertificateData = () => {
  const [templates, setTemplates] = useState([]);
  const [signatures, setSignatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [securityAlert, setSecurityAlert] = useState(null);
  const [imageLoadErrors, setImageLoadErrors] = useState(new Set());

  const navigate = useNavigate();

  const handleImageError = useCallback((filename) => {
    setImageLoadErrors(prev => new Set([...prev, filename]));
  }, []);

  const shouldLoadImage = useCallback((filename) => {
    return filename && !imageLoadErrors.has(filename);
  }, [imageLoadErrors]);

  const apiCall = useCallback(async (endpoint, options = {}) => {
    try {
      const defaultOptions = {
        withCredentials: true,
        timeout: 15000,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          ...options.headers,
        },
        validateStatus: (status) => status >= 200 && status < 300,
        ...options,
      };

      if (options.body && typeof options.body === 'string') {
        defaultOptions.headers['Content-Type'] = 'application/json';
      }

      const response = await axios({
        url: getApiUrl(endpoint),
        ...defaultOptions
      });

      return response.data;
    } catch (error) {
      console.error('API Call Error:', error);

      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw new Error('การเชื่อมต่อหมดเวลา กรุณาลองใหม่อีกครั้ง');
        } else if (error.response) {
          switch (error.response.status) {
            case 401:
              setSecurityAlert('กรุณาเข้าสู่ระบบใหม่');
              setTimeout(() => navigate('/login'), 2000);
              throw new Error('กรุณาเข้าสู่ระบบใหม่');
            case 403:
              setSecurityAlert('การเข้าถึงถูกปฏิเสธ - ไม่มีสิทธิ์เพียงพอ');
              throw new Error('ไม่มีสิทธิ์เข้าถึงข้อมูลนี้');
            case 404:
              throw new Error('ไม่พบข้อมูลที่ร้องขอ');
            case 429:
              throw new Error('คำขอเกินจำนวนที่กำหนด กรุณารอสักครู่แล้วลองใหม่');
            default:
              throw new Error(error.response.data?.message || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ');
          }
        } else if (error.request) {
          throw new Error('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
        }
      }

      throw error;
    }
  }, [navigate]);

  const loadTemplates = useCallback(async (params = {}) => {
    try {
      setError(null);

      const queryParams = {};
      if (params.searchQuery) {
        const sanitizedQuery = sanitizeInput(params.searchQuery);
        if (sanitizedQuery.length >= 2 && sanitizedQuery.length <= 100) {
          queryParams.search = sanitizedQuery;
        }
      }

      const result = await apiCall('/api/admin/templates', {
        method: 'GET',
        params: queryParams,
        headers: {
          'Cache-Control': 'no-cache'
        }
      });

      if (result.status) {
        const transformedTemplates = (result.data || []).map(template => ({
          Template_ID: template.Template_ID,
          Template_Name: sanitizeInput(template.Template_Name || ''),
          Template_PositionX: template.Template_PositionX || 0,
          Template_PositionY: template.Template_PositionY || 0,
          Signature_ID: template.Signature_ID,
          Signature_Name: template.Signature_Name || '',
          Signature_ImageFile: sanitizeInput(template.Signature_ImageFile || ''),
          Template_ImageFile: sanitizeInput(template.Template_ImageFile || ''),
          Template_RegisTime: template.Template_RegisTime
        }));

        setTemplates(transformedTemplates);

        if (Object.keys(params).length > 0 && params.searchQuery) {
          await logSystemAction(0, `ค้นหาแม่แบบเกียรติบัตร: ${JSON.stringify(params)}`, 'Template');
          await logCertificateTemplateSearchTimestamp(params);
        }
      } else {
        throw new Error(result.message || 'Failed to load templates');
      }
    } catch (error) {
      console.error('Load Templates Error:', error);
      setError('เกิดข้อผิดพลาดในการโหลดแม่แบบ: ' + error.message);
      setTemplates([]);
      throw error;
    }
  }, [apiCall]);

  const loadSignatures = useCallback(async (params = {}) => {
    try {
      setError(null);

      const queryParams = {};
      if (params.searchQuery) {
        const sanitizedQuery = sanitizeInput(params.searchQuery);
        if (sanitizedQuery.length >= 2 && sanitizedQuery.length <= 100) {
          queryParams.search = sanitizedQuery;
        }
      }

      const result = await apiCall('/api/admin/signatures', {
        method: 'GET',
        params: queryParams,
        headers: {
          'Cache-Control': 'no-cache'
        }
      });

      if (result.status) {
        const transformedSignatures = (result.data || []).map(signature => ({
          Signature_ID: signature.Signature_ID,
          Signature_Name: sanitizeInput(signature.Signature_Name || ''),
          Signature_ImageFile: sanitizeInput(signature.Signature_ImageFile || ''),
          Signature_RegisTime: signature.Signature_RegisTime
        }));

        setSignatures(transformedSignatures);

        if (Object.keys(params).length > 0 && params.searchQuery) {
          await logSystemAction(0, `ค้นหาลายเซ็น: ${JSON.stringify(params)}`, 'Signature');
          await logCertificateSignatureSearchTimestamp(params);
        }
      } else {
        throw new Error(result.message || 'Failed to load signatures');
      }
    } catch (error) {
      console.error('Load Signatures Error:', error);
      setError('เกิดข้อผิดพลาดในการโหลดลายเซ็น: ' + error.message);
      setSignatures([]);
      throw error;
    }
  }, [apiCall]);

  const loadAllData = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      setSecurityAlert(null);

      await Promise.all([
        loadTemplates(params),
        loadSignatures(params)
      ]);
    } catch (error) {
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [loadTemplates, loadSignatures]);

  const addTemplate = useCallback(async (templateData) => {
    if (!templateData?.name?.trim()) {
      return { success: false, error: 'กรุณาใส่ชื่อแม่แบบ' };
    }

    const sanitizedName = sanitizeInput(templateData.name);
    if (sanitizedName.length < 2 || sanitizedName.length > 100) {
      return { success: false, error: 'ชื่อแม่แบบต้องมี 2-100 ตัวอักษร' };
    }

    if (templateData.positionX !== undefined && !validatePosition(templateData.positionX)) {
      return { success: false, error: 'ตำแหน่ง X ไม่ถูกต้อง' };
    }

    if (templateData.positionY !== undefined && !validatePosition(templateData.positionY)) {
      return { success: false, error: 'ตำแหน่ง Y ไม่ถูกต้อง' };
    }

    if (templateData.signatureId && !validateId(templateData.signatureId)) {
      return { success: false, error: 'รหัสลายเซ็นไม่ถูกต้อง' };
    }

    if (templateData.imageFile) {
      const fileValidation = validateFile(templateData.imageFile);
      if (!fileValidation.valid) {
        return { success: false, error: fileValidation.error };
      }
    }

    try {
      setActionLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('templateName', sanitizedName);
      formData.append('positionX', templateData.positionX || '0');
      formData.append('positionY', templateData.positionY || '0');
      formData.append('signatureId', templateData.signatureId || '');

      if (templateData.imageFile) {
        formData.append('templateFile', templateData.imageFile);
      }

      const result = await apiCall('/api/admin/templates', {
        method: 'POST',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (result.status) {
        await loadTemplates();

        await logSystemAction(
          result.data?.Template_ID || 0,
          `เพิ่มแม่แบบใหม่: ${sanitizedName}`,
          'Template'
        );

        await logCertificateTemplateAddTimestamp(sanitizedName, result.data?.Template_ID || 0);

        return {
          success: true,
          message: 'เพิ่มแม่แบบเรียบร้อยแล้ว',
          data: result.data
        };
      } else {
        throw new Error(result.message || 'Failed to add template');
      }
    } catch (error) {
      const errorMessage = 'เกิดข้อผิดพลาดในการเพิ่มแม่แบบ: ' + error.message;
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setActionLoading(false);
    }
  }, [apiCall, loadTemplates]);

  const updateTemplate = useCallback(async (templateId, templateData) => {
    if (!validateId(templateId)) {
      setSecurityAlert('ตรวจพบการพยายามเข้าถึงข้อมูลไม่ถูกต้อง');
      return { success: false, error: 'รหัสแม่แบบไม่ถูกต้อง' };
    }

    if (!templateData?.name?.trim()) {
      return { success: false, error: 'กรุณาใส่ชื่อแม่แบบ' };
    }

    const sanitizedName = sanitizeInput(templateData.name);
    if (sanitizedName.length < 2 || sanitizedName.length > 100) {
      return { success: false, error: 'ชื่อแม่แบบต้องมี 2-100 ตัวอักษร' };
    }

    if (templateData.positionX !== undefined && !validatePosition(templateData.positionX)) {
      return { success: false, error: 'ตำแหน่ง X ไม่ถูกต้อง' };
    }

    if (templateData.positionY !== undefined && !validatePosition(templateData.positionY)) {
      return { success: false, error: 'ตำแหน่ง Y ไม่ถูกต้อง' };
    }

    if (templateData.signatureId && !validateId(templateData.signatureId)) {
      return { success: false, error: 'รหัสลายเซ็นไม่ถูกต้อง' };
    }

    if (templateData.imageFile) {
      const fileValidation = validateFile(templateData.imageFile);
      if (!fileValidation.valid) {
        return { success: false, error: fileValidation.error };
      }
    }

    try {
      setActionLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('templateName', sanitizedName);
      formData.append('positionX', templateData.positionX || '0');
      formData.append('positionY', templateData.positionY || '0');
      formData.append('signatureId', templateData.signatureId || '');

      if (templateData.imageFile) {
        formData.append('templateFile', templateData.imageFile);
      }

      const result = await apiCall(`/api/admin/templates/${templateId}`, {
        method: 'PUT',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (result.status) {
        await loadTemplates();

        await logSystemAction(
          templateId,
          `แก้ไขแม่แบบ: ${sanitizedName}`,
          'Template'
        );

        await logCertificateTemplateEditTimestamp(sanitizedName, templateId);

        return {
          success: true,
          message: 'แก้ไขแม่แบบเรียบร้อยแล้ว',
          data: result.data
        };
      } else {
        throw new Error(result.message || 'Failed to update template');
      }
    } catch (error) {
      const errorMessage = 'เกิดข้อผิดพลาดในการแก้ไขแม่แบบ: ' + error.message;
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setActionLoading(false);
    }
  }, [apiCall, loadTemplates]);

  const deleteTemplate = useCallback(async (templateId) => {
    if (!validateId(templateId)) {
      setSecurityAlert('ตรวจพบการพยายามเข้าถึงข้อมูลไม่ถูกต้อง');
      return { success: false, error: 'รหัสแม่แบบไม่ถูกต้อง' };
    }

    if (!window.confirm('คุณแน่ใจหรือไม่ที่จะลบแม่แบบนี้?')) {
      return { success: false, error: 'ยกเลิกการลบ' };
    }

    try {
      setActionLoading(true);
      setError(null);

      const template = templates.find(t => t.Template_ID === templateId);
      const templateName = template?.Template_Name || `ID: ${templateId}`;

      const result = await apiCall(`/api/admin/templates/${templateId}`, {
        method: 'DELETE'
      });

      if (result.status) {
        await loadTemplates();

        await logSystemAction(
          templateId,
          `ลบแม่แบบ: ${templateName}`,
          'Template'
        );

        await logCertificateTemplateDeleteTimestamp(templateName, templateId);

        return {
          success: true,
          message: 'ลบแม่แบบเรียบร้อยแล้ว'
        };
      } else {
        throw new Error(result.message || 'Failed to delete template');
      }
    } catch (error) {
      const errorMessage = 'เกิดข้อผิดพลาดในการลบแม่แบบ: ' + error.message;
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setActionLoading(false);
    }
  }, [apiCall, loadTemplates, templates]);

  const addSignature = useCallback(async (signatureData) => {
    if (!signatureData?.name?.trim()) {
      return { success: false, error: 'กรุณาใส่ชื่อลายเซ็น' };
    }

    const sanitizedName = sanitizeInput(signatureData.name);
    if (sanitizedName.length < 2 || sanitizedName.length > 100) {
      return { success: false, error: 'ชื่อลายเซ็นต้องมี 2-100 ตัวอักษร' };
    }

    if (signatureData.imageFile) {
      const fileValidation = validateFile(signatureData.imageFile);
      if (!fileValidation.valid) {
        return { success: false, error: fileValidation.error };
      }
    }

    try {
      setActionLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('signatureName', sanitizedName);

      if (signatureData.imageFile) {
        formData.append('signatureFile', signatureData.imageFile);
      }

      const result = await apiCall('/api/admin/signatures', {
        method: 'POST',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (result.status) {
        await loadSignatures();

        await logSystemAction(
          result.data?.Signature_ID || 0,
          `เพิ่มลายเซ็นใหม่: ${sanitizedName}`,
          'Signature'
        );

        await logCertificateSignatureAddTimestamp(sanitizedName, result.data?.Signature_ID || 0);

        return {
          success: true,
          message: 'เพิ่มลายเซ็นเรียบร้อยแล้ว',
          data: result.data
        };
      } else {
        throw new Error(result.message || 'Failed to add signature');
      }
    } catch (error) {
      const errorMessage = 'เกิดข้อผิดพลาดในการเพิ่มลายเซ็น: ' + error.message;
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setActionLoading(false);
    }
  }, [apiCall, loadSignatures]);

  const updateSignature = useCallback(async (signatureId, signatureData) => {
    if (!validateId(signatureId)) {
      setSecurityAlert('ตรวจพบการพยายามเข้าถึงข้อมูลไม่ถูกต้อง');
      return { success: false, error: 'รหัสลายเซ็นไม่ถูกต้อง' };
    }

    if (!signatureData?.name?.trim()) {
      return { success: false, error: 'กรุณาใส่ชื่อลายเซ็น' };
    }

    const sanitizedName = sanitizeInput(signatureData.name);
    if (sanitizedName.length < 2 || sanitizedName.length > 100) {
      return { success: false, error: 'ชื่อลายเซ็นต้องมี 2-100 ตัวอักษร' };
    }

    if (signatureData.imageFile) {
      const fileValidation = validateFile(signatureData.imageFile);
      if (!fileValidation.valid) {
        return { success: false, error: fileValidation.error };
      }
    }

    try {
      setActionLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('signatureName', sanitizedName);

      if (signatureData.imageFile) {
        formData.append('signatureFile', signatureData.imageFile);
      }

      const result = await apiCall(`/api/admin/signatures/${signatureId}`, {
        method: 'PUT',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (result.status) {
        await loadSignatures();

        await logSystemAction(
          signatureId,
          `แก้ไขลายเซ็น: ${sanitizedName}`,
          'Signature'
        );

        await logCertificateSignatureEditTimestamp(sanitizedName, signatureId);

        return {
          success: true,
          message: 'แก้ไขลายเซ็นเรียบร้อยแล้ว',
          data: result.data
        };
      } else {
        throw new Error(result.message || 'Failed to update signature');
      }
    } catch (error) {
      const errorMessage = 'เกิดข้อผิดพลาดในการแก้ไขลายเซ็น: ' + error.message;
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setActionLoading(false);
    }
  }, [apiCall, loadSignatures]);

  const deleteSignature = useCallback(async (signatureId) => {
    if (!validateId(signatureId)) {
      setSecurityAlert('ตรวจพบการพยายามเข้าถึงข้อมูลไม่ถูกต้อง');
      return { success: false, error: 'รหัสลายเซ็นไม่ถูกต้อง' };
    }

    if (!window.confirm('คุณแน่ใจหรือไม่ที่จะลบลายเซ็นนี้?')) {
      return { success: false, error: 'ยกเลิกการลบ' };
    }

    try {
      setActionLoading(true);
      setError(null);

      const signature = signatures.find(s => s.Signature_ID === signatureId);
      const signatureName = signature?.Signature_Name || `ID: ${signatureId}`;

      const result = await apiCall(`/api/admin/signatures/${signatureId}`, {
        method: 'DELETE'
      });

      if (result.status) {
        await loadSignatures();

        await logSystemAction(
          signatureId,
          `ลบลายเซ็น: ${signatureName}`,
          'Signature'
        );

        await logCertificateSignatureDeleteTimestamp(signatureName, signatureId);

        return {
          success: true,
          message: 'ลบลายเซ็นเรียบร้อยแล้ว'
        };
      } else {
        throw new Error(result.message || 'Failed to delete signature');
      }
    } catch (error) {
      const errorMessage = 'เกิดข้อผิดพลาดในการลบลายเซ็น: ' + error.message;
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setActionLoading(false);
    }
  }, [apiCall, loadSignatures, signatures]);

  const generateCertificate = useCallback(async (activityId, userId, templateId) => {
    if (!validateId(activityId) || !validateId(userId) || !validateId(templateId)) {
      setSecurityAlert('ตรวจพบการพยายามเข้าถึงข้อมูลไม่ถูกต้อง');
      return { success: false, error: 'ข้อมูลไม่ถูกต้อง' };
    }

    try {
      setActionLoading(true);
      setError(null);

      const result = await apiCall('/api/certificates/generate', {
        method: 'POST',
        data: JSON.stringify({
          activityId,
          userId,
          templateId
        })
      });

      if (result.status) {
        await logSystemAction(
          templateId,
          `สร้างเกียรติบัตร: กิจกรรม ${activityId}, ผู้ใช้ ${userId}`,
          'Certificate'
        );

        await logCertificateGenerateTimestamp(activityId, userId, templateId);

        return {
          success: true,
          message: 'สร้างเกียรติบัตรเรียบร้อยแล้ว',
          data: result.data
        };
      } else {
        throw new Error(result.message || 'Failed to generate certificate');
      }
    } catch (error) {
      const errorMessage = 'เกิดข้อผิดพลาดในการสร้างเกียรติบัตร: ' + error.message;
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setActionLoading(false);
    }
  }, [apiCall]);

  const getSignatureName = useCallback((signatureId) => {
    const signature = signatures.find(sig => sig.Signature_ID === signatureId);
    return signature ? signature.Signature_Name : 'ไม่ระบุ';
  }, [signatures]);

  const getTemplateById = useCallback((templateId) => {
    return templates.find(template => template.Template_ID === templateId);
  }, [templates]);

  const getSignatureById = useCallback((signatureId) => {
    return signatures.find(signature => signature.Signature_ID === signatureId);
  }, [signatures]);

  const refreshTemplate = useCallback(async (templateId) => {
    if (!validateId(templateId)) {
      console.error('Invalid template ID for refresh:', templateId);
      return;
    }

    try {
      const response = await apiCall(`/api/admin/templates/${templateId}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });

      if (response.status) {
        const updatedTemplate = response.data;
        setTemplates(prevTemplates =>
          prevTemplates.map(t =>
            t.Template_ID === templateId
              ? {
                ...t,
                Template_Name: sanitizeInput(updatedTemplate.Template_Name || t.Template_Name),
                Template_PositionX: updatedTemplate.Template_PositionX || t.Template_PositionX,
                Template_PositionY: updatedTemplate.Template_PositionY || t.Template_PositionY,
                Signature_ID: updatedTemplate.Signature_ID || t.Signature_ID,
                Template_ImageFile: sanitizeInput(updatedTemplate.Template_ImageFile || t.Template_ImageFile)
              }
              : t
          )
        );

        await logSystemAction(
          templateId,
          `รีเฟรชข้อมูลแม่แบบ ID: ${templateId}`,
          'Template'
        );
      }
    } catch (error) {
      console.warn('Failed to refresh template data:', error);
    }
  }, [apiCall]);

  const refreshSignature = useCallback(async (signatureId) => {
    if (!validateId(signatureId)) {
      console.error('Invalid signature ID for refresh:', signatureId);
      return;
    }

    try {
      const response = await apiCall(`/api/admin/signatures/${signatureId}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });

      if (response.status) {
        const updatedSignature = response.data;
        setSignatures(prevSignatures =>
          prevSignatures.map(s =>
            s.Signature_ID === signatureId
              ? {
                ...s,
                Signature_Name: sanitizeInput(updatedSignature.Signature_Name || s.Signature_Name),
                Signature_ImageFile: sanitizeInput(updatedSignature.Signature_ImageFile || s.Signature_ImageFile)
              }
              : s
          )
        );

        await logSystemAction(
          signatureId,
          `รีเฟรชข้อมูลลายเซ็น ID: ${signatureId}`,
          'Signature'
        );
      }
    } catch (error) {
      console.warn('Failed to refresh signature data:', error);
    }
  }, [apiCall]);

  const handleLogBulkOperation = useCallback(async (operationType, affectedCount, details = '') => {
    try {
      await logBulkOperation(operationType, affectedCount, details, 'Certificate');
    } catch (error) {
      console.warn('Failed to log bulk operation:', error);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearSecurityAlert = useCallback(() => {
    setSecurityAlert(null);
  }, []);

  useEffect(() => {
    if (securityAlert) {
      const timer = setTimeout(() => {
        setSecurityAlert(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [securityAlert]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      await loadAllData();
    } catch (error) {
      console.error('Refresh data error:', error);
    } finally {
      setLoading(false);
    }
  }, [loadAllData]);

  return {
    templates,
    signatures,
    loading,
    error,
    actionLoading,
    securityAlert,
    imageLoadErrors,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    refreshTemplate,
    addSignature,
    updateSignature,
    deleteSignature,
    refreshSignature,
    loadTemplates,
    loadSignatures,
    loadAllData,
    refreshData,
    getSignatureName,
    getTemplateById,
    getSignatureById,
    getImageUrl,
    handleImageError,
    shouldLoadImage,
    generateCertificate,
    clearError,
    clearSecurityAlert,
    sanitizeInput,
    validateId,
    validatePosition,
    validateFile,
    logBulkOperation: handleLogBulkOperation,
    setError,
    setSecurityAlert
  };
};