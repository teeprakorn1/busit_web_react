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

  const calculateDetailedDuration = useCallback((startTime, endTime) => {
    if (!startTime || !endTime) return { hours: 0, minutes: 0, totalHours: 0, displayText: '0 ชม.' };
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
    
    let displayText = '';
    if (hours > 0 && minutes > 0) {
      displayText = `${hours} ชม. ${minutes} นาที`;
    } else if (hours > 0) {
      displayText = `${hours} ชม.`;
    } else if (minutes > 0) {
      displayText = `${minutes} นาที`;
    } else {
      displayText = '0 ชม.';
    }
    
    return { hours, minutes, totalHours, displayText };
  }, []);

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
        
        // Calculate duration for each activity
        const activitiesWithDuration = activitiesData.map(activity => {
          const duration = calculateDetailedDuration(
            activity.Activity_StartTime,
            activity.Activity_EndTime
          );
          
          return {
            ...activity,
            Activity_TotalHours: duration.totalHours,
            Activity_Hours: duration.hours,
            Activity_Minutes: duration.minutes,
            Activity_DurationText: duration.displayText
          };
        });
        
        setActivities(activitiesWithDuration);
        
        const totalActivities = activitiesWithDuration.length;
        const completedActivities = activitiesWithDuration.filter(
          a => a.Registration_CheckOutTime
        ).length;
        const registeredActivities = activitiesWithDuration.filter(
          a => !a.Registration_CheckOutTime && a.Registration_CheckInTime
        ).length;
        const cancelledActivities = activitiesWithDuration.filter(
          a => a.Registration_IsCancelled
        ).length;

        const totalHours = activitiesWithDuration.reduce(
          (sum, a) => sum + (a.Activity_TotalHours || 0),
          0
        );
        const completedHours = activitiesWithDuration
          .filter(a => a.Registration_CheckOutTime)
          .reduce((sum, a) => sum + (a.Activity_TotalHours || 0), 0);

        setStats({
          totalActivities,
          completedActivities,
          registeredActivities,
          cancelledActivities,
          totalHours: Math.round(totalHours * 10) / 10,
          completedHours: Math.round(completedHours * 10) / 10
        });
      }
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError(err.response?.data?.message || 'ไม่สามารถโหลดข้อมูลกิจกรรมได้');
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [userId, userType, calculateDetailedDuration]);

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