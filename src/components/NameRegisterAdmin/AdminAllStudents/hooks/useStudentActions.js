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

  return {
    handleViewStudent,
    handleEditStudent,
    handleToggleStatus,
    handleExportToExcel,
    handleAddStudent,
    permissions
  };
};