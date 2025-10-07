import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import {
  logActivityView, logActivityEditSave,
  logActivityImageUpload, logActivityStatusChange, logActivityTemplateChange
} from '../../../../utils/systemLog';

const useAdminActivityDetail = (id) => {
  const [loading, setLoading] = useState(true);
  const [activityData, setActivityData] = useState(null);
  const [error, setError] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [securityAlert, setSecurityAlert] = useState(null);
  const [imageUrls, setImageUrls] = useState({});

  const fetchActivityData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `${process.env.REACT_APP_SERVER_PROTOCOL}${process.env.REACT_APP_SERVER_BASE_URL}${process.env.REACT_APP_SERVER_PORT}/api/admin/activities/${id}/details`,
        {
          withCredentials: true,
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
          params: {
            _t: Date.now()
          }
        }
      );

      if (response.data?.status) {
        setActivityData(response.data.data);

        // Log activity view
        if (response.data.data) {
          await logActivityView(
            response.data.data.Activity_ID,
            response.data.data.Activity_Title
          );
        }
      } else {
        setError('ไม่สามารถโหลดข้อมูลกิจกรรมได้');
      }
    } catch (err) {
      console.error('Fetch activity error:', err);
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');

      if (err.response?.status === 403) {
        setSecurityAlert('คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handleActivityDataUpdate = useCallback(async (updatedData) => {
    try {
      setUpdateLoading(true);
      setError(null);

      const formData = new FormData();

      formData.append('activityTitle', updatedData.activityTitle);
      formData.append('activityDescription', updatedData.activityDescription);
      formData.append('activityLocationDetail', updatedData.activityLocationDetail || '');
      formData.append('activityStartTime', updatedData.activityStartTime);
      formData.append('activityEndTime', updatedData.activityEndTime);
      formData.append('activityIsRequire', updatedData.activityIsRequire);

      if (updatedData.activityTypeId) {
        formData.append('activityTypeId', updatedData.activityTypeId);
      }
      if (updatedData.activityStatusId) {
        formData.append('activityStatusId', updatedData.activityStatusId);
      }
      if (updatedData.templateId) {
        formData.append('templateId', updatedData.templateId);
      }
      if (updatedData.activityLocationGPS) {
        formData.append('activityLocationGPS', updatedData.activityLocationGPS);
      }

      // Track changes for logging
      const changes = [];
      let hasImageUpload = false;
      let hasStatusChange = false;
      let hasTemplateChange = false;
      let oldStatus = activityData?.ActivityStatus_Name;
      let newStatus = oldStatus;
      let oldTemplate = activityData?.Template_Name;
      let newTemplate = oldTemplate;

      if (updatedData.activityImage) {
        formData.append('activityImage', updatedData.activityImage);
        changes.push('อัปโหลดรูปภาพใหม่');
        hasImageUpload = true;
      }

      if (updatedData.activityTitle !== activityData?.Activity_Title) {
        changes.push(`เปลี่ยนชื่อเป็น "${updatedData.activityTitle}"`);
      }

      if (updatedData.activityStatusId && updatedData.activityStatusId !== activityData?.ActivityStatus_ID) {
        hasStatusChange = true;
        changes.push('เปลี่ยนสถานะ');
      }

      if (updatedData.templateId !== activityData?.Template_ID) {
        hasTemplateChange = true;
        changes.push('เปลี่ยนแม่แบบเกียรติบัตร');
      }

      const response = await axios.put(
        `${process.env.REACT_APP_SERVER_PROTOCOL}${process.env.REACT_APP_SERVER_BASE_URL}${process.env.REACT_APP_SERVER_PORT}/api/admin/activities/${id}`,
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data?.status) {
        await new Promise(resolve => setTimeout(resolve, 500));
        await fetchActivityData();

        // Log the update
        const changesText = changes.length > 0 ? changes.join(', ') : 'แก้ไขข้อมูล';
        await logActivityEditSave(
          parseInt(id),
          updatedData.activityTitle,
          changesText
        );

        // Log specific changes
        if (hasImageUpload) {
          await logActivityImageUpload(
            parseInt(id),
            updatedData.activityTitle
          );
        }

        if (hasStatusChange) {
          await logActivityStatusChange(
            parseInt(id),
            updatedData.activityTitle,
            oldStatus,
            newStatus
          );
        }

        if (hasTemplateChange) {
          await logActivityTemplateChange(
            parseInt(id),
            updatedData.activityTitle,
            oldTemplate,
            newTemplate
          );
        }

        return { success: true, message: response.data.message };
      } else {
        throw new Error(response.data?.message || 'อัพเดทไม่สำเร็จ');
      }
    } catch (err) {
      console.error('Update activity error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'เกิดข้อผิดพลาดในการอัพเดท';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setUpdateLoading(false);
    }
  }, [id, fetchActivityData, activityData]);

  const getCachedImageUrl = useCallback((filename) => {
    if (!filename) return null;
    return imageUrls[filename] || null;
  }, [imageUrls]);

  const loadImageWithCredentials = useCallback(async (filename) => {
    if (!filename || imageUrls[filename]) return;

    try {
      const imageUrl = `${process.env.REACT_APP_SERVER_PROTOCOL}${process.env.REACT_APP_SERVER_BASE_URL}${process.env.REACT_APP_SERVER_PORT}/api/images/activities-images/${filename}`;

      setImageUrls(prev => ({
        ...prev,
        [filename]: imageUrl
      }));
    } catch (error) {
      console.error('Image load error:', error);
    }
  }, [imageUrls]);

  const handleImageError = useCallback((filename) => {
    setImageUrls(prev => {
      const newUrls = { ...prev };
      delete newUrls[filename];
      return newUrls;
    });
  }, []);

  const shouldLoadImage = useCallback((filename) => {
    return filename && !imageUrls[filename];
  }, [imageUrls]);

  useEffect(() => {
    if (id) {
      fetchActivityData();
    }
  }, [id, fetchActivityData]);

  useEffect(() => {
    if (activityData?.Activity_ImageFile && shouldLoadImage(activityData.Activity_ImageFile)) {
      loadImageWithCredentials(activityData.Activity_ImageFile);
    }
  }, [activityData?.Activity_ImageFile, shouldLoadImage, loadImageWithCredentials]);

  return {
    loading,
    activityData,
    error,
    updateLoading,
    securityAlert,
    imageUrls,
    handleActivityDataUpdate,
    retryFetch: fetchActivityData,
    setError,
    getCachedImageUrl,
    loadImageWithCredentials,
    handleImageError,
    shouldLoadImage
  };
};

export default useAdminActivityDetail;