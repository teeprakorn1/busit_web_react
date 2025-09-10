import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Navbar from '../../NavigationBar/NavigationBar';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './AdminAllStudents.module.css';
import { Plus, Upload, User, Eye, Edit, Ban, X, AlertCircle, Loader } from 'lucide-react';
import { utils, writeFileXLSX } from 'xlsx';
import { FiBell } from 'react-icons/fi';
import axios from 'axios';

const getApiUrl = (endpoint) => {
  return `${process.env.REACT_APP_SERVER_PROTOCOL}${process.env.REACT_APP_SERVER_BASE_URL}${process.env.REACT_APP_SERVER_PORT}${endpoint}`;
};

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

const getDepartmentDisplay = (department) => {
  switch (department) {
    case 'วิทยาการคอมพิวเตอร์': return 'คอมพิวเตอร์';
    case 'เทคโนโลยีสารสนเทศ': return 'สารสนเทศ';
    case 'การตลาด': return 'การตลาด';
    case 'การจัดการ': return 'การจัดการ';
    case 'การบัญชี': return 'การบัญชี';
    case 'ภาษาอังกฤษเพื่อการสื่อสารสากล': return 'ภาษาอังกฤษ';
    case 'การท่องเที่ยวและการโรงแรม (แขนงการท่องเที่ยว)': return 'ท่องเที่ยว';
    case 'การท่องเที่ยวและการโรงแรม (แขนงการโรงแรม)': return 'โรงแรม';
    default: return department;
  }
};

function AdminAllStudents() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifyOpen, setNotifyOpen] = useState(false);

  const [facultyFilter, setFacultyFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [academicYearFilter, setAcademicYearFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const [students, setStudents] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();
  const location = useLocation();
  const rowsPerPage = 10;

  const notifications = ["มีผู้ใช้งานเข้าร่วมกิจกรรม"];

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const studentParams = {
        page: currentPage,
        limit: rowsPerPage,
        includeGraduated: true
      };

      if (facultyFilter && faculties.length > 0) {
        const selectedFaculty = faculties.find(f => f.Faculty_Name === facultyFilter);
        if (selectedFaculty) {
          studentParams.facultyId = selectedFaculty.Faculty_ID;
        }
      }

      if (departmentFilter && departments.length > 0) {
        const selectedDepartment = departments.find(d => d.Department_Name === departmentFilter);
        if (selectedDepartment) {
          studentParams.departmentId = selectedDepartment.Department_ID;
        }
      }

      if (academicYearFilter) {
        studentParams.academicYear = academicYearFilter;
      }

      if (searchQuery) {
        studentParams.search = searchQuery;
      }

      const studentsRes = await axios.get(getApiUrl(process.env.REACT_APP_API_ADMIN_STUDENTS_GET), {
        withCredentials: true,
        timeout: 10000,
        params: studentParams,
        headers: {
          'Cache-Control': 'no-cache'
        }
      });

      if (studentsRes.data.status) {
        const transformedStudents = studentsRes.data.data.map(student => ({
          id: student.Student_ID,
          code: student.Student_Code,
          firstName: student.Student_FirstName,
          lastName: student.Student_LastName,
          phone: student.Student_Phone,
          academicYear: student.Student_AcademicYear,
          birthdate: student.Student_Birthdate,
          religion: student.Student_Religion,
          medicalProblem: student.Student_MedicalProblem,
          regisTime: student.Student_RegisTime,
          isGraduated: student.Student_IsGraduated,
          department: student.Department.Department_Name,
          faculty: student.Department.Faculty_Name,
          email: student.Users.Users_Email,
          username: student.Users.Users_Username,
          userRegisTime: student.Users.Users_RegisTime,
          imageFile: student.Users.Users_ImageFile,
          isActive: student.Users.Users_IsActive
        }));

        setStudents(transformedStudents);
      } else {
        setError('ไม่สามารถโหลดข้อมูลนักศึกษาได้: ' + (studentsRes.data.message || 'Unknown error'));
        setStudents([]);
      }

    } catch (err) {
      console.error('Fetch students error:', err);

      let errorMessage = 'เกิดข้อผิดพลาดในการโหลดข้อมูล';
      if (err.code === 'ECONNABORTED') {
        errorMessage = 'การเชื่อมต่อหมดเวลา กรุณาลองใหม่อีกครั้ง';
      } else if (err.response?.status === 401) {
        errorMessage = 'กรุณาเข้าสู่ระบบใหม่';
      } else if (err.response?.status === 403) {
        errorMessage = 'ไม่มีสิทธิ์เข้าถึงข้อมูลนี้';
      } else if (err.response?.status === 404) {
        errorMessage = 'ไม่พบ API สำหรับดึงข้อมูลนักศึกษา กรุณาติดต่อผู้ดูแลระบบ';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      setError(errorMessage);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, facultyFilter, departmentFilter, academicYearFilter, searchQuery, faculties, departments]);

  const loadFacultiesAndDepartments = useCallback(async () => {
    try {
      const [facultiesRes, departmentsRes] = await Promise.all([
        axios.get(getApiUrl(process.env.REACT_APP_API_ADMIN_FACULTIES_GET), {
          withCredentials: true,
          timeout: 10000,
          headers: {
            'Cache-Control': 'no-cache'
          }
        }),
        axios.get(getApiUrl(process.env.REACT_APP_API_ADMIN_DEPARTMENTS_GET), {
          withCredentials: true,
          timeout: 10000,
          headers: {
            'Cache-Control': 'no-cache'
          }
        })
      ]);

      if (facultiesRes.data.status) {
        setFaculties(facultiesRes.data.data);
      }
      if (departmentsRes.data.status) {
        setDepartments(departmentsRes.data.data);
      }
    } catch (err) {
      console.error('Load faculties/departments error:', err);
    }
  }, []);

  useEffect(() => {
    loadFacultiesAndDepartments();
  }, [loadFacultiesAndDepartments]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

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

  const filteredStudents = useMemo(() => {
    if (!Array.isArray(students)) return [];

    return students.filter(student => {
      if (!student) return false;

      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || [
        student.firstName,
        student.lastName,
        student.code,
        student.email,
        student.department
      ].some(field =>
        field && field.toString().toLowerCase().includes(query)
      );

      const matchesFaculty = !facultyFilter || student.faculty === facultyFilter;
      const matchesDepartment = !departmentFilter || student.department === departmentFilter;
      const matchesAcademicYear = !academicYearFilter || student.academicYear.toString() === academicYearFilter;

      let matchesStatus = true;
      if (statusFilter === 'active') {
        matchesStatus = student.isActive;
      } else if (statusFilter === 'inactive') {
        matchesStatus = !student.isActive;
      } else if (statusFilter === 'graduated') {
        matchesStatus = student.isGraduated;
      } else if (statusFilter === 'not_graduated') {
        matchesStatus = !student.isGraduated;
      }

      return matchesSearch && matchesFaculty && matchesDepartment && matchesAcademicYear && matchesStatus;
    });
  }, [students, searchQuery, facultyFilter, departmentFilter, academicYearFilter, statusFilter]);

  const sortedStudents = useMemo(() => {
    if (!sortBy) return filteredStudents;

    return [...filteredStudents].sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'name':
          aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
          bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
          break;
        case 'code':
          aValue = a.code;
          bValue = b.code;
          break;
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'academicYear':
          aValue = a.academicYear;
          bValue = b.academicYear;
          break;
        case 'department':
          aValue = a.department.toLowerCase();
          bValue = b.department.toLowerCase();
          break;
        case 'faculty':
          aValue = a.faculty.toLowerCase();
          bValue = b.faculty.toLowerCase();
          break;
        case 'regisTime':
          aValue = new Date(a.regisTime);
          bValue = new Date(b.regisTime);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return sortOrder === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredStudents, sortBy, sortOrder]);

  const totalPages = Math.ceil(sortedStudents.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = sortedStudents.slice(indexOfFirstRow, indexOfLastRow);

  const exportToExcel = useCallback(() => {
    try {
      if (!sortedStudents || sortedStudents.length === 0) {
        alert("ไม่มีข้อมูลสำหรับการ export");
        return;
      }

      const data = sortedStudents.map((student, index) => ({
        "ลำดับ": index + 1,
        "รหัสนักศึกษา": student.code || 'N/A',
        "ชื่อ": student.firstName || 'N/A',
        "นามสกุล": student.lastName || 'N/A',
        "คณะ": student.faculty || 'N/A',
        "สาขา": student.department || 'N/A',
        "ปีการศึกษา": student.academicYear || 'N/A',
        "อีเมล": student.email || 'N/A',
        "วันที่เพิ่มในระบบ": student.regisTime ? formatDate(student.regisTime) : 'N/A',
        "สำเร็จการศึกษา": student.isGraduated ? "สำเร็จการศึกษา" : "ยังไม่สำเร็จการศึกษา",
        "สถานะ": student.isActive ? "ใช้งาน" : "ระงับ"
      }));

      const ws = utils.json_to_sheet(data);
      const colWidths = [
        { wch: 8 },
        { wch: 20 },
        { wch: 15 },
        { wch: 15 },
        { wch: 35 },
        { wch: 25 },
        { wch: 12 },
        { wch: 30 },
        { wch: 20 },
        { wch: 20 },
        { wch: 12 }
      ];
      ws['!cols'] = colWidths;

      const wb = { SheetNames: [], Sheets: {} };
      wb.SheetNames.push("Students");
      wb.Sheets["Students"] = ws;

      const now = new Date();
      const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;

      const filename = `Students_${timestamp}.xlsx`;
      writeFileXLSX(wb, filename);
    } catch (err) {
      console.error('Export error:', err);
      alert('เกิดข้อผิดพลาดในการ export ไฟล์');
    }
  }, [sortedStudents]);

  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setFacultyFilter("");
    setDepartmentFilter("");
    setAcademicYearFilter("");
    setStatusFilter("");
    setSortBy("");
    setSortOrder("asc");
    setCurrentPage(1);
    navigate({
      pathname: location.pathname,
      search: ""
    });
  }, [navigate, location.pathname]);

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <Navbar
          isMobile={isMobile}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <main className={`${styles.mainContent} ${isMobile ? styles.mobileContent : ""} ${sidebarOpen && !isMobile ? styles.contentShift : ""}`}>
          <div className={styles.loadingContainer}>
            <Loader className={styles.spinner} />
            <p>กำลังโหลดข้อมูล...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <Navbar
          isMobile={isMobile}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <main className={`${styles.mainContent} ${isMobile ? styles.mobileContent : ""} ${sidebarOpen && !isMobile ? styles.contentShift : ""}`}>
          <div className={styles.errorContainer}>
            <AlertCircle className={styles.errorIcon} />
            <h2>เกิดข้อผิดพลาด</h2>
            <p>{error}</p>
            <div className={styles.errorActions}>
              <button className={styles.retryButton} onClick={fetchStudents}>
                ลองใหม่อีกครั้ง
              </button>
            </div>
          </div>
        </main>
      </div>
    );
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
          <div className={styles.headerLeft}>
            <div>
              <h1 className={styles.heading}>รายชื่อนักศึกษาทั้งหมด</h1>
            </div>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.notifyWrapper}>
              <button
                className={styles.notifyButton}
                onClick={() => setNotifyOpen(!notifyOpen)}
                aria-label="แจ้งเตือน"
                aria-expanded={notifyOpen}
              >
                <FiBell size={24} color="currentColor" />
                {notifications.length > 0 && (
                  <span className={styles.badge} aria-label={`${notifications.length} การแจ้งเตือน`}>
                    {notifications.length}
                  </span>
                )}
              </button>

              {notifyOpen && (
                <div className={styles.notifyDropdown} role="menu">
                  {notifications.map((n, i) => (
                    <div key={i} className={styles.notifyItem} role="menuitem">
                      {n}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filter & Table */}
        <div className={styles.studentsSection}>
          <div className={styles.studentsFilter}>
            <button className={styles.addButton}>
              <Plus className={styles.icon} />
              เพิ่มนักศึกษา
            </button>

            <button
              className={styles.exportButton}
              onClick={exportToExcel}
              disabled={sortedStudents.length === 0}
              aria-label="ส่งออกข้อมูลเป็น Excel"
            >
              <Upload className={styles.icon} /> Export Excel
            </button>

            <input
              type="text"
              placeholder="ค้นหา ชื่อ, รหัส, อีเมล, สาขา..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className={styles.studentsSearch}
              aria-label="ค้นหาข้อมูล"
            />

            <select
              className={styles.studentsSelect}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="เรียงลำดับตาม"
            >
              <option value="">เรียงลำดับตาม</option>
              <option value="name">ชื่อ-นามสกุล</option>
              <option value="code">รหัสนักศึกษา</option>
              <option value="email">อีเมล</option>
              <option value="academicYear">ปีการศึกษา</option>
              <option value="department">สาขา</option>
              <option value="faculty">คณะ</option>
              <option value="regisTime">วันที่เพิ่มในระบบ</option>
            </select>

            {sortBy && (
              <select
                className={styles.studentsSelect}
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                aria-label="ลำดับการเรียง"
              >
                <option value="asc">น้อยไปมาก (A-Z)</option>
                <option value="desc">มากไปน้อย (Z-A)</option>
              </select>
            )}

            <select
              className={styles.studentsSelect}
              value={facultyFilter}
              onChange={(e) => {
                setFacultyFilter(e.target.value);
                setDepartmentFilter("");
                setCurrentPage(1);
              }}
              aria-label="กรองตามคณะ"
            >
              <option value="">ทุกคณะ</option>
              {faculties.map((faculty) => (
                <option key={faculty.Faculty_ID} value={faculty.Faculty_Name}>
                  {faculty.Faculty_Name}
                </option>
              ))}
            </select>

            <select
              className={styles.studentsSelect}
              value={departmentFilter}
              onChange={(e) => {
                setDepartmentFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="กรองตามสาขา"
            >
              <option value="">ทุกสาขา</option>
              {departments
                .filter(dept => !facultyFilter ||
                  dept.Faculty_Name === facultyFilter
                )
                .map((dept) => (
                  <option key={dept.Department_ID} value={dept.Department_Name}>
                    {dept.Department_Name}
                  </option>
                ))}
            </select>

            <select
              className={styles.studentsSelect}
              value={academicYearFilter}
              onChange={(e) => {
                setAcademicYearFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="กรองตามปีการศึกษา"
            >
              <option value="">ทุกปีการศึกษา</option>
              {Array.from(new Set(students.map(s => s.academicYear).filter(Boolean))).sort().map((year, idx) => (
                <option key={idx} value={year}>
                  {year}
                </option>
              ))}
            </select>

            <select
              className={styles.studentsSelect}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="กรองตามสถานะ"
            >
              <option value="">ทุกสถานะ</option>
              <option value="active">ใช้งาน</option>
              <option value="inactive">ระงับ</option>
              <option value="graduated">สำเร็จการศึกษา</option>
              <option value="not_graduated">ยังไม่สำเร็จการศึกษา</option>
            </select>

            {(searchQuery || facultyFilter || departmentFilter || academicYearFilter || statusFilter || sortBy) && (
              <button
                className={styles.resetButton}
                onClick={resetFilters}
                aria-label="ล้างฟิลเตอร์ทั้งหมด"
              >
                <X className={styles.iconSmall} style={{ marginRight: '5px' }} />
                ล้างฟิลเตอร์
              </button>
            )}
          </div>

          {/* Results Summary */}
          <div className={styles.resultsSummary}>
            <span>พบ {sortedStudents.length} รายการ</span>
            {sortBy && (
              <span className={styles.searchSummary}>
                เรียงตาม{sortBy === 'name' ? 'ชื่อ-นามสกุล' :
                  sortBy === 'code' ? 'รหัสนักศึกษา' :
                    sortBy === 'email' ? 'อีเมล' :
                      sortBy === 'academicYear' ? 'ปีการศึกษา' :
                        sortBy === 'department' ? 'สาขา' :
                          sortBy === 'faculty' ? 'คณะ' :
                            sortBy === 'regisTime' ? 'วันที่เพิ่มในระบบ' : sortBy}
                ({sortOrder === 'asc' ? 'น้อยไปมาก' : 'มากไปน้อย'})
              </span>
            )}
          </div>

          <div className={styles.studentsTableWrapper}>
            <table className={styles.studentsTable} role="table">
              <thead>
                <tr>
                  <th scope="col">รหัสนักศึกษา</th>
                  <th scope="col">ชื่อ-นามสกุล</th>
                  <th scope="col">คณะ</th>
                  <th scope="col">สาขา</th>
                  <th scope="col">ปีการศึกษา</th>
                  <th scope="col">อีเมล</th>
                  <th scope="col">วันที่เพิ่มในระบบ</th>
                  <th scope="col">สำเร็จการศึกษา</th>
                  <th scope="col">สถานะไอดี</th>
                  <th scope="col">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.map(student => (
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
                    <td>
                      <span className={styles.eventTag} title={student.faculty}>
                        {student.faculty === "คณะบริหารธุรกิจและเทคโนโลยีสารสนเทศ" ? "บธ.สท." : "ศิลปศาสตร์"}
                      </span>
                    </td>
                    <td>
                      <span className={styles.eventTag} title={student.department}>
                        {getDepartmentDisplay(student.department)}
                      </span>
                    </td>
                    <td>{student.academicYear}</td>
                    <td title={student.email}>{student.email}</td>
                    <td>{formatDate(student.regisTime)}</td>
                    <td>
                      <span className={`${styles.badgeType} ${student.isGraduated ? styles.graduated : styles.notGraduated}`}>
                        {student.isGraduated ? "สำเร็จการศึกษา" : "ยังไม่สำเร็จการศึกษา"}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.badgeType} ${student.isActive ? styles.active : styles.inactive}`}>
                        {student.isActive ? "ใช้งาน" : "ระงับ"}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={styles.viewBtn}
                          onClick={() => {
                            navigate('/name-register/users-detail', {
                              state: { student }
                            });
                          }}
                          aria-label={`ดูรายละเอียดนักศึกษา ${student.code}`}
                        >
                          <Eye className={styles.iconSmall} />
                        </button>
                        <button className={styles.editBtn}>
                          <Edit className={styles.iconSmall} />
                        </button>
                        <button className={styles.deleteBtn}>
                          <Ban className={styles.iconSmall} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {currentRows.length === 0 && (
                  <tr>
                    <td colSpan="10" style={{ textAlign: "center", padding: "20px" }}>
                      {sortedStudents.length === 0 && students.length > 0
                        ? "ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา"
                        : "ไม่มีข้อมูลนักศึกษา"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={styles.pagination} role="navigation" aria-label="การแบ่งหน้า">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                aria-label="หน้าก่อนหน้า"
              >
                Previous
              </button>
              {pageNumbers.map(number => (
                <button
                  key={number}
                  className={currentPage === number ? styles.activePage : ""}
                  onClick={() => setCurrentPage(number)}
                  aria-label={`หน้า ${number}`}
                  aria-current={currentPage === number ? 'page' : undefined}
                >
                  {number}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                aria-label="หน้าถัดไป"
              >
                Next
              </button>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}

export default AdminAllStudents;