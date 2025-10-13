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

  const fetchCompletedActivities = useCallback(async () => {
    if (!studentId || userType !== 'student') {
      setCompletedActivities([]);
      setTotalHours(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        getApiUrl(`/api/admin/students/${studentId}`),
        { withCredentials: true }
      );

      if (response.data?.status && response.data.data) {
        const studentData = response.data.data;
        const activities = studentData.activities || [];

        const formattedActivities = activities.map(activity => {
          const duration = calculateDetailedDuration(activity.startTime, activity.endTime);

          return {
            Activity_ID: activity.id,
            Activity_Title: activity.title,
            Activity_Description: activity.description || '',
            Activity_StartTime: activity.startTime,
            Activity_EndTime: activity.endTime,
            Activity_LocationDetail: activity.locationDetail || '',
            Activity_TotalHours: duration.totalHours,
            Activity_Hours: duration.hours,
            Activity_Minutes: duration.minutes,
            Activity_DurationText: duration.displayText,
            ActivityType_Name: activity.type || 'ไม่ระบุ',
            Registration_RegisTime: activity.registrationTime,
            Registration_CheckInTime: activity.checkInTime,
            Registration_CheckOutTime: activity.checkOutTime,
            RegistrationPicture_ApprovedTime: activity.approvedDate,
            RegistrationPicture_IsAiSuccess: activity.isAiSuccess,
            RegistrationPicture_Status: activity.pictureStatus || 'อนุมัติแล้ว'
          };
        });

        const total = formattedActivities.reduce(
          (sum, activity) => sum + (activity.Activity_TotalHours || 0),
          0
        );

        setCompletedActivities(formattedActivities);
        setTotalHours(Math.round(total * 10) / 10);
      } else {
        setCompletedActivities([]);
        setTotalHours(0);
      }
    } catch (err) {
      console.error('Error fetching completed activities:', err);

      const errorMessage = err.response?.status === 403
        ? 'ไม่มีสิทธิ์เข้าถึงข้อมูล'
        : err.response?.status === 404
          ? 'ไม่พบข้อมูลนักศึกษา'
          : err.response?.data?.message || 'ไม่สามารถโหลดข้อมูลกิจกรรมที่สำเร็จได้';

      setError(errorMessage);
      setCompletedActivities([]);
      setTotalHours(0);
    } finally {
      setLoading(false);
    }
  }, [studentId, userType, calculateDetailedDuration]);

  useEffect(() => {
    if (studentId && userType === 'student') {
      fetchCompletedActivities();
    } else {
      setCompletedActivities([]);
      setTotalHours(0);
      setError(null);
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