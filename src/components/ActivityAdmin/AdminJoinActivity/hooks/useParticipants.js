// hooks/useParticipants.js
import { useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';

const getApiUrl = (endpoint) => {
  return `${process.env.REACT_APP_SERVER_PROTOCOL}${process.env.REACT_APP_SERVER_BASE_URL}${process.env.REACT_APP_SERVER_PORT}${endpoint}`;
};

export const useParticipants = (activityId) => {
  const [participants, setParticipants] = useState([]);
  const [participantImages, setParticipantImages] = useState({});
  const [imageBlobUrls, setImageBlobUrls] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      // Cleanup blob URLs
      Object.values(imageBlobUrls).forEach(url => {
        URL.revokeObjectURL(url);
      });
    };
  }, [imageBlobUrls]);

  const fetchParticipants = useCallback(async () => {
    if (!activityId) {
      setParticipants([]);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        getApiUrl(`/api/admin/activities/${activityId}/participants`),
        { withCredentials: true }
      );

      if (response.data?.status) {
        setParticipants(response.data.data || []);
      } else {
        setError('ไม่สามารถโหลดข้อมูลผู้เข้าร่วมได้');
      }
    } catch (err) {
      console.error('Fetch participants error:', err);
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  }, [activityId]);

  const fetchImageBlob = useCallback(async (imageFile) => {
    if (imageBlobUrls[imageFile]) return;

    try {
      const response = await axios.get(
        getApiUrl(`/api/admin/images/registration-images/${imageFile}`),
        {
          withCredentials: true,
          responseType: 'blob'
        }
      );

      const blobUrl = URL.createObjectURL(response.data);

      if (isMountedRef.current) {
        setImageBlobUrls(prev => ({
          ...prev,
          [imageFile]: blobUrl
        }));
      } else {
        URL.revokeObjectURL(blobUrl);
      }
    } catch (err) {
      console.error('Fetch image blob error:', err);
    }
  }, [imageBlobUrls]);

  const fetchParticipantImages = useCallback(async (userId) => {
    if (!activityId || !userId || participantImages[userId]) return;

    try {
      const response = await axios.get(
        getApiUrl(`/api/activities/${activityId}/pictures`),
        {
          withCredentials: true,
          params: { userId }
        }
      );

      if (response.data?.status && response.data.data) {
        const userImages = response.data.data.filter(img => img.Users_ID === userId);

        if (isMountedRef.current) {
          setParticipantImages(prev => ({
            ...prev,
            [userId]: userImages
          }));

          for (const img of userImages) {
            await fetchImageBlob(img.RegistrationPicture_ImageFile);
          }
        }
      }
    } catch (err) {
      console.error('Fetch participant images error:', err);
    }
  }, [activityId, participantImages, fetchImageBlob]);

  const refreshParticipants = useCallback(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  useEffect(() => {
    if (activityId) {
      fetchParticipants();
    }
  }, [activityId, fetchParticipants]);

  return {
    participants,
    participantImages,
    imageBlobUrls,
    loading,
    error,
    fetchParticipants,
    fetchParticipantImages,
    refreshParticipants
  };
};