import React, { useCallback, useRef, useEffect, memo } from 'react';
import { Upload, X } from 'lucide-react';
import { useUserPermissions } from '../hooks/useUserPermissions';
import styles from './ActivityFiltersForm.module.css';

const SearchInput = memo(({ value, onChange, placeholder, className, ariaLabel }) => {
    const inputRef = useRef(null);
    const selectionRef = useRef({ start: 0, end: 0 });
    const isComposingRef = useRef(false);

    const handleBeforeInput = useCallback(() => {
        if (inputRef.current && !isComposingRef.current) {
            selectionRef.current = {
                start: inputRef.current.selectionStart || 0,
                end: inputRef.current.selectionEnd || 0
            };
        }
    }, []);

    const handleChange = useCallback((e) => {
        const newValue = e.target.value;
        const input = e.target;

        if (!isComposingRef.current) {
            selectionRef.current = {
                start: input.selectionStart || 0,
                end: input.selectionEnd || 0
            };
        }

        onChange(newValue);
    }, [onChange]);

    const handleCompositionStart = useCallback(() => {
        isComposingRef.current = true;
    }, []);

    const handleCompositionEnd = useCallback(() => {
        isComposingRef.current = false;
    }, []);

    useEffect(() => {
        if (inputRef.current && document.activeElement === inputRef.current) {
            const input = inputRef.current;
            const { start, end } = selectionRef.current;
            const maxPos = value.length;
            const safeStart = Math.min(start, maxPos);
            const safeEnd = Math.min(end, maxPos);

            requestAnimationFrame(() => {
                try {
                    if (input === document.activeElement) {
                        input.setSelectionRange(safeStart, safeEnd);
                    }
                } catch (error) {
                    console.error("requestAnimationFrame Error");
                }
            });
        }
    }, [value]);

    return (
        <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            onBeforeInput={handleBeforeInput}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            className={className}
            aria-label={ariaLabel}
            autoComplete="off"
            spellCheck="false"
        />
    );
});

SearchInput.displayName = 'SearchInput';

const ActivityFiltersForm = memo(({
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
    activityTypes,
    activityStatuses,
    sortedActivities,
    exportToExcel,
    resetFilters,
    setCurrentPage,
    onRefresh,
    onShowSummary
}) => {
    const permissions = useUserPermissions();

    const resetToFirstPage = useCallback(() => {
        if (setCurrentPage) {
            setCurrentPage(1);
        }
    }, [setCurrentPage]);

    const handleSearchChange = useCallback((newValue) => {
        setSearchQuery(newValue);
        resetToFirstPage();
    }, [setSearchQuery, resetToFirstPage]);

    const handleTypeChange = useCallback((e) => {
        setTypeFilter(e.target.value);
        resetToFirstPage();
    }, [setTypeFilter, resetToFirstPage]);

    const handleStatusChange = useCallback((e) => {
        setStatusFilter(e.target.value);
        resetToFirstPage();
    }, [setStatusFilter, resetToFirstPage]);

    const handleParticipationChange = useCallback((e) => {
        setParticipationFilter(e.target.value);
        resetToFirstPage();
    }, [setParticipationFilter, resetToFirstPage]);

    const handleSortByChange = useCallback((e) => {
        setSortBy(e.target.value);
    }, [setSortBy]);

    const handleSortOrderChange = useCallback((e) => {
        setSortOrder(e.target.value);
    }, [setSortOrder]);

    return (
        <div className={styles.activitiesFilter}>
            {permissions.canExportData && (
                <button
                    className={styles.exportButton}
                    onClick={exportToExcel}
                    disabled={sortedActivities.length === 0}
                    aria-label="ส่งออกข้อมูลเป็น Excel"
                >
                    <Upload className={styles.icon} />
                    Export Excel
                </button>
            )}

            {permissions.isTeacher && (
                <div className={styles.permissionInfo}>
                    <span>ระดับการเข้าถึง: อาจารย์ (ดูข้อมูล/ส่งออกข้อมูล)</span>
                </div>
            )}

            <SearchInput
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="ค้นหา ชื่อกิจกรรม, รายละเอียด, สถานที่..."
                className={styles.activitiesSearch}
                ariaLabel="ค้นหาข้อมูล"
            />

            <select
                className={styles.activitiesSelect}
                value={sortBy}
                onChange={handleSortByChange}
                aria-label="เรียงลำดับตาม"
            >
                <option value="">เรียงลำดับตาม</option>
                <option value="title">ชื่อกิจกรรม</option>
                <option value="startTime">วันที่เริ่ม</option>
                <option value="endTime">วันที่สิ้นสุด</option>
                <option value="type">ประเภทกิจกรรม</option>
                <option value="status">สถานะกิจกรรม</option>
                <option value="regisTime">วันที่เพิ่มในระบบ</option>
            </select>

            {sortBy && (
                <select
                    className={styles.activitiesSelect}
                    value={sortOrder}
                    onChange={handleSortOrderChange}
                    aria-label="ลำดับการเรียง"
                >
                    <option value="asc">น้อยไปมาก (A-Z)</option>
                    <option value="desc">มากไปน้อย (Z-A)</option>
                </select>
            )}

            <select
                className={styles.activitiesSelect}
                value={typeFilter}
                onChange={handleTypeChange}
                aria-label="กรองตามประเภท"
            >
                <option value="">ทุกประเภท</option>
                {activityTypes.map((type) => (
                    <option key={type.ActivityType_ID} value={type.ActivityType_Name}>
                        {type.ActivityType_Name}
                    </option>
                ))}
            </select>

            <select
                className={styles.activitiesSelect}
                value={statusFilter}
                onChange={handleStatusChange}
                aria-label="กรองตามสถานะ"
            >
                <option value="">ทุกสถานะ</option>
                {activityStatuses.map((status) => (
                    <option key={status.ActivityStatus_ID} value={status.ActivityStatus_Name}>
                        {status.ActivityStatus_Name}
                    </option>
                ))}
            </select>

            <select
                className={styles.activitiesSelect}
                value={participationFilter}
                onChange={handleParticipationChange}
                aria-label="กรองตามการเข้าร่วม"
            >
                <option value="all">ทั้งหมด</option>
                <option value="registered">ลงทะเบียนแล้ว</option>
                <option value="completed">เข้าร่วมสำเร็จ</option>
                <option value="not_registered">ยังไม่ลงทะเบียน</option>
            </select>

            {(searchQuery || typeFilter || statusFilter ||
                participationFilter !== "all" || sortBy) && (
                    <button
                        className={styles.resetButton}
                        onClick={resetFilters}
                        aria-label="ล้างฟิลเตอร์ทั้งหมด"
                    >
                        <X className={styles.iconSmall} style={{ marginRight: '5px' }} />
                        ล้างฟิลเตอร์
                    </button>
                )}
        </div>
    );
});

ActivityFiltersForm.displayName = 'ActivityFiltersForm';

export default ActivityFiltersForm;