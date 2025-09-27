// hooks/useDataEdits.js
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { decryptValue } from '../../../../utils/crypto';

const getApiUrl = (endpoint) => {
  return `${process.env.REACT_APP_SERVER_PROTOCOL}${process.env.REACT_APP_SERVER_BASE_URL}${process.env.REACT_APP_SERVER_PORT}${endpoint}`;
};

export const useDataEdits = () => {
  const [dataEdits, setDataEdits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchCriteria, setSearchCriteria] = useState(null);
  const [isPersonSearch, setIsPersonSearch] = useState(false);

  const initialLoadDone = useRef(false);
  const lastFetchParams = useRef(null);
  const mounted = useRef(true);

  const navigate = useNavigate();
  const location = useLocation();

  const dataEditStats = useMemo(() => {
    if (!Array.isArray(dataEdits)) {
      return {
        total: 0,
        uniqueStaff: 0,
        uniqueIPs: 0,
        editTypes: 0,
        sourceTableStats: {},
        editTypeStats: {}
      };
    }

    const stats = {
      total: dataEdits.length,
      uniqueStaff: new Set(dataEdits.map(d => d.Users_Email).filter(Boolean)).size,
      uniqueIPs: new Set(dataEdits.map(d => d.DataEdit_IP_Address).filter(Boolean)).size,
      editTypes: new Set(dataEdits.map(d => d.DataEditType_Name).filter(Boolean)).size,
      sourceTableStats: {},
      editTypeStats: {}
    };

    dataEdits.forEach(d => {
      if (d.DataEditType_Name) {
        stats.editTypeStats[d.DataEditType_Name] = (stats.editTypeStats[d.DataEditType_Name] || 0) + 1;
      }
      if (d.DataEdit_SourceTable) {
        stats.sourceTableStats[d.DataEdit_SourceTable] = (stats.sourceTableStats[d.DataEdit_SourceTable] || 0) + 1;
      }
    });

    return stats;
  }, [dataEdits]);

  const parseSearchCriteria = useCallback(() => {
    try {
      const encryptedCriteria = sessionStorage.getItem('current_search_criteria');
      if (encryptedCriteria) {
        const decrypted = decryptValue(encryptedCriteria);
        const criteria = JSON.parse(decrypted);
        sessionStorage.removeItem('current_search_criteria');
        return criteria;
      }

      const params = new URLSearchParams(location.search);
      const email = params.get("email");
      const staffCode = params.get("staff_code");
      const ip = params.get("ip");

      if (email || staffCode || ip) {
        return {
          type: email ? 'email' : staffCode ? 'staff_code' : 'ip',
          value: email || staffCode || ip,
          timestamp: Date.now()
        };
      }

      return null;
    } catch (error) {
      console.warn('Failed to parse search criteria:', error);
      return null;
    }
  }, [location.search]);

  const fetchDataEdits = useCallback(async (criteria = null) => {
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
        if (criteria.type === 'email') {
          params.append('email', criteria.value);
        } else if (criteria.type === 'staff_code') {
          params.append('staff_code', criteria.value);
        } else if (criteria.type === 'ip') {
          params.append('ip', criteria.value);
        }
        apiUrl = getApiUrl(`${process.env.REACT_APP_API_DATAEDIT_SEARCH}?${params.toString()}`);
      } else {
        apiUrl = getApiUrl(process.env.REACT_APP_API_DATAEDIT_GET);
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
        setDataEdits(data);
      } else {
        const errorMsg = 'ไม่สามารถโหลดข้อมูลได้: ' + (response.data.message || 'Unknown error');
        setError(errorMsg);
        setDataEdits([]);
      }

      initialLoadDone.current = true;
    } catch (err) {
      if (!mounted.current) return;

      console.error('Fetch dataedits error:', err);

      let errorMessage = 'เกิดข้อผิดพลาดในการโหลดข้อมูล';

      if (err.code === 'ECONNABORTED') {
        errorMessage = 'การเชื่อมต่อหมดเวลา กรุณาลองใหม่อีกครั้ง';
      } else if (err.response?.status === 401) {
        errorMessage = 'กรุณาเข้าสู่ระบบใหม่';
      } else if (err.response?.status === 403) {
        errorMessage = 'ไม่มีสิทธิ์เข้าถึงข้อมูลนี้';
      } else if (err.response?.status === 404) {
        errorMessage = 'ไม่พบข้อมูลการแก้ไข';
        setDataEdits([]);
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      setError(errorMessage);
      if (err.response?.status !== 404) {
        setDataEdits([]);
      }

      initialLoadDone.current = true;
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  }, []);

  const goBackToPersonSearch = useCallback(() => {
    navigate('/staff-management/search-staff');
  }, [navigate]);

  const resetSearchCriteria = useCallback(() => {
    setSearchCriteria(null);
    setIsPersonSearch(false);
    initialLoadDone.current = false;
    lastFetchParams.current = null;
    navigate({
      pathname: location.pathname,
      search: ""
    });
  }, [navigate, location.pathname]);

  const refreshDataEdits = useCallback(() => {
    if (!mounted.current) return;

    initialLoadDone.current = false;
    lastFetchParams.current = null;
    fetchDataEdits(searchCriteria);
  }, [fetchDataEdits, searchCriteria]);

  useEffect(() => {
    if (!mounted.current) return;

    const criteria = parseSearchCriteria();

    if (criteria) {
      setSearchCriteria(criteria);
      setIsPersonSearch(true);
    } else {
      setSearchCriteria(null);
      setIsPersonSearch(false);
    }

    if (!initialLoadDone.current) {
      fetchDataEdits(criteria);
    }
  }, [parseSearchCriteria, fetchDataEdits]);

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);

  return {
    dataEdits,
    dataEditStats,
    searchCriteria,
    isPersonSearch,
    loading,
    error,
    fetchDataEdits: refreshDataEdits,
    goBackToPersonSearch,
    resetSearchCriteria,
    setError
  };
};