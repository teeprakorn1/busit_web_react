import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { format } from 'date-fns';
import styles from "./NavigationBar.module.css";
import Logo from "../../assets/logo/busitplus_logo.png";
import { encryptValue, decryptValue } from "../../utils/crypto";
import { ReactComponent as MainIcon } from "../../assets/icons/main_icon.svg";
import { ReactComponent as DashboardIcon } from "../../assets/icons/dashboard_icon.svg";
import { ReactComponent as ActivityIcon } from "../../assets/icons/activity_icon.svg";
import { ReactComponent as ApplicationIcon } from "../../assets/icons/application_icon.svg";
import { ReactComponent as NameRegisterIcon } from "../../assets/icons/name_register_icon.svg";
import { ReactComponent as StaffManagementIcon } from "../../assets/icons/staff_management_icon.svg";
import { ReactComponent as LogoutIcon } from "../../assets/icons/logout_icon.svg";
import { ReactComponent as MenuIcon } from "../../assets/icons/menu_icon.svg";
import CustomModal from "../../services/CustomModal";
import axios from "axios";

const getApiUrl = (endpoint) => {
  return `${process.env.REACT_APP_SERVER_PROTOCOL}${process.env.REACT_APP_SERVER_BASE_URL}${process.env.REACT_APP_SERVER_PORT}${endpoint}`;
};

const NavigationBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [activePath, setActivePath] = useState(location.pathname);
  const [isCollapsed, setIsCollapsed] = useState(window.innerWidth <= 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const [Data_UsersType, setUsersType] = useState("");
  const [Data_Email, setEmail] = useState("");
  const [isLoadingUserType, setIsLoadingUserType] = useState(true);
  const [Admin, setAdmin] = useState({ firstName: "", lastName: "", typeName: "" });

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setIsCollapsed(mobile);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const closeNavbarOnMobile = () => {
    if (isMobile) setIsCollapsed(true);
  };

  const fetchAdminData = useCallback(async () => {
  // ดึงค่า session ก่อน decrypt
  const sessionAdminRaw = sessionStorage.getItem("admin");
  let sessionAdmin = null;

  if (sessionAdminRaw) {
    try {
      // decrypt และ parse JSON
      sessionAdmin = JSON.parse(decryptValue(sessionAdminRaw));
    } catch (err) {
      console.error("Failed to decrypt session admin:", err);
      sessionAdmin = null;
      sessionStorage.removeItem("admin"); // ลบข้อมูลที่เสียหาย
    }
  }

  if (sessionAdmin) {
    setAdmin(sessionAdmin);

    const sessionUsersTypeRaw = sessionStorage.getItem("UsersType");
    if (sessionUsersTypeRaw) {
      try {
        const usersType = decryptValue(sessionUsersTypeRaw);
        setUsersType(usersType);
      } catch (err) {
        console.error("Failed to decrypt UsersType:", err);
        sessionStorage.removeItem("UsersType");
      }
    }

    setIsLoadingUserType(false);
    return;
  }

  // ถ้าไม่มี session หรือ decrypt ล้มเหลว ให้ fetch จาก server
  try {
    const verifyResponse = await axios.post(
      getApiUrl(process.env.REACT_APP_API_VERIFY),
      {},
      { withCredentials: true }
    );

    if (!verifyResponse.data.status) throw new Error("Invalid token");

    const { Users_Type, Users_Email } = verifyResponse.data;
    setUsersType(Users_Type);
    setEmail(Users_Email);
    sessionStorage.setItem("UsersType", encryptValue(Users_Type));

    const profileResponse = await axios.get(
      getApiUrl(process.env.REACT_APP_API_ADMIN_GET_WEBSITE),
      { withCredentials: true }
    );

    if (profileResponse.data.status) {
      const profile = profileResponse.data;
      let firstName = "";
      let lastName = "";
      let typeName = "";

      if (profile.Users_Type_Table === "teacher") {
        firstName = profile.Teacher_FirstName || "";
        lastName = profile.Teacher_LastName || "";
        typeName = "Teacher";
      } else if (profile.Users_Type_Table === "staff") {
        firstName = profile.Staff_FirstName || "";
        lastName = profile.Staff_LastName || "";
        typeName = "Staff";
      } else {
        firstName = profile.Staff_FirstName || profile.Teacher_FirstName || "Unknown";
        lastName = profile.Staff_LastName || profile.Teacher_LastName || "Unknown";
        typeName = profile.Users_Type_Table || "Unknown";
      }

      const adminData = { firstName, lastName, typeName };
      setAdmin(adminData);

      sessionStorage.setItem("admin", encryptValue(JSON.stringify(adminData)));
    } else {
      setAdmin({ firstName: "Unknown", lastName: "Unknown", typeName: "Unknown" });
    }
  } catch (err) {
    console.error(err);
    navigate("/login");
  } finally {
    setIsLoadingUserType(false);
  }
}, [navigate]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  useEffect(() => {
    setActivePath(location.pathname);
  }, [location.pathname]);

  const handleNavigation = (path) => {
    if (isLoadingUserType) {
      setAlertMessage("กำลังโหลดข้อมูลผู้ใช้ โปรดลองอีกครั้งในภายหลัง.");
      setIsAlertModalOpen(true);
      return closeNavbarOnMobile();
    }

    const userType = Data_UsersType?.trim().toLowerCase() || "";

    const allowedPaths = ["/main", "/dashboard", "/activity", "/application", "/name-register", "/staff-management"];
    if (!allowedPaths.includes(path)) {
      setAlertMessage("หน้าที่คุณเข้าถึงไม่ถูกต้อง.");
      setIsAlertModalOpen(true);
      return closeNavbarOnMobile();
    }

    if (userType === "staff") {
      setActivePath(path);
      navigate(path);
      return closeNavbarOnMobile();
    }

    const restrictedForTeacher = ["/activity", "/staff-management", "/application"];
    if (userType === "teacher" && restrictedForTeacher.includes(path)) {
      setAlertMessage("คุณไม่มีสิทธิ์เข้าถึงหน้านี้.");
      setIsAlertModalOpen(true);
      return closeNavbarOnMobile();
    }


    if (userType !== "teacher" && userType !== "staff") {
      const allowedForOther = ["/main", "/dashboard", "/name-register"];
      if (!allowedForOther.includes(path)) {
        setAlertMessage("คุณไม่มีสิทธิ์เข้าถึงหน้านี้.");
        setIsAlertModalOpen(true);
        return closeNavbarOnMobile();
      }
    }

    setActivePath(path);
    navigate(path);
    closeNavbarOnMobile();
  };

  const handleLogout = async () => {
    try {
      const currentTimestamp = format(new Date(), 'dd/MM/yyyy HH:mm:ss');
      const message = `Logout success use by ${Data_Email} at ${currentTimestamp} In Website.`;

      await axios.post(
        getApiUrl(process.env.REACT_APP_API_TIMESTAMP_WEBSITE_INSERT),
        {
          Timestamp_Name: message,
          TimestampType_ID: 4
        },
        { withCredentials: true }
      );

      await axios.post(getApiUrl(process.env.REACT_APP_API_LOGOUT_WEBSITE), {}, { withCredentials: true });

    } catch (err) {
      console.error(err);
    }

    setIsLogoutModalOpen(false);
    sessionStorage.removeItem("admin");
    sessionStorage.removeItem("UsersType");
    sessionStorage.removeItem("userSession");
    navigate("/login");
    closeNavbarOnMobile();
  };

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
    closeNavbarOnMobile();
  };

  return (
    <>
      {isMobile && (
        <div className={styles.hamburger} onClick={() => setIsCollapsed(!isCollapsed)}>
          <MenuIcon width="24" height="24" />
        </div>
      )}

      <div className={`${styles.navbar} ${isCollapsed ? styles.collapsed : styles.expanded}`}>
        <div className={styles.logoContainer} onClick={() => handleNavigation("/main")}>
          <img src={Logo} alt="BusitPlus Logo" className={styles.logo} />
        </div>

        <div className={styles.RuleLabel}>{Admin.typeName}</div>
        <div className={styles.adminName}>{Admin.firstName} {Admin.lastName}</div>
        <div className={styles.linearBlank}></div>

        <ul className={styles.navbarList}>
          <li className={`${styles.navbarItem} ${activePath === "/main" ? styles.active : ""}`} onClick={() => handleNavigation("/main")}>
            <span className={styles.navbarLink}><MainIcon width="20" height="20" /> หน้าหลัก</span>
          </li>
          <li className={`${styles.navbarItem} ${activePath === "/dashboard" ? styles.active : ""}`} onClick={() => handleNavigation("/dashboard")}>
            <span className={styles.navbarLink}><DashboardIcon width="20" height="20" /> แดชบอร์ด</span>
          </li>
          <li className={`${styles.navbarItem} ${activePath === "/activity" ? styles.active : ""}`} onClick={() => handleNavigation("/activity")}>
            <span className={styles.navbarLink}><ActivityIcon width="20" height="20" /> จัดการกิจกรรม</span>
          </li>
          <li className={`${styles.navbarItem} ${activePath === "/application" ? styles.active : ""}`} onClick={() => handleNavigation("/application")}>
            <span className={styles.navbarLink}><ApplicationIcon width="20" height="20" /> จัดการแอปพลิเคชัน</span>
          </li>
          <li className={`${styles.navbarItem} ${activePath === "/name-register" ? styles.active : ""}`} onClick={() => handleNavigation("/name-register")}>
            <span className={styles.navbarLink}><NameRegisterIcon width="20" height="20" /> ทะเบียนรายชื่อ</span>
          </li>
          <li className={`${styles.navbarItem} ${activePath === "/staff-management" ? styles.active : ""}`} onClick={() => handleNavigation("/staff-management")}>
            <span className={styles.navbarLink}><StaffManagementIcon width="20" height="20" /> จัดการเจ้าหน้าที่</span>
          </li>
        </ul>

        <div className={styles.logoutButton} onClick={handleLogoutClick}>
          <LogoutIcon width="20" height="20" />
          <span>Logout</span>
        </div>
      </div>

      <CustomModal
        isOpen={isLogoutModalOpen}
        message="คุณแน่ใจว่าต้องการออกจากระบบใช่ไหม?"
        buttons={[
          { label: "ไม่", onClick: () => setIsLogoutModalOpen(false), className: styles.cancelButton },
          { label: "ยืนยัน", onClick: handleLogout, className: styles.confirmButton }
        ]}
      />

      <CustomModal
        isOpen={isAlertModalOpen}
        message={alertMessage}
        onClose={() => setIsAlertModalOpen(false)}
      />
    </>
  );
};

export default NavigationBar;