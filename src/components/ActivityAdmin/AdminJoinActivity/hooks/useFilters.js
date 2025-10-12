// hooks/useFilters.js
import { useState, useMemo, useCallback } from 'react';

export const useFilters = (participants) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: 'all', // all, pending, approved, rejected, checked_in, completed
    userType: 'all', // all, student, teacher
    department: 'all',
    faculty: 'all',
    registrationDate: 'all', // all, today, week, month
    pictureStatus: 'all' // all, has_picture, no_picture, pending_approval
  });

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setFilters({
      status: 'all',
      userType: 'all',
      department: 'all',
      faculty: 'all',
      registrationDate: 'all',
      pictureStatus: 'all'
    });
  }, []);

  const filteredParticipants = useMemo(() => {
    let filtered = [...participants];

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.FirstName?.toLowerCase().includes(query) ||
        p.LastName?.toLowerCase().includes(query) ||
        p.Code?.toLowerCase().includes(query) ||
        p.Users_Email?.toLowerCase().includes(query) ||
        p.Department_Name?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      switch (filters.status) {
        case 'pending':
          filtered = filtered.filter(p => !p.Registration_CheckInTime);
          break;
        case 'checked_in':
          filtered = filtered.filter(p => p.Registration_CheckInTime && !p.Registration_CheckOutTime);
          break;
        case 'completed':
          filtered = filtered.filter(p => p.Registration_CheckOutTime);
          break;
        default:
          break;
      }
    }

    // User type filter
    if (filters.userType !== 'all') {
      if (filters.userType === 'student') {
        filtered = filtered.filter(p => p.isStudent);
      } else if (filters.userType === 'teacher') {
        filtered = filtered.filter(p => p.isTeacher);
      }
    }

    // Department filter
    if (filters.department !== 'all') {
      filtered = filtered.filter(p => p.Department_Name === filters.department);
    }

    // Faculty filter
    if (filters.faculty !== 'all') {
      filtered = filtered.filter(p => p.Faculty_Name === filters.faculty);
    }

    // Registration date filter
    if (filters.registrationDate !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      filtered = filtered.filter(p => {
        const regDate = new Date(p.Registration_RegisTime);
        
        switch (filters.registrationDate) {
          case 'today':
            return regDate >= today;
          case 'week':
            return regDate >= weekAgo;
          case 'month':
            return regDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [participants, searchQuery, filters]);

  // Get unique values for filter options
  const filterOptions = useMemo(() => {
    const departments = new Set();
    const faculties = new Set();

    participants.forEach(p => {
      if (p.Department_Name) departments.add(p.Department_Name);
      if (p.Faculty_Name) faculties.add(p.Faculty_Name);
    });

    return {
      departments: Array.from(departments).sort(),
      faculties: Array.from(faculties).sort()
    };
  }, [participants]);

  return {
    filters,
    filteredParticipants,
    filterOptions,
    updateFilter,
    resetFilters,
    searchQuery,
    setSearchQuery
  };
};