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
            
            // ==================== Admin Features ====================
            canAccessAdminFeatures: isStaff,
            canManageUsers: isStaff,
            canViewReports: isStaff,
            canAccessSystemSettings: isStaff,
            canManagePermissions: isStaff,
            canConfigureLogging: isStaff,
            
            // ==================== DataEdit Permissions ====================
            // Access permissions
            canAccessDataEditLogs: isStaff,
            canViewDataEditDetails: isStaff,
            canExportDataEditData: isStaff,
            canSearchDataEdits: isStaff,
            canFilterDataEdits: isStaff,
            canDeleteDataEdits: false, // Usually no one can delete audit logs
            canViewStaffActivity: isStaff,
            
            // ==================== Activity Edit Permissions ====================
            canAccessActivityEditLogs: isStaff,
            canViewActivityEditDetails: isStaff,
            canExportActivityEditData: isStaff,
            canSearchActivityEdits: isStaff,
            canFilterActivityEdits: isStaff,
            canDeleteActivityEdits: false,
            
            // ==================== General Audit Permissions ====================
            canViewAuditTrail: isStaff,
            canViewSystemLogs: isStaff,
            canViewAnalytics: isStaff,
            canViewSystemStats: isStaff,
            canMonitorUserBehavior: isStaff,
            canGenerateActivityReports: isStaff,
            canExportUserData: isStaff,
            canExportSystemLogs: isStaff,
            canExportAnalytics: isStaff,
            
            // ==================== Search Permissions ====================
            canSearchByEmail: isStaff,
            canSearchByIP: isStaff,
            canSearchByStaffCode: isStaff,
            canSearchByEditType: isStaff,
            canSearchByDateRange: isStaff,
            canAdvancedSearch: isStaff,
            canSearchByActivityId: isStaff,
            canSearchByActivityTitle: isStaff,
            
            // ==================== Data Access Permissions ====================
            canViewSensitiveData: isStaff,
            canAccessPersonalInfo: isStaff,
            canViewIPAddresses: isStaff,
            canViewEmailAddresses: isStaff,
            canViewActivityData: isStaff,
            
            // ==================== Timestamp Permissions ====================
            canAccessTimestampLogs: isStaff,
            canViewTimestampDetails: isStaff,
            canExportTimestampData: isStaff,
            
            // ==================== Student Management ====================
            canViewStudents: isStaff || isTeacher,
            canAddStudent: isStaff,
            canEditStudent: isStaff,
            canDeleteStudent: isStaff,
            canExportStudents: isStaff,
            canImportStudents: isStaff,
            canChangeStudentStatus: isStaff,
            canViewStudentDetails: isStaff || isTeacher,
            canViewStudentEditHistory: isStaff,
            canTrackStudentActions: isStaff,
            
            // ==================== Teacher Management ====================
            canViewTeachers: isStaff,
            canAddTeacher: isStaff,
            canEditTeacher: isStaff,
            canDeleteTeacher: isStaff,
            canExportTeachers: isStaff,
            canImportTeachers: isStaff,
            canChangeTeacherStatus: isStaff,
            canViewTeacherDetails: isStaff,
            canViewTeacherEditHistory: isStaff,
            canTrackTeacherActions: isStaff,
            
            // ==================== Staff Management ====================
            canViewStaff: isStaff,
            canAddStaff: isStaff,
            canEditStaff: isStaff,
            canDeleteStaff: isStaff,
            canExportStaff: isStaff,
            canImportStaff: isStaff,
            canChangeStaffStatus: isStaff,
            canViewStaffDetails: isStaff,
            canSearchStaff: isStaff,
            canViewStaffEditHistory: isStaff,
            canTrackStaffActions: isStaff,
            
            // ==================== Activity Management ====================
            canViewActivities: isStaff || isTeacher || isStudent,
            canCreateActivity: isStaff,
            canEditActivity: isStaff,
            canDeleteActivity: isStaff,
            canExportActivities: isStaff,
            canManageActivityRegistration: isStaff,
            canViewActivityParticipants: isStaff || isTeacher,
            canApproveActivityRegistration: isStaff,
            canViewActivityStats: isStaff,
            canViewActivityEditHistory: isStaff,
            
            // ==================== Certificate Management ====================
            canManageCertificates: isStaff,
            canGenerateCertificate: isStaff,
            canViewCertificates: isStaff || isTeacher || isStudent,
            canDeleteCertificate: isStaff,
            canManageTemplates: isStaff,
            canManageSignatures: isStaff,
            
            // ==================== Advanced Features ====================
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
            
            // ==================== Action-based Permission Checker ====================
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
                        return false; // Audit logs should not be modified
                    default:
                        return false;
                }
            },

            // ==================== Feature-based Permission Checker ====================
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

            canAccessActivityEditFeature: (feature) => {
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

            // ==================== Data Type Permission Checker ====================
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

            canViewActivityEditData: (dataType) => {
                if (!isStaff) return false;

                switch (dataType) {
                    case 'basic':
                    case 'summary':
                    case 'activity':
                    case 'details':
                        return isStaff;
                    default:
                        return false;
                }
            },

            // ==================== Permission Level Checker ====================
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
            
            // ==================== Role Checker ====================
            hasRole: (role) => {
                return userType === role;
            },

            hasAnyRole: (roles) => {
                return roles.includes(userType);
            },

            // ==================== Module Access Checker ====================
            canAccessModule: (module) => {
                const modulePermissions = {
                    'dashboard': isStaff || isTeacher || isStudent,
                    'student-management': isStaff,
                    'teacher-management': isStaff,
                    'staff-management': isStaff,
                    'activity-management': isStaff || isTeacher,
                    'certificate-management': isStaff,
                    'audit-logs': isStaff,
                    'data-edit-logs': isStaff,
                    'activity-edit-logs': isStaff,
                    'timestamp-logs': isStaff,
                    'reports': isStaff,
                    'analytics': isStaff,
                    'settings': isStaff,
                    'profile': isStaff || isTeacher || isStudent
                };

                return modulePermissions[module] || false;
            }
        };
    }, [userType, userInfo, isLoading]);

    return permissions;
};