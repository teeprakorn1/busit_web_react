// utils/activityExportUtils.js
import { utils, writeFileXLSX } from 'xlsx';

const formatDate = (date) => {
  return new Date(date).toLocaleString('th-TH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const exportActivitiesToExcel = (activities) => {
  try {
    if (!activities || activities.length === 0) {
      alert("ไม่มีข้อมูลสำหรับการ export");
      return false;
    }

    const data = activities.map((activity, index) => ({
      "ลำดับ": index + 1,
      "ชื่อกิจกรรม": activity.title || 'N/A',
      "ประเภท": activity.typeName || 'N/A',
      "สถานะ": activity.statusName || 'N/A',
      "วันที่เริ่ม": formatDate(activity.startTime),
      "วันที่สิ้นสุด": formatDate(activity.endTime),
      "สถานที่": activity.locationDetail || 'N/A',
      "บังคับเข้าร่วม": activity.isRequire ? "ใช่" : "ไม่",
      "วันที่สร้าง": formatDate(activity.regisTime)
    }));

    const wb = utils.book_new();
    const ws = utils.json_to_sheet(data);

    ws['!cols'] = [
      { wch: 8 },
      { wch: 40 },
      { wch: 25 },
      { wch: 15 },
      { wch: 20 },
      { wch: 20 },
      { wch: 30 },
      { wch: 15 },
      { wch: 20 }
    ];

    utils.book_append_sheet(wb, ws, "กิจกรรม");

    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `รายการกิจกรรม_${timestamp}.xlsx`;

    writeFileXLSX(wb, filename);
    return true;
  } catch (error) {
    console.error('Export error:', error);
    alert('เกิดข้อผิดพลาดในการ export ไฟล์');
    return false;
  }
};