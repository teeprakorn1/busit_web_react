import React, { useState } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { FiCalendar, FiDownload, FiBarChart2, FiActivity, FiUsers } from 'react-icons/fi';
import { useSemesterReport } from './hooks/useSemesterReport';
import { useExportSemesterReport } from './hooks/useExportSemesterReport';
import styles from './SemesterReport.module.css';

function SemesterReport() {
  const currentYear = new Date().getFullYear() + 543; // Thai Buddhist year
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());

  const { loading, error, reportData, fetchSemesterReport } = useSemesterReport();
  const { exporting, exportToExcel } = useExportSemesterReport(reportData);

  const handleGenerateReport = () => {
    fetchSemesterReport(selectedSemester, selectedYear);
  };

  const handleExport = async () => {
    await exportToExcel();
  };

  const academicYears = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const typeChartData = {
    labels: reportData.typeStats.map(stat => stat.ActivityType_Name),
    datasets: [{
      label: 'จำนวนกิจกรรม',
      data: reportData.typeStats.map(stat => stat.activity_count),
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
    }]
  };

  const monthlyChartData = {
    labels: reportData.monthlyStats.map(stat => stat.month_name),
    datasets: [{
      label: 'จำนวนกิจกรรม',
      data: reportData.monthlyStats.map(stat => stat.activity_count),
      backgroundColor: 'rgba(37, 99, 235, 0.1)',
      borderColor: 'rgb(37, 99, 235)',
      borderWidth: 3,
      tension: 0.4,
      fill: true,
    }]
  };

  const departmentChartData = {
    labels: reportData.departmentStats.map(stat => stat.Department_Name),
    datasets: [{
      label: 'จำนวนกิจกรรม',
      data: reportData.departmentStats.map(stat => stat.activity_count),
      backgroundColor: 'rgba(37, 99, 235, 0.7)',
      borderColor: 'rgb(37, 99, 235)',
      borderWidth: 2,
      borderRadius: 8,
    }]
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <FiCalendar size={28} />
          รายงานสรุปกิจกรรมตามเทอม
        </h1>

        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <label>ปีการศึกษา</label>
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(e.target.value)}
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
              value={selectedSemester} 
              onChange={(e) => setSelectedSemester(e.target.value)}
              className={styles.select}
            >
              <option value="">ทั้งปี</option>
              <option value="1">เทอม 1 (ก.ค. - ต.ค.)</option>
              <option value="2">เทอม 2 (พ.ย. - ก.พ.)</option>
              <option value="3">อื่นๆ (มี.ค. - มิ.ย.)</option>
            </select>
          </div>

          <button 
            className={styles.generateButton}
            onClick={handleGenerateReport}
            disabled={loading}
          >
            <FiBarChart2 size={18} />
            {loading ? 'กำลังโหลด...' : 'สร้างรายงาน'}
          </button>

          {reportData.summary.total_activities > 0 && (
            <button 
              className={styles.exportButton}
              onClick={handleExport}
              disabled={exporting}
            >
              <FiDownload size={18} />
              {exporting ? 'กำลังส่งออก...' : 'Export Excel'}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      {reportData.period.departmentRestricted && (
        <div className={styles.info}>
          <FiUsers size={18} />
          คุณกำลังดูรายงานเฉพาะสาขาของคุณเท่านั้น
        </div>
      )}

      {reportData.summary.total_activities > 0 && (
        <>
          <div className={styles.summarySection}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon} style={{ backgroundColor: '#dbeafe', color: '#2563eb' }}>
                <FiActivity size={24} />
              </div>
              <div className={styles.summaryContent}>
                <div className={styles.summaryLabel}>กิจกรรมทั้งหมด</div>
                <div className={styles.summaryValue}>{reportData.summary.total_activities}</div>
              </div>
            </div>

            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon} style={{ backgroundColor: '#d1fae5', color: '#10b981' }}>
                <FiUsers size={24} />
              </div>
              <div className={styles.summaryContent}>
                <div className={styles.summaryLabel}>ผู้เข้าร่วมทั้งหมด</div>
                <div className={styles.summaryValue}>{reportData.summary.total_participants.toLocaleString()}</div>
              </div>
            </div>

            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon} style={{ backgroundColor: '#ccfbf1', color: '#14b8a6' }}>
                <FiBarChart2 size={24} />
              </div>
              <div className={styles.summaryContent}>
                <div className={styles.summaryLabel}>เข้าร่วมสำเร็จ</div>
                <div className={styles.summaryValue}>{reportData.summary.completed_participations.toLocaleString()}</div>
              </div>
            </div>

            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon} style={{ backgroundColor: '#fef3c7', color: '#f59e0b' }}>
                <FiCalendar size={24} />
              </div>
              <div className={styles.summaryContent}>
                <div className={styles.summaryLabel}>รวมชั่วโมงกิจกรรม</div>
                <div className={styles.summaryValue}>{reportData.summary.total_hours || 0} ชม.</div>
              </div>
            </div>
          </div>

          <div className={styles.chartsGrid}>
            <div className={styles.chartCard}>
              <h2>สถิติตามประเภทกิจกรรม</h2>
              <div className={styles.chartContainer}>
                <Doughnut data={typeChartData} />
              </div>
            </div>

            <div className={styles.chartCard}>
              <h2>กิจกรรมรายเดือน</h2>
              <div className={styles.chartContainer}>
                <Line data={monthlyChartData} />
              </div>
            </div>

            {!reportData.period.departmentRestricted && reportData.departmentStats.length > 0 && (
              <div className={styles.chartCard}>
                <h2>สถิติตามสาขา</h2>
                <div className={styles.chartContainer}>
                  <Bar data={departmentChartData} />
                </div>
              </div>
            )}
          </div>

          <div className={styles.tableSection}>
            <h2>กิจกรรมยอดนิยม (10 อันดับ)</h2>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ชื่อกิจกรรม</th>
                    <th>วันที่จัด</th>
                    <th>ประเภท</th>
                    <th>ผู้เข้าร่วม</th>
                    <th>สำเร็จ</th>
                    <th>สาขา</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.topActivities.map((activity, index) => (
                    <tr key={index}>
                      <td className={styles.activityName}>{activity.Activity_Title}</td>
                      <td>{new Date(activity.Activity_StartTime).toLocaleDateString('th-TH')}</td>
                      <td>
                        <span className={styles.typeBadge}>{activity.ActivityType_Name}</span>
                      </td>
                      <td className={styles.centered}>{activity.participant_count}</td>
                      <td className={styles.centered}>{activity.completed_count}</td>
                      <td className={styles.departments}>{activity.departments || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!loading && reportData.summary.total_activities === 0 && selectedYear && (
        <div className={styles.noData}>
          <FiActivity size={48} />
          <p>ไม่พบข้อมูลกิจกรรมในช่วงเวลาที่เลือก</p>
        </div>
      )}
    </div>
  );
}

export default SemesterReport;