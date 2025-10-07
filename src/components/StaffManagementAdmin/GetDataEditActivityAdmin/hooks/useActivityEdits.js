// hooks/useActivityEdits.js
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { decryptValue } from '../../../../utils/crypto';

const getApiUrl = (endpoint) => {
  return `${process.env.REACT_APP_SERVER_PROTOCOL}${process.env.REACT_APP_SERVER_BASE_URL}${process.env.REACT_APP_SERVER_PORT}${endpoint}`;
};

export const useActivityEdits = () => {
  const [activityEdits, setActivityEdits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchCriteria, setSearchCriteria] = useState(null);
  const [isActivitySearch, setIsActivitySearch] = useState(false);

  const initialLoadDone = useRef(false);
  const lastFetchParams = useRef(null);
  const mounted = useRef(true);

  const navigate = useNavigate();
  const location = useLocation();

  const activityEditStats = useMemo(() => {
    if (!Array.isArray(activityEdits)) {
      return {
        total: 0,
        uniqueStaff: 0,
        uniqueIPs: 0,
        editTypes: 0,
        uniqueActivities: 0,
        editTypeStats: {}
      };
    }

    const stats = {
      total: activityEdits.length,
      uniqueStaff: new Set(activityEdits.map(d => d.Users_Email).filter(Boolean)).size,
      uniqueIPs: new Set(activityEdits.map(d => d.DataEdit_IP_Address).filter(Boolean)).size,
      editTypes: new Set(activityEdits.map(d => d.DataEditType_Name).filter(Boolean)).size,
      uniqueActivities: new Set(activityEdits.map(d => d.DataEdit_ThisId).filter(Boolean)).size,
      editTypeStats: {}
    };

    activityEdits.forEach(d => {
      if (d.DataEditType_Name) {
        stats.editTypeStats[d.DataEditType_Name] = (stats.editTypeStats[d.DataEditType_Name] || 0) + 1;
      }
    });

    return stats;
  }, [activityEdits]);

  const parseSearchCriteria = useCallback(() => {
    try {
      const encryptedCriteria = sessionStorage.getItem('current_activity_search_criteria');
      if (encryptedCriteria) {
        const decrypted = decryptValue(encryptedCriteria);
        const criteria = JSON.parse(decrypted);
        sessionStorage.removeItem('current_activity_search_criteria');
        return criteria;
      }

      const params = new URLSearchParams(location.search);
      const activityId = params.get("activity_id");
      const activityTitle = params.get("activity_title");
      const staffCode = params.get("staff_code");
      const email = params.get("email");

      if (activityId || activityTitle || staffCode || email) {
        return {
          type: activityId ? 'activity_id' : activityTitle ? 'activity_title' : staffCode ? 'staff_code' : 'email',
          value: activityId || activityTitle || staffCode || email,
          timestamp: Date.now()
        };
      }

      return null;
    } catch (error) {
      console.warn('Failed to parse search criteria:', error);
      return null;
    }
  }, [location.search]);

  const fetchActivityEdits = useCallback(async (criteria = null) => {
    if (!mounted.current) return;

    try {
      const fetchParamsKey = JSON.stringify(criteria);
      if (lastFetchParams.current === fetchParamsKey && initialLoadDone.current) {
        return;
      }
      lastFetchParams.current = fetchParamsKey;

      setLoading(true);
      setError(null);

      let apiUrl;
      if (criteria) {
        const params = new URLSearchParams();
        if (criteria.type === 'activity_id') {
          params.append('activity_id', criteria.value);
        } else if (criteria.type === 'activity_title') {
          params.append('activity_title', criteria.value);
        } else if (criteria.type === 'staff_code') {
          params.append('staff_code', criteria.value);
        } else if (criteria.type === 'email') {
          params.append('email', criteria.value);
        }
        apiUrl = getApiUrl(`/api/dataedit/search?source_table=Activity&${params.toString()}`);
      } else {
        apiUrl = getApiUrl('/api/dataedit/get/source/Activity');
      }

      const response = await axios.get(apiUrl, {
        withCredentials: true,
        timeout: 15000,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (!mounted.current) return;

      if (response.data.status) {
        const data = Array.isArray(response.data.data) ? response.data.data : [];
        setActivityEdits(data);
      } else {
        const errorMsg = 'ไม่สามารถโหลดข้อมูลได้: ' + (response.data.message || 'Unknown error');
        setError(errorMsg);
        setActivityEdits([]);
      }

      initialLoadDone.current = true;
    } catch (err) {
      if (!mounted.current) return;

      console.error('Fetch activity edits error:', err);

      let errorMessage = 'เกิดข้อผิดพลาดในการโหลดข้อมูล';

      if (err.code === 'ECONNABORTED') {
        errorMessage = 'การเชื่อมต่อหมดเวลา กรุณาลองใหม่อีกครั้ง';
      } else if (err.response?.status === 401) {
        errorMessage = 'กรุณาเข้าสู่ระบบใหม่';
      } else if (err.response?.status === 403) {
        errorMessage = 'ไม่มีสิทธิ์เข้าถึงข้อมูลนี้';
      } else if (err.response?.status === 404) {
        errorMessage = 'ไม่พบข้อมูลการแก้ไขกิจกรรม';
        setActivityEdits([]);
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      setError(errorMessage);
      if (err.response?.status !== 404) {
        setActivityEdits([]);
      }

      initialLoadDone.current = true;
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  }, []);

  const goBackToActivitySearch = useCallback(() => {
    navigate('/activity-management/search-activity');
  }, [navigate]);

  const resetSearchCriteria = useCallback(() => {
    setSearchCriteria(null);
    setIsActivitySearch(false);
    initialLoadDone.current = false;
    lastFetchParams.current = null;
    navigate({
      pathname: location.pathname,
      search: ""
    });
  }, [navigate, location.pathname]);

  const refreshActivityEdits = useCallback(() => {
    if (!mounted.current) return;

    initialLoadDone.current = false;
    lastFetchParams.current = null;
    fetchActivityEdits(searchCriteria);
  }, [fetchActivityEdits, searchCriteria]);

  useEffect(() => {
    if (!mounted.current) return;

    const criteria = parseSearchCriteria();

    if (criteria) {
      setSearchCriteria(criteria);
      setIsActivitySearch(true);
    } else {
      setSearchCriteria(null);
      setIsActivitySearch(false);
    }

    if (!initialLoadDone.current) {
      fetchActivityEdits(criteria);
    }
  }, [parseSearchCriteria, fetchActivityEdits]);

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);

  return {
    activityEdits,
    activityEditStats,
    searchCriteria,
    isActivitySearch,
    loading,
    error,
    fetchActivityEdits: refreshActivityEdits,
    goBackToActivitySearch,
    resetSearchCriteria,
    setError
  };
};