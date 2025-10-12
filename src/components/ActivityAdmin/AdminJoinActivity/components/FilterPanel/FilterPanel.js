// components/FilterPanel/FilterPanel.js
import React, { useMemo } from 'react';
import { 
  Search, X, Calendar, Users, Building2, 
  Image as ImageIcon, Filter, RotateCcw,
  ChevronDown, Check, GraduationCap, Award,
  Clock, CheckCircle, AlertCircle
} from 'lucide-react';
import styles from './FilterPanel.module.css';

const FilterPanel = ({
  filters,
  updateFilter,
  resetFilters,
  searchQuery,
  setSearchQuery,
  activity,
  participants = []
}) => {
  const hasActiveFilters = 
    searchQuery || 
    filters.status !== 'all' || 
    filters.userType !== 'all' || 
    filters.department !== 'all' || 
    filters.faculty !== 'all' || 
    filters.registrationDate !== 'all' || 
    filters.pictureStatus !== 'all';

  const { departments, faculties } = useMemo(() => {
    const deptSet = new Set();
    const facSet = new Set();
    
    participants.forEach(p => {
      if (p.Department_Name) deptSet.add(p.Department_Name);
      if (p.Faculty_Name) facSet.add(p.Faculty_Name);
    });

    return {
      departments: Array.from(deptSet).sort(),
      faculties: Array.from(facSet).sort()
    };
  }, [participants]);

  const filterStats = useMemo(() => ({
    total: participants.length,
    pending: participants.filter(p => !p.Registration_CheckInTime).length,
    checkedIn: participants.filter(p => p.Registration_CheckInTime && !p.Registration_CheckOutTime).length,
    completed: participants.filter(p => p.Registration_CheckOutTime).length,
    students: participants.filter(p => p.isStudent).length,
    teachers: participants.filter(p => p.isTeacher).length,
    withImages: participants.filter(p => p.hasImages).length,
  }), [participants]);

  return (
    <div className={styles.filterPanel}>
      <div className={styles.filterHeader}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>
              <Filter size={20} />
            </div>
            <div>
              <h3>ตัวกรองขั้นสูง</h3>
              <p className={styles.headerSubtext}>
                {hasActiveFilters 
                  ? `กำลังใช้ตัวกรอง - แสดง ${filterStats.total} รายการ`
                  : 'เลือกเงื่อนไขเพื่อกรองรายการ'}
              </p>
            </div>
          </div>
          {hasActiveFilters && (
            <button className={styles.resetButton} onClick={resetFilters}>
              <RotateCcw size={16} />
              <span>รีเซ็ตทั้งหมด</span>
            </button>
          )}
        </div>
      </div>

      <div className={styles.filterContent}>
        {/* Search Section */}
        <div className={styles.filterSection}>
          <label className={styles.filterLabel}>
            <Search size={16} />
            <span>ค้นหา</span>
          </label>
          <div className={styles.searchBox}>
            <Search size={18} />
            <input
              type="text"
              placeholder="ค้นหาชื่อ, รหัส, อีเมล, สาขา..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                className={styles.clearButton}
                onClick={() => setSearchQuery('')}
                title="ล้างคำค้นหา"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Status Filter */}
        <div className={styles.filterSection}>
          <label className={styles.filterLabel}>
            <Users size={16} />
            <span>สถานะการเข้าร่วม</span>
            <span className={styles.filterBadge}>{filterStats.total}</span>
          </label>
          <div className={styles.radioGroup}>
            <label className={`${styles.radioOption} ${filters.status === 'all' ? styles.active : ''}`}>
              <input
                type="radio"
                name="status"
                value="all"
                checked={filters.status === 'all'}
                onChange={() => updateFilter('status', 'all')}
              />
              <div className={styles.radioContent}>
                <div className={styles.radioIcon}>
                  <Users size={16} />
                </div>
                <div className={styles.radioText}>
                  <span className={styles.radioLabel}>ทั้งหมด</span>
                  <span className={styles.radioCount}>{filterStats.total} คน</span>
                </div>
              </div>
              {filters.status === 'all' && (
                <div className={styles.radioCheck}>
                  <Check size={16} />
                </div>
              )}
            </label>

            <label className={`${styles.radioOption} ${filters.status === 'pending' ? styles.active : ''}`}>
              <input
                type="radio"
                name="status"
                value="pending"
                checked={filters.status === 'pending'}
                onChange={() => updateFilter('status', 'pending')}
              />
              <div className={styles.radioContent}>
                <div className={`${styles.radioIcon} ${styles.warning}`}>
                  <Clock size={16} />
                </div>
                <div className={styles.radioText}>
                  <span className={styles.radioLabel}>รอเช็คอิน</span>
                  <span className={styles.radioCount}>{filterStats.pending} คน</span>
                </div>
              </div>
              {filters.status === 'pending' && (
                <div className={styles.radioCheck}>
                  <Check size={16} />
                </div>
              )}
            </label>

            <label className={`${styles.radioOption} ${filters.status === 'checked_in' ? styles.active : ''}`}>
              <input
                type="radio"
                name="status"
                value="checked_in"
                checked={filters.status === 'checked_in'}
                onChange={() => updateFilter('status', 'checked_in')}
              />
              <div className={styles.radioContent}>
                <div className={`${styles.radioIcon} ${styles.primary}`}>
                  <AlertCircle size={16} />
                </div>
                <div className={styles.radioText}>
                  <span className={styles.radioLabel}>เช็คอินแล้ว</span>
                  <span className={styles.radioCount}>{filterStats.checkedIn} คน</span>
                </div>
              </div>
              {filters.status === 'checked_in' && (
                <div className={styles.radioCheck}>
                  <Check size={16} />
                </div>
              )}
            </label>

            <label className={`${styles.radioOption} ${filters.status === 'completed' ? styles.active : ''}`}>
              <input
                type="radio"
                name="status"
                value="completed"
                checked={filters.status === 'completed'}
                onChange={() => updateFilter('status', 'completed')}
              />
              <div className={styles.radioContent}>
                <div className={`${styles.radioIcon} ${styles.success}`}>
                  <CheckCircle size={16} />
                </div>
                <div className={styles.radioText}>
                  <span className={styles.radioLabel}>เสร็จสิ้น</span>
                  <span className={styles.radioCount}>{filterStats.completed} คน</span>
                </div>
              </div>
              {filters.status === 'completed' && (
                <div className={styles.radioCheck}>
                  <Check size={16} />
                </div>
              )}
            </label>
          </div>
        </div>

        {/* User Type Filter (if activity allows teachers) */}
        {activity?.Activity_AllowTeachers && (
          <div className={styles.filterSection}>
            <label className={styles.filterLabel}>
              <Users size={16} />
              <span>ประเภทผู้ใช้</span>
            </label>
            <div className={styles.toggleGroup}>
              <button
                className={`${styles.toggleBtn} ${filters.userType === 'all' ? styles.active : ''}`}
                onClick={() => updateFilter('userType', 'all')}
              >
                <Users size={16} />
                <span>ทั้งหมด</span>
                <span className={styles.toggleCount}>{filterStats.total}</span>
              </button>
              <button
                className={`${styles.toggleBtn} ${filters.userType === 'student' ? styles.active : ''}`}
                onClick={() => updateFilter('userType', 'student')}
              >
                <GraduationCap size={16} />
                <span>นักศึกษา</span>
                <span className={styles.toggleCount}>{filterStats.students}</span>
              </button>
              <button
                className={`${styles.toggleBtn} ${filters.userType === 'teacher' ? styles.active : ''}`}
                onClick={() => updateFilter('userType', 'teacher')}
              >
                <Award size={16} />
                <span>อาจารย์</span>
                <span className={styles.toggleCount}>{filterStats.teachers}</span>
              </button>
            </div>
          </div>
        )}

        {/* Registration Date Filter */}
        <div className={styles.filterSection}>
          <label className={styles.filterLabel}>
            <Calendar size={16} />
            <span>ช่วงเวลาลงทะเบียน</span>
          </label>
          <div className={styles.buttonGroup}>
            <button
              className={`${styles.filterChip} ${filters.registrationDate === 'all' ? styles.active : ''}`}
              onClick={() => updateFilter('registrationDate', 'all')}
            >
              ทั้งหมด
            </button>
            <button
              className={`${styles.filterChip} ${filters.registrationDate === 'today' ? styles.active : ''}`}
              onClick={() => updateFilter('registrationDate', 'today')}
            >
              วันนี้
            </button>
            <button
              className={`${styles.filterChip} ${filters.registrationDate === 'week' ? styles.active : ''}`}
              onClick={() => updateFilter('registrationDate', 'week')}
            >
              สัปดาห์นี้
            </button>
            <button
              className={`${styles.filterChip} ${filters.registrationDate === 'month' ? styles.active : ''}`}
              onClick={() => updateFilter('registrationDate', 'month')}
            >
              เดือนนี้
            </button>
          </div>
        </div>

        {/* Picture Status Filter */}
        <div className={styles.filterSection}>
          <label className={styles.filterLabel}>
            <ImageIcon size={16} />
            <span>สถานะรูปภาพ</span>
          </label>
          <div className={styles.buttonGroup}>
            <button
              className={`${styles.filterChip} ${filters.pictureStatus === 'all' ? styles.active : ''}`}
              onClick={() => updateFilter('pictureStatus', 'all')}
            >
              ทั้งหมด
            </button>
            <button
              className={`${styles.filterChip} ${filters.pictureStatus === 'has_picture' ? styles.active : ''}`}
              onClick={() => updateFilter('pictureStatus', 'has_picture')}
            >
              <ImageIcon size={14} />
              มีรูปภาพ
            </button>
            <button
              className={`${styles.filterChip} ${filters.pictureStatus === 'no_picture' ? styles.active : ''}`}
              onClick={() => updateFilter('pictureStatus', 'no_picture')}
            >
              <X size={14} />
              ไม่มีรูปภาพ
            </button>
            <button
              className={`${styles.filterChip} ${filters.pictureStatus === 'pending_approval' ? styles.active : ''}`}
              onClick={() => updateFilter('pictureStatus', 'pending_approval')}
            >
              <Clock size={14} />
              รออนุมัติ
            </button>
          </div>
        </div>

        {/* Department Filter */}
        {departments.length > 0 && (
          <div className={styles.filterSection}>
            <label className={styles.filterLabel}>
              <Building2 size={16} />
              <span>สาขาวิชา</span>
              {filters.department !== 'all' && (
                <span className={styles.activeIndicator}>●</span>
              )}
            </label>
            <div className={styles.selectWrapper}>
              <select
                className={styles.filterSelect}
                value={filters.department}
                onChange={(e) => updateFilter('department', e.target.value)}
              >
                <option value="all">ทุกสาขา ({participants.length} คน)</option>
                {departments.map(dept => {
                  const count = participants.filter(p => p.Department_Name === dept).length;
                  return (
                    <option key={dept} value={dept}>
                      {dept} ({count} คน)
                    </option>
                  );
                })}
              </select>
              <ChevronDown className={styles.selectIcon} size={18} />
            </div>
          </div>
        )}

        {/* Faculty Filter */}
        {faculties.length > 1 && (
          <div className={styles.filterSection}>
            <label className={styles.filterLabel}>
              <Building2 size={16} />
              <span>คณะ</span>
              {filters.faculty !== 'all' && (
                <span className={styles.activeIndicator}>●</span>
              )}
            </label>
            <div className={styles.selectWrapper}>
              <select
                className={styles.filterSelect}
                value={filters.faculty}
                onChange={(e) => updateFilter('faculty', e.target.value)}
              >
                <option value="all">ทุกคณะ ({participants.length} คน)</option>
                {faculties.map(fac => {
                  const count = participants.filter(p => p.Faculty_Name === fac).length;
                  return (
                    <option key={fac} value={fac}>
                      {fac} ({count} คน)
                    </option>
                  );
                })}
              </select>
              <ChevronDown className={styles.selectIcon} size={18} />
            </div>
          </div>
        )}
      </div>

      {/* Filter Summary */}
      {hasActiveFilters && (
        <div className={styles.filterSummary}>
          <div className={styles.summaryHeader}>
            <span className={styles.summaryTitle}>ตัวกรองที่เลือก:</span>
          </div>
          <div className={styles.summaryTags}>
            {searchQuery && (
              <div className={styles.summaryTag}>
                <Search size={12} />
                <span>"{searchQuery}"</span>
                <button onClick={() => setSearchQuery('')}>
                  <X size={12} />
                </button>
              </div>
            )}
            {filters.status !== 'all' && (
              <div className={styles.summaryTag}>
                <Users size={12} />
                <span>สถานะ: {filters.status}</span>
                <button onClick={() => updateFilter('status', 'all')}>
                  <X size={12} />
                </button>
              </div>
            )}
            {filters.userType !== 'all' && (
              <div className={styles.summaryTag}>
                <Users size={12} />
                <span>ประเภท: {filters.userType === 'student' ? 'นักศึกษา' : 'อาจารย์'}</span>
                <button onClick={() => updateFilter('userType', 'all')}>
                  <X size={12} />
                </button>
              </div>
            )}
            {filters.department !== 'all' && (
              <div className={styles.summaryTag}>
                <Building2 size={12} />
                <span>{filters.department}</span>
                <button onClick={() => updateFilter('department', 'all')}>
                  <X size={12} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;