// utils/activityExportUtils.js - Updated to include teacher information
import { utils, writeFileXLSX } from 'xlsx';

const formatDate = (date) => {
  return new Date(date).toLocaleString('th-TH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const exportActivitiesToExcel = (activities) => {
  try {
    if (!activities || activities.length === 0) {
      alert("ไม่มีข้อมูลสำหรับการ export");
      return false;
    }

    const data = activities.map((activity, index) => ({
      "ลำดับ": index + 1,
      "ชื่อกิจกรรม": activity.title || 'N/A',
      "ประเภท": activity.typeName || 'N/A',
      "สถานะ": activity.statusName || 'N/A',
      "วันที่เริ่ม": formatDate(activity.startTime),
      "วันที่สิ้นสุด": formatDate(activity.endTime),
      "สถานที่": activity.locationDetail || 'N/A',
      "บังคับเข้าร่วม": activity.isRequire ? "ใช่" : "ไม่",
      "อนุญาตอาจารย์": activity.allowTeachers ? "ใช่" : "ไม่", // เพิ่มคอลัมน์นี้
      "แม่แบบเกียรติบัตร": activity.templateName || 'ไม่มี',
      "วันที่สร้าง": formatDate(activity.regisTime),
      "วันที่แก้ไขล่าสุด": formatDate(activity.updateTime)
    }));

    const wb = utils.book_new();
    const ws = utils.json_to_sheet(data);

    // กำหนดความกว้างคอลัมน์
    ws['!cols'] = [
      { wch: 8 },   // ลำดับ
      { wch: 40 },  // ชื่อกิจกรรม
      { wch: 25 },  // ประเภท
      { wch: 15 },  // สถานะ
      { wch: 20 },  // วันที่เริ่ม
      { wch: 20 },  // วันที่สิ้นสุด
      { wch: 30 },  // สถานที่
      { wch: 15 },  // บังคับเข้าร่วม
      { wch: 15 },  // อนุญาตอาจารย์ (คอลัมน์ใหม่)
      { wch: 25 },  // แม่แบบเกียรติบัตร
      { wch: 20 },  // วันที่สร้าง
      { wch: 20 }   // วันที่แก้ไขล่าสุด
    ];

    utils.book_append_sheet(wb, ws, "กิจกรรม");

    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `รายการกิจกรรม_${timestamp}.xlsx`;

    writeFileXLSX(wb, filename);
    return true;
  } catch (error) {
    console.error('Export error:', error);
    alert('เกิดข้อผิดพลาดในการ export ไฟล์');
    return false;
  }
};

// ฟังก์ชันสำหรับ export รายชื่อผู้เข้าร่วม (รวมอาจารย์)
export const exportParticipantsToExcel = (participants, activityTitle) => {
  try {
    if (!participants || participants.length === 0) {
      alert("ไม่มีข้อมูลผู้เข้าร่วมสำหรับการ export");
      return false;
    }

    const data = participants.map((participant, index) => ({
      "ลำดับ": index + 1,
      "ประเภท": participant.isTeacher ? "อาจารย์" : "นักศึกษา",
      "รหัส": participant.Code || 'N/A',
      "ชื่อ": participant.FirstName || 'N/A',
      "นามสกุล": participant.LastName || 'N/A',
      "อีเมล": participant.Users_Email || 'N/A',
      "เบอร์โทร": participant.Phone || 'N/A',
      "สาขา": participant.Department_Name || 'N/A',
      "คณะ": participant.Faculty_Name || 'N/A',
      "วันที่ลงทะเบียน": formatDate(participant.Registration_RegisTime),
      "วันที่เช็คอิน": participant.Registration_CheckInTime 
        ? formatDate(participant.Registration_CheckInTime) 
        : 'ยังไม่ได้เช็คอิน',
      "วันที่เช็คเอาท์": participant.Registration_CheckOutTime 
        ? formatDate(participant.Registration_CheckOutTime) 
        : 'ยังไม่ได้เช็คเอาท์',
      "สถานะ": participant.RegistrationStatus_Name || 'N/A'
    }));

    const wb = utils.book_new();
    const ws = utils.json_to_sheet(data);

    // กำหนดความกว้างคอลัมน์
    ws['!cols'] = [
      { wch: 8 },   // ลำดับ
      { wch: 12 },  // ประเภท
      { wch: 15 },  // รหัส
      { wch: 20 },  // ชื่อ
      { wch: 20 },  // นามสกุล
      { wch: 30 },  // อีเมล
      { wch: 15 },  // เบอร์โทร
      { wch: 30 },  // สาขา
      { wch: 30 },  // คณะ
      { wch: 20 },  // วันที่ลงทะเบียน
      { wch: 20 },  // วันที่เช็คอิน
      { wch: 20 },  // วันที่เช็คเอาท์
      { wch: 15 }   // สถานะ
    ];

    utils.book_append_sheet(wb, ws, "ผู้เข้าร่วม");

    const timestamp = new Date().toISOString().slice(0, 10);
    const safeTitle = activityTitle.replace(/[^a-zA-Z0-9ก-๙]/g, '_').substring(0, 30);
    const filename = `ผู้เข้าร่วม_${safeTitle}_${timestamp}.xlsx`;

    writeFileXLSX(wb, filename);
    return true;
  } catch (error) {
    console.error('Export participants error:', error);
    alert('เกิดข้อผิดพลาดในการ export ไฟล์');
    return false;
  }
};

// ฟังก์ชันสำหรับ export สถิติ (แยกนักศึกษาและอาจารย์)
export const exportActivityStatsToExcel = (activityDetail, participants) => {
  try {
    if (!activityDetail) {
      alert("ไม่มีข้อมูลกิจกรรมสำหรับการ export");
      return false;
    }

    const wb = utils.book_new();

    // Sheet 1: ข้อมูลกิจกรรม
    const activityData = [{
      "ชื่อกิจกรรม": activityDetail.Activity_Title,
      "รายละเอียด": activityDetail.Activity_Description,
      "ประเภท": activityDetail.ActivityType_Name || 'N/A',
      "สถานะ": activityDetail.ActivityStatus_Name || 'N/A',
      "วันที่เริ่ม": formatDate(activityDetail.Activity_StartTime),
      "วันที่สิ้นสุด": formatDate(activityDetail.Activity_EndTime),
      "สถานที่": activityDetail.Activity_LocationDetail || 'N/A',
      "บังคับเข้าร่วม": activityDetail.Activity_IsRequire ? "ใช่" : "ไม่",
      "อนุญาตอาจารย์": activityDetail.Activity_AllowTeachers ? "ใช่" : "ไม่",
      "จำนวนที่คาดหวัง": activityDetail.total_expected || 0,
      "จำนวนที่ลงทะเบียน": activityDetail.total_registered || 0,
      "จำนวนที่เช็คอิน": activityDetail.total_checked_in || 0
    }];

    if (activityDetail.Activity_AllowTeachers) {
      activityData[0]["จำนวนนักศึกษา"] = activityDetail.total_students || 0;
      activityData[0]["จำนวนอาจารย์"] = activityDetail.total_teachers || 0;
    }

    const ws1 = utils.json_to_sheet(activityData);
    utils.book_append_sheet(wb, ws1, "ข้อมูลกิจกรรม");

    // Sheet 2: สถิติตามสาขา
    if (activityDetail.departments && activityDetail.departments.length > 0) {
      const deptData = activityDetail.departments.map((dept, index) => {
        const row = {
          "ลำดับ": index + 1,
          "คณะ": dept.Faculty_Name,
          "สาขา": dept.Department_Name,
          "คาดหวัง": dept.ActivityDetail_Total || 0,
          "ลงทะเบียน": dept.registered_count || 0,
          "เช็คอิน": dept.checked_in_count || 0,
          "อัตราเข้าร่วม": dept.ActivityDetail_Total > 0
            ? `${((dept.registered_count / dept.ActivityDetail_Total) * 100).toFixed(1)}%`
            : '0%'
        };

        if (activityDetail.Activity_AllowTeachers) {
          row["นักศึกษา"] = dept.student_count || 0;
          row["อาจารย์"] = dept.teacher_count || 0;
        }

        return row;
      });

      const ws2 = utils.json_to_sheet(deptData);
      utils.book_append_sheet(wb, ws2, "สถิติตามสาขา");
    }

    // Sheet 3: รายชื่อผู้เข้าร่วม
    if (participants && participants.length > 0) {
      const participantData = participants.map((p, index) => ({
        "ลำดับ": index + 1,
        "ประเภท": p.isTeacher ? "อาจารย์" : "นักศึกษา",
        "รหัส": p.Code,
        "ชื่อ-นามสกุล": `${p.FirstName} ${p.LastName}`,
        "สาขา": p.Department_Name,
        "วันที่ลงทะเบียน": formatDate(p.Registration_RegisTime),
        "เช็คอิน": p.Registration_CheckInTime ? "✓" : "✗",
        "เช็คเอาท์": p.Registration_CheckOutTime ? "✓" : "✗",
        "สถานะ": p.RegistrationStatus_Name
      }));

      const ws3 = utils.json_to_sheet(participantData);
      utils.book_append_sheet(wb, ws3, "รายชื่อผู้เข้าร่วม");
    }

    const timestamp = new Date().toISOString().slice(0, 10);
    const safeTitle = activityDetail.Activity_Title.replace(/[^a-zA-Z0-9ก-๙]/g, '_').substring(0, 30);
    const filename = `สถิติ_${safeTitle}_${timestamp}.xlsx`;

    writeFileXLSX(wb, filename);
    return true;
  } catch (error) {
    console.error('Export stats error:', error);
    alert('เกิดข้อผิดพลาดในการ export ไฟล์');
    return false;
  }
};