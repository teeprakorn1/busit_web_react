import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { exportFilteredDepartmentsToExcel } from '../utils/excelExportUtils';
import { useUserPermissions } from './useUserPermissions';

export const useDepartmentActions = ({
  validateId,
  sanitizeInput,
  setSecurityAlert,
  showModal,
  closeModal,
  openDepartmentModal,
  fetchDepartments
}) => {
  const navigate = useNavigate();
  const permissions = useUserPermissions();

  const handleViewDepartment = useCallback((department) => {
    if (!permissions.canViewStudents) {
      setSecurityAlert('ไม่มีสิทธิ์ในการดูรายละเอียดสาขา');
      return;
    }

    if (!department?.Department_ID || !validateId(department.Department_ID)) {
      console.error('Invalid department ID:', department?.Department_ID);
      setSecurityAlert('ตรวจพบการพยายามเข้าถึงข้อมูลไม่ถูกต้อง');
      return;
    }
    openDepartmentModal(department.Department_ID);
  }, [permissions.canViewStudents, validateId, setSecurityAlert, openDepartmentModal]);

  const handleExportToExcel = useCallback((departments, filterInfo) => {
    if (!permissions.canExportData) {
      setSecurityAlert('ไม่มีสิทธิ์ในการส่งออกข้อมูล');
      return;
    }
    return exportFilteredDepartmentsToExcel(departments, filterInfo);
  }, [permissions.canExportData, setSecurityAlert]);

  const handleViewTeachers = useCallback((department, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (!permissions.canViewTeachers) {
      setSecurityAlert('ไม่มีสิทธิ์ในการดูรายชื่ออาจารย์');
      return;
    }

    if (!department?.Department_ID || !validateId(department.Department_ID)) {
      console.error('Invalid department ID:', department?.Department_ID);
      setSecurityAlert('ตรวจพบการพยายามเข้าถึงข้อมูลไม่ถูกต้อง');
      return;
    }

    navigate(`/name-register/teacher-name?departmentId=${department.Department_ID}`, { 
      replace: false
    });
  }, [navigate, permissions.canViewTeachers, validateId, setSecurityAlert]);

  const handleViewStudents = useCallback((department, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (!permissions.canViewStudents) {
      setSecurityAlert('ไม่มีสิทธิ์ในการดูรายชื่อนักศึกษา');
      return;
    }

    if (!department?.Department_ID || !validateId(department.Department_ID)) {
      console.error('Invalid department ID:', department?.Department_ID);
      setSecurityAlert('ตรวจพบการพยายามเข้าถึงข้อมูลไม่ถูกต้อง');
      return;
    }

    navigate(`/name-register/student-name?departmentId=${department.Department_ID}`, {
      replace: false
    });
  }, [navigate, permissions.canViewStudents, validateId, setSecurityAlert]);

  const handleRefreshDepartment = useCallback(async (departmentId) => {
    if (!validateId(departmentId)) {
      console.error('Invalid department ID for refresh:', departmentId);
      return;
    }

    try {
      await fetchDepartments();
    } catch (error) {
      console.warn('Failed to refresh department data:', error);
    }
  }, [validateId, fetchDepartments]);

  const handleShowDepartmentInfo = useCallback((department, filterInfo) => {
    const departmentName = sanitizeInput(department.Department_Name || '');
    const facultyName = sanitizeInput(department.Faculty_Name || '');
    const teacherCount = department.teacher_count || 0;
    const studentCount = department.student_count || 0;
    const totalPersonnel = teacherCount + studentCount;

    const infoMessage = `
ข้อมูลสาขา: ${departmentName}
คณะ: ${facultyName}
จำนวนอาจารย์: ${teacherCount} คน
จำนวนนักศึกษา: ${studentCount} คน
รวมทั้งหมด: ${totalPersonnel} คน

คุณต้องการดำเนินการอะไร?
    `;

    showModal(infoMessage, [
      {
        label: 'ดูรายชื่ออาจารย์',
        onClick: () => {
          closeModal();
          handleViewTeachers(department);
        },
      },
      {
        label: 'ดูรายชื่อนักศึกษา',
        onClick: () => {
          closeModal();
          handleViewStudents(department);
        },
      },
      {
        label: 'ส่งออกข้อมูล',
        onClick: () => {
          closeModal();
          handleExportToExcel([department], filterInfo);
        },
      },
      {
        label: 'ปิด',
        onClick: closeModal,
      }
    ]);
  }, [sanitizeInput, showModal, closeModal, handleViewTeachers, handleViewStudents, handleExportToExcel]);

  const handleBulkExport = useCallback((departments, filterInfo, options = {}) => {
    if (!permissions.canExportData) {
      setSecurityAlert('ไม่มีสิทธิ์ในการส่งออกข้อมูล');
      return;
    }

    if (!departments || departments.length === 0) {
      showModal('ไม่มีข้อมูลสำหรับการส่งออก', [
        {
          label: 'ตกลง',
          onClick: closeModal,
        }
      ]);
      return;
    }

    const confirmMessage = `
คุณต้องการส่งออกข้อมูลสาขาทั้งหมด ${departments.length} สาขา เป็นไฟล์ Excel หรือไม่?

ข้อมูลที่จะส่งออก:
- รายชื่อสาขาทั้งหมด
- จำนวนอาจารย์และนักศึกษา
- สรุปตามคณะ
- สถิติรวม
    `;

    showModal(confirmMessage, [
      {
        label: 'ยกเลิก',
        onClick: closeModal,
      },
      {
        label: 'ส่งออกข้อมูล',
        onClick: () => {
          closeModal();
          const success = exportFilteredDepartmentsToExcel(departments, filterInfo, options);
          if (success) {
            showModal('ส่งออกข้อมูลเรียบร้อยแล้ว', [
              {
                label: 'ตกลง',
                onClick: closeModal,
              }
            ]);
          }
        },
      }
    ]);
  }, [permissions.canExportData, setSecurityAlert, showModal, closeModal]);

  const handleAddUser = useCallback(() => {
    if (!permissions.canAddStudents && !permissions.canAddTeachers) {
      setSecurityAlert('ไม่มีสิทธิ์ในการเพิ่มผู้ใช้งาน - ต้องเป็น Staff เท่านั้น');
      return;
    }
    
    navigate('/application/add-user', { 
      state: { from: '/name-register/department-name' } 
    });
  }, [navigate, permissions.canAddStudents, permissions.canAddTeachers, setSecurityAlert]);

  const handleAddStudent = useCallback(() => {
    if (!permissions.canAddStudents) {
      setSecurityAlert('ไม่มีสิทธิ์ในการเพิ่มนักศึกษา - ต้องเป็น Staff เท่านั้น');
      return;
    }
    
    navigate('/application/add-user', { 
      state: { 
        from: '/name-register/department-name',
        userType: 'student'
      } 
    });
  }, [navigate, permissions.canAddStudents, setSecurityAlert]);

  const handleAddTeacher = useCallback(() => {
    if (!permissions.canAddTeachers) {
      setSecurityAlert('ไม่มีสิทธิ์ในการเพิ่มอาจารย์ - ต้องเป็น Staff เท่านั้น');
      return;
    }
    
    navigate('/application/add-user', { 
      state: { 
        from: '/name-register/department-name',
        userType: 'teacher'
      } 
    });
  }, [navigate, permissions.canAddTeachers, setSecurityAlert]);

  const handleGoBack = useCallback(() => {
    navigate('/name-register/department-name');
  }, [navigate]);

  return {
    handleViewDepartment,
    handleExportToExcel,
    handleViewTeachers,
    handleViewStudents,
    handleRefreshDepartment,
    handleShowDepartmentInfo,
    handleBulkExport,
    handleAddUser,
    handleAddStudent,
    handleAddTeacher,
    handleGoBack,
    permissions
  };
};