import { utils, writeFileXLSX } from 'xlsx';

const formatDate = (date) => {
    return new Date(date).toLocaleString('th-TH', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
};

const getParticipationStatus = (activity) => {
    if (activity.participationStatus === 'completed') {
        return 'เข้าร่วมสำเร็จ';
    } else if (activity.participationStatus === 'checked_in') {
        return 'เช็คอินแล้ว';
    } else if (activity.participationStatus === 'registered') {
        return 'ลงทะเบียนแล้ว';
    } else {
        return 'ยังไม่ลงทะเบียน';
    }
};

const createActivityData = (activities) => {
    return activities.map((activity, index) => ({
        "ลำดับ": index + 1,
        "ชื่อกิจกรรม": activity.title || 'N/A',
        "รายละเอียด": activity.description || 'N/A',
        "ประเภทกิจกรรม": activity.typeName || 'N/A',
        "สถานที่": activity.locationDetail || 'ไม่ระบุ',
        "วันที่เริ่ม": activity.startTime ? formatDate(activity.startTime) : 'N/A',
        "วันที่สิ้นสุด": activity.endTime ? formatDate(activity.endTime) : 'N/A',
        "สถานะกิจกรรม": activity.statusName || 'N/A',
        "กิจกรรมบังคับ": activity.isRequire ? "ใช่" : "ไม่ใช่",
        "การเข้าร่วม": getParticipationStatus(activity),
        "วันที่ลงทะเบียน": activity.registrationTime ? formatDate(activity.registrationTime) : 'ไม่ได้ลงทะเบียน',
        "เวลาเช็คอิน": activity.checkInTime ? formatDate(activity.checkInTime) : 'ยังไม่เช็คอิน',
        "เวลาเช็คเอาท์": activity.checkOutTime ? formatDate(activity.checkOutTime) : 'ยังไม่เช็คเอาท์',
        "วันที่เพิ่มในระบบ": activity.regisTime ? formatDate(activity.regisTime) : 'N/A'
    }));
};

const createTypeSummaryData = (activities) => {
    const typeStats = {};

    activities.forEach(activity => {
        const type = activity.typeName || 'ไม่ระบุประเภท';

        if (!typeStats[type]) {
            typeStats[type] = {
                total: 0,
                registered: 0,
                completed: 0,
                notRegistered: 0
            };
        }

        typeStats[type].total++;
        if (activity.isRegistered) typeStats[type].registered++;
        if (activity.participationStatus === 'completed') typeStats[type].completed++;
        if (!activity.isRegistered) typeStats[type].notRegistered++;
    });

    return Object.entries(typeStats).map(([type, stats]) => ({
        "ประเภทกิจกรรม": type,
        "จำนวนทั้งหมด": stats.total,
        "ลงทะเบียนแล้ว": stats.registered,
        "เข้าร่วมสำเร็จ": stats.completed,
        "ยังไม่ลงทะเบียน": stats.notRegistered,
        "เปอร์เซ็นต์การลงทะเบียน": `${((stats.registered / stats.total) * 100).toFixed(1)}%`,
        "เปอร์เซ็นต์การเข้าร่วม": `${((stats.completed / stats.total) * 100).toFixed(1)}%`
    }));
};

const createStatusSummaryData = (activities) => {
    const statusStats = {};

    activities.forEach(activity => {
        const status = activity.statusName || 'ไม่ระบุสถานะ';

        if (!statusStats[status]) {
            statusStats[status] = {
                total: 0,
                registered: 0,
                completed: 0
            };
        }

        statusStats[status].total++;
        if (activity.isRegistered) statusStats[status].registered++;
        if (activity.participationStatus === 'completed') statusStats[status].completed++;
    });

    return Object.entries(statusStats).map(([status, stats]) => ({
        "สถานะกิจกรรม": status,
        "จำนวนทั้งหมด": stats.total,
        "ลงทะเบียนแล้ว": stats.registered,
        "เข้าร่วมสำเร็จ": stats.completed,
        "เปอร์เซ็นต์การลงทะเบียน": `${((stats.registered / stats.total) * 100).toFixed(1)}%`,
        "เปอร์เซ็นต์การเข้าร่วม": `${((stats.completed / stats.total) * 100).toFixed(1)}%`
    }));
};

const getColumnWidths = (type) => {
    switch (type) {
        case 'activities':
            return [
                { wch: 8 },   // ลำดับ
                { wch: 30 },  // ชื่อกิจกรรม
                { wch: 40 },  // รายละเอียด
                { wch: 25 },  // ประเภทกิจกรรม
                { wch: 30 },  // สถานที่
                { wch: 20 },  // วันที่เริ่ม
                { wch: 20 },  // วันที่สิ้นสุด
                { wch: 20 },  // สถานะกิจกรรม
                { wch: 15 },  // กิจกรรมบังคับ
                { wch: 20 },  // การเข้าร่วม
                { wch: 20 },  // วันที่ลงทะเบียน
                { wch: 20 },  // เวลาเช็คอิน
                { wch: 20 },  // เวลาเช็คเอาท์
                { wch: 20 }   // วันที่เพิ่มในระบบ
            ];
        case 'type':
        case 'status':
            return [
                { wch: 30 }, { wch: 15 }, { wch: 20 },
                { wch: 20 }, { wch: 20 }, { wch: 25 }, { wch: 25 }
            ];
        default:
            return [];
    }
};

export const exportActivitiesToExcel = (activities, filterInfo = {}, options = {}) => {
    try {
        if (!activities || activities.length === 0) {
            alert("ไม่มีข้อมูลสำหรับการ export");
            return false;
        }

        const {
            includeTypeSummary = true,
            includeStatusSummary = true,
            filename = null
        } = options;

        const wb = { SheetNames: [], Sheets: {} };

        // Sheet 1: รายการกิจกรรม
        const activitiesData = createActivityData(activities);
        const activitiesWs = utils.json_to_sheet(activitiesData);
        activitiesWs['!cols'] = getColumnWidths('activities');
        wb.SheetNames.push("รายการกิจกรรม");
        wb.Sheets["รายการกิจกรรม"] = activitiesWs;

        // Sheet 2: สรุปตามประเภท
        if (includeTypeSummary) {
            const typeData = createTypeSummaryData(activities);
            if (typeData.length > 0) {
                const typeWs = utils.json_to_sheet(typeData);
                typeWs['!cols'] = getColumnWidths('type');
                wb.SheetNames.push("สรุปตามประเภท");
                wb.Sheets["สรุปตามประเภท"] = typeWs;
            }
        }

        // Sheet 3: สรุปตามสถานะ
        if (includeStatusSummary) {
            const statusData = createStatusSummaryData(activities);
            if (statusData.length > 0) {
                const statusWs = utils.json_to_sheet(statusData);
                statusWs['!cols'] = getColumnWidths('status');
                wb.SheetNames.push("สรุปตามสถานะ");
                wb.Sheets["สรุปตามสถานะ"] = statusWs;
            }
        }

        // Generate filename
        const now = new Date();
        const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
        const finalFilename = filename || `กิจกรรมของตนเอง_${timestamp}.xlsx`;

        writeFileXLSX(wb, finalFilename);

        return true;
    } catch (error) {
        console.error('Export error:', error);
        alert('เกิดข้อผิดพลาดในการ export ไฟล์: ' + error.message);
        return false;
    }
};

export const exportBasicActivitiesToExcel = (activities) => {
    return exportActivitiesToExcel(activities, {}, {
        includeTypeSummary: false,
        includeStatusSummary: false,
        filename: `กิจกรรม_พื้นฐาน_${new Date().toISOString().slice(0, 10)}.xlsx`
    });
};

export const exportFilteredActivitiesToExcel = (activities, filterInfo) => {
    if (!activities || activities.length === 0) {
        alert("ไม่มีข้อมูลตามเงื่อนไขการกรองสำหรับการ export");
        return false;
    }

    const filterText = Object.entries(filterInfo)
        .filter(([key, value]) => value && value !== "" && value !== "ทั้งหมด")
        .map(([key, value]) => `${key}_${value}`)
        .join("_");

    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `กิจกรรม_${filterText ? filterText + '_' : ''}${timestamp}.xlsx`;

    return exportActivitiesToExcel(activities, filterInfo, { filename });
};