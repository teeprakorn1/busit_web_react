import { utils, writeFileXLSX } from 'xlsx';
import { academicYearUtils } from './academicYearUtils';

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

const createStudentData = (students) => {
  return students.map((student, index) => ({
    "ลำดับ": index + 1,
    "รหัสนักศึกษา": student.code || 'N/A',
    "ชื่อ": student.firstName || 'N/A',
    "นามสกุล": student.lastName || 'N/A',
    "คณะ": student.faculty || 'N/A',
    "สาขา": student.department || 'N/A',
    "ปีการศึกษา (ค.ศ.)": student.academicYear || 'N/A',
    "ปีการศึกษา (พ.ศ.)": student.academicYearBuddhist || 'N/A',
    "ชั้นปี": student.studentYear || 'N/A',
    "อีเมล": student.email || 'N/A',
    "เบอร์โทรศัพท์": student.phone || 'N/A',
    "วันเกิด": student.birthdate ? formatDate(student.birthdate) : 'N/A',
    "ศาสนา": student.religion || 'N/A',
    "ปัญหาสุขภาพ": student.medicalProblem || 'ไม่มี',
    "วันที่เพิ่มในระบบ": student.regisTime ? formatDate(student.regisTime) : 'N/A',
    "สำเร็จการศึกษา": student.isGraduated ? "สำเร็จการศึกษา" : "ยังไม่สำเร็จการศึกษา",
    "สถานะบัญชี": student.isActive ? "ใช้งาน" : "ระงับ"
  }));
};

const createStatisticsData = (yearStatistics) => {
  return Object.entries(yearStatistics).map(([year, stats]) => ({
    "ปีการศึกษา (ค.ศ.)": year,
    "ปีการศึกษา (พ.ศ.)": academicYearUtils.convertToBuddhistYear(year),
    "ชั้นปี": stats.yearLevel,
    "จำนวนทั้งหมด": stats.total,
    "จำนวนที่ใช้งาน": stats.active,
    "จำนวนที่ระงับ": stats.total - stats.active,
    "จำนวนที่สำเร็จการศึกษา": stats.graduated,
    "จำนวนที่ยังไม่สำเร็จการศึกษา": stats.total - stats.graduated,
    "เปอร์เซ็นต์การใช้งาน": `${((stats.active / stats.total) * 100).toFixed(1)}%`,
    "เปอร์เซ็นต์การสำเร็จการศึกษา": `${((stats.graduated / stats.total) * 100).toFixed(1)}%`
  }));
};

const createFacultySummaryData = (students) => {
  const facultyStats = {};
  
  students.forEach(student => {
    const faculty = student.faculty || 'ไม่ระบุคณะ';
    
    if (!facultyStats[faculty]) {
      facultyStats[faculty] = {
        total: 0,
        active: 0,
        graduated: 0,
        departments: new Set()
      };
    }
    
    facultyStats[faculty].total++;
    if (student.isActive) facultyStats[faculty].active++;
    if (student.isGraduated) facultyStats[faculty].graduated++;
    facultyStats[faculty].departments.add(student.department);
  });

  return Object.entries(facultyStats).map(([faculty, stats]) => ({
    "คณะ": faculty,
    "จำนวนสาขา": stats.departments.size,
    "จำนวนนักศึกษาทั้งหมด": stats.total,
    "จำนวนที่ใช้งาน": stats.active,
    "จำนวนที่ระงับ": stats.total - stats.active,
    "จำนวนที่สำเร็จการศึกษา": stats.graduated,
    "จำนวนที่ยังไม่สำเร็จการศึกษา": stats.total - stats.graduated,
    "เปอร์เซ็นต์การใช้งาน": `${((stats.active / stats.total) * 100).toFixed(1)}%`,
    "เปอร์เซ็นต์การสำเร็จการศึกษา": `${((stats.graduated / stats.total) * 100).toFixed(1)}%`
  }));
};

const createDepartmentSummaryData = (students) => {
  const deptStats = {};
  
  students.forEach(student => {
    const dept = student.department || 'ไม่ระบุสาขา';
    const faculty = student.faculty || 'ไม่ระบุคณะ';
    
    if (!deptStats[dept]) {
      deptStats[dept] = {
        faculty,
        total: 0,
        active: 0,
        graduated: 0,
        years: new Set()
      };
    }
    
    deptStats[dept].total++;
    if (student.isActive) deptStats[dept].active++;
    if (student.isGraduated) deptStats[dept].graduated++;
    deptStats[dept].years.add(student.academicYear);
  });

  return Object.entries(deptStats).map(([dept, stats]) => ({
    "สาขา": dept,
    "คณะ": stats.faculty,
    "จำนวนปีการศึกษา": stats.years.size,
    "จำนวนนักศึกษาทั้งหมด": stats.total,
    "จำนวนที่ใช้งาน": stats.active,
    "จำนวนที่ระงับ": stats.total - stats.active,
    "จำนวนที่สำเร็จการศึกษา": stats.graduated,
    "จำนวนที่ยังไม่สำเร็จการศึกษา": stats.total - stats.graduated,
    "เปอร์เซ็นต์การใช้งาน": `${((stats.active / stats.total) * 100).toFixed(1)}%`,
    "เปอร์เซ็นต์การสำเร็จการศึกษา": `${((stats.graduated / stats.total) * 100).toFixed(1)}%`
  }));
};

const getColumnWidths = (type) => {
  switch (type) {
    case 'students':
      return [
        { wch: 8 },
        { wch: 20 },
        { wch: 15 },
        { wch: 15 },
        { wch: 35 },
        { wch: 25 },
        { wch: 15 },
        { wch: 15 },
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
    case 'statistics':
      return [
        { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, 
        { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 25 },
        { wch: 20 }, { wch: 25 }
      ];
    case 'faculty':
    case 'department':
      return [
        { wch: 35 }, { wch: 35 }, { wch: 15 }, { wch: 20 }, 
        { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 25 },
        { wch: 20 }, { wch: 25 }
      ];
    default:
      return [];
  }
};

export const exportStudentsToExcel = (students, yearStatistics, options = {}) => {
  try {
    if (!students || students.length === 0) {
      alert("ไม่มีข้อมูลสำหรับการ export");
      return false;
    }

    const {
      includeStatistics = true,
      includeFacultySummary = true,
      includeDepartmentSummary = true,
      filename = null
    } = options;

    const wb = { SheetNames: [], Sheets: {} };
    const studentsData = createStudentData(students);
    const studentsWs = utils.json_to_sheet(studentsData);
    studentsWs['!cols'] = getColumnWidths('students');
    wb.SheetNames.push("รายชื่อนักศึกษา");
    wb.Sheets["รายชื่อนักศึกษา"] = studentsWs;

    if (includeStatistics && yearStatistics && Object.keys(yearStatistics).length > 0) {
      const statsData = createStatisticsData(yearStatistics);
      if (statsData.length > 0) {
        const statsWs = utils.json_to_sheet(statsData);
        statsWs['!cols'] = getColumnWidths('statistics');
        wb.SheetNames.push("สถิติตามปีการศึกษา");
        wb.Sheets["สถิติตามปีการศึกษา"] = statsWs;
      }
    }

    if (includeFacultySummary) {
      const facultyData = createFacultySummaryData(students);
      if (facultyData.length > 0) {
        const facultyWs = utils.json_to_sheet(facultyData);
        facultyWs['!cols'] = getColumnWidths('faculty');
        wb.SheetNames.push("สรุปตามคณะ");
        wb.Sheets["สรุปตามคณะ"] = facultyWs;
      }
    }

    if (includeDepartmentSummary) {
      const deptData = createDepartmentSummaryData(students);
      if (deptData.length > 0) {
        const deptWs = utils.json_to_sheet(deptData);
        deptWs['!cols'] = getColumnWidths('department');
        wb.SheetNames.push("สรุปตามสาขา");
        wb.Sheets["สรุปตามสาขา"] = deptWs;
      }
    }

    const now = new Date();
    const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-
    ${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
    const finalFilename = filename || `รายชื่อนักศึกษา_${timestamp}.xlsx`;
    writeFileXLSX(wb, finalFilename);
    
    return true;
  } catch (error) {
    console.error('Export error:', error);
    alert('เกิดข้อผิดพลาดในการ export ไฟล์: ' + error.message);
    return false;
  }
};

export const exportBasicStudentsToExcel = (students) => {
  return exportStudentsToExcel(students, null, {
    includeStatistics: false,
    includeFacultySummary: false,
    includeDepartmentSummary: false,
    filename: `รายชื่อนักศึกษา_พื้นฐาน_${new Date().toISOString().slice(0, 10)}.xlsx`
  });
};

export const exportStatisticsToExcel = (yearStatistics, students) => {
  if (!yearStatistics || Object.keys(yearStatistics).length === 0) {
    alert("ไม่มีข้อมูลสถิติสำหรับการ export");
    return false;
  }

  try {
    const wb = { SheetNames: [], Sheets: {} };
    const statsData = createStatisticsData(yearStatistics);
    const statsWs = utils.json_to_sheet(statsData);
    statsWs['!cols'] = getColumnWidths('statistics');
    wb.SheetNames.push("สถิติตามปีการศึกษา");
    wb.Sheets["สถิติตามปีการศึกษา"] = statsWs;

    if (students && students.length > 0) {
      const facultyData = createFacultySummaryData(students);
      const facultyWs = utils.json_to_sheet(facultyData);
      facultyWs['!cols'] = getColumnWidths('faculty');
      wb.SheetNames.push("สถิติตามคณะ");
      wb.Sheets["สถิติตามคณะ"] = facultyWs;
      const deptData = createDepartmentSummaryData(students);
      const deptWs = utils.json_to_sheet(deptData);
      deptWs['!cols'] = getColumnWidths('department');
      wb.SheetNames.push("สถิติตามสาขา");
      wb.Sheets["สถิติตามสาขา"] = deptWs;
    }

    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `สถิตินักศึกษา_${timestamp}.xlsx`;

    writeFileXLSX(wb, filename);
    return true;
  } catch (error) {
    console.error('Export statistics error:', error);
    alert('เกิดข้อผิดพลาดในการ export สถิติ: ' + error.message);
    return false;
  }
};

export const exportFilteredStudentsToExcel = (students, filterInfo, yearStatistics) => {
  if (!students || students.length === 0) {
    alert("ไม่มีข้อมูลตามเงื่อนไขการกรองสำหรับการ export");
    return false;
  }

  const filterText = Object.entries(filterInfo)
    .filter(([key, value]) => value && value !== "")
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ");

  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `รายชื่อนักศึกษา_${filterText ? 'กรอง_' : ''}${timestamp}.xlsx`;

  return exportStudentsToExcel(students, yearStatistics, { filename });
};