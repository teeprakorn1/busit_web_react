import React, { useState, useEffect, useCallback } from 'react';
import { Building2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import styles from './ActivityForms.module.css';

const ActivityDepartmentsForm = ({ activityData }) => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDepartments = useCallback(async () => {
    if (!activityData?.Activity_ID) return;

    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_SERVER_PROTOCOL}${process.env.REACT_APP_SERVER_BASE_URL}${process.env.REACT_APP_SERVER_PORT}/api/admin/activities/${activityData.Activity_ID}/departments`,
        { withCredentials: true }
      );

      if (response.data?.status) {
        setDepartments(response.data.data);
      }
    } catch (err) {
      console.error('Fetch departments error:', err);
    } finally {
      setLoading(false);
    }
  }, [activityData?.Activity_ID]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  if (loading) {
    return (
      <div className={styles.profileContent}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>กำลังโหลดข้อมูลสาขา...</p>
        </div>
      </div>
    );
  }

  const totalExpected = departments.reduce((sum, d) => sum + (d.ActivityDetail_Total || 0), 0);

  return (
    <div className={styles.profileContent}>
      <div className={styles.sectionHeader}>
        <h3>
          <Building2 size={20} />
          สาขาที่เข้าร่วมกิจกรรม
        </h3>
      </div>

      <div className={styles.departmentSummary}>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>จำนวนสาขาทั้งหมด:</span>
          <span className={styles.summaryValue}>{departments.length} สาขา</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>จำนวนนักศึกษาที่คาดหวัง:</span>
          <span className={styles.summaryValue}>{totalExpected} คน</span>
        </div>
      </div>

      <div className={styles.departmentsList}>
        {departments.length === 0 ? (
          <div className={styles.emptyState}>
            <AlertCircle size={48} />
            <h4>ไม่มีข้อมูลสาขา</h4>
            <p>ยังไม่มีสาขาที่เข้าร่วมกิจกรรมนี้</p>
          </div>
        ) : (
          departments.map((dept, index) => (
            <div key={dept.Department_ID} className={styles.departmentCard}>
              <div className={styles.departmentNumber}>#{index + 1}</div>
              
              <div className={styles.departmentInfo}>
                <h4>{dept.Department_Name}</h4>
                <p className={styles.facultyName}>{dept.Faculty_Name}</p>
              </div>

              <div className={styles.departmentStats}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>จำนวนที่คาดหวัง:</span>
                  <span className={styles.statValue}>{dept.ActivityDetail_Total} คน</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityDepartmentsForm;