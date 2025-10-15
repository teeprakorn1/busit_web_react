import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../NavigationBar/NavigationBar';
import styles from './MainAdmin.module.css';
import { FiUserCheck, FiUsers, FiCalendar, FiBarChart2, FiAlertCircle } from 'react-icons/fi';

const getApiUrl = (endpoint) => {
  const protocol = process.env.REACT_APP_SERVER_PROTOCOL;
  const baseUrl = process.env.REACT_APP_SERVER_BASE_URL;
  const port = process.env.REACT_APP_SERVER_PORT;

  if (!protocol || !baseUrl || !port) {
    throw new Error('Missing required environment variables');
  }

  return `${protocol}${baseUrl}${port}${endpoint}`;
};

function MainAdmin() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    activeActivities: 0,
    participationRate: 0
  });

  const systemFeatures = [
    {
      title: "จัดการข้อมูลผู้ใช้งาน",
      description: "เพิ่ม แก้ไข และจัดการข้อมูลนักศึกษา อาจารย์ และเจ้าหน้าที่",
      features: ["นำเข้าข้อมูลจากไฟล์ CSV", "แก้ไขข้อมูลส่วนตัว", "จัดการสิทธิ์การใช้งาน"]
    },
    {
      title: "ระบบจัดการกิจกรรม",
      description: "สร้าง จัดการ และติดตามกิจกรรมนักศึกษาต่างๆ ในมหาวิทยาลัย",
      features: ["สร้างกิจกรรมใหม่", "กำหนดผู้เข้าร่วม", "ตรวจสอบการเข้าร่วม GPS", "สามารถเลือกใช้ AI ในการตรวจจับภาพ"]
    },
    {
      title: "ระบบรายงานและสถิติ",
      description: "ดูรายงานสรุปและสถิติการเข้าร่วมกิจกรรมแบบครบถ้วน",
      features: ["รายงานรายเทอม/ปีการศึกษา", "สถิติการเข้าร่วมรายบุคคล", "ส่งออกข้อมูล Excel"]
    },
    {
      title: "ระบบเกียรติบัตรอิเล็กทรอนิกส์",
      description: "จัดการและออกเกียรติบัตรอิเล็กทรอนิกส์สำหรับผู้เข้าร่วมกิจกรรม",
      features: ["ออกแบบเกียรติบัตร", "ลายเซ็นดิจิทัล", "ดาวน์โหลดเกียรติบัตร"]
    }
  ];

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
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(getApiUrl('/api/admin/dashboard-stats'), {
        withCredentials: true,
        timeout: 15000,
        headers: {
          'Cache-Control': 'no-cache',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      if (response.data && response.data.status) {
        const statsData = response.data.data;

        setStats({
          totalStudents: statsData.totalStudents || 0,
          totalTeachers: statsData.totalTeachers || 0,
          activeActivities: statsData.activeActivities || 0,
          participationRate: statsData.participationRate || 0
        });
      } else {
        setError('ไม่สามารถโหลดข้อมูลสถิติได้');
      }

    } catch (err) {
      console.error('Fetch dashboard stats error:', err);

      let errorMessage = 'เกิดข้อผิดพลาดในการโหลดข้อมูล';

      if (axios.isAxiosError(err)) {
        if (err.code === 'ECONNABORTED') {
          errorMessage = 'การเชื่อมต่อหมดเวลา กรุณาลองใหม่อีกครั้ง';
        } else if (err.response) {
          switch (err.response.status) {
            case 401:
              errorMessage = 'กรุณาเข้าสู่ระบบใหม่';
              break;
            case 403:
              errorMessage = 'ไม่มีสิทธิ์เข้าถึงข้อมูลนี้';
              break;
            case 429:
              errorMessage = 'คำขอเกินจำนวนที่กำหนด กรุณารอสักครู่';
              break;
            default:
              errorMessage = err.response.data?.message || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
          }
        } else if (err.request) {
          errorMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้';
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const systemStatsDisplay = [
    {
      title: "จำนวนนักศึกษาทั้งหมด",
      count: loading ? "..." : stats.totalStudents.toLocaleString(),
      icon: <FiUsers size={32} />,
      color: "#3B82F6"
    },
    {
      title: "จำนวนอาจารย์ทั้งหมด",
      count: loading ? "..." : stats.totalTeachers.toLocaleString(),
      icon: <FiUserCheck size={32} />,
      color: "#10B981"
    },
    {
      title: "กิจกรรมที่กำลังดำเนินการ",
      count: loading ? "..." : stats.activeActivities.toLocaleString(),
      icon: <FiCalendar size={32} />,
      color: "#F59E0B"
    },
    {
      title: "อัตราการเข้าร่วมกิจกรรม",
      count: loading ? "..." : `${stats.participationRate}%`,
      icon: <FiBarChart2 size={32} />,
      color: "#f63b3bff"
    },
  ];

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
        {/* Header Bar */}
        <div className={styles.headerBar}>
          <h1 className={styles.heading}>หน้าหลัก</h1>
        </div>

        {/* Error Alert */}
        {error && (
          <div className={styles.errorAlert}>
            <FiAlertCircle size={20} />
            <span>{error}</span>
            <button onClick={fetchDashboardStats} className={styles.retryButton}>
              ลองใหม่
            </button>
          </div>
        )}

        {/* Welcome Section */}
        <div className={styles.welcomeSection}>
          <div className={styles.welcomeContent}>
            <h2>ยินดีต้อนรับสู่ระบบจัดการกิจกรรมนักศึกษา BUSIT PLUS</h2>
            <p>
              ระบบจัดการกิจกรรมนักศึกษาออนไลน์ที่ครบครันสำหรับสถาบันการศึกษา (มหาวิทยาลัยเทคโนโลยีราชมงคลตะวันออก เขตพื้นที่จักรพงษภูวนารถ)
              ช่วยให้การบริหารจัดการกิจกรรมต่างๆ เป็นไปอย่างมีประสิทธิภาพและสะดวกสบาย
            </p>
          </div>
        </div>

        {/* System Stats */}
        <div className={styles.statsSection}>
          <h3 className={styles.sectionTitle}>สถิติระบบ</h3>
          <div className={styles.statsGrid}>
            {systemStatsDisplay.map((stat, index) => (
              <div key={index} className={styles.statCard}>
                <div
                  className={styles.statIcon}
                  style={{ color: stat.color }}
                >
                  {stat.icon}
                </div>
                <div className={styles.statContent}>
                  <h4 className={styles.statCount}>{stat.count}</h4>
                  <p className={styles.statTitle}>{stat.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Features */}
        <div className={styles.featuresSection}>
          <h3 className={styles.sectionTitle}>ฟีเจอร์หลักของระบบ</h3>
          <div className={styles.featuresGrid}>
            {systemFeatures.map((feature, index) => (
              <div key={index} className={styles.featureCard}>
                <h4 className={styles.featureTitle}>{feature.title}</h4>
                <p className={styles.featureDescription}>{feature.description}</p>
                <ul className={styles.featureList}>
                  {feature.features.map((item, itemIndex) => (
                    <li key={itemIndex}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* System Benefits */}
        <div className={styles.benefitsSection}>
          <h3 className={styles.sectionTitle}>ประโยชน์ที่ได้รับจากระบบ</h3>
          <div className={styles.benefitsGrid}>
            <div className={styles.benefitCard}>
              <div className={styles.benefitNumber}>1</div>
              <div className={styles.benefitContent}>
                <h4>เพิ่มความสะดวกในการลงทะเบียนเข้าร่วมกิจกรรม</h4>
                <p>นักศึกษาสามารถลงทะเบียนเข้าร่วมกิจกรรมผ่านระบบออนไลน์ได้อย่างง่ายดาย</p>
              </div>
            </div>
            <div className={styles.benefitCard}>
              <div className={styles.benefitNumber}>2</div>
              <div className={styles.benefitContent}>
                <h4>เพิ่มความสะดวกในการตรวจสอบความครบถ้วน</h4>
                <p>ตรวจสอบการเข้าร่วมกิจกรรมของนักศึกษาได้แบบเรียลไทม์และแม่นยำ</p>
              </div>
            </div>
            <div className={styles.benefitCard}>
              <div className={styles.benefitNumber}>3</div>
              <div className={styles.benefitContent}>
                <h4>เพิ่มความสะดวกในการบริหารจัดการ</h4>
                <p>จัดการกิจกรรมนักศึกษาได้อย่างเป็นระบบและมีประสิทธิภาพสูง</p>
              </div>
            </div>
          </div>
        </div>

        {/* System Capabilities */}
        <div className={styles.capabilitiesSection}>
          <h3 className={styles.sectionTitle}>ขอบเขตการใช้งานระบบ</h3>
          <div className={styles.capabilitiesContent}>
            <div className={styles.platformSection}>
              <h4>เว็บแอปพลิเคชัน (สำหรับเจ้าหน้าที่ อาจารย์ และผู้บริหาร)</h4>
              <div className={styles.roleCards}>
                <div className={styles.roleCard}>
                  <h5>เจ้าหน้าที่</h5>
                  <ul>
                    <li>จัดการข้อมูลกิจกรรมและผู้เข้าร่วม</li>
                    <li>ออกเกียรติบัตรอิเล็กทรอนิกส์</li>
                    <li>กำหนดตำแหน่ง GPS สำหรับเช็คชื่อ</li>
                    <li>ดูรายงานและสถิติกิจกรรม</li>
                  </ul>
                </div>
                <div className={styles.roleCard}>
                  <h5>ผู้บริหาร</h5>
                  <ul>
                    <li>ตรวจสอบกิจกรรมทุกสาขา</li>
                    <li>ดูรายงานสรุประดับมหาวิทยาลัย</li>
                    <li>ดาวน์โหลดเกียรติบัตรและประวัติ</li>
                  </ul>
                </div>
                <div className={styles.roleCard}>
                  <h5>อาจารย์</h5>
                  <ul>
                    <li>ตรวจสอบกิจกรรมนักศึกษาในสาขา</li>
                    <li>ดูรายงานสรุปกิจกรรม</li>
                    <li>ดาวน์โหลดเอกสารประกอบ</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className={styles.platformSection}>
              <h4>โมบายแอปพลิเคชัน (สำหรับนักศึกษา อาจารย์ และผู้บริหาร)</h4>
              <div className={styles.mobileFeatures}>
                <div className={styles.mobileFeatureCard}>
                  <h5>การแจ้งเตือนอัตโนมัติ</h5>
                  <p>รับการแจ้งเตือนกิจกรรมล่วงหน้า 7 วัน, 3 วัน, 1 วัน และในวันกิจกรรม</p>
                </div>
                <div className={styles.mobileFeatureCard}>
                  <h5>ระบบตรวจสอบภาพปลอม</h5>
                  <p>อัปโหลดภาพกิจกรรมเพื่อยืนยันการเข้าร่วมพร้อมระบบตรวจสอบความถูกต้อง</p>
                </div>
                <div className={styles.mobileFeatureCard}>
                  <h5>เอกสารดิจิทัล</h5>
                  <p>ดาวน์โหลดเกียรติบัตรและประวัติกิจกรรมในรูปแบบดิจิทัล</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default MainAdmin;