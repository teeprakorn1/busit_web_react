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
      canAccessPersonalTimestampSearch: isStaff,
      canSearchPersonalTimestamps: isStaff,
      canViewPersonalTimestampData: isStaff,
      canSearchByEmail: isStaff,
      canSearchByIP: isStaff,
      canSearchByUserType: isStaff,
      canAdvancedSearch: isStaff,
      canPreviewTimestampData: isStaff,
      canViewDetailedTimestampData: isStaff,
      canViewSensitiveSearchData: isStaff,
      canAccessFullSearchResults: isStaff,
      canViewSearchHistory: isStaff,
      canSaveSearchHistory: isStaff,
      canManageSearchHistory: isStaff,
      canClearSearchHistory: isStaff,
      canExportSearchHistory: isStaff,
      canExportSearchResults: isStaff,
      canDownloadTimestampData: isStaff,
      canGenerateReports: isStaff,
      canViewEmailAddresses: isStaff,
      canViewIPAddresses: isStaff,
      canViewPersonalInformation: isStaff,
      canAccessSensitiveData: isStaff,
      canCrossReferenceData: isStaff,
      canManageSearchSettings: isStaff,
      canConfigureSearchLimits: isStaff,
      canMonitorSearchActivity: isStaff,
      canAuditSearchActions: isStaff,
      canBypassSearchLimits: false,
      canMakeUnlimitedSearches: false,
      canAccessArchivedData: isStaff,
      canSearchHistoricalData: isStaff,
      canUseWildcardSearch: isStaff,
      canUseRegexSearch: false,
      canBulkSearch: isStaff,
      canScheduledSearch: false,
      canSearchAcrossPlatforms: isStaff,
      canCorrelateUserActivity: isStaff,
      canTrackUserSessions: isStaff,
      canAnalyzeUserBehavior: isStaff,
      canSetupSearchAlerts: isStaff,
      canReceiveSearchNotifications: isStaff,
      canCreateSearchWatchlists: isStaff,

      canPerformSearchAction: (action) => {
        if (!isStaff) return false;
        
        const allowedActions = [
          'search',
          'preview', 
          'view_results',
          'export_basic',
          'save_history'
        ];
        
        const restrictedActions = [
          'bulk_search',
          'unlimited_search',
          'regex_search',
          'system_level_search'
        ];
        
        if (restrictedActions.includes(action)) {
          return false;
        }
        
        return allowedActions.includes(action);
      },
      
      canAccessSearchData: (dataType) => {
        if (!isStaff) return false;
        
        switch (dataType) {
          case 'basic':
          case 'timestamps':
          case 'activity':
            return true;
          case 'personal':
          case 'sensitive':
            return isStaff;
          case 'system':
          case 'admin':
            return false;
          default:
            return false;
        }
      },
      
      canSearchWithCriteria: (criteria) => {
        if (!isStaff) return false;
        
        const { type, complexity, sensitivity } = criteria;
        if (type === 'email' && !isStaff) return false;
        if (type === 'ip' && !isStaff) return false;
        if (complexity === 'advanced' && !isStaff) return false;
        if (complexity === 'bulk' && !isStaff) return false;
        if (sensitivity === 'high' && !isStaff) return false;
        
        return true;
      },
      
      hasSearchQuota: () => {
        return isStaff;
      },
      
      canViewSearchResult: (result) => {
        if (!isStaff) return false;
        return true;
      },
      
      getSearchPermissionLevel: () => {
        if (isStaff) return 'full';
        if (isTeacher) return 'limited';
        if (isStudent) return 'none';
        return 'none';
      },

      canUseSearchFilters: isStaff,
      canSortSearchResults: isStaff,
      canPaginateResults: isStaff,
      canBookmarkSearches: isStaff,
      canShareSearchResults: isStaff,
      canCommentOnSearches: isStaff,
      canIntegrateWithExternalSystems: false,
      canAPIAccess: false,
      canWebhookAccess: false,
      canViewSearchAuditLog: isStaff,
      canGenerateComplianceReports: isStaff,
      canAccessDataRetentionSettings: false,
      canRetryFailedSearches: isStaff,
      canReportSearchIssues: isStaff,
      canAccessErrorLogs: isStaff,
      canOptimizeSearchQueries: false,
      canCacheSearchResults: isStaff,
      canPreloadSearchData: isStaff
    };
  }, [userType, userInfo, isLoading]);

  return permissions;
};