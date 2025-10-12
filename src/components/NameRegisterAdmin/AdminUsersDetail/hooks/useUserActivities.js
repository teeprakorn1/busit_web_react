// hooks/useUserActivities.js
import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';

const getApiUrl = (endpoint) => {
  return `${process.env.REACT_APP_SERVER_PROTOCOL}${process.env.REACT_APP_SERVER_BASE_URL}${process.env.REACT_APP_SERVER_PORT}${endpoint}`;
};

export const useUserActivities = (userId, userType) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalActivities: 0,
    completedActivities: 0,
    registeredActivities: 0,
    cancelledActivities: 0,
    totalHours: 0,
    completedHours: 0
  });

  const fetchActivities = useCallback(async () => {
    if (!userId) {
      setActivities([]);
      return;
    }

    if (userType !== 'student' && userType !== 'teacher') {
      setActivities([]);
      setStats({
        totalActivities: 0,
        completedActivities: 0,
        registeredActivities: 0,
        cancelledActivities: 0,
        totalHours: 0,
        completedHours: 0
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        getApiUrl(`/api/users/${userId}/activities`),
        { withCredentials: true }
      );

      if (response.data?.status) {
        const activitiesData = response.data.data || [];
        setActivities(activitiesData);
        const totalActivities = activitiesData.length;
        const completedActivities = activitiesData.filter(
          a => a.Registration_CheckOutTime
        ).length;
        const registeredActivities = activitiesData.filter(
          a => !a.Registration_CheckOutTime && a.Registration_CheckInTime
        ).length;
        const cancelledActivities = activitiesData.filter(
          a => a.Registration_IsCancelled
        ).length;

        const totalHours = activitiesData.reduce(
          (sum, a) => sum + (a.Activity_TotalHours || 0),
          0
        );
        const completedHours = activitiesData
          .filter(a => a.Registration_CheckOutTime)
          .reduce((sum, a) => sum + (a.Activity_TotalHours || 0), 0);

        setStats({
          totalActivities,
          completedActivities,
          registeredActivities,
          cancelledActivities,
          totalHours,
          completedHours
        });
      }
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError(err.response?.data?.message || 'ไม่สามารถโหลดข้อมูลกิจกรรมได้');
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [userId, userType]);

  useEffect(() => {
    if (userId) {
      fetchActivities();
    }
  }, [userId, userType, fetchActivities]);

  return {
    activities,
    loading,
    error,
    stats,
    refreshActivities: fetchActivities
  };
};

export default useUserActivities;