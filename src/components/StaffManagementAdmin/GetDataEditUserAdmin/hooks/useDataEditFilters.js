// hooks/useDataEditFilters.js
import { useState, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const useDataEditFilters = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [editTypeFilter, setEditTypeFilter] = useState("");
  const [sourceTableFilter, setSourceTableFilter] = useState("");
  const [dateFilter, setDateFilter] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();
  const location = useLocation();

  const setSearchFromCriteria = useCallback((criteria) => {
    if (criteria && (criteria.type === 'email' || criteria.type === 'staff_code' || criteria.type === 'ip')) {
      setSearchQuery(criteria.value);
    }
  }, []);

  const getFilteredDataEdits = useCallback((dataEdits) => {
    if (!Array.isArray(dataEdits)) return [];

    return dataEdits.filter(de => {
      if (!de) return false;

      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || [
        de.DataEdit_Name,
        de.Users_Email,
        de.Staff_Code,
        de.Staff_FirstName,
        de.Staff_LastName,
        de.DataEdit_IP_Address,
        de.DataEditType_Name,
        de.DataEdit_SourceTable,
        de.DataEdit_ThisId?.toString()
      ].some(field =>
        field && field.toString().toLowerCase().includes(query)
      );

      const matchesEditType = !editTypeFilter || de.DataEditType_Name === editTypeFilter;
      const matchesSourceTable = !sourceTableFilter || de.DataEdit_SourceTable === sourceTableFilter;

      let matchesDate = true;
      if (dateFilter && de.DataEdit_RegisTime) {
        try {
          const deDate = new Date(de.DataEdit_RegisTime);
          const filterDate = new Date(dateFilter);
          matchesDate = deDate.toDateString() === filterDate.toDateString();
        } catch (error) {
          console.warn('Date comparison error:', error);
          matchesDate = true;
        }
      }

      return matchesSearch && matchesEditType && matchesSourceTable && matchesDate;
    });
  }, [searchQuery, editTypeFilter, sourceTableFilter, dateFilter]);

  const getUniqueEditTypes = useCallback((dataEdits) => {
    if (!Array.isArray(dataEdits)) return [];
    return Array.from(new Set(
      dataEdits
        .map(de => de?.DataEditType_Name)
        .filter(Boolean)
    )).sort();
  }, []);

  const getUniqueSourceTables = useCallback((dataEdits) => {
    if (!Array.isArray(dataEdits)) return [];
    return Array.from(new Set(
      dataEdits
        .map(de => de?.DataEdit_SourceTable)
        .filter(Boolean)
    )).sort();
  }, []);

  const resetFilters = useCallback((keepSearchCriteria = false) => {
    if (!keepSearchCriteria) {
      setSearchQuery("");
    }
    setEditTypeFilter("");
    setSourceTableFilter("");
    setDateFilter(null);
    setCurrentPage(1);

    if (!keepSearchCriteria) {
      navigate({
        pathname: location.pathname,
        search: ""
      }, { replace: true });
    }
  }, [navigate, location.pathname]);

  const hasActiveFilters = useMemo(() => {
    return !!(searchQuery || editTypeFilter || sourceTableFilter || dateFilter);
  }, [searchQuery, editTypeFilter, sourceTableFilter, dateFilter]);

  const getFilterSummary = useMemo(() => {
    const active = [];
    if (searchQuery) active.push(`ค้นหา: "${searchQuery}"`);
    if (editTypeFilter) active.push(`ประเภท: ${editTypeFilter}`);
    if (sourceTableFilter) active.push(`ตาราง: ${sourceTableFilter}`);
    if (dateFilter) active.push(`วันที่: ${dateFilter.toLocaleDateString('th-TH')}`);
    return active.join(', ');
  }, [searchQuery, editTypeFilter, sourceTableFilter, dateFilter]);

  return {
    searchQuery,
    setSearchQuery,
    editTypeFilter,
    setEditTypeFilter,
    sourceTableFilter,
    setSourceTableFilter,
    dateFilter,
    setDateFilter,
    currentPage,
    setCurrentPage,
    hasActiveFilters,
    getFilterSummary,
    getFilteredDataEdits,
    getUniqueEditTypes,
    getUniqueSourceTables,
    resetFilters,
    setSearchFromCriteria
  };
};