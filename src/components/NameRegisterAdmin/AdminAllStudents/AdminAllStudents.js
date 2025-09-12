import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Navbar from '../../NavigationBar/NavigationBar';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './AdminAllStudents.module.css';
import { AlertCircle, Loader, Calendar, GraduationCap, User, Eye, Edit, Ban } from 'lucide-react';
import { FiBell } from 'react-icons/fi';
import axios from 'axios';

import StudentFiltersForm from './StudentFiltersForm/StudentFiltersForm';
import { academicYearUtils } from './utils/academicYearUtils';
import { exportFilteredStudentsToExcel } from './utils/excelExportUtils';

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
  const [notifyOpen, setNotifyOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [facultyFilter, setFacultyFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [academicYearFilter, setAcademicYearFilter] = useState("");
  const [yearRangeFilter, setYearRangeFilter] = useState("");
  const [studentYearFilter, setStudentYearFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showBuddhistYear, setShowBuddhistYear] = useState(true);

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

  const availableAcademicYears = useMemo(() => {
    const years = Array.from(new Set(students.map(s => s.academicYear).filter(Boolean)))
      .sort((a, b) => b - a);
    return years;
  }, [students]);

  const availableStudentYears = useMemo(() => {
    const years = Array.from(new Set(students.map(s =>
      academicYearUtils.calculateStudentYear(s.academicYear)
    ).filter(Boolean))).sort();
    return years;
  }, [students]);

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
          isActive: student.Users.Users_IsActive,
          studentYear: academicYearUtils.calculateStudentYear(student.Student_AcademicYear),
          academicYearBuddhist: academicYearUtils.convertToBuddhistYear(student.Student_AcademicYear)
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

  const filteredStudents = useMemo(() => {
    if (!Array.isArray(students)) return [];

    return academicYearUtils.filterByYearCriteria(students, {
      academicYear: academicYearFilter,
      studentYear: studentYearFilter,
      yearRange: yearRangeFilter
    }).filter(student => {
      if (!student) return false;

      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || [
        student.firstName,
        student.lastName,
        student.code,
        student.email,
        student.department,
        student.academicYear?.toString(),
        student.studentYear
      ].some(field =>
        field && field.toString().toLowerCase().includes(query)
      );

      const matchesFaculty = !facultyFilter || student.faculty === facultyFilter;
      const matchesDepartment = !departmentFilter || student.department === departmentFilter;

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

      return matchesSearch && matchesFaculty && matchesDepartment && matchesStatus;
    });
  }, [students, searchQuery, facultyFilter, departmentFilter, academicYearFilter,
    studentYearFilter, yearRangeFilter, statusFilter]);

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
          aValue = parseInt(a.academicYear);
          bValue = parseInt(b.academicYear);
          break;
        case 'studentYear':
          const getYearNumber = (yearStr) => {
            if (yearStr === 'ยังไม่เริ่มเรียน') return -1;
            if (yearStr === 'มากกว่าปี 4') return 5;
            const match = yearStr.match(/ปี (\d+)/);
            return match ? parseInt(match[1]) : 0;
          };
          aValue = getYearNumber(a.studentYear);
          bValue = getYearNumber(b.studentYear);
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

  const handleExportToExcel = useCallback(() => {
    const filterInfo = {
      คณะ: facultyFilter,
      สาขา: departmentFilter,
      ปีการศึกษา: academicYearFilter,
      ชั้นปี: studentYearFilter,
      ช่วงปี: yearRangeFilter,
      สถานะ: statusFilter,
      คำค้นหา: searchQuery
    };

    return exportFilteredStudentsToExcel(sortedStudents, filterInfo);
  }, [sortedStudents, facultyFilter, departmentFilter, academicYearFilter,
    studentYearFilter, yearRangeFilter, statusFilter, searchQuery]);

  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setFacultyFilter("");
    setDepartmentFilter("");
    setAcademicYearFilter("");
    setYearRangeFilter("");
    setStudentYearFilter("");
    setStatusFilter("");
    setSortBy("");
    setSortOrder("asc");
    setCurrentPage(1);
    navigate({
      pathname: location.pathname,
      search: ""
    });
  }, [navigate, location.pathname]);

  const handleAddStudent = useCallback(() => {
    navigate('/admin/students/add');
  }, [navigate]);

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
              <div className={styles.summaryStats}>
                <span className={styles.statItem}>
                  <GraduationCap className={styles.iconSmall} />
                  ทั้งหมด: {students.length} คน
                </span>
                <span className={styles.statItem}>
                  <Calendar className={styles.iconSmall} />
                  ปีการศึกษา: {availableAcademicYears.length} ปี
                </span>
              </div>
            </div>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.yearToggle}>
              <button
                className={`${styles.toggleBtn} ${showBuddhistYear ? styles.active : ''}`}
                onClick={() => setShowBuddhistYear(true)}
                title="แสดงปี พ.ศ."
              >
                พ.ศ.
              </button>
              <button
                className={`${styles.toggleBtn} ${!showBuddhistYear ? styles.active : ''}`}
                onClick={() => setShowBuddhistYear(false)}
                title="แสดงปี ค.ศ."
              >
                ค.ศ.
              </button>
            </div>

            <div className={styles.notifyWrapper}>
              <button
                className={styles.notifyButton}
                onClick={() => setNotifyOpen(!notifyOpen)}
              >
                <FiBell size={24} />
                {notifications.length > 0 && (
                  <span className={styles.badge}>
                    {notifications.length}
                  </span>
                )}
              </button>

              {notifyOpen && (
                <div className={styles.notifyDropdown}>
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

        {/* Filters and Table Section */}
        <div className={styles.studentsSection}>
          <StudentFiltersForm
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            facultyFilter={facultyFilter}
            setFacultyFilter={setFacultyFilter}
            departmentFilter={departmentFilter}
            setDepartmentFilter={setDepartmentFilter}
            academicYearFilter={academicYearFilter}
            setAcademicYearFilter={setAcademicYearFilter}
            yearRangeFilter={yearRangeFilter}
            setYearRangeFilter={setYearRangeFilter}
            studentYearFilter={studentYearFilter}
            setStudentYearFilter={setStudentYearFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            showBuddhistYear={showBuddhistYear}
            faculties={faculties}
            departments={departments}
            availableAcademicYears={availableAcademicYears}
            availableStudentYears={availableStudentYears}
            sortedStudents={sortedStudents}
            exportToExcel={handleExportToExcel}
            resetFilters={resetFilters}
            setCurrentPage={setCurrentPage}
            onAddStudent={handleAddStudent}
          />

          {/* Results Summary */}
          <div className={styles.resultsSummary}>
            <span>พบ {sortedStudents.length} รายการ</span>
            {sortBy && (
              <span className={styles.searchSummary}>
                เรียงตาม{sortBy === 'name' ? 'ชื่อ-นามสกุล' :
                  sortBy === 'code' ? 'รหัสนักศึกษา' :
                    sortBy === 'email' ? 'อีเมล' :
                      sortBy === 'academicYear' ? 'ปีการศึกษา' :
                        sortBy === 'studentYear' ? 'ชั้นปี' :
                          sortBy === 'department' ? 'สาขา' :
                            sortBy === 'faculty' ? 'คณะ' :
                              sortBy === 'regisTime' ? 'วันที่เพิ่มในระบบ' : sortBy}
                ({sortOrder === 'asc' ? 'น้อยไปมาก' : 'มากไปน้อย'})
              </span>
            )}
            {(academicYearFilter || studentYearFilter || yearRangeFilter) && (
              <span className={styles.filterSummary}>
                {academicYearFilter && `ปีการศึกษา: ${academicYearFilter} `}
                {studentYearFilter && `ชั้นปี: ${studentYearFilter} `}
                {yearRangeFilter && `ช่วง: ${yearRangeFilter === 'current' ? 'ปีปัจจุบัน' :
                  yearRangeFilter === 'recent' ? '3 ปีล่าสุด' :
                    yearRangeFilter === 'old' ? 'มากกว่า 3 ปี' :
                      yearRangeFilter === 'graduated_eligible' ? 'ควรจบแล้ว' : ''
                  }`}
              </span>
            )}
          </div>

          {/* Students Table */}
          <div className={styles.studentsTableWrapper}>
            <table className={styles.studentsTable}>
              <thead>
                <tr>
                  <th>รหัสนักศึกษา</th>
                  <th>ชื่อ-นามสกุล</th>
                  <th>คณะ</th>
                  <th>สาขา</th>
                  <th>
                    ปีการศึกษา ({showBuddhistYear ? 'พ.ศ.' : 'ค.ศ.'})
                  </th>
                  <th>อีเมล</th>
                  <th>วันที่เพิ่มในระบบ</th>
                  <th>สำเร็จการศึกษา</th>
                  <th>สถานะไอดี</th>
                  <th>จัดการ</th>
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
                        {student.faculty === "คณะบริหารธุรกิจและเทคโนโลยีสารสนเทศ"
                          ? "บธ.สท."
                          : "ศิลปศาสตร์"}
                      </span>
                    </td>
                    <td>
                      <span className={styles.eventTag} title={student.department}>
                        {getDepartmentDisplay(student.department)}
                      </span>
                    </td>
                    <td>
                      <div className={styles.academicYearCell}>
                        <span className={styles.primaryYear}>
                          {showBuddhistYear ? student.academicYearBuddhist : student.academicYear}
                        </span>
                        <span className={styles.secondaryYear}>
                          ({showBuddhistYear ? student.academicYear : student.academicYearBuddhist})
                        </span>
                      </div>
                    </td>
                    <td title={student.email}>{student.email}</td>
                    <td>{formatDate(student.regisTime)}</td>
                    <td>
                      <span
                        className={`${styles.badgeType} ${student.isGraduated ? styles.graduated : styles.notGraduated}`}
                      >
                        {student.isGraduated ? "สำเร็จการศึกษา" : "ยังไม่สำเร็จการศึกษา"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`${styles.badgeType} ${student.isActive ? styles.active : styles.inactive}`}
                      >
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
          {sortedStudents.length > rowsPerPage && (
            <div className={styles.pagination}>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                <button
                  key={number}
                  className={currentPage === number ? styles.activePage : ""}
                  onClick={() => setCurrentPage(number)}
                >
                  {number}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
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