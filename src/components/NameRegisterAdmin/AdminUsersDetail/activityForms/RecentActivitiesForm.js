import React, { useState, useEffect } from 'react';
import { Calendar, ExternalLink, Filter } from 'lucide-react';
import styles from './ActivityForms.module.css';

const RecentActivitiesForm = ({ userData }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // Mock activities data
  const mockActivities = [
    {
      id: 1,
      name: 'การบรรยายพิเศษ: นวัตกรรมเทคโนโลยี AI',
      type: 'บรรยายพิเศษ',
      date: '2024-02-15',
      time: '13:00-15:00',
      location: 'หอประชุมใหญ่',
      status: 'completed',
      hours: 2,
      registeredDate: '2024-02-10T09:30:00',
      completedDate: '2024-02-15T15:00:00'
    },
    {
      id: 2,
      name: 'กิจกรรมจิตอาสา: ปลูกป่าชุมชน',
      type: 'จิตอาสา',
      date: '2024-02-20',
      time: '08:00-16:00',
      location: 'วัดป่าสักงาม อ.เมือง',
      status: 'completed',
      hours: 8,
      registeredDate: '2024-02-12T14:20:00',
      completedDate: '2024-02-20T16:00:00'
    },
    {
      id: 3,
      name: 'สัมมนาวิชาการ: การพัฒนาซอฟต์แวร์สมัยใหม่',
      type: 'สัมมนาวิชาการ',
      date: '2024-03-01',
      time: '09:00-12:00',
      location: 'ห้องประชุม IT-201',
      status: 'registered',
      hours: 3,
      registeredDate: '2024-02-25T10:15:00'
    },
    {
      id: 4,
      name: 'การแข่งขันตอบปัญหาทางวิทยาศาสตร์',
      type: 'การแข่งขัน',
      date: '2024-03-05',
      time: '13:00-17:00',
      location: 'อาคารวิทยาศาสตร์',
      status: 'cancelled',
      hours: 4,
      registeredDate: '2024-02-28T16:45:00',
      cancelledDate: '2024-03-04T09:00:00'
    }
  ];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setActivities(mockActivities);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'completed': return 'เข้าร่วมแล้ว';
      case 'registered': return 'ลงทะเบียนแล้ว';
      case 'cancelled': return 'ยกเลิก';
      default: return status;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'completed': return styles.completed;
      case 'registered': return styles.registered;
      case 'cancelled': return styles.cancelled;
      default: return '';
    }
  };

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    return activity.status === filter;
  });

  const totalCompletedHours = activities
    .filter(activity => activity.status === 'completed')
    .reduce((total, activity) => total + activity.hours, 0);

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
              รวม {totalCompletedHours} ชั่วโมง จาก {activities.filter(a => a.status === 'completed').length} กิจกรรม
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
              <option value="all">ทั้งหมด</option>
              <option value="completed">เข้าร่วมแล้ว</option>
              <option value="registered">ลงทะเบียนแล้ว</option>
              <option value="cancelled">ยกเลิก</option>
            </select>
          </div>
          <button className={styles.viewAllButton}>
            <ExternalLink size={16} />
            ดูทั้งหมด
          </button>
        </div>
      </div>

      {filteredActivities.length === 0 ? (
        <div className={styles.emptyState}>
          <Calendar size={48} />
          <h4>ไม่พบกิจกรรม</h4>
          <p>
            {filter === 'all' 
              ? 'ยังไม่มีกิจกรรมที่ลงทะเบียน' 
              : `ไม่พบกิจกรรมที่มีสถานะ "${getStatusDisplay(filter)}"`
            }
          </p>
        </div>
      ) : (
        <div className={styles.activitiesList}>
          {filteredActivities.map((activity) => (
            <div key={activity.id} className={styles.activityItem}>
              <div className={styles.activityHeader}>
                <h4>{activity.name}</h4>
                <span className={`${styles.statusBadge} ${getStatusClass(activity.status)}`}>
                  {getStatusDisplay(activity.status)}
                </span>
              </div>
              
              <div className={styles.activityInfo}>
                <div className={styles.infoRow}>
                  <span className={styles.label}>ประเภท:</span>
                  <span className={styles.value}>{activity.type}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>วันที่:</span>
                  <span className={styles.value}>
                    {new Date(activity.date).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>เวลา:</span>
                  <span className={styles.value}>{activity.time}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>สถานที่:</span>
                  <span className={styles.value}>{activity.location}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>จำนวนชั่วโมง:</span>
                  <span className={styles.value}>{activity.hours} ชั่วโมง</span>
                </div>
              </div>

              <div className={styles.activityTimeline}>
                <div className={styles.timelineItem}>
                  <span className={styles.timelineLabel}>ลงทะเบียน:</span>
                  <span className={styles.timelineValue}>
                    {new Date(activity.registeredDate).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                {activity.completedDate && (
                  <div className={styles.timelineItem}>
                    <span className={styles.timelineLabel}>เข้าร่วม:</span>
                    <span className={styles.timelineValue}>
                      {new Date(activity.completedDate).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                )}
                {activity.cancelledDate && (
                  <div className={styles.timelineItem}>
                    <span className={styles.timelineLabel}>ยกเลิก:</span>
                    <span className={styles.timelineValue}>
                      {new Date(activity.cancelledDate).toLocaleDateString('th-TH', {
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentActivitiesForm;