// hooks/useActivityEditFilters.js
import { useState, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const useActivityEditFilters = () => {
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [editTypeFilter, setEditTypeFilter] = useState("");
  const [dateFilter, setDateFilter] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();
  const location = useLocation();

  // Apply search query from criteria
  const setSearchFromCriteria = useCallback((criteria) => {
    if (criteria && (criteria.type === 'activity_id' || criteria.type === 'activity_title' || 
        criteria.type === 'staff_code' || criteria.type === 'email')) {
      setSearchQuery(criteria.value);
    }
  }, []);

  // Filter activityEdits with improved logic
  const getFilteredActivityEdits = useCallback((activityEdits) => {
    if (!Array.isArray(activityEdits)) return [];

    return activityEdits.filter(ae => {
      if (!ae) return false;

      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || [
        ae.DataEdit_Name,
        ae.Users_Email,
        ae.Staff_Code,
        ae.Staff_FirstName,
        ae.Staff_LastName,
        ae.DataEdit_IP_Address,
        ae.DataEditType_Name,
        ae.DataEdit_ThisId?.toString(),
        ae.Activity_Title
      ].some(field =>
        field && field.toString().toLowerCase().includes(query)
      );

      const matchesEditType = !editTypeFilter || ae.DataEditType_Name === editTypeFilter;

      let matchesDate = true;
      if (dateFilter && ae.DataEdit_RegisTime) {
        try {
          const aeDate = new Date(ae.DataEdit_RegisTime);
          const filterDate = new Date(dateFilter);
          matchesDate = aeDate.toDateString() === filterDate.toDateString();
        } catch (error) {
          console.warn('Date comparison error:', error);
          matchesDate = true;
        }
      }

      return matchesSearch && matchesEditType && matchesDate;
    });
  }, [searchQuery, editTypeFilter, dateFilter]);

  // Get unique edit types for dropdown
  const getUniqueEditTypes = useCallback((activityEdits) => {
    if (!Array.isArray(activityEdits)) return [];
    return Array.from(new Set(
      activityEdits
        .map(ae => ae?.DataEditType_Name)
        .filter(Boolean)
    )).sort();
  }, []);

  // Reset all filters
  const resetFilters = useCallback((keepSearchCriteria = false) => {
    if (!keepSearchCriteria) {
      setSearchQuery("");
    }
    setEditTypeFilter("");
    setDateFilter(null);
    setCurrentPage(1);
    
    if (!keepSearchCriteria) {
      navigate({
        pathname: location.pathname,
        search: ""
      }, { replace: true });
    }
  }, [navigate, location.pathname]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return !!(searchQuery || editTypeFilter || dateFilter);
  }, [searchQuery, editTypeFilter, dateFilter]);

  // Get filter summary for display
  const getFilterSummary = useMemo(() => {
    const active = [];
    if (searchQuery) active.push(`ค้นหา: "${searchQuery}"`);
    if (editTypeFilter) active.push(`ประเภท: ${editTypeFilter}`);
    if (dateFilter) active.push(`วันที่: ${dateFilter.toLocaleDateString('th-TH')}`);
    return active.join(', ');
  }, [searchQuery, editTypeFilter, dateFilter]);

  return {
    // Filter states
    searchQuery,
    setSearchQuery,
    editTypeFilter,
    setEditTypeFilter,
    dateFilter,
    setDateFilter,
    currentPage,
    setCurrentPage,

    // Computed values
    hasActiveFilters,
    getFilterSummary,

    // Functions
    getFilteredActivityEdits,
    getUniqueEditTypes,
    resetFilters,
    setSearchFromCriteria
  };
};