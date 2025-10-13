import React, { useState } from 'react';
import { Loader, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import styles from './ExportExcelButton.module.css';

const ExportExcelButton = ({ userData, activities = [], completedActivities = [] }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!userData) {
      alert('ไม่พบข้อมูลผู้ใช้สำหรับการส่งออก');
      return;
    }

    setIsExporting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const workbook = XLSX.utils.book_new();
      
      // สร้าง Sheet ต่างๆ
      addSummarySheet(workbook, userData, activities, completedActivities);
      addProfileSheet(workbook, userData);
      addStatisticsSheet(workbook, activities, completedActivities);
      
      if (completedActivities.length > 0) {
        addCompletedActivitiesSheet(workbook, completedActivities);
      }
      
      if (activities.length > 0) {
        addAllActivitiesSheet(workbook, activities);
      }

      // ส่งออกไฟล์
      const filename = generateFilename(userData);
      XLSX.writeFile(workbook, filename);

    } catch (error) {
      console.error('Export failed:', error);
      alert('เกิดข้อผิดพลาดในการส่งออกข้อมูล กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsExporting(false);
    }
  };

  // ==================== SHEET 1: รายงานสรุป ====================
  const addSummarySheet = (workbook, userData, activities, completedActivities) => {
    const userType = userData.userType;
    const profile = userData[userType] || {};
    const data = [];

    // หัวข้อรายงาน
    data.push(['รายงานสรุปข้อมูลผู้ใช้งานระบบ']);
    data.push([]);
    data.push(['ประเภท:', getUserTypeDisplay(userType)]);
    data.push(['วันที่ส่งออก:', formatThaiDateTime(new Date().toISOString())]);
    data.push([]);

    // ข้อมูลพื้นฐาน
    data.push(['ข้อมูลพื้นฐาน']);
    data.push(['รหัส', profile.code || '']);
    data.push(['ชื่อ-นามสกุล', `${profile.firstName || ''} ${profile.lastName || ''}`.trim()]);
    data.push(['อีเมล', userData.email || '']);
    data.push(['เบอร์โทรศัพท์', profile.phone || '']);
    data.push(['สถานะบัญชี', userData.isActive ? 'ใช้งานได้' : 'ระงับ']);
    data.push([]);

    // ข้อมูลเฉพาะตามประเภท
    if (userType === 'student') {
      data.push(['ข้อมูลการศึกษา']);
      data.push(['คณะ', profile.faculty || '']);
      data.push(['สาขาวิชา', profile.department || '']);
      data.push(['ปีการศึกษา', profile.academicYear || '']);
      data.push(['อาจารย์ที่ปรึกษา', profile.advisor || '']);
      data.push(['สถานะการศึกษา', profile.isGraduated ? 'จบการศึกษา' : 'กำลังศึกษา']);
      data.push([]);
    } else if (userType === 'teacher') {
      data.push(['ข้อมูลการทำงาน']);
      data.push(['คณะ', profile.faculty || '']);
      data.push(['สาขาวิชา', profile.department || '']);
      data.push(['ตำแหน่ง', profile.isDean ? 'คณบดี' : 'อาจารย์']);
      data.push(['สถานะการทำงาน', profile.isResigned ? 'ลาออก' : 'ปฏิบัติงาน']);
      data.push([]);
    } else if (userType === 'staff') {
      data.push(['ข้อมูลการทำงาน']);
      data.push(['สถานะการทำงาน', profile.isResigned ? 'ลาออก' : 'ปฏิบัติงาน']);
      data.push(['วันที่เริ่มงาน', formatThaiDate(profile.regisTime)]);
      data.push([]);
    }

    // สรุปกิจกรรม (สำหรับนักศึกษาและอาจารย์)
    if ((userType === 'student' || userType === 'teacher') && activities.length > 0) {
      const totalHours = completedActivities.reduce((sum, act) => sum + (act.Activity_TotalHours || 0), 0);
      const approvedCount = activities.filter(a => a.RegistrationPicture_ApprovedTime).length;
      const pendingCount = activities.filter(a => a.RegistrationPicture_Status === 'รออนุมัติ').length;
      const rejectedCount = activities.filter(a => a.RegistrationPicture_Status === 'ปฏิเสธ').length;

      data.push(['สรุปกิจกรรม']);
      data.push(['กิจกรรมทั้งหมด', activities.length + ' กิจกรรม']);
      data.push(['เข้าร่วมสำเร็จ', completedActivities.length + ' กิจกรรม']);
      data.push(['รวมชั่วโมง', totalHours.toFixed(1) + ' ชั่วโมง']);
      data.push(['อนุมัติแล้ว', approvedCount + ' กิจกรรม']);
      data.push(['รอตรวจสอบ', pendingCount + ' กิจกรรม']);
      data.push(['ถูกปฏิเสธ', rejectedCount + ' กิจกรรม']);
    }

    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // กำหนดความกว้างคอลัมน์
    ws['!cols'] = [
      { wch: 25 },
      { wch: 50 }
    ];

    XLSX.utils.book_append_sheet(workbook, ws, 'รายงานสรุป');
  };

  // ==================== SHEET 2: ข้อมูลรายละเอียด ====================
  const addProfileSheet = (workbook, userData) => {
    const userType = userData.userType;
    const profile = userData[userType] || {};
    const data = [];

    // หัวข้อ
    data.push(['ข้อมูลรายละเอียด' + getUserTypeDisplay(userType)]);
    data.push([]);

    // ข้อมูลบัญชีผู้ใช้
    data.push(['ข้อมูลบัญชีผู้ใช้']);
    data.push(['หัวข้อ', 'ข้อมูล']);
    data.push(['รหัสผู้ใช้ในระบบ', userData.id || '']);
    data.push(['อีเมล', userData.email || '']);
    data.push(['ชื่อผู้ใช้', userData.username || '']);
    data.push(['ประเภทผู้ใช้', getUserTypeDisplay(userType)]);
    data.push(['สถานะบัญชี', userData.isActive ? 'ใช้งานได้' : 'ระงับการใช้งาน']);
    data.push(['วันที่สมัครสมาชิก', formatThaiDateTime(userData.regisTime)]);
    data.push(['มีรูปโปรไฟล์', userData.imageFile ? 'มี' : 'ไม่มี']);
    data.push([]);

    // ข้อมูลเฉพาะตามประเภท
    if (userType === 'student') {
      data.push(['ข้อมูลนักศึกษา']);
      data.push(['หัวข้อ', 'ข้อมูล']);
      data.push(['รหัสนักศึกษา', profile.code || '']);
      data.push(['ชื่อ', profile.firstName || '']);
      data.push(['นามสกุล', profile.lastName || '']);
      data.push(['ชื่อ-นามสกุล (เต็ม)', `${profile.firstName || ''} ${profile.lastName || ''}`.trim()]);
      data.push(['เบอร์โทรศัพท์หลัก', profile.phone || '']);
      
      const otherPhones = formatOtherPhones(profile.otherPhones);
      data.push(['เบอร์โทรศัพท์เพิ่มเติม', otherPhones]);
      data.push(['จำนวนเบอร์ทั้งหมด', (profile.otherPhones?.length || 0) + (profile.phone ? 1 : 0)]);
      
      data.push(['ปีการศึกษาที่เข้า', profile.academicYear || '']);
      data.push(['วันเกิด', formatThaiDate(profile.birthdate)]);
      data.push(['ศาสนา', profile.religion || '']);
      data.push(['คณะ', profile.faculty || '']);
      data.push(['สาขาวิชา', profile.department || '']);
      data.push(['อาจารย์ที่ปรึกษา', profile.advisor || '']);
      data.push(['สถานะการศึกษา', profile.isGraduated ? 'จบการศึกษาแล้ว' : 'กำลังศึกษา']);
      data.push(['ปัญหาสุขภาพ/โรคประจำตัว', profile.medicalProblem || 'ไม่มี']);
      data.push(['วันที่เพิ่มข้อมูลในระบบ', formatThaiDateTime(profile.regisTime)]);
    } else if (userType === 'teacher') {
      data.push(['ข้อมูลอาจารย์']);
      data.push(['หัวข้อ', 'ข้อมูล']);
      data.push(['รหัสอาจารย์', profile.code || '']);
      data.push(['ชื่อ', profile.firstName || '']);
      data.push(['นามสกุล', profile.lastName || '']);
      data.push(['ชื่อ-นามสกุล (เต็ม)', `${profile.firstName || ''} ${profile.lastName || ''}`.trim()]);
      data.push(['เบอร์โทรศัพท์หลัก', profile.phone || '']);
      
      const otherPhones = formatOtherPhones(profile.otherPhones);
      data.push(['เบอร์โทรศัพท์เพิ่มเติม', otherPhones]);
      data.push(['จำนวนเบอร์ทั้งหมด', (profile.otherPhones?.length || 0) + (profile.phone ? 1 : 0)]);
      
      data.push(['วันเกิด', formatThaiDate(profile.birthdate)]);
      data.push(['ศาสนา', profile.religion || '']);
      data.push(['ตำแหน่ง', profile.isDean ? 'คณบดี' : 'อาจารย์']);
      data.push(['คณะ', profile.faculty || '']);
      data.push(['สาขาวิชา/ภาควิชา', profile.department || '']);
      data.push(['สถานะการทำงาน', profile.isResigned ? 'ลาออกแล้ว' : 'ยังปฏิบัติงาน']);
      data.push(['ปัญหาสุขภาพ/โรคประจำตัว', profile.medicalProblem || 'ไม่มี']);
      data.push(['วันที่เริ่มงาน', formatThaiDateTime(profile.regisTime)]);
    } else if (userType === 'staff') {
      data.push(['ข้อมูลเจ้าหน้าที่']);
      data.push(['หัวข้อ', 'ข้อมูล']);
      data.push(['รหัสเจ้าหน้าที่', profile.code || '']);
      data.push(['ชื่อ', profile.firstName || '']);
      data.push(['นามสกุล', profile.lastName || '']);
      data.push(['ชื่อ-นามสกุล (เต็ม)', `${profile.firstName || ''} ${profile.lastName || ''}`.trim()]);
      data.push(['เบอร์โทรศัพท์หลัก', profile.phone || '']);
      
      const otherPhones = formatOtherPhones(profile.otherPhones);
      data.push(['เบอร์โทรศัพท์เพิ่มเติม', otherPhones]);
      data.push(['จำนวนเบอร์ทั้งหมด', (profile.otherPhones?.length || 0) + (profile.phone ? 1 : 0)]);
      
      data.push(['สถานะการทำงาน', profile.isResigned ? 'ลาออกแล้ว' : 'ยังปฏิบัติงาน']);
      data.push(['วันที่เริ่มงาน', formatThaiDateTime(profile.regisTime)]);
    }

    const ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = [{ wch: 30 }, { wch: 50 }];
    XLSX.utils.book_append_sheet(workbook, ws, 'ข้อมูลรายละเอียด');
  };

  // ==================== SHEET 3: สถิติและวิเคราะห์ ====================
  const addStatisticsSheet = (workbook, activities, completedActivities) => {
    if (activities.length === 0 && completedActivities.length === 0) {
      return;
    }

    const data = [];
    
    // หัวข้อ
    data.push(['สถิติและวิเคราะห์กิจกรรม']);
    data.push([]);

    // สรุปภาพรวม
    const totalHours = completedActivities.reduce((sum, act) => sum + (act.Activity_TotalHours || 0), 0);
    const approvedCount = activities.filter(a => a.RegistrationPicture_ApprovedTime).length;
    const pendingCount = activities.filter(a => a.RegistrationPicture_Status === 'รออนุมัติ').length;
    const rejectedCount = activities.filter(a => a.RegistrationPicture_Status === 'ปฏิเสธ').length;
    const cancelledCount = activities.filter(a => a.Registration_IsCancelled).length;
    const checkedInCount = activities.filter(a => a.Registration_CheckInTime && !a.Registration_CheckOutTime).length;
    const checkedOutCount = activities.filter(a => a.Registration_CheckOutTime).length;
    const registeredCount = activities.filter(a => a.Registration_RegisTime && !a.Registration_CheckInTime).length;

    data.push(['สรุปภาพรวม']);
    data.push(['หัวข้อ', 'จำนวน']);
    data.push(['กิจกรรมทั้งหมด', activities.length]);
    data.push(['เข้าร่วมสำเร็จ (เช็คเอาท์แล้ว)', checkedOutCount]);
    data.push(['รวมชั่วโมงที่ได้รับ', totalHours.toFixed(1)]);
    data.push(['ชั่วโมงเฉลี่ย/กิจกรรม', completedActivities.length > 0 ? (totalHours / completedActivities.length).toFixed(2) : '0']);
    data.push([]);

    // สถานะการลงทะเบียน
    data.push(['สถานะการลงทะเบียน']);
    data.push(['สถานะ', 'จำนวน', 'เปอร์เซ็นต์']);
    data.push(['ลงทะเบียนแล้ว', registeredCount, `${(registeredCount / activities.length * 100).toFixed(1)}%`]);
    data.push(['เช็คอินแล้ว', checkedInCount, `${(checkedInCount / activities.length * 100).toFixed(1)}%`]);
    data.push(['เช็คเอาท์แล้ว', checkedOutCount, `${(checkedOutCount / activities.length * 100).toFixed(1)}%`]);
    data.push(['ยกเลิก', cancelledCount, `${(cancelledCount / activities.length * 100).toFixed(1)}%`]);
    data.push([]);

    // สถานะการตรวจสอบรูปภาพ
    data.push(['สถานะการตรวจสอบรูปภาพ']);
    data.push(['สถานะ', 'จำนวน', 'เปอร์เซ็นต์']);
    data.push(['อนุมัติแล้ว', approvedCount, `${(approvedCount / activities.length * 100).toFixed(1)}%`]);
    data.push(['รอตรวจสอบ', pendingCount, `${(pendingCount / activities.length * 100).toFixed(1)}%`]);
    data.push(['ถูกปฏิเสธ', rejectedCount, `${(rejectedCount / activities.length * 100).toFixed(1)}%`]);
    data.push([]);

    // สถิติตามประเภทกิจกรรม
    const typeStats = {};
    completedActivities.forEach(act => {
      const type = act.ActivityType_Name || 'ไม่ระบุ';
      if (!typeStats[type]) {
        typeStats[type] = { count: 0, hours: 0 };
      }
      typeStats[type].count++;
      typeStats[type].hours += act.Activity_TotalHours || 0;
    });

    if (Object.keys(typeStats).length > 0) {
      data.push(['สถิติตามประเภทกิจกรรม']);
      data.push(['ประเภท', 'จำนวนกิจกรรม', 'รวมชั่วโมง', 'เฉลี่ย (ชม./กิจกรรม)']);
      Object.entries(typeStats).forEach(([type, stats]) => {
        data.push([
          type,
          stats.count,
          stats.hours.toFixed(1),
          (stats.hours / stats.count).toFixed(2)
        ]);
      });
      data.push([]);
    }

    // สถิติ AI Verification
    const aiSuccessCount = activities.filter(a => a.RegistrationPicture_IsAiSuccess === true).length;
    const aiFailCount = activities.filter(a => a.RegistrationPicture_IsAiSuccess === false).length;
    const aiNotChecked = activities.filter(a => a.RegistrationPicture_IsAiSuccess === null || a.RegistrationPicture_IsAiSuccess === undefined).length;

    data.push(['สถิติการตรวจสอบด้วย AI']);
    data.push(['สถานะ', 'จำนวน', 'เปอร์เซ็นต์']);
    data.push(['ตรวจสอบสำเร็จ', aiSuccessCount, `${(aiSuccessCount / activities.length * 100).toFixed(1)}%`]);
    data.push(['ตรวจสอบไม่สำเร็จ', aiFailCount, `${(aiFailCount / activities.length * 100).toFixed(1)}%`]);
    data.push(['ยังไม่ได้ตรวจสอบ', aiNotChecked, `${(aiNotChecked / activities.length * 100).toFixed(1)}%`]);

    const ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(workbook, ws, 'สถิติและวิเคราะห์');
  };

  // ==================== SHEET 4: กิจกรรมที่เข้าร่วมสำเร็จ ====================
  const addCompletedActivitiesSheet = (workbook, completedActivities) => {
    const data = [];
    
    // หัวข้อ
    data.push(['กิจกรรมที่เข้าร่วมสำเร็จ (10 ล่าสุด)']);
    data.push([]);
    
    // Header
    data.push([
      'ลำดับ',
      'ชื่อกิจกรรม',
      'ประเภท',
      'วันที่จัด',
      'เวลาเริ่ม',
      'เวลาสิ้นสุด',
      'สถานที่',
      'จำนวนชั่วโมง',
      'วันเวลาลงทะเบียน',
      'วันเวลาเช็คอิน',
      'วันเวลาเช็คเอาท์',
      'วันเวลาอนุมัติรูป',
      'สถานะ AI'
    ]);

    // Data rows
    completedActivities.forEach((activity, index) => {
      const activityDate = formatThaiDate(activity.Activity_StartTime);
      const startTime = new Date(activity.Activity_StartTime).toLocaleTimeString('th-TH', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      const endTime = new Date(activity.Activity_EndTime).toLocaleTimeString('th-TH', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      const aiStatus = activity.RegistrationPicture_IsAiSuccess !== null && 
                       activity.RegistrationPicture_IsAiSuccess !== undefined
        ? (activity.RegistrationPicture_IsAiSuccess ? 'ตรวจสอบสำเร็จ' : 'ตรวจสอบไม่สำเร็จ')
        : '-';

      data.push([
        index + 1,
        activity.Activity_Title || '',
        activity.ActivityType_Name || 'ไม่ระบุ',
        activityDate,
        startTime,
        endTime,
        activity.Activity_LocationDetail || '-',
        activity.Activity_DurationText || `${activity.Activity_TotalHours || 0} ชม.`,
        formatThaiDateTime(activity.Registration_RegisTime) || '-',
        formatThaiDateTime(activity.Registration_CheckInTime) || '-',
        formatThaiDateTime(activity.Registration_CheckOutTime) || '-',
        formatThaiDateTime(activity.RegistrationPicture_ApprovedTime) || '-',
        aiStatus
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = [
      { wch: 8 },   // ลำดับ
      { wch: 35 },  // ชื่อกิจกรรม
      { wch: 25 },  // ประเภท
      { wch: 20 },  // วันที่
      { wch: 10 },  // เวลาเริ่ม
      { wch: 10 },  // เวลาสิ้นสุด
      { wch: 25 },  // สถานที่
      { wch: 12 },  // ชั่วโมง
      { wch: 22 },  // ลงทะเบียน
      { wch: 22 },  // เช็คอิน
      { wch: 22 },  // เช็คเอาท์
      { wch: 22 },  // อนุมัติรูป
      { wch: 18 }   // AI
    ];

    XLSX.utils.book_append_sheet(workbook, ws, 'กิจกรรมสำเร็จ');
  };

  // ==================== SHEET 5: กิจกรรมทั้งหมด ====================
  const addAllActivitiesSheet = (workbook, activities) => {
    const data = [];
    
    // หัวข้อ
    data.push(['กิจกรรมล่าสุดทั้งหมด']);
    data.push([]);
    
    // Header
    data.push([
      'ลำดับ',
      'ชื่อกิจกรรม',
      'ประเภท',
      'วันที่จัด',
      'เวลาเริ่ม',
      'เวลาสิ้นสุด',
      'สถานที่',
      'จำนวนชั่วโมง',
      'สถานะ',
      'วันเวลาลงทะเบียน',
      'วันเวลาเช็คอิน',
      'วันเวลาเช็คเอาท์',
      'วันเวลาอนุมัติรูป',
      'สถานะ AI',
      'สถานะรูปภาพ'
    ]);

    // Data rows
    activities.forEach((activity, index) => {
      const activityDate = formatThaiDate(activity.Activity_StartTime);
      const startTime = new Date(activity.Activity_StartTime).toLocaleTimeString('th-TH', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      const endTime = new Date(activity.Activity_EndTime).toLocaleTimeString('th-TH', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      const status = getActivityStatus(activity);
      
      const aiStatus = activity.RegistrationPicture_IsAiSuccess !== null && 
                       activity.RegistrationPicture_IsAiSuccess !== undefined
        ? (activity.RegistrationPicture_IsAiSuccess ? 'ตรวจสอบสำเร็จ' : 'ตรวจสอบไม่สำเร็จ')
        : '-';

      data.push([
        index + 1,
        activity.Activity_Title || '',
        activity.ActivityType_Name || 'ไม่ระบุ',
        activityDate,
        startTime,
        endTime,
        activity.Activity_LocationDetail || '-',
        activity.Activity_DurationText || `${activity.Activity_TotalHours || 0} ชม.`,
        status,
        formatThaiDateTime(activity.Registration_RegisTime) || '-',
        formatThaiDateTime(activity.Registration_CheckInTime) || '-',
        formatThaiDateTime(activity.Registration_CheckOutTime) || '-',
        formatThaiDateTime(activity.RegistrationPicture_ApprovedTime) || '-',
        aiStatus,
        activity.RegistrationPicture_Status || '-'
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = [
      { wch: 8 },   // ลำดับ
      { wch: 35 },  // ชื่อกิจกรรม
      { wch: 25 },  // ประเภท
      { wch: 20 },  // วันที่
      { wch: 10 },  // เวลาเริ่ม
      { wch: 10 },  // เวลาสิ้นสุด
      { wch: 25 },  // สถานที่
      { wch: 12 },  // ชั่วโมง
      { wch: 18 },  // สถานะ
      { wch: 22 },  // ลงทะเบียน
      { wch: 22 },  // เช็คอิน
      { wch: 22 },  // เช็คเอาท์
      { wch: 22 },  // อนุมัติรูป
      { wch: 18 },  // AI
      { wch: 15 }   // สถานะรูป
    ];

    XLSX.utils.book_append_sheet(workbook, ws, 'กิจกรรมทั้งหมด');
  };

  // ==================== Helper Functions ====================
  
  const formatThaiDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
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

  const formatOtherPhones = (otherPhones) => {
    if (!Array.isArray(otherPhones) || otherPhones.length === 0) return 'ไม่มี';

    return otherPhones
      .filter(item => item.name || item.phone)
      .map(item => {
        const name = item.name || 'ไม่ระบุชื่อ';
        const phone = item.phone || 'ไม่ระบุเบอร์';
        return `${name}: ${phone}`;
      })
      .join(' | ');
  };

  const getUserTypeDisplay = (userType) => {
    const typeMap = {
      'student': 'นักศึกษา',
      'teacher': 'อาจารย์',
      'staff': 'เจ้าหน้าที่'
    };
    return typeMap[userType] || 'ไม่ระบุ';
  };

  const getActivityStatus = (activity) => {
    if (activity.RegistrationPicture_Status === 'ปฏิเสธ' || activity.RegistrationPicture_Status === 'rejected') {
      return 'รูปถูกปฏิเสธ';
    }
    if (activity.RegistrationPicture_Status === 'รออนุมัติ' || activity.RegistrationPicture_Status === 'pending') {
      return 'รอตรวจสอบรูป';
    }
    if (activity.RegistrationPicture_ApprovedTime) {
      return 'อนุมัติแล้ว';
    }
    if (activity.Registration_IsCancelled) return 'ยกเลิก';
    if (activity.Registration_CheckOutTime) return 'เข้าร่วมสำเร็จ';
    if (activity.Registration_CheckInTime) return 'เช็คอินแล้ว';
    return 'ลงทะเบียนแล้ว';
  };

  const generateFilename = (userData) => {
    const userType = getUserTypeDisplay(userData.userType);
    const name = userData[userData.userType]?.firstName || '';
    const lastname = userData[userData.userType]?.lastName || '';
    const code = userData[userData.userType]?.code || '';
    const date = new Date().toISOString().split('T')[0];
    const time = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');

    return `รายงาน${userType}_${name}${lastname}_${code}_${date}_${time}.xlsx`;
  };

  if (!userData) {
    return null;
  }

  return (
    <button
      className={styles.exportButton}
      onClick={handleExport}
      disabled={isExporting}
      title={`ส่งออกข้อมูล${getUserTypeDisplay(userData.userType)} ${userData[userData.userType]?.firstName || ''}`}
    >
      {isExporting ? (
        <>
          <Loader size={16} className={styles.spinning} />
          กำลังส่งออก...
        </>
      ) : (
        <>
          <Download size={16} />
          ส่งออก Excel
        </>
      )}
    </button>
  );
};

export default ExportExcelButton;