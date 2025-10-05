import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Users, Search, Check, X, Clock, Building2 } from 'lucide-react';
import axios from 'axios';
import styles from './ActivityForms.module.css';

const ActivityParticipantsForm = ({ activityData }) => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const fetchParticipants = useCallback(async () => {
    if (!activityData?.Activity_ID) return;

    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_SERVER_PROTOCOL}${process.env.REACT_APP_SERVER_BASE_URL}${process.env.REACT_APP_SERVER_PORT}/api/admin/activities/${activityData.Activity_ID}/participants`,
        { withCredentials: true }
      );

      if (response.data?.status) {
        setParticipants(response.data.data);
      }
    } catch (err) {
      console.error('Fetch participants error:', err);
    } finally {
      setLoading(false);
    }
  }, [activityData?.Activity_ID]);

  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  // คำนวณสถิติสาขา
  const departmentStats = useMemo(() => {
    const stats = {};
    
    participants.forEach(participant => {
      const deptName = participant.Department_Name || 'ไม่ระบุสาขา';
      
      if (!stats[deptName]) {
        stats[deptName] = {
          total: 0,
          checkedIn: 0,
          completed: 0,
          facultyName: participant.Faculty_Name || 'ไม่ระบุคณะ'
        };
      }
      
      stats[deptName].total++;
      
      if (participant.Registration_CheckInTime) {
        stats[deptName].checkedIn++;
      }
      
      if (participant.Registration_CheckOutTime) {
        stats[deptName].completed++;
      }
    });

    // แปลงเป็น array และเรียงตามจำนวนคน
    return Object.entries(stats)
      .map(([name, data]) => ({
        name,
        ...data,
        checkInRate: data.total > 0 ? ((data.checkedIn / data.total) * 100).toFixed(1) : 0,
        completionRate: data.total > 0 ? ((data.completed / data.total) * 100).toFixed(1) : 0
      }))
      .sort((a, b) => b.total - a.total);
  }, [participants]);


  const handleCheckIn = async (userId) => {
    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_SERVER_PROTOCOL}${process.env.REACT_APP_SERVER_BASE_URL}${process.env.REACT_APP_SERVER_PORT}/api/admin/activities/${activityData.Activity_ID}/participants/${userId}/checkin`,
        {},
        { withCredentials: true }
      );

      if (response.data?.status) {
        fetchParticipants();
      }
    } catch (err) {
      console.error('Check-in error:', err);
    }
  };

  const handleCheckOut = async (userId) => {
    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_SERVER_PROTOCOL}${process.env.REACT_APP_SERVER_BASE_URL}${process.env.REACT_APP_SERVER_PORT}/api/admin/activities/${activityData.Activity_ID}/participants/${userId}/checkout`,
        {},
        { withCredentials: true }
      );

      if (response.data?.status) {
        fetchParticipants();
      }
    } catch (err) {
      console.error('Check-out error:', err);
    }
  };

  const filteredParticipants = participants.filter(p => {
    const matchesSearch = searchQuery === '' ||
      p.Student_FirstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.Student_LastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.Student_Code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.Department_Name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'checkedIn' && p.Registration_CheckInTime) ||
      (filterStatus === 'notCheckedIn' && !p.Registration_CheckInTime) ||
      (filterStatus === 'completed' && p.Registration_CheckOutTime);

    const matchesDepartment = selectedDepartment === 'all' ||
      p.Department_Name === selectedDepartment;

    return matchesSearch && matchesStatus && matchesDepartment;
  });

  if (loading) {
    return (
      <div className={styles.profileContent}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>กำลังโหลดรายชื่อผู้เข้าร่วม...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.profileContent}>
      <div className={styles.sectionHeader}>
        <h3>
          <Users size={20} />
          รายชื่อผู้เข้าร่วมกิจกรรม
        </h3>
        <div className={styles.participantsSummary}>
          <span className={styles.summaryItem}>
            ทั้งหมด: {participants.length} คน
          </span>
          <span className={styles.summaryItem}>
            เช็คอินแล้ว: {participants.filter(p => p.Registration_CheckInTime).length} คน
          </span>
        </div>
      </div>

      {/* สถิติสาขา */}
      <div className={styles.departmentStatsSection}>
        <h4>
          <Building2 size={18} style={{ display: 'inline', marginRight: '8px' }} />
          สถิติการเข้าร่วมแยกตามสาขา
        </h4>
        <div className={styles.departmentStatsGrid}>
          {departmentStats.map((dept, index) => (
            <div 
              key={index} 
              className={`${styles.deptStatCard} ${selectedDepartment === dept.name ? styles.selected : ''}`}
              onClick={() => setSelectedDepartment(selectedDepartment === dept.name ? 'all' : dept.name)}
              style={{ cursor: 'pointer' }}
            >
              <div className={styles.deptStatHeader}>
                <div className={styles.deptStatTitle}>
                  <strong>{dept.name}</strong>
                  <span className={styles.deptFaculty}>{dept.facultyName}</span>
                </div>
                <div className={styles.deptStatBadge}>
                  {dept.total} คน
                </div>
              </div>
              <div className={styles.deptStatDetails}>
                <div className={styles.deptStatItem}>
                  <span className={styles.deptStatLabel}>เช็คอินแล้ว:</span>
                  <span className={styles.deptStatValue}>
                    {dept.checkedIn} คน ({dept.checkInRate}%)
                  </span>
                </div>
                <div className={styles.deptStatItem}>
                  <span className={styles.deptStatLabel}>เสร็จสิ้น:</span>
                  <span className={styles.deptStatValue}>
                    {dept.completed} คน ({dept.completionRate}%)
                  </span>
                </div>
              </div>
              <div className={styles.deptStatProgress}>
                <div 
                  className={styles.deptStatProgressBar}
                  style={{ width: `${dept.completionRate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        {selectedDepartment !== 'all' && (
          <div className={styles.filterActive}>
            กำลังกรองสาขา: <strong>{selectedDepartment}</strong>
            <button 
              className={styles.clearFilter}
              onClick={() => setSelectedDepartment('all')}
            >
              <X size={14} /> ล้างการกรอง
            </button>
          </div>
        )}
      </div>

      <div className={styles.filterSection}>
        <div className={styles.searchBox}>
          <Search size={16} />
          <input
            type="text"
            placeholder="ค้นหาชื่อ, รหัสนักศึกษา หรือสาขา..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterButtons}>
          <button
            className={`${styles.filterButton} ${filterStatus === 'all' ? styles.active : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            ทั้งหมด
          </button>
          <button
            className={`${styles.filterButton} ${filterStatus === 'checkedIn' ? styles.active : ''}`}
            onClick={() => setFilterStatus('checkedIn')}
          >
            เช็คอินแล้ว
          </button>
          <button
            className={`${styles.filterButton} ${filterStatus === 'notCheckedIn' ? styles.active : ''}`}
            onClick={() => setFilterStatus('notCheckedIn')}
          >
            ยังไม่เช็คอิน
          </button>
          <button
            className={`${styles.filterButton} ${filterStatus === 'completed' ? styles.active : ''}`}
            onClick={() => setFilterStatus('completed')}
          >
            เสร็จสิ้น
          </button>
        </div>
      </div>

      <div className={styles.participantsList}>
        {filteredParticipants.length === 0 ? (
          <div className={styles.emptyState}>
            <Users size={48} />
            <h4>ไม่พบผู้เข้าร่วม</h4>
            <p>
              {searchQuery || selectedDepartment !== 'all' || filterStatus !== 'all'
                ? 'ไม่พบผลลัพธ์ที่ตรงกับการค้นหา ลองเปลี่ยนคำค้นหาหรือตัวกรอง'
                : 'ยังไม่มีผู้ลงทะเบียนเข้าร่วมกิจกรรมนี้'}
            </p>
          </div>
        ) : (
          <>
            <div className={styles.participantsCount}>
              แสดง {filteredParticipants.length} จาก {participants.length} คน
            </div>
            {filteredParticipants.map((participant, index) => (
              <div key={participant.Users_ID} className={styles.participantCard}>
                <div className={styles.participantInfo}>
                  <div className={styles.participantNumber}>#{index + 1}</div>
                  <div className={styles.participantDetails}>
                    <h4>{participant.Student_FirstName} {participant.Student_LastName}</h4>
                    <p className={styles.participantCode}>{participant.Student_Code}</p>
                    <p className={styles.participantDept}>
                      <Building2 size={14} style={{ display: 'inline', marginRight: '4px' }} />
                      {participant.Department_Name} - {participant.Faculty_Name}
                    </p>
                  </div>
                </div>

                <div className={styles.participantStatus}>
                  {participant.Registration_CheckInTime && (
                    <div className={styles.statusItem}>
                      <Clock size={14} />
                      <span>เช็คอิน: {new Date(participant.Registration_CheckInTime).toLocaleTimeString('th-TH')}</span>
                    </div>
                  )}
                  {participant.Registration_CheckOutTime && (
                    <div className={styles.statusItem}>
                      <Clock size={14} />
                      <span>เช็คเอาท์: {new Date(participant.Registration_CheckOutTime).toLocaleTimeString('th-TH')}</span>
                    </div>
                  )}
                </div>

                <div className={styles.participantActions}>
                  {!participant.Registration_CheckInTime ? (
                    <button
                      className={`${styles.actionButton} ${styles.checkInButton}`}
                      onClick={() => handleCheckIn(participant.Users_ID)}
                    >
                      <Check size={16} /> เช็คอิน
                    </button>
                  ) : !participant.Registration_CheckOutTime ? (
                    <button
                      className={`${styles.actionButton} ${styles.checkOutButton}`}
                      onClick={() => handleCheckOut(participant.Users_ID)}
                    >
                      <X size={16} /> เช็คเอาท์
                    </button>
                  ) : (
                    <span className={styles.completedBadge}>
                      <Check size={16} /> เสร็จสิ้น
                    </span>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default ActivityParticipantsForm;