import { useState, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const useFilters = (fetchTeachers, rowsPerPage = 10) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [facultyFilter, setFacultyFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [resignedFilter, setResignedFilter] = useState("all");
  const [deanFilter, setDeanFilter] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPageState] = useState(1);

  const navigate = useNavigate();
  const location = useLocation();
  const setCurrentPage = useCallback((page) => {
    setCurrentPageState(page);
  }, []);

  const matchesSearchQuery = useCallback((teacher, query) => {
    if (!query) return true;

    const searchTerms = query.toLowerCase().trim().split(/\s+/);
    const searchFields = [
      teacher.firstName?.toLowerCase() || '',
      teacher.lastName?.toLowerCase() || '',
      teacher.fullName?.toLowerCase() || '',
      teacher.code?.toLowerCase() || '',
      teacher.email?.toLowerCase() || '',
      teacher.department?.toLowerCase() || '',
      teacher.faculty?.toLowerCase() || ''
    ];

    const firstName = teacher.firstName?.toLowerCase() || '';
    const lastName = teacher.lastName?.toLowerCase() || '';
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

  const getFilteredAndSortedTeachers = useCallback((teachers) => {
    if (!Array.isArray(teachers)) return [];
    
    const filtered = teachers.filter(teacher => {
      if (!teacher) return false;

      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = matchesSearchQuery(teacher, query);
      const matchesFaculty = !facultyFilter || teacher.faculty === facultyFilter; 
      const matchesDepartment = !departmentFilter || teacher.department === departmentFilter;
      let matchesStatus = true;
      if (statusFilter === 'active') {
        matchesStatus = teacher.isActive;
      } else if (statusFilter === 'inactive') {
        matchesStatus = !teacher.isActive;
      }

      let matchesResigned = true;
      if (resignedFilter === 'active') {
        matchesResigned = !teacher.isResigned;
      } else if (resignedFilter === 'resigned') {
        matchesResigned = teacher.isResigned;
      }

      let matchesDean = true;
      if (deanFilter === 'dean') {
        matchesDean = teacher.isDean;
      } else if (deanFilter === 'regular') {
        matchesDean = !teacher.isDean;
      }

      return matchesSearch && matchesFaculty && matchesDepartment && 
             matchesStatus && matchesResigned && matchesDean;
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
          aValue = (a.code || '').toLowerCase();
          bValue = (b.code || '').toLowerCase();
          break;
        case 'email':
          aValue = (a.email || '').toLowerCase();
          bValue = (b.email || '').toLowerCase();
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
        case 'position':
          aValue = a.isDean ? 1 : 0;
          bValue = b.isDean ? 1 : 0;
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
    searchQuery, facultyFilter, departmentFilter, statusFilter, 
    resignedFilter, deanFilter, sortBy, sortOrder, matchesSearchQuery
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
    setStatusFilter("");
    setResignedFilter("all");
    setDeanFilter("");
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
      statusFilter || (resignedFilter !== "all") || deanFilter || sortBy
    );
  }, [
    searchQuery, facultyFilter, departmentFilter, statusFilter,
    resignedFilter, deanFilter, sortBy
  ]);

  const getFilterInfo = useCallback(() => ({
    คณะ: facultyFilter,
    สาขา: departmentFilter,
    สถานะ: statusFilter,
    การลาออก: resignedFilter === 'active' ? 'ยังไม่ลาออก' : 
              resignedFilter === 'resigned' ? 'ลาออกแล้ว' : 'ทั้งหมด',
    ตำแหน่ง: deanFilter === 'dean' ? 'คณบดี' : 
             deanFilter === 'regular' ? 'อาจารย์ทั่วไป' : '',
    คำค้นหา: searchQuery
  }), [
    facultyFilter, departmentFilter, statusFilter,
    resignedFilter, deanFilter, searchQuery
  ]);

  return {
    searchQuery,
    setSearchQuery,
    facultyFilter,
    setFacultyFilter,
    departmentFilter,
    setDepartmentFilter,
    statusFilter,
    setStatusFilter,
    resignedFilter,
    setResignedFilter,
    deanFilter,
    setDeanFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    currentPage,
    setCurrentPage,
    sortConfig,
    hasActiveFilters,
    getFilteredAndSortedTeachers,
    handleSort,
    resetFilters,
    getFilterInfo
  };
};