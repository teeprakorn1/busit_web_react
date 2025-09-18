import { utils, writeFileXLSX } from 'xlsx';

const createDepartmentData = (departments) => {
  return departments.map((dept, index) => ({
    "ลำดับ": index + 1,
    "รหัสสาขา": dept.Department_ID || 'N/A',
    "ชื่อสาขา": dept.Department_Name || 'N/A',
    "คณะ": dept.Faculty_Name || 'N/A',
    "จำนวนอาจารย์": dept.teacher_count || 0,
    "จำนวนนักศึกษา": dept.student_count || 0,
    "รวมบุคลากร": (dept.teacher_count || 0) + (dept.student_count || 0)
  }));
};

const createFacultySummaryData = (departments) => {
  const facultyStats = {};

  departments.forEach(dept => {
    const faculty = dept.Faculty_Name || 'ไม่ระบุคณะ';

    if (!facultyStats[faculty]) {
      facultyStats[faculty] = {
        departments: 0,
        teachers: 0,
        students: 0,
        total: 0
      };
    }

    facultyStats[faculty].departments++;
    facultyStats[faculty].teachers += dept.teacher_count || 0;
    facultyStats[faculty].students += dept.student_count || 0;
    facultyStats[faculty].total += (dept.teacher_count || 0) + (dept.student_count || 0);
  });

  return Object.entries(facultyStats).map(([faculty, stats]) => ({
    "คณะ": faculty,
    "จำนวนสาขา": stats.departments,
    "จำนวนอาจารย์": stats.teachers,
    "จำนวนนักศึกษา": stats.students,
    "รวมบุคลากร": stats.total,
    "อัตราส่วนอาจารย์/นักศึกษา": stats.students > 0 ? 
      `1:${Math.round(stats.students / stats.teachers)}` : 'N/A',
    "เปอร์เซ็นต์อาจารย์": stats.total > 0 ? 
      `${((stats.teachers / stats.total) * 100).toFixed(1)}%` : '0%',
    "เปอร์เซ็นต์นักศึกษา": stats.total > 0 ? 
      `${((stats.students / stats.total) * 100).toFixed(1)}%` : '0%'
  }));
};

const createDepartmentStatsData = (departments) => {
  const totalDepartments = departments.length;
  const totalTeachers = departments.reduce((sum, dept) => sum + (dept.teacher_count || 0), 0);
  const totalStudents = departments.reduce((sum, dept) => sum + (dept.student_count || 0), 0);
  const totalPersonnel = totalTeachers + totalStudents;
  const faculties = [...new Set(departments.map(d => d.Faculty_Name))].length;

  const maxTeachersDept = departments.reduce((max, dept) => 
    (dept.teacher_count || 0) > (max.teacher_count || 0) ? dept : max, departments[0]);
  const minTeachersDept = departments.reduce((min, dept) => 
    (dept.teacher_count || 0) < (min.teacher_count || 0) ? dept : min, departments[0]);
  const maxStudentsDept = departments.reduce((max, dept) => 
    (dept.student_count || 0) > (max.student_count || 0) ? dept : max, departments[0]);
  const minStudentsDept = departments.reduce((min, dept) => 
    (dept.student_count || 0) < (min.student_count || 0) ? dept : min, departments[0]);

  return [
    { "หัวข้อสถิติ": "จำนวนสาขาทั้งหมด", "ข้อมูล": totalDepartments },
    { "หัวข้อสถิติ": "จำนวนคณะทั้งหมด", "ข้อมูล": faculties },
    { "หัวข้อสถิติ": "จำนวนอาจารย์ทั้งหมด", "ข้อมูล": totalTeachers },
    { "หัวข้อสถิติ": "จำนวนนักศึกษาทั้งหมด", "ข้อมูล": totalStudents },
    { "หัวข้อสถิติ": "รวมบุคลากรทั้งหมด", "ข้อมูล": totalPersonnel },
    { "หัวข้อสถิติ": "อัตราส่วนอาจารย์/นักศึกษา", "ข้อมูล": totalStudents > 0 ? `1:${Math.round(totalStudents / totalTeachers)}` : 'N/A' },
    { "หัวข้อสถิติ": "ค่าเฉลี่ยอาจารย์ต่อสาขา", "ข้อมูล": (totalTeachers / totalDepartments).toFixed(1) },
    { "หัวข้อสถิติ": "ค่าเฉลี่ยนักศึกษาต่อสาขา", "ข้อมูล": (totalStudents / totalDepartments).toFixed(1) },
    { "หัวข้อสถิติ": "สาขาที่มีอาจารย์มากที่สุด", "ข้อมูล": `${maxTeachersDept?.Department_Name} (${maxTeachersDept?.teacher_count} คน)` },
    { "หัวข้อสถิติ": "สาขาที่มีอาจารย์น้อยที่สุด", "ข้อมูล": `${minTeachersDept?.Department_Name} (${minTeachersDept?.teacher_count} คน)` },
    { "หัวข้อสถิติ": "สาขาที่มีนักศึกษามากที่สุด", "ข้อมูล": `${maxStudentsDept?.Department_Name} (${maxStudentsDept?.student_count} คน)` },
    { "หัวข้อสถิติ": "สาขาที่มีนักศึกษาน้อยที่สุด", "ข้อมูล": `${minStudentsDept?.Department_Name} (${minStudentsDept?.student_count} คน)` }
  ];
};

const getColumnWidths = (type) => {
  switch (type) {
    case 'departments':
      return [
        { wch: 8 },
        { wch: 12 },
        { wch: 40 },
        { wch: 35 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 }
      ];
    case 'faculty':
      return [
        { wch: 35 },
        { wch: 12 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 20 },
        { wch: 15 },
        { wch: 15 }
      ];
    case 'stats':
      return [
        { wch: 30 },
        { wch: 40 }
      ];
    default:
      return [];
  }
};

export const exportFilteredDepartmentsToExcel = (departments, filterInfo, options = {}) => {
  try {
    if (!departments || departments.length === 0) {
      alert("ไม่มีข้อมูลสำหรับการ export");
      return false;
    }

    const {
      includeFacultySummary = true,
      includeStats = true,
      filename = null
    } = options;

    const wb = { SheetNames: [], Sheets: {} };

    const departmentsData = createDepartmentData(departments);
    const departmentsWs = utils.json_to_sheet(departmentsData);
    departmentsWs['!cols'] = getColumnWidths('departments');
    wb.SheetNames.push("รายชื่อสาขา");
    wb.Sheets["รายชื่อสาขา"] = departmentsWs;

    if (includeFacultySummary) {
      const facultyData = createFacultySummaryData(departments);
      if (facultyData.length > 0) {
        const facultyWs = utils.json_to_sheet(facultyData);
        facultyWs['!cols'] = getColumnWidths('faculty');
        wb.SheetNames.push("สรุปตามคณะ");
        wb.Sheets["สรุปตามคณะ"] = facultyWs;
      }
    }

    if (includeStats) {
      const statsData = createDepartmentStatsData(departments);
      if (statsData.length > 0) {
        const statsWs = utils.json_to_sheet(statsData);
        statsWs['!cols'] = getColumnWidths('stats');
        wb.SheetNames.push("สถิติรวม");
        wb.Sheets["สถิติรวม"] = statsWs;
      }
    }

    const now = new Date();
    const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
    
    let finalFilename = filename;
    if (!finalFilename) {
      const filterText = Object.entries(filterInfo || {})
        .filter(([key, value]) => value && value !== "")
        .map(([key, value]) => `${key}-${value}`)
        .join("_");
      
      finalFilename = `รายชื่อสาขา${filterText ? '_' + filterText : ''}_${timestamp}.xlsx`;
    }

    writeFileXLSX(wb, finalFilename);
    return true;
  } catch (error) {
    console.error('Export error:', error);
    alert('เกิดข้อผิดพลาดในการ export ไฟล์: ' + error.message);
    return false;
  }
};

export const exportBasicDepartmentsToExcel = (departments) => {
  return exportFilteredDepartmentsToExcel(departments, {}, {
    includeFacultySummary: false,
    includeStats: false,
    filename: `รายชื่อสาขา_พื้นฐาน_${new Date().toISOString().slice(0, 10)}.xlsx`
  });
};