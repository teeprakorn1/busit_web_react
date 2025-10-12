// hooks/useActivities.js
import { useState, useCallback } from 'react';
import axios from 'axios';

const getApiUrl = (endpoint) => {
  return `${process.env.REACT_APP_SERVER_PROTOCOL}${process.env.REACT_APP_SERVER_BASE_URL}${process.env.REACT_APP_SERVER_PORT}${endpoint}`;
};

export const useActivities = () => {
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        getApiUrl('/api/admin/activities/with-participants'),
        { withCredentials: true }
      );

      if (response.data?.status && response.data.data) {
        const sortedActivities = response.data.data.sort((a, b) =>
          new Date(b.Activity_StartTime) - new Date(a.Activity_StartTime)
        );
        setActivities(sortedActivities);
      } else {
        setError('ไม่สามารถโหลดข้อมูลกิจกรรมได้');
      }
    } catch (err) {
      console.error('Fetch activities error:', err);
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูลกิจกรรม');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    activities,
    selectedActivity,
    setSelectedActivity,
    loading,
    error,
    fetchActivities
  };
};