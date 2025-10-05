import React, { useState, useEffect, useCallback } from 'react';
import { BarChart3, Users, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import axios from 'axios';
import styles from './ActivityForms.module.css';

const ActivityStatsForm = ({ activityData }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!activityData?.Activity_ID) return;

    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_SERVER_PROTOCOL}${process.env.REACT_APP_SERVER_BASE_URL}${process.env.REACT_APP_SERVER_PORT}/api/admin/activities/${activityData.Activity_ID}/stats`,
        { withCredentials: true }
      );

      if (response.data?.status) {
        setStats(response.data.data);
      }
    } catch (err) {
      console.error('Fetch stats error:', err);
    } finally {
      setLoading(false);
    }
  }, [activityData?.Activity_ID]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className={styles.profileContent}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>กำลังโหลดสถิติ...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={styles.profileContent}>
        <div className={styles.emptyState}>
          <BarChart3 size={48} />
          <h4>ไม่พบข้อมูลสถิติ</h4>
          <p>ยังไม่มีข้อมูลสถิติสำหรับกิจกรรมนี้</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.profileContent}>
      <div className={styles.sectionHeader}>
        <h3>
          <BarChart3 size={20} />
          สถิติกิจกรรม
        </h3>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#dbeafe' }}>
            <Users size={24} style={{ color: '#2563eb' }} />
          </div>
          <div className={styles.statContent}>
            <h4>จำนวนที่คาดหวัง</h4>
            <p className={styles.statValue}>{stats.expected_participants || 0}</p>
            <span className={styles.statLabel}>คน</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#fef3c7' }}>
            <CheckCircle size={24} style={{ color: '#f59e0b' }} />
          </div>
          <div className={styles.statContent}>
            <h4>ลงทะเบียนแล้ว</h4>
            <p className={styles.statValue}>{stats.total_registered || 0}</p>
            <span className={styles.statLabel}>คน ({stats.registration_rate || 0}%)</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#d1fae5' }}>
            <Clock size={24} style={{ color: '#10b981' }} />
          </div>
          <div className={styles.statContent}>
            <h4>เช็คอินแล้ว</h4>
            <p className={styles.statValue}>{stats.total_checked_in || 0}</p>
            <span className={styles.statLabel}>คน ({stats.check_in_rate || 0}%)</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#f0fdf4' }}>
            <TrendingUp size={24} style={{ color: '#16a34a' }} />
          </div>
          <div className={styles.statContent}>
            <h4>เช็คเอาท์แล้ว</h4>
            <p className={styles.statValue}>{stats.total_checked_out || 0}</p>
            <span className={styles.statLabel}>คน ({stats.attendance_rate || 0}%)</span>
          </div>
        </div>
      </div>

      <div className={styles.infoGrid}>
        <div className={styles.infoSection}>
          <h4>สรุปข้อมูล</h4>
          <div className={styles.infoCard}>
            <div className={styles.infoRow}>
              <span className={styles.label}>ชื่อกิจกรรม:</span>
              <span className={styles.value}>{stats.Activity_Title || '-'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>อัตราการลงทะเบียน:</span>
              <span className={styles.value}>
                {stats.registration_rate || 0}% ({stats.total_registered}/{stats.expected_participants})
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>อัตราการเช็คอิน:</span>
              <span className={styles.value}>
                {stats.check_in_rate || 0}% ({stats.total_checked_in}/{stats.total_registered})
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>อัตราการเข้าร่วมจริง:</span>
              <span className={styles.value}>
                {stats.attendance_rate || 0}% ({stats.total_checked_out}/{stats.total_registered})
              </span>
            </div>
          </div>
        </div>

        <div className={styles.infoSection}>
          <h4>สถิติเพิ่มเติม</h4>
          <div className={styles.infoCard}>
            <div className={styles.infoRow}>
              <span className={styles.label}>ยังไม่ได้ลงทะเบียน:</span>
              <span className={styles.value}>
                {(stats.expected_participants || 0) - (stats.total_registered || 0)} คน
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>ลงทะเบียนแต่ยังไม่เช็คอิน:</span>
              <span className={styles.value}>
                {(stats.total_registered || 0) - (stats.total_checked_in || 0)} คน
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>เช็คอินแต่ยังไม่เช็คเอาท์:</span>
              <span className={styles.value}>
                {(stats.total_checked_in || 0) - (stats.total_checked_out || 0)} คน
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>เสร็จสิ้นกิจกรรม:</span>
              <span className={styles.value}>
                {stats.total_checked_out || 0} คน
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityStatsForm;