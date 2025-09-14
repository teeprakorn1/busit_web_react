import React from 'react';
import { Upload, X, Calendar } from 'lucide-react';
import DatePicker, { registerLocale } from 'react-datepicker';
import th from 'date-fns/locale/th';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './TimestampFiltersForm.module.css';

registerLocale('th', th);

const formatBuddhistDate = (date) => {
  const d = new Date(date);
  const buddhistYear = d.getFullYear() + 543;
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${buddhistYear}`;
};

const formatEventType = (eventType) => {
  if (!eventType) return 'Unknown';
  return eventType
    .replace(/^timestamp_/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
};

const TimestampFiltersForm = ({
  searchQuery,
  setSearchQuery,
  userTypeFilter,
  setUserTypeFilter,
  eventTypeFilter,
  setEventTypeFilter,
  dateFilter,
  setDateFilter,
  uniqueEventTypes,
  filteredTimestamps,
  exportToExcel,
  resetFilters,
  hasActiveFilters,
  setCurrentPage
}) => {
  return (
    <div className={styles.timestampFilter}>
      {/* Export Button */}
      <button
        className={styles.exportButton}
        onClick={exportToExcel}
        disabled={filteredTimestamps.length === 0}
        aria-label="ส่งออกข้อมูลเป็น Excel"
      >
        <Upload className={styles.icon} /> 
        Export Excel
      </button>

      {/* Search Input */}
      <input
        type="text"
        placeholder="ค้นหา อีเมล, IP, เหตุการณ์..."
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setCurrentPage(1);
        }}
        className={styles.timestampSearch}
        aria-label="ค้นหาข้อมูล"
      />

      {/* Date Picker */}
      <div className={styles.datePickerWrapper}>
        <DatePicker
          selected={dateFilter}
          onChange={(date) => {
            setDateFilter(date);
            setCurrentPage(1);
          }}
          dateFormat="dd/MM/yyyy"
          placeholderText="เลือกวัน"
          className={styles.timeButton}
          locale="th"
          customInput={
            <button className={styles.timeButton} type="button">
              <Calendar className={styles.icon} style={{ marginRight: '5px' }} />
              {dateFilter ? formatBuddhistDate(dateFilter) : 'เลือกวัน'}
            </button>
          }
        />
      </div>

      {/* User Type Filter */}
      <select
        className={styles.timestampSelect}
        value={userTypeFilter}
        onChange={(e) => {
          setUserTypeFilter(e.target.value);
          setCurrentPage(1);
        }}
        aria-label="กรองตามประเภทผู้ใช้"
      >
        <option value="">ประเภทผู้ใช้งาน</option>
        <option value="student">นักเรียน/นักศึกษา</option>
        <option value="teacher">ครู/อาจารย์</option>
        <option value="staff">เจ้าหน้าที่</option>
      </select>

      {/* Event Type Filter */}
      <select
        className={styles.timestampSelect}
        value={eventTypeFilter}
        onChange={(e) => {
          setEventTypeFilter(e.target.value);
          setCurrentPage(1);
        }}
        aria-label="กรองตามประเภทเหตุการณ์"
      >
        <option value="">ประเภทเหตุการณ์</option>
        {uniqueEventTypes.map((eventName, idx) => (
          <option key={idx} value={eventName}>
            {formatEventType(eventName)}
          </option>
        ))}
      </select>

      {/* Reset Filters Button */}
      {hasActiveFilters && (
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
};

export default TimestampFiltersForm;