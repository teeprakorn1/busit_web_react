import { useState, useCallback } from 'react';
import axios from 'axios';

const getApiUrl = (endpoint) => {
  const protocol = process.env.REACT_APP_SERVER_PROTOCOL;
  const baseUrl = process.env.REACT_APP_SERVER_BASE_URL;
  const port = process.env.REACT_APP_SERVER_PORT;

  if (!protocol || !baseUrl || !port) {
    throw new Error('Missing required environment variables');
  }

  return `${protocol}${baseUrl}${port}${endpoint}`;
};

const useDropdownData = () => {
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [dropdownLoading, setDropdownLoading] = useState(false);
  const [dropdownError, setDropdownError] = useState('');

  const loadDropdownData = useCallback(async () => {
    setDropdownLoading(true);
    setDropdownError('');

    try {
      const requestConfig = {
        withCredentials: true,
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Cache-Control': 'no-cache'
        }
      };

      const requests = [
        axios.get(getApiUrl('/api/admin/faculties'), requestConfig)
          .catch(error => ({ error, type: 'faculties' })),
        axios.get(getApiUrl('/api/admin/departments'), requestConfig)
          .catch(error => ({ error, type: 'departments' })),
        axios.get(getApiUrl('/api/admin/teacher-advisors'), requestConfig)
          .catch(error => ({ error, type: 'teachers' }))
      ];

      const [facultiesRes, departmentsRes, teachersRes] = await Promise.all(requests);

      if (facultiesRes.error) {
        console.error('Failed to load faculties:', facultiesRes.error);
      } else if (facultiesRes.data?.status) {
        setFaculties(facultiesRes.data.data || []);
      }

      if (departmentsRes.error) {
        console.error('Failed to load departments:', departmentsRes.error);
      } else if (departmentsRes.data?.status) {
        setDepartments(departmentsRes.data.data || []);
      }

      if (teachersRes.error) {
        console.error('Failed to load teachers:', teachersRes.error);
        const teachersError = teachersRes.error;

        if (teachersError.response?.status === 401) {
          setDropdownError('กรุณาเข้าสู่ระบบใหม่');
        } else if (teachersError.response?.status === 403) {
          setDropdownError('ไม่มีสิทธิ์เข้าถึงข้อมูลอาจารย์');
        } else if (teachersError.response?.status === 400) {
          setDropdownError('ข้อมูลการร้องขอไม่ถูกต้อง กรุณาลองใหม่');
        } else if (teachersError.code === 'ECONNABORTED') {
          setDropdownError('การเชื่อมต่อหมดเวลา กรุณาลองใหม่');
        } else {
          setDropdownError('ไม่สามารถโหลดข้อมูลอาจารย์ได้ กรุณาลองใหม่อีกครั้ง');
        }
      } else if (teachersRes.data?.status) {
        setTeachers(teachersRes.data.data || []);
      }

      if (!facultiesRes.error && !departmentsRes.error &&
        (!facultiesRes.data?.status || !departmentsRes.data?.status)) {
        setDropdownError('ไม่สามารถโหลดข้อมูลคณะและสาขาได้');
      }

    } catch (error) {
      console.error('Unexpected error loading dropdown data:', error);
      setDropdownError('เกิดข้อผิดพลาดในการโหลดข้อมูล กรุณาลองใหม่อีกครั้ง');
    } finally {
      setDropdownLoading(false);
    }
  }, []);

  const retryLoadDropdownData = useCallback(() => {
    setDropdownError('');
    loadDropdownData();
  }, [loadDropdownData]);

  const clearDropdownError = useCallback(() => {
    setDropdownError('');
  }, []);

  return {
    faculties,
    departments,
    teachers,
    dropdownLoading,
    dropdownError,
    loadDropdownData,
    retryLoadDropdownData,
    clearDropdownError,
    setFaculties,
    setDepartments,
    setTeachers
  };
};

export default useDropdownData;