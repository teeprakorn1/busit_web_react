// hooks/useDataEditActions.js
import { useCallback } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

const getApiUrl = (endpoint) => {
  return `${process.env.REACT_APP_SERVER_PROTOCOL}${process.env.REACT_APP_SERVER_BASE_URL}${process.env.REACT_APP_SERVER_PORT}${endpoint}`;
};

export const useDataEditActions = () => {
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

  const formatSourceTable = (sourceTable) => {
    const tableMap = {
      'Student': 'นักเรียน',
      'Teacher': 'อาจารย์',
      'Staff': 'เจ้าหน้าที่',
      'Users': 'ผู้ใช้',
      'Activity': 'กิจกรรม'
    };
    return tableMap[sourceTable] || sourceTable || 'N/A';
  };

  const insertDataEdit = useCallback(async (dataEditData) => {
    try {
      const response = await axios.post(
        getApiUrl(process.env.REACT_APP_API_DATAEDIT_INSERT),
        dataEditData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: response.data.status,
        message: response.data.message,
        data: response.data
      };
    } catch (error) {
      console.error('Insert DataEdit error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
        error: error.response?.data
      };
    }
  }, []);

  const searchStaff = useCallback(async (searchParams) => {
    try {
      const params = new URLSearchParams();
      
      if (searchParams.email) params.append('email', searchParams.email);
      if (searchParams.staff_code) params.append('staff_code', searchParams.staff_code);
      if (searchParams.ip) params.append('ip', searchParams.ip);

      const response = await axios.get(
        getApiUrl(`${process.env.REACT_APP_API_STAFF_SEARCH}?${params.toString()}`),
        {
          withCredentials: true,
          headers: {
            'Cache-Control': 'no-cache'
          }
        }
      );

      return {
        success: response.data.status,
        staff: response.data.staff,
        totalStaff: response.data.totalStaff,
        message: response.data.message
      };
    } catch (error) {
      console.error('Search Staff error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการค้นหาเจ้าหน้าที่',
        error: error.response?.data
      };
    }
  }, []);

  const exportToExcel = useCallback((dataEdits, searchCriteria = null) => {
    try {
      if (!Array.isArray(dataEdits) || dataEdits.length === 0) {
        throw new Error('ไม่มีข้อมูลสำหรับการส่งออก');
      }

      // Prepare data for export
      const exportData = dataEdits.map((de, index) => ({
        'ลำดับ': index + 1,
        'รหัสการแก้ไข': de.DataEdit_ID || 'N/A',
        'รหัสข้อมูลที่แก้ไข': de.DataEdit_ThisId || 'N/A',
        'ตารางที่มา': formatSourceTable(de.DataEdit_SourceTable),
        'รหัสเจ้าหน้าที่': de.Staff_Code || 'N/A',
        'ชื่อ': de.Staff_FirstName || 'N/A',
        'นามสกุล': de.Staff_LastName || 'N/A',
        'อีเมล': de.Users_Email || 'N/A',
        'ประเภทการแก้ไข': formatEditType(de.DataEditType_Name),
        'รายละเอียด': de.DataEdit_Name || 'ไม่มีรายละเอียด',
        'IP Address': de.DataEdit_IP_Address || 'N/A',
        'วันที่/เวลา': formatDate(de.DataEdit_RegisTime),
        'User Agent': de.DataEdit_UserAgent || 'N/A'
      }));

      // Create workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Auto-size columns
      const colWidths = [
        { wch: 8 },   // ลำดับ
        { wch: 15 },  // รหัสการแก้ไข
        { wch: 18 },  // รหัสข้อมูลที่แก้ไข
        { wch: 15 },  // ตารางที่มา
        { wch: 18 },  // รหัสเจ้าหน้าที่
        { wch: 20 },  // ชื่อ
        { wch: 20 },  // นามสกุล
        { wch: 30 },  // อีเมล
        { wch: 25 },  // ประเภทการแก้ไข
        { wch: 35 },  // รายละเอียด
        { wch: 18 },  // IP Address
        { wch: 22 },  // วันที่/เวลา
        { wch: 50 }   // User Agent
      ];
      ws['!cols'] = colWidths;

      // Add header styling
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

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'ประวัติการแก้ไขบัญชี');

      // Generate filename
      const now = new Date();
      const dateStr = now.toLocaleDateString('th-TH').replace(/\//g, '-');
      const timeStr = now.toLocaleTimeString('th-TH', { hour12: false }).replace(/:/g, '-');
      
      let filename = `ประวัติการแก้ไขบัญชี_${dateStr}_${timeStr}`;
      
      if (searchCriteria) {
        const searchType = searchCriteria.type === 'email' ? 'อีเมล' : 
                          searchCriteria.type === 'staff_code' ? 'รหัสเจ้าหน้าที่' : 'IP';
        const cleanValue = searchCriteria.value.replace(/[<>:"/\\|?*]/g, '_');
        filename += `_${searchType}_${cleanValue}`;
      }
      
      filename += '.xlsx';

      // Save file
      XLSX.writeFile(wb, filename);

      return {
        success: true,
        filename,
        recordCount: dataEdits.length
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
    insertDataEdit,
    searchStaff,
    formatEditType,
    formatDate,
    formatSourceTable
  };
};