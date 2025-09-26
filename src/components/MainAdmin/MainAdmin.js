import React, { useState, useEffect } from 'react';
import Navbar from '../NavigationBar/NavigationBar';
import styles from './MainAdmin.module.css';
import { FiBell, FiUsers, FiCalendar, FiBarChart2 } from 'react-icons/fi';

function MainAdmin() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [notifyOpen, setNotifyOpen] = useState(false);

  const notifications = [
    "มีผู้ใช้งานเข้ารวมกิจกรรมใหม่",
    "กิจกรรมจะเริ่มขึ้นใน 3 วัน",
  ];

  const systemStats = [
    {
      title: "จำนวนนักศึกษาทั้งหมด",
      count: "2,847",
      icon: <FiUsers size={32} />,
      color: "#3B82F6"
    },
    {
      title: "กิจกรรมที่กำลังดำเนินการ",
      count: "15",
      icon: <FiCalendar size={32} />,
      color: "#10B981"
    },
    {
      title: "อัตราการเข้าร่วมกิจกรรม",
      count: "87%",
      icon: <FiBarChart2 size={32} />,
      color: "#F59E0B"
    },
    {
      title: "การแจ้งเตือนรอดำเนินการ",
      count: "12",
      icon: <FiBell size={32} />,
      color: "#EF4444"
    }
  ];

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
        {/* Header Bar */}
        <div className={styles.headerBar}>
          <h1 className={styles.heading}>หน้าหลัก (ตัวอย่าง)</h1>
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
                  <div className={styles.notifyHeader}>
                    <h4>การแจ้งเตือน</h4>
                  </div>
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
            {systemStats.map((stat, index) => (
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