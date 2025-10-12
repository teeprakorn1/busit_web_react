// ActivityModal/ActivityModal.js - Updated to show teachers
import React, { useEffect, useState, useCallback } from 'react';
import { X, Calendar, MapPin, Clock, Users, FileText, AlertCircle, Loader, Building2, GraduationCap, UserCheck } from 'lucide-react';
import styles from './ActivityModal.module.css';
import LocationDisplay from './LocationDisplay';
import axios from 'axios';

const getApiUrl = (endpoint) => {
  return `${process.env.REACT_APP_SERVER_PROTOCOL}${process.env.REACT_APP_SERVER_BASE_URL}${process.env.REACT_APP_SERVER_PORT}${endpoint}`;
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

function ActivityModal({ isOpen, onClose, activityId }) {
  const [activityDetail, setActivityDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [stats, setStats] = useState(null);
  const [participantStats, setParticipantStats] = useState({ students: 0, teachers: 0, total: 0 });

  const fetchActivityDetail = useCallback(async () => {
    if (!activityId) return;
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        getApiUrl(`/api/admin/activities/${activityId}/details`),
        { withCredentials: true }
      );

      if (response.data?.status) {
        setActivityDetail(response.data.data);
      }
    } catch (err) {
      console.error('Fetch activity detail error:', err);
      setError('ไม่สามารถโหลดข้อมูลกิจกรรมได้');
    } finally {
      setLoading(false);
    }
  }, [activityId]);

  const fetchParticipants = useCallback(async () => {
    if (!activityId) return;
    try {
      const response = await axios.get(
        getApiUrl(`/api/admin/activities/${activityId}/participants`),
        { withCredentials: true }
      );

      if (response.data?.status) {
        setParticipants(response.data.data);
        // ตั้งค่าสถิติจาก API response
        if (response.data.stats) {
          setParticipantStats(response.data.stats);
        }
      }
    } catch (err) {
      console.error('Fetch participants error:', err);
    }
  }, [activityId]);

  const fetchStats = useCallback(async () => {
    if (!activityId) return;
    try {
      const response = await axios.get(
        getApiUrl(`/api/admin/activities/${activityId}/stats`),
        { withCredentials: true }
      );

      if (response.data?.status) {
        setStats(response.data.data);
      }
    } catch (err) {
      console.error('Fetch stats error:', err);
    }
  }, [activityId]);

  useEffect(() => {
    if (isOpen && activityId) {
      fetchActivityDetail();
      fetchParticipants();
      fetchStats();
    } else if (!isOpen) {
      setActivityDetail(null);
      setParticipants([]);
      setStats(null);
      setError(null);
      setParticipantStats({ students: 0, teachers: 0, total: 0 });
    }
  }, [isOpen, activityId, fetchActivityDetail, fetchParticipants, fetchStats]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (loading) {
    return (
      <div className={styles.modalOverlay} onClick={handleBackdropClick}>
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <h2>กำลังโหลดข้อมูล...</h2>
            <button className={styles.closeButton} onClick={onClose}>
              <X size={24} />
            </button>
          </div>
          <div className={styles.modalBody}>
            <div className={styles.loadingContainer}>
              <Loader className={styles.spinner} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.modalOverlay} onClick={handleBackdropClick}>
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <h2>เกิดข้อผิดพลาด</h2>
            <button className={styles.closeButton} onClick={onClose}>
              <X size={24} />
            </button>
          </div>
          <div className={styles.modalBody}>
            <div className={styles.errorContainer}>
              <AlertCircle className={styles.errorIcon} />
              <p>{error}</p>
            </div>
          </div>
          <div className={styles.modalFooter}>
            <button className={styles.closeBtn} onClick={onClose}>
              ปิด
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!activityDetail) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleBackdropClick}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <div className={styles.activityInfo}>
            <h2 className={styles.activityTitle}>{activityDetail.Activity_Title}</h2>
            <div className={styles.badges}>
              <span className={styles.typeBadge}>
                {activityDetail.ActivityType_Name}
              </span>
              <span className={`${styles.statusBadge} ${styles[activityDetail.ActivityStatus_Name]}`}>
                {activityDetail.ActivityStatus_Name}
              </span>
              {activityDetail.Activity_IsRequire && (
                <span className={styles.requireBadge}>บังคับเข้าร่วม</span>
              )}
              {activityDetail.Activity_AllowTeachers && (
                <span className={styles.teacherBadge}>
                  <UserCheck size={14} />
                  เปิดให้อาจารย์เข้าร่วม
                </span>
              )}
            </div>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Activity Image */}
          {activityDetail.Activity_ImageFile && (
            <div className={styles.imageSection}>
              <img
                src={getApiUrl(`${process.env.REACT_APP_API_IMAGES_ACTIVITY_GET}${activityDetail.Activity_ImageFile}`)}
                alt={activityDetail.Activity_Title}
                className={styles.activityImage}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          )}

          {/* Description */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <FileText size={18} />
              รายละเอียด
            </h3>
            <p className={styles.description}>{activityDetail.Activity_Description}</p>
            {activityDetail.ActivityType_Description && (
              <div className={styles.typeDescription}>
                <strong>เกี่ยวกับประเภทนี้:</strong> {activityDetail.ActivityType_Description}
              </div>
            )}
          </div>

          {/* Date & Time */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <Calendar size={18} />
              วันและเวลา
            </h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <Clock className={styles.infoIcon} />
                <div>
                  <label>เริ่มต้น</label>
                  <span>{formatDate(activityDetail.Activity_StartTime)}</span>
                </div>
              </div>
              <div className={styles.infoItem}>
                <Clock className={styles.infoIcon} />
                <div>
                  <label>สิ้นสุด</label>
                  <span>{formatDate(activityDetail.Activity_EndTime)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Location with Map */}
          {(activityDetail.Activity_LocationDetail || activityDetail.Activity_LocationGPS) && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <MapPin size={18} />
                สถานที่
              </h3>

              {activityDetail.Activity_LocationDetail && (
                <p className={styles.locationText}>
                  {activityDetail.Activity_LocationDetail}
                </p>
              )}

              {activityDetail.Activity_LocationGPS && (() => {
                try {
                  const gpsString = activityDetail.Activity_LocationGPS;
                  let location = null;

                  if (typeof gpsString === 'string' && gpsString.includes('POINT')) {
                    const match = gpsString.match(/POINT\(([^ ]+) ([^ ]+)\)/);
                    if (match) {
                      location = {
                        lng: parseFloat(match[1]),
                        lat: parseFloat(match[2])
                      };
                    }
                  } else if (gpsString && typeof gpsString === 'object') {
                    if (gpsString.x && gpsString.y) {
                      location = {
                        lng: gpsString.x,
                        lat: gpsString.y
                      };
                    } else if (gpsString.lng && gpsString.lat) {
                      location = gpsString;
                    }
                  }

                  if (location && location.lat && location.lng) {
                    return (
                      <div className={styles.mapContainer}>
                        <LocationDisplay
                          location={location}
                          locationDetail={activityDetail.Activity_LocationDetail}
                        />
                      </div>
                    );
                  }
                } catch (error) {
                  console.error('Error parsing GPS data:', error);
                  return null;
                }
                return null;
              })()}
            </div>
          )}

          {/* Departments */}
          {activityDetail.departments && activityDetail.departments.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <Building2 size={18} />
                สาขาที่เข้าร่วม ({activityDetail.total_departments} สาขา)
              </h3>
              <div className={styles.departmentsSummary}>
                <div className={styles.summaryCard}>
                  <div className={styles.summaryValue}>{activityDetail.total_expected}</div>
                  <div className={styles.summaryLabel}>ผู้เข้าร่วมที่คาดหวัง</div>
                </div>
                <div className={styles.summaryCard}>
                  <div className={styles.summaryValue}>{activityDetail.total_registered}</div>
                  <div className={styles.summaryLabel}>ลงทะเบียนแล้ว</div>
                </div>
                <div className={styles.summaryCard}>
                  <div className={styles.summaryValue}>{activityDetail.total_checked_in}</div>
                  <div className={styles.summaryLabel}>เช็คอินแล้ว</div>
                </div>
              </div>

              {/* แสดงสถิติแยกนักศึกษาและอาจารย์ถ้ามี */}
              {activityDetail.Activity_AllowTeachers && (
                <div className={styles.participantTypeStats}>
                  <div className={styles.statTypeCard}>
                    <GraduationCap className={styles.statIcon} />
                    <div className={styles.statContent}>
                      <div className={styles.statLabel}>นักศึกษา</div>
                      <div className={styles.statValue}>{activityDetail.total_students || 0} คน</div>
                    </div>
                  </div>
                  <div className={styles.statTypeCard}>
                    <UserCheck className={styles.statIcon} />
                    <div className={styles.statContent}>
                      <div className={styles.statLabel}>อาจารย์</div>
                      <div className={styles.statValue}>{activityDetail.total_teachers || 0} คน</div>
                    </div>
                  </div>
                </div>
              )}

              <div className={styles.departmentsList}>
                {activityDetail.departments.map((dept, index) => (
                  <div key={index} className={styles.departmentCard}>
                    <div className={styles.departmentHeader}>
                      <div className={styles.departmentInfo}>
                        <GraduationCap className={styles.deptIcon} />
                        <div>
                          <div className={styles.departmentName}>{dept.Department_Name}</div>
                          <div className={styles.facultyName}>{dept.Faculty_Name}</div>
                        </div>
                      </div>
                    </div>
                    <div className={styles.departmentStats}>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>คาดหวัง:</span>
                        <span className={styles.statValue}>{dept.ActivityDetail_Total} คน</span>
                      </div>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>ลงทะเบียน:</span>
                        <span className={styles.statValue}>{dept.registered_count} คน</span>
                      </div>
                      {activityDetail.Activity_AllowTeachers && (
                        <>
                          <div className={styles.statItem}>
                            <span className={styles.statLabel}>นักศึกษา:</span>
                            <span className={styles.statValue}>{dept.student_count || 0} คน</span>
                          </div>
                          <div className={styles.statItem}>
                            <span className={styles.statLabel}>อาจารย์:</span>
                            <span className={styles.statValue}>{dept.teacher_count || 0} คน</span>
                          </div>
                        </>
                      )}
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>เช็คอิน:</span>
                        <span className={styles.statValue}>{dept.checked_in_count} คน</span>
                      </div>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>อัตราการเข้าร่วม:</span>
                        <span className={styles.statValue}>
                          {dept.ActivityDetail_Total > 0
                            ? `${((dept.registered_count / dept.ActivityDetail_Total) * 100).toFixed(1)}%`
                            : '0%'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Statistics */}
          {stats && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <Users size={18} />
                สถิติรวม
              </h3>
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>{stats.total_registered}</div>
                  <div className={styles.statLabel}>ลงทะเบียน</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>{stats.total_checked_in}</div>
                  <div className={styles.statLabel}>เช็คอิน</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>{stats.total_checked_out}</div>
                  <div className={styles.statLabel}>เช็คเอาท์</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>{stats.check_in_rate}%</div>
                  <div className={styles.statLabel}>อัตราเข้าร่วม</div>
                </div>
              </div>
            </div>
          )}

          {/* Participants */}
          {participants.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <Users size={18} />
                รายชื่อผู้เข้าร่วม ({participants.length} คน)
              </h3>
              
              {/* แสดงสถิติแยกประเภท */}
              {activityDetail.Activity_AllowTeachers && participantStats.total > 0 && (
                <div className={styles.participantTypeSummary}>
                  <span className={styles.summaryItem}>
                    <GraduationCap size={16} />
                    นักศึกษา: {participantStats.students} คน
                  </span>
                  <span className={styles.summaryItem}>
                    <UserCheck size={16} />
                    อาจารย์: {participantStats.teachers} คน
                  </span>
                </div>
              )}

              <div className={styles.participantsList}>
                {participants.slice(0, 10).map((participant, index) => (
                  <div key={index} className={styles.participantItem}>
                    <div className={styles.participantInfo}>
                      <div className={styles.participantHeader}>
                        <span className={styles.participantName}>
                          {participant.FirstName} {participant.LastName}
                        </span>
                        {participant.isTeacher && (
                          <span className={styles.teacherTag}>
                            <UserCheck size={12} />
                            อาจารย์
                          </span>
                        )}
                      </div>
                      <span className={styles.participantDetail}>
                        {participant.Code} | {participant.Department_Name}
                      </span>
                    </div>
                    <span className={styles.participantStatus}>
                      {participant.RegistrationStatus_Name || 'ลงทะเบียน'}
                    </span>
                  </div>
                ))}
                {participants.length > 10 && (
                  <div className={styles.moreParticipants}>
                    และอีก {participants.length - 10} คน
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Template Info */}
          {activityDetail.Template_Name && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <FileText size={18} />
                เกียรติบัตร
              </h3>
              <div className={styles.templateInfo}>
                <div className={styles.infoItem}>
                  <label>แม่แบบ:</label>
                  <span>{activityDetail.Template_Name}</span>
                </div>
                {activityDetail.Signature_Name && (
                  <div className={styles.infoItem}>
                    <label>ลายเซ็น:</label>
                    <span>{activityDetail.Signature_Name}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.closeBtn} onClick={onClose}>
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}

export default ActivityModal;