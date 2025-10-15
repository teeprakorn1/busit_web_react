import React from 'react';
import { Eye, Calendar, CheckCircle, XCircle, Clock, Image, Award } from 'lucide-react';
import styles from './ActivityTable.module.css';
import { useUserPermissions } from '../hooks/useUserPermissions';

const formatDate = (date) => {
    return new Date(date).toLocaleString('th-TH', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const getParticipationBadge = (activity) => {
    if (activity.participationStatus === 'completed') {
        return { label: 'เข้าร่วมสำเร็จ', className: styles.completed };
    } else if (activity.participationStatus === 'checked_in') {
        return { label: 'เช็คอินแล้ว', className: styles.checkedIn };
    } else if (activity.participationStatus === 'registered') {
        return { label: 'ลงทะเบียนแล้ว', className: styles.registered };
    } else {
        return { label: 'ยังไม่ลงทะเบียน', className: styles.notRegistered };
    }
};

const getStatusBadge = (statusName) => {
    const statusMap = {
        'เปิดรับสมัคร': { className: styles.statusOpen, icon: <CheckCircle size={12} /> },
        'กำลังดำเนินการ': { className: styles.statusOngoing, icon: <Clock size={12} /> },
        'เสร็จสิ้น': { className: styles.statusCompleted, icon: <CheckCircle size={12} /> },
        'ยกเลิก': { className: styles.statusCancelled, icon: <XCircle size={12} /> }
    };

    return statusMap[statusName] || { className: styles.statusDefault, icon: null };
};

function ActivityTable({
    activities,
    onViewActivity,
    onViewImage,
    onViewCertificate,
    actionLoading,
    sortConfig,
    onSort
}) {
    const permissions = useUserPermissions();

    const handleSort = (field) => {
        if (sortConfig.field === field) {
            onSort(field, sortConfig.direction === 'asc' ? 'desc' : 'asc');
        } else {
            onSort(field, 'asc');
        }
    };

    const getSortIcon = (field) => {
        if (sortConfig.field !== field) return '⇅';
        return sortConfig.direction === 'asc' ? '↑' : '↓';
    };

    return (
        <div className={styles.tableWrapper}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th className={styles.sortable} onClick={() => handleSort('title')}>
                            ชื่อกิจกรรม {getSortIcon('title')}
                        </th>
                        <th className={styles.sortable} onClick={() => handleSort('type')}>
                            ประเภท {getSortIcon('type')}
                        </th>
                        <th className={styles.sortable} onClick={() => handleSort('startTime')}>
                            วันที่เริ่ม {getSortIcon('startTime')}
                        </th>
                        <th className={styles.sortable} onClick={() => handleSort('endTime')}>
                            วันที่สิ้นสุด {getSortIcon('endTime')}
                        </th>
                        <th className={styles.sortable} onClick={() => handleSort('status')}>
                            สถานะกิจกรรม {getSortIcon('status')}
                        </th>
                        <th>การเข้าร่วม</th>
                        <th>จัดการ</th>
                    </tr>
                </thead>
                <tbody>
                    {activities.map(activity => {
                        const participationBadge = getParticipationBadge(activity);
                        const statusBadge = getStatusBadge(activity.statusName);
                        const hasRegistrationImage = activity.participationStatus === 'completed' || 
                                                     activity.participationStatus === 'checked_in';
                        const hasCertificate = activity.participationStatus === 'completed';

                        return (
                            <tr key={activity.id}>
                                <td>
                                    <div className={styles.activityTitle}>
                                        <span title={activity.title}>{activity.title}</span>
                                        {activity.isRequire && (
                                            <span className={styles.requiredBadge} title="กิจกรรมบังคับ">
                                                บังคับ
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <span className={styles.eventTag} title={activity.typeName}>
                                        {activity.typeName}
                                    </span>
                                </td>
                                <td>
                                    <div className={styles.dateCell}>
                                        <Calendar className={styles.iconSmall} />
                                        {formatDate(activity.startTime)}
                                    </div>
                                </td>
                                <td>
                                    <div className={styles.dateCell}>
                                        <Calendar className={styles.iconSmall} />
                                        {formatDate(activity.endTime)}
                                    </div>
                                </td>
                                <td>
                                    <div className={styles.statusCell}>
                                        {statusBadge.icon}
                                        <span className={`${styles.badgeType} ${statusBadge.className}`}>
                                            {activity.statusName}
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <span className={`${styles.badgeType} ${participationBadge.className}`}>
                                        {participationBadge.label}
                                    </span>
                                </td>
                                <td>
                                    <div className={styles.actions}>
                                        {permissions.canViewActivities && (
                                            <button
                                                className={`${styles.actionBtn} ${styles.viewBtn}`}
                                                onClick={() => onViewActivity(activity)}
                                                title={`ดูรายละเอียด ${activity.title}`}
                                                disabled={!activity.id || actionLoading}
                                            >
                                                <Eye className={styles.iconSmall} />
                                                <span className={styles.btnText}>รายละเอียด</span>
                                            </button>
                                        )}
                                        
                                        {hasRegistrationImage && (
                                            <button
                                                className={`${styles.actionBtn} ${styles.imageBtn}`}
                                                onClick={() => onViewImage(activity)}
                                                title="ดูรูปภาพเข้าร่วมกิจกรรม"
                                                disabled={actionLoading}
                                            >
                                                <Image className={styles.iconSmall} />
                                                <span className={styles.btnText}>รูปเข้าร่วม</span>
                                            </button>
                                        )}
                                        
                                        {hasCertificate && (
                                            <button
                                                className={`${styles.actionBtn} ${styles.certBtn}`}
                                                onClick={() => onViewCertificate(activity)}
                                                title="ดูเกียรติบัตร"
                                                disabled={actionLoading}
                                            >
                                                <Award className={styles.iconSmall} />
                                                <span className={styles.btnText}>เกียรติบัตร</span>
                                            </button>
                                        )}
                                        
                                        {!permissions.canViewActivities && (
                                            <span className={styles.noPermission} title="ไม่มีสิทธิ์เข้าถึง">
                                                ไม่มีสิทธิ์
                                            </span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                    {activities.length === 0 && (
                        <tr>
                            <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                                ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default ActivityTable;