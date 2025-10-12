// components/ParticipantStats/ParticipantStats.js
import React, { useMemo } from 'react';
import { 
  FaUsers, FaCheckCircle, FaClock, FaGraduationCap, FaUserCheck, 
  FaBullseye, FaChartLine, FaExclamationCircle,
  FaCalendar, FaMapMarkerAlt, FaChartBar
} from 'react-icons/fa';
import styles from './ParticipantStats.module.css';

const ParticipantStats = ({ participants, filteredCount, selectedCount, activity }) => {
  const stats = useMemo(() => {
    const total = participants.length;
    const registered = participants.filter(p => !p.Registration_CheckInTime).length;
    const checkedIn = participants.filter(p => p.Registration_CheckInTime && !p.Registration_CheckOutTime).length;
    const completed = participants.filter(p => p.Registration_CheckOutTime).length;
    const students = participants.filter(p => p.isStudent).length;
    const teachers = participants.filter(p => p.isTeacher).length;

    const expectedTotal = activity?.expected_participants || total || 1;
    const registrationRate = ((total / expectedTotal) * 100).toFixed(1);
    const checkInRate = total > 0 ? ((checkedIn / total) * 100).toFixed(1) : 0;
    const completionRate = total > 0 ? ((completed / total) * 100).toFixed(1) : 0;

    return {
      total,
      filtered: filteredCount,
      selected: selectedCount,
      registered,
      checkedIn,
      completed,
      students,
      teachers,
      expected: expectedTotal,
      registrationRate,
      checkInRate,
      completionRate
    };
  }, [participants, filteredCount, selectedCount, activity]);

  const getStatusColor = (rate) => {
    if (rate >= 80) return styles.excellent;
    if (rate >= 60) return styles.good;
    if (rate >= 40) return styles.moderate;
    return styles.poor;
  };

  return (
    <div className={styles.statsContainer}>
      {/* Activity Info Header */}
      {activity && (
        <div className={styles.activityHeader}>
          <div className={styles.activityInfo}>
            <div className={styles.activityIcon}>
              <FaChartBar size={24} color="white" />
            </div>
            <div className={styles.activityDetails}>
              <h3 className={styles.activityTitle}>{activity.Activity_Title}</h3>
              <div className={styles.activityMeta}>
                <span className={styles.metaItem}>
                  <FaCalendar size={14} color="#2563eb" />
                  {new Date(activity.Activity_StartTime).toLocaleDateString('th-TH', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                  {' : '}
                  {new Date(activity.Activity_StartTime).toLocaleTimeString('th-TH', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                  })}
                  {' - '}
                  {new Date(activity.Activity_EndTime).toLocaleDateString('th-TH', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                  {' : '}
                  {new Date(activity.Activity_EndTime).toLocaleTimeString('th-TH', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                  })}
                </span>
                {activity.Activity_LocationDetail && (
                  <span className={styles.metaItem}>
                    <FaMapMarkerAlt size={14} color="#2563eb" />
                    {activity.Activity_LocationDetail.substring(0, 30)}
                    {activity.Activity_LocationDetail.length > 30 ? '...' : ''}
                  </span>
                )}
                <span className={`${styles.statusTag} ${styles[activity.ActivityStatus_Name?.toLowerCase().replace(/\s+/g, '_')]}`}>
                  {activity.ActivityStatus_Name}
                </span>
              </div>
            </div>
          </div>
          
          <div className={styles.expectedTarget}>
            <div className={styles.targetIcon}>
              <FaBullseye size={20} color="#92400e" />
            </div>
            <div className={styles.targetContent}>
              <div className={styles.targetLabel}>เป้าหมาย</div>
              <div className={styles.targetValue}>{stats.expected} คน</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Stats Grid */}
      <div className={styles.statsGrid}>
        {/* Total Participants */}
        <div className={`${styles.statCard} ${styles.primary}`}>
          <div className={styles.cardHeader}>
            <div className={styles.statIcon}>
              <FaUsers size={24} />
            </div>
            <div className={styles.statBadge}>รวม</div>
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{stats.total}</div>
            <div className={styles.statLabel}>ผู้เข้าร่วมทั้งหมด</div>
            <div className={styles.statProgress}>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill}
                  style={{ width: `${Math.min(stats.registrationRate, 100)}%` }}
                ></div>
              </div>
              <span className={styles.progressText}>{stats.registrationRate}%</span>
            </div>
            <div className={styles.statSubtext}>
              {stats.registrationRate}% ของเป้าหมาย
            </div>
          </div>
        </div>

        {/* Students & Teachers (if applicable) */}
        {activity?.Activity_AllowTeachers ? (
          <>
            <div className={`${styles.statCard} ${styles.info}`}>
              <div className={styles.cardHeader}>
                <div className={styles.statIcon}>
                  <FaGraduationCap size={24} />
                </div>
                <div className={styles.statBadge}>นักศึกษา</div>
              </div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{stats.students}</div>
                <div className={styles.statLabel}>คน</div>
                <div className={styles.statProgress}>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill}
                      style={{ width: `${stats.total > 0 ? ((stats.students / stats.total) * 100).toFixed(1) : 0}%` }}
                    ></div>
                  </div>
                  <span className={styles.progressText}>
                    {stats.total > 0 ? ((stats.students / stats.total) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className={styles.statSubtext}>
                  {stats.total > 0 ? ((stats.students / stats.total) * 100).toFixed(1) : 0}% ของผู้เข้าร่วม
                </div>
              </div>
            </div>

            <div className={`${styles.statCard} ${styles.success}`}>
              <div className={styles.cardHeader}>
                <div className={styles.statIcon}>
                  <FaUserCheck size={24} />
                </div>
                <div className={styles.statBadge}>อาจารย์</div>
              </div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{stats.teachers}</div>
                <div className={styles.statLabel}>คน</div>
                <div className={styles.statProgress}>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill}
                      style={{ width: `${stats.total > 0 ? ((stats.teachers / stats.total) * 100).toFixed(1) : 0}%` }}
                    ></div>
                  </div>
                  <span className={styles.progressText}>
                    {stats.total > 0 ? ((stats.teachers / stats.total) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className={styles.statSubtext}>
                  {stats.total > 0 ? ((stats.teachers / stats.total) * 100).toFixed(1) : 0}% ของผู้เข้าร่วม
                </div>
              </div>
            </div>
          </>
        ) : null}

        {/* Pending Check-in */}
        <div className={`${styles.statCard} ${styles.warning}`}>
          <div className={styles.cardHeader}>
            <div className={styles.statIcon}>
              <FaClock size={24} />
            </div>
            <div className={styles.statBadge}>รอดำเนินการ</div>
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{stats.registered}</div>
            <div className={styles.statLabel}>รอเช็คอิน</div>
            <div className={styles.statProgress}>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill}
                  style={{ width: `${stats.total > 0 ? ((stats.registered / stats.total) * 100).toFixed(1) : 0}%` }}
                ></div>
              </div>
              <span className={styles.progressText}>
                {stats.total > 0 ? ((stats.registered / stats.total) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className={styles.statSubtext}>
              {stats.total > 0 ? ((stats.registered / stats.total) * 100).toFixed(1) : 0}% ยังไม่เช็คอิน
            </div>
          </div>
        </div>

        {/* Checked In */}
        <div className={`${styles.statCard} ${styles.info}`}>
          <div className={styles.cardHeader}>
            <div className={styles.statIcon}>
              <FaCheckCircle size={24} />
            </div>
            <div className={styles.statBadge}>กำลังดำเนินการ</div>
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{stats.checkedIn}</div>
            <div className={styles.statLabel}>เช็คอินแล้ว</div>
            <div className={styles.statProgress}>
              <div className={styles.progressBar}>
                <div 
                  className={`${styles.progressFill} ${getStatusColor(stats.checkInRate)}`}
                  style={{ width: `${Math.min(stats.checkInRate, 100)}%` }}
                ></div>
              </div>
              <span className={styles.progressText}>{stats.checkInRate}%</span>
            </div>
            <div className={styles.statSubtext}>
              {stats.checkInRate}% จากทั้งหมด
            </div>
          </div>
        </div>

        {/* Completed */}
        <div className={`${styles.statCard} ${styles.success}`}>
          <div className={styles.cardHeader}>
            <div className={styles.statIcon}>
              <FaCheckCircle size={24} />
            </div>
            <div className={styles.statBadge}>สำเร็จ</div>
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{stats.completed}</div>
            <div className={styles.statLabel}>เสร็จสิ้น</div>
            <div className={styles.statProgress}>
              <div className={styles.progressBar}>
                <div 
                  className={`${styles.progressFill} ${getStatusColor(stats.completionRate)}`}
                  style={{ width: `${Math.min(stats.completionRate, 100)}%` }}
                ></div>
              </div>
              <span className={styles.progressText}>{stats.completionRate}%</span>
            </div>
            <div className={styles.statSubtext}>
              {stats.completionRate}% เช็คเอาท์แล้ว
            </div>
          </div>
        </div>
      </div>

      {/* Performance Indicators */}
      <div className={styles.performanceRow}>
        <div className={styles.performanceCard}>
          <div className={styles.performanceIcon}>
            <FaChartLine size={20} color="#2563eb" />
          </div>
          <div className={styles.performanceContent}>
            <div className={styles.performanceLabel}>อัตราการลงทะเบียน</div>
            <div className={styles.performanceValue}>
              {stats.registrationRate}%
              <span className={`${styles.rateIndicator} ${getStatusColor(stats.registrationRate)}`}>
                {stats.registrationRate >= 80 ? 'ดีเยี่ยม' : 
                 stats.registrationRate >= 60 ? 'ดี' :
                 stats.registrationRate >= 40 ? 'ปานกลาง' : 'ต้องปรับปรุง'}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.performanceCard}>
          <div className={styles.performanceIcon}>
            <FaCheckCircle size={20} color="#2563eb" />
          </div>
          <div className={styles.performanceContent}>
            <div className={styles.performanceLabel}>อัตราการเข้าร่วม</div>
            <div className={styles.performanceValue}>
              {stats.checkInRate}%
              <span className={`${styles.rateIndicator} ${getStatusColor(stats.checkInRate)}`}>
                {stats.checkInRate >= 80 ? 'ดีเยี่ยม' : 
                 stats.checkInRate >= 60 ? 'ดี' :
                 stats.checkInRate >= 40 ? 'ปานกลาง' : 'ต้องปรับปรุง'}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.performanceCard}>
          <div className={styles.performanceIcon}>
            <FaBullseye size={20} color="#2563eb" />
          </div>
          <div className={styles.performanceContent}>
            <div className={styles.performanceLabel}>อัตราความสำเร็จ</div>
            <div className={styles.performanceValue}>
              {stats.completionRate}%
              <span className={`${styles.rateIndicator} ${getStatusColor(stats.completionRate)}`}>
                {stats.completionRate >= 80 ? 'ดีเยี่ยม' : 
                 stats.completionRate >= 60 ? 'ดี' :
                 stats.completionRate >= 40 ? 'ปานกลาง' : 'ต้องปรับปรุง'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Selection Info */}
      {(stats.filtered < stats.total || selectedCount > 0) && (
        <div className={styles.filterInfo}>
          {stats.filtered < stats.total && (
            <div className={styles.filterBadge}>
              <FaExclamationCircle size={16} color="#6b7280" />
              <span>กรองแล้ว: <strong>{stats.filtered}</strong> จาก {stats.total} คน</span>
            </div>
          )}
          {selectedCount > 0 && (
            <div className={`${styles.filterBadge} ${styles.selected}`}>
              <FaCheckCircle size={16} color="#10b981" />
              <span>เลือกแล้ว: <strong>{selectedCount}</strong> คน</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ParticipantStats;