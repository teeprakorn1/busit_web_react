import { useState, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { academicYearUtils } from '../utils/academicYearUtils';

export const useFilters = () => {
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [facultyFilter, setFacultyFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [academicYearFilter, setAcademicYearFilter] = useState("");
  const [yearRangeFilter, setYearRangeFilter] = useState("");
  const [studentYearFilter, setStudentYearFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();
  const location = useLocation();

  // Filter and sort students
  const getFilteredAndSortedStudents = useCallback((students) => {
    if (!Array.isArray(students)) return [];

    // Apply filters
    const filtered = academicYearUtils.filterByYearCriteria(students, {
      academicYear: academicYearFilter,
      studentYear: studentYearFilter,
      yearRange: yearRangeFilter
    }).filter(student => {
      if (!student) return false;

      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || [
        student.firstName,
        student.lastName,
        student.code,
        student.email,
        student.department,
        student.academicYear?.toString(),
        student.studentYear
      ].some(field =>
        field && field.toString().toLowerCase().includes(query)
      );

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

    // Apply sorting
    if (!sortBy) return filtered;

    return [...filtered].sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'name':
          aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
          bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
          break;
        case 'code':
          aValue = a.code;
          bValue = b.code;
          break;
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'academicYear':
          aValue = parseInt(a.academicYear);
          bValue = parseInt(b.academicYear);
          break;
        case 'studentYear':
          const getYearNumber = (yearStr) => {
            if (yearStr === 'ยังไม่เริ่มเรียน') return -1;
            if (yearStr === 'มากกว่าปี 4') return 5;
            const match = yearStr.match(/ปี (\d+)/);
            return match ? parseInt(match[1]) : 0;
          };
          aValue = getYearNumber(a.studentYear);
          bValue = getYearNumber(b.studentYear);
          break;
        case 'department':
          aValue = a.department.toLowerCase();
          bValue = b.department.toLowerCase();
          break;
        case 'faculty':
          aValue = a.faculty.toLowerCase();
          bValue = b.faculty.toLowerCase();
          break;
        case 'regisTime':
          aValue = new Date(a.regisTime);
          bValue = new Date(b.regisTime);
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
    studentYearFilter, yearRangeFilter, statusFilter, sortBy, sortOrder
  ]);

  // Sort configuration for table
  const sortConfig = useMemo(() => ({
    field: sortBy,
    direction: sortOrder
  }), [sortBy, sortOrder]);

  // Handle sort
  const handleSort = useCallback((field, direction) => {
    setSortBy(field);
    setSortOrder(direction);
  }, []);

  // Reset all filters
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
    setCurrentPage(1);
    navigate({
      pathname: location.pathname,
      search: ""
    });
  }, [navigate, location.pathname]);

  // Check if any filters are active
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

  // Get filter info for export
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
    // Filter states
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

    // Computed values
    sortConfig,
    hasActiveFilters,

    // Functions
    getFilteredAndSortedStudents,
    handleSort,
    resetFilters,
    getFilterInfo
  };
};