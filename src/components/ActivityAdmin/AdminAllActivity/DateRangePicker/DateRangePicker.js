// DateRangePicker/DateRangePicker.js
import React, { useState, useRef, useEffect } from 'react';
import { Calendar, X } from 'lucide-react';
import styles from './DateRangePicker.module.css';

const DateRangePicker = ({ onDateRangeChange, value }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState(value?.start || '');
  const [endDate, setEndDate] = useState(value?.end || '');
  const [tempStartDate, setTempStartDate] = useState(value?.start || '');
  const [tempEndDate, setTempEndDate] = useState(value?.end || '');
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
        setTempStartDate(startDate);
        setTempEndDate(endDate);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, startDate, endDate]);

  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleApply = () => {
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setIsOpen(false);

    if (onDateRangeChange) {
      onDateRangeChange({
        start: tempStartDate,
        end: tempEndDate
      });
    }
  };

  const handleClear = () => {
    setStartDate('');
    setEndDate('');
    setTempStartDate('');
    setTempEndDate('');
    setIsOpen(false);

    if (onDateRangeChange) {
      onDateRangeChange({ start: '', end: '' });
    }
  };

  const handlePreset = (preset) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let start = new Date(today);
    let end = new Date(today);

    switch (preset) {
      case 'today':
        // Already set
        break;
      case 'tomorrow':
        start.setDate(today.getDate() + 1);
        end.setDate(today.getDate() + 1);
        break;
      case 'this_week':
        // Start from Monday
        const dayOfWeek = today.getDay();
        const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        start.setDate(today.getDate() + daysToMonday);
        end.setDate(start.getDate() + 6);
        break;
      case 'next_week':
        const daysToNextMonday = 8 - (today.getDay() || 7);
        start.setDate(today.getDate() + daysToNextMonday);
        end.setDate(start.getDate() + 6);
        break;
      case 'this_month':
        start.setDate(1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'next_month':
        start = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        end = new Date(today.getFullYear(), today.getMonth() + 2, 0);
        break;
      default:
        return;
    }

    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    setTempStartDate(startStr);
    setTempEndDate(endStr);
  };

  const getDisplayText = () => {
    if (startDate && endDate) {
      return `${formatDateForDisplay(startDate)} - ${formatDateForDisplay(endDate)}`;
    } else if (startDate) {
      return `จาก ${formatDateForDisplay(startDate)}`;
    } else if (endDate) {
      return `ถึง ${formatDateForDisplay(endDate)}`;
    }
    return 'เลือกช่วงวันที่';
  };

  const getTodayString = () => {
    return new Date().toISOString().split('T')[0];
  };

  return (
    <div className={styles.container} ref={pickerRef}>
      <button
        type="button"
        className={`${styles.trigger} ${(startDate || endDate) ? styles.hasValue : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Calendar className={styles.icon} />
        <span className={styles.text}>{getDisplayText()}</span>
        {(startDate || endDate) && (
          <X
            className={styles.clearIcon}
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
          />
        )}
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <h3>เลือกช่วงวันที่</h3>
          </div>

          <div className={styles.presets}>
            <button
              type="button"
              className={styles.presetBtn}
              onClick={() => handlePreset('today')}
            >
              วันนี้
            </button>
            <button
              type="button"
              className={styles.presetBtn}
              onClick={() => handlePreset('tomorrow')}
            >
              พรุ่งนี้
            </button>
            <button
              type="button"
              className={styles.presetBtn}
              onClick={() => handlePreset('this_week')}
            >
              สัปดาห์นี้
            </button>
            <button
              type="button"
              className={styles.presetBtn}
              onClick={() => handlePreset('next_week')}
            >
              สัปดาห์หน้า
            </button>
            <button
              type="button"
              className={styles.presetBtn}
              onClick={() => handlePreset('this_month')}
            >
              เดือนนี้
            </button>
            <button
              type="button"
              className={styles.presetBtn}
              onClick={() => handlePreset('next_month')}
            >
              เดือนหน้า
            </button>
          </div>

          <div className={styles.dateInputs}>
            <div className={styles.inputGroup}>
              <label>วันที่เริ่มต้น</label>
              <input
                type="date"
                value={tempStartDate}
                max={tempEndDate || undefined}
                onChange={(e) => setTempStartDate(e.target.value)}
                className={styles.dateInput}
              />
            </div>

            <div className={styles.inputGroup}>
              <label>วันที่สิ้นสุด</label>
              <input
                type="date"
                value={tempEndDate}
                min={tempStartDate || getTodayString()}
                onChange={(e) => setTempEndDate(e.target.value)}
                className={styles.dateInput}
              />
            </div>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => {
                setIsOpen(false);
                setTempStartDate(startDate);
                setTempEndDate(endDate);
              }}
            >
              ยกเลิก
            </button>
            <button
              type="button"
              className={styles.clearBtn}
              onClick={handleClear}
            >
              ล้างค่า
            </button>
            <button
              type="button"
              className={styles.applyBtn}
              onClick={handleApply}
              disabled={!tempStartDate && !tempEndDate}
            >
              ใช้งาน
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;