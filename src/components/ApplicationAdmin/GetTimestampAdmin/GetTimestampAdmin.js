import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Navbar from '../../NavigationBar/NavigationBar';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './GetTimestampAdmin.module.css';
import { Calendar, Upload, Eye, X, AlertCircle, Loader, ArrowLeft, Activity, Users } from 'lucide-react';
import { utils, writeFileXLSX } from 'xlsx';
import DatePicker, { registerLocale } from 'react-datepicker';
import { FiBell } from 'react-icons/fi';
import th from 'date-fns/locale/th';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import { decryptValue } from '../../../utils/crypto';

registerLocale('th', th);

const getApiUrl = (endpoint) => {
  return `${process.env.REACT_APP_SERVER_PROTOCOL}${process.env.REACT_APP_SERVER_BASE_URL}${process.env.REACT_APP_SERVER_PORT}${endpoint}`;
};

const formatDate = (date) => {
  return new Date(date).toLocaleString('th-TH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

const formatBuddhistDate = (date) => {
  const d = new Date(date);
  const buddhistYear = d.getFullYear() + 543;
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${buddhistYear}`;
};

const sanitizeUserAgent = (userAgent) => {
  if (!userAgent) return 'N/A';
  return userAgent.length > 50 ? userAgent.substring(0, 50) + '...' : userAgent;
};

const sanitizeIP = (ip) => {
  if (!ip) return 'N/A';
  const parts = ip.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.xxx.xxx`;
  }
  return ip;
};

const formatEventType = (eventType) => {
  if (!eventType) return 'Unknown';
  return eventType
    .replace(/^timestamp_/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
};

const getUserTypeDisplay = (userType) => {
  switch (userType) {
    case 'student': return 'นักเรียน/นักศึกษา';
    case 'teacher': return 'ครู/อาจารย์';
    case 'staff': return 'เจ้าหน้าที่';
    default: return 'ไม่ระบุ';
  }
};

function GetTimestamp() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifyOpen, setNotifyOpen] = useState(false);

  const [userTypeFilter, setUserTypeFilter] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState("");
  const [dateFilter, setDateFilter] = useState(null);

  const [timestamps, setTimestamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTimestamp, setSelectedTimestamp] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [searchCriteria, setSearchCriteria] = useState(null);
  const [isPersonSearch, setIsPersonSearch] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const rowsPerPage = 10;

  const notifications = ["มีผู้ใช้งานเข้าร่วมกิจกรรม"];

  // สถิติสำหรับแสดงใน summary
  const timestampStats = useMemo(() => {
    if (!Array.isArray(timestamps)) return {};

    const stats = {
      total: timestamps.length,
      uniqueUsers: new Set(timestamps.map(t => t.Users_Email).filter(Boolean)).size,
      uniqueIPs: new Set(timestamps.map(t => t.Timestamp_IP_Address).filter(Boolean)).size,
      eventTypes: new Set(timestamps.map(t => t.TimestampType_Name).filter(Boolean)).size,
      userTypes: {}
    };

    // นับตามประเภทผู้ใช้
    timestamps.forEach(t => {
      if (t.Users_Type) {
        stats.userTypes[t.Users_Type] = (stats.userTypes[t.Users_Type] || 0) + 1;
      }
    });

    return stats;
  }, [timestamps]);

  const loadSearchCriteria = useCallback(() => {
    try {
      const encryptedCriteria = sessionStorage.getItem('current_search_criteria');
      if (encryptedCriteria) {
        const decrypted = decryptValue(encryptedCriteria);
        const criteria = JSON.parse(decrypted);
        setSearchCriteria(criteria);
        setIsPersonSearch(true);

        if (criteria.type === 'email') {
          setSearchQuery(criteria.value);
        } else if (criteria.type === 'ip') {
          setSearchQuery(criteria.value);
        }

        sessionStorage.removeItem('current_search_criteria');
        return;
      }

      const params = new URLSearchParams(location.search);
      const email = params.get("email");
      const ip = params.get("ip");

      if (email || ip) {
        const criteria = {
          type: email ? 'email' : 'ip',
          value: email || ip,
          timestamp: Date.now()
        };
        setSearchCriteria(criteria);
        setIsPersonSearch(true);
        setSearchQuery(email || ip);
      }
    } catch (error) {
      console.warn('Failed to load search criteria:', error);
    }
  }, [location.search]);

  const fetchTimestamps = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let apiUrl = getApiUrl(process.env.REACT_APP_API_TIMESTAMP_WEBSITE_GET);
      if (searchCriteria && searchCriteria.type === 'ip') {
        const params = new URLSearchParams();
        params.append('ip', searchCriteria.value);
        apiUrl = getApiUrl(`${process.env.REACT_APP_API_TIMESTAMP_SEARCH}${params.toString()}`);
      }

      const res = await axios.get(apiUrl, {
        withCredentials: true,
        timeout: 10000,
        headers: {
          'Cache-Control': 'no-cache'
        }
      });

      if (res.data.status) {
        setTimestamps(Array.isArray(res.data.data) ? res.data.data : []);
      } else {
        setError('ไม่สามารถโหลดข้อมูลได้: ' + (res.data.message || 'Unknown error'));
        setTimestamps([]);
      }
    } catch (err) {
      console.error('Fetch timestamps error:', err);

      let errorMessage = 'เกิดข้อผิดพลาดในการโหลดข้อมูล';
      if (err.code === 'ECONNABORTED') {
        errorMessage = 'การเชื่อมต่อหมดเวลา กรุณาลองใหม่อีกครั้ง';
      } else if (err.response?.status === 401) {
        errorMessage = 'กรุณาเข้าสู่ระบบใหม่';
      } else if (err.response?.status === 403) {
        errorMessage = 'ไม่มีสิทธิ์เข้าถึงข้อมูลนี้';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      setError(errorMessage);
      setTimestamps([]);
    } finally {
      setLoading(false);
    }
  }, [searchCriteria]);

  useEffect(() => {
    loadSearchCriteria();
  }, [loadSearchCriteria]);

  useEffect(() => {
    fetchTimestamps();
  }, [fetchTimestamps]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(`.${styles.notifyWrapper}`)) {
        setNotifyOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (modalOpen && e.key === 'Escape') {
        setModalOpen(false);
      }
    };

    if (modalOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [modalOpen]);

  const filteredTimestamps = useMemo(() => {
    if (!Array.isArray(timestamps)) return [];

    return timestamps.filter(ts => {
      if (!ts) return false;

      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || [
        ts.Timestamp_Name,
        ts.Users_Email,
        ts.Timestamp_IP_Address,
        ts.Users_Type,
        ts.TimestampType_Name
      ].some(field =>
        field && field.toString().toLowerCase().includes(query)
      );

      const matchesUserType = !userTypeFilter || ts.Users_Type === userTypeFilter;
      const matchesEventType = !eventTypeFilter || ts.TimestampType_Name === eventTypeFilter;

      let matchesDate = true;
      if (dateFilter && ts.Timestamp_RegisTime) {
        const tsDate = new Date(ts.Timestamp_RegisTime);
        const filterDate = new Date(dateFilter);
        matchesDate = tsDate.toDateString() === filterDate.toDateString();
      }

      return matchesSearch && matchesUserType && matchesEventType && matchesDate;
    });
  }, [timestamps, searchQuery, userTypeFilter, eventTypeFilter, dateFilter]);

  const totalPages = Math.ceil(filteredTimestamps.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredTimestamps.slice(indexOfFirstRow, indexOfLastRow);

  const exportToExcel = useCallback(() => {
    try {
      if (!filteredTimestamps || filteredTimestamps.length === 0) {
        alert("ไม่มีข้อมูลสำหรับการ export");
        return;
      }

      const data = filteredTimestamps.map((ts, index) => ({
        "ลำดับ": index + 1,
        "ID": ts.Timestamp_ID || 'N/A',
        "อีเมล": ts.Users_Email || 'N/A',
        "ประเภทผู้ใช้": getUserTypeDisplay(ts.Users_Type),
        "ประเภทเหตุการณ์": formatEventType(ts.TimestampType_Name),
        "IP Address": sanitizeIP(ts.Timestamp_IP_Address),
        "User Agent": sanitizeUserAgent(ts.Timestamp_UserAgent),
        "วันที่/เวลา": ts.Timestamp_RegisTime ? formatDate(ts.Timestamp_RegisTime) : 'N/A',
        "ชื่อเหตุการณ์": ts.Timestamp_Name || 'N/A'
      }));

      const ws = utils.json_to_sheet(data);
      const colWidths = [
        { wch: 8 },
        { wch: 10 },
        { wch: 25 },
        { wch: 15 },
        { wch: 20 },
        { wch: 15 },
        { wch: 30 },
        { wch: 20 },
        { wch: 40 }
      ];
      ws['!cols'] = colWidths;

      const wb = { SheetNames: [], Sheets: {} };
      wb.SheetNames.push("Timestamps");
      wb.Sheets["Timestamps"] = ws;

      const now = new Date();
      const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;

      let filename = `Timestamps_${timestamp}.xlsx`;
      if (searchCriteria) {
        filename = `Timestamps_${searchCriteria.type}_${searchCriteria.value.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.xlsx`;
      }

      writeFileXLSX(wb, filename);
    } catch (err) {
      console.error('Export error:', err);
      alert('เกิดข้อผิดพลาดในการ export ไฟล์');
    }
  }, [filteredTimestamps, searchCriteria]);

  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setUserTypeFilter("");
    setEventTypeFilter("");
    setDateFilter(null);
    setCurrentPage(1);
    setSearchCriteria(null);
    setIsPersonSearch(false);
    navigate({
      pathname: location.pathname,
      search: ""
    });
  }, [navigate, location.pathname]);

  const goBackToPersonSearch = useCallback(() => {
    navigate('/application/get-person-timestamp');
  }, [navigate]);

  if (loading) {
    return (
      <div className={styles.container}>
        <Navbar
          isMobile={isMobile}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <main className={`${styles.mainContent} ${isMobile ? styles.mobileContent : ""} ${sidebarOpen && !isMobile ? styles.contentShift : ""}`}>
          <div className={styles.loadingContainer}>
            <Loader className={styles.spinner} />
            <p>กำลังโหลดข้อมูล...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <Navbar
          isMobile={isMobile}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <main className={`${styles.mainContent} ${isMobile ? styles.mobileContent : ""} ${sidebarOpen && !isMobile ? styles.contentShift : ""}`}>
          <div className={styles.errorContainer}>
            <AlertCircle className={styles.errorIcon} />
            <h2>เกิดข้อผิดพลาด</h2>
            <p>{error}</p>
            <div className={styles.errorActions}>
              <button className={styles.retryButton} onClick={fetchTimestamps}>
                ลองใหม่อีกครั้ง
              </button>
              {isPersonSearch && (
                <button className={styles.backButton} onClick={goBackToPersonSearch}>
                  <ArrowLeft size={16} /> กลับไปค้นหาใหม่
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Navbar
        isMobile={isMobile}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <main
        className={`${styles.mainContent} 
          ${isMobile ? styles.mobileContent : ""} 
          ${sidebarOpen && !isMobile ? styles.contentShift : ""}`}
      >
        {/* Header */}
        <div className={styles.headerBar}>
          <div className={styles.headerLeft}>
            {isPersonSearch && (
              <button
                className={styles.backButton}
                onClick={goBackToPersonSearch}
                aria-label="กลับไปหน้าค้นหา"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <div>
              <h1 className={styles.heading}>
                {isPersonSearch ? 'ผลการค้นหาประวัติการใช้งาน' : 'ประวัติการใช้งาน'}
              </h1>
              <div className={styles.summaryStats}>
                <span className={styles.statItem}>
                  <Activity className={styles.iconSmall} />
                  ทั้งหมด: {timestampStats.total} รายการ
                </span>
                <span className={styles.statItem}>
                  <Users className={styles.iconSmall} />
                  ผู้ใช้: {timestampStats.uniqueUsers} คน
                </span>
                <span className={styles.statItem}>
                  <Calendar className={styles.iconSmall} />
                  เหตุการณ์: {timestampStats.eventTypes} ประเภท
                </span>
              </div>
              {searchCriteria && (
                <p className={styles.searchInfo}>
                  ค้นหาด้วย {searchCriteria.type === 'email' ? 'อีเมล' : 'IP Address'}:
                  <span className={styles.searchValue}>{searchCriteria.value}</span>
                </p>
              )}
            </div>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.notifyWrapper}>
              <button
                className={styles.notifyButton}
                onClick={() => setNotifyOpen(!notifyOpen)}
              >
                <FiBell size={24} />
                {notifications.length > 0 && (
                  <span className={styles.badge}>
                    {notifications.length}
                  </span>
                )}
              </button>

              {notifyOpen && (
                <div className={styles.notifyDropdown}>
                  {notifications.map((n, i) => (
                    <div key={i} className={styles.notifyItem}>
                      {n}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filter & Table */}
        <div className={styles.timestampSection}>
          <div className={styles.timestampFilter}>
            <button
              className={styles.exportButton}
              onClick={exportToExcel}
              disabled={filteredTimestamps.length === 0}
              aria-label="ส่งออกข้อมูลเป็น Excel"
            >
              <Upload className={styles.icon} /> Export Excel
            </button>

            <input
              type="text"
              placeholder="ค้นหา อีเมล, IP, เหตุการณ์..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className={styles.timestampSearch}
              aria-label="ค้นหาข้อมูล"
            />

            <div className={styles.datePickerWrapper}>
              <DatePicker
                selected={dateFilter}
                onChange={(date) => {
                  setDateFilter(date);
                  setCurrentPage(1);
                }}
                dateFormat="dd/MM/yyyy"
                placeholderText="เลือกวัน"
                className={styles.timeButton}
                locale="th"
                customInput={
                  <button className={styles.timeButton} type="button">
                    <Calendar className={styles.icon} style={{ marginRight: '5px' }} />
                    {dateFilter ? formatBuddhistDate(dateFilter) : 'เลือกวัน'}
                  </button>
                }
              />
            </div>

            <select
              className={styles.timestampSelect}
              value={userTypeFilter}
              onChange={(e) => {
                setUserTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="กรองตามประเภทผู้ใช้"
            >
              <option value="">ประเภทผู้ใช้งาน</option>
              <option value="student">นักเรียน/นักศึกษา</option>
              <option value="teacher">ครู/อาจารย์</option>
              <option value="staff">เจ้าหน้าที่</option>
            </select>

            <select
              className={styles.timestampSelect}
              value={eventTypeFilter}
              onChange={(e) => {
                setEventTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="กรองตามประเภทเหตุการณ์"
            >
              <option value="">ประเภทเหตุการณ์</option>
              {Array.from(new Set(timestamps.map(ts => ts.TimestampType_Name).filter(Boolean))).map((eventName, idx) => (
                <option key={idx} value={eventName}>
                  {formatEventType(eventName)}
                </option>
              ))}
            </select>

            {(searchQuery || userTypeFilter || eventTypeFilter || dateFilter) && (
              <button
                className={styles.resetButton}
                onClick={resetFilters}
                aria-label="ล้างฟิลเตอร์ทั้งหมด"
              >
                <X className={styles.iconSmall} style={{ marginRight: '5px' }} />
                ล้างฟิลเตอร์
              </button>
            )}
          </div>

          {/* Results Summary */}
          <div className={styles.resultsSummary}>
            <span>พบ {filteredTimestamps.length} รายการ</span>
            {searchCriteria && (
              <span className={styles.searchSummary}>
                จากการค้นหา {searchCriteria.type === 'email' ? 'อีเมล' : 'IP'}: {searchCriteria.value}
              </span>
            )}
          </div>

          <div className={styles.timestampTableWrapper}>
            <table className={styles.timestampTable}>
              <thead>
                <tr>
                  <th>รหัส</th>
                  <th>อีเมล</th>
                  <th>ประเภทผู้ใช้</th>
                  <th>เหตุการณ์</th>
                  <th>IP Address</th>
                  <th>วันที่ / เวลา</th>
                  <th>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.map(ts => (
                  <tr key={ts.Timestamp_ID}>
                    <td>{ts.Timestamp_ID}</td>
                    <td title={ts.Users_Email}>{ts.Users_Email}</td>
                    <td>
                      <span className={`${styles.badgeType} ${styles[ts.Users_Type]}`}>
                        {getUserTypeDisplay(ts.Users_Type)}
                      </span>
                    </td>
                    <td>
                      <span className={styles.eventTag} title={ts.TimestampType_Name}>
                        {formatEventType(ts.TimestampType_Name)}
                      </span>
                    </td>
                    <td title={ts.Timestamp_IP_Address}>
                      {sanitizeIP(ts.Timestamp_IP_Address)}
                    </td>
                    <td>{formatDate(ts.Timestamp_RegisTime)}</td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={styles.viewBtn}
                          onClick={() => {
                            setSelectedTimestamp(ts);
                            setModalOpen(true);
                          }}
                          aria-label={`ดูรายละเอียด timestamp ${ts.Timestamp_ID}`}
                        >
                          <Eye className={styles.iconSmall} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {currentRows.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                      {filteredTimestamps.length === 0 && timestamps.length > 0
                        ? "ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา"
                        : searchCriteria
                          ? `ไม่พบประวัติการใช้งานสำหรับ ${searchCriteria.type === 'email' ? 'อีเมล' : 'IP'}: ${searchCriteria.value}`
                          : "ไม่มีข้อมูล"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                <button
                  key={number}
                  className={currentPage === number ? styles.activePage : ""}
                  onClick={() => setCurrentPage(number)}
                >
                  {number}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Modal */}
        {modalOpen && selectedTimestamp && (
          <div
            className={styles.modalOverlay}
            onClick={() => setModalOpen(false)}
          >
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <button
                className={styles.modalClose}
                onClick={() => setModalOpen(false)}
                aria-label="ปิด modal"
              >
                ✕
              </button>

              <h2 className={styles.modalHeading}>
                รายละเอียด Timestamp ID: {selectedTimestamp.Timestamp_ID}
              </h2>

              <div className={styles.modalBody}>
                <div className={styles.modalRow}>
                  <div className={styles.modalLabel}>ชื่อเหตุการณ์:</div>
                  <div className={styles.modalValue}>{selectedTimestamp.Timestamp_Name || 'N/A'}</div>
                </div>
                <div className={styles.modalRow}>
                  <div className={styles.modalLabel}>อีเมล:</div>
                  <div className={styles.modalValue}>{selectedTimestamp.Users_Email || 'N/A'}</div>
                </div>
                <div className={styles.modalRow}>
                  <div className={styles.modalLabel}>ประเภทผู้ใช้:</div>
                  <div className={styles.modalValue}>{getUserTypeDisplay(selectedTimestamp.Users_Type)}</div>
                </div>
                <div className={styles.modalRow}>
                  <div className={styles.modalLabel}>ประเภทเหตุการณ์:</div>
                  <div className={styles.modalValue}>{formatEventType(selectedTimestamp.TimestampType_Name)}</div>
                </div>
                <div className={styles.modalRow}>
                  <div className={styles.modalLabel}>IP Address:</div>
                  <div className={styles.modalValue}>{selectedTimestamp.Timestamp_IP_Address || 'N/A'}</div>
                </div>
                <div className={styles.modalRow}>
                  <div className={styles.modalLabel}>User Agent:</div>
                  <div className={styles.modalValue} title={selectedTimestamp.Timestamp_UserAgent}>
                    {selectedTimestamp.Timestamp_UserAgent || 'N/A'}
                  </div>
                </div>
                <div className={styles.modalRow}>
                  <div className={styles.modalLabel}>วันที่ / เวลา:</div>
                  <div className={styles.modalValue}>
                    {selectedTimestamp.Timestamp_RegisTime ? formatDate(selectedTimestamp.Timestamp_RegisTime) : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default GetTimestamp;