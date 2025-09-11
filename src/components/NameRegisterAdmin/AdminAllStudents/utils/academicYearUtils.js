export const academicYearUtils = {
  convertToBuddhistYear: (christianYear) => {
    if (!christianYear) return null;
    const year = parseInt(christianYear);
    if (isNaN(year)) return null;
    return year + 543;
  },

  convertToChristianYear: (buddhistYear) => {
    if (!buddhistYear) return null;
    const year = parseInt(buddhistYear);
    if (isNaN(year)) return null;
    return year - 543;
  },

  generateAcademicYearOptions: (yearsBack = 10, yearsForward = 5) => {
    const currentYear = new Date().getFullYear();
    const years = [];
    
    for (let i = yearsBack; i >= 0; i--) {
      years.push(currentYear - i);
    }
    
    for (let i = 1; i <= yearsForward; i++) {
      years.push(currentYear + i);
    }
    
    return years;
  },

  calculateStudentYear: (academicYear, currentYear = null) => {
    if (!academicYear) return 'ไม่ระบุ';
    
    const currentYearToUse = currentYear || new Date().getFullYear();
    const entryYear = parseInt(academicYear);
    
    if (isNaN(entryYear)) return 'ไม่ระบุ';
    
    const yearDiff = currentYearToUse - entryYear;
    
    if (yearDiff < 0) return 'ยังไม่เริ่มเรียน';
    if (yearDiff === 0) return 'ปี 1';
    if (yearDiff === 1) return 'ปี 2';
    if (yearDiff === 2) return 'ปี 3';
    if (yearDiff === 3) return 'ปี 4';
    if (yearDiff >= 4 && yearDiff <= 6) return 'มากกว่าปี 4';
    if (yearDiff > 6) return 'เกินระยะเวลาปกติ';
    
    return `ปี ${yearDiff + 1}`;
  },

  calculateExpectedGraduationYear: (academicYear, programDuration = 4) => {
    if (!academicYear) return null;
    const entryYear = parseInt(academicYear);
    if (isNaN(entryYear)) return null;
    return entryYear + programDuration;
  },

  getStudentStatus: (academicYear, isGraduated = false, programDuration = 4) => {
    const currentYear = new Date().getFullYear();
    const entryYear = parseInt(academicYear);
    const expectedGradYear = academicYearUtils.calculateExpectedGraduationYear(entryYear, programDuration);
    const studentYear = academicYearUtils.calculateStudentYear(entryYear);
    const yearsDiff = currentYear - entryYear;

    let status = 'กำลังศึกษา';
    let statusType = 'normal';

    if (isGraduated) {
      status = 'สำเร็จการศึกษาแล้ว';
      statusType = 'graduated';
    } else if (yearsDiff < 0) {
      status = 'ยังไม่เริ่มเรียน';
      statusType = 'not_started';
    } else if (yearsDiff >= programDuration + 2) {
      status = 'ควรสำเร็จการศึกษาแล้ว';
      statusType = 'overdue';
    } else if (yearsDiff >= programDuration) {
      status = 'ใกล้ครบระยะเวลาการศึกษา';
      statusType = 'warning';
    }

    return {
      status,
      statusType,
      studentYear,
      expectedGraduationYear: expectedGradYear,
      yearsDiff,
      isOverdue: yearsDiff > programDuration && !isGraduated
    };
  },

  groupByAcademicYear: (students) => {
    const grouped = {};
    if (!Array.isArray(students)) return grouped;

    students.forEach(student => {
      const year = student.academicYear;
      if (!grouped[year]) {
        grouped[year] = [];
      }
      grouped[year].push(student);
    });
    return grouped;
  },

  groupByStudentYear: (students) => {
    const grouped = {};
    if (!Array.isArray(students)) return grouped;

    students.forEach(student => {
      const studentYear = academicYearUtils.calculateStudentYear(student.academicYear);
      if (!grouped[studentYear]) {
        grouped[studentYear] = [];
      }
      grouped[studentYear].push(student);
    });
    return grouped;
  },

  generateYearStatistics: (students) => {
    const stats = {};
    if (!Array.isArray(students)) return stats;

    students.forEach(student => {
      const year = student.academicYear;
      const studentYear = academicYearUtils.calculateStudentYear(year);
      const statusInfo = academicYearUtils.getStudentStatus(year, student.isGraduated);
      
      if (!stats[year]) {
        stats[year] = {
          total: 0,
          active: 0,
          inactive: 0,
          graduated: 0,
          notGraduated: 0,
          overdue: 0,
          yearLevel: studentYear,
          statusBreakdown: {
            normal: 0,
            warning: 0,
            overdue: 0,
            graduated: 0,
            not_started: 0
          }
        };
      }
      
      stats[year].total++;
      
      if (student.isActive) {
        stats[year].active++;
      } else {
        stats[year].inactive++;
      }
      
      if (student.isGraduated) {
        stats[year].graduated++;
      } else {
        stats[year].notGraduated++;
      }
      
      if (statusInfo.isOverdue) {
        stats[year].overdue++;
      }
      
      stats[year].statusBreakdown[statusInfo.statusType]++;
    });

    Object.keys(stats).forEach(year => {
      const yearStats = stats[year];
      yearStats.activePercentage = ((yearStats.active / yearStats.total) * 100).toFixed(1);
      yearStats.graduatedPercentage = ((yearStats.graduated / yearStats.total) * 100).toFixed(1);
      yearStats.overduePercentage = ((yearStats.overdue / yearStats.total) * 100).toFixed(1);
    });

    return stats;
  },

  formatAcademicYearDisplay: (year, showBuddhistYear = true, includeStudentYear = false) => {
    if (!year) return 'ไม่ระบุ';
    
    const christianYear = parseInt(year);
    if (isNaN(christianYear)) return 'ไม่ระบุ';
    
    const buddhistYear = academicYearUtils.convertToBuddhistYear(christianYear);
    let result = '';
    
    if (showBuddhistYear) {
      result = `${buddhistYear} (${christianYear})`;
    } else {
      result = `${christianYear} (${buddhistYear})`;
    }
    
    if (includeStudentYear) {
      const studentYear = academicYearUtils.calculateStudentYear(christianYear);
      result += ` - ${studentYear}`;
    }
    
    return result;
  },

  validateAcademicYear: (year) => {
    const currentYear = new Date().getFullYear();
    const yearNum = parseInt(year);
    
    if (isNaN(yearNum)) {
      return {
        isValid: false,
        message: 'ปีการศึกษาต้องเป็นตัวเลข'
      };
    }
    
    if (yearNum < 1900) {
      return {
        isValid: false,
        message: 'ปีการศึกษาต่ำเกินไป'
      };
    }
    
    if (yearNum > currentYear + 10) {
      return {
        isValid: false,
        message: 'ปีการศึกษาสูงเกินไป'
      };
    }
    
    return {
      isValid: true,
      message: 'ปีการศึกษาถูกต้อง'
    };
  },

  getYearRange: (students) => {
    if (!Array.isArray(students) || students.length === 0) {
      return {
        min: null,
        max: null,
        range: 0,
        years: []
      };
    }

    const years = students
      .map(s => parseInt(s.academicYear))
      .filter(year => !isNaN(year))
      .sort((a, b) => a - b);

    if (years.length === 0) {
      return {
        min: null,
        max: null,
        range: 0,
        years: []
      };
    }

    const uniqueYears = [...new Set(years)];
    
    return {
      min: years[0],
      max: years[years.length - 1],
      range: years[years.length - 1] - years[0] + 1,
      years: uniqueYears
    };
  },

  filterByYearCriteria: (students, criteria) => {
    if (!Array.isArray(students)) return [];

    const {
      academicYear,
      studentYear,
      yearRange,
      graduationStatus
    } = criteria;

    return students.filter(student => {
      if (academicYear && student.academicYear.toString() !== academicYear.toString()) {
        return false;
      }

      if (studentYear) {
        const calculatedYear = academicYearUtils.calculateStudentYear(student.academicYear);
        if (calculatedYear !== studentYear) {
          return false;
        }
      }

      if (yearRange) {
        const currentYear = new Date().getFullYear();
        const studentAcademicYear = parseInt(student.academicYear);
        const yearsDiff = currentYear - studentAcademicYear;
        
        switch (yearRange) {
          case 'current':
            if (studentAcademicYear !== currentYear) return false;
            break;
          case 'recent':
            if (yearsDiff > 2) return false;
            break;
          case 'old':
            if (yearsDiff <= 2) return false;
            break;
          case 'graduated_eligible':
            if (yearsDiff < 4) return false;
            break;
          default:
            break;
        }
      }

      if (graduationStatus !== undefined) {
        const statusInfo = academicYearUtils.getStudentStatus(
          student.academicYear, 
          student.isGraduated
        );
        
        switch (graduationStatus) {
          case 'graduated':
            if (!student.isGraduated) return false;
            break;
          case 'not_graduated':
            if (student.isGraduated) return false;
            break;
          case 'overdue':
            if (!statusInfo.isOverdue) return false;
            break;
          case 'normal':
            if (statusInfo.statusType !== 'normal') return false;
            break;
          default:
            break;
        }
      }

      return true;
    });
  }
};