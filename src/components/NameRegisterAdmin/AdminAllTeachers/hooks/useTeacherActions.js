import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { exportFilteredTeachersToExcel } from '../utils/excelExportUtils';
import { useUserPermissions } from './useUserPermissions';
import {
  logTeacherView,
  logTeacherEdit,
  logTeacherStatusConfirm,
  logTeacherExport,
  logTeacherSearch,
  logTeacherFilter,
  logBulkOperation,
  logSystemAction,
  logTeacherViewTimestamp,
  logTeacherEditTimestamp,
  logTeacherStatusChangeTimestamp,
  logTeacherExportTimestamp,
  logTeacherSearchTimestamp,
  logTeacherFilterTimestamp
} from './../../../../utils/systemLog';

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

  const handleViewTeacher = useCallback(async (teacher) => {
    if (!permissions.canViewTeacherDetails) {
      setSecurityAlert('ไม่มีสิทธิ์ในการดูรายละเอียดอาจารย์');
      return;
    }

    if (!teacher?.id || !validateId(teacher.id)) {
      console.error('Invalid teacher ID:', teacher?.id);
      setSecurityAlert('ตรวจพบการพยายามเข้าถึงข้อมูลไม่ถูกต้อง');
      return;
    }

    const teacherName = `${teacher.firstName} ${teacher.lastName}`;

    try {
      await Promise.all([
        logTeacherView(teacher.id, teacherName, teacher.code),
        logTeacherViewTimestamp(teacherName, teacher.code)
      ]);
    } catch (error) {
      console.warn('Failed to log view action:', error);
    }

    openTeacherModal(teacher.id);
  }, [permissions.canViewTeacherDetails, validateId, setSecurityAlert, openTeacherModal]);

  const handleEditTeacher = useCallback(async (teacher) => {
    if (!permissions.canEditTeachers) {
      setSecurityAlert('ไม่มีสิทธิ์ในการแก้ไขข้อมูลอาจารย์');
      return;
    }

    if (!teacher?.id || !validateId(teacher.id)) {
      console.error('Invalid teacher ID for edit:', teacher?.id);
      setSecurityAlert('ตรวจพบการพยายามเข้าถึงข้อมูลไม่ถูกต้อง');
      return;
    }

    const teacherName = `${teacher.firstName} ${teacher.lastName}`;

    try {
      await Promise.all([
        logTeacherEdit(teacher.id, teacherName, teacher.code),
        logTeacherEditTimestamp(teacherName, teacher.code)
      ]);
    } catch (error) {
      console.warn('Failed to log edit initiation:', error);
    }

    navigate(`/name-register/teacher-detail/${teacher.id}?tab=profile&edit=true`);
  }, [navigate, permissions.canEditTeachers, validateId, setSecurityAlert]);

  const handleToggleStatus = useCallback(async (teacher) => {
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
    const teacherName = `${firstName} ${lastName}`;
    const confirmMessage = `คุณต้องการ${action}การใช้งานของ ${teacherName} หรือไม่?`;

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
            const result = await toggleTeacherStatus(teacher);

            if (result.success) {
              await Promise.all([
                logTeacherStatusConfirm(teacher.id, teacherName, teacher.code, action),
                logTeacherStatusChangeTimestamp(teacherName, teacher.code, action)
              ]);

              await fetchTeachers();
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
  }, [permissions.canToggleTeacherStatus, validateId, sanitizeInput, setSecurityAlert, showModal, closeModal, toggleTeacherStatus, fetchTeachers]);

  const handleExportToExcel = useCallback(async (teachers, filterInfo) => {
    if (!permissions.canExportData) {
      setSecurityAlert('ไม่มีสิทธิ์ในการส่งออกข้อมูล');
      return;
    }

    try {
      await Promise.all([
        logTeacherExport(teachers.length, filterInfo),
        logTeacherExportTimestamp(teachers.length, filterInfo)
      ]);

      return exportFilteredTeachersToExcel(teachers, filterInfo);
    } catch (error) {
      console.warn('Failed to log export action:', error);
      return exportFilteredTeachersToExcel(teachers, filterInfo);
    }
  }, [permissions.canExportData, setSecurityAlert]);

  const handleAddTeacher = useCallback(async () => {
    if (!permissions.canAddTeachers) {
      setSecurityAlert('ไม่มีสิทธิ์ในการเพิ่มอาจารย์ - ต้องเป็น Staff เท่านั้น');
      return;
    }

    try {
      await logSystemAction(0, 'เริ่มกระบวนการเพิ่มอาจารย์ใหม่', 'Teacher');
    } catch (error) {
      console.warn('Failed to log add teacher initiation:', error);
    }

    navigate('/application/add-user', {
      state: { from: '/name-register/teacher-name' }
    });
  }, [navigate, permissions.canAddTeachers, setSecurityAlert]);

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
      } else if (referrer && referrer.includes('/name-register/student-name')) {
        navigate('/name-register/student-name');
      } else if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate('/name-register/department-name');
      }
    }
  }, [navigate]);

  const handleShowTeacherSummary = useCallback(async (teachers, filterInfo) => {
    if (!teachers || teachers.length === 0) {
      showModal('ไม่มีข้อมูลอาจารย์', [
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
        `ดูสรุปข้อมูลอาจารย์: ${teachers.length} คน ${filterInfo?.department ? `สาขา: ${filterInfo.department}` : ''}`,
        'Teacher'
      );
    } catch (error) {
      console.warn('Failed to log summary view:', error);
    }

    const totalTeachers = teachers.length;
    const activeTeachers = teachers.filter(t => t.isActive).length;
    const inactiveTeachers = totalTeachers - activeTeachers;
    const deanCount = teachers.filter(t => t.isDean).length;
    const resignedCount = teachers.filter(t => t.isResigned).length;
    const workingTeachers = totalTeachers - resignedCount;

    const summaryMessage = `
สรุปข้อมูลอาจารย์:

จำนวนทั้งหมด: ${totalTeachers} คน
- กำลังใช้งาน: ${activeTeachers} คน
- ระงับการใช้งาน: ${inactiveTeachers} คน

สถานะการทำงาน:
- กำลังทำงาน: ${workingTeachers} คน
- ลาออกแล้ว: ${resignedCount} คน

ตำแหน่งพิเศษ:
- คณบดี: ${deanCount} คน

${filterInfo?.department ? `สาขา: ${filterInfo.department}` : ''}
${filterInfo?.faculty ? `คณะ: ${filterInfo.faculty}` : ''}
    `;

    showModal(summaryMessage, [
      {
        label: 'ส่งออกข้อมูล',
        onClick: () => {
          closeModal();
          handleExportToExcel(teachers, filterInfo);
        },
      },
      {
        label: 'ปิด',
        onClick: closeModal,
      }
    ]);
  }, [showModal, closeModal, handleExportToExcel]);

  const handleRefreshTeachers = useCallback(async () => {
    try {
      await logSystemAction(0, 'รีเฟรชข้อมูลอาจารย์ทั้งหมด', 'Teacher');

      await fetchTeachers();
    } catch (error) {
      console.warn('Failed to refresh teacher data:', error);
      setSecurityAlert('ไม่สามารถรีเฟรชข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
    }
  }, [fetchTeachers, setSecurityAlert]);

  const handleBulkExport = useCallback(async (teachers, filterInfo, options = {}) => {
    if (!permissions.canExportData) {
      setSecurityAlert('ไม่มีสิทธิ์ในการส่งออกข้อมูล');
      return;
    }

    if (!teachers || teachers.length === 0) {
      showModal('ไม่มีข้อมูลสำหรับการส่งออก', [
        {
          label: 'ตกลง',
          onClick: closeModal,
        }
      ]);
      return;
    }

    const confirmMessage = `
คุณต้องการส่งออกข้อมูลอาจารย์ทั้งหมด ${teachers.length} คน เป็นไฟล์ Excel หรือไม่?

ข้อมูลที่จะส่งออก:
- ข้อมูลส่วนตัวอาจารย์
- ข้อมูลการทำงาน
- สถานะการใช้งาน
- ตำแหน่งพิเศษ
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
        onClick: async () => {
          closeModal();

          try {
            await Promise.all([
              logBulkOperation(
                'ส่งออกข้อมูลอาจารย์แบบ Bulk',
                teachers.length,
                `ตัวกรอง: ${JSON.stringify(filterInfo || {})} | Options: ${JSON.stringify(options)}`,
                'Teacher'
              ),
              logTeacherExportTimestamp(teachers.length, filterInfo)
            ]);

            const success = exportFilteredTeachersToExcel(teachers, filterInfo, options);
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
            const success = exportFilteredTeachersToExcel(teachers, filterInfo, options);
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
        logTeacherSearch(searchCriteria),
        logTeacherSearchTimestamp(searchCriteria)
      ]);
    } catch (error) {
      console.warn('Failed to log search action:', error);
    }
  }, []);

  const handleFilter = useCallback(async (filterCriteria) => {
    try {
      await Promise.all([
        logTeacherFilter(filterCriteria),
        logTeacherFilterTimestamp(filterCriteria)
      ]);
    } catch (error) {
      console.warn('Failed to log filter action:', error);
    }
  }, []);

  return {
    handleViewTeacher,
    handleEditTeacher,
    handleToggleStatus,
    handleExportToExcel,
    handleAddTeacher,
    handleGoBack,
    handleSmartBack,
    handleShowTeacherSummary,
    handleRefreshTeachers,
    handleBulkExport,
    handleSearch,
    handleFilter,
    permissions
  };
};