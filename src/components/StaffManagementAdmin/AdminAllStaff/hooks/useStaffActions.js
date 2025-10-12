import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { exportFilteredStaffToExcel } from '../utils/excelExportUtils';
import { useUserPermissions } from './useUserPermissions';
import {
  logStaffView,
  logStaffEdit,
  logStaffStatusConfirm,
  logStaffExport,
  logStaffSearch,
  logStaffFilter,
  logBulkOperation,
  logSystemAction,
  logStaffViewTimestamp,
  logStaffEditTimestamp,
  logStaffStatusChangeTimestamp,
  logStaffExportTimestamp,
  logStaffSearchTimestamp,
  logStaffFilterTimestamp
} from './../../../../utils/systemLog';

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

  const handleViewStaff = useCallback(async (staff) => {
    if (!permissions.canViewStaff) {
      setSecurityAlert('ไม่มีสิทธิ์ในการดูรายละเอียดเจ้าหน้าที่');
      return;
    }

    if (!staff?.id || !validateId(staff.id)) {
      console.error('Invalid staff ID:', staff?.id);
      setSecurityAlert('ตรวจพบการพยายามเข้าถึงข้อมูลไม่ถูกต้อง');
      return;
    }

    const staffName = `${staff.firstName} ${staff.lastName}`;
    try {
      await Promise.all([
        logStaffView(staff.id, staffName, staff.code),
        logStaffViewTimestamp(staffName, staff.code)
      ]);
    } catch (error) {
      console.warn('Failed to log view action:', error);
    }

    openStaffModal(staff.id);
  }, [permissions.canViewStaff, validateId, setSecurityAlert, openStaffModal]);

  const handleEditStaff = useCallback(async (staff) => {
    if (!permissions.canEditStaff) {
      setSecurityAlert('ไม่มีสิทธิ์ในการแก้ไขข้อมูลเจ้าหน้าที่');
      return;
    }

    if (!staff?.id || !validateId(staff.id)) {
      console.error('Invalid staff ID for edit:', staff?.id);
      setSecurityAlert('ตรวจพบการพยายามเข้าถึงข้อมูลไม่ถูกต้อง');
      return;
    }

    const staffName = `${staff.firstName} ${staff.lastName}`;
    try {
      await Promise.all([
        logStaffEdit(staff.id, staffName, staff.code),
        logStaffEditTimestamp(staffName, staff.code)
      ]);
    } catch (error) {
      console.warn('Failed to log edit initiation:', error);
    }

    navigate(`/staff-management/staff-detail/${staff.id}?tab=profile&edit=true`);
  }, [navigate, permissions.canEditStaff, validateId, setSecurityAlert]);

  const handleToggleStatus = useCallback(async (staff) => {
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
    const staffName = `${firstName} ${lastName}`;
    const confirmMessage = `คุณต้องการ${action}การใช้งานของ ${staffName} หรือไม่?`;

    showModal(confirmMessage, [
      {
        label: 'ยกเลิก',
        onClick: closeModal,
      },
      {
        label: 'ยืนยัน',
        onClick: async () => {
          closeModal();

          try {
            const result = await toggleStaffStatus(staff);

            if (result.success) {
              await Promise.all([
                logStaffStatusConfirm(staff.id, staffName, staff.code, action),
                logStaffStatusChangeTimestamp(staffName, staff.code, action)
              ]);

              await fetchStaff();
              showModal(result.message);
            } else {
              showModal(result.error);
            }
          } catch (error) {
            console.error('Toggle status error:', error);
            showModal('เกิดข้อผิดพลาดที่ไม่คาดคิด');
          }
        },
      }
    ]);
  }, [permissions.canToggleStaffStatus, validateId, sanitizeInput, setSecurityAlert, showModal, closeModal, toggleStaffStatus, fetchStaff]);

  const handleExportToExcel = useCallback(async (staff, filterInfo) => {
    if (!permissions.canExportData) {
      setSecurityAlert('ไม่มีสิทธิ์ในการส่งออกข้อมูล');
      return;
    }

    try {
      await Promise.all([
        logStaffExport(staff.length, filterInfo),
        logStaffExportTimestamp(staff.length, filterInfo)
      ]);

      return exportFilteredStaffToExcel(staff, filterInfo);
    } catch (error) {
      console.warn('Failed to log export action:', error);
      return exportFilteredStaffToExcel(staff, filterInfo);
    }
  }, [permissions.canExportData, setSecurityAlert]);

  const handleAddStaff = useCallback(async () => {
    if (!permissions.canAddStaff) {
      setSecurityAlert('ไม่มีสิทธิ์ในการเพิ่มเจ้าหน้าที่ - ต้องเป็น Staff เท่านั้น');
      return;
    }

    try {
      await logSystemAction(0, 'เริ่มกระบวนการเพิ่มเจ้าหน้าที่ใหม่', 'Staff');
    } catch (error) {
      console.warn('Failed to log add staff initiation:', error);
    }

    navigate('/staff-management/add-staff', {
      state: { from: '/staff-management/staff-name', userType: 'staff' }
    });
  }, [navigate, permissions.canAddStaff, setSecurityAlert]);

  const handleGoBack = useCallback(() => {
    navigate('/staff-management');
  }, [navigate]);

  const handleSmartBack = useCallback((searchParams, currentPath) => {
    const fromParam = searchParams?.get('from');

    if (fromParam) {
      navigate(fromParam);
    } else {
      const referrer = document.referrer;
      if (referrer && referrer.includes('/staff-management')) {
        navigate('/staff-management');
      } else if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate('/staff-management');
      }
    }
  }, [navigate]);

  const handleShowStaffSummary = useCallback(async (staff, filterInfo) => {
    if (!staff || staff.length === 0) {
      showModal('ไม่มีข้อมูลเจ้าหน้าที่', [
        {
          label: 'ตกลง',
          onClick: closeModal,
        }
      ]);
      return;
    }

    try {
      await logSystemAction(
        0,
        `ดูสรุปข้อมูลเจ้าหน้าที่: ${staff.length} คน`,
        'Staff'
      );
    } catch (error) {
      console.warn('Failed to log summary view:', error);
    }

    const totalStaff = staff.length;
    const activeStaff = staff.filter(s => s.isActive).length;
    const inactiveStaff = totalStaff - activeStaff;
    const resignedCount = staff.filter(s => s.isResigned).length;
    const workingStaff = totalStaff - resignedCount;

    const summaryMessage = `
สรุปข้อมูลเจ้าหน้าที่:

จำนวนทั้งหมด: ${totalStaff} คน
- กำลังใช้งาน: ${activeStaff} คน
- ระงับการใช้งาน: ${inactiveStaff} คน

สถานะการทำงาน:
- กำลังทำงาน: ${workingStaff} คน
- ลาออกแล้ว: ${resignedCount} คน
    `;

    showModal(summaryMessage, [
      {
        label: 'ส่งออกข้อมูล',
        onClick: () => {
          closeModal();
          handleExportToExcel(staff, filterInfo);
        },
      },
      {
        label: 'ปิด',
        onClick: closeModal,
      }
    ]);
  }, [showModal, closeModal, handleExportToExcel]);

  const handleRefreshStaff = useCallback(async () => {
    try {
      await logSystemAction(0, 'รีเฟรชข้อมูลเจ้าหน้าที่ทั้งหมด', 'Staff');

      await fetchStaff();
    } catch (error) {
      console.warn('Failed to refresh staff data:', error);
      setSecurityAlert('ไม่สามารถรีเฟรชข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
    }
  }, [fetchStaff, setSecurityAlert]);

  const handleBulkExport = useCallback(async (staff, filterInfo, options = {}) => {
    if (!permissions.canExportData) {
      setSecurityAlert('ไม่มีสิทธิ์ในการส่งออกข้อมูล');
      return;
    }

    if (!staff || staff.length === 0) {
      showModal('ไม่มีข้อมูลสำหรับการส่งออก', [
        {
          label: 'ตกลง',
          onClick: closeModal,
        }
      ]);
      return;
    }

    const confirmMessage = `
คุณต้องการส่งออกข้อมูลเจ้าหน้าที่ทั้งหมด ${staff.length} คน เป็นไฟล์ Excel หรือไม่?

ข้อมูลที่จะส่งออก:
- ข้อมูลส่วนตัวเจ้าหน้าที่
- ข้อมูลการทำงาน
- สถานะการใช้งาน
- สรุปการทำงาน
    `;

    showModal(confirmMessage, [
      {
        label: 'ยกเลิก',
        onClick: closeModal,
      },
      {
        label: 'ส่งออกข้อมูล',
        onClick: async () => {
          closeModal();

          try {
            await Promise.all([
              logBulkOperation(
                'ส่งออกข้อมูลเจ้าหน้าที่แบบ Bulk',
                staff.length,
                `ตัวกรอง: ${JSON.stringify(filterInfo || {})} | Options: ${JSON.stringify(options)}`,
                'Staff'
              ),
              logStaffExportTimestamp(staff.length, filterInfo)
            ]);

            const success = exportFilteredStaffToExcel(staff, filterInfo, options);
            if (success) {
              showModal('ส่งออกข้อมูลเรียบร้อยแล้ว', [
                {
                  label: 'ตกลง',
                  onClick: closeModal,
                }
              ]);
            }
          } catch (error) {
            console.warn('Failed to log bulk export:', error);
            const success = exportFilteredStaffToExcel(staff, filterInfo, options);
            if (success) {
              showModal('ส่งออกข้อมูลเรียบร้อยแล้ว', [
                {
                  label: 'ตกลง',
                  onClick: closeModal,
                }
              ]);
            }
          }
        },
      }
    ]);
  }, [permissions.canExportData, setSecurityAlert, showModal, closeModal]);

  const handleSearch = useCallback(async (searchCriteria) => {
    try {
      await Promise.all([
        logStaffSearch(searchCriteria),
        logStaffSearchTimestamp(searchCriteria)
      ]);
    } catch (error) {
      console.warn('Failed to log search action:', error);
    }
  }, []);

  const handleFilter = useCallback(async (filterCriteria) => {
    try {
      await Promise.all([
        logStaffFilter(filterCriteria),
        logStaffFilterTimestamp(filterCriteria)
      ]);
    } catch (error) {
      console.warn('Failed to log filter action:', error);
    }
  }, []);

  return {
    handleViewStaff,
    handleEditStaff,
    handleToggleStatus,
    handleExportToExcel,
    handleAddStaff,
    handleGoBack,
    handleSmartBack,
    handleShowStaffSummary,
    handleRefreshStaff,
    handleBulkExport,
    handleSearch,
    handleFilter,
    permissions
  };
};