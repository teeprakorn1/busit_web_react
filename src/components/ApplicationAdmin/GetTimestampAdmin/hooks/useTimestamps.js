import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { decryptValue } from '../../../../utils/crypto';

const getApiUrl = (endpoint) => {
  return `${process.env.REACT_APP_SERVER_PROTOCOL}${process.env.REACT_APP_SERVER_BASE_URL}${process.env.REACT_APP_SERVER_PORT}${endpoint}`;
};

export const useTimestamps = () => {
  // Data states
  const [timestamps, setTimestamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchCriteria, setSearchCriteria] = useState(null);
  const [isPersonSearch, setIsPersonSearch] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Statistics calculation
  const timestampStats = useMemo(() => {
    if (!Array.isArray(timestamps)) return {};

    const stats = {
      total: timestamps.length,
      uniqueUsers: new Set(timestamps.map(t => t.Users_Email).filter(Boolean)).size,
      uniqueIPs: new Set(timestamps.map(t => t.Timestamp_IP_Address).filter(Boolean)).size,
      eventTypes: new Set(timestamps.map(t => t.TimestampType_Name).filter(Boolean)).size,
      userTypes: {}
    };

    // Count by user types
    timestamps.forEach(t => {
      if (t.Users_Type) {
        stats.userTypes[t.Users_Type] = (stats.userTypes[t.Users_Type] || 0) + 1;
      }
    });

    return stats;
  }, [timestamps]);

  // Load search criteria from session storage or URL params
  const loadSearchCriteria = useCallback(() => {
    try {
      const encryptedCriteria = sessionStorage.getItem('current_search_criteria');
      if (encryptedCriteria) {
        const decrypted = decryptValue(encryptedCriteria);
        const criteria = JSON.parse(decrypted);
        setSearchCriteria(criteria);
        setIsPersonSearch(true);

        sessionStorage.removeItem('current_search_criteria');
        return criteria;
      }

      const params = new URLSearchParams(location.search);
      const email = params.get("email");
      const ip = params.get("ip");

      if (email || ip) {
        const criteria = {
          type: email ? 'email' : 'ip',
          value: email || ip,
          timestamp: Date.now()
        };
        setSearchCriteria(criteria);
        setIsPersonSearch(true);
        return criteria;
      }

      return null;
    } catch (error) {
      console.warn('Failed to load search criteria:', error);
      return null;
    }
  }, [location.search]);

  // Fetch timestamps data
  const fetchTimestamps = useCallback(async (criteria = null) => {
    try {
      setLoading(true);
      setError(null);

      const currentCriteria = criteria || searchCriteria;
      let apiUrl = getApiUrl(process.env.REACT_APP_API_TIMESTAMP_WEBSITE_GET);
      
      if (currentCriteria && currentCriteria.type === 'ip') {
        const params = new URLSearchParams();
        params.append('ip', currentCriteria.value);
        apiUrl = getApiUrl(`${process.env.REACT_APP_API_TIMESTAMP_SEARCH}${params.toString()}`);
      }

      const res = await axios.get(apiUrl, {
        withCredentials: true,
        timeout: 10000,
        headers: {
          'Cache-Control': 'no-cache'
        }
      });

      if (res.data.status) {
        setTimestamps(Array.isArray(res.data.data) ? res.data.data : []);
      } else {
        setError('ไม่สามารถโหลดข้อมูลได้: ' + (res.data.message || 'Unknown error'));
        setTimestamps([]);
      }
    } catch (err) {
      console.error('Fetch timestamps error:', err);

      let errorMessage = 'เกิดข้อผิดพลาดในการโหลดข้อมูล';
      if (err.code === 'ECONNABORTED') {
        errorMessage = 'การเชื่อมต่อหมดเวลา กรุณาลองใหม่อีกครั้ง';
      } else if (err.response?.status === 401) {
        errorMessage = 'กรุณาเข้าสู่ระบบใหม่';
      } else if (err.response?.status === 403) {
        errorMessage = 'ไม่มีสิทธิ์เข้าถึงข้อมูลนี้';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      setError(errorMessage);
      setTimestamps([]);
    } finally {
      setLoading(false);
    }
  }, [searchCriteria]);

  // Go back to person search
  const goBackToPersonSearch = useCallback(() => {
    navigate('/application/get-person-timestamp');
  }, [navigate]);

  // Reset search criteria
  const resetSearchCriteria = useCallback(() => {
    setSearchCriteria(null);
    setIsPersonSearch(false);
    navigate({
      pathname: location.pathname,
      search: ""
    });
  }, [navigate, location.pathname]);

  // Load search criteria on mount
  useEffect(() => {
    loadSearchCriteria();
  }, [loadSearchCriteria]);

  // Fetch timestamps when criteria change
  useEffect(() => {
    fetchTimestamps();
  }, [fetchTimestamps]);

  return {
    // Data
    timestamps,
    timestampStats,
    searchCriteria,
    isPersonSearch,
    
    // Loading states
    loading,
    error,
    
    // Actions
    fetchTimestamps,
    loadSearchCriteria,
    goBackToPersonSearch,
    resetSearchCriteria,
    
    // Utilities
    setError
  };
};