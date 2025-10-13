// RecentActivitiesForm.js
import React, { useState } from 'react';
import { Calendar, ExternalLink, Filter, Clock, MapPin, Award, Zap, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './ActivityForms.module.css';

const RecentActivitiesForm = ({ userData, activities, loading, stats }) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  const getStatusDisplay = (activity) => {
    if (activity.RegistrationPicture_Status === 'ปฏิเสธ' || activity.RegistrationPicture_Status === 'rejected') {
      return 'รูปถูกปฏิเสธ';
    }
    if (activity.RegistrationPicture_Status === 'รออนุมัติ' || activity.RegistrationPicture_Status === 'pending') {
      return 'รอตรวจสอบรูป';
    }
    if (activity.RegistrationPicture_Status === 'อนุมัติแล้ว' || activity.RegistrationPicture_Status === 'approved') {
      return 'อนุมัติแล้ว';
    }

    if (activity.Registration_IsCancelled) return 'ยกเลิก';
    if (activity.Registration_CheckOutTime) return 'เข้าร่วมสำเร็จ';
    if (activity.Registration_CheckInTime) return 'เช็คอินแล้ว';
    return 'ลงทะเบียนแล้ว';
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
    } else if (activity.Registration_RegisTime && !activity.Registration_IsCancelled) {
      steps.push({
        label: 'เช็คอิน',
        completed: false,
        pending: true,
        icon: AlertCircle
      });
    }

    if (activity.Registration_CheckOutTime) {
      steps.push({
        label: 'เช็คเอาท์',
        completed: true,
        time: activity.Registration_CheckOutTime,
        icon: CheckCircle
      });
    } else if (activity.Registration_CheckInTime && !activity.Registration_IsCancelled) {
      steps.push({
        label: 'เช็คเอาท์',
        completed: false,
        pending: true,
        icon: AlertCircle
      });
    }

    if (activity.RegistrationPicture_ApprovedTime) {
      steps.push({
        label: 'อนุมัติรูป',
        completed: true,
        time: activity.RegistrationPicture_ApprovedTime,
        icon: CheckCircle
      });
    } else if (activity.RegistrationPicture_Status === 'ปฏิเสธ') {
      steps.push({
        label: 'รูปถูกปฏิเสธ',
        completed: false,
        rejected: true,
        icon: XCircle
      });
    } else if (activity.Registration_CheckOutTime) {
      steps.push({
        label: 'รอตรวจรูป',
        completed: false,
        pending: true,
        icon: AlertCircle
      });
    }

    if (activity.Registration_IsCancelled) {
      return [{
        label: 'ยกเลิก',
        completed: false,
        cancelled: true,
        time: activity.Registration_CancelTime,
        icon: XCircle
      }];
    }

    return steps;
  };

  const getStatusValue = (activity) => {
    if (activity.Registration_IsCancelled) return 'cancelled';
    if (activity.RegistrationPicture_Status === 'ปฏิเสธ') return 'rejected';
    if (activity.RegistrationPicture_Status === 'รออนุมัติ') return 'pending';
    if (activity.RegistrationPicture_ApprovedTime) return 'approved';
    if (activity.Registration_CheckOutTime) return 'completed';
    if (activity.Registration_CheckInTime) return 'checkedIn';
    return 'registered';
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'approved': return styles.approved;
      case 'completed': return styles.completed;
      case 'checkedIn': return styles.checkedIn;
      case 'registered': return styles.registered;
      case 'pending': return styles.pending;
      case 'rejected': return styles.rejected;
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
              <option value="approved">อนุมัติแล้ว</option>
              <option value="completed">เช็คเอาท์แล้ว</option>
              <option value="checkedIn">เช็คอินแล้ว</option>
              <option value="registered">ลงทะเบียนแล้ว</option>
              <option value="pending">รอตรวจสอบ</option>
              <option value="rejected">ถูกปฏิเสธ</option>
              <option value="cancelled">ยกเลิก</option>
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
              : `ไม่พบกิจกรรมที่มีสถานะที่เลือก`
            }
          </p>
        </div>
      ) : (
        <div className={styles.activitiesList}>
          {filteredActivities.map((activity) => {
            const status = getStatusValue(activity);
            const statusSteps = getDetailedStatus(activity);

            return (
              <div
                key={activity.Activity_ID}
                className={styles.activityItem}
                onClick={() => handleViewActivity(activity.Activity_ID)}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.activityHeader}>
                  <div className={styles.activityTitleSection}>
                    <h4>{activity.Activity_Title}</h4>
                  </div>
                  <span className={`${styles.statusBadge} ${getStatusClass(status)}`}>
                    {getStatusDisplay(activity)}
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
                          className={`${styles.stepItem} ${step.completed ? styles.stepCompleted :
                              step.rejected ? styles.stepRejected :
                                step.cancelled ? styles.stepCancelled :
                                  styles.stepPending
                            }`}
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

export default RecentActivitiesForm;