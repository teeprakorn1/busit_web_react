import { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';

export const useExportDashboard = (dashboardData) => {
  const [exporting, setExporting] = useState(false);

  const exportToExcel = useCallback(async () => {
    try {
      setExporting(true);

      const wb = XLSX.utils.book_new();

      // สรุปภาพรวม
      const summaryData = [
        ['รายงานสรุปแดชบอร์ด ระบบจัดการกิจกรรมนักศึกษา'],
        ['วันที่สร้างรายงาน', new Date().toLocaleString('th-TH')],
        [],
        ['หัวข้อ', 'จำนวน'],
        ['กิจกรรมทั้งหมด', dashboardData.totalActivities],
        ['นักศึกษาทั้งหมด', dashboardData.totalStudents],
        ['อาจารย์ทั้งหมด', dashboardData.totalTeachers],
        ['กิจกรรมที่กำลังดำเนินการ', dashboardData.activeActivities],
        ['กิจกรรมที่เสร็จสิ้น', dashboardData.completedActivities],
        ['อัตราการเข้าร่วมกิจกรรม (%)', dashboardData.participationRate],
        ['ผู้ใช้ที่เข้าร่วมกิจกรรม', dashboardData.participationDetails?.participatedUsers || 0],
        ['การลงทะเบียนทั้งหมด', dashboardData.participationDetails?.totalRegistrations || 0],
        ['เข้าร่วมสำเร็จ', dashboardData.participationDetails?.completedRegistrations || 0],
      ];
      const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, ws1, 'สรุปภาพรวม');

      // รายการกิจกรรมล่าสุด
      if (dashboardData.recentActivities?.length > 0) {
        const activitiesData = [
          ['รายการกิจกรรมล่าสุด'],
          [],
          ['ชื่อกิจกรรม', 'วันที่เริ่ม', 'วันที่สิ้นสุด', 'จำนวนผู้เข้าร่วม', 'เข้าร่วมสำเร็จ', 'ระยะเวลา (ชม.)', 'ประเภท', 'สถานะ', 'สถานที่', 'คณะ/สาขา']
        ];

        dashboardData.recentActivities.forEach(activity => {
          activitiesData.push([
            activity.Activity_Title,
            new Date(activity.Activity_StartTime).toLocaleString('th-TH'),
            new Date(activity.Activity_EndTime).toLocaleString('th-TH'),
            activity.participant_count || 0,
            activity.completed_count || 0,
            activity.duration_hours || 0,
            activity.ActivityType_Name || '-',
            activity.ActivityStatus_Name || '-',
            activity.Activity_LocationDetail || '-',
            activity.departments || '-'
          ]);
        });

        const ws2 = XLSX.utils.aoa_to_sheet(activitiesData);
        XLSX.utils.book_append_sheet(wb, ws2, 'กิจกรรมล่าสุด');
      }

      // สถิติตามประเภทกิจกรรม
      if (dashboardData.activityTypeStats?.length > 0) {
        const typeStatsData = [
          ['สถิติตามประเภทกิจกรรม'],
          [],
          ['ประเภทกิจกรรม', 'จำนวนกิจกรรม', 'ผู้เข้าร่วมทั้งหมด', 'ระยะเวลาเฉลี่ย (ชม.)']
        ];

        dashboardData.activityTypeStats.forEach(stat => {
          typeStatsData.push([
            stat.ActivityType_Name,
            stat.activity_count,
            stat.total_participants,
            stat.avg_duration ? parseFloat(stat.avg_duration).toFixed(2) : 0
          ]);
        });

        const ws3 = XLSX.utils.aoa_to_sheet(typeStatsData);
        XLSX.utils.book_append_sheet(wb, ws3, 'สถิติตามประเภท');
      }

      // สถิติรายเดือน
      if (dashboardData.monthlyStats?.length > 0) {
        const monthlyData = [
          ['สถิติรายเดือน (6 เดือนล่าสุด)'],
          [],
          ['เดือน-ปี', 'จำนวนกิจกรรม', 'ผู้เข้าร่วม', 'เข้าร่วมสำเร็จ']
        ];

        dashboardData.monthlyStats.forEach(stat => {
          monthlyData.push([
            stat.month_name,
            stat.activity_count,
            stat.participant_count,
            stat.completed_count
          ]);
        });

        const ws4 = XLSX.utils.aoa_to_sheet(monthlyData);
        XLSX.utils.book_append_sheet(wb, ws4, 'สถิติรายเดือน');
      }

      // สถิติตามสถานะ
      if (dashboardData.statusStats?.length > 0) {
        const statusData = [
          ['สถิติตามสถานะกิจกรรม'],
          [],
          ['สถานะ', 'จำนวน']
        ];

        dashboardData.statusStats.forEach(stat => {
          statusData.push([
            stat.ActivityStatus_Name,
            stat.count
          ]);
        });

        const ws5 = XLSX.utils.aoa_to_sheet(statusData);
        XLSX.utils.book_append_sheet(wb, ws5, 'สถิติตามสถานะ');
      }

      // สถิติตามคณะ/สาขา
      if (dashboardData.departmentStats?.length > 0) {
        const deptData = [
          ['สถิติตามคณะ/สาขา (10 อันดับแรก)'],
          [],
          ['สาขา', 'คณะ', 'จำนวนกิจกรรม', 'โควตาทั้งหมด', 'จำนวนนักศึกษา']
        ];

        dashboardData.departmentStats.forEach(stat => {
          deptData.push([
            stat.Department_Name,
            stat.Faculty_Name,
            stat.activity_count,
            stat.total_quota,
            stat.student_count
          ]);
        });

        const ws6 = XLSX.utils.aoa_to_sheet(deptData);
        XLSX.utils.book_append_sheet(wb, ws6, 'สถิติตามคณะ-สาขา');
      }

      // กิจกรรมที่มีผู้เข้าร่วมสูงสุด
      if (dashboardData.topActivities?.length > 0) {
        const topData = [
          ['กิจกรรมที่มีผู้เข้าร่วมสูงสุด (10 อันดับ)'],
          [],
          ['ชื่อกิจกรรม', 'จำนวนผู้เข้าร่วม', 'ประเภท']
        ];

        dashboardData.topActivities.forEach(stat => {
          topData.push([
            stat.Activity_Title,
            stat.participant_count,
            stat.ActivityType_Name
          ]);
        });

        const ws7 = XLSX.utils.aoa_to_sheet(topData);
        XLSX.utils.book_append_sheet(wb, ws7, 'กิจกรรมยอดนิยม');
      }

      // สถิติตามช่วงเวลา
      if (dashboardData.hourlyStats?.length > 0) {
        const hourlyData = [
          ['สถิติการจัดกิจกรรมตามช่วงเวลา'],
          [],
          ['ชั่วโมง', 'จำนวนกิจกรรม', 'ผู้เข้าร่วม']
        ];

        dashboardData.hourlyStats.forEach(stat => {
          hourlyData.push([
            `${stat.hour}:00 น.`,
            stat.activity_count,
            stat.participant_count
          ]);
        });

        const ws8 = XLSX.utils.aoa_to_sheet(hourlyData);
        XLSX.utils.book_append_sheet(wb, ws8, 'สถิติตามช่วงเวลา');
      }

      const fileName = `Dashboard_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      return { success: true, message: 'ส่งออกข้อมูลสำเร็จ' };
    } catch (err) {
      console.error('Export error:', err);
      return { success: false, message: 'เกิดข้อผิดพลาดในการส่งออกข้อมูล' };
    } finally {
      setExporting(false);
    }
  }, [dashboardData]);

  return {
    exporting,
    exportToExcel
  };
};