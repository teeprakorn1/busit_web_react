// components/ActivitySelector/ActivitySelector.js
import React, { useState, useMemo } from 'react';
import {
  Calendar, Users, MapPin, Activity as ActivityIcon,
  Search, Filter, TrendingUp, Clock, CheckCircle,
  AlertCircle, XCircle, ChevronDown, Grid, List
} from 'lucide-react';
import styles from './ActivitySelector.module.css';

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStatusClass = (statusName) => {
  const statusMap = {
    'เปิดรับสมัคร': 'open',
    'กำลังดำเนินการ': 'ongoing',
    'เสร็จสิ้น': 'completed',
    'ยกเลิก': 'cancelled'
  };
  return statusMap[statusName] || 'default';
};

const getStatusIcon = (statusName) => {
  switch (statusName) {
    case 'เปิดรับสมัคร':
      return <Clock size={14} />;
    case 'กำลังดำเนินการ':
      return <TrendingUp size={14} />;
    case 'เสร็จสิ้น':
      return <CheckCircle size={14} />;
    case 'ยกเลิก':
      return <XCircle size={14} />;
    default:
      return <AlertCircle size={14} />;
  }
};

const ActivitySelector = ({ activities, selectedActivity, onActivityChange, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('date');

  const filteredActivities = useMemo(() => {
    let filtered = [...activities];
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(activity =>
        activity.Activity_Title?.toLowerCase().includes(search) ||
        activity.Activity_LocationDetail?.toLowerCase().includes(search)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(activity =>
        getStatusClass(activity.ActivityStatus_Name) === statusFilter
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.Activity_StartTime) - new Date(a.Activity_StartTime);
        case 'participants':
          return (b.total_registered || 0) - (a.total_registered || 0);
        case 'status':
          return (a.ActivityStatus_Name || '').localeCompare(b.ActivityStatus_Name || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [activities, searchTerm, statusFilter, sortBy]);

  const stats = useMemo(() => {
    return {
      total: activities.length,
      open: activities.filter(a => getStatusClass(a.ActivityStatus_Name) === 'open').length,
      ongoing: activities.filter(a => getStatusClass(a.ActivityStatus_Name) === 'ongoing').length,
      completed: activities.filter(a => getStatusClass(a.ActivityStatus_Name) === 'completed').length,
    };
  }, [activities]);

  if (loading && activities.length === 0) {
    return (
      <div className={styles.selectorCard}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <span>กำลังโหลดกิจกรรม...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.selectorCard}>
      {/* Header with Stats */}
      <div className={styles.selectorHeader}>
        <div className={styles.headerTop}>
          <div className={styles.headerLeft}>
            <div className={styles.titleSection}>
              <ActivityIcon size={24} />
              <div>
                <h3>เลือกกิจกรรม</h3>
                <p className={styles.subtitle}>ทั้งหมด {filteredActivities.length} กิจกรรม</p>
              </div>
            </div>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.viewToggle}>
              <button
                className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.active : ''}`}
                onClick={() => setViewMode('grid')}
                title="มุมมองตาราง"
              >
                <Grid size={18} />
              </button>
              <button
                className={`${styles.viewBtn} ${viewMode === 'list' ? styles.active : ''}`}
                onClick={() => setViewMode('list')}
                title="มุมมองรายการ"
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className={styles.quickStats}>
          <button
            className={`${styles.quickStatCard} ${statusFilter === 'all' ? styles.active : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            <ActivityIcon size={16} />
            <span className={styles.statValue}>{stats.total}</span>
            <span className={styles.statLabel}>ทั้งหมด</span>
          </button>
          <button
            className={`${styles.quickStatCard} ${styles.open} ${statusFilter === 'open' ? styles.active : ''}`}
            onClick={() => setStatusFilter('open')}
          >
            <Clock size={16} />
            <span className={styles.statValue}>{stats.open}</span>
            <span className={styles.statLabel}>เปิดรับ</span>
          </button>
          <button
            className={`${styles.quickStatCard} ${styles.ongoing} ${statusFilter === 'ongoing' ? styles.active : ''}`}
            onClick={() => setStatusFilter('ongoing')}
          >
            <TrendingUp size={16} />
            <span className={styles.statValue}>{stats.ongoing}</span>
            <span className={styles.statLabel}>ดำเนินการ</span>
          </button>
          <button
            className={`${styles.quickStatCard} ${styles.completed} ${statusFilter === 'completed' ? styles.active : ''}`}
            onClick={() => setStatusFilter('completed')}
          >
            <CheckCircle size={16} />
            <span className={styles.statValue}>{stats.completed}</span>
            <span className={styles.statLabel}>เสร็จสิ้น</span>
          </button>
        </div>

        {/* Filters */}
        <div className={styles.filtersRow}>
          <div className={styles.searchBox}>
            <Search size={18} />
            <input
              type="text"
              placeholder="ค้นหากิจกรรม..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className={styles.sortBox}>
            <Filter size={16} />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="date">เรียงตามวันที่</option>
              <option value="participants">เรียงตามผู้เข้าร่วม</option>
              <option value="status">เรียงตามสถานะ</option>
            </select>
            <ChevronDown size={16} />
          </div>
        </div>

        {/* Selected Activity Info */}
        {selectedActivity && (
          <div className={styles.selectedActivityBanner}>
            <div className={styles.bannerIcon}>
              <CheckCircle size={20} />
            </div>
            <div className={styles.bannerContent}>
              <span className={styles.bannerLabel}>กิจกรรมที่เลือก:</span>
              <span className={styles.bannerTitle}>{selectedActivity.Activity_Title}</span>
            </div>
            <div className={styles.bannerStats}>
              <span className={styles.miniStat}>
                <Users size={14} />
                {selectedActivity.total_registered || 0}/{selectedActivity.expected_participants || 0}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Activities Grid/List */}
      <div className={`${styles.activitiesContainer} ${styles[viewMode]}`}>
        {filteredActivities.map(activity => {
          const isSelected = selectedActivity?.Activity_ID === activity.Activity_ID;
          const statusClass = getStatusClass(activity.ActivityStatus_Name);
          const participationRate = activity.expected_participants > 0
            ? ((activity.total_registered / activity.expected_participants) * 100).toFixed(0)
            : 0;

          return (
            <div
              key={activity.Activity_ID}
              className={`${styles.activityCard} ${styles[viewMode]} ${isSelected ? styles.selected : ''}`}
              onClick={() => onActivityChange(activity)}
            >
              {isSelected && (
                <div className={styles.selectedIndicator}>
                  <CheckCircle size={20} />
                </div>
              )}

              <div className={styles.cardHeader}>
                <div className={styles.cardTitleSection}>
                  <h4>{activity.Activity_Title}</h4>
                  <div className={styles.badges}>
                    <span className={`${styles.statusBadge} ${styles[statusClass]}`}>
                      {getStatusIcon(activity.ActivityStatus_Name)}
                      {activity.ActivityStatus_Name}
                    </span>
                    {activity.Activity_AllowTeachers && (
                      <span className={styles.teacherBadge} title="เปิดให้อาจารย์เข้าร่วม">
                        อาจารย์
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.cardInfo}>
                  <Calendar size={16} />
                  <span>{formatDate(activity.Activity_StartTime)}</span>
                </div>

                {activity.Activity_LocationDetail && (
                  <div className={styles.cardInfo}>
                    <MapPin size={16} />
                    <span className={styles.location}>
                      {activity.Activity_LocationDetail.length > 40
                        ? `${activity.Activity_LocationDetail.substring(0, 40)}...`
                        : activity.Activity_LocationDetail}
                    </span>
                  </div>
                )}

                <div className={styles.participantsSection}>
                  <div className={styles.participantsBar}>
                    <div className={styles.participantsProgress}>
                      <div
                        className={styles.progressFill}
                        style={{ width: `${Math.min(participationRate, 100)}%` }}
                      ></div>
                    </div>
                    <span className={styles.participantsText}>
                      {activity.total_registered || 0}/{activity.expected_participants || 0}
                    </span>
                  </div>
                </div>

                <div className={styles.cardStats}>
                  <div className={styles.statItem}>
                    <Users size={14} />
                    <span className={styles.statLabel}>ลงทะเบียน:</span>
                    <span className={styles.statValue}>{activity.total_registered || 0}</span>
                  </div>
                  <div className={styles.statItem}>
                    <CheckCircle size={14} />
                    <span className={styles.statLabel}>เช็คอิน:</span>
                    <span className={styles.statValue}>{activity.total_checked_in || 0}</span>
                  </div>
                  {activity.Activity_AllowTeachers && (
                    <div className={styles.statItem}>
                      <Users size={14} />
                      <span className={styles.statLabel}>อาจารย์:</span>
                      <span className={styles.statValue}>{activity.total_teachers || 0}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredActivities.length === 0 && !loading && (
        <div className={styles.emptyMessage}>
          <ActivityIcon size={64} />
          <h3>ไม่พบกิจกรรม</h3>
          <p>
            {searchTerm || statusFilter !== 'all'
              ? 'ลองเปลี่ยนเงื่อนไขการค้นหาหรือตัวกรอง'
              : 'ยังไม่มีกิจกรรมในระบบ'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ActivitySelector;