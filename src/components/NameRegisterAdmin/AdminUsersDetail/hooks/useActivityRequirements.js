// hooks/useActivityRequirements.js
import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';

const getApiUrl = (endpoint) => {
  return `${process.env.REACT_APP_SERVER_PROTOCOL}${process.env.REACT_APP_SERVER_BASE_URL}${process.env.REACT_APP_SERVER_PORT}${endpoint}`;
};

export const useActivityRequirements = (userId, userType) => {
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({
    totalRequired: 0,
    totalCompleted: 0,
    totalIncomplete: 0,
    completionPercentage: 0
  });

  const fetchRequirements = useCallback(async () => {
    if (!userId) {
      setRequirements([]);
      return;
    }

    if (userType !== 'student') {
      setRequirements([]);
      setSummary({
        totalRequired: 0,
        totalCompleted: 0,
        totalIncomplete: 0,
        completionPercentage: 0
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        getApiUrl(`/api/students/${userId}/activity-requirements`),
        { withCredentials: true }
      );

      if (response.data?.status) {
        const requirementsData = response.data.data || [];
        setRequirements(requirementsData);

        const totalRequired = requirementsData.reduce(
          (sum, req) => sum + req.requiredHours,
          0
        );
        const totalCompleted = requirementsData.reduce(
          (sum, req) => sum + req.completedHours,
          0
        );
        const totalIncomplete = requirementsData.filter(
          req => req.completedHours < req.requiredHours
        ).length;
        const completionPercentage = totalRequired > 0
          ? Math.round((totalCompleted / totalRequired) * 100)
          : 0;

        setSummary({
          totalRequired,
          totalCompleted,
          totalIncomplete,
          completionPercentage
        });
      }
    } catch (err) {
      console.error('Error fetching requirements:', err);
      setError(err.response?.data?.message || 'ไม่สามารถโหลดข้อมูลความคืบหน้ากิจกรรมได้');
      setRequirements([]);
    } finally {
      setLoading(false);
    }
  }, [userId, userType]);

  useEffect(() => {
    if (userId && userType === 'student') {
      fetchRequirements();
    }
  }, [userId, userType, fetchRequirements]);

  return {
    requirements,
    loading,
    error,
    summary,
    refreshRequirements: fetchRequirements
  };
};

export default useActivityRequirements;