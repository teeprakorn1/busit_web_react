import { useCallback } from 'react';
import { exportActivitiesToExcel } from '../utils/excelExportUtils';
import { useUserPermissions } from './useUserPermissions';
import {
    logSystemAction,
} from './../../../../utils/systemLog';

export const useActivityActions = ({
    validateId,
    sanitizeInput,
    setSecurityAlert,
    showModal,
    closeModal,
    openActivityModal,
    fetchActivities
}) => {
    const permissions = useUserPermissions();

    const handleViewActivity = useCallback(async (activity) => {
        if (!permissions.canViewActivities) {
            setSecurityAlert('ไม่มีสิทธิ์ในการดูรายละเอียดกิจกรรม');
            return;
        }

        if (!activity?.id || !validateId(activity.id)) {
            console.error('Invalid activity ID:', activity?.id);
            setSecurityAlert('ตรวจพบการพยายามเข้าถึงข้อมูลไม่ถูกต้อง');
            return;
        }

        const activityTitle = sanitizeInput(activity.title || '');

        try {
            await logSystemAction(
                activity.id,
                `ดูรายละเอียดกิจกรรม: ${activityTitle}`,
                'Activity'
            );
        } catch (error) {
            console.warn('Failed to log view action:', error);
        }

        openActivityModal(activity.id);
    }, [permissions.canViewActivities, validateId, sanitizeInput, setSecurityAlert, openActivityModal]);

    const handleExportToExcel = useCallback(async (activities, filterInfo) => {
        if (!permissions.canExportData) {
            setSecurityAlert('ไม่มีสิทธิ์ในการส่งออกข้อมูล');
            return;
        }

        try {
            await logSystemAction(
                0,
                `ส่งออกข้อมูลกิจกรรม: ${activities.length} รายการ`,
                'Activity'
            );

            return exportActivitiesToExcel(activities, filterInfo);
        } catch (error) {
            console.warn('Failed to log export action:', error);
            return exportActivitiesToExcel(activities, filterInfo);
        }
    }, [permissions.canExportData, setSecurityAlert]);

    const handleShowActivitySummary = useCallback(async (activities, filterInfo) => {
        if (!activities || activities.length === 0) {
            showModal('ไม่มีข้อมูลกิจกรรม', [
                {
                    label: 'ตกลง',
                    onClick: closeModal,
                }
            ]);
            return;
        }

        try {
            await logSystemAction(
                0,
                `ดูสรุปข้อมูลกิจกรรม: ${activities.length} กิจกรรม`,
                'Activity'
            );
        } catch (error) {
            console.warn('Failed to log summary view:', error);
        }

        const totalActivities = activities.length;
        const registeredCount = activities.filter(a => a.isRegistered).length;
        const completedCount = activities.filter(a => a.participationStatus === 'completed').length;
        const upcomingCount = activities.filter(a => new Date(a.startTime) > new Date()).length;
        const ongoingCount = activities.filter(a => {
            const now = new Date();
            return new Date(a.startTime) <= now && new Date(a.endTime) >= now;
        }).length;

        const summaryMessage = `
สรุปข้อมูลกิจกรรม:

จำนวนทั้งหมด: ${totalActivities} กิจกรรม
- ลงทะเบียนแล้ว: ${registeredCount} กิจกรรม
- เข้าร่วมสำเร็จ: ${completedCount} กิจกรรม

สถานะกิจกรรม:
- กำลังจะมาถึง: ${upcomingCount} กิจกรรม
- กำลังดำเนินการ: ${ongoingCount} กิจกรรม

${filterInfo?.ประเภท ? `ประเภท: ${filterInfo.ประเภท}` : ''}
${filterInfo?.สถานะ ? `สถานะ: ${filterInfo.สถานะ}` : ''}
    `;

        showModal(summaryMessage, [
            {
                label: 'ส่งออกข้อมูล',
                onClick: () => {
                    closeModal();
                    handleExportToExcel(activities, filterInfo);
                },
            },
            {
                label: 'ปิด',
                onClick: closeModal,
            }
        ]);
    }, [showModal, closeModal, handleExportToExcel]);

    const handleRefreshActivities = useCallback(async () => {
        try {
            await logSystemAction(0, 'รีเฟรชข้อมูลกิจกรรมทั้งหมด', 'Activity');
            await fetchActivities();
        } catch (error) {
            console.warn('Failed to refresh activity data:', error);
            setSecurityAlert('ไม่สามารถรีเฟรชข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
        }
    }, [fetchActivities, setSecurityAlert]);

    const handleSearch = useCallback(async (searchCriteria) => {
        try {
            await logSystemAction(
                0,
                `ค้นหากิจกรรม: ${JSON.stringify(searchCriteria)}`,
                'Activity'
            );
        } catch (error) {
            console.warn('Failed to log search action:', error);
        }
    }, []);

    const handleFilter = useCallback(async (filterCriteria) => {
        try {
            await logSystemAction(
                0,
                `กรองกิจกรรม: ${JSON.stringify(filterCriteria)}`,
                'Activity'
            );
        } catch (error) {
            console.warn('Failed to log filter action:', error);
        }
    }, []);

    return {
        handleViewActivity,
        handleExportToExcel,
        handleShowActivitySummary,
        handleRefreshActivities,
        handleSearch,
        handleFilter,
        permissions
    };
};