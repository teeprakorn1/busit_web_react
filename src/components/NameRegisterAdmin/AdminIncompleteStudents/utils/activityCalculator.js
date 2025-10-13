// utils/activityCalculator.js

export const calculateCompletedActivities = (registrationPictures) => {
  if (!Array.isArray(registrationPictures)) {
    return 0;
  }

  const approvedCount = registrationPictures.filter(rp => {
    const statusId = rp.RegistrationPictureStatus_ID || rp.status_id || rp.statusId;
    return statusId === 2 || statusId === '2';
  }).length;

  return approvedCount;
};

export const calculateActivityBreakdown = (registrationPictures) => {
  if (!Array.isArray(registrationPictures)) {
    return { pending: 0, approved: 0, rejected: 0, total: 0 };
  }

  const breakdown = {
    pending: 0,   // Status = 1
    approved: 0,  // Status = 2
    rejected: 0,  // Status = 3
    total: registrationPictures.length
  };

  registrationPictures.forEach(rp => {
    const statusId = rp.RegistrationPictureStatus_ID || rp.status_id || rp.statusId;
    
    switch (statusId) {
      case 1:
      case '1':
        breakdown.pending++;
        break;
      case 2:
      case '2':
        breakdown.approved++;
        break;
      case 3:
      case '3':
        breakdown.rejected++;
        break;
      default:
        break;
    }
  });

  return breakdown;
};

export const isActivityComplete = (completedActivities, requiredActivities = 10) => {
  return completedActivities >= requiredActivities;
};

export const getRemainingActivities = (completedActivities, requiredActivities = 10) => {
  const remaining = requiredActivities - completedActivities;
  return remaining > 0 ? remaining : 0;
};

export const getStatusText = (statusId) => {
  const id = parseInt(statusId);
  switch (id) {
    case 1:
      return 'รออนุมัติ';
    case 2:
      return 'อนุมัติแล้ว';
    case 3:
      return 'ปฏิเสธ';
    default:
      return 'ไม่ทราบสถานะ';
  }
};

export const getStatusColor = (statusId) => {
  const id = parseInt(statusId);
  switch (id) {
    case 1:
      return 'warning'; // สีเหลือง - รออนุมัติ
    case 2:
      return 'success'; // สีเขียว - อนุมัติแล้ว
    case 3:
      return 'danger';  // สีแดง - ปฏิเสธ
    default:
      return 'muted';
  }
};