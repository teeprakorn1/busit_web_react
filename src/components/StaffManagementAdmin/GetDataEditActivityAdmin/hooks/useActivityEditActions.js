// hooks/useActivityEditActions.js
import { useCallback } from 'react';
import * as XLSX from 'xlsx';

export const useActivityEditActions = () => {
  const formatEditType = (editType) => {
    if (!editType) return 'Unknown';
    return editType
      .replace(/^dataedit_/, '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('th-TH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const exportToExcel = useCallback((activityEdits, searchCriteria = null) => {
    try {
      if (!Array.isArray(activityEdits) || activityEdits.length === 0) {
        throw new Error('ไม่มีข้อมูลสำหรับการส่งออก');
      }

      const exportData = activityEdits.map((ae, index) => ({
        'ลำดับ': index + 1,
        'รหัสการแก้ไข': ae.DataEdit_ID || 'N/A',
        'รหัสกิจกรรม': ae.DataEdit_ThisId || 'N/A',
        'ชื่อกิจกรรม': ae.Activity_Title || 'N/A',
        'คำอธิบายกิจกรรม': ae.Activity_Description || 'N/A',
        'ประเภทกิจกรรม': ae.ActivityType_Name || 'N/A',
        'สถานะกิจกรรม': ae.ActivityStatus_Name || 'N/A',
        'วันเริ่มกิจกรรม': ae.Activity_StartTime ? formatDate(ae.Activity_StartTime) : 'N/A',
        'วันสิ้นสุดกิจกรรม': ae.Activity_EndTime ? formatDate(ae.Activity_EndTime) : 'N/A',
        'สถานที่': ae.Activity_LocationDetail || 'N/A',
        'กิจกรรมบังคับ': ae.Activity_IsRequire ? 'ใช่' : 'ไม่',
        'รหัสเจ้าหน้าที่': ae.Staff_Code || 'N/A',
        'ชื่อเจ้าหน้าที่': ae.Staff_FirstName || 'N/A',
        'นามสกุลเจ้าหน้าที่': ae.Staff_LastName || 'N/A',
        'เบอร์โทรเจ้าหน้าที่': ae.Staff_Phone || 'N/A',
        'อีเมลเจ้าหน้าที่': ae.Users_Email || 'N/A',
        'ประเภทการแก้ไข': formatEditType(ae.DataEditType_Name),
        'รายละเอียดการแก้ไข': ae.DataEdit_Name || 'ไม่มีรายละเอียด',
        'IP Address': ae.DataEdit_IP_Address || 'N/A',
        'วันที่/เวลาแก้ไข': formatDate(ae.DataEdit_RegisTime),
        'User Agent': ae.DataEdit_UserAgent || 'N/A'
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      const colWidths = [
        { wch: 8 },
        { wch: 15 },
        { wch: 15 },
        { wch: 35 },
        { wch: 40 },
        { wch: 25 },
        { wch: 20 },
        { wch: 22 },
        { wch: 22 },
        { wch: 30 },
        { wch: 15 },
        { wch: 18 },
        { wch: 20 },
        { wch: 20 },
        { wch: 15 },
        { wch: 30 },
        { wch: 25 },
        { wch: 35 },
        { wch: 18 },
        { wch: 22 },
        { wch: 50 }
      ];
      ws['!cols'] = colWidths;
      const headerRange = XLSX.utils.decode_range(ws['!ref']);
      for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!ws[cellAddress]) continue;
        ws[cellAddress].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "2563EB" } },
          alignment: { horizontal: "center", vertical: "center" }
        };
      }
      XLSX.utils.book_append_sheet(wb, ws, 'ประวัติการแก้ไขกิจกรรม');

      const now = new Date();
      const dateStr = now.toLocaleDateString('th-TH').replace(/\//g, '-');
      const timeStr = now.toLocaleTimeString('th-TH', { hour12: false }).replace(/:/g, '-');

      let filename = `ประวัติการแก้ไขกิจกรรม_${dateStr}_${timeStr}`;

      if (searchCriteria) {
        const searchType = searchCriteria.type === 'activity_id' ? 'รหัสกิจกรรม' :
          searchCriteria.type === 'activity_title' ? 'ชื่อกิจกรรม' :
            searchCriteria.type === 'staff_code' ? 'รหัสเจ้าหน้าที่' : 'อีเมล';
        const cleanValue = searchCriteria.value.replace(/[<>:"/\\|?*]/g, '_');
        filename += `_${searchType}_${cleanValue}`;
      }

      filename += '.xlsx';
      XLSX.writeFile(wb, filename);

      return {
        success: true,
        filename,
        recordCount: activityEdits.length
      };
    } catch (error) {
      console.error('Export error:', error);
      return {
        success: false,
        error: error.message || 'เกิดข้อผิดพลาดในการส่งออกข้อมูล'
      };
    }
  }, []);

  return {
    exportToExcel,
    formatEditType,
    formatDate
  };
};