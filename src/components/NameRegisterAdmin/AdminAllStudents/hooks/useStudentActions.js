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

  // Handle view student - แก้ไขส่วนนี้
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
    
    // เปลี่ยนจากส่ง student object เป็นส่ง student.id
    openStudentModal(student.id);
  }, [permissions.canViewStudentDetails, validateId, setSecurityAlert, openStudentModal]);

  // Handle edit student
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

  // Handle toggle status with confirmation
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
        className: 'cancelButton'
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
        className: 'confirmButton'
      }
    ]);
  }, [permissions.canToggleStudentStatus, validateId, sanitizeInput, setSecurityAlert, showModal, closeModal, toggleStudentStatus, fetchStudents]);

  // Handle export to Excel
  const handleExportToExcel = useCallback((students, filterInfo) => {
    if (!permissions.canExportData) {
      setSecurityAlert('ไม่มีสิทธิ์ในการส่งออกข้อมูล');
      return;
    }
    return exportFilteredStudentsToExcel(students, filterInfo);
  }, [permissions.canExportData, setSecurityAlert]);

  // Handle add student
  const handleAddStudent = useCallback(() => {
    if (!permissions.canAddStudents) {
      setSecurityAlert('ไม่มีสิทธิ์ในการเพิ่มนักศึกษา - ต้องเป็น Staff เท่านั้น');
      return;
    }
    navigate('/admin/students/add');
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