// ActivityEditFiltersForm/ActivityEditFiltersForm.js
import React from 'react';
import { Upload, X, Calendar } from 'lucide-react';
import DatePicker, { registerLocale } from 'react-datepicker';
import th from 'date-fns/locale/th';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './ActivityEditFiltersForm.module.css';

registerLocale('th', th);

const formatBuddhistDate = (date) => {
  const d = new Date(date);
  const buddhistYear = d.getFullYear() + 543;
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${buddhistYear}`;
};

const formatEditType = (editType) => {
  if (!editType) return 'Unknown';
  return editType
    .replace(/^dataedit_/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
};

const ActivityEditFiltersForm = ({
  searchQuery,
  setSearchQuery,
  editTypeFilter,
  setEditTypeFilter,
  dateFilter,
  setDateFilter,
  uniqueEditTypes = [],
  filteredActivityEdits = [],
  exportToExcel,
  resetFilters,
  hasActiveFilters,
  setCurrentPage,
  canExport = true
}) => {
  return (
    <div className={styles.dataEditFilter}>
      {/* Export Button */}
      <button
        className={styles.exportButton}
        onClick={exportToExcel}
        disabled={!canExport || filteredActivityEdits.length === 0}
        aria-label="ส่งออกข้อมูลเป็น Excel"
      >
        <Upload className={styles.icon} /> 
        Export Excel
      </button>

      {/* Search Input */}
      <input
        type="text"
        placeholder="ค้นหา รหัสกิจกรรม, ชื่อกิจกรรม, อีเมล, รหัสเจ้าหน้าที่, IP, ประเภทการแก้ไข..."
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setCurrentPage(1);
        }}
        className={styles.dataEditSearch}
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
          isClearable
          customInput={
            <button className={styles.timeButton} type="button">
              <Calendar className={styles.icon} style={{ marginRight: '5px' }} />
              {dateFilter ? formatBuddhistDate(dateFilter) : 'เลือกวัน'}
            </button>
          }
        />
      </div>

      {/* Edit Type Filter */}
      <select
        className={styles.dataEditSelect}
        value={editTypeFilter}
        onChange={(e) => {
          setEditTypeFilter(e.target.value);
          setCurrentPage(1);
        }}
        aria-label="กรองตามประเภทการแก้ไข"
      >
        <option value="">ประเภทการแก้ไข</option>
        {uniqueEditTypes.map((editType, idx) => (
          <option key={idx} value={editType}>
            {formatEditType(editType)}
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

export default ActivityEditFiltersForm;