// hooks/useActivities.js
import { useState, useCallback } from 'react';
import axios from 'axios';

const getApiUrl = (endpoint) => {
  const protocol = process.env.REACT_APP_SERVER_PROTOCOL;
  const baseUrl = process.env.REACT_APP_SERVER_BASE_URL;
  const port = process.env.REACT_APP_SERVER_PORT;
  return `${protocol}${baseUrl}${port}${endpoint}`;
};

export const useActivities = () => {
  const [activities, setActivities] = useState([]);
  const [activityTypes, setActivityTypes] = useState([]);
  const [activityStatuses, setActivityStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchActivities = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);

      const activityParams = {};

      if (params.statusFilter) {
        activityParams.statusId = params.statusFilter;
      }
      if (params.typeFilter) {
        activityParams.typeId = params.typeFilter;
      }
      if (params.searchQuery) {
        activityParams.search = params.searchQuery;
      }

      const response = await axios.get(
        getApiUrl('/api/admin/activities'),
        {
          withCredentials: true,
          timeout: 15000,
          params: activityParams
        }
      );

      if (response.data?.status) {
        const transformedActivities = response.data.data.map(activity => ({
          id: activity.Activity_ID,
          title: activity.Activity_Title,
          description: activity.Activity_Description,
          locationDetail: activity.Activity_LocationDetail,
          locationGPS: activity.Activity_LocationGPS,
          startTime: activity.Activity_StartTime,
          endTime: activity.Activity_EndTime,
          imageFile: activity.Activity_ImageFile,
          isRequire: activity.Activity_IsRequire,
          allowTeachers: activity.Activity_AllowTeachers || false,
          typeName: activity.ActivityType_Name,
          statusName: activity.ActivityStatus_Name,
          templateName: activity.Template_Name,
          regisTime: activity.Activity_RegisTime,
          updateTime: activity.Activity_UpdateTime
        }));

        setActivities(transformedActivities);
      }
    } catch (err) {
      console.error('Fetch activities error:', err);
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูลกิจกรรม');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadActivityTypes = useCallback(async () => {
    try {
      const response = await axios.get(
        getApiUrl('/api/admin/activity-types'),
        { withCredentials: true }
      );
      if (response.data?.status) {
        setActivityTypes(response.data.data);
      }
    } catch (err) {
      console.error('Load activity types error:', err);
    }
  }, []);

  const loadActivityStatuses = useCallback(async () => {
    try {
      const response = await axios.get(
        getApiUrl('/api/admin/activity-statuses'),
        { withCredentials: true }
      );
      if (response.data?.status) {
        setActivityStatuses(response.data.data);
      }
    } catch (err) {
      console.error('Load activity statuses error:', err);
    }
  }, []);

  const deleteActivity = useCallback(async (activityId) => {
    try {
      setActionLoading(true);
      const response = await axios.delete(
        getApiUrl(`/api/admin/activities/${activityId}`),
        { withCredentials: true }
      );

      if (response.data?.status) {
        setActivities(prev => prev.filter(a => a.id !== activityId));
        return { success: true, message: 'ลบกิจกรรมสำเร็จ' };
      }
      return { success: false, error: response.data?.message };
    } catch (error) {
      console.error('Delete activity error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'เกิดข้อผิดพลาด'
      };
    } finally {
      setActionLoading(false);
    }
  }, []);

  return {
    activities,
    activityTypes,
    activityStatuses,
    loading,
    error,
    actionLoading,
    fetchActivities,
    loadActivityTypes,
    loadActivityStatuses,
    deleteActivity,
    setError
  };
};