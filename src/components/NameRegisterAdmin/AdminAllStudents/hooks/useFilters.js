import { useState, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { academicYearUtils } from '../utils/academicYearUtils';

export const useFilters = (fetchStudents, rowsPerPage = 10) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [facultyFilter, setFacultyFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [academicYearFilter, setAcademicYearFilter] = useState("");
  const [yearRangeFilter, setYearRangeFilter] = useState("");
  const [studentYearFilter, setStudentYearFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPageState] = useState(1);

  const navigate = useNavigate();
  const location = useLocation();

  const setCurrentPage = useCallback((page) => {
    setCurrentPageState(page);
  }, []);

  const matchesSearchQuery = useCallback((student, query) => {
    if (!query) return true;

    const searchTerms = query.toLowerCase().trim().split(/\s+/);
    const searchFields = [
      student.firstName?.toLowerCase() || '',
      student.lastName?.toLowerCase() || '',
      student.code?.toLowerCase() || '',
      student.email?.toLowerCase() || '',
      student.department?.toLowerCase() || '',
      student.faculty?.toLowerCase() || '',
      student.academicYear?.toString() || '',
      student.studentYear?.toLowerCase() || ''
    ];

    const firstName = student.firstName?.toLowerCase() || '';
    const lastName = student.lastName?.toLowerCase() || '';
    const nameVariations = [
      `${firstName} ${lastName}`.trim(),
      `${lastName} ${firstName}`.trim(),
      firstName,
      lastName
    ].filter(Boolean);

    searchFields.push(...nameVariations);
    return searchTerms.every(term =>
      searchFields.some(field => field.includes(term))
    );
  }, []);

  const getFilteredAndSortedStudents = useCallback((students) => {
    if (!Array.isArray(students)) return [];

    const filtered = academicYearUtils.filterByYearCriteria(students, {
      academicYear: academicYearFilter,
      studentYear: studentYearFilter,
      yearRange: yearRangeFilter
    }).filter(student => {
      if (!student) return false;

      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = matchesSearchQuery(student, query);

      const matchesFaculty = !facultyFilter || student.faculty === facultyFilter;
      const matchesDepartment = !departmentFilter || student.department === departmentFilter;

      let matchesStatus = true;
      if (statusFilter === 'active') {
        matchesStatus = student.isActive;
      } else if (statusFilter === 'inactive') {
        matchesStatus = !student.isActive;
      } else if (statusFilter === 'graduated') {
        matchesStatus = student.isGraduated;
      } else if (statusFilter === 'not_graduated') {
        matchesStatus = !student.isGraduated;
      }

      return matchesSearch && matchesFaculty && matchesDepartment && matchesStatus;
    });

    if (!sortBy) return filtered;
    return [...filtered].sort((a, b) => {
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
          aValue = (a.email || '').toLowerCase();
          bValue = (b.email || '').toLowerCase();
          break;
        case 'academicYear':
          aValue = parseInt(a.academicYear) || 0;
          bValue = parseInt(b.academicYear) || 0;
          break;
        case 'studentYear':
          const getYearNumber = (yearStr) => {
            if (yearStr === 'ยังไม่เริ่มเรียน') return -1;
            if (yearStr === 'มากกว่าปี 4') return 5;
            const match = yearStr?.match(/ปี (\d+)/);
            return match ? parseInt(match[1]) : 0;
          };
          aValue = getYearNumber(a.studentYear);
          bValue = getYearNumber(b.studentYear);
          break;
        case 'department':
          aValue = (a.department || '').toLowerCase();
          bValue = (b.department || '').toLowerCase();
          break;
        case 'faculty':
          aValue = (a.faculty || '').toLowerCase();
          bValue = (b.faculty || '').toLowerCase();
          break;
        case 'regisTime':
          aValue = new Date(a.regisTime || 0);
          bValue = new Date(b.regisTime || 0);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return sortOrder === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [
    searchQuery, facultyFilter, departmentFilter, academicYearFilter,
    studentYearFilter, yearRangeFilter, statusFilter, sortBy, sortOrder, matchesSearchQuery
  ]);

  const sortConfig = useMemo(() => ({
    field: sortBy,
    direction: sortOrder
  }), [sortBy, sortOrder]);

  const handleSort = useCallback((field, direction) => {
    setSortBy(field);
    setSortOrder(direction);
  }, []);

  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setFacultyFilter("");
    setDepartmentFilter("");
    setAcademicYearFilter("");
    setYearRangeFilter("");
    setStudentYearFilter("");
    setStatusFilter("");
    setSortBy("");
    setSortOrder("asc");
    setCurrentPageState(1);
    navigate({
      pathname: location.pathname,
      search: ""
    });
  }, [navigate, location.pathname]);

  const hasActiveFilters = useMemo(() => {
    return !!(
      searchQuery || facultyFilter || departmentFilter ||
      academicYearFilter || studentYearFilter || yearRangeFilter ||
      statusFilter || sortBy
    );
  }, [
    searchQuery, facultyFilter, departmentFilter, academicYearFilter,
    studentYearFilter, yearRangeFilter, statusFilter, sortBy
  ]);

  const getFilterInfo = useCallback(() => ({
    คณะ: facultyFilter,
    สาขา: departmentFilter,
    ปีการศึกษา: academicYearFilter,
    ชั้นปี: studentYearFilter,
    ช่วงปี: yearRangeFilter,
    สถานะ: statusFilter,
    คำค้นหา: searchQuery
  }), [
    facultyFilter, departmentFilter, academicYearFilter,
    studentYearFilter, yearRangeFilter, statusFilter, searchQuery
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
    yearRangeFilter,
    setYearRangeFilter,
    studentYearFilter,
    setStudentYearFilter,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    currentPage,
    setCurrentPage,
    sortConfig,
    hasActiveFilters,
    getFilteredAndSortedStudents,
    handleSort,
    resetFilters,
    getFilterInfo
  };
};