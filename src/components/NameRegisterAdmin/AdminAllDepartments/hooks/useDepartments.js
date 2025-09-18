import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.replace(/[<>"'&]/g, '').trim();
};

const validateId = (id) => {
  const numId = parseInt(id, 10);
  return !isNaN(numId) && numId > 0 && numId <= 2147483647;
};

const getApiUrl = (endpoint) => {
  const protocol = process.env.REACT_APP_SERVER_PROTOCOL;
  const baseUrl = process.env.REACT_APP_SERVER_BASE_URL;
  const port = process.env.REACT_APP_SERVER_PORT;

  if (!protocol || !baseUrl || !port) {
    throw new Error('Missing required environment variables');
  }

  return `${protocol}${baseUrl}${port}${endpoint}`;
};

export const useDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [allFaculties, setAllFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading] = useState(false);
  const [securityAlert, setSecurityAlert] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  const navigate = useNavigate();
  
  const loadInitialData = useCallback(async () => {
    if (dataLoaded) return;

    try {
      setLoading(true);
      setError(null);
      setSecurityAlert(null);
      
      try {
        const [departmentsRes, facultiesRes] = await Promise.all([
          axios.get(getApiUrl('/api/admin/departments/stats/all'), {
            withCredentials: true,
            timeout: 15000,
            headers: {
              'Cache-Control': 'no-cache',
              'X-Requested-With': 'XMLHttpRequest'
            }
          }),
          axios.get(getApiUrl('/api/admin/faculties'), {
            withCredentials: true,
            timeout: 10000,
            headers: {
              'Cache-Control': 'no-cache',
              'X-Requested-With': 'XMLHttpRequest'
            }
          })
        ]);

        if (departmentsRes.data?.status) {
          setDepartments(departmentsRes.data.data);
        }

        if (facultiesRes.data?.status) {
          setAllFaculties(facultiesRes.data.data);
        }

      } catch (newApiError) {
        console.warn('New API not available, falling back to old method:', newApiError);
        
        const [departmentsRes, facultiesRes] = await Promise.all([
          axios.get(getApiUrl('/api/admin/departments'), {
            withCredentials: true,
            timeout: 15000,
            headers: {
              'Cache-Control': 'no-cache',
              'X-Requested-With': 'XMLHttpRequest'
            }
          }),
          axios.get(getApiUrl('/api/admin/faculties'), {
            withCredentials: true,
            timeout: 10000,
            headers: {
              'Cache-Control': 'no-cache',
              'X-Requested-With': 'XMLHttpRequest'
            }
          })
        ]);

        if (departmentsRes.data?.status) {
          const departmentsWithoutStats = departmentsRes.data.data;
          
          const departmentsWithStats = await Promise.all(
            departmentsWithoutStats.map(async (dept) => {
              try {
                const [teachersRes, studentsRes] = await Promise.all([
                  axios.get(getApiUrl('/api/admin/teachers'), {
                    params: { departmentId: dept.Department_ID, limit: 1, includeResigned: false },
                    withCredentials: true,
                    timeout: 5000,
                    headers: { 'Cache-Control': 'no-cache', 'X-Requested-With': 'XMLHttpRequest' }
                  }),
                  axios.get(getApiUrl('/api/admin/students'), {
                    params: { departmentId: dept.Department_ID, limit: 1, includeGraduated: false },
                    withCredentials: true,
                    timeout: 5000,
                    headers: { 'Cache-Control': 'no-cache', 'X-Requested-With': 'XMLHttpRequest' }
                  })
                ]);

                return {
                  ...dept,
                  teacher_count: teachersRes.data?.pagination?.total_items || 0,
                  student_count: studentsRes.data?.pagination?.total_items || 0
                };
              } catch (statsError) {
                console.warn(`Failed to load stats for department ${dept.Department_ID}:`, statsError);
                return {
                  ...dept,
                  teacher_count: 0,
                  student_count: 0
                };
              }
            })
          );

          setDepartments(departmentsWithStats);
        }

        if (facultiesRes.data?.status) {
          setAllFaculties(facultiesRes.data.data);
        }
      }

      setDataLoaded(true);

    } catch (err) {
      console.error('Load initial data error:', err);

      let errorMessage = 'เกิดข้อผิดพลาดในการโหลดข้อมูล';

      if (axios.isAxiosError(err)) {
        if (err.code === 'ECONNABORTED') {
          errorMessage = 'การเชื่อมต่อหมดเวลา กรุณาลองใหม่อีกครั้ง';
        } else if (err.response) {
          switch (err.response.status) {
            case 401:
              errorMessage = 'กรุณาเข้าสู่ระบบใหม่';
              setTimeout(() => navigate('/login'), 2000);
              break;
            case 403:
              errorMessage = 'ไม่มีสิทธิ์เข้าถึงข้อมูลนี้';
              setSecurityAlert('การเข้าถึงถูกปฏิเสธ - ไม่มีสิทธิ์เพียงพอ');
              break;
            case 404:
              errorMessage = 'ไม่พบ API สำหรับดึงข้อมูลสาขา กรุณาติดต่อผู้ดูแลระบบ';
              break;
            case 429:
              errorMessage = 'คำขอเกินจำนวนที่กำหนด กรุณารอสักครู่แล้วลองใหม่';
              break;
            default:
              errorMessage = err.response.data?.message || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
          }
        } else if (err.request) {
          errorMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้';
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [dataLoaded, navigate]);

  const fetchDepartments = useCallback(async (params = {}) => {
    setLoading(false);
  }, []);

  const loadPersonnelCounts = useCallback(async () => {
  }, []);

  const handleImageError = useCallback((filename) => {
    console.log('Image load error for:', filename);
  }, []);

  const shouldLoadImage = useCallback((filename) => {
    return filename && filename.trim() !== '';
  }, []);

  return {
    departments,
    faculties: allFaculties,
    loading,
    error,
    actionLoading,
    securityAlert,
    fetchDepartments,
    loadInitialData,
    loadPersonnelCounts,
    handleImageError,
    shouldLoadImage,
    setError,
    setSecurityAlert,
    sanitizeInput,
    validateId,
    dataLoaded
  };
};