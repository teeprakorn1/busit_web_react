// hooks/useUserPermissions.js
import { useState, useEffect, useMemo } from 'react';
import { decryptValue } from '../../../../utils/crypto';

export const useUserPermissions = () => {
    const [userType, setUserType] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initializePermissions = () => {
            try {
                const storedUserType = sessionStorage.getItem('UsersType');
                const storedUserInfo = sessionStorage.getItem('userInfo');

                if (storedUserType) {
                    try {
                        const decryptedUserType = decryptValue(storedUserType);
                        setUserType(decryptedUserType);
                    } catch (decryptError) {
                        console.warn('Failed to decrypt UsersType, using as plain text:', decryptError);
                        setUserType(storedUserType);
                    }
                }

                if (storedUserInfo) {
                    try {
                        const parsedUserInfo = JSON.parse(storedUserInfo);
                        setUserInfo(parsedUserInfo);
                    } catch (parseError) {
                        console.warn('Failed to parse userInfo:', parseError);
                    }
                }
            } catch (error) {
                console.error('Error reading user info from sessionStorage:', error);
            } finally {
                setIsLoading(false);
            }
        };

        initializePermissions();
    }, []);

    const permissions = useMemo(() => {
        const isStaff = userType === 'staff';
        const isTeacher = userType === 'teacher';
        const isStudent = userType === 'student';

        return {
            userType,
            isStaff,
            isTeacher,
            isStudent,
            userInfo,
            isLoading,
            canAccessAdminFeatures: isStaff,
            canManageUsers: isStaff,
            canViewReports: isStaff,
            canAccessDataEditLogs: isStaff,
            canViewDataEditDetails: isStaff,
            canExportDataEditData: isStaff,
            canSearchDataEdits: isStaff,
            canFilterDataEdits: isStaff,
            canDeleteDataEdits: false,
            canViewStaffActivity: isStaff,
            canViewAuditTrail: isStaff,
            canViewSystemLogs: isStaff,
            canViewAnalytics: isStaff,
            canViewSystemStats: isStaff,
            canMonitorUserBehavior: isStaff,
            canGenerateActivityReports: isStaff,
            canExportUserData: isStaff,
            canExportSystemLogs: isStaff,
            canExportAnalytics: isStaff,
            canSearchByEmail: isStaff,
            canSearchByIP: isStaff,
            canSearchByStaffCode: isStaff,
            canSearchByEditType: isStaff,
            canSearchByDateRange: isStaff,
            canAdvancedSearch: isStaff,
            canViewSensitiveData: isStaff,
            canAccessPersonalInfo: isStaff,
            canViewIPAddresses: isStaff,
            canViewEmailAddresses: isStaff,
            canAccessSystemSettings: isStaff,
            canManagePermissions: isStaff,
            canConfigureLogging: isStaff,
            canAccessTimestampLogs: isStaff,
            canViewTimestampDetails: isStaff,
            canExportTimestampData: isStaff,
            canPerformDataEditAction: (action) => {
                if (!isStaff) return false;

                switch (action) {
                    case 'view':
                    case 'search':
                    case 'filter':
                    case 'export':
                        return true;
                    case 'delete':
                    case 'modify':
                        return false;
                    default:
                        return false;
                }
            },

            canAccessDataEditFeature: (feature) => {
                if (!isStaff) return false;

                const allowedFeatures = [
                    'list',
                    'search',
                    'filter',
                    'export',
                    'details',
                    'analytics'
                ];

                return allowedFeatures.includes(feature);
            },

            canViewDataEditData: (dataType) => {
                if (!isStaff) return false;

                switch (dataType) {
                    case 'basic':
                    case 'summary':
                    case 'activity':
                    case 'sensitive':
                    case 'personal':
                        return isStaff;
                    default:
                        return false;
                }
            },

            hasMinimumPermissionLevel: (requiredLevel) => {
                const permissionLevels = {
                    'student': 1,
                    'teacher': 2,
                    'staff': 3,
                    'admin': 4
                };
                const userLevel = permissionLevels[userType] || 0;
                const required = permissionLevels[requiredLevel] || 0;
                return userLevel >= required;
            },

            canUseAdvancedFilters: isStaff,
            canViewDetailedStats: isStaff,
            canCreateCustomReports: isStaff,
            canScheduleReports: isStaff,
            canSetupAlerts: isStaff,
            canBulkExport: isStaff,
            canBulkDelete: false,
            canBulkModify: false,
            canViewHistoricalData: isStaff,
            canViewRealTimeData: isStaff,
            canAccessArchivedData: isStaff,
            canCrossReferenceUsers: isStaff,
            canCorrelateActivities: isStaff,
            canViewUserConnections: isStaff,
            canViewStaffDetails: isStaff,
            canSearchStaff: isStaff,
            canViewStaffEditHistory: isStaff,
            canTrackStaffActions: isStaff
        };
    }, [userType, userInfo, isLoading]);

    return permissions;
};