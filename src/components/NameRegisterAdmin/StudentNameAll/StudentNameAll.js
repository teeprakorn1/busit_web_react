import React, { useState, useEffect } from 'react';
import Navbar from '../../NavigationBar/NavigationBar';
import styles from './StudentNameAll.module.css';
import { Plus, Upload, User, Eye, Edit, Trash2 } from 'lucide-react';

function StudentNameAll() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifyOpen, setNotifyOpen] = useState(false);

  const StudentsData = [
    {
      id: 1,
      code: "51246789214-7",
      firstName: "โชกุน",
      lastName: "คนไทย",
      department: "วิทยาการคอมพิวเตอร์",
      academicYear: 2022,
      email: "shogun.kon@rmutto.ac.th",
      isActive: true,
    },
    {
      id: 2,
      code: "21764139774-6",
      firstName: "มิวเมือง",
      lastName: "คนทะเล",
      department: "วิทยาการคอมพิวเตอร์",
      academicYear: 2024,
      email: "millmuang.kon@rmutto.ac.th",
      isActive: false,
    },
    {
      id: 3,
      code: "84297546288-1",
      firstName: "ตอเต้ย",
      lastName: "คนบ้านทุ่ง",
      department: "วิทยาการคอมพิวเตอร์",
      academicYear: 2024,
      email: "trotoey.kon@rmutto.ac.th",
      isActive: true,
    },
  ];

  const [students] = useState(StudentsData);

  const notifications = [
    "มีผู้ใช้งานเข้าร่วมกิจกรรม",
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
          <h1 className={styles.heading}>หน้าหลัก</h1>

          <div className={styles.headerRight}>
            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="ค้นหา..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className={styles.notifyWrapper}>
              <button
                className={styles.notifyButton}
                onClick={() => setNotifyOpen(!notifyOpen)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="24" height="24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14V11a6 6 0 00-5-5.917V4a1 1 0 10-2 0v1.083A6 6 0 006 11v3c0 .386-.147.735-.395 1.004L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
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

        {/* Fillter and Search */}
        <div className={styles.studentsSection}>
          <div className={styles.studentsFilter}>
            <button className={styles.addButton}>
              <Plus className={styles.icon} />
              เพิ่มนักศึกษา
            </button>
            <button className={styles.exportButton}>
              <Upload className={styles.icon} />
              Export Excel
            </button>

            <input
              type="text"
              placeholder="ค้นหานักศึกษา..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.studentsSearch}
            />

            <select className={styles.studentsSelect}>
              <option>ทุกสาขา</option>
              <option>วิทยาการคอมพิวเตอร์</option>
            </select>

            <select className={styles.studentsSelect}>
              <option>ทุกปีการศึกษา</option>
              <option>2022</option>
              <option>2023</option>
              <option>2024</option>
              <option>2025</option>
            </select>
          </div>

          <div className={styles.studentsTableWrapper}>
            <table className={styles.studentsTable}>
              <thead>
                <tr>
                  <th>รหัสนักศึกษา</th>
                  <th>ชื่อ-นามสกุล</th>
                  <th>สาขา</th>
                  <th>ปีการศึกษา</th>
                  <th>อีเมล</th>
                  <th>สถานะ</th>
                  <th>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {students
                  .filter(st => 
                    st.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    st.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    st.code.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map(student => (
                  <tr key={student.id}>
                    <td>{student.code}</td>
                    <td>
                      <div className={styles.studentName}>
                        <div className={styles.avatar}>
                          <User className={styles.userIcon} />
                        </div>
                        <span>{student.firstName} {student.lastName}</span>
                      </div>
                    </td>
                    <td>{student.department}</td>
                    <td>{student.academicYear}</td>
                    <td>{student.email}</td>
                    <td>
                      <span className={student.isActive ? styles.activeStatus : styles.inactiveStatus}>
                        {student.isActive ? "ใช้งาน" : "ระงับ"}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button className={styles.viewBtn}><Eye className={styles.iconSmall} /></button>
                        <button className={styles.editBtn}><Edit className={styles.iconSmall} /></button>
                        <button className={styles.deleteBtn}><Trash2 className={styles.iconSmall} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {students.length === 0 && <div className={styles.noData}>ไม่พบข้อมูลนักศึกษา</div>}
          </div>
        </div>
      </main>
    </div>
  );
}

export default StudentNameAll;
