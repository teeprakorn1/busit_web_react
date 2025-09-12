import React, { useState } from 'react';
import { FileSpreadsheet, Loader } from 'lucide-react';
import styles from './ExportExcelButton.module.css';

const ExportExcelButton = ({ userData }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const exportData = {
        userInfo: {
          email: userData.email,
          username: userData.username,
          userType: userData.userType,
          isActive: userData.isActive,
          regisTime: userData.regisTime
        },
        profileData: userData[userData.userType] || {},
        exportDate: new Date().toISOString(),
        exportedBy: 'Admin System'
      };
      const csvContent = generateCSVContent(exportData);
      downloadCSV(csvContent, `user_${userData.username}_${new Date().toISOString().split('T')[0]}.csv`);
      
    } catch (error) {
      console.error('Export failed:', error);
      alert('เกิดข้อผิดพลาดในการส่งออกข้อมูล');
    } finally {
      setIsExporting(false);
    }
  };

  const generateCSVContent = (data) => {
    const userType = data.userInfo.userType;
    const profile = data.profileData;
    
    let csvRows = [];
    csvRows.push(['=== ข้อมูลบัญชีผู้ใช้ ===']);
    csvRows.push(['อีเมล', data.userInfo.email || '']);
    csvRows.push(['ชื่อผู้ใช้', data.userInfo.username || '']);
    csvRows.push(['ประเภทผู้ใช้', getUserTypeDisplay(data.userInfo.userType)]);
    csvRows.push(['สถานะบัญชี', data.userInfo.isActive ? 'ใช้งาน' : 'ระงับ']);
    csvRows.push(['วันที่สมัครสมาชิก', data.userInfo.regisTime ? new Date(data.userInfo.regisTime).toLocaleDateString('th-TH') : '']);
    csvRows.push(['']);

    if (userType === 'student') {
      csvRows.push(['=== ข้อมูลนักศึกษา ===']);
      csvRows.push(['รหัสนักศึกษา', profile.code || '']);
      csvRows.push(['ชื่อ', profile.firstName || '']);
      csvRows.push(['นามสกุล', profile.lastName || '']);
      csvRows.push(['เบอร์โทรศัพท์หลัก', profile.phone || '']);
      csvRows.push(['เบอร์โทรศัพท์อื่นๆ', profile.otherPhones ? profile.otherPhones.join(', ') : '']);
      csvRows.push(['ปีการศึกษาที่เข้า', profile.academicYear || '']);
      csvRows.push(['วันเกิด', profile.birthdate ? new Date(profile.birthdate).toLocaleDateString('th-TH') : '']);
      csvRows.push(['ศาสนา', profile.religion || '']);
      csvRows.push(['คณะ', profile.faculty || '']);
      csvRows.push(['สาขาวิชา', profile.department || '']);
      csvRows.push(['อาจารย์ที่ปรึกษา', profile.advisor || '']);
      csvRows.push(['สถานะการศึกษา', profile.isGraduated ? 'จบการศึกษา' : 'กำลังศึกษา']);
      csvRows.push(['ปัญหาสุขภาพ', profile.medicalProblem || 'ไม่มี']);
    } else if (userType === 'teacher') {
      csvRows.push(['=== ข้อมูลอาจารย์ ===']);
      csvRows.push(['รหัสอาจารย์', profile.code || '']);
      csvRows.push(['ชื่อ', profile.firstName || '']);
      csvRows.push(['นามสกุล', profile.lastName || '']);
      csvRows.push(['เบอร์โทรศัพท์', profile.phones ? profile.phones.join(', ') : '']);
      csvRows.push(['วันเกิด', profile.birthdate ? new Date(profile.birthdate).toLocaleDateString('th-TH') : '']);
      csvRows.push(['ศาสนา', profile.religion || '']);
      csvRows.push(['ตำแหน่ง', profile.position || '']);
      csvRows.push(['คณะ', profile.faculty || '']);
      csvRows.push(['ภาควิชา', profile.department || '']);
      csvRows.push(['สาขาความเชี่ยวชาญ', profile.specialization || '']);
      csvRows.push(['วุฒิการศึกษา', profile.education || '']);
      csvRows.push(['วันที่เริ่มงาน', profile.startDate ? new Date(profile.startDate).toLocaleDateString('th-TH') : '']);
    } else if (userType === 'staff') {
      csvRows.push(['=== ข้อมูลเจ้าหน้าที่ ===']);
      csvRows.push(['รหัสเจ้าหน้าที่', profile.code || '']);
      csvRows.push(['ชื่อ', profile.firstName || '']);
      csvRows.push(['นามสกุล', profile.lastName || '']);
      csvRows.push(['เบอร์โทรศัพท์หลัก', profile.phone || '']);
      csvRows.push(['เบอร์โทรศัพท์อื่นๆ', profile.otherPhones ? 
        profile.otherPhones.map(item => `${item.name}: ${item.phone}`).join(', ') : '']);
      csvRows.push(['วันเกิด', profile.birthdate ? new Date(profile.birthdate).toLocaleDateString('th-TH') : '']);
      csvRows.push(['ศาสนา', profile.religion || '']);
      csvRows.push(['ประเภทพนักงาน', profile.employeeType || '']);
      csvRows.push(['ตำแหน่ง', profile.position || '']);
      csvRows.push(['หน่วยงาน', profile.department || '']);
      csvRows.push(['สถานที่ทำงาน', profile.workLocation || '']);
      csvRows.push(['วันที่เริ่มงาน', profile.startDate ? new Date(profile.startDate).toLocaleDateString('th-TH') : '']);
      csvRows.push(['หน้าที่ความรับผิดชอบ', profile.responsibilities || '']);
    }
    
    csvRows.push(['']);
    csvRows.push(['=== ข้อมูลการส่งออก ===']);
    csvRows.push(['วันที่ส่งออก', new Date(data.exportDate).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })]);
    csvRows.push(['ส่งออกโดย', data.exportedBy]);
    return csvRows.map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
  };

  const downloadCSV = (csvContent, filename) => {
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const getUserTypeDisplay = (userType) => {
    switch (userType) {
      case 'student': return 'นักเรียน/นักศึกษา';
      case 'teacher': return 'ครู/อาจารย์';
      case 'staff': return 'เจ้าหน้าที่';
      default: return 'ไม่ระบุ';
    }
  };

  return (
    <button 
      className={styles.exportButton}
      onClick={handleExport}
      disabled={isExporting}
    >
      {isExporting ? (
        <>
          <Loader size={16} className={styles.spinning} />
          กำลังส่งออก...
        </>
      ) : (
        <>
          <FileSpreadsheet size={16} />
          ส่งออก Excel
        </>
      )}
    </button>
  );
};

export default ExportExcelButton;