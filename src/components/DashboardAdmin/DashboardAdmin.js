import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../NavigationBar/NavigationBar';
import styles from './DashboardAdmin.module.css';
import CustomModal from './../../services/CustomModal/CustomModal';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import {
  FiActivity,
  FiUsers,
  FiUserCheck,
  FiBarChart2,
  FiDownload,
  FiAlertCircle,
  FiRefreshCw,
  FiCalendar,
  FiTrendingUp,
  FiCheckCircle,
  FiClock,
  FiFilter
} from 'react-icons/fi';
import { useDashboard } from './hooks/useDashboard';
import { useExportDashboard } from './hooks/useExportDashboard';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function DashboardAdmin() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear() + 543;
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [showFilters, setShowFilters] = useState(false);

  const { loading, error, dashboardData, updateFilters, semester, academicYear, setSemester, setAcademicYear, refetch } = useDashboard();
  const { exporting, exportToExcel } = useExportDashboard(dashboardData);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  // จัดการ Resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // จัดการ Error - แสดงแจ้งเตือนแต่ไม่ redirect อัตโนมัติ
  useEffect(() => {
    if (error) {
      console.error('Dashboard Error:', error);
      
      // ตรวจสอบว่าเป็น error 401 หรือไม่
      const errorStr = String(error).toLowerCase();
      const isUnauthorized = errorStr.includes('401') || 
                            errorStr.includes('unauthorized') || 
                            errorStr.includes('เซสชัน');

      if (isUnauthorized) {
        setModalMessage('เซสชันของคุณหมดอายุแล้ว กรุณาเข้าสู่ระบบใหม่');
        setModalOpen(true);
        
        // Redirect หลัง 2 วินาที
        setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
          sessionStorage.clear();
          navigate('/login', { replace: true });
        }, 2000);
      }
    }
  }, [error, navigate]);

  const handleExport = async () => {
    try {
      const result = await exportToExcel();
      setModalMessage(result.message || 'Export สำเร็จ');
      setModalOpen(true);
    } catch (err) {
      setModalMessage('เกิดข้อผิดพลาดในการ Export');
      setModalOpen(true);
    }
  };

  const handleApplyFilters = () => {
    updateFilters(semester, academicYear);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setSemester('');
    setAcademicYear('');
    updateFilters('', '');
    setShowFilters(false);
  };

  const handleRetry = () => {
    refetch();
  };

  const academicYears = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const summaryCards = [
    {
      title: "กิจกรรมทั้งหมด",
      value: loading ? "..." : dashboardData.totalActivities,
      icon: <FiActivity size={28} />,
      color: "#2563eb",
      bgColor: "#dbeafe"
    },
    {
      title: "นักศึกษาทั้งหมด",
      value: loading ? "..." : dashboardData.totalStudents.toLocaleString(),
      icon: <FiUsers size={28} />,
      color: "#7c3aed",
      bgColor: "#ede9fe"
    },
    {
      title: "อาจารย์ทั้งหมด",
      value: loading ? "..." : dashboardData.totalTeachers.toLocaleString(),
      icon: <FiUserCheck size={28} />,
      color: "#0891b2",
      bgColor: "#cffafe"
    },
    {
      title: "อัตราเข้าร่วม",
      value: loading ? "..." : `${dashboardData.participationRate}%`,
      icon: <FiBarChart2 size={28} />,
      color: "#10b981",
      bgColor: "#d1fae5"
    },
    {
      title: "กิจกรรมที่เปิดรับสมัคร",
      value: loading ? "..." : dashboardData.activeActivities,
      icon: <FiCalendar size={28} />,
      color: "#f59e0b",
      bgColor: "#fef3c7"
    },
    {
      title: "กิจกรรมที่สำเร็จ",
      value: loading ? "..." : dashboardData.completedActivities,
      icon: <FiTrendingUp size={28} />,
      color: "#14b8a6",
      bgColor: "#ccfbf1"
    },
  ];

  const activityTypeChartData = {
    labels: dashboardData.activityTypeStats.map(stat => stat.ActivityType_Name || 'ไม่ระบุ'),
    datasets: [
      {
        label: 'จำนวนกิจกรรม',
        data: dashboardData.activityTypeStats.map(stat => stat.activity_count),
        backgroundColor: [
          'rgba(37, 99, 235, 0.8)',
          'rgba(124, 58, 237, 0.8)',
          'rgba(8, 145, 178, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
        ],
        borderColor: [
          'rgb(37, 99, 235)',
          'rgb(124, 58, 237)',
          'rgb(8, 145, 178)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const recentActivitiesChartData = {
    labels: dashboardData.recentActivities.slice(0, 10).map(a => a.Activity_Title?.substring(0, 20) + '...'),
    datasets: [
      {
        label: 'จำนวนผู้เข้าร่วม',
        data: dashboardData.recentActivities.slice(0, 10).map(a => a.participant_count || 0),
        backgroundColor: 'rgba(37, 99, 235, 0.7)',
        borderColor: 'rgb(37, 99, 235)',
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const monthlyChartData = {
    labels: dashboardData.monthlyStats.map(stat => stat.month_name),
    datasets: [
      {
        label: 'จำนวนกิจกรรม',
        data: dashboardData.monthlyStats.map(stat => stat.activity_count),
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        borderColor: 'rgb(37, 99, 235)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgb(37, 99, 235)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
      {
        label: 'ผู้เข้าร่วม',
        data: dashboardData.monthlyStats.map(stat => stat.participant_count),
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgb(16, 185, 129)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: {
            family: "'Noto Sans', sans-serif",
            size: 12,
            weight: 600
          },
          padding: 12,
          usePointStyle: true,
          color: '#374151'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(55, 65, 81, 0.95)',
        padding: 12,
        titleFont: {
          family: "'Noto Sans', sans-serif",
          size: 14,
          weight: 600
        },
        bodyFont: {
          family: "'Noto Sans', sans-serif",
          size: 13
        },
        cornerRadius: 8,
        borderColor: '#e5e7eb',
        borderWidth: 1
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            family: "'Noto Sans', sans-serif",
            size: 12
          },
          color: '#6b7280'
        },
        grid: {
          color: '#f3f4f6',
          drawBorder: false
        }
      },
      x: {
        ticks: {
          font: {
            family: "'Noto Sans', sans-serif",
            size: 12
          },
          color: '#6b7280'
        },
        grid: {
          display: false
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: {
            family: "'Noto Sans', sans-serif",
            size: 12,
            weight: 600
          },
          padding: 15,
          usePointStyle: true,
          color: '#374151'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(55, 65, 81, 0.95)',
        padding: 12,
        titleFont: {
          family: "'Noto Sans', sans-serif",
          weight: 600
        },
        bodyFont: {
          family: "'Noto Sans', sans-serif"
        },
        cornerRadius: 8,
        borderColor: '#e5e7eb',
        borderWidth: 1
      }
    }
  };

  const getFilterLabel = () => {
    if (!semester && !academicYear) return 'ทั้งหมด';
    let label = '';
    if (academicYear) label += `ปี ${academicYear}`;
    if (semester) {
      const semesterNames = { '1': 'เทอม 1', '2': 'เทอม 2', '3': 'อื่นๆ' };
      label += (label ? ' / ' : '') + semesterNames[semester];
    }
    return label;
  };

  return (
    <div className={styles.container}>
      <Navbar
        isMobile={isMobile}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <main className={`${styles.mainContent} ${isMobile ? styles.mobileContent : ""} ${sidebarOpen && !isMobile ? styles.contentShift : ""}`}>
        <div className={styles.headerBar}>
          <h1 className={styles.heading}>แดชบอร์ด</h1>
          <div className={styles.headerRight}>
            <button
              className={styles.filterButton}
              onClick={() => setShowFilters(!showFilters)}
              title="กรองข้อมูล"
            >
              <FiFilter size={18} />
              {getFilterLabel()}
            </button>
            <button
              className={styles.refreshButton}
              onClick={handleRetry}
              disabled={loading}
              title="รีเฟรชข้อมูล"
            >
              <FiRefreshCw size={18} className={loading ? styles.spinning : ''} />
            </button>
            <button
              className={styles.exportButton}
              onClick={handleExport}
              disabled={exporting || loading}
            >
              <FiDownload size={18} />
              {exporting ? 'กำลังส่งออก...' : 'Export Excel'}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className={styles.filterPanel}>
            <div className={styles.filterContent}>
              <div className={styles.filterGroup}>
                <label>ปีการศึกษา</label>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className={styles.select}
                >
                  <option value="">ทั้งหมด</option>
                  {academicYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label>เทอม</label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className={styles.select}
                >
                  <option value="">ทั้งหมด</option>
                  <option value="1">เทอม 1</option>
                  <option value="2">เทอม 2</option>
                  <option value="3">ภาคฤดูร้อน</option>
                </select>
              </div>

              <div className={styles.filterActions}>
                <button
                  className={styles.applyButton}
                  onClick={handleApplyFilters}
                  disabled={loading}
                >
                  <FiCheckCircle size={16} />
                  ใช้ตัวกรอง
                </button>
                <button
                  className={styles.clearButton}
                  onClick={handleClearFilters}
                >
                  ล้างตัวกรอง
                </button>
              </div>
            </div>
          </div>
        )}

        {error && !error.includes('401') && !error.includes('เซสชัน') && (
          <div className={styles.errorAlert}>
            <FiAlertCircle size={20} />
            <span>{error}</span>
            <button onClick={handleRetry} className={styles.retryButton}>
              ลองใหม่
            </button>
          </div>
        )}

        {dashboardData.userInfo.departmentRestricted && (
          <div className={styles.infoAlert}>
            <FiUsers size={20} />
            <span>คุณกำลังดูข้อมูลเฉพาะสาขาของคุณเท่านั้น</span>
          </div>
        )}

        <section className={styles.dashboardSection}>
          {summaryCards.map((card, i) => (
            <div key={i} className={styles.card}>
              <div className={styles.cardIcon} style={{ backgroundColor: card.bgColor, color: card.color }}>
                {card.icon}
              </div>
              <div className={styles.cardTitle}>{card.title}</div>
              <div className={styles.cardNumber}>{card.value}</div>
            </div>
          ))}
        </section>

        <section className={styles.additionalStats}>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <h3>สรุปผู้เข้าร่วมกิจกรรม</h3>
              <FiUsers size={20} />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>ผู้ใช้ที่เข้าร่วม</span>
                <span className={styles.statValue}>
                  {loading ? "..." : (dashboardData.participationDetails?.participatedUsers || 0).toLocaleString()}
                </span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>การลงทะเบียนทั้งหมด</span>
                <span className={styles.statValue}>
                  {loading ? "..." : (dashboardData.participationDetails?.totalRegistrations || 0).toLocaleString()}
                </span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>เข้าร่วมสำเร็จ</span>
                <span className={styles.statValue} style={{ color: '#10b981' }}>
                  {loading ? "..." : (dashboardData.participationDetails?.completedRegistrations || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <h3>สถิติกิจกรรม</h3>
              <FiActivity size={20} />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statItem}>
                <div className={styles.statLabelWithIcon}>
                  <FiClock size={16} />
                  <span className={styles.statLabel}>เปิดรับสมัคร</span>
                </div>
                <span className={styles.statValue} style={{ color: '#f59e0b' }}>
                  {loading ? "..." : dashboardData.activeActivities}
                </span>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statLabelWithIcon}>
                  <FiCheckCircle size={16} />
                  <span className={styles.statLabel}>เสร็จสิ้นแล้ว</span>
                </div>
                <span className={styles.statValue} style={{ color: '#14b8a6' }}>
                  {loading ? "..." : dashboardData.completedActivities}
                </span>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statLabelWithIcon}>
                  <FiActivity size={16} />
                  <span className={styles.statLabel}>รวมทั้งหมด</span>
                </div>
                <span className={styles.statValue} style={{ color: '#2563eb' }}>
                  {loading ? "..." : dashboardData.totalActivities}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <h3>อัตราการเข้าร่วม</h3>
              <FiTrendingUp size={20} />
            </div>
            <div className={styles.statContent}>
              <div className={styles.progressCircle}>
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="12"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="12"
                    strokeDasharray={`${(dashboardData.participationRate * 314) / 100} 314`}
                    strokeLinecap="round"
                    transform="rotate(-90 60 60)"
                    style={{ transition: 'stroke-dasharray 0.5s ease' }}
                  />
                  <text
                    x="60"
                    y="60"
                    textAnchor="middle"
                    dy="7"
                    fontSize="24"
                    fontWeight="bold"
                    fill="#10b981"
                  >
                    {loading ? "..." : `${dashboardData.participationRate}%`}
                  </text>
                </svg>
              </div>
            </div>
          </div>
        </section>

        <div className={styles.chartsGrid}>
          <section className={styles.chartSection}>
            <h2>
              <FiActivity size={20} />
              กิจกรรมล่าสุด (10 อันดับ)
            </h2>
            <div className={styles.chartContainer}>
              {dashboardData.recentActivities.length > 0 ? (
                <Bar data={recentActivitiesChartData} options={chartOptions} />
              ) : (
                <div className={styles.noData}>ไม่มีข้อมูลกิจกรรม</div>
              )}
            </div>
          </section>

          <section className={styles.chartSection}>
            <h2>
              <FiBarChart2 size={20} />
              สถิติตามประเภทกิจกรรม
            </h2>
            <div className={styles.chartContainer}>
              {dashboardData.activityTypeStats.length > 0 ? (
                <Doughnut data={activityTypeChartData} options={doughnutOptions} />
              ) : (
                <div className={styles.noData}>ไม่มีข้อมูลสถิติ</div>
              )}
            </div>
          </section>

          <section className={styles.chartSection}>
            <h2>
              <FiTrendingUp size={20} />
              สถิติรายเดือน (6 เดือนล่าสุด)
            </h2>
            <div className={styles.chartContainer}>
              {dashboardData.monthlyStats.length > 0 ? (
                <Line data={monthlyChartData} options={chartOptions} />
              ) : (
                <div className={styles.noData}>ไม่มีข้อมูลสถิติ</div>
              )}
            </div>
          </section>
        </div>

        <section className={styles.tableSection}>
          <h2>
            <FiCalendar size={20} />
            รายการกิจกรรมล่าสุด
          </h2>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ชื่อกิจกรรม</th>
                  <th>วันที่เริ่ม</th>
                  <th>วันที่สิ้นสุด</th>
                  <th>ผู้เข้าร่วม</th>
                  <th>ประเภท</th>
                  <th>สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className={styles.loadingCell}>กำลังโหลดข้อมูล...</td>
                  </tr>
                ) : dashboardData.recentActivities.length > 0 ? (
                  dashboardData.recentActivities.slice(0, 15).map((act, i) => (
                    <tr key={i}>
                      <td className={styles.activityName}>{act.Activity_Title}</td>
                      <td>{new Date(act.Activity_StartTime).toLocaleString('th-TH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</td>
                      <td>{new Date(act.Activity_EndTime).toLocaleString('th-TH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</td>
                      <td className={styles.centered}>{act.participant_count || 0}</td>
                      <td>
                        <span className={styles.typeBadge}>
                          {act.ActivityType_Name || 'ไม่ระบุ'}
                        </span>
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${styles[`status${act.ActivityStatus_ID}`]}`}>
                          {act.ActivityStatus_Name || 'ไม่ระบุ'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className={styles.noDataCell}>ไม่มีข้อมูลกิจกรรม</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
      <CustomModal
        isOpen={modalOpen}
        message={modalMessage}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}

export default DashboardAdmin;