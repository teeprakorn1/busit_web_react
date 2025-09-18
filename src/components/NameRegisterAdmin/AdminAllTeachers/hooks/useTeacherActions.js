import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { exportFilteredTeachersToExcel } from '../utils/excelExportUtils';
import { useUserPermissions } from './useUserPermissions';

export const useTeacherActions = ({ 
  validateId, 
  sanitizeInput, 
  setSecurityAlert, 
  showModal, 
  closeModal, 
  openTeacherModal,
  toggleTeacherStatus,
  fetchTeachers 
}) => {
  const navigate = useNavigate();
  const permissions = useUserPermissions();

  const handleViewTeacher = useCallback((teacher) => {
    if (!permissions.canViewTeacherDetails) {
      setSecurityAlert('ไม่มีสิทธิ์ในการดูรายละเอียดอาจารย์');
      return;
    }

    if (!teacher?.id || !validateId(teacher.id)) {
      console.error('Invalid teacher ID:', teacher?.id);
      setSecurityAlert('ตรวจพบการพยายามเข้าถึงข้อมูลไม่ถูกต้อง');
      return;
    }
    openTeacherModal(teacher.id);
  }, [permissions.canViewTeacherDetails, validateId, setSecurityAlert, openTeacherModal]);

  const handleEditTeacher = useCallback((teacher) => {
    if (!permissions.canEditTeachers) {
      setSecurityAlert('ไม่มีสิทธิ์ในการแก้ไขข้อมูลอาจารย์');
      return;
    }

    if (!teacher?.id || !validateId(teacher.id)) {
      console.error('Invalid teacher ID for edit:', teacher?.id);
      setSecurityAlert('ตรวจพบการพยายามเข้าถึงข้อมูลไม่ถูกต้อง');
      return;
    }
    navigate(`/name-register/teacher-detail/${teacher.id}?tab=profile&edit=true`);
  }, [navigate, permissions.canEditTeachers, validateId, setSecurityAlert]);

  const handleToggleStatus = useCallback((teacher) => {
    if (!permissions.canToggleTeacherStatus) {
      setSecurityAlert('ไม่มีสิทธิ์ในการเปลี่ยนสถานะอาจารย์ - ต้องเป็น Staff เท่านั้น');
      return;
    }

    if (!teacher?.id || !validateId(teacher.id)) {
      console.error('Invalid teacher ID for status toggle:', teacher?.id);
      setSecurityAlert('ตรวจพบการพยายามเข้าถึงข้อมูลไม่ถูกต้อง');
      return;
    }

    const action = teacher.isActive ? 'ระงับ' : 'เปิด';
    const firstName = sanitizeInput(teacher.firstName || '');
    const lastName = sanitizeInput(teacher.lastName || '');
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
          const result = await toggleTeacherStatus(teacher);
          if (result.success) {
            await fetchTeachers();
            showModal(result.message);
          } else {
            showModal(result.error);
          }
        },
      }
    ]);
  }, [permissions.canToggleTeacherStatus, validateId, sanitizeInput, setSecurityAlert, showModal, closeModal, toggleTeacherStatus, fetchTeachers]);

  const handleExportToExcel = useCallback((teachers, filterInfo) => {
    if (!permissions.canExportData) {
      setSecurityAlert('ไม่มีสิทธิ์ในการส่งออกข้อมูล');
      return;
    }
    return exportFilteredTeachersToExcel(teachers, filterInfo);
  }, [permissions.canExportData, setSecurityAlert]);

  const handleAddTeacher = useCallback(() => {
    if (!permissions.canAddTeachers) {
      setSecurityAlert('ไม่มีสิทธิ์ในการเพิ่มอาจารย์ - ต้องเป็น Staff เท่านั้น');
      return;
    }
    
    navigate('/application/add-user', { 
      state: { from: '/name-register/teacher-name' } 
    });
  }, [navigate, permissions.canAddTeachers, setSecurityAlert]);
  const handleGoBack = useCallback(() => {
    navigate('/name-register/department-name');
  }, [navigate]);

  return {
    handleViewTeacher,
    handleEditTeacher,
    handleToggleStatus,
    handleExportToExcel,
    handleAddTeacher,
    handleGoBack,
    permissions
  };
};