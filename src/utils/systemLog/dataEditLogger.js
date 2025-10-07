// src/utils/systemLog/dataEditLogger.js
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

export const DATA_EDIT_TYPES = {
  USERS_STATUS_CHANGE: 1,
  STUDENT_DATA_UPDATE: 2,
  TEACHER_DATA_UPDATE: 3,
  STAFF_DATA_UPDATE: 4,
  PROFILE_UPDATE: 5,
  SYSTEM_ACTION: 6,
  ACTIVITY_CREATE: 7,
  ACTIVITY_UPDATE: 8,
  ACTIVITY_DELETE: 9,
  ACTIVITY_STATUS_CHANGE: 10,
  ACTIVITY_DEPARTMENT_ADD: 11,
  ACTIVITY_DEPARTMENT_REMOVE: 12,
  ACTIVITY_TEMPLATE_CHANGE: 13
};

export const SOURCE_TABLES = {
  STUDENT: 'Student',
  TEACHER: 'Teacher',
  STAFF: 'Staff',
  USERS: 'Users',
  ACTIVITY: 'Activity'
};

export const logDataEdit = async ({
  dataEditThisId,
  dataEditName,
  sourceTable,
  dataEditTypeId
}) => {
  try {
    if (!dataEditThisId || !sourceTable || !dataEditTypeId) {
      console.warn('Missing required parameters for data edit logging');
      return { success: false, error: 'Missing required parameters' };
    }

    if (typeof dataEditThisId !== 'number' || typeof dataEditTypeId !== 'number') {
      console.warn('dataEditThisId and dataEditTypeId must be numbers');
      return { success: false, error: 'Invalid parameter types' };
    }

    if (!Object.values(SOURCE_TABLES).includes(sourceTable)) {
      console.warn('Invalid source table:', sourceTable);
      return { success: false, error: 'Invalid source table' };
    }

    const response = await axios.post(
      getApiUrl('/api/dataedit/website/insert'),
      {
        DataEdit_ThisId: dataEditThisId,
        DataEdit_Name: dataEditName || null,
        DataEdit_SourceTable: sourceTable,
        DataEditType_ID: dataEditTypeId
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
      return { success: true, message: 'Data edit logged successfully' };
    } else {
      console.warn('Failed to log data edit:', response.data?.message);
      return {
        success: false,
        error: response.data?.message || 'Failed to log data edit'
      };
    }
  } catch (error) {
    console.error('Error logging data edit:', error);

    let errorMessage = 'Failed to log data edit';
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        errorMessage = 'No permission to log data edits';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
    }

    return { success: false, error: errorMessage };
  }
};

// ==================== Student Loggers ====================

export const logStudentStatusChange = async (studentId, studentName, newStatus) => {
  return await logDataEdit({
    dataEditThisId: studentId,
    dataEditName: `${studentName} - สถานะเปลี่ยนเป็น: ${newStatus ? 'ใช้งาน' : 'ระงับ'}`,
    sourceTable: SOURCE_TABLES.USERS,
    dataEditTypeId: DATA_EDIT_TYPES.USERS_STATUS_CHANGE
  });
};

export const logStudentDataUpdate = async (studentId, studentName, updateType) => {
  return await logDataEdit({
    dataEditThisId: studentId,
    dataEditName: `${studentName} - ${updateType}`,
    sourceTable: SOURCE_TABLES.STUDENT,
    dataEditTypeId: DATA_EDIT_TYPES.STUDENT_DATA_UPDATE
  });
};

export const logStudentView = async (studentId, studentName, studentCode) => {
  return await logDataEdit({
    dataEditThisId: studentId,
    dataEditName: `ดูข้อมูลนักศึกษา: ${studentName} (${studentCode})`,
    sourceTable: SOURCE_TABLES.STUDENT,
    dataEditTypeId: DATA_EDIT_TYPES.SYSTEM_ACTION
  });
};

export const logStudentEdit = async (studentId, studentName, studentCode) => {
  return await logDataEdit({
    dataEditThisId: studentId,
    dataEditName: `เริ่มแก้ไขข้อมูลนักศึกษา: ${studentName} (${studentCode})`,
    sourceTable: SOURCE_TABLES.STUDENT,
    dataEditTypeId: DATA_EDIT_TYPES.STUDENT_DATA_UPDATE
  });
};

export const logStudentStatusConfirm = async (studentId, studentName, studentCode, action) => {
  return await logDataEdit({
    dataEditThisId: studentId,
    dataEditName: `ยืนยัน${action}การใช้งานนักศึกษา: ${studentName} (${studentCode})`,
    sourceTable: SOURCE_TABLES.USERS,
    dataEditTypeId: DATA_EDIT_TYPES.USERS_STATUS_CHANGE
  });
};

// ==================== Teacher Loggers ====================

export const logTeacherStatusChange = async (teacherId, teacherName, newStatus) => {
  return await logDataEdit({
    dataEditThisId: teacherId,
    dataEditName: `${teacherName} - สถานะเปลี่ยนเป็น: ${newStatus ? 'ใช้งาน' : 'ระงับ'}`,
    sourceTable: SOURCE_TABLES.USERS,
    dataEditTypeId: DATA_EDIT_TYPES.USERS_STATUS_CHANGE
  });
};

export const logTeacherDataUpdate = async (teacherId, teacherName, updateType) => {
  return await logDataEdit({
    dataEditThisId: teacherId,
    dataEditName: `${teacherName} - ${updateType}`,
    sourceTable: SOURCE_TABLES.TEACHER,
    dataEditTypeId: DATA_EDIT_TYPES.TEACHER_DATA_UPDATE
  });
};

export const logTeacherView = async (teacherId, teacherName, teacherCode) => {
  return await logDataEdit({
    dataEditThisId: teacherId,
    dataEditName: `ดูข้อมูลอาจารย์: ${teacherName} (${teacherCode})`,
    sourceTable: SOURCE_TABLES.TEACHER,
    dataEditTypeId: DATA_EDIT_TYPES.SYSTEM_ACTION
  });
};

export const logTeacherEdit = async (teacherId, teacherName, teacherCode) => {
  return await logDataEdit({
    dataEditThisId: teacherId,
    dataEditName: `เริ่มแก้ไขข้อมูลอาจารย์: ${teacherName} (${teacherCode})`,
    sourceTable: SOURCE_TABLES.TEACHER,
    dataEditTypeId: DATA_EDIT_TYPES.TEACHER_DATA_UPDATE
  });
};

export const logTeacherStatusConfirm = async (teacherId, teacherName, teacherCode, action) => {
  return await logDataEdit({
    dataEditThisId: teacherId,
    dataEditName: `ยืนยัน${action}การใช้งานอาจารย์: ${teacherName} (${teacherCode})`,
    sourceTable: SOURCE_TABLES.USERS,
    dataEditTypeId: DATA_EDIT_TYPES.USERS_STATUS_CHANGE
  });
};

// ==================== Staff Loggers ====================

export const logStaffStatusChange = async (staffId, staffName, newStatus) => {
  return await logDataEdit({
    dataEditThisId: staffId,
    dataEditName: `${staffName} - สถานะเปลี่ยนเป็น: ${newStatus ? 'ใช้งาน' : 'ระงับ'}`,
    sourceTable: SOURCE_TABLES.USERS,
    dataEditTypeId: DATA_EDIT_TYPES.USERS_STATUS_CHANGE
  });
};

export const logStaffDataUpdate = async (staffId, staffName, updateType) => {
  return await logDataEdit({
    dataEditThisId: staffId,
    dataEditName: `${staffName} - ${updateType}`,
    sourceTable: SOURCE_TABLES.STAFF,
    dataEditTypeId: DATA_EDIT_TYPES.STAFF_DATA_UPDATE
  });
};

export const logStaffView = async (staffId, staffName, staffCode) => {
  return await logDataEdit({
    dataEditThisId: staffId,
    dataEditName: `ดูข้อมูลเจ้าหน้าที่: ${staffName} (${staffCode})`,
    sourceTable: SOURCE_TABLES.STAFF,
    dataEditTypeId: DATA_EDIT_TYPES.SYSTEM_ACTION
  });
};

export const logStaffEdit = async (staffId, staffName, staffCode) => {
  return await logDataEdit({
    dataEditThisId: staffId,
    dataEditName: `เริ่มแก้ไขข้อมูลเจ้าหน้าที่: ${staffName} (${staffCode})`,
    sourceTable: SOURCE_TABLES.STAFF,
    dataEditTypeId: DATA_EDIT_TYPES.STAFF_DATA_UPDATE
  });
};

export const logStaffStatusConfirm = async (staffId, staffName, staffCode, action) => {
  return await logDataEdit({
    dataEditThisId: staffId,
    dataEditName: `ยืนยัน${action}การใช้งานเจ้าหน้าที่: ${staffName} (${staffCode})`,
    sourceTable: SOURCE_TABLES.USERS,
    dataEditTypeId: DATA_EDIT_TYPES.USERS_STATUS_CHANGE
  });
};

// ==================== System Action Loggers ====================

export const logSystemAction = async (targetId, actionName, sourceTable = SOURCE_TABLES.STUDENT) => {
  return await logDataEdit({
    dataEditThisId: targetId,
    dataEditName: actionName,
    sourceTable: sourceTable,
    dataEditTypeId: DATA_EDIT_TYPES.SYSTEM_ACTION
  });
};

export const logBulkOperation = async (operationType, affectedCount, details = '', sourceTable = SOURCE_TABLES.STUDENT) => {
  return await logDataEdit({
    dataEditThisId: 0,
    dataEditName: `${operationType} - จำนวน: ${affectedCount} รายการ ${details ? `- ${details}` : ''}`,
    sourceTable: sourceTable,
    dataEditTypeId: DATA_EDIT_TYPES.SYSTEM_ACTION
  });
};

export const logStudentExport = async (exportCount, filterInfo = {}) => {
  return await logBulkOperation(
    'ส่งออกข้อมูลนักศึกษา Excel',
    exportCount,
    `ตัวกรอง: ${JSON.stringify(filterInfo)}`,
    SOURCE_TABLES.STUDENT
  );
};

export const logTeacherExport = async (exportCount, filterInfo = {}) => {
  return await logBulkOperation(
    'ส่งออกข้อมูลอาจารย์ Excel',
    exportCount,
    `ตัวกรอง: ${JSON.stringify(filterInfo)}`,
    SOURCE_TABLES.TEACHER
  );
};

export const logStaffExport = async (exportCount, filterInfo = {}) => {
  return await logBulkOperation(
    'ส่งออกข้อมูลเจ้าหน้าที่ Excel',
    exportCount,
    `ตัวกรอง: ${JSON.stringify(filterInfo)}`,
    SOURCE_TABLES.STAFF
  );
};

export const logStudentSearch = async (searchCriteria) => {
  return await logSystemAction(
    0,
    `ค้นหาข้อมูลนักศึกษา: ${JSON.stringify(searchCriteria)}`,
    SOURCE_TABLES.STUDENT
  );
};

export const logTeacherSearch = async (searchCriteria) => {
  return await logSystemAction(
    0,
    `ค้นหาข้อมูลอาจารย์: ${JSON.stringify(searchCriteria)}`,
    SOURCE_TABLES.TEACHER
  );
};

export const logStaffSearch = async (searchCriteria) => {
  return await logSystemAction(
    0,
    `ค้นหาข้อมูลเจ้าหน้าที่: ${JSON.stringify(searchCriteria)}`,
    SOURCE_TABLES.STAFF
  );
};

export const logStudentFilter = async (filterCriteria) => {
  return await logSystemAction(
    0,
    `กรองข้อมูลนักศึกษา: ${JSON.stringify(filterCriteria)}`,
    SOURCE_TABLES.STUDENT
  );
};

export const logTeacherFilter = async (filterCriteria) => {
  return await logSystemAction(
    0,
    `กรองข้อมูลอาจารย์: ${JSON.stringify(filterCriteria)}`,
    SOURCE_TABLES.TEACHER
  );
};

export const logStaffFilter = async (filterCriteria) => {
  return await logSystemAction(
    0,
    `กรองข้อมูลเจ้าหน้าที่: ${JSON.stringify(filterCriteria)}`,
    SOURCE_TABLES.STAFF
  );
};

// ==================== Activity Data Edit Loggers ====================

export const logActivityDataEdit = async ({
  activityId,
  editName,
  editTypeId
}) => {
  return await logDataEdit({
    dataEditThisId: activityId,
    dataEditName: editName,
    sourceTable: SOURCE_TABLES.ACTIVITY,
    dataEditTypeId: editTypeId
  });
};

export const logActivityEditSave = async (activityId, activityTitle, changes) => {
  return await logActivityDataEdit({
    activityId,
    editName: `แก้ไขกิจกรรม: ${activityTitle} - ${changes}`,
    editTypeId: DATA_EDIT_TYPES.ACTIVITY_UPDATE
  });
};

export const logActivityDelete = async (activityId, activityTitle) => {
  return await logActivityDataEdit({
    activityId,
    editName: `ลบกิจกรรม: ${activityTitle}`,
    editTypeId: DATA_EDIT_TYPES.ACTIVITY_DELETE
  });
};

export const logActivityStatusChange = async (activityId, activityTitle, oldStatus, newStatus) => {
  return await logActivityDataEdit({
    activityId,
    editName: `เปลี่ยนสถานะกิจกรรม: ${activityTitle} จาก "${oldStatus}" เป็น "${newStatus}"`,
    editTypeId: DATA_EDIT_TYPES.ACTIVITY_STATUS_CHANGE
  });
};

export const logActivityTemplateChange = async (activityId, activityTitle, oldTemplate, newTemplate) => {
  return await logActivityDataEdit({
    activityId,
    editName: `เปลี่ยนแม่แบบเกียรติบัตร: ${activityTitle} จาก "${oldTemplate || 'ไม่มี'}" เป็น "${newTemplate || 'ไม่มี'}"`,
    editTypeId: DATA_EDIT_TYPES.ACTIVITY_TEMPLATE_CHANGE
  });
};

export const logActivityDepartmentAdd = async (activityId, activityTitle, departmentName) => {
  return await logActivityDataEdit({
    activityId,
    editName: `เพิ่มสาขา "${departmentName}" เข้าสู่กิจกรรม: ${activityTitle}`,
    editTypeId: DATA_EDIT_TYPES.ACTIVITY_DEPARTMENT_ADD
  });
};

export const logActivityDepartmentRemove = async (activityId, activityTitle, departmentName) => {
  return await logActivityDataEdit({
    activityId,
    editName: `ลบสาขา "${departmentName}" ออกจากกิจกรรม: ${activityTitle}`,
    editTypeId: DATA_EDIT_TYPES.ACTIVITY_DEPARTMENT_REMOVE
  });
};