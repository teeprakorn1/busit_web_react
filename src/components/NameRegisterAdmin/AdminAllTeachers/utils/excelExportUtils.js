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

const createTeacherData = (teachers) => {
  return teachers.map((teacher, index) => ({
    "ลำดับ": index + 1,
    "รหัสอาจารย์": teacher.code || 'N/A',
    "ชื่อ": teacher.firstName || 'N/A',
    "นามสกุล": teacher.lastName || 'N/A',
    "คณะ": teacher.faculty || 'N/A',
    "สาขา": teacher.department || 'N/A',
    "ตำแหน่ง": teacher.isDean ? "คณบดี" : "อาจารย์",
    "อีเมล": teacher.email || 'N/A',
    "เบอร์โทรศัพท์": teacher.phone || 'N/A',
    "วันเกิด": teacher.birthdate ? formatDate(teacher.birthdate) : 'N/A',
    "ศาสนา": teacher.religion || 'N/A',
    "ปัญหาสุขภาพ": teacher.medicalProblem || 'ไม่มี',
    "วันที่เพิ่มในระบบ": teacher.regisTime ? formatDate(teacher.regisTime) : 'N/A',
    "สถานะการลาออก": teacher.isResigned ? "ลาออกแล้ว" : "ยังไม่ลาออก",
    "สถานะบัญชี": teacher.isActive ? "ใช้งาน" : "ระงับ"
  }));
};

const createFacultySummaryData = (teachers) => {
  const facultyStats = {};

  teachers.forEach(teacher => {
    const faculty = teacher.faculty || 'ไม่ระบุคณะ';

    if (!facultyStats[faculty]) {
      facultyStats[faculty] = {
        total: 0,
        active: 0,
        resigned: 0,
        dean: 0,
        departments: new Set()
      };
    }

    facultyStats[faculty].total++;
    if (teacher.isActive) facultyStats[faculty].active++;
    if (teacher.isResigned) facultyStats[faculty].resigned++;
    if (teacher.isDean) facultyStats[faculty].dean++;
    facultyStats[faculty].departments.add(teacher.department);
  });

  return Object.entries(facultyStats).map(([faculty, stats]) => ({
    "คณะ": faculty,
    "จำนวนสาขา": stats.departments.size,
    "จำนวนอาจารย์ทั้งหมด": stats.total,
    "จำนวนที่ใช้งาน": stats.active,
    "จำนวนที่ระงับ": stats.total - stats.active,
    "จำนวนคณบดี": stats.dean,
    "จำนวนที่ลาออก": stats.resigned,
    "จำนวนที่ยังไม่ลาออก": stats.total - stats.resigned,
    "เปอร์เซ็นต์การใช้งาน": `${((stats.active / stats.total) * 100).toFixed(1)}%`,
    "เปอร์เซ็นต์การลาออก": `${((stats.resigned / stats.total) * 100).toFixed(1)}%`
  }));
};

const createDepartmentSummaryData = (teachers) => {
  const deptStats = {};

  teachers.forEach(teacher => {
    const dept = teacher.department || 'ไม่ระบุสาขา';
    const faculty = teacher.faculty || 'ไม่ระบุคณะ';

    if (!deptStats[dept]) {
      deptStats[dept] = {
        faculty,
        total: 0,
        active: 0,
        resigned: 0,
        dean: 0
      };
    }

    deptStats[dept].total++;
    if (teacher.isActive) deptStats[dept].active++;
    if (teacher.isResigned) deptStats[dept].resigned++;
    if (teacher.isDean) deptStats[dept].dean++;
  });

  return Object.entries(deptStats).map(([dept, stats]) => ({
    "สาขา": dept,
    "คณะ": stats.faculty,
    "จำนวนอาจารย์ทั้งหมด": stats.total,
    "จำนวนที่ใช้งาน": stats.active,
    "จำนวนที่ระงับ": stats.total - stats.active,
    "จำนวนคณบดี": stats.dean,
    "จำนวนที่ลาออก": stats.resigned,
    "จำนวนที่ยังไม่ลาออก": stats.total - stats.resigned,
    "เปอร์เซ็นต์การใช้งาน": `${((stats.active / stats.total) * 100).toFixed(1)}%`,
    "เปอร์เซ็นต์การลาออก": `${((stats.resigned / stats.total) * 100).toFixed(1)}%`
  }));
};

const getColumnWidths = (type) => {
  switch (type) {
    case 'teachers':
      return [
        { wch: 8 },
        { wch: 20 },
        { wch: 15 },
        { wch: 15 },
        { wch: 35 },
        { wch: 25 },
        { wch: 12 },
        { wch: 30 },
        { wch: 15 },
        { wch: 15 },
        { wch: 12 },
        { wch: 20 },
        { wch: 20 },
        { wch: 20 },
        { wch: 12 }
      ];
    case 'faculty':
    case 'department':
      return [
        { wch: 35 }, { wch: 35 }, { wch: 15 }, { wch: 20 },
        { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 20 },
        { wch: 25 }, { wch: 20 }, { wch: 25 }
      ];
    default:
      return [];
  }
};

export const exportTeachersToExcel = (teachers, options = {}) => {
  try {
    if (!teachers || teachers.length === 0) {
      alert("ไม่มีข้อมูลสำหรับการ export");
      return false;
    }

    const {
      includeFacultySummary = true,
      includeDepartmentSummary = true,
      filename = null
    } = options;

    const wb = { SheetNames: [], Sheets: {} };
    const teachersData = createTeacherData(teachers);
    const teachersWs = utils.json_to_sheet(teachersData);
    teachersWs['!cols'] = getColumnWidths('teachers');
    wb.SheetNames.push("รายชื่ออาจารย์");
    wb.Sheets["รายชื่ออาจารย์"] = teachersWs;

    if (includeFacultySummary) {
      const facultyData = createFacultySummaryData(teachers);
      if (facultyData.length > 0) {
        const facultyWs = utils.json_to_sheet(facultyData);
        facultyWs['!cols'] = getColumnWidths('faculty');
        wb.SheetNames.push("สรุปตามคณะ");
        wb.Sheets["สรุปตามคณะ"] = facultyWs;
      }
    }

    if (includeDepartmentSummary) {
      const deptData = createDepartmentSummaryData(teachers);
      if (deptData.length > 0) {
        const deptWs = utils.json_to_sheet(deptData);
        deptWs['!cols'] = getColumnWidths('department');
        wb.SheetNames.push("สรุปตามสาขา");
        wb.Sheets["สรุปตามสาขา"] = deptWs;
      }
    }

    const now = new Date();
    const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
    const finalFilename = filename || `รายชื่ออาจารย์_${timestamp}.xlsx`;
    writeFileXLSX(wb, finalFilename);

    return true;
  } catch (error) {
    console.error('Export error:', error);
    alert('เกิดข้อผิดพลาดในการ export ไฟล์: ' + error.message);
    return false;
  }
};

export const exportBasicTeachersToExcel = (teachers) => {
  return exportTeachersToExcel(teachers, {
    includeFacultySummary: false,
    includeDepartmentSummary: false,
    filename: `รายชื่ออาจารย์_พื้นฐาน_${new Date().toISOString().slice(0, 10)}.xlsx`
  });
};

export const exportFilteredTeachersToExcel = (teachers, filterInfo) => {
  if (!teachers || teachers.length === 0) {
    alert("ไม่มีข้อมูลตามเงื่อนไขการกรองสำหรับการ export");
    return false;
  }

  const filterText = Object.entries(filterInfo)
    .filter(([key, value]) => value && value !== "")
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ");

  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `รายชื่ออาจารย์_${filterText ? 'กรอง_' : ''}${timestamp}.xlsx`;

  return exportTeachersToExcel(teachers, { filename });
};