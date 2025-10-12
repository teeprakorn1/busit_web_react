import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { exportFilteredStudentsToExcel } from '../utils/excelExportUtils';
import { useUserPermissions } from './useUserPermissions';
import {
  logStudentView,
  logStudentEdit,
  logStudentStatusConfirm,
  logStudentExport,
  logStudentSearch,
  logStudentFilter,
  logBulkOperation,
  logSystemAction,
  logStudentViewTimestamp,
  logStudentEditTimestamp,
  logStudentStatusChangeTimestamp,
  logStudentExportTimestamp,
  logStudentSearchTimestamp,
  logStudentFilterTimestamp
} from './../../../../utils/systemLog';

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

  const handleViewStudent = useCallback(async (student) => {
    if (!permissions.canViewStudentDetails) {
      setSecurityAlert('ไม่มีสิทธิ์ในการดูรายละเอียดนักศึกษา');
      return;
    }

    if (!student?.id || !validateId(student.id)) {
      console.error('Invalid student ID:', student?.id);
      setSecurityAlert('ตรวจพบการพยายามเข้าถึงข้อมูลไม่ถูกต้อง');
      return;
    }

    const studentName = `${student.firstName} ${student.lastName}`;
    try {
      await Promise.all([
        logStudentView(student.id, studentName, student.code),
        logStudentViewTimestamp(studentName, student.code)
      ]);
    } catch (error) {
      console.warn('Failed to log view action:', error);
    }

    openStudentModal(student.id);
  }, [permissions.canViewStudentDetails, validateId, setSecurityAlert, openStudentModal]);

  const handleEditStudent = useCallback(async (student) => {
    if (!permissions.canEditStudents) {
      setSecurityAlert('ไม่มีสิทธิ์ในการแก้ไขข้อมูลนักศึกษา');
      return;
    }

    if (!student?.id || !validateId(student.id)) {
      console.error('Invalid student ID for edit:', student?.id);
      setSecurityAlert('ตรวจพบการพยายามเข้าถึงข้อมูลไม่ถูกต้อง');
      return;
    }

    const studentName = `${student.firstName} ${student.lastName}`;
    try {
      await Promise.all([
        logStudentEdit(student.id, studentName, student.code),
        logStudentEditTimestamp(studentName, student.code)
      ]);
    } catch (error) {
      console.warn('Failed to log edit initiation:', error);
    }

    navigate(`/name-register/student-detail/${student.id}?tab=profile&edit=true`);
  }, [navigate, permissions.canEditStudents, validateId, setSecurityAlert]);

  const handleToggleStatus = useCallback(async (student) => {
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
    const studentName = `${firstName} ${lastName}`;
    const confirmMessage = `คุณต้องการ${action}การใช้งานของ ${studentName} หรือไม่?`;

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
            const result = await toggleStudentStatus(student);

            if (result.success) {
              await Promise.all([
                logStudentStatusConfirm(student.id, studentName, student.code, action),
                logStudentStatusChangeTimestamp(studentName, student.code, action)
              ]);

              await fetchStudents();
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
  }, [permissions.canToggleStudentStatus, validateId, sanitizeInput, setSecurityAlert, showModal, closeModal, toggleStudentStatus, fetchStudents]);

  const handleExportToExcel = useCallback(async (students, filterInfo) => {
    if (!permissions.canExportData) {
      setSecurityAlert('ไม่มีสิทธิ์ในการส่งออกข้อมูล');
      return;
    }

    try {
      await Promise.all([
        logStudentExport(students.length, filterInfo),
        logStudentExportTimestamp(students.length, filterInfo)
      ]);

      return exportFilteredStudentsToExcel(students, filterInfo);
    } catch (error) {
      console.warn('Failed to log export action:', error);
      return exportFilteredStudentsToExcel(students, filterInfo);
    }
  }, [permissions.canExportData, setSecurityAlert]);

  const handleAddStudent = useCallback(async () => {
    if (!permissions.canAddStudents) {
      setSecurityAlert('ไม่มีสิทธิ์ในการเพิ่มนักศึกษา - ต้องเป็น Staff เท่านั้น');
      return;
    }

    try {
      await logSystemAction(0, 'เริ่มกระบวนการเพิ่มนักศึกษาใหม่');
    } catch (error) {
      console.warn('Failed to log add student initiation:', error);
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

  const handleShowStudentSummary = useCallback(async (students, filterInfo) => {
    if (!students || students.length === 0) {
      showModal('ไม่มีข้อมูลนักศึกษา', [
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
        `ดูสรุปข้อมูลนักศึกษา: ${students.length} คน ${filterInfo?.department ? `สาขา: ${filterInfo.department}` : ''}`
      );
    } catch (error) {
      console.warn('Failed to log summary view:', error);
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
      await logSystemAction(0, 'รีเฟรชข้อมูลนักศึกษาทั้งหมด');

      await fetchStudents();
    } catch (error) {
      console.warn('Failed to refresh student data:', error);
      setSecurityAlert('ไม่สามารถรีเฟรชข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
    }
  }, [fetchStudents, setSecurityAlert]);

  const handleBulkExport = useCallback(async (students, filterInfo, options = {}) => {
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
        onClick: async () => {
          closeModal();

          try {
            await Promise.all([
              logBulkOperation(
                'ส่งออกข้อมูลนักศึกษาแบบ Bulk',
                students.length,
                `ตัวกรอง: ${JSON.stringify(filterInfo || {})} | Options: ${JSON.stringify(options)}`
              ),
              logStudentExportTimestamp(students.length, filterInfo)
            ]);

            const success = exportFilteredStudentsToExcel(students, filterInfo, options);
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
            const success = exportFilteredStudentsToExcel(students, filterInfo, options);
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
        logStudentSearch(searchCriteria),
        logStudentSearchTimestamp(searchCriteria)
      ]);
    } catch (error) {
      console.warn('Failed to log search action:', error);
    }
  }, []);

  const handleFilter = useCallback(async (filterCriteria) => {
    try {
      await Promise.all([
        logStudentFilter(filterCriteria),
        logStudentFilterTimestamp(filterCriteria)
      ]);
    } catch (error) {
      console.warn('Failed to log filter action:', error);
    }
  }, []);

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
    handleSearch,
    handleFilter,
    permissions
  };
};