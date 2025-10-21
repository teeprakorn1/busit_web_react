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
import CustomModal from "../../services/CustomModal/CustomModal";
import axios from "axios";

const getApiUrl = (endpoint) => {
  return `${process.env.REACT_APP_SERVER_PROTOCOL}${process.env.REACT_APP_SERVER_BASE_URL}${process.env.REACT_APP_SERVER_PORT}${endpoint}`;
};

const CACHE_DURATION = 5 * 60 * 1000;

const NavigationBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [activePath, setActivePath] = useState(location.pathname);
  const [isCollapsed, setIsCollapsed] = useState(window.innerWidth <= 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const [Data_UsersType, setUsersType] = useState("");
  const [Data_Email, setEmail] = useState("");
  const [isLoadingUserType, setIsLoadingUserType] = useState(true);
  const [Admin, setAdmin] = useState({ firstName: "", lastName: "", typeName: "", isDean: false });

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const [profileCache, setProfileCache] = useState(null);
  const [lastProfileFetch, setLastProfileFetch] = useState(0);

  const [visibleMenuItems, setVisibleMenuItems] = useState([]);

  const allMenuItems = React.useMemo(() => [
    { path: "/main", label: "หน้าหลัก", icon: MainIcon },
    { path: "/dashboard", label: "แดชบอร์ด", icon: DashboardIcon },
    { path: "/activity-management", label: "จัดการกิจกรรม", icon: ActivityIcon },
    { path: "/application", label: "จัดการแอปพลิเคชัน", icon: ApplicationIcon },
    { path: "/name-register", label: "ทะเบียนรายชื่อ", icon: NameRegisterIcon },
    { path: "/staff-management", label: "จัดการเจ้าหน้าที่", icon: StaffManagementIcon }
  ], []);

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

  const closeNavbarOnMobile = useCallback(() => {
    if (isMobile) setIsCollapsed(true);
  }, [isMobile]);

  const parseProfileData = useCallback((profile) => {
    let firstName = "";
    let lastName = "";
    let typeName = "";
    let isDean = false;

    if (profile.Users_Type_Table === "teacher") {
      firstName = profile.Teacher_FirstName || "";
      lastName = profile.Teacher_LastName || "";
      isDean = Boolean(profile.Teacher_IsDean);
      typeName = isDean ? "Dean" : "Teacher";
    } else if (profile.Users_Type_Table === "staff") {
      firstName = profile.Staff_FirstName || "";
      lastName = profile.Staff_LastName || "";
      typeName = "Staff";
    } else {
      firstName = profile.Staff_FirstName || profile.Teacher_FirstName || "Unknown";
      lastName = profile.Staff_LastName || profile.Teacher_LastName || "Unknown";
      typeName = profile.Users_Type_Table || "Unknown";
    }

    return { firstName, lastName, typeName, isDean };
  }, []);

  const verifyUserToken = useCallback(async () => {
    try {
      const verifyResponse = await axios.post(
        getApiUrl(process.env.REACT_APP_API_VERIFY),
        {},
        { withCredentials: true }
      );

      if (!verifyResponse.data.status) {
        throw new Error("Invalid token");
      }

      const { Users_Type, Users_Email } = verifyResponse.data;
      setUsersType(Users_Type);
      setEmail(Users_Email);

      sessionStorage.setItem("UsersType", encryptValue(Users_Type));
      sessionStorage.setItem("UsersEmail", encryptValue(Users_Email));

      return { Users_Type, Users_Email };
    } catch (error) {
      console.error("Token verification failed:", error);
      throw error;
    }
  }, []);

  const getUserProfile = useCallback(async (useCache = true) => {
    const now = Date.now();

    if (useCache && profileCache && (now - lastProfileFetch) < CACHE_DURATION) {
      return profileCache;
    }

    try {
      const profileResponse = await axios.get(
        getApiUrl(process.env.REACT_APP_API_ADMIN_GET_WEBSITE),
        { withCredentials: true }
      );

      if (profileResponse.data.status) {
        const profile = profileResponse.data;
        const profileData = parseProfileData(profile);

        setProfileCache(profileData);
        setLastProfileFetch(now);

        return profileData;
      } else {
        throw new Error("Failed to get profile");
      }
    } catch (error) {
      console.error("Profile fetch failed:", error);
      return { firstName: "Unknown", lastName: "Unknown", typeName: "Unknown" };
    }
  }, [profileCache, lastProfileFetch, parseProfileData]);

  const loadSessionData = useCallback(() => {
    try {
      const sessionAdminRaw = sessionStorage.getItem("admin");
      const sessionUsersTypeRaw = sessionStorage.getItem("UsersType");
      const sessionEmailRaw = sessionStorage.getItem("UsersEmail");

      let sessionAdmin = null;
      let sessionUsersType = null;
      let sessionEmail = null;

      if (sessionAdminRaw) {
        try {
          sessionAdmin = JSON.parse(decryptValue(sessionAdminRaw));
        } catch (err) {
          console.warn("Failed to decrypt session admin:", err);
          sessionStorage.removeItem("admin");
        }
      }

      if (sessionUsersTypeRaw) {
        try {
          sessionUsersType = decryptValue(sessionUsersTypeRaw);
        } catch (err) {
          console.warn("Failed to decrypt UsersType:", err);
          sessionStorage.removeItem("UsersType");
        }
      }

      if (sessionEmailRaw) {
        try {
          sessionEmail = decryptValue(sessionEmailRaw);
        } catch (err) {
          console.warn("Failed to decrypt UsersEmail:", err);
          sessionStorage.removeItem("UsersEmail");
        }
      }

      return { sessionAdmin, sessionUsersType, sessionEmail };
    } catch (error) {
      console.error("Error loading session data:", error);
      return { sessionAdmin: null, sessionUsersType: null, sessionEmail: null };
    }
  }, []);

  const fetchAdminData = useCallback(async () => {
    setIsLoadingUserType(true);

    try {
      const { sessionAdmin, sessionUsersType, sessionEmail } = loadSessionData();
      if (sessionAdmin && sessionUsersType && sessionEmail) {
        setAdmin(sessionAdmin);
        setUsersType(sessionUsersType);
        setEmail(sessionEmail);
        setIsLoadingUserType(false);
        return;
      }

      await verifyUserToken();
      const profileData = await getUserProfile(false);

      setAdmin(profileData);
      sessionStorage.setItem("admin", encryptValue(JSON.stringify(profileData)));

    } catch (error) {
      console.error("Failed to fetch admin data:", error);
      sessionStorage.removeItem("admin");
      sessionStorage.removeItem("UsersType");
      sessionStorage.removeItem("UsersEmail");
      navigate("/login");
    } finally {
      setIsLoadingUserType(false);
    }
  }, [navigate, getUserProfile, verifyUserToken, loadSessionData]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  useEffect(() => {
    setActivePath(location.pathname);
  }, [location.pathname]);

  const checkPermission = (path, userType) => {
    const allowedPaths = ["/main", "/dashboard", "/activity-management", "/application", "/name-register", "/staff-management"];

    if (!allowedPaths.includes(path)) {
      return { allowed: false, message: "หน้าที่คุณเข้าถึงไม่ถูกต้อง." };
    }

    const normalizedUserType = userType?.trim().toLowerCase() || "";
    if (normalizedUserType === "staff") {
      return { allowed: true };
    }

    if (normalizedUserType === "teacher") {
      const restrictedForTeacher = ["/activity-management", "/staff-management", "/application"];
      if (restrictedForTeacher.includes(path)) {
        return { allowed: false, message: "คุณไม่มีสิทธิ์เข้าถึงหน้านี้." };
      }
      return { allowed: true };
    }

    const allowedForOther = ["/main", "/dashboard", "/name-register"];
    if (!allowedForOther.includes(path)) {
      return { allowed: false, message: "คุณไม่มีสิทธิ์เข้าถึงหน้านี้." };
    }

    return { allowed: true };
  };

  const filterMenuByPermission = useCallback((userType) => {
    return allMenuItems.filter(item => {
      const permission = checkPermission(item.path, userType);
      return permission.allowed;
    });
  }, [allMenuItems]);

  useEffect(() => {
    if (Data_UsersType && !isLoadingUserType) {
      const filteredMenu = filterMenuByPermission(Data_UsersType);
      setVisibleMenuItems(filteredMenu);
    }
  }, [Data_UsersType, isLoadingUserType, filterMenuByPermission]);

  const handleNavigation = (path) => {
    if (isLoadingUserType) {
      setAlertMessage("กำลังโหลดข้อมูลผู้ใช้ โปรดลองอีกครั้งในภายหลัง.");
      setIsAlertModalOpen(true);
      closeNavbarOnMobile();
      return;
    }

    const permission = checkPermission(path, Data_UsersType);

    if (!permission.allowed) {
      setAlertMessage(permission.message);
      setIsAlertModalOpen(true);
      closeNavbarOnMobile();
      return;
    }

    setActivePath(path);
    navigate(path);
    closeNavbarOnMobile();
  };

  const insertLogoutTimestamp = useCallback(async () => {
    try {
      const currentTimestamp = format(new Date(), 'dd/MM/yyyy HH:mm:ss');
      const message = `Logout success use by ${Data_Email.split('@')[0]} at ${currentTimestamp} In Website.`;

      await axios.post(
        getApiUrl(process.env.REACT_APP_API_TIMESTAMP_WEBSITE_INSERT),
        {
          Timestamp_Name: message,
          TimestampType_ID: 4
        },
        { withCredentials: true }
      );
    } catch (error) {
      console.warn("Failed to insert logout timestamp:", error);
    }
  }, [Data_Email]);

  const handleLogout = async () => {
    try {
      await Promise.all([
        insertLogoutTimestamp(),
        axios.post(getApiUrl(process.env.REACT_APP_API_LOGOUT_WEBSITE), {}, { withCredentials: true })
      ]);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLogoutModalOpen(false);
      sessionStorage.removeItem("admin");
      sessionStorage.removeItem("UsersType");
      sessionStorage.removeItem("UsersEmail");
      sessionStorage.removeItem("userSession");

      setProfileCache(null);
      setLastProfileFetch(0);

      navigate("/login");
      closeNavbarOnMobile();
    }
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
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li
                key={item.path}
                className={`${styles.navbarItem} ${activePath === item.path ? styles.active : ""}`}
                onClick={() => handleNavigation(item.path)}
              >
                <span className={styles.navbarLink}>
                  <Icon width="20" height="20" />
                  {item.label}
                </span>
              </li>
            );
          })}
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