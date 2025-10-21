import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const getApiUrl = (endpoint) => {
  const protocol = process.env.REACT_APP_SERVER_PROTOCOL || 'http://';
  const baseUrl = process.env.REACT_APP_SERVER_BASE_URL || 'localhost';
  const port = process.env.REACT_APP_SERVER_PORT || ':5000';

  return `${protocol}${baseUrl}${port}${endpoint}`;
};

const apiClient = axios.create({
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      sessionStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const useDashboard = (initialSemester = '', initialYear = '') => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [semester, setSemester] = useState(initialSemester);
  const [academicYear, setAcademicYear] = useState(initialYear);
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef(null);

  const semesterRef = useRef(semester);
  const academicYearRef = useRef(academicYear);
  
  useEffect(() => {
    semesterRef.current = semester;
  }, [semester]);
  
  useEffect(() => {
    academicYearRef.current = academicYear;
  }, [academicYear]);

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

  const fetchDashboardData = useCallback(async (sem, year) => {
    const finalSem = sem !== undefined ? sem : semesterRef.current;
    const finalYear = year !== undefined ? year : academicYearRef.current;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (finalSem && finalSem !== '') {
        params.semester = String(finalSem);
      }
      if (finalYear && finalYear !== '') {
        params.academicYear = String(finalYear);
      }
      const response = await apiClient.get(getApiUrl('/api/admin/dashboard'), {
        params,
        signal: abortControllerRef.current.signal
      });

      if (!isMountedRef.current) return;

      if (response.data) {
        const data = response.data.data || response.data;
        setDashboardData({
          userInfo: data.userInfo || {
            isDean: false,
            departmentRestricted: false,
            userType: ''
          },
          totalActivities: Number(data.totalActivities) || 0,
          totalStudents: Number(data.totalStudents) || 0,
          totalTeachers: Number(data.totalTeachers) || 0,
          activeActivities: Number(data.activeActivities) || 0,
          participationRate: Number(data.participationRate) || 0,
          completedActivities: Number(data.completedActivities) || 0,
          recentActivities: Array.isArray(data.recentActivities) ? data.recentActivities : [],
          activityTypeStats: Array.isArray(data.activityTypeStats) ? data.activityTypeStats : [],
          monthlyStats: Array.isArray(data.monthlyStats) ? data.monthlyStats : [],
          statusStats: Array.isArray(data.statusStats) ? data.statusStats : [],
          departmentStats: Array.isArray(data.departmentStats) ? data.departmentStats : [],
          topActivities: Array.isArray(data.topActivities) ? data.topActivities : [],
          hourlyStats: Array.isArray(data.hourlyStats) ? data.hourlyStats : [],
          participationDetails: data.participationDetails || {
            participatedUsers: 0,
            totalStudents: 0,
            totalRegistrations: 0,
            completedRegistrations: 0
          }
        });
      } else {
        throw new Error('Invalid response format from server');
      }

    } catch (err) {
      if (!isMountedRef.current) return;
      if (axios.isCancel(err) || err.name === 'CanceledError') {
        return;
      }

      console.error('❌ Fetch dashboard error:', err);

      let errorMessage = 'เกิดข้อผิดพลาดในการโหลดข้อมูล';

      if (axios.isAxiosError(err)) {
        if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
          errorMessage = 'การเชื่อมต่อหมดเวลา กรุณาลองใหม่อีกครั้ง';
        } else if (err.code === 'ERR_NETWORK') {
          errorMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต';
        } else if (err.response) {
          const status = err.response.status;
          const serverMessage = err.response.data?.message;

          console.error(`Server Error ${status}:`, err.response.data);

          switch (status) {
            case 400:
              errorMessage = serverMessage || 'ข้อมูลที่ส่งไม่ถูกต้อง';
              break;
            case 401:
              errorMessage = 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่';
              break;
            case 403:
              errorMessage = 'ไม่มีสิทธิ์เข้าถึงข้อมูลนี้';
              setTimeout(() => {
                if (isMountedRef.current) {
                  navigate('/');
                }
              }, 2000);
              break;
            case 404:
              errorMessage = 'ไม่พบ API endpoint กรุณาติดต่อผู้ดูแลระบบ';
              break;
            case 429:
              errorMessage = 'คำขอเกินจำนวนที่กำหนด กรุณารอสักครู่';
              break;
            case 500:
              errorMessage = serverMessage || 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง';
              break;
            case 502:
            case 503:
            case 504:
              errorMessage = 'เซิร์ฟเวอร์ไม่พร้อมให้บริการชั่วคราว กรุณาลองใหม่อีกครั้ง';
              break;
            default:
              errorMessage = serverMessage || `เกิดข้อผิดพลาด (${status})`;
          }
        } else if (err.request) {
          errorMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่อ';
          console.error('No response received:', err.request);
        }
      }

      setError(errorMessage);

    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [navigate]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchDashboardData('', '');

    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
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