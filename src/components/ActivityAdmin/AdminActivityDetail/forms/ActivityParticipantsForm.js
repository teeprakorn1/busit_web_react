// ActivityParticipantsForm.js
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Users, Search, Building2, Eye, GraduationCap, UserCheck,
  ExternalLink, Settings, X, Clock, CheckCircle, XCircle,
  AlertCircle, Image as ImageIcon, Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './ActivityForms.module.css';
import { logActivityParticipantsView } from '../../../../utils/systemLog';

const ActivityParticipantsForm = ({ activityData }) => {
  const navigate = useNavigate();
  const isMountedRef = useRef(true);

  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [participantStats, setParticipantStats] = useState({
    total: 0,
    students: 0,
    teachers: 0,
    checkedIn: 0,
    completed: 0
  });

  const [participantImages, setParticipantImages] = useState({});
  const [loadingImages, setLoadingImages] = useState({});
  const [imageBlobUrls, setImageBlobUrls] = useState({});
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);

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

        const data = response.data.data;
        setParticipantStats({
          total: data.length,
          students: data.filter(p => p.isStudent).length,
          teachers: data.filter(p => p.isTeacher).length,
          checkedIn: data.filter(p => p.Registration_CheckInTime).length,
          completed: data.filter(p => p.Registration_CheckOutTime).length
        });

        await logActivityParticipantsView(
          activityData.Activity_ID,
          activityData.Activity_Title
        );
      }
    } catch (err) {
      console.error('Fetch participants error:', err);
    } finally {
      setLoading(false);
    }
  }, [activityData?.Activity_ID, activityData?.Activity_Title]);

  const fetchImageBlob = useCallback(async (imageFile) => {
    if (imageBlobUrls[imageFile]) return;

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_SERVER_PROTOCOL}${process.env.REACT_APP_SERVER_BASE_URL}${process.env.REACT_APP_SERVER_PORT}/api/admin/images/registration-images/${imageFile}`,
        {
          withCredentials: true,
          responseType: 'blob'
        }
      );

      const blobUrl = URL.createObjectURL(response.data);

      if (isMountedRef.current) {
        setImageBlobUrls(prev => ({
          ...prev,
          [imageFile]: blobUrl
        }));
      } else {
        URL.revokeObjectURL(blobUrl);
      }
    } catch (err) {
      console.error('Fetch image blob error:', err);
    }
  }, [imageBlobUrls]);

  const fetchParticipantImages = useCallback(async (userId) => {
    if (loadingImages[userId] || participantImages[userId]) return;

    setLoadingImages(prev => ({ ...prev, [userId]: true }));

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_SERVER_PROTOCOL}${process.env.REACT_APP_SERVER_BASE_URL}${process.env.REACT_APP_SERVER_PORT}/api/activities/${activityData.Activity_ID}/pictures`,
        {
          withCredentials: true,
          params: { userId }
        }
      );

      if (response.data?.status && response.data.data) {
        const userImages = response.data.data.filter(img => img.Users_ID === userId);
        setParticipantImages(prev => ({
          ...prev,
          [userId]: userImages
        }));

        for (const img of userImages) {
          await fetchImageBlob(img.RegistrationPicture_ImageFile);
        }
      }
    } catch (err) {
      console.error('Fetch images error:', err);
    } finally {
      setLoadingImages(prev => ({ ...prev, [userId]: false }));
    }
  }, [activityData?.Activity_ID, fetchImageBlob, loadingImages, participantImages]);

  const handleViewImages = useCallback((participant) => {
    setSelectedParticipant(participant);
    fetchParticipantImages(participant.Users_ID);
    setShowImageModal(true);
  }, [fetchParticipantImages]);

  const handleDownloadImage = useCallback(async (imageFile) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_SERVER_PROTOCOL}${process.env.REACT_APP_SERVER_BASE_URL}${process.env.REACT_APP_SERVER_PORT}/api/admin/images/registration-images/${imageFile}`,
        {
          withCredentials: true,
          responseType: 'blob'
        }
      );

      const blob = response.data;
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = imageFile;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Download image error:', err);
      alert('ไม่สามารถดาวน์โหลดรูปภาพได้');
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    fetchParticipants();

    return () => {
      isMountedRef.current = false;
      Object.values(imageBlobUrls).forEach(url => {
        URL.revokeObjectURL(url);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchParticipants]);

  const departmentStats = useMemo(() => {
    const stats = {};

    participants.forEach(participant => {
      const deptName = participant.Department_Name || 'ไม่ระบุสาขา';

      if (!stats[deptName]) {
        stats[deptName] = {
          total: 0,
          students: 0,
          teachers: 0,
          checkedIn: 0,
          completed: 0,
          facultyName: participant.Faculty_Name || 'ไม่ระบุคณะ'
        };
      }

      stats[deptName].total++;
      if (participant.isStudent) stats[deptName].students++;
      if (participant.isTeacher) stats[deptName].teachers++;
      if (participant.Registration_CheckInTime) stats[deptName].checkedIn++;
      if (participant.Registration_CheckOutTime) stats[deptName].completed++;
    });

    return Object.entries(stats)
      .map(([name, data]) => ({
        name,
        ...data,
        checkInRate: data.total > 0 ? ((data.checkedIn / data.total) * 100).toFixed(1) : 0,
        completionRate: data.total > 0 ? ((data.completed / data.total) * 100).toFixed(1) : 0
      }))
      .sort((a, b) => b.total - a.total);
  }, [participants]);

  const filteredParticipants = participants.filter(p => {
    const matchesSearch = searchQuery === '' ||
      p.FirstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.LastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.Code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.Department_Name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'checkedIn' && p.Registration_CheckInTime) ||
      (filterStatus === 'notCheckedIn' && !p.Registration_CheckInTime) ||
      (filterStatus === 'completed' && p.Registration_CheckOutTime);

    const matchesType = filterType === 'all' ||
      (filterType === 'student' && p.isStudent) ||
      (filterType === 'teacher' && p.isTeacher);

    const matchesDepartment = selectedDepartment === 'all' ||
      p.Department_Name === selectedDepartment;

    return matchesSearch && matchesStatus && matchesType && matchesDepartment;
  });

  const handleGoToManagement = () => {
    navigate('/activity-management/activity-join', {
      state: {
        preselectedActivityId: activityData.Activity_ID
      }
    });
  };

  const ImageModal = () => {
    if (!showImageModal || !selectedParticipant) return null;

    const images = participantImages[selectedParticipant.Users_ID] || [];
    const isLoading = loadingImages[selectedParticipant.Users_ID];

    return (
      <div className={styles.modalOverlay} onClick={() => setShowImageModal(false)}>
        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <h3>
              <ImageIcon size={20} />
              รูปภาพยืนยันการเข้าร่วม
            </h3>
            <button
              className={styles.modalCloseButton}
              onClick={() => setShowImageModal(false)}
            >
              <X size={20} />
            </button>
          </div>

          <div className={styles.modalBody}>
            <div className={styles.participantInfoHeader}>
              <div className={styles.participantHeaderWithType}>
                <h4>
                  {selectedParticipant.FirstName} {selectedParticipant.LastName}
                </h4>
                {selectedParticipant.isTeacher && (
                  <span className={styles.teacherBadge}>
                    <UserCheck size={14} />
                    อาจารย์
                  </span>
                )}
              </div>
              <p className={styles.participantCode}>
                {selectedParticipant.Code}
              </p>
              <p className={styles.participantDept}>
                {selectedParticipant.Department_Name}
              </p>
            </div>

            {isLoading ? (
              <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>กำลังโหลดรูปภาพ...</p>
              </div>
            ) : images.length === 0 ? (
              <div className={styles.noImages}>
                <ImageIcon size={48} />
                <p>ยังไม่มีรูปภาพยืนยัน</p>
              </div>
            ) : (
              <div className={styles.imageGrid}>
                {images.map((img, index) => {
                  const isApproved = img.RegistrationPictureStatus_Name === 'อนุมัติแล้ว';
                  const isRejected = img.RegistrationPictureStatus_Name === 'ปฏิเสธ';

                  const aiSuccess = img.RegistrationPicture_IsAiSuccess;
                  const hasAiResult = aiSuccess !== null && aiSuccess !== undefined;

                  return (
                    <div key={img.RegistrationPicture_ID} className={styles.imageCardReadOnly}>
                      <div className={styles.imageWrapper}>
                        {imageBlobUrls[img.RegistrationPicture_ImageFile] ? (
                          <img
                            src={imageBlobUrls[img.RegistrationPicture_ImageFile]}
                            alt={`รูปภาพ ${index + 1}`}
                            className={styles.participantImage}
                          />
                        ) : (
                          <div className={styles.imageLoading}>
                            <div className={styles.spinner}></div>
                          </div>
                        )}

                        {/* AI Badge */}
                        {hasAiResult && (
                          <div className={styles.aiBadge}>
                            {aiSuccess === 1 ? (
                              <span className={styles.aiSuccess}>
                                <CheckCircle size={12} /> AI: Real
                              </span>
                            ) : (
                              <span className={styles.aiFailed}>
                                <XCircle size={12} /> AI: Fake
                              </span>
                            )}
                          </div>
                        )}

                        {/* Download button */}
                        <div className={styles.imageOverlay}>
                          <button
                            className={styles.imageActionButton}
                            onClick={() => handleDownloadImage(img.RegistrationPicture_ImageFile)}
                            title="ดาวน์โหลด"
                          >
                            <Download size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Image Info */}
                      <div className={styles.imageInfo}>
                        <div className={styles.imageStatus}>
                          {isApproved ? (
                            <span className={styles.statusApproved}>
                              <CheckCircle size={14} /> อนุมัติแล้ว
                            </span>
                          ) : isRejected ? (
                            <span className={styles.statusRejected}>
                              <XCircle size={14} /> ปฏิเสธ
                            </span>
                          ) : (
                            <span className={styles.statusPending}>
                              <Clock size={14} /> รออนุมัติ
                            </span>
                          )}
                        </div>

                        {/* AI Status Detail */}
                        {hasAiResult && (
                          <div className={styles.aiStatusDetail}>
                            <span className={styles.aiLabel}>การตรวจสอบ AI:</span>
                            {aiSuccess === 1 ? (
                              <span className={styles.aiStatusSuccess}>
                                <CheckCircle size={14} /> รูปภาพจริง
                              </span>
                            ) : (
                              <span className={styles.aiStatusFailed}>
                                <AlertCircle size={14} /> ตรวจพบรูปปลอม
                              </span>
                            )}
                          </div>
                        )}

                        <p className={styles.imageTime}>
                          {new Date(img.RegistrationPicture_RegisTime).toLocaleString('th-TH')}
                        </p>
                        {isRejected && img.RegistrationPicture_RejectReason && (
                          <div className={styles.rejectReason}>
                            <AlertCircle size={14} />
                            <span>เหตุผล: {img.RegistrationPicture_RejectReason}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className={styles.modalFooter}>
              <p className={styles.modalFooterText}>
                ต้องการอนุมัติ/ปฏิเสธรูปภาพ?
              </p>
              <button
                className={styles.modalManagementButton}
                onClick={() => {
                  setShowImageModal(false);
                  handleGoToManagement();
                }}
              >
                <Settings size={16} />
                ไปหน้าจัดการผู้เข้าร่วม
                <ExternalLink size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
      {/* Header */}
      <div className={styles.sectionHeader}>
        <div className={styles.headerLeft}>
          <h3>
            <Users size={20} />
            รายชื่อผู้เข้าร่วมกิจกรรม
          </h3>
          <div className={styles.participantsSummary}>
            <span className={styles.summaryItem}>
              ทั้งหมด: {participantStats.total} คน
            </span>
            {activityData?.Activity_AllowTeachers && participantStats.total > 0 && (
              <>
                <span className={styles.summaryItem}>
                  <GraduationCap size={14} />
                  นักศึกษา: {participantStats.students} คน
                </span>
                <span className={styles.summaryItem}>
                  <UserCheck size={14} />
                  อาจารย์: {participantStats.teachers} คน
                </span>
              </>
            )}
            <span className={styles.summaryItem}>
              เช็คอินแล้ว: {participantStats.checkedIn} คน
            </span>
            <span className={styles.summaryItem}>
              เสร็จสิ้น: {participantStats.completed} คน
            </span>
          </div>
        </div>

        <button
          className={styles.managementButton}
          onClick={handleGoToManagement}
          title="ไปหน้าจัดการผู้เข้าร่วมกิจกรรม"
        >
          <Settings size={18} />
          จัดการผู้เข้าร่วม
          <ExternalLink size={16} />
        </button>
      </div>

      {/* Info Banner */}
      <div className={styles.infoBanner}>
        <Eye size={18} />
        <div className={styles.infoBannerText}>
          <strong>หน้านี้แสดงรายละเอียดเท่านั้น</strong>
          <span>หากต้องการเช็คอิน/เช็คเอาท์ หรืออนุมัติรูปภาพ กรุณาไปที่หน้า "จัดการผู้เข้าร่วมกิจกรรม"</span>
        </div>
      </div>

      {/* Department Stats */}
      <div className={styles.departmentStatsSection}>
        <h4>
          <Building2 size={18} />
          สถิติการเข้าร่วมแยกตามสาขา
        </h4>
        <div className={styles.departmentStatsGrid}>
          {departmentStats.map((dept, index) => (
            <div
              key={index}
              className={`${styles.deptStatCard} ${selectedDepartment === dept.name ? styles.selected : ''}`}
              onClick={() => setSelectedDepartment(selectedDepartment === dept.name ? 'all' : dept.name)}
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
                {activityData?.Activity_AllowTeachers && (
                  <>
                    <div className={styles.deptStatItem}>
                      <span className={styles.deptStatLabel}>นักศึกษา:</span>
                      <span className={styles.deptStatValue}>{dept.students} คน</span>
                    </div>
                    <div className={styles.deptStatItem}>
                      <span className={styles.deptStatLabel}>อาจารย์:</span>
                      <span className={styles.deptStatValue}>{dept.teachers} คน</span>
                    </div>
                  </>
                )}
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
      </div>

      {/* Filters */}
      <div className={styles.filterSection}>
        <div className={styles.searchBox}>
          <Search size={16} />
          <input
            type="text"
            placeholder="ค้นหาชื่อ, รหัส หรือสาขา..."
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

        {activityData?.Activity_AllowTeachers && (
          <div className={styles.filterButtons}>
            <button
              className={`${styles.filterButton} ${filterType === 'all' ? styles.active : ''}`}
              onClick={() => setFilterType('all')}
            >
              ทุกประเภท
            </button>
            <button
              className={`${styles.filterButton} ${filterType === 'student' ? styles.active : ''}`}
              onClick={() => setFilterType('student')}
            >
              <GraduationCap size={14} />
              นักศึกษา
            </button>
            <button
              className={`${styles.filterButton} ${filterType === 'teacher' ? styles.active : ''}`}
              onClick={() => setFilterType('teacher')}
            >
              <UserCheck size={14} />
              อาจารย์
            </button>
          </div>
        )}
      </div>

      {/* Participants List */}
      <div className={styles.participantsList}>
        {filteredParticipants.length === 0 ? (
          <div className={styles.emptyState}>
            <Users size={48} />
            <h4>ไม่พบผู้เข้าร่วม</h4>
            <p>
              {searchQuery || selectedDepartment !== 'all' || filterStatus !== 'all' || filterType !== 'all'
                ? 'ไม่พบผลลัพธ์ที่ตรงกับการค้นหา'
                : 'ยังไม่มีผู้ลงทะเบียนเข้าร่วมกิจกรรมนี้'}
            </p>
          </div>
        ) : (
          <>
            <div className={styles.participantsCount}>
              แสดง {filteredParticipants.length} จาก {participants.length} คน
            </div>
            {filteredParticipants.map((participant, index) => {
              const fullName = `${participant.FirstName} ${participant.LastName}`;
              const hasCheckedIn = !!participant.Registration_CheckInTime;

              return (
                <div key={participant.Users_ID} className={styles.participantCardReadOnly}>
                  <div className={styles.participantInfo}>
                    <div className={styles.participantNumber}>#{index + 1}</div>
                    <div className={styles.participantDetails}>
                      <div className={styles.participantNameRow}>
                        <h4>{fullName}</h4>
                        {participant.isTeacher && (
                          <span className={styles.teacherTag}>
                            <UserCheck size={12} />
                            อาจารย์
                          </span>
                        )}
                      </div>
                      <p className={styles.participantCode}>{participant.Code}</p>
                      <p className={styles.participantDept}>
                        <Building2 size={14} />
                        {participant.Department_Name} - {participant.Faculty_Name}
                      </p>
                    </div>
                  </div>

                  <div className={styles.participantStatusInfo}>
                    {participant.Registration_CheckInTime ? (
                      <div className={styles.statusBadgeSuccess}>
                        <span>✓ เช็คอินแล้ว</span>
                        <span className={styles.statusTime}>
                          {new Date(participant.Registration_CheckInTime).toLocaleString('th-TH')}
                        </span>
                      </div>
                    ) : (
                      <div className={styles.statusBadgePending}>
                        <span>○ ยังไม่เช็คอิน</span>
                      </div>
                    )}

                    {participant.Registration_CheckOutTime && (
                      <div className={styles.statusBadgeCompleted}>
                        <span>✓ เสร็จสิ้น</span>
                        <span className={styles.statusTime}>
                          {new Date(participant.Registration_CheckOutTime).toLocaleString('th-TH')}
                        </span>
                      </div>
                    )}

                    {/* View Images Button */}
                    {hasCheckedIn && (
                      <button
                        className={styles.viewImageButtonReadOnly}
                        onClick={() => handleViewImages(participant)}
                        title="ดูรูปภาพยืนยัน"
                      >
                        <Eye size={16} /> ดูรูป
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
      {participants.length > 0 && (
        <div className={styles.bottomCTA}>
          <p>ต้องการจัดการผู้เข้าร่วม (เช็คอิน/เช็คเอาท์/อนุมัติรูป)?</p>
          <button
            className={styles.ctaButton}
            onClick={handleGoToManagement}
          >
            <Settings size={18} />
            ไปหน้าจัดการผู้เข้าร่วมกิจกรรม
            <ExternalLink size={16} />
          </button>
        </div>
      )}
      <ImageModal />
    </div>
  );
};

export default ActivityParticipantsForm;