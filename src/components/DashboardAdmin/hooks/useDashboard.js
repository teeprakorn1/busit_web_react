import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const getApiUrl = (endpoint) => {
  const protocol = process.env.REACT_APP_SERVER_PROTOCOL;
  const baseUrl = process.env.REACT_APP_SERVER_BASE_URL;
  const port = process.env.REACT_APP_SERVER_PORT;

  if (!protocol || !baseUrl || !port) {
    throw new Error('Missing required environment variables');
  }

  return `${protocol}${baseUrl}${port}${endpoint}`;
};

export const useDashboard = (initialSemester = '', initialYear = '') => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [semester, setSemester] = useState(initialSemester);
  const [academicYear, setAcademicYear] = useState(initialYear);
  const isMountedRef = useRef(true);

  const [dashboardData, setDashboardData] = useState({
    userInfo: {
      isDean: false,
      departmentRestricted: false,
      userType: ''
    },
    totalActivities: 0,
    totalStudents: 0,
    totalTeachers: 0,
    activeActivities: 0,
    participationRate: 0,
    completedActivities: 0,
    recentActivities: [],
    activityTypeStats: [],
    monthlyStats: [],
    statusStats: [],
    departmentStats: [],
    topActivities: [],
    hourlyStats: [],
    participationDetails: {
      participatedUsers: 0,
      totalStudents: 0,
      totalRegistrations: 0,
      completedRegistrations: 0
    }
  });

  const fetchDashboardData = useCallback(async (sem = semester, year = academicYear) => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (sem) params.semester = sem;
      if (year) params.academicYear = year;

      const response = await axios.get(getApiUrl('/api/admin/dashboard'), {
        params,
        withCredentials: true,
        timeout: 20000,
        headers: {
          'Cache-Control': 'no-cache',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      if (!isMountedRef.current) return;

      if (response.data && response.data.status) {
        setDashboardData(response.data.data);
      } else {
        throw new Error('ไม่สามารถโหลดข้อมูลแดชบอร์ดได้');
      }

    } catch (err) {
      if (!isMountedRef.current) return;

      console.error('Fetch dashboard error:', err);

      let errorMessage = 'เกิดข้อผิดพลาดในการโหลดข้อมูล';

      if (axios.isAxiosError(err)) {
        if (err.code === 'ECONNABORTED') {
          errorMessage = 'การเชื่อมต่อหมดเวลา กรุณาลองใหม่อีกครั้ง';
        } else if (err.response) {
          switch (err.response.status) {
            case 401:
              errorMessage = 'กรุณาเข้าสู่ระบบใหม่';
              setTimeout(() => {
                if (isMountedRef.current) {
                  navigate('/login');
                }
              }, 2000);
              break;
            case 403:
              errorMessage = 'ไม่มีสิทธิ์เข้าถึงข้อมูลนี้';
              setTimeout(() => {
                if (isMountedRef.current) {
                  navigate('/');
                }
              }, 2000);
              break;
            case 429:
              errorMessage = 'คำขอเกินจำนวนที่กำหนด กรุณารอสักครู่';
              break;
            case 500:
              errorMessage = 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์';
              break;
            default:
              errorMessage = err.response.data?.message || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
          }
        } else if (err.request) {
          errorMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้';
        }
      }

      setError(errorMessage);
      throw err;
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [semester, academicYear, navigate]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchDashboardData();

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchDashboardData]);

  const refetch = useCallback(() => {
    return fetchDashboardData(semester, academicYear);
  }, [fetchDashboardData, semester, academicYear]);

  const updateFilters = useCallback((newSemester, newYear) => {
    setSemester(newSemester);
    setAcademicYear(newYear);
    return fetchDashboardData(newSemester, newYear);
  }, [fetchDashboardData]);

  return {
    loading,
    error,
    dashboardData,
    refetch,
    semester,
    academicYear,
    setSemester,
    setAcademicYear,
    updateFilters
  };
};