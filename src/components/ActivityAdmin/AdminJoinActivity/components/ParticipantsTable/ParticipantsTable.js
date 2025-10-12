// components/ParticipantsTable/ParticipantsTable.js
import React, { useState, useMemo } from 'react';
import {
  User, Mail, Building2, GraduationCap,
  CheckCircle, Clock, Image as ImageIcon,
  ChevronDown, ChevronUp, Search,
  LogIn, Eye, RefreshCw,
  CheckSquare, Square,
  AlertCircle, Info, Calendar, Award, XCircle
} from 'lucide-react';
import styles from './ParticipantsTable.module.css';

const ParticipantsTable = ({
  participants,
  isSelected,
  toggleSelection,
  selectAll,
  deselectAll,
  isAllSelected,
  onViewImages,
  onRefresh,
  participantImages,
  activity
}) => {
  const [sortField, setSortField] = useState('Registration_RegisTime');
  const [sortDirection, setSortDirection] = useState('desc');
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [quickFilter, setQuickFilter] = useState('all');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleRowExpand = (userId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedRows(newExpanded);
  };

  const getImageStats = (userId) => {
    const images = participantImages[userId] || [];
    return {
      total: images.length,
      pending: images.filter(img => img.RegistrationPictureStatus_ID === 1).length,
      approved: images.filter(img => img.RegistrationPictureStatus_ID === 2).length,
      rejected: images.filter(img => img.RegistrationPictureStatus_ID === 3).length
    };
  };

  const getStatusClassName = (stats) => {
    if (stats.total === 0) return styles.empty;

    const hasMultipleStatus = [
      stats.pending > 0,
      stats.approved > 0,
      stats.rejected > 0
    ].filter(Boolean).length > 1;

    if (hasMultipleStatus) return styles.hasMixed;
    if (stats.pending > 0) return styles.hasPending;
    if (stats.approved > 0) return styles.hasApproved;
    if (stats.rejected > 0) return styles.hasRejected;

    return '';
  };

  const renderImageStatusText = (userId) => {
    const stats = getImageStats(userId);
    const className = getStatusClassName(stats);

    if (stats.total === 0) {
      return (
        <div className={`${styles.pictureStatusText} ${className}`}>
          ไม่มีรูป
        </div>
      );
    }

    const parts = [];
    if (stats.pending > 0) {
      parts.push(
        <span key="pending" className={`${styles.statusPart} ${styles.pending}`}>
          รออนุมัติ {stats.pending}
        </span>
      );
    }
    if (stats.approved > 0) {
      parts.push(
        <span key="approved" className={`${styles.statusPart} ${styles.approved}`}>
          อนุมัติ {stats.approved}
        </span>
      );
    }
    if (stats.rejected > 0) {
      parts.push(
        <span key="rejected" className={`${styles.statusPart} ${styles.rejected}`}>
          ปฏิเสธ {stats.rejected}
        </span>
      );
    }

    const withSeparators = parts.reduce((acc, part, idx) => {
      if (idx > 0) {
        acc.push(<span key={`sep-${idx}`} className={styles.separator}>,</span>);
      }
      acc.push(part);
      return acc;
    }, []);

    return (
      <div
        className={`${styles.pictureStatusText} ${className}`}
        title={`ทั้งหมด ${stats.total} รูป`}
      >
        {withSeparators}
      </div>
    );
  };

  const filteredAndSortedParticipants = useMemo(() => {
    let filtered = [...participants];

    if (quickFilter === 'pending') {
      filtered = filtered.filter(p => !p.Registration_CheckInTime);
    } else if (quickFilter === 'checked_in') {
      filtered = filtered.filter(p => p.Registration_CheckInTime && !p.Registration_CheckOutTime);
    } else if (quickFilter === 'completed') {
      filtered = filtered.filter(p => p.Registration_CheckOutTime);
    }

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.FirstName?.toLowerCase().includes(search) ||
        p.LastName?.toLowerCase().includes(search) ||
        p.Code?.toLowerCase().includes(search) ||
        p.Users_Email?.toLowerCase().includes(search) ||
        p.Department_Name?.toLowerCase().includes(search)
      );
    }

    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'FirstName' || sortField === 'LastName') {
        aVal = (aVal || '').toLowerCase();
        bVal = (bVal || '').toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });

    return filtered;
  }, [participants, quickFilter, searchTerm, sortField, sortDirection]);

  const stats = useMemo(() => ({
    total: participants.length,
    filtered: filteredAndSortedParticipants.length,
    pending: participants.filter(p => !p.Registration_CheckInTime).length,
    checkedIn: participants.filter(p => p.Registration_CheckInTime && !p.Registration_CheckOutTime).length,
    completed: participants.filter(p => p.Registration_CheckOutTime).length,
    students: participants.filter(p => p.isStudent).length,
    teachers: participants.filter(p => p.isTeacher).length
  }), [participants, filteredAndSortedParticipants]);

  const getStatusBadge = (participant) => {
    if (participant.Registration_CheckOutTime) {
      return (
        <span className={`${styles.statusBadge} ${styles.completed}`}>
          <CheckCircle size={14} />
          เสร็จสิ้น
        </span>
      );
    }
    if (participant.Registration_CheckInTime) {
      return (
        <span className={`${styles.statusBadge} ${styles.checkedIn}`}>
          <LogIn size={14} />
          เช็คอินแล้ว
        </span>
      );
    }
    return (
      <span className={`${styles.statusBadge} ${styles.pending}`}>
        <Clock size={14} />
        รอเช็คอิน
      </span>
    );
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return '-';
    return new Date(dateTime).toLocaleString('th-TH', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDuration = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return null;
    const duration = new Date(checkOut) - new Date(checkIn);
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours} ชม. ${minutes} นาที`;
  };

  const SortButton = ({ field, label }) => (
    <button
      className={`${styles.sortButton} ${sortField === field ? styles.active : ''}`}
      onClick={() => handleSort(field)}
    >
      {label}
      {sortField === field && (
        sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
      )}
    </button>
  );

  if (participants.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>
          <User size={64} />
        </div>
        <h3>ยังไม่มีผู้เข้าร่วมกิจกรรม</h3>
        <p>เมื่อมีผู้ลงทะเบียนเข้าร่วมกิจกรรม รายชื่อจะแสดงที่นี่</p>
        <div className={styles.emptyHint}>
          <Info size={16} />
          <span>ผู้ใช้สามารถลงทะเบียนผ่านแอพพลิเคชัน</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}>
      {/* Header */}
      <div className={styles.tableHeader}>
        <div className={styles.headerTop}>
          <div className={styles.tableTitle}>
            <h3>รายชื่อผู้เข้าร่วม</h3>
            <span className={styles.participantCount}>
              {filteredAndSortedParticipants.length} คน
              {filteredAndSortedParticipants.length !== participants.length && (
                <span className={styles.filteredNote}>
                  (จาก {participants.length} คน)
                </span>
              )}
            </span>
          </div>

          <div className={styles.headerActions}>
            <button
              className={styles.refreshButton}
              onClick={onRefresh}
              title="รีเฟรช"
            >
              <RefreshCw size={18} />
              <span>รีเฟรช</span>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className={styles.quickStats}>
          <div className={styles.statItem}>
            <Clock size={16} />
            <span className={styles.statValue}>{stats.pending}</span>
            <span className={styles.statLabel}>รอเช็คอิน</span>
          </div>
          <div className={styles.statItem}>
            <LogIn size={16} />
            <span className={styles.statValue}>{stats.checkedIn}</span>
            <span className={styles.statLabel}>เช็คอินแล้ว</span>
          </div>
          <div className={styles.statItem}>
            <CheckCircle size={16} />
            <span className={styles.statValue}>{stats.completed}</span>
            <span className={styles.statLabel}>เสร็จสิ้น</span>
          </div>
          {activity?.Activity_AllowTeachers && (
            <>
              <div className={styles.statDivider}></div>
              <div className={styles.statItem}>
                <GraduationCap size={16} />
                <span className={styles.statValue}>{stats.students}</span>
                <span className={styles.statLabel}>นักศึกษา</span>
              </div>
              <div className={styles.statItem}>
                <Award size={16} />
                <span className={styles.statValue}>{stats.teachers}</span>
                <span className={styles.statLabel}>อาจารย์</span>
              </div>
            </>
          )}
        </div>

        {/* Search and Filter */}
        <div className={styles.filterBar}>
          <div className={styles.searchBox}>
            <Search size={18} />
            <input
              type="text"
              placeholder="ค้นหาชื่อ, รหัส, อีเมล, สาขา..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className={styles.clearSearch}
                onClick={() => setSearchTerm('')}
              >
                ×
              </button>
            )}
          </div>

          <div className={styles.quickFilters}>
            <button
              className={`${styles.quickFilterBtn} ${quickFilter === 'all' ? styles.active : ''}`}
              onClick={() => setQuickFilter('all')}
            >
              ทั้งหมด
            </button>
            <button
              className={`${styles.quickFilterBtn} ${quickFilter === 'pending' ? styles.active : ''}`}
              onClick={() => setQuickFilter('pending')}
            >
              <Clock size={14} />
              รอเช็คอิน
            </button>
            <button
              className={`${styles.quickFilterBtn} ${quickFilter === 'checked_in' ? styles.active : ''}`}
              onClick={() => setQuickFilter('checked_in')}
            >
              <LogIn size={14} />
              เช็คอินแล้ว
            </button>
            <button
              className={`${styles.quickFilterBtn} ${quickFilter === 'completed' ? styles.active : ''}`}
              onClick={() => setQuickFilter('completed')}
            >
              <CheckCircle size={14} />
              เสร็จสิ้น
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.checkboxCell}>
                <div className={styles.checkboxWrapper}>
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={isAllSelected ? deselectAll : selectAll}
                    className={styles.checkbox}
                    id="select-all"
                  />
                  <label htmlFor="select-all" className={styles.checkboxLabel}>
                    {isAllSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                  </label>
                </div>
              </th>
              <th className={styles.expandCell}></th>
              <th className={styles.codeCell}>
                <SortButton field="Code" label="รหัส" />
              </th>
              <th className={styles.nameCell}>
                <SortButton field="FirstName" label="ชื่อ-นามสกุล" />
              </th>
              <th className={styles.typeCell}>ประเภท</th>
              <th className={styles.departmentCell}>
                <SortButton field="Department_Name" label="สาขา" />
              </th>
              <th className={styles.dateCell}>
                <SortButton field="Registration_RegisTime" label="ลงทะเบียน" />
              </th>
              <th className={styles.statusCell}>สถานะ</th>
              <th className={styles.imageCell}>รูปภาพ</th>
              <th className={styles.pictureStatusCell}>สถานะรูปภาพ</th>
              <th className={styles.actionsCell}></th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedParticipants.map((participant) => {
              const isExpanded = expandedRows.has(participant.Users_ID);
              const images = participantImages[participant.Users_ID] || [];
              const isRowSelected = isSelected(participant.Users_ID);
              const imageStats = getImageStats(participant.Users_ID);

              return (
                <React.Fragment key={participant.Users_ID}>
                  <tr className={`${isRowSelected ? styles.selectedRow : ''} ${isExpanded ? styles.expandedRow : ''}`}>
                    <td className={styles.checkboxCell}>
                      <div className={styles.checkboxWrapper}>
                        <input
                          type="checkbox"
                          checked={isRowSelected}
                          onChange={() => toggleSelection(participant.Users_ID)}
                          className={styles.checkbox}
                          id={`checkbox-${participant.Users_ID}`}
                        />
                        <label
                          htmlFor={`checkbox-${participant.Users_ID}`}
                          className={styles.checkboxLabel}
                        >
                          {isRowSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                        </label>
                      </div>
                    </td>
                    <td className={styles.expandCell}>
                      <button
                        className={`${styles.expandButton} ${isExpanded ? styles.expanded : ''}`}
                        onClick={() => toggleRowExpand(participant.Users_ID)}
                      >
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </td>
                    <td className={styles.codeCell}>
                      <div className={styles.code}>{participant.Code}</div>
                    </td>
                    <td className={styles.nameCell}>
                      <div className={styles.nameWrapper}>
                        <div className={styles.userName}>
                          <div className={styles.userAvatar}>
                            {participant.isTeacher ? <Award size={14} /> : <User size={14} />}
                          </div>
                          <div className={styles.userInfo}>
                            <div className={styles.fullName}>
                              {participant.FirstName} {participant.LastName}
                            </div>
                            <div className={styles.userEmail}>{participant.Users_Email}</div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className={styles.typeCell}>
                      <span className={`${styles.typeBadge} ${participant.isStudent ? styles.student : styles.teacher}`}>
                        {participant.isStudent ? (
                          <><GraduationCap size={14} /> นักศึกษา</>
                        ) : (
                          <><Award size={14} /> อาจารย์</>
                        )}
                      </span>
                    </td>
                    <td className={styles.departmentCell}>
                      <div className={styles.departmentInfo}>
                        <div className={styles.department}>
                          <Building2 size={14} />
                          {participant.Department_Name || '-'}
                        </div>
                        {participant.Faculty_Name && (
                          <div className={styles.faculty}>{participant.Faculty_Name}</div>
                        )}
                      </div>
                    </td>
                    <td className={styles.dateCell}>
                      <div className={styles.dateTime}>
                        <Calendar size={14} />
                        {formatDateTime(participant.Registration_RegisTime)}
                      </div>
                    </td>
                    <td className={styles.statusCell}>
                      {getStatusBadge(participant)}
                    </td>
                    <td className={styles.imageCell}>
                      {images.length > 0 ? (
                        <button
                          className={styles.imageButton}
                          onClick={() => onViewImages(participant)}
                        >
                          <ImageIcon size={14} />
                          <span>{images.length}</span>
                        </button>
                      ) : (
                        <span className={styles.noImage}>
                          <ImageIcon size={14} />
                          <span>-</span>
                        </span>
                      )}
                    </td>
                    <td className={styles.pictureStatusCell}>
                      {renderImageStatusText(participant.Users_ID)}
                    </td>
                    <td className={styles.actionsCell}>
                      <div className={styles.actionButtons}>
                        <button
                          className={styles.actionButton}
                          onClick={() => toggleRowExpand(participant.Users_ID)}
                          title="ดูรายละเอียด"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr className={styles.detailsRow}>
                      <td colSpan="11">
                        <div className={styles.expandedContent}>
                          <div className={styles.detailsGrid}>
                            {/* Contact Info */}
                            <div className={styles.detailSection}>
                              <h4 className={styles.sectionTitle}>
                                <Mail size={16} />
                                ข้อมูลติดต่อ
                              </h4>
                              <div className={styles.detailItems}>
                                <div className={styles.detailItem}>
                                  <span className={styles.detailLabel}>อีเมล:</span>
                                  <span className={styles.detailValue}>{participant.Users_Email}</span>
                                </div>
                              </div>
                            </div>

                            {/* Registration Info */}
                            <div className={styles.detailSection}>
                              <h4 className={styles.sectionTitle}>
                                <Calendar size={16} />
                                ข้อมูลการลงทะเบียน
                              </h4>
                              <div className={styles.detailItems}>
                                <div className={styles.detailItem}>
                                  <span className={styles.detailLabel}>วันที่ลงทะเบียน:</span>
                                  <span className={styles.detailValue}>
                                    {formatDateTime(participant.Registration_RegisTime)}
                                  </span>
                                </div>
                                {participant.Registration_CheckInTime && (
                                  <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>เช็คอิน:</span>
                                    <span className={styles.detailValue}>
                                      {formatDateTime(participant.Registration_CheckInTime)}
                                    </span>
                                  </div>
                                )}
                                {participant.Registration_CheckOutTime && (
                                  <>
                                    <div className={styles.detailItem}>
                                      <span className={styles.detailLabel}>เช็คเอาท์:</span>
                                      <span className={styles.detailValue}>
                                        {formatDateTime(participant.Registration_CheckOutTime)}
                                      </span>
                                    </div>
                                    <div className={styles.detailItem}>
                                      <span className={styles.detailLabel}>ระยะเวลา:</span>
                                      <span className={`${styles.detailValue} ${styles.highlight}`}>
                                        {calculateDuration(
                                          participant.Registration_CheckInTime,
                                          participant.Registration_CheckOutTime
                                        )}
                                      </span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Picture Status Detail */}
                            <div className={styles.detailSection}>
                              <h4 className={styles.sectionTitle}>
                                <ImageIcon size={16} />
                                สถานะรูปภาพ
                              </h4>
                              <div className={styles.pictureStatusDetail}>
                                <div className={`${styles.statusRow} ${styles.total}`}>
                                  <span className={styles.statusLabel}>ทั้งหมด</span>
                                  <span className={styles.statusValue}>{imageStats.total} รูป</span>
                                </div>
                                <div className={`${styles.statusRow} ${styles.pending}`}>
                                  <span className={styles.statusLabel}>
                                    <Clock size={14} />
                                    รออนุมัติ
                                  </span>
                                  <span className={styles.statusValue}>{imageStats.pending} รูป</span>
                                </div>
                                <div className={`${styles.statusRow} ${styles.approved}`}>
                                  <span className={styles.statusLabel}>
                                    <CheckCircle size={14} />
                                    อนุมัติแล้ว
                                  </span>
                                  <span className={styles.statusValue}>{imageStats.approved} รูป</span>
                                </div>
                                <div className={`${styles.statusRow} ${styles.rejected}`}>
                                  <span className={styles.statusLabel}>
                                    <XCircle size={14} />
                                    ปฏิเสธ
                                  </span>
                                  <span className={styles.statusValue}>{imageStats.rejected} รูป</span>
                                </div>
                              </div>
                            </div>

                            {/* Images */}
                            {images.length > 0 && (
                              <div className={`${styles.detailSection} ${styles.fullWidth}`}>
                                <h4 className={styles.sectionTitle}>
                                  <ImageIcon size={16} />
                                  รูปภาพกิจกรรม
                                </h4>
                                <button
                                  className={styles.viewAllImagesButton}
                                  onClick={() => onViewImages(participant)}
                                >
                                  <Eye size={16} />
                                  ดูรูปภาพทั้งหมด ({images.length} รูป)
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* No Results */}
      {filteredAndSortedParticipants.length === 0 && searchTerm && (
        <div className={styles.noResults}>
          <AlertCircle size={48} />
          <h4>ไม่พบผลลัพธ์</h4>
          <p>ไม่พบรายชื่อที่ตรงกับคำค้นหา "{searchTerm}"</p>
          <button
            className={styles.clearFilterButton}
            onClick={() => setSearchTerm('')}
          >
            ล้างการค้นหา
          </button>
        </div>
      )}
    </div>
  );
};

export default ParticipantsTable;