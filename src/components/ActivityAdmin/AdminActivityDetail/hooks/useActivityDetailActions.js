// hooks/useActivityDetailActions.js
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserPermissions } from './useUserPermissions';
import axios from 'axios';

export const useActivityDetailActions = (activityData) => {
  const navigate = useNavigate();
  const permissions = useUserPermissions();

  const deleteActivityFromAPI = useCallback(async (activityId) => {
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_SERVER_PROTOCOL}${process.env.REACT_APP_SERVER_BASE_URL}${process.env.REACT_APP_SERVER_PORT}/api/admin/activities/${activityId}`,
        { withCredentials: true }
      );

      if (response.data?.status) {
        return { success: true, message: 'ลบกิจกรรมสำเร็จ' };
      }
      return { success: false, error: response.data?.message || 'เกิดข้อผิดพลาด' };
    } catch (error) {
      console.error('Delete activity error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'เกิดข้อผิดพลาดในการลบกิจกรรม'
      };
    }
  }, []);

  const handleDeleteActivity = useCallback(async () => {
    if (!permissions.canManageActivities) {
      alert('ไม่มีสิทธิ์ในการลบกิจกรรม - ต้องเป็น Staff เท่านั้น');
      return;
    }

    if (!activityData?.Activity_ID) {
      console.error('Invalid activity ID');
      return;
    }

    const activityTitle = activityData.Activity_Title || 'กิจกรรมนี้';
    const confirmMessage = `คุณต้องการลบกิจกรรม "${activityTitle}" หรือไม่?\n\nการดำเนินการนี้ไม่สามารถย้อนกลับได้`;

    if (window.confirm(confirmMessage)) {
      const result = await deleteActivityFromAPI(activityData.Activity_ID);

      if (result.success) {
        alert('ลบกิจกรรมสำเร็จ');
        navigate('/activity-management/activity-name');
      } else {
        alert(result.error || 'เกิดข้อผิดพลาดในการลบกิจกรรม');
      }
    }
  }, [permissions.canManageActivities, activityData, deleteActivityFromAPI, navigate]);

  const handleViewParticipants = useCallback(() => {
    if (!activityData?.Activity_ID) {
      console.error('Invalid activity ID');
      return;
    }

    navigate(`/activity-management/activity-participants/${activityData.Activity_ID}`, {
      state: {
        from: `/activity-management/activity-detail/${activityData.Activity_ID}`,
        activityData
      }
    });
  }, [navigate, activityData]);

  const handleGoBack = useCallback(() => {
    navigate('/activity-management/activity-name');
  }, [navigate]);

  return {
    handleDeleteActivity,
    handleViewParticipants,
    handleGoBack,
    permissions
  };
};

export default useActivityDetailActions;