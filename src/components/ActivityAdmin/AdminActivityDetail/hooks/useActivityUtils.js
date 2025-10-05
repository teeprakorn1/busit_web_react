import { useMemo } from 'react';

const useActivityUtils = (activityData) => {
  const activityInfo = useMemo(() => {
    if (!activityData) return null;

    const getStatusClass = (statusName) => {
      switch (statusName) {
        case 'เปิดรับสมัคร': return 'open';
        case 'กำลังดำเนินการ': return 'ongoing';
        case 'เสร็จสิ้น': return 'completed';
        case 'ยกเลิก': return 'cancelled';
        default: return 'default';
      }
    };

    return {
      title: activityData.Activity_Title || 'ไม่ระบุชื่อกิจกรรม',
      description: activityData.Activity_Description || '',
      startTime: activityData.Activity_StartTime,
      endTime: activityData.Activity_EndTime,
      location: activityData.Activity_LocationDetail || '',
      imageFile: activityData.Activity_ImageFile,
      statusName: activityData.ActivityStatus_Name || 'ไม่ระบุสถานะ',
      statusClass: getStatusClass(activityData.ActivityStatus_Name),
      typeName: activityData.ActivityType_Name || 'ไม่ระบุประเภท',
      isRequired: activityData.Activity_IsRequire || false,
      departments: activityData.departments || [],
      totalExpected: activityData.total_expected || 0,
      totalRegistered: activityData.total_registered || 0,
      totalCheckedIn: activityData.total_checked_in || 0,
      templateName: activityData.Template_Name || null,
      signatureName: activityData.Signature_Name || null
    };
  }, [activityData]);

  const formatActivityDate = (dateString) => {
    if (!dateString) return '';

    try {
      return new Date(dateString).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return '';
    }
  };

  const formatShortDate = (dateString) => {
    if (!dateString) return '';

    try {
      return new Date(dateString).toLocaleDateString('th-TH', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return '';
    }
  };

  const getActivityDuration = () => {
    if (!activityData?.Activity_StartTime || !activityData?.Activity_EndTime) return '';

    try {
      const start = new Date(activityData.Activity_StartTime);
      const end = new Date(activityData.Activity_EndTime);
      const diffMs = end - start;
      const diffHrs = Math.floor(diffMs / 3600000);
      const diffMins = Math.floor((diffMs % 3600000) / 60000);

      if (diffHrs > 0) {
        return `${diffHrs} ชั่วโมง ${diffMins > 0 ? `${diffMins} นาที` : ''}`;
      }
      return `${diffMins} นาที`;
    } catch (error) {
      console.error('Duration calculation error:', error);
      return '';
    }
  };

  return {
    activityInfo,
    formatActivityDate,
    formatShortDate,
    getActivityDuration
  };
};

export default useActivityUtils;