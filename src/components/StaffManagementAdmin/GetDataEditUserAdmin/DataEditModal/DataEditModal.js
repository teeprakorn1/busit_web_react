// DataEditModal/DataEditModal.js
import React, { useEffect, useState } from 'react';
import { X, Database, User, Calendar, Monitor, Info, FileText, Loader } from 'lucide-react';
import axios from 'axios';
import styles from './DataEditModal.module.css';

const getApiUrl = (endpoint) => {
  return `${process.env.REACT_APP_SERVER_PROTOCOL}${process.env.REACT_APP_SERVER_BASE_URL}${process.env.REACT_APP_SERVER_PORT}${endpoint}`;
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  try {
    return new Date(date).toLocaleString('th-TH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

const formatEditType = (editType) => {
  if (!editType) return 'Unknown';
  return editType
    .replace(/^dataedit_/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
};

const formatSourceTable = (sourceTable) => {
  const tableMap = {
    'Student': 'นักเรียน',
    'Teacher': 'อาจารย์',
    'Staff': 'เจ้าหน้าที่',
    'Users': 'ผู้ใช้'
  };
  return tableMap[sourceTable] || sourceTable || 'N/A';
};

const truncateUserAgent = (userAgent, maxLength = 80) => {
  if (!userAgent) return 'N/A';
  if (userAgent.length <= maxLength) return userAgent;
  return userAgent.substring(0, maxLength) + '...';
};

function DataEditModal({
  isOpen,
  onClose,
  dataEdit
}) {
  const [sourceData, setSourceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSourceData = async (sourceTable, thisId) => {
    if (!sourceTable || !thisId) return;

    setLoading(true);
    setError(null);

    try {
      let endpoint = '';

      switch (sourceTable) {
        case 'Student':
          endpoint = `/api/admin/students/${thisId}`;
          break;
        case 'Teacher':
          endpoint = `/api/admin/teachers/${thisId}`;
          break;
        case 'Staff':
          endpoint = `/api/admin/staff/${thisId}`;
          break;
        case 'Users':
          endpoint = `/api/admin/users/${thisId}`;
          break;
        case 'Activity':
          setError('ไม่สามารถดึงข้อมูล Activity ได้ในขณะนี้');
          return;
        default:
          setError(`ไม่รองรับการดึงข้อมูลจากตาราง: ${sourceTable}`);
          return;
      }

      const response = await axios.get(getApiUrl(endpoint), {
        withCredentials: true,
        timeout: 10000
      });

      if (response.data.status) {
        setSourceData(response.data.data);
      } else {
        setError('ไม่พบข้อมูลในตารางต้นฉบับ');
      }
    } catch (err) {
      console.error('Error fetching source data:', err);
      if (err.response?.status === 404) {
        setError('ข้อมูลในตารางต้นฉบับถูกลบแล้วหรือไม่พบ');
      } else if (err.response?.status === 403) {
        setError('ไม่มีสิทธิ์เข้าถึงข้อมูลในตารางต้นฉบับ');
      } else {
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูลตารางต้นฉบับ');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';

      if (dataEdit?.DataEdit_SourceTable && dataEdit?.DataEdit_ThisId) {
        fetchSourceData(dataEdit.DataEdit_SourceTable, dataEdit.DataEdit_ThisId);
      }
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
      setSourceData(null);
      setError(null);
    };
  }, [isOpen, dataEdit?.DataEdit_SourceTable, dataEdit?.DataEdit_ThisId, onClose]);

  if (!isOpen || !dataEdit) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const renderSourceTableData = () => {
    if (loading) {
      return (
        <div className={styles.sourceDataSection}>
          <h3 className={styles.sectionTitle}>
            <FileText size={16} />
            ข้อมูลในตาราง {formatSourceTable(dataEdit.DataEdit_SourceTable)}
          </h3>
          <div className={styles.loadingContainer}>
            <Loader className={styles.loadingSpinner} />
            <span>กำลังโหลดข้อมูล...</span>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className={styles.sourceDataSection}>
          <h3 className={styles.sectionTitle}>
            <FileText size={16} />
            ข้อมูลในตาราง {formatSourceTable(dataEdit.DataEdit_SourceTable)}
          </h3>
          <div className={styles.errorContainer}>
            <span className={styles.errorText}>{error}</span>
          </div>
        </div>
      );
    }

    if (!sourceData) {
      return null;
    }

    return (
      <div className={styles.sourceDataSection}>
        <h3 className={styles.sectionTitle}>
          <FileText size={16} />
          ข้อมูลในตาราง {formatSourceTable(dataEdit.DataEdit_SourceTable)}
        </h3>
        {renderTableSpecificData()}
      </div>
    );
  };

  const renderTableSpecificData = () => {
    if (!sourceData) return null;

    switch (dataEdit.DataEdit_SourceTable) {
      case 'Student':
        return renderStudentData();
      case 'Teacher':
        return renderTeacherData();
      case 'Staff':
        return renderStaffData();
      case 'Users':
        return renderUsersData();
      case 'Activity':
        return (
          <div className={styles.modalRow}>
            <div className={styles.modalLabel}>ข้อมูลไม่พร้อมใช้งาน:</div>
            <div className={styles.modalValue}>
              ยังไม่รองรับการแสดงข้อมูลจากตาราง Activity ในขณะนี้
            </div>
          </div>
        );
      default:
        return renderGenericData();
    }
  };

  const renderUsersData = () => (
    <>
      <div className={styles.modalRow}>
        <div className={styles.modalLabel}>รหัสผู้ใช้:</div>
        <div className={styles.modalValue}>{sourceData.id || 'N/A'}</div>
      </div>
      <div className={styles.modalRow}>
        <div className={styles.modalLabel}>อีเมล:</div>
        <div className={styles.modalValue}>{sourceData.email || 'N/A'}</div>
      </div>
      <div className={styles.modalRow}>
        <div className={styles.modalLabel}>ชื่อผู้ใช้:</div>
        <div className={styles.modalValue}>{sourceData.username || 'N/A'}</div>
      </div>
      <div className={styles.modalRow}>
        <div className={styles.modalLabel}>ประเภทผู้ใช้:</div>
        <div className={styles.modalValue}>
          {sourceData.userType === 'student' ? 'นักเรียน' :
            sourceData.userType === 'teacher' ? 'อาจารย์' :
              sourceData.userType === 'staff' ? 'เจ้าหน้าที่' :
                sourceData.userType || 'N/A'}
        </div>
      </div>
      <div className={styles.modalRow}>
        <div className={styles.modalLabel}>สถานะบัญชี:</div>
        <div className={`${styles.modalValue} ${sourceData.isActive ? 'status active' : 'status inactive'}`}>
          {sourceData.isActive ? 'ใช้งานได้' : 'ถูกปิดใช้งาน'}
        </div>
      </div>
      <div className={styles.modalRow}>
        <div className={styles.modalLabel}>วันที่สมัครสมาชิก:</div>
        <div className={styles.modalValue}>
          {sourceData.regisTime ? formatDate(sourceData.regisTime) : 'N/A'}
        </div>
      </div>
      <div className={styles.modalRow}>
        <div className={styles.modalLabel}>รูปโปรไฟล์:</div>
        <div className={styles.modalValue}>
          {sourceData.imageFile ? sourceData.imageFile : 'ไม่มีรูปโปรไฟล์'}
        </div>
      </div>
    </>
  );

  const renderStudentData = () => (
    <>
      <div className={styles.modalRow}>
        <div className={styles.modalLabel}>รหัสนักเรียน:</div>
        <div className={styles.modalValue}>{sourceData.student?.code || 'N/A'}</div>
      </div>
      <div className={styles.modalRow}>
        <div className={styles.modalLabel}>ชื่อ-นามสกุล:</div>
        <div className={styles.modalValue}>
          {sourceData.student?.firstName && sourceData.student?.lastName
            ? `${sourceData.student.firstName} ${sourceData.student.lastName}`
            : 'N/A'}
        </div>
      </div>
      <div className={styles.modalRow}>
        <div className={styles.modalLabel}>เบอร์โทรศัพท์:</div>
        <div className={styles.modalValue}>{sourceData.student?.phone || 'N/A'}</div>
      </div>
      <div className={styles.modalRow}>
        <div className={styles.modalLabel}>ปีการศึกษา:</div>
        <div className={styles.modalValue}>{sourceData.student?.academicYear || 'N/A'}</div>
      </div>
      <div className={styles.modalRow}>
        <div className={styles.modalLabel}>วันเกิด:</div>
        <div className={styles.modalValue}>
          {sourceData.student?.birthdate ? formatDate(sourceData.student.birthdate) : 'N/A'}
        </div>
      </div>
      <div className={styles.modalRow}>
        <div className={styles.modalLabel}>ศาสนา:</div>
        <div className={styles.modalValue}>{sourceData.student?.religion || 'N/A'}</div>
      </div>
      <div className={styles.modalRow}>
        <div className={styles.modalLabel}>คณะ/สาขา:</div>
        <div className={styles.modalValue}>
          {sourceData.department?.faculty?.name ?
            `${sourceData.department.faculty.name} / ${sourceData.department?.name || 'N/A'}`
            : 'N/A'}
        </div>
      </div>
      <div className={styles.modalRow}>
        <div className={styles.modalLabel}>อาจารย์ที่ปรึกษา:</div>
        <div className={styles.modalValue}>{sourceData.student?.advisor || 'N/A'}</div>
      </div>
      <div className={styles.modalRow}>
        <div className={styles.modalLabel}>สถานะ:</div>
        <div className={`${styles.modalValue} ${sourceData.student?.isGraduated ? 'status inactive' : 'status active'}`}>
          {sourceData.student?.isGraduated ? 'จบการศึกษาแล้ว' : 'กำลังศึกษา'}
        </div>
      </div>
      <div className={styles.modalRow}>
        <div className={styles.modalLabel}>อีเมล:</div>
        <div className={styles.modalValue}>{sourceData.email || 'N/A'}</div>
      </div>
    </>
  );

  const renderTeacherData = () => (
    <>
      <div className={styles.modalRow}>
        <div className={styles.modalLabel}>รหัสอาจารย์:</div>
        <div className={styles.modalValue}>{sourceData.teacher?.code || 'N/A'}</div>
      </div>
      <div className={styles.modalRow}>
        <div className={styles.modalLabel}>ชื่อ-นามสกุล:</div>
        <div className={styles.modalValue}>
          {sourceData.teacher?.firstName && sourceData.teacher?.lastName
            ? `${sourceData.teacher.firstName} ${sourceData.teacher.lastName}`
            : 'N/A'}
        </div>
      </div>
      <div className={styles.modalRow}>
        <div className={styles.modalLabel}>เบอร์โทรศัพท์:</div>
        <div className={styles.modalValue}>{sourceData.teacher?.phone || 'N/A'}</div>
      </div>
      <div className={styles.modalRow}>
        <div className={styles.modalLabel}>วันเกิด:</div>
        <div className={styles.modalValue}>
          {sourceData.teacher?.birthdate ? formatDate(sourceData.teacher.birthdate) : 'N/A'}
        </div>
      </div>
      <div className={styles.modalRow}>
        <div className={styles.modalLabel}>ศาสนา:</div>
        <div className={styles.modalValue}>{sourceData.teacher?.religion || 'N/A'}</div>
      </div>
      <div className={styles.modalRow}>
        <div className={styles.modalLabel}>คณะ/สาขา:</div>
        <div className={styles.modalValue}>
          {sourceData.department?.faculty?.name ?
            `${sourceData.department.faculty.name} / ${sourceData.department?.name || 'N/A'}`
            : 'N/A'}
        </div>
      </div>
      <div className={styles.modalRow}>
        <div className={styles.modalLabel}>ตำแหน่ง:</div>
        <div className={styles.modalValue}>
          {sourceData.teacher?.isDean ? 'คณบดี' : 'อาจารย์ทั่วไป'}
        </div>
      </div>
      <div className={styles.modalRow}>
        <div className={styles.modalLabel}>สถานะ:</div>
        <div className={`${styles.modalValue} ${sourceData.teacher?.isResigned ? 'status inactive' : 'status active'}`}>
          {sourceData.teacher?.isResigned ? 'ลาออกแล้ว' : 'ปฏิบัติงาน'}
        </div>
      </div>
      <div className={styles.modalRow}>
        <div className={styles.modalLabel}>อีเมล:</div>
        <div className={styles.modalValue}>{sourceData.email || 'N/A'}</div>
      </div>
    </>
  );

  const renderStaffData = () => (
    <>
      <div className={styles.modalRow}>
        <div className={styles.modalLabel}>รหัสเจ้าหน้าที่:</div>
        <div className={styles.modalValue}>{sourceData.staff?.code || 'N/A'}</div>
      </div>
      <div className={styles.modalRow}>
        <div className={styles.modalLabel}>ชื่อ-นามสกุล:</div>
        <div className={styles.modalValue}>
          {sourceData.staff?.firstName && sourceData.staff?.lastName
            ? `${sourceData.staff.firstName} ${sourceData.staff.lastName}`
            : 'N/A'}
        </div>
      </div>
      <div className={styles.modalRow}>
        <div className={styles.modalLabel}>เบอร์โทรศัพท์:</div>
        <div className={styles.modalValue}>{sourceData.staff?.phone || 'N/A'}</div>
      </div>
      <div className={styles.modalRow}>
        <div className={styles.modalLabel}>วันที่เริ่มงาน:</div>
        <div className={styles.modalValue}>
          {sourceData.staff?.regisTime ? formatDate(sourceData.staff.regisTime) : 'N/A'}
        </div>
      </div>
      <div className={styles.modalRow}>
        <div className={styles.modalLabel}>สถานะ:</div>
        <div className={`${styles.modalValue} ${sourceData.staff?.isResigned ? 'status inactive' : 'status active'}`}>
          {sourceData.staff?.isResigned ? 'ลาออกแล้ว' : 'ปฏิบัติงาน'}
        </div>
      </div>
      <div className={styles.modalRow}>
        <div className={styles.modalLabel}>อีเมล:</div>
        <div className={styles.modalValue}>{sourceData.email || 'N/A'}</div>
      </div>
      <div className={styles.modalRow}>
        <div className={styles.modalLabel}>สถานะบัญชี:</div>
        <div className={`${styles.modalValue} ${sourceData.isActive ? 'status active' : 'status inactive'}`}>
          {sourceData.isActive ? 'ใช้งานได้' : 'ถูกปิดใช้งาน'}
        </div>
      </div>
    </>
  );

  const renderGenericData = () => (
    <div className={styles.modalRow}>
      <div className={styles.modalLabel}>ข้อมูลทั่วไป:</div>
      <div className={styles.modalValue}>
        <pre className={styles.jsonData}>
          {JSON.stringify(sourceData, null, 2)}
        </pre>
      </div>
    </div>
  );

  return (
    <div className={styles.modalOverlay} onClick={handleBackdropClick}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button
          className={styles.modalClose}
          onClick={onClose}
          aria-label="ปิด modal"
        >
          <X size={20} />
        </button>

        <h2 className={styles.modalHeading}>
          รายละเอียดการแก้ไขบัญชี ID: {dataEdit.DataEdit_ID || 'N/A'}
        </h2>

        <div className={styles.modalBody}>
          {/* ข้อมูลการแก้ไข */}
          <div className={styles.modalSection}>
            <h3 className={styles.sectionTitle}>
              <Database size={16} />
              ข้อมูลการแก้ไข
            </h3>

            <div className={styles.modalRow}>
              <div className={styles.modalLabel}>รหัสการแก้ไข:</div>
              <div className={styles.modalValue}>{dataEdit.DataEdit_ID || 'N/A'}</div>
            </div>

            <div className={styles.modalRow}>
              <div className={styles.modalLabel}>รหัสข้อมูลที่แก้ไข:</div>
              <div className={styles.modalValue}>{dataEdit.DataEdit_ThisId || 'N/A'}</div>
            </div>

            <div className={styles.modalRow}>
              <div className={styles.modalLabel}>ตารางที่มา:</div>
              <div className={styles.modalValue}>{formatSourceTable(dataEdit.DataEdit_SourceTable)}</div>
            </div>

            <div className={styles.modalRow}>
              <div className={styles.modalLabel}>ประเภทการแก้ไข:</div>
              <div className={styles.modalValue}>{formatEditType(dataEdit.DataEditType_Name)}</div>
            </div>

            <div className={styles.modalRow}>
              <div className={styles.modalLabel}>รายละเอียดการแก้ไข:</div>
              <div className={styles.modalValue}>
                {dataEdit.DataEdit_Name || 'ไม่มีรายละเอียด'}
              </div>
            </div>
          </div>

          {/* ข้อมูลเจ้าหน้าที่ */}
          <div className={styles.modalSection}>
            <h3 className={styles.sectionTitle}>
              <User size={16} />
              ข้อมูลเจ้าหน้าที่
            </h3>

            <div className={styles.modalRow}>
              <div className={styles.modalLabel}>รหัสเจ้าหน้าที่:</div>
              <div className={styles.modalValue}>{dataEdit.Staff_Code || 'N/A'}</div>
            </div>

            <div className={styles.modalRow}>
              <div className={styles.modalLabel}>ชื่อ-นามสกุลเจ้าหน้าที่:</div>
              <div className={styles.modalValue}>
                {dataEdit.Staff_FirstName && dataEdit.Staff_LastName
                  ? `${dataEdit.Staff_FirstName} ${dataEdit.Staff_LastName}`
                  : 'N/A'}
              </div>
            </div>

            <div className={styles.modalRow}>
              <div className={styles.modalLabel}>อีเมล:</div>
              <div className={styles.modalValue}>{dataEdit.Users_Email || 'N/A'}</div>
            </div>

            <div className={styles.modalRow}>
              <div className={styles.modalLabel}>ประเภทผู้ใช้:</div>
              <div className={styles.modalValue}>{dataEdit.Users_Type || 'N/A'}</div>
            </div>
          </div>

          {/* ข้อมูลในตารางต้นฉบับ */}
          {dataEdit.DataEdit_SourceTable && dataEdit.DataEdit_ThisId && (
            <div className={styles.modalSection}>
              {renderSourceTableData()}
            </div>
          )}

          {/* ข้อมูลเทคนิค */}
          <div className={styles.modalSection}>
            <h3 className={styles.sectionTitle}>
              <Monitor size={16} />
              ข้อมูลเทคนิค
            </h3>

            <div className={styles.modalRow}>
              <div className={styles.modalLabel}>IP Address:</div>
              <div className={styles.modalValue}>{dataEdit.DataEdit_IP_Address || 'N/A'}</div>
            </div>

            <div className={styles.modalRow}>
              <div className={styles.modalLabel}>User Agent:</div>
              <div className={styles.modalValue} title={dataEdit.DataEdit_UserAgent}>
                {truncateUserAgent(dataEdit.DataEdit_UserAgent)}
              </div>
            </div>

            <div className={styles.modalRow}>
              <div className={styles.modalLabel}>วันที่ / เวลา:</div>
              <div className={styles.modalValue}>
                <Calendar size={14} style={{ marginRight: '6px', display: 'inline' }} />
                {formatDate(dataEdit.DataEdit_RegisTime)}
              </div>
            </div>
          </div>

          {/* ข้อมูลเพิ่มเติม */}
          {(dataEdit.DataEditType_ID || dataEdit.Staff_ID) && (
            <div className={styles.modalSection}>
              <h3 className={styles.sectionTitle}>
                <Info size={16} />
                ข้อมูลเพิ่มเติม
              </h3>

              {dataEdit.DataEditType_ID && (
                <div className={styles.modalRow}>
                  <div className={styles.modalLabel}>ID ประเภทการแก้ไข:</div>
                  <div className={styles.modalValue}>{dataEdit.DataEditType_ID}</div>
                </div>
              )}

              {dataEdit.Staff_ID && (
                <div className={styles.modalRow}>
                  <div className={styles.modalLabel}>ID เจ้าหน้าที่:</div>
                  <div className={styles.modalValue}>{dataEdit.Staff_ID}</div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button
            className={styles.closeButton}
            onClick={onClose}
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}

export default DataEditModal;