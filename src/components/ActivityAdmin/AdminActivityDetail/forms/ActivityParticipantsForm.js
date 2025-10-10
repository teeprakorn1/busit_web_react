// ActivityParticipantsForm.js - Enhanced with Image Display
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Users, Search, Check, X, Clock, Building2, Image as ImageIcon, Eye, Download, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';
import styles from './ActivityForms.module.css';
import { logActivityParticipantsView, logActivityParticipantCheckIn, logActivityParticipantCheckOut } from '../../../../utils/systemLog';

const ActivityParticipantsForm = ({ activityData }) => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [participantImages, setParticipantImages] = useState({});
  const [loadingImages, setLoadingImages] = useState({});

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
      }
    } catch (err) {
      console.error('Fetch images error:', err);
    } finally {
      setLoadingImages(prev => ({ ...prev, [userId]: false }));
    }
  }, [activityData?.Activity_ID, loadingImages, participantImages]);

  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

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

    return Object.entries(stats)
      .map(([name, data]) => ({
        name,
        ...data,
        checkInRate: data.total > 0 ? ((data.checkedIn / data.total) * 100).toFixed(1) : 0,
        completionRate: data.total > 0 ? ((data.completed / data.total) * 100).toFixed(1) : 0
      }))
      .sort((a, b) => b.total - a.total);
  }, [participants]);

  const handleCheckIn = async (userId, participantName) => {
    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_SERVER_PROTOCOL}${process.env.REACT_APP_SERVER_BASE_URL}${process.env.REACT_APP_SERVER_PORT}/api/admin/activities/${activityData.Activity_ID}/participants/${userId}/checkin`,
        {},
        { withCredentials: true }
      );

      if (response.data?.status) {
        fetchParticipants();

        await logActivityParticipantCheckIn(
          activityData.Activity_ID,
          activityData.Activity_Title,
          participantName
        );
      }
    } catch (err) {
      console.error('Check-in error:', err);
      alert(err.response?.data?.message || 'ไม่สามารถเช็คอินได้');
    }
  };

  const handleCheckOut = async (userId, participantName) => {
    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_SERVER_PROTOCOL}${process.env.REACT_APP_SERVER_BASE_URL}${process.env.REACT_APP_SERVER_PORT}/api/admin/activities/${activityData.Activity_ID}/participants/${userId}/checkout`,
        {},
        { withCredentials: true }
      );

      if (response.data?.status) {
        fetchParticipants();

        await logActivityParticipantCheckOut(
          activityData.Activity_ID,
          activityData.Activity_Title,
          participantName
        );
      }
    } catch (err) {
      console.error('Check-out error:', err);
      alert(err.response?.data?.message || 'ไม่สามารถเช็คเอาต์ได้');
    }
  };

  const handleViewImages = useCallback((participant) => {
    setSelectedParticipant(participant);
    fetchParticipantImages(participant.Users_ID);
    setShowImageModal(true);
  }, [fetchParticipantImages]);

  const handleDownloadImage = useCallback((imageFile) => {
    const imageUrl = `${process.env.REACT_APP_SERVER_PROTOCOL}${process.env.REACT_APP_SERVER_BASE_URL}${process.env.REACT_APP_SERVER_PORT}/api/images/registration-images/${imageFile}`;

    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = imageFile;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

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
              <h4>
                {selectedParticipant.Student_FirstName} {selectedParticipant.Student_LastName}
              </h4>
              <p className={styles.participantCode}>
                {selectedParticipant.Student_Code}
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
                {images.map((img, index) => (
                  <div key={img.RegistrationPicture_ID} className={styles.imageCard}>
                    <div className={styles.imageWrapper}>
                      <img
                        src={`${process.env.REACT_APP_SERVER_PROTOCOL}${process.env.REACT_APP_SERVER_BASE_URL}${process.env.REACT_APP_SERVER_PORT}/api/images/registration-images/${img.RegistrationPicture_ImageFile}`}
                        alt={`รูปภาพ ${index + 1}`}
                        className={styles.participantImage}
                      />
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
                    <div className={styles.imageInfo}>
                      <div className={styles.imageStatus}>
                        {img.RegistrationPictureStatus_Name === 'อนุมัติแล้ว' ? (
                          <span className={styles.statusApproved}>
                            <CheckCircle size={14} /> อนุมัติแล้ว
                          </span>
                        ) : img.RegistrationPictureStatus_Name === 'ปฏิเสธ' ? (
                          <span className={styles.statusRejected}>
                            <XCircle size={14} /> ปฏิเสธ
                          </span>
                        ) : (
                          <span className={styles.statusPending}>
                            <Clock size={14} /> รออนุมัติ
                          </span>
                        )}
                      </div>
                      <p className={styles.imageTime}>
                        {new Date(img.RegistrationPicture_RegisTime).toLocaleString('th-TH')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
          <span className={styles.summaryItem}>
            เสร็จสิ้น: {participants.filter(p => p.Registration_CheckOutTime).length} คน
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
            {filteredParticipants.map((participant, index) => {
              const fullName = `${participant.Student_FirstName} ${participant.Student_LastName}`;
              const hasCheckedIn = !!participant.Registration_CheckInTime;

              return (
                <div key={participant.Users_ID} className={styles.participantCard}>
                  <div className={styles.participantInfo}>
                    <div className={styles.participantNumber}>#{index + 1}</div>
                    <div className={styles.participantDetails}>
                      <h4>{fullName}</h4>
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
                    {hasCheckedIn && (
                      <button
                        className={`${styles.actionButton} ${styles.viewImageButton}`}
                        onClick={() => handleViewImages(participant)}
                        title="ดูรูปภาพยืนยัน"
                      >
                        <Eye size={16} /> ดูรูป
                      </button>
                    )}

                    {!participant.Registration_CheckInTime ? (
                      <button
                        className={`${styles.actionButton} ${styles.checkInButton}`}
                        onClick={() => handleCheckIn(participant.Users_ID, fullName)}
                      >
                        <Check size={16} /> เช็คอิน
                      </button>
                    ) : !participant.Registration_CheckOutTime ? (
                      <button
                        className={`${styles.actionButton} ${styles.checkOutButton}`}
                        onClick={() => handleCheckOut(participant.Users_ID, fullName)}
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
              );
            })}
          </>
        )}
      </div>

      <ImageModal />
    </div>
  );
};

export default ActivityParticipantsForm;