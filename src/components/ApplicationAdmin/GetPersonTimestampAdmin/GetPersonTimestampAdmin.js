import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../NavigationBar/NavigationBar';
import styles from './GetPersonTimestampAdmin.module.css';
import { FiBell, FiSearch, FiInfo, FiArrowRight } from 'react-icons/fi';
import CustomModal from '../../../services/CustomModal/CustomModal';

function GetPersonTimestamp() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchIpAdress, setSearchIpAdress] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const navigate = useNavigate();
  const notifications = ["มีผู้ใช้งานเข้าร่วมกิจกรรม"];

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isIPv4 = (ip) => {
    const ipv4Regex = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
    return ipv4Regex.test(ip);
  };

  const isIPv6 = (ip) => {
    const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(::1)|(([0-9a-fA-F]{1,4}:){1,7}:)|(([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4})|(([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2})|(([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3})|(([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4})|(([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5})|([0-9a-fA-F]{1,4}:)((:[0-9a-fA-F]{1,4}){1,6})|(::)|(::ffff:(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))$/;
    return ipv6Regex.test(ip);
  };

  const isValidIP = (ip) => {
    const ips = ip.split(/\s+/);
    return ips.every(singleIP => isIPv4(singleIP) || isIPv6(singleIP));
  };

  const handleSearch = (type) => {
    const params = new URLSearchParams();

    if (type === "email") {
      const email = searchEmail.trim();
      if (!email) {
        setModalMessage("กรุณากรอก Email ก่อนค้นหา");
        setModalOpen(true);
        return;
      } else if (!isValidEmail(email)) {
        setModalMessage("รูปแบบ Email ไม่ถูกต้อง");
        setModalOpen(true);
        return;
      }
      params.append("email", email);
    } else if (type === "ip") {
      const ip = searchIpAdress.trim();
      if (!ip) {
        setModalMessage("กรุณากรอก IP Address ก่อนค้นหา");
        setModalOpen(true);
        return;
      } else if (!isValidIP(ip)) {
        setModalMessage("รูปแบบ IP Address ไม่ถูกต้อง (รองรับ IPv4, IPv6, หลาย IP คั่นด้วย space)");
        setModalOpen(true);
        return;
      }
      params.append("ip", ip);
    }

    if ([...params].length > 0) {
      navigate({
        pathname: "/application/get-timestamp",
        search: params.toString()
      });
    }
  };

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
          <h1 className={styles.heading}>ประวัติการใช้งานรายบุคคล</h1>
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
                    <div key={i} className={styles.notifyItem}>{n}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center Card */}
        <div className={styles.centerCard}>
          {/* Tip Box */}
          <div className={styles.tipBox}>
            <FiInfo size={20} className={styles.tipIcon} />
            <div className={styles.tipContent}>
              <div className={styles.tipItem}>
                <FiArrowRight size={16} /> คุณสามารถค้นหาผู้ใช้งานได้สองวิธี
              </div>
              <div className={styles.tipItem}>
                <FiArrowRight size={16} /> ใช้แต่ละช่อง <strong>Search</strong> ให้ตรงกับข้อมูลที่ต้องการ
              </div>
              <div className={styles.tipItem}>
                <FiArrowRight size={16} /> กด <strong>Enter</strong> หรือปุ่ม <strong>ค้นหา</strong>
              </div>
              <div className={styles.tipItem}>
                <FiArrowRight size={16} /> ข้อมูลไม่ตรงกัน ระบบจะแสดงผลเป็นว่างหรือแนะนำข้อมูลใกล้เคียง
              </div>
            </div>
          </div>

          {/* Search Boxes */}
          <div className={styles.searchCard}>
            <label className={styles.searchLabel}>ค้นหาด้วยอีเมลแอดเดรส (Email Address)</label>
            <div className={styles.searchInner}>
              <FiSearch size={20} color="#6b7280" />
              <input
                type="text"
                placeholder="กรอกอีเมลแอดเดรส..."
                className={styles.searchInput}
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch("email")}
              />
              <button
                className={styles.searchButton}
                onClick={() => handleSearch("email")}
              >
                ค้นหา
              </button>
            </div>
          </div>

          <div className={styles.searchCard}>
            <label className={styles.searchLabel}>ค้นหาด้วยไอพีแอดเดรส (IP Address)</label>
            <div className={styles.searchInner}>
              <FiSearch size={20} color="#6b7280" />
              <input
                type="text"
                placeholder="กรอกไอพีแอดเดรส..."
                className={styles.searchInput}
                value={searchIpAdress}
                onChange={(e) => setSearchIpAdress(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch("ip")}
              />
              <button
                className={styles.searchButton}
                onClick={() => handleSearch("ip")}
              >
                ค้นหา
              </button>
            </div>
          </div>
        </div>

        {/* Custom Modal */}
        <CustomModal
          isOpen={modalOpen}
          message={modalMessage}
          onClose={() => setModalOpen(false)}
        />
      </main>
    </div>
  );
}

export default GetPersonTimestamp;
