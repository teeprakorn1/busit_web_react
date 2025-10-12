// hooks/useCompletedActivities.js
import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';

const getApiUrl = (endpoint) => {
  return `${process.env.REACT_APP_SERVER_PROTOCOL}${process.env.REACT_APP_SERVER_BASE_URL}${process.env.REACT_APP_SERVER_PORT}${endpoint}`;
};

export const useCompletedActivities = (studentId, userType) => {
  const [completedActivities, setCompletedActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalHours, setTotalHours] = useState(0);

  const fetchCompletedActivities = useCallback(async () => {
    if (!studentId) {
      setCompletedActivities([]);
      setTotalHours(0);
      return;
    }

    if (userType !== 'student') {
      setCompletedActivities([]);
      setTotalHours(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        getApiUrl(`/api/students/${studentId}/recent-completed-activities`),
        { withCredentials: true }
      );

      if (response.data?.status) {
        const data = response.data.data;
        setCompletedActivities(data.activities || []);
        setTotalHours(data.totalCompletedHours || 0);
      }
    } catch (err) {
      console.error('Error fetching completed activities:', err);
      setError(err.response?.data?.message || 'ไม่สามารถโหลดข้อมูลกิจกรรมที่สำเร็จได้');
      setCompletedActivities([]);
      setTotalHours(0);
    } finally {
      setLoading(false);
    }
  }, [studentId, userType]);

  useEffect(() => {
    if (studentId && userType === 'student') {
      fetchCompletedActivities();
    }
  }, [studentId, userType, fetchCompletedActivities]);

  return {
    completedActivities,
    loading,
    error,
    totalHours,
    refreshCompletedActivities: fetchCompletedActivities
  };
};

export default useCompletedActivities;