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

  const handleBulkApprove = useCallback(async (pictureIds = null) => {
    const idsToApprove = pictureIds || Array.from(selectedParticipants);
    
    if (idsToApprove.length === 0) {
      alert('กรุณาเลือกรายการที่ต้องการอนุมัติ');
      return;
    }

    const confirmed = window.confirm(
      `คุณต้องการอนุมัติรูปภาพ ${idsToApprove.length} รายการหรือไม่?`
    );

    if (!confirmed) return;

    try {
      setBulkApproving(true);

      const response = await axios.patch(
        getApiUrl('/api/registration-pictures/bulk-approve'),
        { pictureIds: idsToApprove },
        { withCredentials: true }
      );

      if (response.data?.status) {
        alert(response.data.message || 'อนุมัติสำเร็จ');
        if (refreshCallback) {
          await refreshCallback();
        }
      }
    } catch (err) {
      console.error('Bulk approve error:', err);
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาดในการอนุมัติ');
    } finally {
      setBulkApproving(false);
    }
  }, [selectedParticipants, refreshCallback]);

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

      // Note: สามารถสร้าง bulk reject endpoint ได้เหมือน bulk approve
      // ในที่นี้จะทำทีละรายการ
      const promises = idsToReject.map(id =>
        axios.patch(
          getApiUrl(`/api/registration-pictures/${id}/reject`),
          { reason: reason || 'ไม่ระบุเหตุผล' },
          { withCredentials: true }
        )
      );

      await Promise.all(promises);
      
      alert(`ปฏิเสธ ${idsToReject.length} รายการสำเร็จ`);
      
      if (refreshCallback) {
        await refreshCallback();
      }
    } catch (err) {
      console.error('Bulk reject error:', err);
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาดในการปฏิเสธ');
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

      await Promise.all(promises);
      
      alert(`เช็คอิน ${idsToCheckIn.length} คนสำเร็จ`);
      
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

      await Promise.all(promises);
      
      alert(`เช็คเอาท์ ${idsToCheckOut.length} คนสำเร็จ`);
      
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

      // Auto-size columns
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
      const filename = `รายชื่อผู้เข้าร่วม_${activityName}_${new Date().toLocaleDateString('th-TH')}.xlsx`;
      
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