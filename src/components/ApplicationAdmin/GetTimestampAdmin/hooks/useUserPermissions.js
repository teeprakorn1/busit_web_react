import { useState, useEffect, useMemo } from 'react';
import { decryptValue } from './../../../../utils/crypto';

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
            canAccessTimestampLogs: isStaff,
            canViewTimestampDetails: isStaff,
            canExportTimestampData: isStaff,
            canSearchTimestamps: isStaff,
            canFilterTimestamps: isStaff,
            canDeleteTimestamps: isStaff,
            canViewUserActivity: isStaff,
            canTrackUserSessions: isStaff,
            canViewLoginHistory: isStaff,
            canViewSystemLogs: isStaff,
            canViewAuditTrail: isStaff,
            canViewAnalytics: isStaff,
            canViewSystemStats: isStaff,
            canMonitorUserBehavior: isStaff,
            canGenerateActivityReports: isStaff,
            canExportUserData: isStaff,
            canExportSystemLogs: isStaff,
            canExportAnalytics: isStaff,
            canSearchByEmail: isStaff,
            canSearchByIP: isStaff,
            canSearchByUserType: isStaff,
            canSearchByDateRange: isStaff,
            canAdvancedSearch: isStaff,
            canViewSensitiveData: isStaff,
            canAccessPersonalInfo: isStaff,
            canViewIPAddresses: isStaff,
            canViewEmailAddresses: isStaff,
            canAccessSystemSettings: isStaff,
            canManagePermissions: isStaff,
            canConfigureLogging: isStaff,
            canPerformTimestampAction: (action) => {
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

            canAccessTimestampFeature: (feature) => {
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

            canViewTimestampData: (dataType) => {
                if (!isStaff) return false;

                switch (dataType) {
                    case 'basic':
                    case 'summary':
                    case 'activity':
                        return true;
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
            canViewUserConnections: isStaff
        };
    }, [userType, userInfo, isLoading]);

    return permissions;
};