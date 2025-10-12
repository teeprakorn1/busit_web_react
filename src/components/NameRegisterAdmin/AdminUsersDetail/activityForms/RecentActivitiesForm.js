// RecentActivitiesForm.js
import React, { useState } from 'react';
import { Calendar, ExternalLink, Filter, Clock, MapPin, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './ActivityForms.module.css';

const RecentActivitiesForm = ({ userData, activities, loading, stats }) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  const getStatusDisplay = (activity) => {
    if (activity.Registration_IsCancelled) return 'ยกเลิก';
    if (activity.Registration_CheckOutTime) return 'เข้าร่วมแล้ว';
    if (activity.Registration_CheckInTime) return 'เช็คอินแล้ว';
    return 'ลงทะเบียนแล้ว';
  };

  const getStatusValue = (activity) => {
    if (activity.Registration_IsCancelled) return 'cancelled';
    if (activity.Registration_CheckOutTime) return 'completed';
    if (activity.Registration_CheckInTime) return 'checkedIn';
    return 'registered';
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'completed': return styles.completed;
      case 'checkedIn': return styles.registered;
      case 'registered': return styles.registered;
      case 'cancelled': return styles.cancelled;
      default: return '';
    }
  };

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    return getStatusValue(activity) === filter;
  });

  const handleViewActivity = (activityId) => {
    navigate(`/activity-management/activity-detail/${activityId}`);
  };

  if (loading) {
    return (
      <div className={styles.activitiesContent}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>กำลังโหลดข้อมูลกิจกรรม...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.activitiesContent}>
      <div className={styles.sectionHeader}>
        <div className={styles.headerLeft}>
          <h3>
            <Calendar size={20} />
            กิจกรรมล่าสุด
          </h3>
          <div className={styles.summary}>
            <span className={styles.totalHours}>
              รวม {stats.completedHours} ชั่วโมง จาก {stats.completedActivities} กิจกรรม
            </span>
          </div>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.filterContainer}>
            <Filter size={16} />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">ทั้งหมด ({stats.totalActivities})</option>
              <option value="completed">เข้าร่วมแล้ว ({stats.completedActivities})</option>
              <option value="checkedIn">เช็คอินแล้ว ({stats.registeredActivities})</option>
              <option value="registered">ลงทะเบียนแล้ว</option>
              <option value="cancelled">ยกเลิก ({stats.cancelledActivities})</option>
            </select>
          </div>
        </div>
      </div>

      {filteredActivities.length === 0 ? (
        <div className={styles.emptyState}>
          <Calendar size={48} />
          <h4>ไม่พบกิจกรรม</h4>
          <p>
            {filter === 'all'
              ? 'ยังไม่มีกิจกรรมที่ลงทะเบียน'
              : `ไม่พบกิจกรรมที่มีสถานะ "${getStatusDisplay({ Registration_IsCancelled: filter === 'cancelled', Registration_CheckOutTime: filter === 'completed', Registration_CheckInTime: filter === 'checkedIn' })}"`
            }
          </p>
        </div>
      ) : (
        <div className={styles.activitiesList}>
          {filteredActivities.map((activity) => {
            const status = getStatusValue(activity);

            return (
              <div
                key={activity.Activity_ID}
                className={styles.activityItem}
                onClick={() => handleViewActivity(activity.Activity_ID)}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.activityHeader}>
                  <h4>{activity.Activity_Title}</h4>
                  <span className={`${styles.statusBadge} ${getStatusClass(status)}`}>
                    {getStatusDisplay(activity)}
                  </span>
                </div>

                <div className={styles.activityInfo}>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>
                      <Award size={14} />
                      ประเภท:
                    </span>
                    <span className={styles.value}>{activity.ActivityType_Name || 'ไม่ระบุ'}</span>
                  </div>

                  <div className={styles.infoRow}>
                    <span className={styles.label}>
                      <Calendar size={14} />
                      วันที่:
                    </span>
                    <span className={styles.value}>
                      {new Date(activity.Activity_StartTime).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>

                  <div className={styles.infoRow}>
                    <span className={styles.label}>
                      <Clock size={14} />
                      เวลา:
                    </span>
                    <span className={styles.value}>
                      {new Date(activity.Activity_StartTime).toLocaleTimeString('th-TH', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                      {' - '}
                      {new Date(activity.Activity_EndTime).toLocaleTimeString('th-TH', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  {activity.Activity_LocationDetail && (
                    <div className={styles.infoRow}>
                      <span className={styles.label}>
                        <MapPin size={14} />
                        สถานที่:
                      </span>
                      <span className={styles.value}>{activity.Activity_LocationDetail}</span>
                    </div>
                  )}

                  <div className={styles.infoRow}>
                    <span className={styles.label}>จำนวนชั่วโมง:</span>
                    <span className={styles.value}>{activity.Activity_TotalHours || 0} ชั่วโมง</span>
                  </div>
                </div>

                <div className={styles.activityTimeline}>
                  <div className={styles.timelineItem}>
                    <span className={styles.timelineLabel}>ลงทะเบียน:</span>
                    <span className={styles.timelineValue}>
                      {new Date(activity.Registration_RegisTime).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  {activity.Registration_CheckInTime && (
                    <div className={styles.timelineItem}>
                      <span className={styles.timelineLabel}>เช็คอิน:</span>
                      <span className={styles.timelineValue}>
                        {new Date(activity.Registration_CheckInTime).toLocaleDateString('th-TH', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  )}

                  {activity.Registration_CheckOutTime && (
                    <div className={styles.timelineItem}>
                      <span className={styles.timelineLabel}>เช็คเอาท์:</span>
                      <span className={styles.timelineValue}>
                        {new Date(activity.Registration_CheckOutTime).toLocaleDateString('th-TH', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  )}

                  {activity.Registration_IsCancelled && activity.Registration_CancelTime && (
                    <div className={styles.timelineItem}>
                      <span className={styles.timelineLabel}>ยกเลิก:</span>
                      <span className={styles.timelineValue}>
                        {new Date(activity.Registration_CancelTime).toLocaleDateString('th-TH', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  className={styles.viewDetailButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewActivity(activity.Activity_ID);
                  }}
                >
                  <ExternalLink size={14} />
                  ดูรายละเอียด
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentActivitiesForm;