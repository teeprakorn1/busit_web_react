import React, { useState } from 'react';
import { Loader, Download } from 'lucide-react';
import styles from './ExportExcelButton.module.css';

const ExportExcelButton = ({ userData }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!userData) {
      alert('ไม่พบข้อมูลผู้ใช้สำหรับการส่งออก');
      return;
    }

    setIsExporting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const exportData = prepareExportData(userData);
      const csvContent = generateAdvancedCSVContent(exportData);
      const filename = generateFilename(userData);

      downloadCSV(csvContent, filename);

    } catch (error) {
      console.error('Export failed:', error);
      alert('เกิดข้อผิดพลาดในการส่งออกข้อมูล กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsExporting(false);
    }
  };

  const prepareExportData = (userData) => {
    const userType = userData.userType;
    const profile = userData[userType] || {};

    return {
      userInfo: {
        id: userData.id,
        email: userData.email,
        username: userData.username,
        userType: userType,
        isActive: userData.isActive,
        regisTime: userData.regisTime,
        lastLoginTime: userData.lastLoginTime,
        imageFile: userData.imageFile
      },
      profileData: profile,
      exportMetadata: {
        exportDate: new Date().toISOString(),
        exportedBy: 'Admin System',
        systemVersion: '1.0.0',
        recordCount: 1
      }
    };
  };

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
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const formatOtherPhones = (otherPhones) => {
    if (!Array.isArray(otherPhones) || otherPhones.length === 0) return '';

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

  const generateAdvancedCSVContent = (data) => {
    const { userInfo, profileData, exportMetadata } = data;
    const userType = userInfo.userType;

    let csvRows = [];

    csvRows.push(['='.repeat(60)]);
    csvRows.push(['รายงานข้อมูลผู้ใช้งานระบบ']);
    csvRows.push(['ประเภท: ' + getUserTypeDisplay(userType)]);
    csvRows.push(['วันที่ส่งออก: ' + formatThaiDateTime(exportMetadata.exportDate)]);
    csvRows.push(['='.repeat(60)]);
    csvRows.push(['']);
    csvRows.push(['ข้อมูลบัญชีผู้ใช้']);
    csvRows.push(['หัวข้อ', 'ข้อมูล']);
    csvRows.push(['รหัสผู้ใช้ในระบบ', userInfo.id || '']);
    csvRows.push(['อีเมล', userInfo.email || '']);
    csvRows.push(['ชื่อผู้ใช้', userInfo.username || '']);
    csvRows.push(['ประเภทผู้ใช้', getUserTypeDisplay(userInfo.userType)]);
    csvRows.push(['สถานะบัญชี', userInfo.isActive ? 'ใช้งานได้' : 'ระงับการใช้งาน']);
    csvRows.push(['วันที่สมัครสมาชิก', formatThaiDateTime(userInfo.regisTime)]);
    csvRows.push(['มีรูปโปรไฟล์', userInfo.imageFile ? 'มี' : 'ไม่มี']);
    csvRows.push(['']);

    if (userType === 'student') {
      generateStudentSection(csvRows, profileData);
    } else if (userType === 'teacher') {
      generateTeacherSection(csvRows, profileData);
    } else if (userType === 'staff') {
      generateStaffSection(csvRows, profileData);
    }

    csvRows.push(['']);
    csvRows.push(['-'.repeat(60)]);
    csvRows.push(['สรุปการส่งออกข้อมูล']);
    csvRows.push(['หัวข้อ', 'รายละเอียด']);
    csvRows.push(['วันที่และเวลาที่ส่งออก', formatThaiDateTime(exportMetadata.exportDate)]);
    csvRows.push(['ส่งออกโดยระบบ', exportMetadata.exportedBy]);
    csvRows.push(['เวอร์ชันระบบ', exportMetadata.systemVersion]);
    csvRows.push(['จำนวนรายการที่ส่งออก', exportMetadata.recordCount + ' รายการ']);
    csvRows.push(['-'.repeat(60)]);

    return csvRows.map(row =>
      row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(',')
    ).join('\n');
  };

  const generateStudentSection = (csvRows, profile) => {
    csvRows.push(['ข้อมูลนักศึกษา']);
    csvRows.push(['หัวข้อ', 'ข้อมูล']);
    csvRows.push(['รหัสนักศึกษา', profile.code || '']);
    csvRows.push(['ชื่อ', profile.firstName || '']);
    csvRows.push(['นามสกุล', profile.lastName || '']);
    csvRows.push(['ชื่อ-นามสกุล (เต็ม)', `${profile.firstName || ''} ${profile.lastName || ''}`.trim()]);
    csvRows.push(['เบอร์โทรศัพท์หลัก', profile.phone || '']);

    const otherPhonesFormatted = formatOtherPhones(profile.otherPhones);
    csvRows.push(['เบอร์โทรศัพท์เพิ่มเติม', otherPhonesFormatted]);
    csvRows.push(['จำนวนเบอร์ทั้งหมด', (profile.otherPhones?.length || 0) + (profile.phone ? 1 : 0)]);

    csvRows.push(['ปีการศึกษาที่เข้า', profile.academicYear || '']);
    csvRows.push(['วันเกิด', formatThaiDate(profile.birthdate)]);
    csvRows.push(['ศาสนา', profile.religion || '']);
    csvRows.push(['คณะ', profile.faculty || '']);
    csvRows.push(['สาขาวิชา', profile.department || '']);
    csvRows.push(['อาจารย์ที่ปรึกษา', profile.advisor || '']);
    csvRows.push(['สถานะการศึกษา', profile.isGraduated ? 'จบการศึกษาแล้ว' : 'กำลังศึกษา']);
    csvRows.push(['ปัญหาสุขภาพ/โรคประจำตัว', profile.medicalProblem || 'ไม่มี']);
    csvRows.push(['วันที่เพิ่มข้อมูลในระบบ', formatThaiDateTime(profile.regisTime)]);
    csvRows.push(['']);
  };

  const generateTeacherSection = (csvRows, profile) => {
    csvRows.push(['ข้อมูลอาจารย์']);
    csvRows.push(['หัวข้อ', 'ข้อมูล']);
    csvRows.push(['รหัสอาจารย์', profile.code || '']);
    csvRows.push(['ชื่อ', profile.firstName || '']);
    csvRows.push(['นามสกุล', profile.lastName || '']);
    csvRows.push(['ชื่อ-นามสกุล (เต็ม)', `${profile.firstName || ''} ${profile.lastName || ''}`.trim()]);
    csvRows.push(['เบอร์โทรศัพท์หลัก', profile.phone || '']);

    const otherPhonesFormatted = formatOtherPhones(profile.otherPhones);
    csvRows.push(['เบอร์โทรศัพท์เพิ่มเติม', otherPhonesFormatted]);
    csvRows.push(['จำนวนเบอร์ทั้งหมด', (profile.otherPhones?.length || 0) + (profile.phone ? 1 : 0)]);

    csvRows.push(['วันเกิด', formatThaiDate(profile.birthdate)]);
    csvRows.push(['ศาสนา', profile.religion || '']);
    csvRows.push(['ตำแหน่ง', profile.isDean ? 'คณบดี' : 'อาจารย์']);
    csvRows.push(['คณะ', profile.faculty || '']);
    csvRows.push(['สาขาวิชา/ภาควิชา', profile.department || '']);
    csvRows.push(['สถานะการทำงาน', profile.isResigned ? 'ลาออกแล้ว' : 'ยังปฏิบัติงาน']);
    csvRows.push(['ปัญหาสุขภาพ/โรคประจำตัว', profile.medicalProblem || 'ไม่มี']);
    csvRows.push(['วันที่เริ่มงาน', formatThaiDateTime(profile.regisTime)]);
    csvRows.push(['']);
  };

  const generateStaffSection = (csvRows, profile) => {
    csvRows.push(['ข้อมูลเจ้าหน้าที่']);
    csvRows.push(['หัวข้อ', 'ข้อมูล']);
    csvRows.push(['รหัสเจ้าหน้าที่', profile.code || '']);
    csvRows.push(['ชื่อ', profile.firstName || '']);
    csvRows.push(['นามสกุล', profile.lastName || '']);
    csvRows.push(['ชื่อ-นามสกุล (เต็ม)', `${profile.firstName || ''} ${profile.lastName || ''}`.trim()]);
    csvRows.push(['เบอร์โทรศัพท์หลัก', profile.phone || '']);

    const otherPhonesFormatted = formatOtherPhones(profile.otherPhones);
    csvRows.push(['เบอร์โทรศัพท์เพิ่มเติม', otherPhonesFormatted]);
    csvRows.push(['จำนวนเบอร์ทั้งหมด', (profile.otherPhones?.length || 0) + (profile.phone ? 1 : 0)]);

    csvRows.push(['สถานะการทำงาน', profile.isResigned ? 'ลาออกแล้ว' : 'ยังปฏิบัติงาน']);
    csvRows.push(['วันที่เริ่มงาน', formatThaiDateTime(profile.regisTime)]);
    csvRows.push(['']);
  };

  const generateFilename = (userData) => {
    const userType = getUserTypeDisplay(userData.userType);
    const username = userData.username || 'unknown';
    const name = userData[userData.userType]?.firstName || '';
    const date = new Date().toISOString().split('T')[0];
    const time = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');

    return `${userType}_${name}_${username}_${date}_${time}.csv`;
  };

  const downloadCSV = (csvContent, filename) => {
    try {
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], {
        type: 'text/csv;charset=utf-8;'
      });

      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 100);
      } else {
        throw new Error('Browser does not support download');
      }
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
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