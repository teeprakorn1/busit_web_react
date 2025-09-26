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

const createStaffData = (staff) => {
  return staff.map((member, index) => ({
    "ลำดับ": index + 1,
    "รหัสเจ้าหน้าที่": member.code || 'N/A',
    "ชื่อ": member.firstName || 'N/A',
    "นามสกุล": member.lastName || 'N/A',
    "อีเมล": member.email || 'N/A',
    "เบอร์โทรศัพท์": member.phone || 'N/A',
    "วันที่เพิ่มในระบบ": member.regisTime ? formatDate(member.regisTime) : 'N/A',
    "สถานะการลาออก": member.isResigned ? "ลาออกแล้ว" : "ยังไม่ลาออก",
    "สถานะบัญชี": member.isActive ? "ใช้งาน" : "ระงับ",
    "ชื่อผู้ใช้": member.username || 'N/A',
    "วันที่สร้างบัญชี": member.userRegisTime ? formatDate(member.userRegisTime) : 'N/A'
  }));
};

const createStaffSummaryData = (staff) => {
  const totalStaff = staff.length;
  const activeStaff = staff.filter(s => s.isActive).length;
  const inactiveStaff = totalStaff - activeStaff;
  const resignedStaff = staff.filter(s => s.isResigned).length;
  const notResignedStaff = totalStaff - resignedStaff;

  return [{
    "รายการ": "สรุปข้อมูลเจ้าหน้าที่ทั้งหมด",
    "จำนวนเจ้าหน้าที่ทั้งหมด": totalStaff,
    "จำนวนที่ใช้งาน": activeStaff,
    "จำนวนที่ระงับ": inactiveStaff,
    "จำนวนที่ลาออก": resignedStaff,
    "จำนวนที่ยังไม่ลาออก": notResignedStaff,
    "เปอร์เซ็นต์การใช้งาน": totalStaff > 0 ? `${((activeStaff / totalStaff) * 100).toFixed(1)}%` : '0%',
    "เปอร์เซ็นต์การลาออก": totalStaff > 0 ? `${((resignedStaff / totalStaff) * 100).toFixed(1)}%` : '0%'
  }];
};

const getColumnWidths = (type) => {
  switch (type) {
    case 'staff':
      return [
        { wch: 8 },  // ลำดับ
        { wch: 20 }, // รหัสเจ้าหน้าที่
        { wch: 15 }, // ชื่อ
        { wch: 15 }, // นามสกุล
        { wch: 30 }, // อีเมล
        { wch: 15 }, // เบอร์โทรศัพท์
        { wch: 20 }, // วันที่เพิ่มในระบบ
        { wch: 20 }, // สถานะการลาออก
        { wch: 12 }, // สถานะบัญชี
        { wch: 20 }, // ชื่อผู้ใช้
        { wch: 20 }  // วันที่สร้างบัญชี
      ];
    case 'summary':
      return [
        { wch: 35 }, // รายการ
        { wch: 20 }, // จำนวนเจ้าหน้าที่ทั้งหมด
        { wch: 15 }, // จำนวนที่ใช้งาน
        { wch: 15 }, // จำนวนที่ระงับ
        { wch: 15 }, // จำนวนที่ลาออก
        { wch: 20 }, // จำนวนที่ยังไม่ลาออก
        { wch: 20 }, // เปอร์เซ็นต์การใช้งาน
        { wch: 20 }  // เปอร์เซ็นต์การลาออก
      ];
    default:
      return [];
  }
};

export const exportStaffToExcel = (staff, options = {}) => {
  try {
    if (!staff || staff.length === 0) {
      alert("ไม่มีข้อมูลสำหรับการ export");
      return false;
    }

    const {
      includeSummary = true,
      filename = null
    } = options;

    const wb = { SheetNames: [], Sheets: {} };
    const staffData = createStaffData(staff);
    const staffWs = utils.json_to_sheet(staffData);
    staffWs['!cols'] = getColumnWidths('staff');
    wb.SheetNames.push("รายชื่อเจ้าหน้าที่");
    wb.Sheets["รายชื่อเจ้าหน้าที่"] = staffWs;

    if (includeSummary) {
      const summaryData = createStaffSummaryData(staff);
      if (summaryData.length > 0) {
        const summaryWs = utils.json_to_sheet(summaryData);
        summaryWs['!cols'] = getColumnWidths('summary');
        wb.SheetNames.push("สรุปข้อมูล");
        wb.Sheets["สรุปข้อมูล"] = summaryWs;
      }
    }

    const now = new Date();
    const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
    const finalFilename = filename || `รายชื่อเจ้าหน้าที่_${timestamp}.xlsx`;
    writeFileXLSX(wb, finalFilename);

    return true;
  } catch (error) {
    console.error('Export error:', error);
    alert('เกิดข้อผิดพลาดในการ export ไฟล์: ' + error.message);
    return false;
  }
};

export const exportBasicStaffToExcel = (staff) => {
  return exportStaffToExcel(staff, {
    includeSummary: false,
    filename: `รายชื่อเจ้าหน้าที่_พื้นฐาน_${new Date().toISOString().slice(0, 10)}.xlsx`
  });
};

export const exportFilteredStaffToExcel = (staff, filterInfo) => {
  if (!staff || staff.length === 0) {
    alert("ไม่มีข้อมูลตามเงื่อนไขการกรองสำหรับการ export");
    return false;
  }

  const filterText = Object.entries(filterInfo)
    .filter(([key, value]) => value && value !== "")
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ");

  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `รายชื่อเจ้าหน้าที่_${filterText ? 'กรอง_' : ''}${timestamp}.xlsx`;

  return exportStaffToExcel(staff, { filename });
};