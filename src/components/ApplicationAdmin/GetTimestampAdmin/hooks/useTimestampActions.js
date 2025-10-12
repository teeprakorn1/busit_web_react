import { useCallback } from 'react';
import { utils, writeFileXLSX } from 'xlsx';

const formatDate = (date) => {
  return new Date(date).toLocaleString('th-TH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

const formatEventType = (eventType) => {
  if (!eventType) return 'Unknown';
  return eventType
    .replace(/^timestamp_/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
};

const getUserTypeDisplay = (userType) => {
  switch (userType) {
    case 'student': return 'นักเรียน/นักศึกษา';
    case 'teacher': return 'ครู/อาจารย์';
    case 'staff': return 'เจ้าหน้าที่';
    default: return 'ไม่ระบุ';
  }
};

const sanitizeIP = (ip) => {
  if (!ip) return 'N/A';
  const parts = ip.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.xxx.xxx`;
  }
  return ip;
};

const sanitizeUserAgent = (userAgent) => {
  if (!userAgent) return 'N/A';
  return userAgent.length > 50 ? userAgent.substring(0, 50) + '...' : userAgent;
};

export const useTimestampActions = () => {
  const exportToExcel = useCallback((filteredTimestamps, searchCriteria) => {
    try {
      if (!filteredTimestamps || filteredTimestamps.length === 0) {
        alert("ไม่มีข้อมูลสำหรับการ export");
        return;
      }

      const data = filteredTimestamps.map((ts, index) => ({
        "ลำดับ": index + 1,
        "ID": ts.Timestamp_ID || 'N/A',
        "อีเมล": ts.Users_Email || 'N/A',
        "ประเภทผู้ใช้": getUserTypeDisplay(ts.Users_Type),
        "ประเภทเหตุการณ์": formatEventType(ts.TimestampType_Name),
        "IP Address": sanitizeIP(ts.Timestamp_IP_Address),
        "User Agent": sanitizeUserAgent(ts.Timestamp_UserAgent),
        "วันที่/เวลา": ts.Timestamp_RegisTime ? formatDate(ts.Timestamp_RegisTime) : 'N/A',
        "ชื่อเหตุการณ์": ts.Timestamp_Name || 'N/A'
      }));

      const ws = utils.json_to_sheet(data);
      const colWidths = [
        { wch: 8 },
        { wch: 10 },
        { wch: 25 },
        { wch: 15 },
        { wch: 20 },
        { wch: 15 },
        { wch: 30 },
        { wch: 20 },
        { wch: 40 }
      ];
      ws['!cols'] = colWidths;

      const wb = { SheetNames: [], Sheets: {} };
      wb.SheetNames.push("Timestamps");
      wb.Sheets["Timestamps"] = ws;

      const now = new Date();
      const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;

      let filename = `Timestamps_${timestamp}.xlsx`;
      if (searchCriteria) {
        filename = `Timestamps_${searchCriteria.type}_${searchCriteria.value.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.xlsx`;
      }

      writeFileXLSX(wb, filename);
    } catch (err) {
      console.error('Export error:', err);
      alert('เกิดข้อผิดพลาดในการ export ไฟล์');
    }
  }, []);

  return {
    exportToExcel,
    formatDate,
    formatEventType,
    getUserTypeDisplay,
    sanitizeIP,
    sanitizeUserAgent
  };
};