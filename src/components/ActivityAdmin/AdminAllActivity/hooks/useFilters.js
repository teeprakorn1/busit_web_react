// hooks/useFilters.js
import { useState, useMemo, useCallback } from 'react';

export const useFilters = (fetchActivities, rowsPerPage = 10) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateRangeFilter, setDateRangeFilter] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPageState] = useState(1);

  const setCurrentPage = useCallback((page) => {
    setCurrentPageState(page);
  }, []);

  const isDateInRange = useCallback((activityDate, range) => {
    const now = new Date();
    const startDate = new Date(activityDate);
    
    switch (range) {
      case 'upcoming':
        return startDate > now;
      case 'ongoing': {
        const endDate = new Date(activityDate);
        return startDate <= now && endDate >= now;
      }
      case 'past':
        return startDate < now;
      case 'this_week': {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        
        return startDate >= weekStart && startDate <= weekEnd;
      }
      case 'this_month': {
        return startDate.getMonth() === now.getMonth() && 
               startDate.getFullYear() === now.getFullYear();
      }
      default:
        return true;
    }
  }, []);

  const getFilteredAndSortedActivities = useCallback((activities) => {
    if (!Array.isArray(activities)) return [];

    console.log('Filtering activities:', {
      total: activities.length,
      typeFilter,
      statusFilter,
      dateRangeFilter,
      searchQuery
    });

    const filtered = activities.filter(activity => {
      if (!activity) return false;

      // Search filter
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        activity.title?.toLowerCase().includes(query) ||
        activity.description?.toLowerCase().includes(query) ||
        activity.locationDetail?.toLowerCase().includes(query);

      // Type filter - ใช้ชื่อประเภทแทน ID
      const matchesType = !typeFilter || 
        activity.typeName === typeFilter;

      // Status filter - ใช้ชื่อสถานะแทน ID
      const matchesStatus = !statusFilter || 
        activity.statusName === statusFilter;

      // Date range filter
      const matchesDateRange = !dateRangeFilter || 
        isDateInRange(activity.startTime, dateRangeFilter);

      const result = matchesSearch && matchesType && matchesStatus && matchesDateRange;
      
      if (!result) {
        console.log('Activity filtered out:', {
          title: activity.title,
          matchesSearch,
          matchesType,
          matchesStatus,
          matchesDateRange
        });
      }

      return result;
    });

    console.log('Filtered activities:', filtered.length);

    if (!sortBy) return filtered;

    return [...filtered].sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'title':
          aValue = (a.title || '').toLowerCase();
          bValue = (b.title || '').toLowerCase();
          break;
        case 'startTime':
        case 'endTime':
        case 'regisTime':
        case 'updateTime':
          aValue = new Date(a[sortBy] || 0);
          bValue = new Date(b[sortBy] || 0);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [searchQuery, typeFilter, statusFilter, dateRangeFilter, sortBy, sortOrder, isDateInRange]);

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
    setTypeFilter("");
    setStatusFilter("");
    setDateRangeFilter("");
    setSortBy("");
    setSortOrder("asc");
    setCurrentPageState(1);
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
    dateRangeFilter,
    setDateRangeFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    currentPage,
    setCurrentPage,
    sortConfig,
    getFilteredAndSortedActivities,
    handleSort,
    resetFilters
  };
};