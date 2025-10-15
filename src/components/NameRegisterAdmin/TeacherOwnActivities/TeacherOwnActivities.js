import React, { useEffect, useMemo, useCallback } from 'react';
import Navbar from '../../NavigationBar/NavigationBar';
import styles from './TeacherOwnActivities.module.css';
import { AlertCircle, Loader, Calendar, Award, CheckCircle } from 'lucide-react';

import ActivityFiltersForm from './ActivityFiltersForm/ActivityFiltersForm';
import ActivityTable from './ActivityTable/ActivityTable';
import ActivityModal from './ActivityModal/ActivityModal';
import ActivityPagination from './ActivityPagination/ActivityPagination';
import CustomModal from '../../../services/CustomModal/CustomModal';

import { useActivities } from './hooks/useActivities';
import { useFilters } from './hooks/useFilters';
import { useUIState } from './hooks/useUIState';
import { useActivityActions } from './hooks/useActivityActions';
import { useActivityHandlers } from './hooks/useActivityHandlers';

function TeacherOwnActivities() {
    const rowsPerPage = 10;
    const {
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
        sanitizeInput,
        validateId
    } = useActivities();

    const {
        searchQuery,
        setSearchQuery,
        typeFilter,
        setTypeFilter,
        statusFilter,
        setStatusFilter,
        participationFilter,
        setParticipationFilter,
        sortBy,
        setSortBy,
        sortOrder,
        setSortOrder,
        currentPage,
        setCurrentPage,
        sortConfig,
        getFilteredAndSortedActivities,
        handleSort,
        resetFilters,
        getFilterInfo
    } = useFilters(fetchActivities, rowsPerPage);

    const {
        isMobile,
        sidebarOpen,
        setSidebarOpen,
        modalOpen,
        modalMessage,
        modalButtons,
        activityModalOpen,
        selectedActivityId,
        showModal,
        closeModal,
        openActivityModal,
        closeActivityModal
    } = useUIState();

    const {
        handleViewActivity,
        handleExportToExcel,
        handleShowActivitySummary,
        handleRefreshActivities,
        handleSearch,
        handleFilter
    } = useActivityActions({
        validateId,
        sanitizeInput,
        setSecurityAlert,
        showModal,
        closeModal,
        openActivityModal,
        fetchActivities
    });

    const {
        handleViewImage,
        handleViewCertificate
    } = useActivityHandlers({
        showModal,
        closeModal,
        setSecurityAlert
    });

    const sortedActivities = useMemo(() => {
        return getFilteredAndSortedActivities(activities);
    }, [getFilteredAndSortedActivities, activities]);

    const totalPages = Math.ceil(sortedActivities.length / rowsPerPage);
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = sortedActivities.slice(indexOfFirstRow, indexOfLastRow);

    const handleExport = useCallback(() => {
        const filterInfo = getFilterInfo();
        return handleExportToExcel(sortedActivities, filterInfo);
    }, [getFilterInfo, handleExportToExcel, sortedActivities]);

    const handleSearchWithLogging = useCallback(async (query) => {
        setSearchQuery(query);
        if (query && query.length > 0) {
            await handleSearch({ searchQuery: query });
        }
    }, [setSearchQuery, handleSearch]);

    const handleFilterWithLogging = useCallback(async (filterType, value) => {
        if (value) {
            const filterCriteria = { [filterType]: value };
            await handleFilter(filterCriteria);
        }
    }, [handleFilter]);

    const activityStats = useMemo(() => {
        const filteredActivities = getFilteredAndSortedActivities(activities);
        const totalActivities = filteredActivities.length;
        const registeredCount = filteredActivities.filter(a => a.isRegistered).length;
        const completedCount = filteredActivities.filter(a => a.participationStatus === 'completed').length;
        const upcomingCount = filteredActivities.filter(a => new Date(a.startTime) > new Date()).length;

        return {
            total: totalActivities,
            registered: registeredCount,
            completed: completedCount,
            upcoming: upcomingCount
        };
    }, [getFilteredAndSortedActivities, activities]);

    useEffect(() => {
        loadActivityTypesAndStatuses();
    }, [loadActivityTypesAndStatuses]);

    useEffect(() => {
        fetchActivities();
    }, [fetchActivities]);

    useEffect(() => {
        if (typeFilter) {
            handleFilterWithLogging('type', typeFilter);
        }
    }, [typeFilter, handleFilterWithLogging]);

    useEffect(() => {
        if (statusFilter) {
            handleFilterWithLogging('status', statusFilter);
        }
    }, [statusFilter, handleFilterWithLogging]);

    useEffect(() => {
        if (participationFilter && participationFilter !== 'all') {
            handleFilterWithLogging('participation', participationFilter);
        }
    }, [participationFilter, handleFilterWithLogging]);

    if (loading) {
        return (
            <div className={styles.container}>
                <Navbar
                    isMobile={isMobile}
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                />
                <main className={`${styles.mainContent} ${isMobile ? styles.mobileContent : ""} ${sidebarOpen && !isMobile ? styles.contentShift : ""}`}>
                    <div className={styles.loadingContainer}>
                        <Loader className={styles.spinner} />
                        <p>กำลังโหลดข้อมูล...</p>
                    </div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <Navbar
                    isMobile={isMobile}
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                />
                <main className={`${styles.mainContent} ${isMobile ? styles.mobileContent : ""} ${sidebarOpen && !isMobile ? styles.contentShift : ""}`}>
                    <div className={styles.errorContainer}>
                        <AlertCircle className={styles.errorIcon} />
                        <h2>เกิดข้อผิดพลาด</h2>
                        <p>{error}</p>
                        {securityAlert && (
                            <div className={styles.securityAlert}>
                                <AlertCircle size={16} />
                                <span>{securityAlert}</span>
                            </div>
                        )}
                        <div className={styles.errorActions}>
                            <button
                                className={styles.retryButton}
                                onClick={() => {
                                    setError(null);
                                    setSecurityAlert(null);
                                    fetchActivities();
                                }}
                                disabled={loading}
                            >
                                ลองใหม่อีกครั้ง
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Navbar
                isMobile={isMobile}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
            />

            <main
                className={`${styles.mainContent} 
          ${isMobile ? styles.mobileContent : ""} 
          ${sidebarOpen && !isMobile ? styles.contentShift : ""}`}
            >
                {securityAlert && (
                    <div className={styles.securityBanner}>
                        <AlertCircle size={16} />
                        <span>{securityAlert}</span>
                    </div>
                )}

                <div className={styles.headerBar}>
                    <div className={styles.headerLeft}>
                        <div>
                            <h1 className={styles.heading}>กิจกรรมของตนเอง</h1>
                            <div className={styles.summaryStats}>
                                <span className={styles.statItem}>
                                    <Calendar className={styles.iconSmall} />
                                    ทั้งหมด: {activityStats.total} กิจกรรม
                                </span>
                                <span className={styles.statItem}>
                                    <CheckCircle className={styles.iconSmall} />
                                    ลงทะเบียนแล้ว: {activityStats.registered} กิจกรรม
                                </span>
                                <span className={styles.statItem}>
                                    <Award className={styles.iconSmall} />
                                    เข้าร่วมสำเร็จ: {activityStats.completed} กิจกรรม
                                </span>
                                <span className={styles.statItem}>
                                    <Calendar className={styles.iconSmall} />
                                    กิจกรรมที่กำลังจะมาถึง: {activityStats.upcoming} กิจกรรม
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.activitiesSection}>
                    <ActivityFiltersForm
                        searchQuery={searchQuery}
                        setSearchQuery={handleSearchWithLogging}
                        typeFilter={typeFilter}
                        setTypeFilter={setTypeFilter}
                        statusFilter={statusFilter}
                        setStatusFilter={setStatusFilter}
                        participationFilter={participationFilter}
                        setParticipationFilter={setParticipationFilter}
                        sortBy={sortBy}
                        setSortBy={setSortBy}
                        sortOrder={sortOrder}
                        setSortOrder={setSortOrder}
                        activityTypes={activityTypes}
                        activityStatuses={activityStatuses}
                        sortedActivities={sortedActivities}
                        exportToExcel={handleExport}
                        resetFilters={resetFilters}
                        setCurrentPage={setCurrentPage}
                        onRefresh={handleRefreshActivities}
                        onShowSummary={() => handleShowActivitySummary(sortedActivities, getFilterInfo())}
                    />

                    <div className={styles.resultsSummary}>
                        <span>พบ {sortedActivities.length} กิจกรรม</span>
                        <span className={styles.pageInfo}>
                            (แสดงหน้า {currentPage} จาก {totalPages} หน้า)
                        </span>
                        {sortBy && (
                            <span className={styles.searchSummary}>
                                เรียงตาม{sortBy === 'title' ? 'ชื่อกิจกรรม' :
                                    sortBy === 'startTime' ? 'วันที่เริ่ม' :
                                        sortBy === 'endTime' ? 'วันที่สิ้นสุด' :
                                            sortBy === 'type' ? 'ประเภท' : sortBy}
                                ({sortOrder === 'asc' ? 'น้อยไปมาก' : 'มากไปน้อย'})
                            </span>
                        )}
                        {(typeFilter || statusFilter || participationFilter !== 'all') && (
                            <span className={styles.filterSummary}>
                                {typeFilter && `ประเภท: ${typeFilter} `}
                                {statusFilter && `สถานะ: ${statusFilter} `}
                                {participationFilter !== 'all' && `การเข้าร่วม: ${participationFilter === 'registered' ? 'ลงทะเบียนแล้ว' :
                                    participationFilter === 'completed' ? 'เข้าร่วมสำเร็จ' :
                                        participationFilter === 'not_registered' ? 'ยังไม่ลงทะเบียน' : 'ทั้งหมด'
                                    } `}
                            </span>
                        )}
                    </div>

                    <ActivityTable
                        activities={currentRows}
                        onViewActivity={handleViewActivity}
                        onViewImage={handleViewImage}
                        onViewCertificate={handleViewCertificate}
                        actionLoading={actionLoading}
                        sortConfig={sortConfig}
                        onSort={handleSort}
                    />

                    <ActivityPagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        itemsPerPage={rowsPerPage}
                        totalItems={sortedActivities.length}
                    />
                </div>

                {actionLoading && (
                    <div className={styles.actionOverlay}>
                        <div className={styles.actionSpinner}>
                            <div className={styles.spinner}></div>
                            <p>กำลังดำเนินการ...</p>
                        </div>
                    </div>
                )}

                <CustomModal
                    isOpen={modalOpen}
                    message={modalMessage}
                    onClose={closeModal}
                    buttons={modalButtons}
                />

                <ActivityModal
                    isOpen={activityModalOpen}
                    onClose={closeActivityModal}
                    activityId={selectedActivityId}
                />

            </main>
        </div>
    );
}

export default TeacherOwnActivities;