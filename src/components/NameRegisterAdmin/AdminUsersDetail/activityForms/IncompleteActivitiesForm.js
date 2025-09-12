import React, { useState, useEffect } from 'react';
import { AlertTriangle, BookOpen, Clock, ExternalLink, Filter } from 'lucide-react';
import styles from './ActivityForms.module.css';

const IncompleteActivitiesForm = ({ userData }) => {
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const activityRequirements = [
    {
      id: 1,
      category: 'กิจกรรมด้านวิชาการ',
      description: 'การบรรยายพิเศษ สัมมนาวิชาการ การประชุมวิชาการ',
      requiredHours: 6,
      completedHours: 4,
      maxHours: 12,
      color: '#3b82f6'
    },
    {
      id: 2,
      category: 'กิจกรรมด้านกีฬา',
      description: 'การแข่งขันกีฬา การออกกำลังกาย กิจกรรมนันทนาการ',
      requiredHours: 4,
      completedHours: 2,
      maxHours: 8,
      color: '#10b981'
    },
    {
      id: 3,
      category: 'กิจกรรมด้านศิลปวัฒนธรรม',
      description: 'การแสดงดนตรี นาฏศิลป์ นิทรรศการศิลปกรรม',
      requiredHours: 4,
      completedHours: 4,
      maxHours: 8,
      color: '#8b5cf6'
    },
    {
      id: 4,
      category: 'กิจกรรมจิตอาสา',
      description: 'บริการชุมชน อาสาสมัคร ช่วยเหลือสังคม',
      requiredHours: 8,
      completedHours: 8,
      maxHours: 16,
      color: '#f59e0b'
    },
    {
      id: 5,
      category: 'กิจกรรมสร้างจิตสำนึกด้านศาสนา',
      description: 'กิจกรรมทางศาสนา ค่ายธรรม การทำบุญ',
      requiredHours: 2,
      completedHours: 0,
      maxHours: 4,
      color: '#ef4444'
    },
    {
      id: 6,
      category: 'กิจกรรมสร้างจิตสำนึกด้านประชาธิปไตย',
      description: 'การเลือกตั้ง การมีส่วนร่วมทางการเมือง กิจกรรมพลเมือง',
      requiredHours: 2,
      completedHours: 0,
      maxHours: 4,
      color: '#06b6d4'
    },
    {
      id: 7,
      category: 'กิจกรรมเสริมสร้างคุณธรรมจริยธรรม',
      description: 'การพัฒนาคุณธรรม จริยธรรม ค่านิยมที่ดี',
      requiredHours: 2,
      completedHours: 2,
      maxHours: 4,
      color: '#84cc16'
    },
    {
      id: 8,
      category: 'กิจกรรมพัฒนาบุคลิกภาพ',
      description: 'การพัฒนาทักษะการสื่อสาร ภาวะผู้นำ มารยาทสังคม',
      requiredHours: 4,
      completedHours: 2,
      maxHours: 8,
      color: '#f97316'
    },
    {
      id: 9,
      category: 'กิจกรรมสร้างจิตสำนึกด้านสิ่งแวดล้อม',
      description: 'อนุรักษ์สิ่งแวดล้อม ปลูกป่า รักษาธรรมชาติ',
      requiredHours: 4,
      completedHours: 0,
      maxHours: 8,
      color: '#22c55e'
    },
    {
      id: 10,
      category: 'กิจกรรมป้องกันสาธารณภัย',
      description: 'การป้องกันอุบัติเหตุ อัคคีภัย การช่วยเหลือฉุกเฉิน',
      requiredHours: 2,
      completedHours: 0,
      maxHours: 4,
      color: '#dc2626'
    },
    {
      id: 11,
      category: 'กิจกรรมส่งเสริมสุขภาพ',
      description: 'การตรวจสุขภาพ การให้ความรู้สุขภาพ การป้องกันโรค',
      requiredHours: 2,
      completedHours: 2,
      maxHours: 4,
      color: '#ec4899'
    },
    {
      id: 12,
      category: 'กิจกรรมส่งเสริมความเป็นไทย',
      description: 'การอนุรักษ์ภาษาไทย ประเพณีไทย วัฒนธรรมไทย',
      requiredHours: 2,
      completedHours: 0,
      maxHours: 4,
      color: '#7c3aed'
    },
    {
      id: 13,
      category: 'กิจกรรมส่งเสริมการใช้เวลาว่างให้เป็นประโยชน์',
      description: 'การพัฒนาทักษะชีวิต งานอดิเรก การเรียนรู้นอกหลักสูตร',
      requiredHours: 2,
      completedHours: 0,
      maxHours: 4,
      color: '#059669'
    }
  ];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setRequirements(activityRequirements);
      setLoading(false);
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCompletionStatus = (required, completed) => {
    if (completed >= required) return 'completed';
    return 'incomplete';
  };

  const getProgressPercentage = (required, completed) => {
    return Math.min((completed / required) * 100, 100);
  };

  const filteredRequirements = requirements.filter(req => {
    if (filter === 'all') return true;
    if (filter === 'completed') return req.completedHours >= req.requiredHours;
    if (filter === 'incomplete') return req.completedHours < req.requiredHours;
    return true;
  });

  const totalRequired = requirements.reduce((sum, req) => sum + req.requiredHours, 0);
  const totalCompleted = requirements.reduce((sum, req) => sum + req.completedHours, 0);
  const incompleteCount = requirements.filter(req => req.completedHours < req.requiredHours).length;

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
    <div className={styles.incompleteActivitiesContent}>
      <div className={styles.sectionHeader}>
        <div className={styles.headerLeft}>
          <h3>
            <BookOpen size={20} />
            กิจกรรมนักศึกษา (13 ลักษณะ)
          </h3>
          <div className={styles.summary}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>ความคืบหน้า:</span>
              <span className={styles.summaryValue}>
                {totalCompleted}/{totalRequired} ชั่วโมง ({Math.round((totalCompleted / totalRequired) * 100)}%)
              </span>
            </div>
            {incompleteCount > 0 && (
              <div className={styles.warningItem}>
                <AlertTriangle size={16} />
                <span>ยังไม่ครบ {incompleteCount} ลักษณะ</span>
              </div>
            )}
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
              <option value="incomplete">ยังไม่ครบ</option>
              <option value="completed">ครบแล้ว</option>
            </select>
          </div>
          <button className={styles.viewAllButton}>
            <ExternalLink size={16} />
            ดูรายละเอียด
          </button>
        </div>
      </div>

      <div className={styles.requirementsList}>
        {filteredRequirements.map((requirement) => {
          const status = getCompletionStatus(requirement.requiredHours, requirement.completedHours);
          const percentage = getProgressPercentage(requirement.requiredHours, requirement.completedHours);

          return (
            <div key={requirement.id} className={styles.requirementItem}>
              <div className={styles.requirementHeader}>
                <div className={styles.categoryInfo}>
                  <div
                    className={styles.categoryColor}
                    style={{ backgroundColor: requirement.color }}
                  ></div>
                  <div>
                    <h4>{requirement.category}</h4>
                    <p>{requirement.description}</p>
                  </div>
                </div>
                <div className={styles.statusContainer}>
                  <span className={`${styles.statusBadge} ${styles[status]}`}>
                    {status === 'completed' ? 'ครบแล้ว' : 'ยังไม่ครบ'}
                  </span>
                </div>
              </div>

              <div className={styles.progressContainer}>
                <div className={styles.progressInfo}>
                  <span className={styles.progressText}>
                    {requirement.completedHours}/{requirement.requiredHours} ชั่วโมง
                  </span>
                  <span className={styles.progressPercent}>
                    {Math.round(percentage)}%
                  </span>
                </div>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: requirement.color
                    }}
                  ></div>
                </div>
                <div className={styles.progressDetails}>
                  <span className={styles.maxHours}>
                    สูงสุด {requirement.maxHours} ชั่วโมง
                  </span>
                  {requirement.completedHours < requirement.requiredHours && (
                    <span className={styles.remainingHours}>
                      <Clock size={14} />
                      ต้องทำเพิ่ม {requirement.requiredHours - requirement.completedHours} ชั่วโมง
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredRequirements.length === 0 && (
        <div className={styles.emptyState}>
          <BookOpen size={48} />
          <h4>ไม่พบข้อมูล</h4>
          <p>
            {filter === 'completed' && 'ยังไม่มีกิจกรรมที่ครบตามเกณฑ์'}
            {filter === 'incomplete' && 'กิจกรรมทั้งหมดครบตามเกณฑ์แล้ว'}
          </p>
        </div>
      )}
    </div>
  );
};

export default IncompleteActivitiesForm;