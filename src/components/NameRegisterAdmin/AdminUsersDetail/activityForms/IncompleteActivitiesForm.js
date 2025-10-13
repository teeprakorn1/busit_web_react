// IncompleteActivitiesForm.js
import React, { useState } from 'react';
import { CheckCircle, Calendar, Clock, MapPin, Award, ExternalLink, Zap, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './ActivityForms.module.css';

const IncompleteActivitiesForm = ({ completedActivities, loading, totalHours }) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  const handleViewActivity = (activityId) => {
    navigate(`/activity-management/activity-detail/${activityId}`);
  };

  const getDetailedStatus = (activity) => {
    const steps = [];
    if (activity.Registration_RegisTime) {
      steps.push({
        label: 'ลงทะเบียน',
        completed: true,
        time: activity.Registration_RegisTime,
        icon: CheckCircle
      });
    }
    if (activity.Registration_CheckInTime) {
      steps.push({
        label: 'เช็คอิน',
        completed: true,
        time: activity.Registration_CheckInTime,
        icon: CheckCircle
      });
    }
    if (activity.Registration_CheckOutTime) {
      steps.push({
        label: 'เช็คเอาท์',
        completed: true,
        time: activity.Registration_CheckOutTime,
        icon: CheckCircle
      });
    }
    if (activity.RegistrationPicture_ApprovedTime) {
      steps.push({
        label: 'อนุมัติรูป',
        completed: true,
        time: activity.RegistrationPicture_ApprovedTime,
        icon: CheckCircle
      });
    }

    return steps;
  };

  const getActivityType = (activity) => {
    return activity.ActivityType_Name || 'ไม่ระบุ';
  };

  const activityTypes = [...new Set(completedActivities.map(a => getActivityType(a)))];
  const filteredActivities = completedActivities.filter(activity => {
    if (filter === 'all') return true;
    return getActivityType(activity) === filter;
  });

  const filteredTotalHours = filteredActivities.reduce(
    (sum, activity) => sum + (activity.Activity_TotalHours || 0),
    0
  );

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
              <span className={styles.summaryLabel}>
                {filter === 'all' ? 'รวมชั่วโมง:' : 'ชั่วโมงที่กรอง:'}
              </span>
              <span className={styles.summaryValue}>
                {filter === 'all' ? totalHours : Math.round(filteredTotalHours * 10) / 10} ชั่วโมง ({filteredActivities.length} กิจกรรม)
              </span>
            </div>
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
              <option value="all">ทั้งหมด ({completedActivities.length})</option>
              {activityTypes.map((type, index) => {
                const count = completedActivities.filter(a => getActivityType(a) === type).length;
                return (
                  <option key={index} value={type}>
                    {type} ({count})
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      {filteredActivities.length === 0 ? (
        <div className={styles.emptyState}>
          <CheckCircle size={48} />
          <h4>
            {filter === 'all'
              ? 'ยังไม่มีกิจกรรมที่เสร็จสมบูรณ์'
              : 'ไม่พบกิจกรรมประเภทนี้'
            }
          </h4>
          <p>
            {filter === 'all'
              ? 'เมื่อนักศึกษาเข้าร่วมกิจกรรมและเช็คเอาท์เรียบร้อยแล้ว จะแสดงที่นี่'
              : `ไม่พบกิจกรรมประเภท "${filter}" ที่เสร็จสมบูรณ์`
            }
          </p>
        </div>
      ) : (
        <div className={styles.requirementsList}>
          {filteredActivities.map((activity) => {
            const statusSteps = getDetailedStatus(activity);

            return (
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
                      <strong>{activity.Activity_DurationText || `${activity.Activity_TotalHours || 0} ชั่วโมง`}</strong>
                    </span>
                  </div>

                  {activity.RegistrationPicture_IsAiSuccess !== null && activity.RegistrationPicture_IsAiSuccess !== undefined && (
                    <div className={styles.infoRow}>
                      <span className={styles.label}>
                        <Zap size={14} />
                        สถานะ AI:
                      </span>
                      <span className={styles.value}>
                        {activity.RegistrationPicture_IsAiSuccess ? (
                          <span className={styles.aiSuccess}>✓ ตรวจสอบสำเร็จ</span>
                        ) : (
                          <span className={styles.aiFailed}>✗ ตรวจสอบไม่สำเร็จ</span>
                        )}
                      </span>
                    </div>
                  )}
                </div>

                {/* Progress Steps */}
                <div className={styles.progressSteps}>
                  <div className={styles.progressStepsTitle}>ความคืบหน้า:</div>
                  <div className={styles.stepsContainer}>
                    {statusSteps.map((step, index) => {
                      const Icon = step.icon;
                      return (
                        <div
                          key={index}
                          className={`${styles.stepItem} ${styles.stepCompleted}`}
                        >
                          <div className={styles.stepIcon}>
                            <Icon size={16} />
                          </div>
                          <div className={styles.stepContent}>
                            <div className={styles.stepLabel}>{step.label}</div>
                            {step.time && (
                              <div className={styles.stepTime}>
                                {new Date(step.time).toLocaleDateString('th-TH', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
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

export default IncompleteActivitiesForm;