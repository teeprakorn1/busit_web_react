// ActivityFiltersForm/ActivityFiltersForm.js
import React, { useCallback, memo } from 'react';
import { Plus, X, Download } from 'lucide-react';
import { useUserPermissions } from '../hooks/useUserPermissions';
import { exportActivitiesToExcel } from './../utils/activityExportUtils';
import CustomModal from './../../../../services/CustomModal/CustomModal';
import styles from './ActivityFiltersForm.module.css';

const ActivityFiltersForm = memo(({
  searchQuery,
  setSearchQuery,
  typeFilter,
  setTypeFilter,
  statusFilter,
  setStatusFilter,
  dateRangeFilter,
  setDateRangeFilter,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  activityTypes,
  activityStatuses,
  sortedActivities,
  resetFilters,
  setCurrentPage,
  onAddActivity
}) => {
  const permissions = useUserPermissions();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [modalMessage, setModalMessage] = React.useState("");

  const resetToFirstPage = useCallback(() => {
    if (setCurrentPage) {
      setCurrentPage(1);
    }
  }, [setCurrentPage]);

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
    resetToFirstPage();
  }, [setSearchQuery, resetToFirstPage]);

  const handleTypeChange = useCallback((e) => {
    const value = e.target.value;
    setTypeFilter(value);
    resetToFirstPage();
  }, [setTypeFilter, resetToFirstPage]);

  const handleStatusChange = useCallback((e) => {
    const value = e.target.value;
    setStatusFilter(value);
    resetToFirstPage();
  }, [setStatusFilter, resetToFirstPage]);

  const handleDateRangeChange = useCallback((e) => {
    setDateRangeFilter(e.target.value);
    resetToFirstPage();
  }, [setDateRangeFilter, resetToFirstPage]);

  const handleSortByChange = useCallback((e) => {
    setSortBy(e.target.value);
  }, [setSortBy]);

  const handleSortOrderChange = useCallback((e) => {
    setSortOrder(e.target.value);
  }, [setSortOrder]);

  const handleExport = useCallback(() => {
    if (!sortedActivities || sortedActivities.length === 0) {
      setModalMessage("ไม่มีข้อมูลสำหรับการส่งออกข้อมูล");
      setModalOpen(true);
      return;
    }

    const success = exportActivitiesToExcel(sortedActivities);
    if (success) {
      setModalMessage(`ส่งออกข้อมูลสำเร็จ! จำนวน ${sortedActivities.length} รายการ`);
    } else {
      setModalMessage("เกิดข้อผิดพลาดระหว่างการส่งออกข้อมูล");
    }
    setModalOpen(true);
  }, [sortedActivities]);

  return (
    <div className={styles.activityFilter}>
      <div className={styles.actionButtons}>
        {permissions.canManageActivities && (
          <button
            className={styles.addButton}
            onClick={onAddActivity}
          >
            <Plus className={styles.icon} />
            สร้างกิจกรรม
          </button>
        )}

        {permissions.canExportData && sortedActivities && sortedActivities.length > 0 && (
          <button
            className={styles.exportButton}
            onClick={handleExport}
            title={`Export ${sortedActivities.length} รายการ`}
          >
            <Download className={styles.icon} />
            Export Excel
          </button>
        )}
      </div>

      <input
        type="text"
        placeholder="ค้นหากิจกรรม..."
        value={searchQuery}
        onChange={handleSearchChange}
        className={styles.activitySearch}
      />

      <select
        className={styles.activitySelect}
        value={sortBy}
        onChange={handleSortByChange}
      >
        <option value="">เรียงลำดับตาม</option>
        <option value="title">ชื่อกิจกรรม</option>
        <option value="startTime">วันที่เริ่ม</option>
        <option value="endTime">วันที่สิ้นสุด</option>
        <option value="regisTime">วันที่สร้าง</option>
        <option value="updateTime">วันที่แก้ไข</option>
      </select>

      {sortBy && (
        <select
          className={styles.activitySelect}
          value={sortOrder}
          onChange={handleSortOrderChange}
        >
          <option value="asc">น้อยไปมาก (A-Z)</option>
          <option value="desc">มากไปน้อย (Z-A)</option>
        </select>
      )}

      <select
        className={styles.activitySelect}
        value={typeFilter}
        onChange={handleTypeChange}
      >
        <option value="">ทุกประเภท</option>
        {Array.isArray(activityTypes) && activityTypes.map((type) => (
          <option
            key={type.ActivityType_ID}
            value={type.ActivityType_Name}
          >
            {type.ActivityType_Name}
          </option>
        ))}
      </select>

      <select
        className={styles.activitySelect}
        value={statusFilter}
        onChange={handleStatusChange}
      >
        <option value="">ทุกสถานะ</option>
        {Array.isArray(activityStatuses) && activityStatuses.map((status) => (
          <option
            key={status.ActivityStatus_ID}
            value={status.ActivityStatus_Name}
          >
            {status.ActivityStatus_Name}
          </option>
        ))}
      </select>

      <select
        className={styles.activitySelect}
        value={dateRangeFilter}
        onChange={handleDateRangeChange}
      >
        <option value="">ทุกช่วงเวลา</option>
        <option value="upcoming">กำลังจะมาถึง</option>
        <option value="ongoing">กำลังดำเนินการ</option>
        <option value="past">ผ่านไปแล้ว</option>
        <option value="this_week">สัปดาห์นี้</option>
        <option value="this_month">เดือนนี้</option>
      </select>

      {(searchQuery || typeFilter || statusFilter || dateRangeFilter || sortBy) && (
        <button
          className={styles.resetButton}
          onClick={resetFilters}
        >
          <X className={styles.iconSmall} />
          ล้างฟิลเตอร์
        </button>
      )}
      <CustomModal
        isOpen={modalOpen}
        message={modalMessage}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
});

ActivityFiltersForm.displayName = 'ActivityFiltersForm';

export default ActivityFiltersForm;