// hooks/useParticipants.js
import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';

const getApiUrl = (endpoint) => {
  return `${process.env.REACT_APP_SERVER_PROTOCOL}${process.env.REACT_APP_SERVER_BASE_URL}${process.env.REACT_APP_SERVER_PORT}${endpoint}`;
};

export const useParticipants = (activityId) => {
  const [participants, setParticipants] = useState([]);
  const [participantImages, setParticipantImages] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAllParticipantImages = useCallback(async (activityId) => {
    if (!activityId) return;

    try {
      const response = await axios.get(
        getApiUrl(`/api/admin/activities/${activityId}/pictures/all`),
        { withCredentials: true }
      );

      if (response.data?.status) {
        const allImages = response.data.data || [];
        const imagesByUser = {};
        allImages.forEach(image => {
          if (!imagesByUser[image.Users_ID]) {
            imagesByUser[image.Users_ID] = [];
          }
          imagesByUser[image.Users_ID].push(image);
        });

        setParticipantImages(imagesByUser);
      }
    } catch (err) {
      console.error('❌ Error fetching all images:', err);
    }
  }, []);

  const fetchParticipants = useCallback(async () => {
    if (!activityId) {
      setParticipants([]);
      setParticipantImages({});
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        getApiUrl(`/api/admin/activities/${activityId}/participants`),
        { withCredentials: true }
      );

      if (response.data?.status) {
        const participantsData = response.data.data || [];
        setParticipants(participantsData);

        if (participantsData.length > 0) {
          await fetchAllParticipantImages(activityId);
        } else {
          setParticipantImages({});
        }
      }
    } catch (err) {
      console.error('❌ Error fetching participants:', err);
      setError(err.response?.data?.message || 'ไม่สามารถโหลดข้อมูลผู้เข้าร่วมได้');
      setParticipants([]);
      setParticipantImages({});
    } finally {
      setLoading(false);
    }
  }, [activityId, fetchAllParticipantImages]);

  const fetchParticipantImages = useCallback(async (userId) => {
    if (!activityId || participantImages[userId]) {
      return;
    }

    try {
      const response = await axios.get(
        getApiUrl(`/api/admin/activities/${activityId}/participants/${userId}/images`),
        { withCredentials: true }
      );

      if (response.data?.status) {
        setParticipantImages(prev => ({
          ...prev,
          [userId]: response.data.data || []
        }));
      }
    } catch (err) {
      console.error('Error fetching participant images:', err);
    }
  }, [activityId, participantImages]);

  const refreshParticipants = useCallback(() => {
    return fetchParticipants();
  }, [fetchParticipants]);

  useEffect(() => {
    if (activityId) {
      fetchParticipants();
    } else {
      setParticipants([]);
      setParticipantImages({});
      setError(null);
    }
  }, [activityId, fetchParticipants]);

  return {
    participants,
    participantImages,
    loading,
    error,
    fetchParticipants,
    fetchParticipantImages,
    refreshParticipants
  };
};