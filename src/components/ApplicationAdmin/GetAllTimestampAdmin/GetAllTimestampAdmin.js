// GetAllTimestampAdmin.jsx
import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../../NavigationBar/NavigationBar';
import styles from './GetAllTimestampAdmin.module.css';
import { Calendar, Upload, Eye, X } from 'lucide-react';
import { utils, writeFileXLSX } from 'xlsx';
import DatePicker, { registerLocale } from 'react-datepicker';
import { FiBell } from 'react-icons/fi';
import th from 'date-fns/locale/th';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';

registerLocale('th', th);

const getApiUrl = (endpoint) => {
  return `${process.env.REACT_APP_SERVER_PROTOCOL}${process.env.REACT_APP_SERVER_BASE_URL}${process.env.REACT_APP_SERVER_PORT}${endpoint}`;
};

function GetAllTimestamp() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifyOpen, setNotifyOpen] = useState(false);

  const [userTypeFilter, setUserTypeFilter] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState("");
  const [dateFilter, setDateFilter] = useState(null);

  const [timestamps, setTimestamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimestamp, setSelectedTimestamp] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const rowsPerPage = 10;

  const notifications = ["มีผู้ใช้งานเข้าร่วมกิจกรรม"];

  const fetchTimestamps = useCallback(async () => {
    try {
      const res = await axios.get(getApiUrl(process.env.REACT_APP_API_TIMESTAMP_WEBSITE_GET), { withCredentials: true });
      if (res.data.status) {
        setTimestamps(res.data.data);
      } else {
        setTimestamps([]);
      }
    } catch (err) {
      console.error(err);
      setTimestamps([]);
    } finally {
      setLoading(false);
    }
  }, []);

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

  // Filter timestamps
  const filteredTimestamps = timestamps.filter(ts => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      ts.Timestamp_Name.toLowerCase().includes(query) ||
      ts.Users_Email.toLowerCase().includes(query) ||
      ts.Timestamp_IP_Address.toLowerCase().includes(query) ||
      ts.Users_Type.toLowerCase().includes(query) ||
      ts.TimestampType_Name.toLowerCase().includes(query);

    const matchesUserType = userTypeFilter ? ts.Users_Type === userTypeFilter : true;
    const matchesEventType = eventTypeFilter ? ts.TimestampType_Name === eventTypeFilter : true;

    let matchesDate = true;
    if (dateFilter) {
      const tsDate = new Date(ts.Timestamp_RegisTime);
      matchesDate = tsDate.toDateString() === dateFilter.toDateString();
    }

    return matchesSearch && matchesUserType && matchesEventType && matchesDate;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredTimestamps.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredTimestamps.slice(indexOfFirstRow, indexOfLastRow);

  // Excel export
  const exportToExcel = () => {
    if (!filteredTimestamps || filteredTimestamps.length === 0) {
      alert("No data available to export");
      return;
    }

    const data = filteredTimestamps.map(ts => ({
      "ID": ts.Timestamp_ID,
      "Email": ts.Users_Email,
      "User Type": ts.Users_Type === 'student' ? 'Student' :
        ts.Users_Type === 'teacher' ? 'Teacher' : 'Staff',
      "Event Type": ts.TimestampType_Name.replace("timestamp_", "").replace(/_/g, " "),
      "IP Address": ts.Timestamp_IP_Address,
      "User Agent": ts.Timestamp_UserAgent,
      "Date / Time": new Date(ts.Timestamp_RegisTime).toLocaleString(),
      "Event Name": ts.Timestamp_Name
    }));

    const ws = utils.json_to_sheet(data);
    const wb = { SheetNames: [], Sheets: {} };
    wb.SheetNames.push("Timestamps");
    wb.Sheets["Timestamps"] = ws;

    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;
    const filename = `Timestamps_${timestamp}.xlsx`;

    writeFileXLSX(wb, filename);
  };

  // Generate page numbers
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  if (loading) return <div>Loading...</div>;


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
          <h1 className={styles.heading}>ประวัติการใช้งาน</h1>
          <div className={styles.headerRight}>
            <div className={styles.notifyWrapper}>
              <button
                className={styles.notifyButton}
                onClick={() => setNotifyOpen(!notifyOpen)}
              >
                <FiBell size={24} color="currentColor" />
                {notifications.length > 0 && (
                  <span className={styles.badge}>{notifications.length}</span>
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
            <button className={styles.exportButton} onClick={exportToExcel}>
              <Upload className={styles.icon} /> Export Excel
            </button>

            <input
              type="text"
              placeholder="ค้นหา..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className={styles.timestampSearch}
            />

            <div className={styles.datePickerWrapper}>
              <DatePicker
                selected={dateFilter}
                onChange={(date) => { setDateFilter(date); setCurrentPage(1); }}
                dateFormat="dd/MM/yyyy"
                placeholderText="เลือกวัน"
                className={styles.timeButton}
                locale="th"
                customInput={
                  <button className={styles.timeButton}>
                    <Calendar className={styles.icon} style={{ marginRight: '5px' }} />
                    {dateFilter
                      ? `${dateFilter.getDate().toString().padStart(2, '0')}/` +
                      `${(dateFilter.getMonth() + 1).toString().padStart(2, '0')}/` +
                      `${dateFilter.getFullYear() + 543}`
                      : 'เลือกวัน'}
                  </button>
                }
              />
            </div>

            <select
              className={styles.timestampSelect}
              value={userTypeFilter}
              onChange={(e) => { setUserTypeFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="">ประเภทผู้ใช้งาน</option>
              <option value="student">นักเรียน/นักศึกษา</option>
              <option value="teacher">ครู/อาจารย์</option>
              <option value="staff">เจ้าหน้าที่</option>
            </select>

            <select
              className={styles.timestampSelect}
              value={eventTypeFilter}
              onChange={(e) => { setEventTypeFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="">ประเภทเหตุการณ์</option>
              {Array.from(new Set(timestamps.map(ts => ts.TimestampType_Name))).map((eventName, idx) => {
                const formattedName = eventName.replace(/^timestamp_/, '').replace(/_/g, ' ');
                return (
                  <option key={idx} value={eventName}>{formattedName}</option>
                );
              })}
            </select>

            {(searchQuery || userTypeFilter || eventTypeFilter || dateFilter) && (
              <button
                className={styles.resetButton}
                onClick={() => {
                  setSearchQuery("");
                  setUserTypeFilter("");
                  setEventTypeFilter("");
                  setDateFilter(null);
                  setCurrentPage(1);
                }}
              >
                <X className={styles.iconSmall} style={{ marginRight: '5px' }} />
                ล้างฟิลเตอร์
              </button>
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
                    <td>{ts.Users_Email}</td>
                    <td>
                      <span className={`${styles.badgeType} ${styles[ts.Users_Type]}`}>
                        {ts.Users_Type === 'student' ? 'นักเรียน/นักศึกษา' :
                          ts.Users_Type === 'teacher' ? 'ครู/อาจารย์' : 'เจ้าหน้าที่'}
                      </span>
                    </td>
                    <td>
                      <span className={styles.eventTag}>
                        {ts.TimestampType_Name.replace("timestamp_", "").replace(/_/g, " ")}
                      </span>
                    </td>
                    <td>{ts.Timestamp_IP_Address}</td>
                    <td>{new Date(ts.Timestamp_RegisTime).toLocaleString()}</td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={styles.viewBtn}
                          onClick={() => { setSelectedTimestamp(ts); setModalOpen(true); }}
                        >
                          <Eye className={styles.iconSmall} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {currentRows.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center" }}>ไม่พบข้อมูล</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                >
                  Previous
                </button>
                {pageNumbers.map(number => (
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
        </div>

        {/* Modal */}
        {modalOpen && selectedTimestamp && (
          <div className={styles.modalOverlay} onClick={() => setModalOpen(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <button
                className={styles.modalClose}
                onClick={() => setModalOpen(false)}
              >
                ✕
              </button>

              <h2 className={styles.modalHeading}>
                Timestamp ID: {selectedTimestamp.Timestamp_ID}
              </h2>

              <div className={styles.modalBody}>
                <div className={styles.modalRow}>
                  <div className={styles.modalLabel}>ชื่อเหตุการณ์</div>
                  <div className={styles.modalValue}>{selectedTimestamp.Timestamp_Name}</div>
                </div>
                <div className={styles.modalRow}>
                  <div className={styles.modalLabel}>อีเมล</div>
                  <div className={styles.modalValue}>{selectedTimestamp.Users_Email}</div>
                </div>
                <div className={styles.modalRow}>
                  <div className={styles.modalLabel}>ประเภทผู้ใช้</div>
                  <div className={styles.modalValue}>{selectedTimestamp.Users_Type}</div>
                </div>
                <div className={styles.modalRow}>
                  <div className={styles.modalLabel}>ประเภทเหตุการณ์</div>
                  <div className={styles.modalValue}>{selectedTimestamp.TimestampType_Name}</div>
                </div>
                <div className={styles.modalRow}>
                  <div className={styles.modalLabel}>IP Address</div>
                  <div className={styles.modalValue}>{selectedTimestamp.Timestamp_IP_Address}</div>
                </div>
                <div className={styles.modalRow}>
                  <div className={styles.modalLabel}>User Agent</div>
                  <div className={styles.modalValue}>{selectedTimestamp.Timestamp_UserAgent}</div>
                </div>
                <div className={styles.modalRow}>
                  <div className={styles.modalLabel}>วันที่ / เวลา</div>
                  <div className={styles.modalValue}>{new Date(selectedTimestamp.Timestamp_RegisTime).toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default GetAllTimestamp;