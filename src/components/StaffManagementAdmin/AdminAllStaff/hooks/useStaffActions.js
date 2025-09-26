import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { exportFilteredStaffToExcel } from '../utils/excelExportUtils';
import { useUserPermissions } from './useUserPermissions';

export const useStaffActions = ({ 
  validateId, 
  sanitizeInput, 
  setSecurityAlert, 
  showModal, 
  closeModal, 
  openStaffModal,
  toggleStaffStatus,
  fetchStaff 
}) => {
  const navigate = useNavigate();
  const permissions = useUserPermissions();

  const handleViewStaff = useCallback((staff) => {
    if (!permissions.canViewStaff) {
      setSecurityAlert('ไม่มีสิทธิ์ในการดูรายละเอียดเจ้าหน้าที่');
      return;
    }

    if (!staff?.id || !validateId(staff.id)) {
      console.error('Invalid staff ID:', staff?.id);
      setSecurityAlert('ตรวจพบการพยายามเข้าถึงข้อมูลไม่ถูกต้อง');
      return;
    }
    openStaffModal(staff.id);
  }, [permissions.canViewStaff, validateId, setSecurityAlert, openStaffModal]);

  const handleEditStaff = useCallback((staff) => {
    if (!permissions.canEditStaff) {
      setSecurityAlert('ไม่มีสิทธิ์ในการแก้ไขข้อมูลเจ้าหน้าที่');
      return;
    }

    if (!staff?.id || !validateId(staff.id)) {
      console.error('Invalid staff ID for edit:', staff?.id);
      setSecurityAlert('ตรวจพบการพยายามเข้าถึงข้อมูลไม่ถูกต้อง');
      return;
    }
    navigate(`/staff-management/staff-detail/${staff.id}?tab=profile&edit=true`);
  }, [navigate, permissions.canEditStaff, validateId, setSecurityAlert]);

  const handleToggleStatus = useCallback((staff) => {
    if (!permissions.canToggleStaffStatus) {
      setSecurityAlert('ไม่มีสิทธิ์ในการเปลี่ยนสถานะเจ้าหน้าที่ - ต้องเป็น Staff เท่านั้น');
      return;
    }

    if (!staff?.id || !validateId(staff.id)) {
      console.error('Invalid staff ID for status toggle:', staff?.id);
      setSecurityAlert('ตรวจพบการพยายามเข้าถึงข้อมูลไม่ถูกต้อง');
      return;
    }

    const action = staff.isActive ? 'ระงับ' : 'เปิด';
    const firstName = sanitizeInput(staff.firstName || '');
    const lastName = sanitizeInput(staff.lastName || '');
    const confirmMessage = `คุณต้องการ${action}การใช้งานของ ${firstName} ${lastName} หรือไม่?`;
    
    // เพิ่ม timeout เล็กน้อยเพื่อป้องกัน race condition
    setTimeout(() => {
      showModal(confirmMessage, [
        {
          label: 'ยกเลิก',
          onClick: closeModal,
        },
        {
          label: 'ยืนยัน',
          onClick: async () => {
            closeModal();
            const result = await toggleStaffStatus(staff);
            if (result.success) {
              await fetchStaff();
              // เพิ่ม timeout เพื่อให้ modal ปิดสมบูรณ์ก่อน
              setTimeout(() => {
                showModal(result.message);
              }, 100);
            } else {
              setTimeout(() => {
                showModal(result.error);
              }, 100);
            }
          },
        }
      ]);
    }, 50);
  }, [permissions.canToggleStaffStatus, validateId, sanitizeInput, setSecurityAlert, showModal, closeModal, toggleStaffStatus, fetchStaff]);

  const handleExportToExcel = useCallback((staff, filterInfo) => {
    if (!permissions.canExportData) {
      setSecurityAlert('ไม่มีสิทธิ์ในการส่งออกข้อมูล');
      return;
    }
    return exportFilteredStaffToExcel(staff, filterInfo);
  }, [permissions.canExportData, setSecurityAlert]);

  const handleAddStaff = useCallback(() => {
    if (!permissions.canAddStaff) {
      setSecurityAlert('ไม่มีสิทธิ์ในการเพิ่มเจ้าหน้าที่ - ต้องเป็น Staff เท่านั้น');
      return;
    }
    
    navigate('/staff-management/add-staff', { 
      state: { from: '/staff-management/staff-name', userType: 'staff' } 
    });
  }, [navigate, permissions.canAddStaff, setSecurityAlert]);

  const handleGoBack = useCallback(() => {
    navigate('/staff-management');
  }, [navigate]);

  return {
    handleViewStaff,
    handleEditStaff,
    handleToggleStatus,
    handleExportToExcel,
    handleAddStaff,
    handleGoBack,
    permissions
  };
};