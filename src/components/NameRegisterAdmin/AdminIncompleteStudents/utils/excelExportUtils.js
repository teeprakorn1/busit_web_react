import { utils, writeFileXLSX } from 'xlsx';
import { academicYearUtils } from './academicYearUtils';

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

const formatShortDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('th-TH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
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
    "กิจกรรมที่สำเร็จ": student.completedActivities !== undefined ? student.completedActivities : 0,
    "กิจกรรมที่ต้องทำ": 10,
    "กิจกรรมที่ยังขาด": Math.max(0, 10 - (student.completedActivities || 0)),
    "สถานะกิจกรรม": (student.completedActivities || 0) >= 10 ? "ครบแล้ว" : "ยังไม่ครบ",
    "ความคืบหน้า": `${Math.min(100, Math.round(((student.completedActivities || 0) / 10) * 100))}%`,
    "อีเมล": student.email || 'N/A',
    "เบอร์โทรศัพท์": student.phone || 'N/A',
    "อาจารย์ที่ปรึกษา": student.advisor || 'N/A',
    "วันเกิด": formatShortDate(student.birthdate),
    "ศาสนา": student.religion || 'N/A',
    "ปัญหาสุขภาพ": student.medicalProblem || 'ไม่มี',
    "วันที่เพิ่มในระบบ": formatDate(student.regisTime),
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
    "กิจกรรมเฉลี่ย": stats.avgActivities !== undefined ? stats.avgActivities.toFixed(1) : 'N/A',
    "นักศึกษากิจกรรมครบ": stats.studentsWithCompleteActivities || 0,
    "นักศึกษากิจกรรมไม่ครบ": stats.total - (stats.studentsWithCompleteActivities || 0),
    "เปอร์เซ็นต์การใช้งาน": `${((stats.active / stats.total) * 100).toFixed(1)}%`,
    "เปอร์เซ็นต์กิจกรรมครบ": `${(((stats.studentsWithCompleteActivities || 0) / stats.total) * 100).toFixed(1)}%`
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
        departments: new Set(),
        totalActivities: 0,
        completeActivities: 0
      };
    }
    
    const activities = student.completedActivities || 0;
    facultyStats[faculty].total++;
    if (student.isActive) facultyStats[faculty].active++;
    if (student.isGraduated) facultyStats[faculty].graduated++;
    facultyStats[faculty].departments.add(student.department);
    facultyStats[faculty].totalActivities += activities;
    if (activities >= 10) facultyStats[faculty].completeActivities++;
  });

  return Object.entries(facultyStats).map(([faculty, stats]) => ({
    "คณะ": faculty,
    "จำนวนสาขา": stats.departments.size,
    "จำนวนนักศึกษาทั้งหมด": stats.total,
    "จำนวนที่ใช้งาน": stats.active,
    "จำนวนที่ระงับ": stats.total - stats.active,
    "จำนวนที่สำเร็จการศึกษา": stats.graduated,
    "จำนวนที่ยังไม่สำเร็จการศึกษา": stats.total - stats.graduated,
    "กิจกรรมเฉลี่ย": (stats.totalActivities / stats.total).toFixed(1),
    "นักศึกษากิจกรรมครบ": stats.completeActivities,
    "นักศึกษากิจกรรมไม่ครบ": stats.total - stats.completeActivities,
    "เปอร์เซ็นต์การใช้งาน": `${((stats.active / stats.total) * 100).toFixed(1)}%`,
    "เปอร์เซ็นต์กิจกรรมครบ": `${((stats.completeActivities / stats.total) * 100).toFixed(1)}%`
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
        years: new Set(),
        totalActivities: 0,
        completeActivities: 0
      };
    }
    
    const activities = student.completedActivities || 0;
    deptStats[dept].total++;
    if (student.isActive) deptStats[dept].active++;
    if (student.isGraduated) deptStats[dept].graduated++;
    deptStats[dept].years.add(student.academicYear);
    deptStats[dept].totalActivities += activities;
    if (activities >= 10) deptStats[dept].completeActivities++;
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
    "กิจกรรมเฉลี่ย": (stats.totalActivities / stats.total).toFixed(1),
    "นักศึกษากิจกรรมครบ": stats.completeActivities,
    "นักศึกษากิจกรรมไม่ครบ": stats.total - stats.completeActivities,
    "เปอร์เซ็นต์การใช้งาน": `${((stats.active / stats.total) * 100).toFixed(1)}%`,
    "เปอร์เซ็นต์กิจกรรมครบ": `${((stats.completeActivities / stats.total) * 100).toFixed(1)}%`
  }));
};

const createActivityRangeData = (students) => {
  const ranges = {
    "0 กิจกรรม": 0,
    "1-3 กิจกรรม": 0,
    "4-6 กิจกรรม": 0,
    "7-9 กิจกรรม": 0,
    "10+ กิจกรรม (ครบ)": 0
  };

  students.forEach(student => {
    const activities = student.completedActivities || 0;
    if (activities === 0) ranges["0 กิจกรรม"]++;
    else if (activities <= 3) ranges["1-3 กิจกรรม"]++;
    else if (activities <= 6) ranges["4-6 กิจกรรม"]++;
    else if (activities <= 9) ranges["7-9 กิจกรรม"]++;
    else ranges["10+ กิจกรรม (ครบ)"]++;
  });

  return Object.entries(ranges).map(([range, count]) => ({
    "ช่วงจำนวนกิจกรรม": range,
    "จำนวนนักศึกษา": count,
    "เปอร์เซ็นต์": `${((count / students.length) * 100).toFixed(1)}%`
  }));
};

const getColumnWidths = (type) => {
  switch (type) {
    case 'students':
      return [
        { wch: 8 },   // ลำดับ
        { wch: 20 },  // รหัสนักศึกษา
        { wch: 15 },  // ชื่อ
        { wch: 15 },  // นามสกุล
        { wch: 35 },  // คณะ
        { wch: 25 },  // สาขา
        { wch: 15 },  // ปีการศึกษา (ค.ศ.)
        { wch: 15 },  // ปีการศึกษา (พ.ศ.)
        { wch: 12 },  // ชั้นปี
        { wch: 15 },  // กิจกรรมที่สำเร็จ
        { wch: 15 },  // กิจกรรมที่ต้องทำ
        { wch: 15 },  // กิจกรรมที่ยังขาด
        { wch: 15 },  // สถานะกิจกรรม
        { wch: 12 },  // ความคืบหน้า
        { wch: 30 },  // อีเมล
        { wch: 15 },  // เบอร์โทรศัพท์
        { wch: 25 },  // อาจารย์ที่ปรึกษา
        { wch: 15 },  // วันเกิด
        { wch: 12 },  // ศาสนา
        { wch: 20 },  // ปัญหาสุขภาพ
        { wch: 20 },  // วันที่เพิ่มในระบบ
        { wch: 20 },  // สำเร็จการศึกษา
        { wch: 12 }   // สถานะบัญชี
      ];
    case 'statistics':
      return [
        { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, 
        { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 25 },
        { wch: 15 }, { wch: 20 }, { wch: 25 }, { wch: 20 }, { wch: 22 }
      ];
    case 'faculty':
    case 'department':
      return [
        { wch: 35 }, { wch: 35 }, { wch: 15 }, { wch: 20 }, 
        { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 25 },
        { wch: 15 }, { wch: 20 }, { wch: 25 }, { wch: 20 }, { wch: 22 }
      ];
    case 'range':
      return [
        { wch: 25 }, { wch: 18 }, { wch: 15 }
      ];
    default:
      return [];
  }
};

const addSummarySheet = (wb, students) => {
  const total = students.length;
  const activeCount = students.filter(s => s.isActive).length;
  const graduatedCount = students.filter(s => s.isGraduated).length;
  const totalActivities = students.reduce((sum, s) => sum + (s.completedActivities || 0), 0);
  const avgActivities = total > 0 ? (totalActivities / total).toFixed(2) : 0;
  const completeCount = students.filter(s => (s.completedActivities || 0) >= 10).length;
  const incompleteCount = total - completeCount;

  const summaryData = [
    { "หัวข้อ": "จำนวนนักศึกษาทั้งหมด", "ค่า": total },
    { "หัวข้อ": "จำนวนที่ใช้งาน", "ค่า": activeCount },
    { "หัวข้อ": "จำนวนที่ระงับ", "ค่า": total - activeCount },
    { "หัวข้อ": "จำนวนที่สำเร็จการศึกษา", "ค่า": graduatedCount },
    { "หัวข้อ": "จำนวนที่ยังไม่สำเร็จการศึกษา", "ค่า": total - graduatedCount },
    { "หัวข้อ": "", "ค่า": "" },
    { "หัวข้อ": "กิจกรรมเฉลี่ยต่อคน", "ค่า": avgActivities },
    { "หัวข้อ": "นักศึกษากิจกรรมครบ (≥10)", "ค่า": completeCount },
    { "หัวข้อ": "นักศึกษากิจกรรมไม่ครบ (<10)", "ค่า": incompleteCount },
    { "หัวข้อ": "เปอร์เซ็นต์กิจกรรมครบ", "ค่า": `${((completeCount / total) * 100).toFixed(1)}%` },
    { "หัวข้อ": "เปอร์เซ็นต์กิจกรรมไม่ครบ", "ค่า": `${((incompleteCount / total) * 100).toFixed(1)}%` },
  ];

  const summaryWs = utils.json_to_sheet(summaryData);
  summaryWs['!cols'] = [{ wch: 30 }, { wch: 20 }];
  wb.SheetNames.unshift("สรุปภาพรวม");
  wb.Sheets["สรุปภาพรวม"] = summaryWs;
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
      includeActivityRange = true,
      includeSummary = true,
      filename = null
    } = options;

    const wb = { SheetNames: [], Sheets: {} };

    // เพิ่มแผ่นสรุปภาพรวม
    if (includeSummary) {
      addSummarySheet(wb, students);
    }

    // แผ่นรายชื่อนักศึกษา
    const studentsData = createStudentData(students);
    const studentsWs = utils.json_to_sheet(studentsData);
    studentsWs['!cols'] = getColumnWidths('students');
    wb.SheetNames.push("รายชื่อนักศึกษา");
    wb.Sheets["รายชื่อนักศึกษา"] = studentsWs;

    // แผ่นสถิติตามปีการศึกษา
    if (includeStatistics && yearStatistics && Object.keys(yearStatistics).length > 0) {
      const statsData = createStatisticsData(yearStatistics);
      if (statsData.length > 0) {
        const statsWs = utils.json_to_sheet(statsData);
        statsWs['!cols'] = getColumnWidths('statistics');
        wb.SheetNames.push("สถิติตามปีการศึกษา");
        wb.Sheets["สถิติตามปีการศึกษา"] = statsWs;
      }
    }

    // แผ่นสรุปตามคณะ
    if (includeFacultySummary) {
      const facultyData = createFacultySummaryData(students);
      if (facultyData.length > 0) {
        const facultyWs = utils.json_to_sheet(facultyData);
        facultyWs['!cols'] = getColumnWidths('faculty');
        wb.SheetNames.push("สรุปตามคณะ");
        wb.Sheets["สรุปตามคณะ"] = facultyWs;
      }
    }

    // แผ่นสรุปตามสาขา
    if (includeDepartmentSummary) {
      const deptData = createDepartmentSummaryData(students);
      if (deptData.length > 0) {
        const deptWs = utils.json_to_sheet(deptData);
        deptWs['!cols'] = getColumnWidths('department');
        wb.SheetNames.push("สรุปตามสาขา");
        wb.Sheets["สรุปตามสาขา"] = deptWs;
      }
    }

    // แผ่นกระจายตามช่วงกิจกรรม
    if (includeActivityRange) {
      const rangeData = createActivityRangeData(students);
      if (rangeData.length > 0) {
        const rangeWs = utils.json_to_sheet(rangeData);
        rangeWs['!cols'] = getColumnWidths('range');
        wb.SheetNames.push("กระจายตามช่วงกิจกรรม");
        wb.Sheets["กระจายตามช่วงกิจกรรม"] = rangeWs;
      }
    }

    // สร้างชื่อไฟล์
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
    const finalFilename = filename || `นักศึกษากิจกรรมไม่ครบ_${timestamp}.xlsx`;
    
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
    includeActivityRange: false,
    includeSummary: true,
    filename: `นักศึกษากิจกรรมไม่ครบ_พื้นฐาน_${new Date().toISOString().slice(0, 10)}.xlsx`
  });
};

export const exportStatisticsToExcel = (yearStatistics, students) => {
  if (!yearStatistics || Object.keys(yearStatistics).length === 0) {
    alert("ไม่มีข้อมูลสถิติสำหรับการ export");
    return false;
  }

  try {
    const wb = { SheetNames: [], Sheets: {} };
    
    // สรุปภาพรวม
    if (students && students.length > 0) {
      addSummarySheet(wb, students);
    }

    // สถิติตามปีการศึกษา
    const statsData = createStatisticsData(yearStatistics);
    const statsWs = utils.json_to_sheet(statsData);
    statsWs['!cols'] = getColumnWidths('statistics');
    wb.SheetNames.push("สถิติตามปีการศึกษา");
    wb.Sheets["สถิติตามปีการศึกษา"] = statsWs;

    if (students && students.length > 0) {
      // สถิติตามคณะ
      const facultyData = createFacultySummaryData(students);
      const facultyWs = utils.json_to_sheet(facultyData);
      facultyWs['!cols'] = getColumnWidths('faculty');
      wb.SheetNames.push("สถิติตามคณะ");
      wb.Sheets["สถิติตามคณะ"] = facultyWs;
      
      // สถิติตามสาขา
      const deptData = createDepartmentSummaryData(students);
      const deptWs = utils.json_to_sheet(deptData);
      deptWs['!cols'] = getColumnWidths('department');
      wb.SheetNames.push("สถิติตามสาขา");
      wb.Sheets["สถิติตามสาขา"] = deptWs;

      // กระจายตามช่วงกิจกรรม
      const rangeData = createActivityRangeData(students);
      const rangeWs = utils.json_to_sheet(rangeData);
      rangeWs['!cols'] = getColumnWidths('range');
      wb.SheetNames.push("กระจายตามช่วงกิจกรรม");
      wb.Sheets["กระจายตามช่วงกิจกรรม"] = rangeWs;
    }

    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `สถิตินักศึกษากิจกรรมไม่ครบ_${timestamp}.xlsx`;

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
  const filename = `นักศึกษากิจกรรมไม่ครบ_${filterText ? 'กรอง_' : ''}${timestamp}.xlsx`;

  return exportStudentsToExcel(students, yearStatistics, { filename });
};

export const exportIncompleteActivitiesOnly = (students, yearStatistics) => {
  const incompleteStudents = students.filter(s => (s.completedActivities || 0) < 10);
  
  if (incompleteStudents.length === 0) {
    alert("ไม่มีนักศึกษาที่กิจกรรมไม่ครบ");
    return false;
  }

  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `นักศึกษากิจกรรมไม่ครบเท่านั้น_${timestamp}.xlsx`;

  return exportStudentsToExcel(incompleteStudents, yearStatistics, { filename });
};