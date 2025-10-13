import { useState, useCallback } from 'react';

export const useFilters = (fetchStudents, rowsPerPage = 10) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [facultyFilter, setFacultyFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [academicYearFilter, setAcademicYearFilter] = useState('');
  const [studentYearFilter, setStudentYearFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [activityCompletionFilter, setActivityCompletionFilter] = useState('');
  const [sortBy, setSortBy] = useState('completedActivities');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'completedActivities', direction: 'asc' });

  const handleSort = useCallback((key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setSortBy(key);
    setSortOrder(direction);
  }, [sortConfig]);

  const getFilteredAndSortedStudents = useCallback((students) => {
    let filtered = [...students];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(student =>
        student.firstName?.toLowerCase().includes(query) ||
        student.lastName?.toLowerCase().includes(query) ||
        student.code?.toLowerCase().includes(query) ||
        student.email?.toLowerCase().includes(query) ||
        student.department?.toLowerCase().includes(query) ||
        student.faculty?.toLowerCase().includes(query) ||
        student.studentYear?.toString().includes(query) ||
        student.academicYear?.toString().includes(query)
      );
    }

    // Faculty filter
    if (facultyFilter) {
      filtered = filtered.filter(student => student.faculty === facultyFilter);
    }

    // Department filter
    if (departmentFilter) {
      filtered = filtered.filter(student => student.department === departmentFilter);
    }

    // Academic year filter
    if (academicYearFilter) {
      filtered = filtered.filter(student =>
        student.academicYear?.toString() === academicYearFilter
      );
    }

    // Student year filter
    if (studentYearFilter) {
      filtered = filtered.filter(student => student.studentYear === studentYearFilter);
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(student => {
        if (statusFilter === 'active') return student.isActive;
        if (statusFilter === 'inactive') return !student.isActive;
        return true;
      });
    }

    // Activity completion filter
    if (activityCompletionFilter) {
      filtered = filtered.filter(student => {
        const completed = student.completedActivities || 0;

        switch (activityCompletionFilter) {
          case 'complete':
            return completed >= 10;
          case 'incomplete':
            return completed < 10;
          case 'critical':
            return completed === 0;
          case 'veryLow':
            return completed >= 1 && completed <= 3;
          case 'low':
            return completed >= 4 && completed <= 6;
          case 'moderate':
            return completed >= 7 && completed <= 9;
          default:
            return true;
        }
      });
    }

    // Sorting
    if (sortBy) {
      filtered.sort((a, b) => {
        let aValue, bValue;

        switch (sortBy) {
          case 'name':
            aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
            bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
            break;
          case 'code':
            aValue = a.code || '';
            bValue = b.code || '';
            break;
          case 'email':
            aValue = a.email || '';
            bValue = b.email || '';
            break;
          case 'academicYear':
            aValue = a.academicYear || 0;
            bValue = b.academicYear || 0;
            break;
          case 'studentYear':
            aValue = a.studentYear || '';
            bValue = b.studentYear || '';
            break;
          case 'department':
            aValue = a.department || '';
            bValue = b.department || '';
            break;
          case 'faculty':
            aValue = a.faculty || '';
            bValue = b.faculty || '';
            break;
          case 'completedActivities':
            aValue = a.completedActivities || 0;
            bValue = b.completedActivities || 0;
            break;
          case 'regisTime':
            aValue = new Date(a.regisTime || 0);
            bValue = new Date(b.regisTime || 0);
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [
    searchQuery,
    facultyFilter,
    departmentFilter,
    academicYearFilter,
    studentYearFilter,
    statusFilter,
    activityCompletionFilter,
    sortBy,
    sortOrder
  ]);

  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setFacultyFilter('');
    setDepartmentFilter('');
    setAcademicYearFilter('');
    setStudentYearFilter('');
    setStatusFilter('');
    setActivityCompletionFilter('');
    setSortBy('completedActivities');
    setSortOrder('asc');
    setCurrentPage(1);
    setSortConfig({ key: 'completedActivities', direction: 'asc' });

    if (fetchStudents) {
      fetchStudents({ includeGraduated: false });
    }
  }, [fetchStudents]);

  const getFilterInfo = useCallback(() => {
    const info = {};
    if (searchQuery) info.search = searchQuery;
    if (facultyFilter) info.faculty = facultyFilter;
    if (departmentFilter) info.department = departmentFilter;
    if (academicYearFilter) info.academicYear = academicYearFilter;
    if (studentYearFilter) info.studentYear = studentYearFilter;
    if (statusFilter) info.status = statusFilter;
    if (activityCompletionFilter) info.activityCompletion = activityCompletionFilter;
    if (sortBy) {
      info.sortBy = sortBy;
      info.sortOrder = sortOrder;
    }
    return info;
  }, [
    searchQuery,
    facultyFilter,
    departmentFilter,
    academicYearFilter,
    studentYearFilter,
    statusFilter,
    activityCompletionFilter,
    sortBy,
    sortOrder
  ]);

  return {
    searchQuery,
    setSearchQuery,
    facultyFilter,
    setFacultyFilter,
    departmentFilter,
    setDepartmentFilter,
    academicYearFilter,
    setAcademicYearFilter,
    studentYearFilter,
    setStudentYearFilter,
    statusFilter,
    setStatusFilter,
    activityCompletionFilter,
    setActivityCompletionFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    currentPage,
    setCurrentPage,
    sortConfig,
    getFilteredAndSortedStudents,
    handleSort,
    resetFilters,
    getFilterInfo
  };
};