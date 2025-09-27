import React, { useState, useEffect } from 'react';
import Navbar from '../NavigationBar/NavigationBar';
import styles from './DashboardAdmin.module.css';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { FiActivity, FiUsers, FiClipboard, FiBarChart2, FiClock, FiEdit } from 'react-icons/fi';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function DashboardAdmin() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);

  const summaryCards = [
    { title: "กิจกรรมทั้งหมด", value: 120, icon: <FiActivity size={36} /> },
    { title: "นักศึกษาทั้งหมด", value: 450, icon: <FiUsers size={36} /> },
    { title: "การลงทะเบียน", value: 320, icon: <FiClipboard size={36} /> },
    { title: "อัตราเข้าร่วม", value: "72%", icon: <FiBarChart2 size={36} /> },
    { title: "นักศึกษาที่กิจกรรมไม่ครบ", value: "52%", icon: <FiClock size={36} /> },
    { title: "กิจกรรมที่สำเร็จ", value: 100, icon: <FiEdit size={36} /> },
  ];

  const latestActivities = [
    { name: "กิจกรรมเฟรชชี่ 2025", begin_datetime: "10:00 - 15/08/2025", end_datetime: "16:00 - 15/08/2025", participants: 32, type: "บังคับ", status: "รอดำเนินการ" },
    { name: "กิจกรรมบุซิทเดร์ย 2025", begin_datetime: "10:00 - 12/08/2025", end_datetime: "14:00 - 12/08/2025", participants: 143, type: "บังคับ", status: "อยู่ในระหว่างกิจกรรม" },
    { name: "กิจกรรมบริจาคโลหิต 2025", begin_datetime: "13:00 - 10/08/2025", end_datetime: "15:30 - 10/08/2025", participants: 300, type: "ไม่บังคับ", status: "เสร็จสิ้น" },
  ];

  const chartData = {
    labels: latestActivities.map(a => a.name),
    datasets: [
      {
        label: 'จำนวนผู้เข้าร่วม',
        data: latestActivities.map(a => a.participants),
        backgroundColor: 'rgba(37, 99, 235, 0.6)',
      },
    ],
  };

  const chartOptions = { responsive: true, plugins: { legend: { display: false } } };

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={styles.container}>
      <Navbar
        isMobile={isMobile}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <main className={`${styles.mainContent} ${isMobile ? styles.mobileContent : ""} ${sidebarOpen && !isMobile ? styles.contentShift : ""}`}>
        <div className={styles.headerBar}>
          <h1 className={styles.heading}>แดชบอร์ด (ตัวอย่าง)</h1>
        </div>

        {/* Summary Cards */}
        <section className={styles.dashboardSection}>
          {summaryCards.map((card, i) => (
            <div key={i} className={styles.card}>
              <div>{card.icon}</div>
              <div>{card.title}</div>
              <div className={styles.cardNumber}>{card.value}</div>
            </div>
          ))}
        </section>

        {/*Activities Table */}
        <section className={styles.tableSection}>
          <h2>กิจกรรมล่าสุด</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ชื่อกิจกรรม</th>
                <th>วันเวลาที่เริ่มกิจกรรม</th>
                <th>วันเวลาที่จบกิจกรรม</th>
                <th>จำนวนผู้เข้าร่วม</th>
                <th>ประเภทกิจกรรม</th>
                <th>สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {latestActivities.map((act, i) => (
                <tr key={i}>
                  <td>{act.name}</td>
                  <td>{act.begin_datetime}</td>
                  <td>{act.end_datetime}</td>
                  <td>{act.participants}</td>
                  <td>{act.type}</td>
                  <td>{act.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Chart */}
        <section className={styles.chartSection}>
          <h2>สถิติการเข้าร่วม</h2>
          <Bar data={chartData} options={chartOptions} />
        </section>
      </main>
    </div>
  );
}

export default DashboardAdmin;
