import { useState, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const useFilters = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [facultyFilter, setFacultyFilter] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();
  const location = useLocation();

  const getFilteredAndSortedDepartments = useCallback((departments) => {
    if (!Array.isArray(departments)) return [];
    
    const filtered = departments.filter(department => {
      if (!department) return false;

      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || [
        department.Department_Name,
        department.Faculty_Name
      ].some(field =>
        field && field.toString().toLowerCase().includes(query)
      );

      const matchesFaculty = !facultyFilter || department.Faculty_Name === facultyFilter;

      return matchesSearch && matchesFaculty;
    });

    if (!sortBy) return filtered;
    
    return [...filtered].sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'name':
          aValue = a.Department_Name.toLowerCase();
          bValue = b.Department_Name.toLowerCase();
          break;
        case 'faculty':
          aValue = a.Faculty_Name.toLowerCase();
          bValue = b.Faculty_Name.toLowerCase();
          break;
        case 'teachers':
          aValue = a.teacher_count || 0;
          bValue = b.teacher_count || 0;
          break;
        case 'students':
          aValue = a.student_count || 0;
          bValue = b.student_count || 0;
          break;
        default:
          return 0;
      }

      if (sortBy === 'teachers' || sortBy === 'students') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      } else {
        if (aValue < bValue) {
          return sortOrder === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortOrder === 'asc' ? 1 : -1;
        }
        return 0;
      }
    });
  }, [searchQuery, facultyFilter, sortBy, sortOrder]);

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
    setSortBy("");
    setSortOrder("asc");
    setCurrentPage(1);
    navigate({
      pathname: location.pathname,
      search: ""
    });
  }, [navigate, location.pathname]);

  const hasActiveFilters = useMemo(() => {
    return !!(searchQuery || facultyFilter || sortBy);
  }, [searchQuery, facultyFilter, sortBy]);

  const getFilterInfo = useCallback(() => ({
    คณะ: facultyFilter,
    คำค้นหา: searchQuery
  }), [facultyFilter, searchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    facultyFilter,
    setFacultyFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    currentPage,
    setCurrentPage,
    sortConfig,
    hasActiveFilters,
    getFilteredAndSortedDepartments,
    handleSort,
    resetFilters,
    getFilterInfo
  };
};