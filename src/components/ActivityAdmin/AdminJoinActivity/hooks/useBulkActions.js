// hooks/useBulkActions.js
import { useState, useCallback } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

const getApiUrl = (endpoint) => {
  return `${process.env.REACT_APP_SERVER_PROTOCOL}${process.env.REACT_APP_SERVER_BASE_URL}${process.env.REACT_APP_SERVER_PORT}${endpoint}`;
};

export const useBulkActions = (selectedParticipants, selectedActivity, refreshCallback) => {
  const [bulkApproving, setBulkApproving] = useState(false);
  const [bulkRejecting, setBulkRejecting] = useState(false);
  const [bulkCheckingIn, setBulkCheckingIn] = useState(false);
  const [bulkCheckingOut, setBulkCheckingOut] = useState(false);

  const handleBulkApprove = useCallback(async (pictureIds = null, autoGenerateCertificate = true) => {
    const idsToApprove = pictureIds || Array.from(selectedParticipants);

    if (idsToApprove.length === 0) {
      alert('กรุณาเลือกรายการที่ต้องการอนุมัติ');
      return;
    }

    // Check if activity has template for certificate generation
    const hasTemplate = selectedActivity?.Template_ID;
    const shouldGenerateCert = hasTemplate && autoGenerateCertificate;

    let confirmMessage = `คุณต้องการอนุมัติรูปภาพ ${idsToApprove.length} รายการหรือไม่?`;
    if (shouldGenerateCert) {
      confirmMessage += '\n\n✅ ระบบจะสร้างเกียรติบัตรอัตโนมัติให้ผู้ที่ได้รับการอนุมัติ';
    } else if (!hasTemplate) {
      confirmMessage += '\n\n⚠️ กิจกรรมนี้ยังไม่มีเทมเพลตเกียรติบัตร จะไม่สร้างเกียรติบัตรอัตโนมัติ';
    }

    const confirmed = window.confirm(confirmMessage);
    if (!confirmed) return;

    try {
      setBulkApproving(true);

      const response = await axios.patch(
        getApiUrl('/api/registration-pictures/bulk-approve'),
        { 
          pictureIds: idsToApprove,
          autoGenerateCertificate: shouldGenerateCert
        },
        { withCredentials: true }
      );

      if (response.data?.status) {
        const approvedCount = response.data.data?.approved_count || 0;
        const skippedCount = response.data.data?.skipped_count || 0;
        const certificates = response.data.data?.certificates;

        let message = `✅ อนุมัติสำเร็จ ${approvedCount} รายการ`;
        
        if (skippedCount > 0) {
          message += `\n⚠️ ข้าม ${skippedCount} รายการที่ไม่สามารถอนุมัติได้`;
        }

        if (certificates) {
          message += `\n\n📜 สร้างเกียรติบัตร:`;
          message += `\n  • สำเร็จ: ${certificates.generated} ใบ`;
          if (certificates.skipped > 0) {
            message += `\n  • ข้าม: ${certificates.skipped} ใบ (มีอยู่แล้วหรือไม่มีเทมเพลต)`;
          }
          if (certificates.errors && certificates.errors.length > 0) {
            message += `\n  • ล้มเหลว: ${certificates.errors.length} ใบ`;
          }
        }

        alert(message);

        if (refreshCallback) {
          await refreshCallback();
        }
      }
    } catch (err) {
      console.error('Bulk approve error:', err);
      const errorMsg = err.response?.data?.message || 'เกิดข้อผิดพลาดในการอนุมัติ';
      alert('❌ ' + errorMsg);
    } finally {
      setBulkApproving(false);
    }
  }, [selectedParticipants, selectedActivity, refreshCallback]);

  const handleBulkReject = useCallback(async (pictureIds = null) => {
    const idsToReject = pictureIds || Array.from(selectedParticipants);

    if (idsToReject.length === 0) {
      alert('กรุณาเลือกรายการที่ต้องการปฏิเสธ');
      return;
    }

    const reason = window.prompt('กรุณาระบุเหตุผลในการปฏิเสธ (ถ้ามี):');
    if (reason === null) return;

    const confirmed = window.confirm(
      `คุณต้องการปฏิเสธรูปภาพ ${idsToReject.length} รายการหรือไม่?`
    );

    if (!confirmed) return;

    try {
      setBulkRejecting(true);

      const response = await axios.patch(
        getApiUrl('/api/registration-pictures/bulk-reject'),
        {
          pictureIds: idsToReject,
          reason: reason || 'ไม่ระบุเหตุผล'
        },
        { withCredentials: true }
      );

      if (response.data?.status) {
        const rejectedCount = response.data.data?.rejected_count || 0;
        const skippedCount = response.data.data?.skipped_count || 0;

        let message = `ปฏิเสธสำเร็จ ${rejectedCount} รายการ`;
        if (skippedCount > 0) {
          message += ` (ข้าม ${skippedCount} รายการที่ไม่สามารถปฏิเสธได้)`;
        }

        alert(message);

        if (refreshCallback) {
          await refreshCallback();
        }
      }
    } catch (err) {
      console.error('Bulk reject error:', err);
      const errorMsg = err.response?.data?.message || 'เกิดข้อผิดพลาดในการปฏิเสธ';
      alert(errorMsg);
    } finally {
      setBulkRejecting(false);
    }
  }, [selectedParticipants, refreshCallback]);

  const handleBulkCheckIn = useCallback(async (userIds = null) => {
    const idsToCheckIn = userIds || Array.from(selectedParticipants);

    if (idsToCheckIn.length === 0 || !selectedActivity) {
      alert('กรุณาเลือกรายการที่ต้องการเช็คอิน');
      return;
    }

    const confirmed = window.confirm(
      `คุณต้องการเช็คอิน ${idsToCheckIn.length} คนหรือไม่?`
    );

    if (!confirmed) return;

    try {
      setBulkCheckingIn(true);

      const promises = idsToCheckIn.map(userId =>
        axios.patch(
          getApiUrl(`/api/admin/activities/${selectedActivity.Activity_ID}/participants/${userId}/checkin`),
          {},
          { withCredentials: true }
        )
      );

      const results = await Promise.allSettled(promises);

      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const failCount = results.filter(r => r.status === 'rejected').length;

      if (successCount > 0) {
        let message = `เช็คอินสำเร็จ ${successCount} คน`;
        if (failCount > 0) {
          message += ` (ล้มเหลว ${failCount} คน)`;
        }
        alert(message);
      } else {
        alert('ไม่สามารถเช็คอินได้');
      }

      if (refreshCallback) {
        await refreshCallback();
      }
    } catch (err) {
      console.error('Bulk check-in error:', err);
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาดในการเช็คอิน');
    } finally {
      setBulkCheckingIn(false);
    }
  }, [selectedParticipants, selectedActivity, refreshCallback]);

  const handleBulkCheckOut = useCallback(async (userIds = null) => {
    const idsToCheckOut = userIds || Array.from(selectedParticipants);

    if (idsToCheckOut.length === 0 || !selectedActivity) {
      alert('กรุณาเลือกรายการที่ต้องการเช็คเอาท์');
      return;
    }

    const confirmed = window.confirm(
      `คุณต้องการเช็คเอาท์ ${idsToCheckOut.length} คนหรือไม่?`
    );

    if (!confirmed) return;

    try {
      setBulkCheckingOut(true);

      const promises = idsToCheckOut.map(userId =>
        axios.patch(
          getApiUrl(`/api/admin/activities/${selectedActivity.Activity_ID}/participants/${userId}/checkout`),
          {},
          { withCredentials: true }
        )
      );

      const results = await Promise.allSettled(promises);

      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const failCount = results.filter(r => r.status === 'rejected').length;

      if (successCount > 0) {
        let message = `เช็คเอาท์สำเร็จ ${successCount} คน`;
        if (failCount > 0) {
          message += ` (ล้มเหลว ${failCount} คน)`;
        }
        alert(message);
      } else {
        alert('ไม่สามารถเช็คเอาท์ได้');
      }

      if (refreshCallback) {
        await refreshCallback();
      }
    } catch (err) {
      console.error('Bulk check-out error:', err);
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาดในการเช็คเอาท์');
    } finally {
      setBulkCheckingOut(false);
    }
  }, [selectedParticipants, selectedActivity, refreshCallback]);

  const handleExportSelected = useCallback((participantsData) => {
    if (!participantsData || participantsData.length === 0) {
      alert('ไม่มีข้อมูลที่เลือกสำหรับการ Export');
      return;
    }

    try {
      const exportData = participantsData.map((p, index) => ({
        'ลำดับ': index + 1,
        'ชื่อ': p.FirstName || '',
        'นามสกุล': p.LastName || '',
        'รหัส': p.Code || '',
        'อีเมล': p.Users_Email || '',
        'ประเภท': p.isTeacher ? 'อาจารย์' : 'นักศึกษา',
        'สาขา': p.Department_Name || '',
        'คณะ': p.Faculty_Name || '',
        'วันที่ลงทะเบียน': p.Registration_RegisTime
          ? new Date(p.Registration_RegisTime).toLocaleString('th-TH')
          : '',
        'เช็คอิน': p.Registration_CheckInTime
          ? new Date(p.Registration_CheckInTime).toLocaleString('th-TH')
          : 'ยังไม่เช็คอิน',
        'เช็คเอาท์': p.Registration_CheckOutTime
          ? new Date(p.Registration_CheckOutTime).toLocaleString('th-TH')
          : 'ยังไม่เช็คเอาท์',
        'สถานะ': p.RegistrationStatus_Name || ''
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'ผู้เข้าร่วม');

      const maxWidth = exportData.reduce((w, r) => Math.max(w, r['ชื่อ']?.length || 0), 10);
      ws['!cols'] = [
        { wch: 8 },  // ลำดับ
        { wch: maxWidth + 5 },  // ชื่อ
        { wch: maxWidth + 5 },  // นามสกุล
        { wch: 15 }, // รหัส
        { wch: 25 }, // อีเมล
        { wch: 10 }, // ประเภท
        { wch: 30 }, // สาขา
        { wch: 30 }, // คณะ
        { wch: 20 }, // วันที่ลงทะเบียน
        { wch: 20 }, // เช็คอิน
        { wch: 20 }, // เช็คเอาท์
        { wch: 15 }  // สถานะ
      ];

      const activityName = selectedActivity?.Activity_Title || 'กิจกรรม';
      const timestamp = new Date().toLocaleDateString('th-TH').replace(/\//g, '-');
      const filename = `รายชื่อผู้เข้าร่วม_${activityName}_${timestamp}.xlsx`;

      XLSX.writeFile(wb, filename);
      alert(`Export สำเร็จ ${participantsData.length} รายการ`);
    } catch (err) {
      console.error('Export error:', err);
      alert('เกิดข้อผิดพลาดในการ Export');
    }
  }, [selectedActivity]);

  return {
    bulkApproving,
    bulkRejecting,
    bulkCheckingIn,
    bulkCheckingOut,
    handleBulkApprove,
    handleBulkReject,
    handleBulkCheckIn,
    handleBulkCheckOut,
    handleExportSelected
  };
};