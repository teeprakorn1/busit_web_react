// IncompleteActivitiesForm.js
import React from 'react';
import { CheckCircle, Calendar, Clock, MapPin, Award, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './ActivityForms.module.css';

const IncompleteActivitiesForm = ({ completedActivities, loading, totalHours }) => {
  const navigate = useNavigate();

  const handleViewActivity = (activityId) => {
    navigate(`/activity-management/activity-detail/${activityId}`);
  };

  if (loading) {
    return (
      <div className={styles.incompleteActivitiesContent}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>กำลังโหลดกิจกรรมที่สำเร็จ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.incompleteActivitiesContent}>
      <div className={styles.sectionHeader}>
        <div className={styles.headerLeft}>
          <h3>
            <CheckCircle size={20} />
            กิจกรรมที่เข้าร่วมสำเร็จ (10 ล่าสุด)
          </h3>
          <div className={styles.summary}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>รวมชั่วโมง:</span>
              <span className={styles.summaryValue}>
                {totalHours} ชั่วโมง ({completedActivities.length} กิจกรรม)
              </span>
            </div>
          </div>
        </div>
      </div>

      {completedActivities.length === 0 ? (
        <div className={styles.emptyState}>
          <CheckCircle size={48} />
          <h4>ยังไม่มีกิจกรรมที่เสร็จสมบูรณ์</h4>
          <p>เมื่อนักศึกษาเข้าร่วมกิจกรรมและเช็คเอาท์เรียบร้อยแล้ว จะแสดงที่นี่</p>
        </div>
      ) : (
        <div className={styles.requirementsList}>
          {completedActivities.map((activity) => (
            <div
              key={activity.Activity_ID}
              className={styles.completedActivityItem}
              onClick={() => handleViewActivity(activity.Activity_ID)}
              style={{ cursor: 'pointer' }}
            >
              <div className={styles.activityHeader}>
                <div className={styles.activityTitleSection}>
                  <CheckCircle size={20} className={styles.successIcon} />
                  <h4>{activity.Activity_Title}</h4>
                </div>
                <span className={`${styles.statusBadge} ${styles.completed}`}>
                  เสร็จสมบูรณ์
                </span>
              </div>

              {activity.Activity_Description && (
                <p className={styles.activityDescription}>
                  {activity.Activity_Description}
                </p>
              )}

              <div className={styles.activityInfo}>
                <div className={styles.infoRow}>
                  <span className={styles.label}>
                    <Award size={14} />
                    ประเภท:
                  </span>
                  <span className={styles.value}>{activity.ActivityType_Name}</span>
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
                  <span className={styles.value}>
                    <strong>{activity.Activity_TotalHours || 0} ชั่วโมง</strong>
                  </span>
                </div>
              </div>

              <div className={styles.activityTimeline}>
                {activity.Registration_CheckInTime && (
                  <div className={styles.timelineItem}>
                    <span className={styles.timelineLabel}>เช็คอิน:</span>
                    <span className={styles.timelineValue}>
                      {new Date(activity.Registration_CheckInTime).toLocaleDateString('th-TH', {
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
          ))}
        </div>
      )}
    </div>
  );
};

export default IncompleteActivitiesForm;