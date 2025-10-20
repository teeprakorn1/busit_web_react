import { useState, useCallback } from 'react';
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

export const useSemesterReport = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState({
    period: {
      semester: '',
      academicYear: '',
      isDean: false,
      departmentRestricted: false
    },
    summary: {
      total_activities: 0,
      total_participants: 0,
      completed_participations: 0,
      completed_activities: 0,
      open_activities: 0,
      ongoing_activities: 0,
      total_hours: 0
    },
    typeStats: [],
    departmentStats: [],
    topActivities: [],
    monthlyStats: []
  });

  const fetchSemesterReport = useCallback(async (semester, academicYear) => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (semester) params.semester = semester;
      if (academicYear) params.academicYear = academicYear;

      const response = await axios.get(getApiUrl('/api/admin/dashboard/semester-report'), {
        params,
        withCredentials: true,
        timeout: 30000,
        headers: {
          'Cache-Control': 'no-cache',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      if (response.data && response.data.status) {
        setReportData(response.data.data);
        return response.data.data;
      } else {
        throw new Error('ไม่สามารถโหลดรายงานได้');
      }

    } catch (err) {
      console.error('Fetch semester report error:', err);

      let errorMessage = 'เกิดข้อผิดพลาดในการโหลดรายงาน';

      if (axios.isAxiosError(err)) {
        if (err.code === 'ECONNABORTED') {
          errorMessage = 'การเชื่อมต่อหมดเวลา กรุณาลองใหม่อีกครั้ง';
        } else if (err.response) {
          switch (err.response.status) {
            case 401:
              errorMessage = 'กรุณาเข้าสู่ระบบใหม่';
              setTimeout(() => {
                navigate('/login');
              }, 2000);
              break;
            case 403:
              errorMessage = 'ไม่มีสิทธิ์เข้าถึงข้อมูลนี้';
              setTimeout(() => {
                navigate('/');
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
      setLoading(false);
    }
  }, [navigate]);

  return {
    loading,
    error,
    reportData,
    fetchSemesterReport
  };
};