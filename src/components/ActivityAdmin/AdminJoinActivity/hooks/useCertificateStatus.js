// hooks/useCertificateStatus.js
import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';

const getApiUrl = (endpoint) => {
  return `${process.env.REACT_APP_SERVER_PROTOCOL}${process.env.REACT_APP_SERVER_BASE_URL}${process.env.REACT_APP_SERVER_PORT}${endpoint}`;
};

export const useCertificateStatus = (activityId) => {
  const [certificates, setCertificates] = useState([]);
  const [certificateMap, setCertificateMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCertificates = useCallback(async () => {
    if (!activityId) {
      setCertificates([]);
      setCertificateMap({});
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        getApiUrl(`/api/admin/activities/${activityId}/certificates`),
        { withCredentials: true }
      );

      if (response.data?.status) {
        const certs = response.data.data || [];
        setCertificates(certs);

        // Create a map for quick lookup
        const map = {};
        certs.forEach(cert => {
          map[cert.Users_ID] = cert;
        });
        setCertificateMap(map);
      }
    } catch (err) {
      console.error('Fetch certificates error:', err);
      setError(err.response?.data?.message || 'ไม่สามารถโหลดข้อมูลเกียรติบัตรได้');
    } finally {
      setLoading(false);
    }
  }, [activityId]);

  const checkUserCertificate = useCallback((userId) => {
    return certificateMap[userId] || null;
  }, [certificateMap]);

  const hasCertificate = useCallback((userId) => {
    return !!certificateMap[userId];
  }, [certificateMap]);

  const refreshCertificates = useCallback(() => {
    return fetchCertificates();
  }, [fetchCertificates]);

  useEffect(() => {
    if (activityId) {
      fetchCertificates();
    }
  }, [activityId, fetchCertificates]);

  return {
    certificates,
    certificateMap,
    loading,
    error,
    checkUserCertificate,
    hasCertificate,
    refreshCertificates
  };
};