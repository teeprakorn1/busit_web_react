// src/utils/systemLog/timestampLogger.js
import axios from 'axios';

const getApiUrl = (endpoint) => {
  const protocol = process.env.REACT_APP_SERVER_PROTOCOL;
  const baseUrl = process.env.REACT_APP_SERVER_BASE_URL;
  const port = process.env.REACT_APP_SERVER_PORT;

  if (!protocol || !baseUrl || !port) {
    throw new Error('Missing required environment variables');
  }

  return `${protocol}${baseUrl}${port}${endpoint}`;
};

export const TIMESTAMP_TYPES = {
  APPLICATION_LOGIN: 1,
  WEBSITE_LOGIN: 2,
  APPLICATION_LOGOUT: 3,
  WEBSITE_LOGOUT: 4,
  APPLICATION_RESETPASSWORD: 5,
  APPLICATION_UPDATE_PROFILE_DATA: 6,
  APPLICATION_UPDATE_PROFILE_IMAGE: 7,
  ADD_OTHERPHONE_USERS: 8,
  UPDATE_OTHERPHONE_USERS: 9,
  DELETE_OTHERPHONE_USERS: 10,
  APPLICATION_REQUEST_OTP: 11,
  APPLICATION_RESETPASSWORD_OTP: 12,
  APPLICATION_VERIFY_OTP: 13,
  WEBSITE_ADD_STUDENT: 14,
  WEBSITE_ADD_TEACHER: 15,
  WEBSITE_ADD_CSV_STUDENT: 16,
  WEBSITE_ADD_CSV_TEACHER: 17,
  WEBSITE_ADD_STAFF: 18,
  WEBSITE_ADD_CSV_STAFF: 19,
  STUDENT_STATUS_CHANGE: 20,
  STUDENT_VIEW: 21,
  STUDENT_EDIT: 22,
  STUDENT_EXPORT: 23,
  STUDENT_SEARCH: 24,
  STUDENT_FILTER: 25,
  TEACHER_STATUS_CHANGE: 26,
  TEACHER_VIEW: 27,
  TEACHER_EDIT: 28,
  TEACHER_EXPORT: 29,
  TEACHER_SEARCH: 30,
  TEACHER_FILTER: 31,
  STAFF_STATUS_CHANGE: 32,
  STAFF_VIEW: 33,
  STAFF_EDIT: 34,
  STAFF_EXPORT: 35,
  STAFF_SEARCH: 36,
  STAFF_FILTER: 37,
  CERTIFICATE_TEMPLATE_ADD: 38,
  CERTIFICATE_TEMPLATE_EDIT: 39,
  CERTIFICATE_TEMPLATE_DELETE: 40,
  CERTIFICATE_TEMPLATE_VIEW: 41,
  CERTIFICATE_TEMPLATE_SEARCH: 42,
  CERTIFICATE_SIGNATURE_ADD: 43,
  CERTIFICATE_SIGNATURE_EDIT: 44,
  CERTIFICATE_SIGNATURE_DELETE: 45,
  CERTIFICATE_SIGNATURE_VIEW: 46,
  CERTIFICATE_SIGNATURE_SEARCH: 47,
  CERTIFICATE_GENERATE: 48,
  ACTIVITY_CREATE_SUCCESS: 49,
  ACTIVITY_CREATE_FAIL: 50,
  ACTIVITY_VIEW: 51,
  ACTIVITY_EDIT_START: 52,
  ACTIVITY_EDIT_SAVE: 53,
  ACTIVITY_EDIT_CANCEL: 54,
  ACTIVITY_DELETE_CONFIRM: 55,
  ACTIVITY_EXPORT: 56,
  ACTIVITY_PARTICIPANTS_VIEW: 57,
  ACTIVITY_PARTICIPANTS_CHECKIN: 58,
  ACTIVITY_PARTICIPANTS_CHECKOUT: 59,
  ACTIVITY_DEPARTMENTS_VIEW: 60,
  ACTIVITY_STATS_VIEW: 61,
  ACTIVITY_TEMPLATE_CHANGE: 62,
  ACTIVITY_IMAGE_UPLOAD: 63
};

export const logTimestamp = async ({
  timestampName,
  timestampTypeId
}) => {
  try {
    if (!timestampName || !timestampTypeId) {
      console.warn('Missing required parameters for timestamp logging');
      return { success: false, error: 'Missing required parameters' };
    }

    if (typeof timestampTypeId !== 'number') {
      console.warn('timestampTypeId must be a number');
      return { success: false, error: 'Invalid parameter types' };
    }

    if (typeof timestampName !== 'string') {
      console.warn('timestampName must be a string');
      return { success: false, error: 'Invalid parameter types' };
    }

    const response = await axios.post(
      getApiUrl('/api/timestamp/website/insert'),
      {
        Timestamp_Name: timestampName,
        TimestampType_ID: timestampTypeId
      },
      {
        withCredentials: true,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      }
    );

    if (response.data?.status) {
      return { success: true, message: 'Timestamp logged successfully' };
    } else {
      console.warn('Failed to log timestamp:', response.data?.message);
      return {
        success: false,
        error: response.data?.message || 'Failed to log timestamp'
      };
    }
  } catch (error) {
    console.error('Error logging timestamp:', error);

    let errorMessage = 'Failed to log timestamp';
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        errorMessage = 'No permission to log timestamps';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
    }

    return { success: false, error: errorMessage };
  }
};

export const logStudentStatusChangeTimestamp = async (studentName, studentCode, action) => {
  const timestampName = `ยืนยัน${action}การใช้งานนักศึกษา: ${studentName} (${studentCode})`;

  return await logTimestamp({
    timestampName,
    timestampTypeId: TIMESTAMP_TYPES.STUDENT_STATUS_CHANGE
  });
};

export const logStudentViewTimestamp = async (studentName, studentCode) => {
  const timestampName = `ดูข้อมูลนักศึกษา: ${studentName} (${studentCode})`;

  return await logTimestamp({
    timestampName,
    timestampTypeId: TIMESTAMP_TYPES.STUDENT_VIEW
  });
};

export const logStudentEditTimestamp = async (studentName, studentCode) => {
  const timestampName = `เริ่มแก้ไขข้อมูลนักศึกษา: ${studentName} (${studentCode})`;

  return await logTimestamp({
    timestampName,
    timestampTypeId: TIMESTAMP_TYPES.STUDENT_EDIT
  });
};

export const logStudentExportTimestamp = async (exportCount, filterInfo = {}) => {
  const timestampName = `ส่งออกข้อมูลนักศึกษา: ${exportCount} รายการ ${JSON.stringify(filterInfo)}`;

  return await logTimestamp({
    timestampName,
    timestampTypeId: TIMESTAMP_TYPES.STUDENT_EXPORT
  });
};

export const logStudentSearchTimestamp = async (searchCriteria) => {
  const timestampName = `ค้นหาข้อมูลนักศึกษา: ${JSON.stringify(searchCriteria)}`;

  return await logTimestamp({
    timestampName,
    timestampTypeId: TIMESTAMP_TYPES.STUDENT_SEARCH
  });
};

export const logStudentFilterTimestamp = async (filterCriteria) => {
  const timestampName = `กรองข้อมูลนักศึกษา: ${JSON.stringify(filterCriteria)}`;

  return await logTimestamp({
    timestampName,
    timestampTypeId: TIMESTAMP_TYPES.STUDENT_FILTER
  });
};

export const logTeacherStatusChangeTimestamp = async (teacherName, teacherCode, action) => {
  const timestampName = `ยืนยัน${action}การใช้งานอาจารย์: ${teacherName} (${teacherCode})`;

  return await logTimestamp({
    timestampName,
    timestampTypeId: TIMESTAMP_TYPES.TEACHER_STATUS_CHANGE
  });
};

export const logTeacherViewTimestamp = async (teacherName, teacherCode) => {
  const timestampName = `ดูข้อมูลอาจารย์: ${teacherName} (${teacherCode})`;

  return await logTimestamp({
    timestampName,
    timestampTypeId: TIMESTAMP_TYPES.TEACHER_VIEW
  });
};

export const logTeacherEditTimestamp = async (teacherName, teacherCode) => {
  const timestampName = `เริ่มแก้ไขข้อมูลอาจารย์: ${teacherName} (${teacherCode})`;

  return await logTimestamp({
    timestampName,
    timestampTypeId: TIMESTAMP_TYPES.TEACHER_EDIT
  });
};

export const logTeacherExportTimestamp = async (exportCount, filterInfo = {}) => {
  const timestampName = `ส่งออกข้อมูลอาจารย์: ${exportCount} รายการ ${JSON.stringify(filterInfo)}`;

  return await logTimestamp({
    timestampName,
    timestampTypeId: TIMESTAMP_TYPES.TEACHER_EXPORT
  });
};

export const logTeacherSearchTimestamp = async (searchCriteria) => {
  const timestampName = `ค้นหาข้อมูลอาจารย์: ${JSON.stringify(searchCriteria)}`;

  return await logTimestamp({
    timestampName,
    timestampTypeId: TIMESTAMP_TYPES.TEACHER_SEARCH
  });
};

export const logTeacherFilterTimestamp = async (filterCriteria) => {
  const timestampName = `กรองข้อมูลอาจารย์: ${JSON.stringify(filterCriteria)}`;

  return await logTimestamp({
    timestampName,
    timestampTypeId: TIMESTAMP_TYPES.TEACHER_FILTER
  });
};

export const logStaffStatusChangeTimestamp = async (staffName, staffCode, action) => {
  const timestampName = `ยืนยัน${action}การใช้งานเจ้าหน้าที่: ${staffName} (${staffCode})`;

  return await logTimestamp({
    timestampName,
    timestampTypeId: TIMESTAMP_TYPES.STAFF_STATUS_CHANGE
  });
};

export const logStaffViewTimestamp = async (staffName, staffCode) => {
  const timestampName = `ดูข้อมูลเจ้าหน้าที่: ${staffName} (${staffCode})`;

  return await logTimestamp({
    timestampName,
    timestampTypeId: TIMESTAMP_TYPES.STAFF_VIEW
  });
};

export const logStaffEditTimestamp = async (staffName, staffCode) => {
  const timestampName = `เริ่มแก้ไขข้อมูลเจ้าหน้าที่: ${staffName} (${staffCode})`;

  return await logTimestamp({
    timestampName,
    timestampTypeId: TIMESTAMP_TYPES.STAFF_EDIT
  });
};

export const logStaffExportTimestamp = async (exportCount, filterInfo = {}) => {
  const timestampName = `ส่งออกข้อมูลเจ้าหน้าที่: ${exportCount} รายการ ${JSON.stringify(filterInfo)}`;

  return await logTimestamp({
    timestampName,
    timestampTypeId: TIMESTAMP_TYPES.STAFF_EXPORT
  });
};

export const logStaffSearchTimestamp = async (searchCriteria) => {
  const timestampName = `ค้นหาข้อมูลเจ้าหน้าที่: ${JSON.stringify(searchCriteria)}`;

  return await logTimestamp({
    timestampName,
    timestampTypeId: TIMESTAMP_TYPES.STAFF_SEARCH
  });
};

export const logStaffFilterTimestamp = async (filterCriteria) => {
  const timestampName = `กรองข้อมูลเจ้าหน้าที่: ${JSON.stringify(filterCriteria)}`;

  return await logTimestamp({
    timestampName,
    timestampTypeId: TIMESTAMP_TYPES.STAFF_FILTER
  });
};

export const logLoginTimestamp = async (userType = 'website') => {
  const timestampName = `เข้าสู่ระบบ ${userType}`;
  const typeId = userType === 'application' ? TIMESTAMP_TYPES.APPLICATION_LOGIN : TIMESTAMP_TYPES.WEBSITE_LOGIN;

  return await logTimestamp({
    timestampName,
    timestampTypeId: typeId
  });
};

export const logLogoutTimestamp = async (userType = 'website') => {
  const timestampName = `ออกจากระบบ ${userType}`;
  const typeId = userType === 'application' ? TIMESTAMP_TYPES.APPLICATION_LOGOUT : TIMESTAMP_TYPES.WEBSITE_LOGOUT;

  return await logTimestamp({
    timestampName,
    timestampTypeId: typeId
  });
};

export const logProfileUpdateTimestamp = async (updateType = 'data') => {
  const timestampName = `อัปเดตโปรไฟล์: ${updateType === 'image' ? 'รูปภาพ' : 'ข้อมูลส่วนตัว'}`;
  const typeId = updateType === 'image' ? TIMESTAMP_TYPES.APPLICATION_UPDATE_PROFILE_IMAGE : TIMESTAMP_TYPES.APPLICATION_UPDATE_PROFILE_DATA;

  return await logTimestamp({
    timestampName,
    timestampTypeId: typeId
  });
};

export const logPasswordResetTimestamp = async () => {
  const timestampName = 'รีเซ็ตรหัสผ่าน';

  return await logTimestamp({
    timestampName,
    timestampTypeId: TIMESTAMP_TYPES.APPLICATION_RESETPASSWORD
  });
};

export const logOTPRequestTimestamp = async () => {
  const timestampName = 'ขอรหัส OTP';

  return await logTimestamp({
    timestampName,
    timestampTypeId: TIMESTAMP_TYPES.APPLICATION_REQUEST_OTP
  });
};

export const logOTPVerifyTimestamp = async () => {
  const timestampName = 'ยืนยันรหัส OTP';

  return await logTimestamp({
    timestampName,
    timestampTypeId: TIMESTAMP_TYPES.APPLICATION_VERIFY_OTP
  });
};

export const logOtherPhoneAddTimestamp = async (phoneNumber) => {
  const timestampName = `เพิ่มเบอร์โทรเสริม: ${phoneNumber}`;

  return await logTimestamp({
    timestampName,
    timestampTypeId: TIMESTAMP_TYPES.ADD_OTHERPHONE_USERS
  });
};

export const logOtherPhoneUpdateTimestamp = async (phoneNumber) => {
  const timestampName = `แก้ไขเบอร์โทรเสริม: ${phoneNumber}`;

  return await logTimestamp({
    timestampName,
    timestampTypeId: TIMESTAMP_TYPES.UPDATE_OTHERPHONE_USERS
  });
};

export const logOtherPhoneDeleteTimestamp = async (phoneNumber) => {
  const timestampName = `ลบเบอร์โทรเสริม: ${phoneNumber}`;

  return await logTimestamp({
    timestampName,
    timestampTypeId: TIMESTAMP_TYPES.DELETE_OTHERPHONE_USERS
  });
};

export const logAddUserTimestamp = async (userType, userName, userCode) => {
  let timestampName = '';
  let typeId = 0;

  switch (userType) {
    case 'student':
      timestampName = `เพิ่มนักศึกษา: ${userName} (${userCode})`;
      typeId = TIMESTAMP_TYPES.WEBSITE_ADD_STUDENT;
      break;
    case 'teacher':
      timestampName = `เพิ่มอาจารย์: ${userName} (${userCode})`;
      typeId = TIMESTAMP_TYPES.WEBSITE_ADD_TEACHER;
      break;
    case 'staff':
      timestampName = `เพิ่มเจ้าหน้าที่: ${userName} (${userCode})`;
      typeId = TIMESTAMP_TYPES.WEBSITE_ADD_STAFF;
      break;
    default:
      console.warn('Invalid user type for add user timestamp');
      return { success: false, error: 'Invalid user type' };
  }

  return await logTimestamp({
    timestampName,
    timestampTypeId: typeId
  });
};

export const logCertificateTemplateAddTimestamp = async (templateName, templateId) => {
  const timestampName = `เพิ่มแม่แบบเกียรติบัตร: ${templateName} (ID: ${templateId})`;

  return await logTimestamp({
    timestampName,
    timestampTypeId: TIMESTAMP_TYPES.CERTIFICATE_TEMPLATE_ADD
  });
};

export const logCertificateTemplateEditTimestamp = async (templateName, templateId) => {
  const timestampName = `แก้ไขแม่แบบเกียรติบัตร: ${templateName} (ID: ${templateId})`;

  return await logTimestamp({
    timestampName,
    timestampTypeId: TIMESTAMP_TYPES.CERTIFICATE_TEMPLATE_EDIT
  });
};

export const logCertificateTemplateDeleteTimestamp = async (templateName, templateId) => {
  const timestampName = `ลบแม่แบบเกียรติบัตร: ${templateName} (ID: ${templateId})`;

  return await logTimestamp({
    timestampName,
    timestampTypeId: TIMESTAMP_TYPES.CERTIFICATE_TEMPLATE_DELETE
  });
};

export const logCertificateTemplateViewTimestamp = async (templateName, templateId) => {
  const timestampName = `ดูตัวอย่างแม่แบบเกียรติบัตร: ${templateName} (ID: ${templateId})`;

  return await logTimestamp({
    timestampName,
    timestampTypeId: TIMESTAMP_TYPES.CERTIFICATE_TEMPLATE_VIEW
  });
};

export const logCertificateTemplateSearchTimestamp = async (searchCriteria) => {
  const timestampName = `ค้นหาแม่แบบเกียรติบัตร: ${JSON.stringify(searchCriteria)}`;

  return await logTimestamp({
    timestampName,
    timestampTypeId: TIMESTAMP_TYPES.CERTIFICATE_TEMPLATE_SEARCH
  });
};

export const logCertificateSignatureAddTimestamp = async (signatureName, signatureId) => {
  const timestampName = `เพิ่มลายเซ็นเกียรติบัตร: ${signatureName} (ID: ${signatureId})`;

  return await logTimestamp({
    timestampName,
    timestampTypeId: TIMESTAMP_TYPES.CERTIFICATE_SIGNATURE_ADD
  });
};

export const logCertificateSignatureEditTimestamp = async (signatureName, signatureId) => {
  const timestampName = `แก้ไขลายเซ็นเกียรติบัตร: ${signatureName} (ID: ${signatureId})`;

  return await logTimestamp({
    timestampName,
    timestampTypeId: TIMESTAMP_TYPES.CERTIFICATE_SIGNATURE_EDIT
  });
};

export const logCertificateSignatureDeleteTimestamp = async (signatureName, signatureId) => {
  const timestampName = `ลบลายเซ็นเกียรติบัตร: ${signatureName} (ID: ${signatureId})`;

  return await logTimestamp({
    timestampName,
    timestampTypeId: TIMESTAMP_TYPES.CERTIFICATE_SIGNATURE_DELETE
  });
};

export const logCertificateSignatureViewTimestamp = async (signatureName, signatureId) => {
  const timestampName = `ดูตัวอย่างลายเซ็นเกียรติบัตร: ${signatureName} (ID: ${signatureId})`;

  return await logTimestamp({
    timestampName,
    timestampTypeId: TIMESTAMP_TYPES.CERTIFICATE_SIGNATURE_VIEW
  });
};

export const logCertificateSignatureSearchTimestamp = async (searchCriteria) => {
  const timestampName = `ค้นหาลายเซ็นเกียรติบัตร: ${JSON.stringify(searchCriteria)}`;

  return await logTimestamp({
    timestampName,
    timestampTypeId: TIMESTAMP_TYPES.CERTIFICATE_SIGNATURE_SEARCH
  });
};

export const logCertificateGenerateTimestamp = async (activityId, userId, templateId) => {
  const timestampName = `สร้างเกียรติบัตร: กิจกรรม ID ${activityId}, ผู้ใช้ ID ${userId}, แม่แบบ ID ${templateId}`;

  return await logTimestamp({
    timestampName,
    timestampTypeId: TIMESTAMP_TYPES.CERTIFICATE_GENERATE
  });
};

export const logCSVImportTimestamp = async (userType, importCount) => {
  let timestampName = '';
  let typeId = 0;

  switch (userType) {
    case 'student':
      timestampName = `นำเข้านักศึกษาจาก CSV: ${importCount} รายการ`;
      typeId = TIMESTAMP_TYPES.WEBSITE_ADD_CSV_STUDENT;
      break;
    case 'teacher':
      timestampName = `นำเข้าอาจารย์จาก CSV: ${importCount} รายการ`;
      typeId = TIMESTAMP_TYPES.WEBSITE_ADD_CSV_TEACHER;
      break;
    case 'staff':
      timestampName = `นำเข้าเจ้าหน้าที่จาก CSV: ${importCount} รายการ`;
      typeId = TIMESTAMP_TYPES.WEBSITE_ADD_CSV_STAFF;
      break;
    default:
      console.warn('Invalid user type for CSV import timestamp');
      return { success: false, error: 'Invalid user type' };
  }

  return await logTimestamp({
    timestampName,
    timestampTypeId: typeId
  });
};

export const logActivityView = async (activityId, activityTitle) => {
  const timestampName = `ดูรายละเอียดกิจกรรม: ${activityTitle} (ID: ${activityId})`;
  
  return await logTimestamp({
    timestampName,
    timestampTypeId: TIMESTAMP_TYPES.ACTIVITY_VIEW
  });
};

export const logActivityEditStart = async (activityId, activityTitle) => {
  const timestampName = `เริ่มแก้ไขกิจกรรม: ${activityTitle} (ID: ${activityId})`;
  
  return await logTimestamp({
    timestampName,
    timestampTypeId: TIMESTAMP_TYPES.ACTIVITY_EDIT_START
  });
};

export const logActivityEditCancel = async (activityId, activityTitle) => {
  const timestampName = `ยกเลิกการแก้ไขกิจกรรม: ${activityTitle} (ID: ${activityId})`;
  
  return await logTimestamp({
    timestampName,
    timestampTypeId: TIMESTAMP_TYPES.ACTIVITY_EDIT_CANCEL
  });
};

export const logActivityImageUpload = async (activityId, activityTitle) => {
  const timestampName = `อัปโหลดรูปภาพกิจกรรม: ${activityTitle} (ID: ${activityId})`;
  
  return await logTimestamp({
    timestampName,
    timestampTypeId: TIMESTAMP_TYPES.ACTIVITY_IMAGE_UPLOAD
  });
};

export const logActivityExport = async (activityId, activityTitle) => {
  const timestampName = `ส่งออกข้อมูลกิจกรรม: ${activityTitle} (ID: ${activityId})`;
  
  return await logTimestamp({
    timestampName,
    timestampTypeId: TIMESTAMP_TYPES.ACTIVITY_EXPORT
  });
};

export const logActivityParticipantsView = async (activityId, activityTitle) => {
  const timestampName = `ดูรายชื่อผู้เข้าร่วมกิจกรรม: ${activityTitle} (ID: ${activityId})`;
  
  return await logTimestamp({
    timestampName,
    timestampTypeId: TIMESTAMP_TYPES.ACTIVITY_PARTICIPANTS_VIEW
  });
};

export const logActivityParticipantCheckIn = async (activityId, activityTitle, participantName) => {
  const timestampName = `เช็คอินผู้เข้าร่วม: ${participantName} ในกิจกรรม "${activityTitle}"`;
  
  return await logTimestamp({
    timestampName,
    timestampTypeId: TIMESTAMP_TYPES.ACTIVITY_PARTICIPANTS_CHECKIN
  });
};

export const logActivityParticipantCheckOut = async (activityId, activityTitle, participantName) => {
  const timestampName = `เช็คเอาท์ผู้เข้าร่วม: ${participantName} ในกิจกรรม "${activityTitle}"`;
  
  return await logTimestamp({
    timestampName,
    timestampTypeId: TIMESTAMP_TYPES.ACTIVITY_PARTICIPANTS_CHECKOUT
  });
};

export const logActivityDepartmentsView = async (activityId, activityTitle) => {
  const timestampName = `ดูข้อมูลสาขาที่เข้าร่วมกิจกรรม: ${activityTitle} (ID: ${activityId})`;
  
  return await logTimestamp({
    timestampName,
    timestampTypeId: TIMESTAMP_TYPES.ACTIVITY_DEPARTMENTS_VIEW
  });
};

export const logActivityStatsView = async (activityId, activityTitle) => {
  const timestampName = `ดูสถิติกิจกรรม: ${activityTitle} (ID: ${activityId})`;
  
  return await logTimestamp({
    timestampName,
    timestampTypeId: TIMESTAMP_TYPES.ACTIVITY_STATS_VIEW
  });
};

export const logActivityCreateSuccess = async (activityTitle) => {
  const timestampName = `สร้างกิจกรรมสำเร็จ: ${activityTitle}`;
  
  return await logTimestamp({
    timestampName,
    timestampTypeId: TIMESTAMP_TYPES.ACTIVITY_CREATE_SUCCESS
  });
};

export const logActivityCreateFail = async (activityTitle, reason) => {
  const timestampName = `สร้างกิจกรรมไม่สำเร็จ: ${activityTitle} - เหตุผล: ${reason}`;
  
  return await logTimestamp({
    timestampName,
    timestampTypeId: TIMESTAMP_TYPES.ACTIVITY_CREATE_FAIL
  });
};