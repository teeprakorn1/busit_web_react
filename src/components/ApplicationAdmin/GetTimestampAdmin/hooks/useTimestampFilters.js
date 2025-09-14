import { useState, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const useTimestampFilters = () => {
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState("");
  const [dateFilter, setDateFilter] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();
  const location = useLocation();

  // Apply search query from criteria
  const setSearchFromCriteria = useCallback((criteria) => {
    if (criteria && (criteria.type === 'email' || criteria.type === 'ip')) {
      setSearchQuery(criteria.value);
    }
  }, []);

  // Filter timestamps
  const getFilteredTimestamps = useCallback((timestamps) => {
    if (!Array.isArray(timestamps)) return [];

    return timestamps.filter(ts => {
      if (!ts) return false;

      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || [
        ts.Timestamp_Name,
        ts.Users_Email,
        ts.Timestamp_IP_Address,
        ts.Users_Type,
        ts.TimestampType_Name
      ].some(field =>
        field && field.toString().toLowerCase().includes(query)
      );

      const matchesUserType = !userTypeFilter || ts.Users_Type === userTypeFilter;
      const matchesEventType = !eventTypeFilter || ts.TimestampType_Name === eventTypeFilter;

      let matchesDate = true;
      if (dateFilter && ts.Timestamp_RegisTime) {
        const tsDate = new Date(ts.Timestamp_RegisTime);
        const filterDate = new Date(dateFilter);
        matchesDate = tsDate.toDateString() === filterDate.toDateString();
      }

      return matchesSearch && matchesUserType && matchesEventType && matchesDate;
    });
  }, [searchQuery, userTypeFilter, eventTypeFilter, dateFilter]);

  // Get unique event types for dropdown
  const getUniqueEventTypes = useCallback((timestamps) => {
    return Array.from(new Set(timestamps.map(ts => ts.TimestampType_Name).filter(Boolean)));
  }, []);

  // Reset all filters
  const resetFilters = useCallback((keepSearchCriteria = false) => {
    if (!keepSearchCriteria) {
      setSearchQuery("");
    }
    setUserTypeFilter("");
    setEventTypeFilter("");
    setDateFilter(null);
    setCurrentPage(1);
    
    if (!keepSearchCriteria) {
      navigate({
        pathname: location.pathname,
        search: ""
      });
    }
  }, [navigate, location.pathname]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return !!(searchQuery || userTypeFilter || eventTypeFilter || dateFilter);
  }, [searchQuery, userTypeFilter, eventTypeFilter, dateFilter]);

  return {
    // Filter states
    searchQuery,
    setSearchQuery,
    userTypeFilter,
    setUserTypeFilter,
    eventTypeFilter,
    setEventTypeFilter,
    dateFilter,
    setDateFilter,
    currentPage,
    setCurrentPage,

    // Computed values
    hasActiveFilters,

    // Functions
    getFilteredTimestamps,
    getUniqueEventTypes,
    resetFilters,
    setSearchFromCriteria
  };
};