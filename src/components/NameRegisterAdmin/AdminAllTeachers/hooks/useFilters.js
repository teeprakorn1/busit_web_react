import { useState, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const useFilters = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [facultyFilter, setFacultyFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [resignedFilter, setResignedFilter] = useState("active");
  const [deanFilter, setDeanFilter] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();
  const location = useLocation();

  const getFilteredAndSortedTeachers = useCallback((teachers) => {
    if (!Array.isArray(teachers)) return [];
    
    const filtered = teachers.filter(teacher => {
      if (!teacher) return false;

      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || [
        teacher.firstName,
        teacher.lastName,
        teacher.code,
        teacher.email,
        teacher.department,
        teacher.faculty
      ].some(field =>
        field && field.toString().toLowerCase().includes(query)
      );

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
          aValue = a.code;
          bValue = b.code;
          break;
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
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
    resignedFilter, deanFilter, sortBy, sortOrder
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
    setResignedFilter("active");
    setDeanFilter("");
    setSortBy("");
    setSortOrder("asc");
    setCurrentPage(1);
    navigate({
      pathname: location.pathname,
      search: ""
    });
  }, [navigate, location.pathname]);

  const hasActiveFilters = useMemo(() => {
    return !!(
      searchQuery || facultyFilter || departmentFilter ||
      statusFilter || (resignedFilter !== "active") || deanFilter || sortBy
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