import React, { useState } from 'react';
import { Loader, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import axios from 'axios';
import styles from './ExportActivityButton.module.css';

const ExportActivityButton = ({ activityData }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!activityData) {
      alert('ไม่พบข้อมูลกิจกรรมสำหรับการส่งออก');
      return;
    }

    setIsExporting(true);

    try {
      const [participants, departments, stats] = await Promise.all([
        fetchParticipants(activityData.Activity_ID),
        fetchDepartments(activityData.Activity_ID),
        fetchStats(activityData.Activity_ID)
      ]);

      const workbook = createCompleteExcelWorkbook(
        activityData,
        participants,
        departments,
        stats
      );

      const filename = generateFilename(activityData);
      downloadExcel(workbook, filename);

    } catch (error) {
      console.error('Export failed:', error);
      alert('เกิดข้อผิดพลาดในการส่งออกข้อมูล กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsExporting(false);
    }
  };

  const fetchParticipants = async (activityId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_SERVER_PROTOCOL}${process.env.REACT_APP_SERVER_BASE_URL}${process.env.REACT_APP_SERVER_PORT}/api/admin/activities/${activityId}/participants`,
        { withCredentials: true }
      );
      return response.data?.status ? response.data.data : [];
    } catch (error) {
      console.error('Fetch participants error:', error);
      return [];
    }
  };

  const fetchDepartments = async (activityId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_SERVER_PROTOCOL}${process.env.REACT_APP_SERVER_BASE_URL}${process.env.REACT_APP_SERVER_PORT}/api/admin/activities/${activityId}/departments`,
        { withCredentials: true }
      );
      return response.data?.status ? response.data.data : [];
    } catch (error) {
      console.error('Fetch departments error:', error);
      return [];
    }
  };

  const fetchStats = async (activityId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_SERVER_PROTOCOL}${process.env.REACT_APP_SERVER_BASE_URL}${process.env.REACT_APP_SERVER_PORT}/api/admin/activities/${activityId}/stats`,
        { withCredentials: true }
      );
      return response.data?.status ? response.data.data : null;
    } catch (error) {
      console.error('Fetch stats error:', error);
      return null;
    }
  };

  const formatThaiDateTime = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const formatThaiTime = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return '';
    }
  };

  const createCompleteExcelWorkbook = (data, participants, departments, stats) => {
    const workbook = XLSX.utils.book_new();
    const summarySheet = createSummarySheet(data, stats);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'สรุปกิจกรรม');
    const activitySheet = createActivitySheet(data);
    XLSX.utils.book_append_sheet(workbook, activitySheet, 'ข้อมูลกิจกรรม');

    if (participants.length > 0) {
      const participantsSheet = createParticipantsSheet(participants);
      XLSX.utils.book_append_sheet(workbook, participantsSheet, 'รายชื่อผู้เข้าร่วม');
    }

    if (departments.length > 0 && participants.length > 0) {
      const deptStatsSheet = createDepartmentStatsSheet(departments, participants);
      XLSX.utils.book_append_sheet(workbook, deptStatsSheet, 'สถิติแยกสาขา');
    }

    if (departments.length > 0) {
      const departmentsSheet = createDepartmentsSheet(departments);
      XLSX.utils.book_append_sheet(workbook, departmentsSheet, 'สาขาที่เข้าร่วม');
    }

    return workbook;
  };

  const createSummarySheet = (data, stats) => {
    const totalExpected = stats?.expected_participants || 0;
    const totalRegistered = stats?.total_registered || 0;
    const totalCheckedIn = stats?.total_checked_in || 0;
    const totalCheckedOut = stats?.total_checked_out || 0;

    const registrationRate = totalExpected > 0 ?
      ((totalRegistered / totalExpected) * 100).toFixed(2) : 0;
    const checkInRate = totalRegistered > 0 ?
      ((totalCheckedIn / totalRegistered) * 100).toFixed(2) : 0;
    const attendanceRate = totalRegistered > 0 ?
      ((totalCheckedOut / totalRegistered) * 100).toFixed(2) : 0;

    const summaryData = [
      ['รายงานสรุปกิจกรรม'],
      ['วันที่ส่งออก:', formatThaiDateTime(new Date().toISOString())],
      [],
      ['ชื่อกิจกรรม:', data.Activity_Title || ''],
      ['ประเภท:', data.ActivityType_Name || ''],
      ['สถานะ:', data.ActivityStatus_Name || ''],
      ['เวลาเริ่ม:', formatThaiDateTime(data.Activity_StartTime)],
      ['เวลาสิ้นสุด:', formatThaiDateTime(data.Activity_EndTime)],
      [],
      ['สถิติการเข้าร่วม'],
      ['ตัวชี้วัด', 'จำนวน', 'เปอร์เซ็นต์'],
      ['จำนวนที่คาดหวัง', totalExpected, '100.00%'],
      ['ลงทะเบียนแล้ว', totalRegistered, `${registrationRate}%`],
      ['เช็คอินแล้ว', totalCheckedIn, `${checkInRate}%`],
      ['เช็คเอาท์แล้ว (เสร็จสิ้น)', totalCheckedOut, `${attendanceRate}%`],
      [],
      ['สรุปรายละเอียด'],
      ['รายการ', 'จำนวน'],
      ['ยังไม่ได้ลงทะเบียน', totalExpected - totalRegistered],
      ['ลงทะเบียนแต่ยังไม่เช็คอิน', totalRegistered - totalCheckedIn],
      ['เช็คอินแต่ยังไม่เช็คเอาท์', totalCheckedIn - totalCheckedOut],
      ['เสร็จสิ้นกิจกรรม', totalCheckedOut]
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(summaryData);
    worksheet['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 15 }];
    return worksheet;
  };

  const createActivitySheet = (data) => {
    const activityData = [
      ['ข้อมูลกิจกรรมละเอียด'],
      [],
      ['ข้อมูลพื้นฐาน'],
      ['รหัสกิจกรรม', data.Activity_ID || ''],
      ['ชื่อกิจกรรม', data.Activity_Title || ''],
      ['คำอธิบาย', data.Activity_Description || ''],
      ['สถานที่', data.Activity_LocationDetail || ''],
      ['เวลาเริ่ม', formatThaiDateTime(data.Activity_StartTime)],
      ['เวลาสิ้นสุด', formatThaiDateTime(data.Activity_EndTime)],
      ['ประเภทกิจกรรม', data.ActivityType_Name || ''],
      ['สถานะ', data.ActivityStatus_Name || ''],
      ['กิจกรรมบังคับ', data.Activity_IsRequire ? 'ใช่' : 'ไม่'],
      [],
      ['ข้อมูลเพิ่มเติม'],
      ['เทมเพลต', data.Template_Name || 'ไม่ได้ใช้เทมเพลต'],
      ['ลายเซ็น', data.Signature_Name || 'ไม่มีลายเซ็น'],
      ['พิกัด GPS', data.Activity_LocationGPS ?
        (typeof data.Activity_LocationGPS === 'string' ?
          data.Activity_LocationGPS :
          `${data.Activity_LocationGPS.lat}, ${data.Activity_LocationGPS.lng}`) :
        'ไม่มีข้อมูล'],
      ['ไฟล์รูปภาพ', data.Activity_ImageFile || 'ไม่มีรูปภาพ']
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(activityData);
    worksheet['!cols'] = [{ wch: 25 }, { wch: 60 }];
    return worksheet;
  };

  const createParticipantsSheet = (participants) => {
    const participantsData = [
      ['รายชื่อผู้เข้าร่วมกิจกรรม'],
      ['จำนวนทั้งหมด:', participants.length, 'คน'],
      [],
      ['ลำดับ', 'รหัสนักศึกษา', 'ชื่อ', 'นามสกุล', 'สาขา', 'คณะ', 'เช็คอิน', 'เวลาเช็คอิน', 'เช็คเอาท์', 'เวลาเช็คเอาท์', 'สถานะ']
    ];

    participants.forEach((p, index) => {
      participantsData.push([
        index + 1,
        p.Student_Code || '',
        p.Student_FirstName || '',
        p.Student_LastName || '',
        p.Department_Name || '',
        p.Faculty_Name || '',
        p.Registration_CheckInTime ? 'เช็คอินแล้ว' : 'ยังไม่เช็คอิน',
        p.Registration_CheckInTime ? formatThaiTime(p.Registration_CheckInTime) : '',
        p.Registration_CheckOutTime ? 'เช็คเอาท์แล้ว' : 'ยังไม่เช็คเอาท์',
        p.Registration_CheckOutTime ? formatThaiTime(p.Registration_CheckOutTime) : '',
        p.Registration_CheckOutTime ? 'เสร็จสิ้น' :
          p.Registration_CheckInTime ? 'กำลังเข้าร่วม' : 'ยังไม่เข้าร่วม'
      ]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(participantsData);
    worksheet['!cols'] = [
      { wch: 8 },
      { wch: 15 },
      { wch: 20 },
      { wch: 20 },
      { wch: 30 },
      { wch: 30 },
      { wch: 15 },
      { wch: 12 },
      { wch: 15 },
      { wch: 12 },
      { wch: 15 }
    ];
    return worksheet;
  };

  const createDepartmentStatsSheet = (departments, participants) => {
    const deptStats = {};

    participants.forEach(p => {
      const deptName = p.Department_Name || 'ไม่ระบุสาขา';

      if (!deptStats[deptName]) {
        deptStats[deptName] = {
          facultyName: p.Faculty_Name || 'ไม่ระบุคณะ',
          total: 0,
          checkedIn: 0,
          checkedOut: 0
        };
      }

      deptStats[deptName].total++;
      if (p.Registration_CheckInTime) deptStats[deptName].checkedIn++;
      if (p.Registration_CheckOutTime) deptStats[deptName].checkedOut++;
    });

    const statsData = [
      ['สถิติการเข้าร่วมแยกตามสาขา'],
      [],
      ['ลำดับ', 'สาขา', 'คณะ', 'ลงทะเบียน', 'เช็คอิน', '% เช็คอิน', 'เช็คเอาท์', '% เสร็จสิ้น']
    ];

    let index = 1;
    for (const [deptName, data] of Object.entries(deptStats)) {
      const checkInRate = data.total > 0 ?
        ((data.checkedIn / data.total) * 100).toFixed(2) : 0;
      const completionRate = data.total > 0 ?
        ((data.checkedOut / data.total) * 100).toFixed(2) : 0;

      statsData.push([
        index++,
        deptName,
        data.facultyName,
        data.total,
        data.checkedIn,
        `${checkInRate}%`,
        data.checkedOut,
        `${completionRate}%`
      ]);
    }

    const totalRegistered = Object.values(deptStats).reduce((sum, d) => sum + d.total, 0);
    const totalCheckedIn = Object.values(deptStats).reduce((sum, d) => sum + d.checkedIn, 0);
    const totalCheckedOut = Object.values(deptStats).reduce((sum, d) => sum + d.checkedOut, 0);
    const avgCheckInRate = totalRegistered > 0 ?
      ((totalCheckedIn / totalRegistered) * 100).toFixed(2) : 0;
    const avgCompletionRate = totalRegistered > 0 ?
      ((totalCheckedOut / totalRegistered) * 100).toFixed(2) : 0;

    statsData.push([]);
    statsData.push([
      'รวม',
      `${Object.keys(deptStats).length} สาขา`,
      '',
      totalRegistered,
      totalCheckedIn,
      `${avgCheckInRate}%`,
      totalCheckedOut,
      `${avgCompletionRate}%`
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet(statsData);
    worksheet['!cols'] = [
      { wch: 8 },
      { wch: 35 },
      { wch: 35 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 15 }
    ];
    return worksheet;
  };

  const createDepartmentsSheet = (departments) => {
    const deptData = [
      ['สาขาที่เข้าร่วมกิจกรรม'],
      [],
      ['ลำดับ', 'สาขา', 'คณะ', 'จำนวนที่คาดหวัง']
    ];

    departments.forEach((dept, index) => {
      deptData.push([
        index + 1,
        dept.Department_Name || '',
        dept.Faculty_Name || '',
        dept.ActivityDetail_Total || 0
      ]);
    });

    const totalExpected = departments.reduce((sum, d) =>
      sum + (d.ActivityDetail_Total || 0), 0);

    deptData.push([]);
    deptData.push(['รวมทั้งหมด', `${departments.length} สาขา`, '', totalExpected]);

    const worksheet = XLSX.utils.aoa_to_sheet(deptData);
    worksheet['!cols'] = [
      { wch: 10 },
      { wch: 35 },
      { wch: 35 },
      { wch: 20 }
    ];
    return worksheet;
  };

  const generateFilename = (data) => {
    const title = (data.Activity_Title || 'activity')
      .replace(/[^a-zA-Z0-9ก-๙]/g, '_')
      .substring(0, 30);
    const date = new Date().toISOString().split('T')[0];
    const time = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');

    return `Activity_Report_${title}_${date}_${time}.xlsx`;
  };

  const downloadExcel = (workbook, filename) => {
    try {
      const excelBuffer = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
        cellStyles: true
      });

      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  };

  if (!activityData) {
    return null;
  }

  return (
    <button
      className={styles.exportButton}
      onClick={handleExport}
      disabled={isExporting}
      title={`ส่งออกรายงานกิจกรรม ${activityData.Activity_Title || ''}`}
    >
      {isExporting ? (
        <>
          <Loader size={16} className={styles.spinning} />
          กำลังส่งออก...
        </>
      ) : (
        <>
          <Download size={16} />
          ส่งออกรายงาน
        </>
      )}
    </button>
  );
};

export default ExportActivityButton;