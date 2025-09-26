import { useState, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const useFilters = (fetchStaff, rowsPerPage = 10) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [resignedFilter, setResignedFilter] = useState("all");
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPageState] = useState(1);

  const navigate = useNavigate();
  const location = useLocation();
  
  const setCurrentPage = useCallback((page) => {
    setCurrentPageState(page);
  }, []);

  const matchesSearchQuery = useCallback((staff, query) => {
    if (!query) return true;

    const searchTerms = query.toLowerCase().trim().split(/\s+/);
    const searchFields = [
      staff.firstName?.toLowerCase() || '',
      staff.lastName?.toLowerCase() || '',
      staff.fullName?.toLowerCase() || '',
      staff.code?.toLowerCase() || '',
      staff.email?.toLowerCase() || ''
    ];

    const firstName = staff.firstName?.toLowerCase() || '';
    const lastName = staff.lastName?.toLowerCase() || '';
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

  const getFilteredAndSortedStaff = useCallback((staff) => {
    if (!Array.isArray(staff)) return [];
    
    const filtered = staff.filter(member => {
      if (!member) return false;

      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = matchesSearchQuery(member, query);
      
      let matchesStatus = true;
      if (statusFilter === 'active') {
        matchesStatus = member.isActive;
      } else if (statusFilter === 'inactive') {
        matchesStatus = !member.isActive;
      }

      let matchesResigned = true;
      if (resignedFilter === 'active') {
        matchesResigned = !member.isResigned;
      } else if (resignedFilter === 'resigned') {
        matchesResigned = member.isResigned;
      }

      return matchesSearch && matchesStatus && matchesResigned;
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
    searchQuery, statusFilter, resignedFilter, sortBy, sortOrder, matchesSearchQuery
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
    setStatusFilter("");
    setResignedFilter("all");
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
      searchQuery || statusFilter || (resignedFilter !== "all") || sortBy
    );
  }, [
    searchQuery, statusFilter, resignedFilter, sortBy
  ]);

  const getFilterInfo = useCallback(() => ({
    สถานะ: statusFilter,
    การลาออก: resignedFilter === 'active' ? 'ยังไม่ลาออก' : 
              resignedFilter === 'resigned' ? 'ลาออกแล้ว' : 'ทั้งหมด',
    คำค้นหา: searchQuery
  }), [
    statusFilter, resignedFilter, searchQuery
  ]);

  return {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    resignedFilter,
    setResignedFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    currentPage,
    setCurrentPage,
    sortConfig,
    hasActiveFilters,
    getFilteredAndSortedStaff,
    handleSort,
    resetFilters,
    getFilterInfo
  };
};