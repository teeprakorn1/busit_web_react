import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    logSystemAction,
    logBulkOperation
} from './../../../../utils/systemLog';

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

const getActivityImageUrl = (filename) => {
    if (!filename || filename === 'undefined' || filename.trim() === '') {
        return null;
    }

    if (!filename.match(/^[a-zA-Z0-9._-]+$/)) {
        return null;
    }

    const allowedExt = ['.jpg', '.jpeg', '.png'];
    const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();

    if (!allowedExt.includes(ext)) {
        return null;
    }

    return getApiUrl(`${process.env.REACT_APP_API_ADMIN_IMAGES_ACTIVITY}${filename}`);
};

export const useActivities = () => {
    const [activities, setActivities] = useState([]);
    const [activityTypes, setActivityTypes] = useState([]);
    const [activityStatuses, setActivityStatuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [securityAlert, setSecurityAlert] = useState(null);

    const navigate = useNavigate();

    const fetchActivities = useCallback(async (params = {}) => {
        try {
            setLoading(true);
            setError(null);
            setSecurityAlert(null);

            const activityParams = {};

            if (params.searchQuery) {
                const sanitizedQuery = sanitizeInput(params.searchQuery);
                if (sanitizedQuery.length >= 2 && sanitizedQuery.length <= 100) {
                    activityParams.search = sanitizedQuery;
                }
            }

            const activitiesRes = await axios.get(
                getApiUrl('/api/admin/teacher/own-activities'),
                {
                    withCredentials: true,
                    timeout: 15000,
                    params: activityParams,
                    headers: {
                        'Cache-Control': 'no-cache',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    validateStatus: (status) => status >= 200 && status < 300
                }
            );

            if (activitiesRes.data && activitiesRes.data.status) {
                const transformedActivities = activitiesRes.data.data.map(activity => ({
                    id: activity.Activity_ID,
                    title: sanitizeInput(activity.Activity_Title || ''),
                    description: sanitizeInput(activity.Activity_Description || ''),
                    locationDetail: sanitizeInput(activity.Activity_LocationDetail || ''),
                    locationGPS: activity.Activity_LocationGPS,
                    startTime: activity.Activity_StartTime,
                    endTime: activity.Activity_EndTime,
                    imageFile: sanitizeInput(activity.Activity_ImageFile || ''),
                    imageUrl: getActivityImageUrl(activity.Activity_ImageFile),
                    isRequire: Boolean(activity.Activity_IsRequire),
                    regisTime: activity.Activity_RegisTime,
                    allowTeachers: Boolean(activity.Activity_AllowTeachers),
                    typeName: sanitizeInput(activity.ActivityType_Name || ''),
                    typeDescription: sanitizeInput(activity.ActivityType_Description || ''),
                    statusName: sanitizeInput(activity.ActivityStatus_Name || ''),
                    statusDescription: sanitizeInput(activity.ActivityStatus_Description || ''),
                    templateName: sanitizeInput(activity.Template_Name || ''),
                    isRegistered: Boolean(activity.is_registered),
                    registrationTime: activity.Registration_RegisTime,
                    checkInTime: activity.Registration_CheckInTime,
                    checkOutTime: activity.Registration_CheckOutTime,
                    registrationStatusName: sanitizeInput(activity.RegistrationStatus_Name || ''),
                    participationStatus: activity.participation_status || 'not_registered'
                }));

                setActivities(transformedActivities);

                if (Object.keys(params).length > 0) {
                    const searchDescription = `ค้นหาข้อมูลกิจกรรม: ${JSON.stringify(params)}`;
                    await logSystemAction(0, searchDescription, 'Activity');
                }
            } else {
                setError('ไม่สามารถโหลดข้อมูลกิจกรรมได้: ' + (activitiesRes.data?.message || 'Unknown error'));
                setActivities([]);
            }

        } catch (err) {
            console.error('Fetch activities error:', err);

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
                            setSecurityAlert('การเข้าถึงถูกปฏิเสธ - ต้องเป็นอาจารย์เท่านั้น');
                            break;
                        case 404:
                            errorMessage = 'ไม่พบ API สำหรับดึงข้อมูลกิจกรรม กรุณาติดต่อผู้ดูแลระบบ';
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
            setActivities([]);
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    const loadActivityTypesAndStatuses = useCallback(async () => {
        try {
            const [typesRes, statusesRes] = await Promise.all([
                axios.get(getApiUrl(process.env.REACT_APP_API_ADMIN_ACTIVITY_TYPES_GET || '/api/admin/activity-types'), {
                    withCredentials: true,
                    timeout: 10000,
                    headers: {
                        'Cache-Control': 'no-cache',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                }),
                axios.get(getApiUrl(process.env.REACT_APP_API_ADMIN_ACTIVITY_STATUSES_GET || '/api/admin/activity-statuses'), {
                    withCredentials: true,
                    timeout: 10000,
                    headers: {
                        'Cache-Control': 'no-cache',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                })
            ]);

            if (typesRes.data?.status) {
                setActivityTypes(typesRes.data.data);
            }
            if (statusesRes.data?.status) {
                setActivityStatuses(statusesRes.data.data);
            }
        } catch (err) {
            console.error('Load activity types/statuses error:', err);
        }
    }, []);

    const handleLogBulkOperation = useCallback(async (operationType, affectedCount, details = '') => {
        try {
            await logBulkOperation(operationType, affectedCount, details, 'Activity');
        } catch (error) {
            console.warn('Failed to log bulk operation:', error);
        }
    }, []);

    useEffect(() => {
        if (securityAlert) {
            const timer = setTimeout(() => {
                setSecurityAlert(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [securityAlert]);

    return {
        activities,
        activityTypes,
        activityStatuses,
        loading,
        error,
        actionLoading,
        securityAlert,
        fetchActivities,
        loadActivityTypesAndStatuses,
        setError,
        setSecurityAlert,
        setActionLoading,
        sanitizeInput,
        validateId,
        logBulkOperation: handleLogBulkOperation
    };
};