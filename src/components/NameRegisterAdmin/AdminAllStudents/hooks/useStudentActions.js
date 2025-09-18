import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { exportFilteredStudentsToExcel } from '../utils/excelExportUtils';
import { useUserPermissions } from './useUserPermissions';

export const useStudentActions = ({ 
  validateId, 
  sanitizeInput, 
  setSecurityAlert, 
  showModal, 
  closeModal, 
  openStudentModal,
  toggleStudentStatus,
  fetchStudents 
}) => {
  const navigate = useNavigate();
  const permissions = useUserPermissions();

  const handleViewStudent = useCallback((student) => {
    if (!permissions.canViewStudentDetails) {
      setSecurityAlert('ไม่มีสิทธิ์ในการดูรายละเอียดนักศึกษา');
      return;
    }

    if (!student?.id || !validateId(student.id)) {
      console.error('Invalid student ID:', student?.id);
      setSecurityAlert('ตรวจพบการพยายามเข้าถึงข้อมูลไม่ถูกต้อง');
      return;
    }
    openStudentModal(student.id);
  }, [permissions.canViewStudentDetails, validateId, setSecurityAlert, openStudentModal]);

  const handleEditStudent = useCallback((student) => {
    if (!permissions.canEditStudents) {
      setSecurityAlert('ไม่มีสิทธิ์ในการแก้ไขข้อมูลนักศึกษา');
      return;
    }

    if (!student?.id || !validateId(student.id)) {
      console.error('Invalid student ID for edit:', student?.id);
      setSecurityAlert('ตรวจพบการพยายามเข้าถึงข้อมูลไม่ถูกต้อง');
      return;
    }
    navigate(`/name-register/student-detail/${student.id}?tab=profile&edit=true`);
  }, [navigate, permissions.canEditStudents, validateId, setSecurityAlert]);

  const handleToggleStatus = useCallback((student) => {
    if (!permissions.canToggleStudentStatus) {
      setSecurityAlert('ไม่มีสิทธิ์ในการเปลี่ยนสถานะนักศึกษา - ต้องเป็น Staff เท่านั้น');
      return;
    }

    if (!student?.id || !validateId(student.id)) {
      console.error('Invalid student ID for status toggle:', student?.id);
      setSecurityAlert('ตรวจพบการพยายามเข้าถึงข้อมูลไม่ถูกต้อง');
      return;
    }

    const action = student.isActive ? 'ระงับ' : 'เปิด';
    const firstName = sanitizeInput(student.firstName || '');
    const lastName = sanitizeInput(student.lastName || '');
    const confirmMessage = `คุณต้องการ${action}การใช้งานของ ${firstName} ${lastName} หรือไม่?`;
    
    showModal(confirmMessage, [
      {
        label: 'ยกเลิก',
        onClick: closeModal,
      },
      {
        label: 'ยืนยัน',
        onClick: async () => {
          closeModal();
          const result = await toggleStudentStatus(student);
          if (result.success) {
            await fetchStudents();
            showModal(result.message);
          } else {
            showModal(result.error);
          }
        },
      }
    ]);
  }, [permissions.canToggleStudentStatus, validateId, sanitizeInput, setSecurityAlert, showModal, closeModal, toggleStudentStatus, fetchStudents]);

  const handleExportToExcel = useCallback((students, filterInfo) => {
    if (!permissions.canExportData) {
      setSecurityAlert('ไม่มีสิทธิ์ในการส่งออกข้อมูล');
      return;
    }
    return exportFilteredStudentsToExcel(students, filterInfo);
  }, [permissions.canExportData, setSecurityAlert]);

  const handleAddStudent = useCallback(() => {
    if (!permissions.canAddStudents) {
      setSecurityAlert('ไม่มีสิทธิ์ในการเพิ่มนักศึกษา - ต้องเป็น Staff เท่านั้น');
      return;
    }
    
    navigate('/application/add-user', { 
      state: { from: '/name-register/student-name' } 
    });
  }, [navigate, permissions.canAddStudents, setSecurityAlert]);

  const handleGoBack = useCallback(() => {
    navigate('/name-register/department-name');
  }, [navigate]);

  const handleSmartBack = useCallback((searchParams, currentPath) => {
    const departmentId = searchParams?.get('departmentId');
    const fromParam = searchParams?.get('from');
    
    if (departmentId) {
      navigate('/name-register/department-name');
    } else if (fromParam) {
      navigate(fromParam);
    } else {
      const referrer = document.referrer;
      if (referrer && referrer.includes('/name-register/department-name')) {
        navigate('/name-register/department-name');
      } else if (referrer && referrer.includes('/name-register/teacher-name')) {
        navigate('/name-register/teacher-name');
      } else if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate('/name-register/department-name');
      }
    }
  }, [navigate]);

  const handleShowStudentSummary = useCallback((students, filterInfo) => {
    if (!students || students.length === 0) {
      showModal('ไม่มีข้อมูลนักศึกษา', [
        {
          label: 'ตกลง',
          onClick: closeModal,
        }
      ]);
      return;
    }

    const totalStudents = students.length;
    const activeStudents = students.filter(s => s.isActive).length;
    const inactiveStudents = totalStudents - activeStudents;
    const graduatedStudents = students.filter(s => s.isGraduated).length;
    const studyingStudents = totalStudents - graduatedStudents;

    const summaryMessage = `
สรุปข้อมูลนักศึกษา:

จำนวนทั้งหมด: ${totalStudents} คน
- กำลังใช้งาน: ${activeStudents} คน
- ระงับการใช้งาน: ${inactiveStudents} คน

สถานะการศึกษา:
- กำลังศึกษา: ${studyingStudents} คน
- จบการศึกษา: ${graduatedStudents} คน

${filterInfo?.department ? `สาขา: ${filterInfo.department}` : ''}
${filterInfo?.faculty ? `คณะ: ${filterInfo.faculty}` : ''}
${filterInfo?.academicYear ? `ปีการศึกษา: ${filterInfo.academicYear}` : ''}
    `;

    showModal(summaryMessage, [
      {
        label: 'ส่งออกข้อมูล',
        onClick: () => {
          closeModal();
          handleExportToExcel(students, filterInfo);
        },
      },
      {
        label: 'ปิด',
        onClick: closeModal,
      }
    ]);
  }, [showModal, closeModal, handleExportToExcel]);

  const handleRefreshStudents = useCallback(async () => {
    try {
      await fetchStudents();
    } catch (error) {
      console.warn('Failed to refresh student data:', error);
      setSecurityAlert('ไม่สามารถรีเฟรชข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
    }
  }, [fetchStudents, setSecurityAlert]);

  const handleBulkExport = useCallback((students, filterInfo, options = {}) => {
    if (!permissions.canExportData) {
      setSecurityAlert('ไม่มีสิทธิ์ในการส่งออกข้อมูล');
      return;
    }

    if (!students || students.length === 0) {
      showModal('ไม่มีข้อมูลสำหรับการส่งออก', [
        {
          label: 'ตกลง',
          onClick: closeModal,
        }
      ]);
      return;
    }

    const confirmMessage = `
คุณต้องการส่งออกข้อมูลนักศึกษาทั้งหมด ${students.length} คน เป็นไฟล์ Excel หรือไม่?

ข้อมูลที่จะส่งออก:
- ข้อมูลส่วนตัวนักศึกษา
- ข้อมูลการศึกษา
- สถานะการใช้งาน
- สรุปตามสาขาและคณะ

${filterInfo?.department ? `สาขา: ${filterInfo.department}` : ''}
${filterInfo?.faculty ? `คณะ: ${filterInfo.faculty}` : ''}
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
          const success = exportFilteredStudentsToExcel(students, filterInfo, options);
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

  return {
    handleViewStudent,
    handleEditStudent,
    handleToggleStatus,
    handleExportToExcel,
    handleAddStudent,
    handleGoBack,
    handleSmartBack,
    handleShowStudentSummary,
    handleRefreshStudents,
    handleBulkExport,
    permissions
  };
};