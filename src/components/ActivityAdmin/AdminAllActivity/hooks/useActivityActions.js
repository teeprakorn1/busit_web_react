// hooks/useActivityActions.js
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserPermissions } from './useUserPermissions';

export const useActivityActions = ({
  showModal,
  closeModal,
  openActivityModal,
  deleteActivity,
  fetchActivities
}) => {
  const navigate = useNavigate();
  const permissions = useUserPermissions();

  const handleViewActivity = useCallback((activity) => {
    if (!activity?.id) {
      console.error('Invalid activity ID');
      return;
    }
    openActivityModal(activity.id);
  }, [openActivityModal]);

  const handleEditActivity = useCallback((activity) => {
    if (!permissions.canManageActivities) {
      showModal('ไม่มีสิทธิ์ในการแก้ไขกิจกรรม');
      return;
    }

    if (!activity?.id) {
      console.error('Invalid activity ID');
      return;
    }

    navigate(`/activity-management/activity-edit/${activity.id}`, {
      state: { from: '/activity-management/activity-name' }
    });
  }, [navigate, permissions.canManageActivities, showModal]);

  const handleDeleteActivity = useCallback((activity) => {
    if (!permissions.canManageActivities) {
      showModal('ไม่มีสิทธิ์ในการลบกิจกรรม - ต้องเป็น Staff เท่านั้น');
      return;
    }

    if (!activity?.id) {
      console.error('Invalid activity ID');
      return;
    }

    const confirmMessage = `คุณต้องการลบกิจกรรม "${activity.title}" หรือไม่?\n\nการดำเนินการนี้ไม่สามารถย้อนกลับได้`;

    showModal(confirmMessage, [
      {
        label: 'ยกเลิก',
        onClick: closeModal,
      },
      {
        label: 'ยืนยันการลบ',
        onClick: async () => {
          closeModal();
          
          const result = await deleteActivity(activity.id);
          
          if (result.success) {
            showModal('ลบกิจกรรมสำเร็จ');
            await fetchActivities();
          } else {
            showModal(result.error || 'เกิดข้อผิดพลาดในการลบกิจกรรม');
          }
        },
      }
    ]);
  }, [permissions.canManageActivities, showModal, closeModal, deleteActivity, fetchActivities]);

  const handleAddActivity = useCallback(() => {
    if (!permissions.canManageActivities) {
      showModal('ไม่มีสิทธิ์ในการสร้างกิจกรรม - ต้องเป็น Staff เท่านั้น');
      return;
    }

    navigate('/activity-management/activity-create', {
      state: { from: '/activity-management/activity-name' }
    });
  }, [navigate, permissions.canManageActivities, showModal]);

  return {
    handleViewActivity,
    handleEditActivity,
    handleDeleteActivity,
    handleAddActivity,
    permissions
  };
};