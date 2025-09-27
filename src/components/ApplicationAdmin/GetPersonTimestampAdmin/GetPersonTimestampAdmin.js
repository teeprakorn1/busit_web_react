import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../NavigationBar/NavigationBar';
import styles from './GetPersonTimestampAdmin.module.css';
import { FiSearch, FiInfo, FiClock, FiCheck, FiX, FiEye } from 'react-icons/fi';
import { ArrowLeft, Shield } from 'lucide-react';
import CustomModal from '../../../services/CustomModal/CustomModal';
import { encryptValue, decryptValue } from '../../../utils/crypto';
import { useUserPermissions } from './hooks/useUserPermissions';
import axios from 'axios';

const getApiUrl = (endpoint) => {
  return `${process.env.REACT_APP_SERVER_PROTOCOL}${process.env.REACT_APP_SERVER_BASE_URL}${process.env.REACT_APP_SERVER_PORT}${endpoint}`;
};

function GetPersonTimestamp() {
  const navigate = useNavigate();
  const permissions = useUserPermissions();

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchIpAddress, setSearchIpAddress] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const [previewData, setPreviewData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const MAX_RECENT_SEARCHES = 5;
  const RECENT_SEARCHES_KEY = 'timestamp_recent_searches';

  useEffect(() => {
    if (permissions.userType !== null) {
      if (!permissions.isStaff || !permissions.canSearchPersonalTimestamps) {
        navigate('/dashboard');
        return;
      }
    }
  }, [permissions, navigate]);

  const isValidEmail = useCallback((email) => {
    if (!email || typeof email !== 'string') return false;

    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    if (email.length > 254) return false;

    const [localPart, domain] = email.split('@');
    if (!localPart || !domain || localPart.length > 64) return false;

    return emailRegex.test(email);
  }, []);

  const isValidIP = useCallback((ip) => {
    if (!ip || typeof ip !== 'string') return false;

    const trimmedIP = ip.trim();
    const ips = trimmedIP.split(/\s+/);

    return ips.every(singleIP => {
      const ipv4Parts = singleIP.split('.');
      if (ipv4Parts.length === 4) {
        return ipv4Parts.every(part => {
          const num = parseInt(part, 10);
          return !isNaN(num) && num >= 0 && num <= 255 && part === num.toString();
        });
      }

      if (singleIP.includes(':')) {
        const ipv6Regex = /^([0-9a-fA-F]{0,4}:){1,7}[0-9a-fA-F]{0,4}$/;
        const colonCount = (singleIP.match(/:/g) || []).length;
        return colonCount >= 2 && colonCount <= 7 && ipv6Regex.test(singleIP);
      }

      return false;
    });
  }, []);

  const sanitizeInput = useCallback((input) => {
    if (!input) return '';
    return input
      .trim()
      .replace(/[<>"'&]/g, '')
      .substring(0, 255);
  }, []);

  const loadRecentSearches = useCallback(() => {
    if (!permissions.canViewSearchHistory) return;

    try {
      const stored = sessionStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        const decrypted = decryptValue(stored);
        const searches = JSON.parse(decrypted);
        if (Array.isArray(searches)) {
          setRecentSearches(searches.slice(0, MAX_RECENT_SEARCHES));
        }
      }
    } catch (error) {
      console.warn('Failed to load recent searches:', error);
      sessionStorage.removeItem(RECENT_SEARCHES_KEY);
    }
  }, [permissions.canViewSearchHistory]);

  const saveRecentSearches = useCallback((searches) => {
    if (!permissions.canSaveSearchHistory) return;

    try {
      const encrypted = encryptValue(JSON.stringify(searches));
      sessionStorage.setItem(RECENT_SEARCHES_KEY, encrypted);
    } catch (error) {
      console.warn('Failed to save recent searches:', error);
    }
  }, [permissions.canSaveSearchHistory]);

  const addToRecentSearches = useCallback((type, value) => {
    if (!permissions.canSaveSearchHistory) return;

    const newSearch = {
      type,
      value,
      timestamp: Date.now(),
      displayValue: type === 'email' ? value : `IP: ${value}`
    };

    setRecentSearches(prev => {
      const filtered = prev.filter(search =>
        !(search.type === type && search.value === value)
      );
      const updated = [newSearch, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      saveRecentSearches(updated);
      return updated;
    });
  }, [saveRecentSearches, permissions.canSaveSearchHistory]);

  const removeFromRecentSearches = useCallback((index) => {
    if (!permissions.canManageSearchHistory) return;

    setRecentSearches(prev => {
      const updated = prev.filter((_, i) => i !== index);
      saveRecentSearches(updated);
      return updated;
    });
  }, [saveRecentSearches, permissions.canManageSearchHistory]);

  const clearRecentSearches = useCallback(() => {
    if (!permissions.canManageSearchHistory) return;

    setRecentSearches([]);
    sessionStorage.removeItem(RECENT_SEARCHES_KEY);
  }, [permissions.canManageSearchHistory]);

  const handlePreview = useCallback(async (type, value = null) => {
    if (!permissions.canPreviewTimestampData) {
      setModalMessage("คุณไม่มีสิทธิ์ในการดูตัวอย่างข้อมูล");
      setModalOpen(true);
      return;
    }

    if (isLoading) return;

    let searchValue;
    if (value) {
      searchValue = value;
    } else if (type === "email") {
      searchValue = searchEmail;
    } else if (type === "ip") {
      searchValue = searchIpAddress;
    }

    const sanitizedValue = sanitizeInput(searchValue);

    if (!sanitizedValue) {
      setModalMessage(`กรุณากรอก ${type === 'email' ? 'Email' : 'IP Address'} ก่อนดูตัวอย่าง`);
      setModalOpen(true);
      return;
    }

    if (type === "email" && !isValidEmail(sanitizedValue)) {
      setModalMessage("รูปแบบ Email ไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง");
      setModalOpen(true);
      return;
    }

    if (type === "ip" && !isValidIP(sanitizedValue)) {
      setModalMessage("รูปแบบ IP Address ไม่ถูกต้อง");
      setModalOpen(true);
      return;
    }

    if (type === "email" && !permissions.canSearchByEmail) {
      setModalMessage("คุณไม่มีสิทธิ์ในการค้นหาด้วยอีเมล");
      setModalOpen(true);
      return;
    }

    if (type === "ip" && !permissions.canSearchByIP) {
      setModalMessage("คุณไม่มีสิทธิ์ในการค้นหาด้วย IP Address");
      setModalOpen(true);
      return;
    }

    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (type === 'email') {
        params.append('email', sanitizedValue);
      } else {
        params.append('ip', sanitizedValue);
      }
      params.append('limit', '5');

      const response = await axios.get(
        getApiUrl(`${process.env.REACT_APP_API_TIMESTAMP_SEARCH}${params.toString()}`),
        { withCredentials: true, timeout: 10000 }
      );

      if (response.data.status) {
        setPreviewData({
          type,
          value: sanitizedValue,
          data: response.data.data,
          total: response.data.total
        });
        setShowPreview(true);
      } else {
        setModalMessage(`ไม่พบข้อมูลสำหรับ ${type === 'email' ? 'อีเมล' : 'IP'}: ${sanitizedValue}`);
        setModalOpen(true);
      }
    } catch (error) {
      console.error('Preview error:', error);
      setModalMessage("เกิดข้อผิดพลาดในการดูตัวอย่าง กรุณาลองใหม่อีกครั้ง");
      setModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  }, [
    isLoading,
    searchEmail,
    searchIpAddress,
    sanitizeInput,
    isValidEmail,
    isValidIP,
    permissions.canPreviewTimestampData,
    permissions.canSearchByEmail,
    permissions.canSearchByIP
  ]);

  const handleSearch = useCallback(async (type, value = null) => {
    if (!permissions.canSearchPersonalTimestamps) {
      setModalMessage("คุณไม่มีสิทธิ์ในการค้นหาข้อมูล");
      setModalOpen(true);
      return;
    }

    if (isLoading) return;

    let searchValue;
    if (value) {
      searchValue = value;
    } else if (type === "email") {
      searchValue = searchEmail;
    } else if (type === "ip") {
      searchValue = searchIpAddress;
    }

    const sanitizedValue = sanitizeInput(searchValue);

    if (!sanitizedValue) {
      setModalMessage(`กรุณากรอก ${type === 'email' ? 'Email' : 'IP Address'} ก่อนค้นหา`);
      setModalOpen(true);
      return;
    }

    if (type === "email" && !isValidEmail(sanitizedValue)) {
      setModalMessage("รูปแบบ Email ไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง");
      setModalOpen(true);
      return;
    }

    if (type === "ip" && !isValidIP(sanitizedValue)) {
      setModalMessage("รูปแบบ IP Address ไม่ถูกต้อง (รองรับ IPv4, IPv6, และหลาย IP คั่นด้วยช่องว่าง)");
      setModalOpen(true);
      return;
    }

    if (type === "email" && !permissions.canSearchByEmail) {
      setModalMessage("คุณไม่มีสิทธิ์ในการค้นหาด้วยอีเมล");
      setModalOpen(true);
      return;
    }

    if (type === "ip" && !permissions.canSearchByIP) {
      setModalMessage("คุณไม่มีสิทธิ์ในการค้นหาด้วย IP Address");
      setModalOpen(true);
      return;
    }

    try {
      setIsLoading(true);
      const searchCriteria = {
        type,
        value: sanitizedValue,
        timestamp: Date.now(),
        searchId: Math.random().toString(36).substr(2, 9)
      };

      const encryptedCriteria = encryptValue(JSON.stringify(searchCriteria));
      sessionStorage.setItem('current_search_criteria', encryptedCriteria);

      addToRecentSearches(type, sanitizedValue);
      navigate("/application/get-timestamp");

    } catch (error) {
      console.error('Search error:', error);
      setModalMessage("เกิดข้อผิดพลาดในการค้นหา กรุณาลองใหม่อีกครั้ง");
      setModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  }, [
    isLoading,
    searchEmail,
    searchIpAddress,
    sanitizeInput,
    isValidEmail,
    isValidIP,
    addToRecentSearches,
    navigate,
    permissions.canSearchPersonalTimestamps,
    permissions.canSearchByEmail,
    permissions.canSearchByIP
  ]);

  const recentSearchesDisplay = useMemo(() => {
    if (!permissions.canViewSearchHistory) return [];

    return recentSearches.map((search, index) => (
      <div key={`${search.type}-${search.value}-${search.timestamp}`} className={styles.recentSearchItem}>
        <button
          className={styles.recentSearchButton}
          onClick={() => handleSearch(search.type, search.value)}
          disabled={isLoading}
        >
          <FiClock size={14} />
          <span>{search.displayValue}</span>
        </button>
        {permissions.canPreviewTimestampData && (
          <button
            className={styles.previewButton}
            onClick={() => handlePreview(search.type, search.value)}
            disabled={isLoading}
            title="ดูตัวอย่าง"
          >
            <FiEye size={12} />
          </button>
        )}
        {permissions.canManageSearchHistory && (
          <button
            className={styles.removeSearchButton}
            onClick={(e) => {
              e.stopPropagation();
              removeFromRecentSearches(index);
            }}
            aria-label={`ลบการค้นหา ${search.displayValue}`}
          >
            <FiX size={12} />
          </button>
        )}
      </div>
    ));
  }, [
    recentSearches,
    handleSearch,
    handlePreview,
    isLoading,
    removeFromRecentSearches,
    permissions.canViewSearchHistory,
    permissions.canPreviewTimestampData,
    permissions.canManageSearchHistory
  ]);

  useEffect(() => {
    loadRecentSearches();
  }, [loadRecentSearches]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const renderPermissionLoadingState = () => (
    <div className={styles.container}>
      <div className={styles.loadingWrapper}>
        <div className={styles.loading}>กำลังตรวจสอบสิทธิ์...</div>
      </div>
    </div>
  );

  const renderUnauthorizedState = () => (
    <div className={styles.container}>
      <Navbar
        isMobile={isMobile}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <main className={`${styles.mainContent} ${isMobile ? styles.mobileContent : ""} ${sidebarOpen && !isMobile ? styles.contentShift : ""}`}>
        <div className={styles.errorContainer}>
          <Shield className={styles.errorIcon} />
          <h2>ไม่มีสิทธิ์เข้าถึง</h2>
          <p>คุณไม่มีสิทธิ์ในการเข้าถึงการค้นหาประวัติการใช้งานรายบุคคล เฉพาะเจ้าหน้าที่เท่านั้นที่สามารถใช้ฟีเจอร์นี้ได้</p>
          <button
            className={styles.backButton}
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft size={16} /> กลับไปหน้าหลัก
          </button>
        </div>
      </main>
    </div>
  );

  if (permissions.userType === null) {
    return renderPermissionLoadingState();
  }

  if (!permissions.isStaff || !permissions.canSearchPersonalTimestamps) {
    return renderUnauthorizedState();
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
          <h1 className={styles.heading}>ประวัติการใช้งานรายบุคคล</h1>
        </div>
        <div className={styles.centerCard}>
          {permissions.canViewSearchHistory && recentSearches.length > 0 && (
            <div className={styles.recentSearchesSection}>
              <div className={styles.recentSearchesHeader}>
                <h3>การค้นหาล่าสุด</h3>
                {permissions.canManageSearchHistory && (
                  <button
                    className={styles.clearAllButton}
                    onClick={clearRecentSearches}
                    aria-label="ล้างการค้นหาทั้งหมด"
                  >
                    ล้างทั้งหมด
                  </button>
                )}
              </div>
              <div className={styles.recentSearchesList}>
                {recentSearchesDisplay}
              </div>
            </div>
          )}
          <div className={styles.tipBox}>
            <div className={styles.tipHeader}>
              <FiInfo size={24} className={styles.tipIcon} />
              <h4 className={styles.tipTitle}>วิธีการใช้งาน</h4>
            </div>
            <div className={styles.tipContent}>
              <div className={styles.tipItem}>
                <FiCheck size={16} />
                <span className={styles.tipItemText}>
                  เลือกวิธีการค้นหาที่ต้องการ: ใช้ <strong>Email</strong> หรือ <strong>IP Address</strong>
                </span>
              </div>
              <div className={styles.tipItem}>
                <FiCheck size={16} />
                <span className={styles.tipItemText}>
                  กรอกข้อมูลในช่องค้นหาที่เกี่ยวข้อง
                </span>
              </div>
              {permissions.canPreviewTimestampData && (
                <div className={styles.tipItem}>
                  <FiEye size={16} />
                  <span className={styles.tipItemText}>
                    กดปุ่ม <strong>"ดูตัวอย่าง"</strong> เพื่อดูผลลัพธ์เบื้องต้น (ไม่บังคับ)
                  </span>
                </div>
              )}
              <div className={styles.tipItem}>
                <FiSearch size={16} />
                <span className={styles.tipItemText}>
                  กดปุ่ม <strong>"ค้นหา"</strong> หรือกด <strong>Enter</strong> เพื่อดูผลลัพธ์ทั้งหมด
                </span>
              </div>
            </div>
          </div>
          {permissions.canSearchByEmail && (
            <div className={styles.searchCard}>
              <label className={styles.searchLabel} htmlFor="email-search">
                ค้นหาด้วยอีเมลแอดเดรส (Email Address)
              </label>
              <div className={styles.searchInner}>
                <FiSearch size={20} color="#6b7280" />
                <input
                  id="email-search"
                  type="email"
                  placeholder="กรอกอีเมลแอดเดรส..."
                  className={styles.searchInput}
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(sanitizeInput(e.target.value))}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch("email")}
                  disabled={isLoading}
                  maxLength={254}
                  autoComplete="off"
                  aria-describedby="email-search-help"
                />
                {permissions.canPreviewTimestampData && (
                  <button
                    className={styles.previewButton}
                    onClick={() => handlePreview("email")}
                    disabled={isLoading || !searchEmail.trim()}
                    aria-label="ดูตัวอย่างผลการค้นหา"
                    title="ดูตัวอย่าง"
                  >
                    <FiEye size={16} />
                  </button>
                )}
                <button
                  className={styles.searchButton}
                  onClick={() => handleSearch("email")}
                  disabled={isLoading || !searchEmail.trim()}
                  aria-label="ค้นหาด้วยอีเมล"
                >
                  {isLoading ? "กำลังค้นหา..." : "ค้นหา"}
                </button>
              </div>
              <small id="email-search-help" className={styles.searchHelp}>
                รูปแบบ: user@example.com
              </small>
            </div>
          )}

          {permissions.canSearchByIP && (
            <div className={styles.searchCard}>
              <label className={styles.searchLabel} htmlFor="ip-search">
                ค้นหาด้วยไอพีแอดเดรส (IP Address)
              </label>
              <div className={styles.searchInner}>
                <FiSearch size={20} color="#6b7280" />
                <input
                  id="ip-search"
                  type="text"
                  placeholder="กรอกไอพีแอดเดรส..."
                  className={styles.searchInput}
                  value={searchIpAddress}
                  onChange={(e) => setSearchIpAddress(sanitizeInput(e.target.value))}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch("ip")}
                  disabled={isLoading}
                  maxLength={255}
                  autoComplete="off"
                  aria-describedby="ip-search-help"
                />
                {permissions.canPreviewTimestampData && (
                  <button
                    className={styles.previewButton}
                    onClick={() => handlePreview("ip")}
                    disabled={isLoading || !searchIpAddress.trim()}
                    aria-label="ดูตัวอย่างผลการค้นหา"
                    title="ดูตัวอย่าง"
                  >
                    <FiEye size={16} />
                  </button>
                )}
                <button
                  className={styles.searchButton}
                  onClick={() => handleSearch("ip")}
                  disabled={isLoading || !searchIpAddress.trim()}
                  aria-label="ค้นหาด้วย IP Address"
                >
                  {isLoading ? "กำลังค้นหา..." : "ค้นหา"}
                </button>
              </div>
              <small id="ip-search-help" className={styles.searchHelp}>
                รูปแบบ: 192.168.1.1 หรือ 2001:db8::1 (สามารถใส่หลาย IP คั่นด้วยช่องว่าง)
              </small>
            </div>
          )}
          {!permissions.canSearchByEmail && !permissions.canSearchByIP && (
            <div className={styles.noPermissionMessage}>
              <Shield size={48} />
              <h3>ไม่มีสิทธิ์ในการค้นหา</h3>
              <p>คุณไม่มีสิทธิ์ในการใช้ฟีเจอร์การค้นหาใดๆ</p>
            </div>
          )}
        </div>
        {permissions.canPreviewTimestampData && showPreview && previewData && (
          <div className={styles.modalOverlay} onClick={() => setShowPreview(false)}>
            <div className={styles.previewModal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.previewHeader}>
                <h3>ตัวอย่างผลการค้นหา</h3>
                <button
                  className={styles.modalClose}
                  onClick={() => setShowPreview(false)}
                >
                  ✕
                </button>
              </div>
              <div className={styles.previewContent}>
                <p>
                  <strong>{previewData.type === 'email' ? 'อีเมล' : 'IP Address'}:</strong> {previewData.value}
                </p>
                <p><strong>จำนวนรายการที่พบ:</strong> {previewData.total} รายการ</p>

                {previewData.data.length > 0 ? (
                  <div className={styles.previewTable}>
                    <table>
                      <thead>
                        <tr>
                          <th>วันที่/เวลา</th>
                          <th>เหตุการณ์</th>
                          <th>ประเภทผู้ใช้</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.data.map((item, index) => (
                          <tr key={index}>
                            <td>{new Date(item.Timestamp_RegisTime).toLocaleString('th-TH')}</td>
                            <td>{item.TimestampType_Name.replace('timestamp_', '').replace(/_/g, ' ')}</td>
                            <td>{item.Users_Type}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p>ไม่พบข้อมูล</p>
                )}
              </div>
              <div className={styles.previewActions}>
                <button
                  className={styles.viewFullButton}
                  onClick={() => {
                    setShowPreview(false);
                    handleSearch(previewData.type, previewData.value);
                  }}
                >
                  ดูรายละเอียดทั้งหมด
                </button>
                <button
                  className={styles.cancelButton}
                  onClick={() => setShowPreview(false)}
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        )}
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