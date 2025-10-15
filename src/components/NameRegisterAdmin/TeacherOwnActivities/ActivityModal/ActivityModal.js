import React, { useEffect, useState, useCallback } from 'react';
import { X, Calendar, MapPin, Clock, Loader, AlertTriangle, Tag, CheckCircle, FileText } from 'lucide-react';
import styles from './ActivityModal.module.css';
import axios from 'axios';

const formatDate = (date) => {
    return new Date(date).toLocaleString('th-TH', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
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

function ActivityModal({ isOpen, onClose, activityId }) {
    const [activityDetail, setActivityDetail] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchActivityDetail = useCallback(async (id) => {
        if (!id) {
            setError('Activity ID is required');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setActivityDetail(null);

            const response = await axios.get(
                getApiUrl(`/api/admin/teacher/own-activities`),
                {
                    withCredentials: true,
                    timeout: 15000,
                    headers: {
                        'Cache-Control': 'no-cache',
                        'X-Requested-With': 'XMLHttpRequest',
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status === 200 && response.data && response.data.status === true) {
                const activity = response.data.data.find(a => a.Activity_ID === parseInt(id));

                if (!activity) {
                    setError('ไม่พบข้อมูลกิจกรรม');
                    return;
                }

                const transformedActivity = {
                    id: activity.Activity_ID,
                    title: activity.Activity_Title || '',
                    description: activity.Activity_Description || '',
                    locationDetail: activity.Activity_LocationDetail || '',
                    locationGPS: activity.Activity_LocationGPS,
                    startTime: activity.Activity_StartTime,
                    endTime: activity.Activity_EndTime,
                    imageFile: activity.Activity_ImageFile,
                    isRequire: Boolean(activity.Activity_IsRequire),
                    regisTime: activity.Activity_RegisTime,
                    typeName: activity.ActivityType_Name || '',
                    typeDescription: activity.ActivityType_Description || '',
                    statusName: activity.ActivityStatus_Name || '',
                    statusDescription: activity.ActivityStatus_Description || '',
                    templateName: activity.Template_Name || '',
                    isRegistered: Boolean(activity.is_registered),
                    registrationTime: activity.Registration_RegisTime,
                    checkInTime: activity.Registration_CheckInTime,
                    checkOutTime: activity.Registration_CheckOutTime,
                    registrationStatusName: activity.RegistrationStatus_Name || '',
                    participationStatus: activity.participation_status || 'not_registered'
                };

                setActivityDetail(transformedActivity);
            } else {
                const errorMessage = response.data?.message || 'ไม่สามารถดึงข้อมูลกิจกรรมได้';
                setError(errorMessage);
            }
        } catch (err) {
            console.error('Fetch activity detail error:', err);
            let errorMessage = 'เกิดข้อผิดพลาดในการโหลดข้อมูลกิจกรรม';

            if (axios.isAxiosError(err)) {
                if (err.code === 'ECONNABORTED') {
                    errorMessage = 'การเชื่อมต่อหมดเวลา กรุณาลองใหม่อีกครั้ง';
                } else if (err.response) {
                    const status = err.response.status;
                    const serverMessage = err.response.data?.message;

                    switch (status) {
                        case 400:
                            errorMessage = serverMessage || 'รหัสกิจกรรมไม่ถูกต้อง';
                            break;
                        case 401:
                            errorMessage = 'กรุณาเข้าสู่ระบบใหม่';
                            break;
                        case 403:
                            errorMessage = 'ไม่มีสิทธิ์เข้าถึงข้อมูลกิจกรรมนี้';
                            break;
                        case 404:
                            errorMessage = 'ไม่พบข้อมูลกิจกรรม';
                            break;
                        default:
                            errorMessage = serverMessage || `เกิดข้อผิดพลาด (รหัส: ${status})`;
                    }
                } else if (err.request) {
                    errorMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้';
                }
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen && activityId) {
            fetchActivityDetail(activityId);
        } else if (!isOpen) {
            setActivityDetail(null);
            setError(null);
            setLoading(false);
        }
    }, [isOpen, activityId, fetchActivityDetail]);

    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const getParticipationBadge = () => {
        if (!activityDetail) return null;

        if (activityDetail.participationStatus === 'completed') {
            return { label: 'เข้าร่วมสำเร็จ', className: styles.completed };
        } else if (activityDetail.participationStatus === 'checked_in') {
            return { label: 'เช็คอินแล้ว', className: styles.checkedIn };
        } else if (activityDetail.participationStatus === 'registered') {
            return { label: 'ลงทะเบียนแล้ว', className: styles.registered };
        } else {
            return { label: 'ยังไม่ลงทะเบียน', className: styles.notRegistered };
        }
    };

    if (loading) {
        return (
            <div className={styles.modalOverlay} onClick={handleBackdropClick}>
                <div className={styles.modalContent}>
                    <div className={styles.modalHeader}>
                        <h2 className={styles.activityTitle}>กำลังโหลดข้อมูล...</h2>
                        <button className={styles.closeButton} onClick={onClose}>
                            <X size={24} />
                        </button>
                    </div>
                    <div className={styles.modalBody}>
                        <div className={styles.loadingContainer}>
                            <Loader className={styles.spinner} />
                            <p>กำลังดึงข้อมูลกิจกรรม...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.modalOverlay} onClick={handleBackdropClick}>
                <div className={styles.modalContent}>
                    <div className={styles.modalHeader}>
                        <h2 className={styles.activityTitle}>เกิดข้อผิดพลาด</h2>
                        <button className={styles.closeButton} onClick={onClose}>
                            <X size={24} />
                        </button>
                    </div>
                    <div className={styles.modalBody}>
                        <div className={styles.errorContainer}>
                            <AlertTriangle className={styles.errorIcon} />
                            <p>{error}</p>
                            <button
                                className={styles.retryButton}
                                onClick={() => fetchActivityDetail(activityId)}
                            >
                                ลองใหม่อีกครั้ง
                            </button>
                        </div>
                    </div>
                    <div className={styles.modalFooter}>
                        <button className={styles.closeBtn} onClick={onClose}>
                            ปิด
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!activityDetail) {
        return (
            <div className={styles.modalOverlay} onClick={handleBackdropClick}>
                <div className={styles.modalContent}>
                    <div className={styles.modalHeader}>
                        <h2 className={styles.activityTitle}>ไม่พบข้อมูลกิจกรรม</h2>
                        <button className={styles.closeButton} onClick={onClose}>
                            <X size={24} />
                        </button>
                    </div>
                    <div className={styles.modalBody}>
                        <div className={styles.errorContainer}>
                            <Calendar className={styles.errorIcon} />
                            <p>ไม่สามารถแสดงข้อมูลกิจกรรมได้</p>
                        </div>
                    </div>
                    <div className={styles.modalFooter}>
                        <button className={styles.closeBtn} onClick={onClose}>
                            ปิด
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const participationBadge = getParticipationBadge();

    return (
        <div className={styles.modalOverlay} onClick={handleBackdropClick}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <div className={styles.activityInfo}>
                        <div className={styles.titleSection}>
                            <h2 className={styles.activityTitle}>{activityDetail.title}</h2>
                            <div className={styles.statusBadges}>
                                <span className={`${styles.badge} ${styles.statusBadge}`}>
                                    {activityDetail.statusName}
                                </span>
                                {participationBadge && (
                                    <span className={`${styles.badge} ${participationBadge.className}`}>
                                        {participationBadge.label}
                                    </span>
                                )}
                                {activityDetail.isRequire && (
                                    <span className={`${styles.badge} ${styles.required}`}>
                                        กิจกรรมบังคับ
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <button className={styles.closeButton} onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className={styles.modalBody}>
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>
                            <FileText size={18} />
                            รายละเอียดกิจกรรม
                        </h3>
                        <div className={styles.description}>
                            {activityDetail.description || 'ไม่มีรายละเอียด'}
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>
                            <Calendar size={18} />
                            ข้อมูลพื้นฐาน
                        </h3>
                        <div className={styles.infoGrid}>
                            <div className={styles.infoItem}>
                                <Tag className={styles.infoIcon} />
                                <div>
                                    <label>ประเภทกิจกรรม</label>
                                    <span>{activityDetail.typeName}</span>
                                    {activityDetail.typeDescription && (
                                        <span className={styles.subText}>{activityDetail.typeDescription}</span>
                                    )}
                                </div>
                            </div>
                            <div className={styles.infoItem}>
                                <MapPin className={styles.infoIcon} />
                                <div>
                                    <label>สถานที่</label>
                                    <span>{activityDetail.locationDetail || 'ไม่ระบุ'}</span>
                                </div>
                            </div>
                            <div className={styles.infoItem}>
                                <Calendar className={styles.infoIcon} />
                                <div>
                                    <label>วันที่เริ่ม</label>
                                    <span>{formatDate(activityDetail.startTime)}</span>
                                </div>
                            </div>
                            <div className={styles.infoItem}>
                                <Calendar className={styles.infoIcon} />
                                <div>
                                    <label>วันที่สิ้นสุด</label>
                                    <span>{formatDate(activityDetail.endTime)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {activityDetail.isRegistered && (
                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}>
                                <CheckCircle size={18} />
                                ข้อมูลการเข้าร่วม
                            </h3>
                            <div className={styles.infoGrid}>
                                <div className={styles.infoItem}>
                                    <Clock className={styles.infoIcon} />
                                    <div>
                                        <label>วันที่ลงทะเบียน</label>
                                        <span>{formatDate(activityDetail.registrationTime)}</span>
                                    </div>
                                </div>
                                {activityDetail.checkInTime && (
                                    <div className={styles.infoItem}>
                                        <Clock className={styles.infoIcon} />
                                        <div>
                                            <label>เวลาเช็คอิน</label>
                                            <span>{formatDate(activityDetail.checkInTime)}</span>
                                        </div>
                                    </div>
                                )}
                                {activityDetail.checkOutTime && (
                                    <div className={styles.infoItem}>
                                        <Clock className={styles.infoIcon} />
                                        <div>
                                            <label>เวลาเช็คเอาท์</label>
                                            <span>{formatDate(activityDetail.checkOutTime)}</span>
                                        </div>
                                    </div>
                                )}
                                {activityDetail.registrationStatusName && (
                                    <div className={styles.infoItem}>
                                        <CheckCircle className={styles.infoIcon} />
                                        <div>
                                            <label>สถานะการลงทะเบียน</label>
                                            <span>{activityDetail.registrationStatusName}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>
                            <Clock size={18} />
                            ข้อมูลระบบ
                        </h3>
                        <div className={styles.infoGrid}>
                            <div className={styles.infoItem}>
                                <Clock className={styles.infoIcon} />
                                <div>
                                    <label>วันที่เพิ่มกิจกรรมในระบบ</label>
                                    <span>{formatDate(activityDetail.regisTime)}</span>
                                </div>
                            </div>
                            {activityDetail.templateName && (
                                <div className={styles.infoItem}>
                                    <FileText className={styles.infoIcon} />
                                    <div>
                                        <label>เทมเพลตเกียรติบัตร</label>
                                        <span>{activityDetail.templateName}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className={styles.modalFooter}>
                    <button className={styles.closeBtn} onClick={onClose}>
                        ปิด
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ActivityModal;