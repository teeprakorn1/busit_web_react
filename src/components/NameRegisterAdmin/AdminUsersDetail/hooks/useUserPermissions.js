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
            canViewStudents: isStaff || isTeacher,
            canViewStudentDetails: isStaff || isTeacher,
            canViewTeachers: isStaff,
            canViewTeacherDetails: isStaff,
            canViewStaff: isStaff,
            canViewStaffDetails: isStaff,
            canEditStudents: isStaff,
            canEditTeachers: isStaff,
            canEditStaff: isStaff,
            canEditUserData: isStaff,
            canAddStudents: isStaff,
            canAddTeachers: isStaff,
            canAddStaff: isStaff,
            canAddUsers: isStaff,
            canToggleStudentStatus: isStaff,
            canToggleTeacherStatus: isStaff,
            canToggleStaffStatus: isStaff,
            canToggleUserStatus: isStaff,
            canExportData: isStaff || isTeacher,
            canImportData: isStaff,
            canExportStudentData: isStaff || isTeacher,
            canExportTeacherData: isStaff,
            canExportStaffData: isStaff,
            canManageUsers: isStaff,
            canAccessAdminFeatures: isStaff,
            canAccessUserManagement: isStaff,
            canAccessReports: isStaff,
            canViewActivities: isStaff || isTeacher,
            canManageActivities: isStaff || isTeacher,
            canViewProfileImages: isStaff,
            canUploadProfileImages: isStaff,
            userType,
            isStaff,
            isTeacher,
            isStudent,
            userInfo,
            isLoading,

            canAccessUserDetails: (targetUserType) => {
                switch (targetUserType) {
                    case 'student':
                        return isStaff || isTeacher;
                    case 'teacher':
                    case 'staff':
                        return isStaff;
                    default:
                        return false;
                }
            },

            canEditUserOfType: (targetUserType) => {
                switch (targetUserType) {
                    case 'student':
                    case 'teacher':
                    case 'staff':
                        return isStaff;
                    default:
                        return false;
                }
            },

            canPerformAction: (action, targetUserType = null) => {
                if (!isStaff) {
                    if (isTeacher && action === 'view' && targetUserType === 'student') {
                        return true;
                    }
                    return false;
                }
                return true;
            }
        };
    }, [userType, userInfo, isLoading]);

    return permissions;
};