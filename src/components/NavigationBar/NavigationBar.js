import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Modal from "react-modal";
import styles from "./NavigationBar.module.css";
import { ReactComponent as DashboardIcon } from "../../assets/icons/dashboard-icon.svg";
import { ReactComponent as EmployeeIcon } from "../../assets/icons/employee-icon.svg";
import { ReactComponent as AddAdminIcon } from "../../assets/icons/add-employee-icon.svg";
import { ReactComponent as LogoutIcon } from "../../assets/icons/logout-icon.svg";
import { decryptToken , encryptToken } from '../../utils/crypto';
import axios from "axios";

Modal.setAppElement("#root");

const NavigationBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activePath, setActivePath] = useState(location.pathname);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [Data_typeId, setTypeid] = useState("");
  const [employee, setEmployee] = useState({ firstName: "", lastName: "", typeName: "" });

  const fetchEmployeeData = useCallback(async () => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) return navigate("/login");

    const decryptedToken = decryptToken(storedToken);

    const sessionEmployee = sessionStorage.getItem("employee");
    if (sessionEmployee) {
      const decryptedEmployee = decryptToken(sessionEmployee);
      setEmployee(JSON.parse(decryptedEmployee));
      return;
    }

    try {
      const verifyResponse = await axios.post(
        `${process.env.REACT_APP_BASE_URL}${process.env.REACT_APP_API_VERIFY}`,
        {},
        {
          headers: { "Content-Type": "application/json", "x-access-token": decryptedToken },
        }
      );
      if (!verifyResponse.data.status) throw new Error("Invalid token");
      const { Employee_ID } = verifyResponse.data;
      const typeid = verifyResponse.data.EmployeeType_ID;
      const encryptedTypeId = encryptToken(typeid.toString());
      localStorage.setItem("typeid", encryptedTypeId);
      setTypeid(typeid);

      const employeeResponse = await axios.get(
        `${process.env.REACT_APP_BASE_URL}${process.env.REACT_APP_API_EMPLOYEE}${Employee_ID}`,
        {
          headers: { "Content-Type": "application/json", "x-access-token": decryptedToken },
        }
      );

      if (employeeResponse.data.status) {
        const employeeData = {
          firstName: employeeResponse.data.Employee_FirstName,
          lastName: employeeResponse.data.Employee_LastName,
          typeName: employeeResponse.data.EmployeeType_Name,
        };
        setEmployee(employeeData);
        const EmployeeDataEncrypted = encryptToken(JSON.stringify(employeeData));
        sessionStorage.setItem("employee", EmployeeDataEncrypted);
      } else {
        setEmployee({ firstName: "Unknown", lastName: "Unknown", typeName: "Unknown" });
      }
    } catch (error) {
      localStorage.removeItem("token");
      sessionStorage.removeItem("employee");
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    fetchEmployeeData();
    setTypeid(localStorage.getItem("typeid") ? decryptToken(localStorage.getItem("typeid")) : "");
  }, [fetchEmployeeData]);

  const handleNavigation = (path) => {
    if (Data_typeId.toString() !== "2" && path !== "/dashboard") {
      setAlertMessage("You do not have permission to access this page.");
      setIsAlertModalOpen(true);
    }else{
      setActivePath(path);
      navigate(path);
    }
  };
  

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("employee");
    setIsLogoutModalOpen(false);
    navigate("/login");
  };

  return (
    <div className={styles.navbar}>
      <div className={styles.RuleLabel}>{employee.typeName}</div>
      <div className={styles.employeeName}>{employee.firstName} {employee.lastName}</div>
      <div className={styles.linearBlank}></div>
      <ul className={styles.navbarList}>
        <li className={`${styles.navbarItem} ${activePath === "/dashboard" ? styles.active : ""}`} onClick={() => handleNavigation("/dashboard")}>
          <span className={styles.navbarLink}><DashboardIcon width="20" height="20" /> Dashboard</span>
        </li>
        <li className={`${styles.navbarItem} ${activePath === "/employee" ? styles.active : ""}`} onClick={() => handleNavigation("/employee")}>
          <span className={styles.navbarLink}><EmployeeIcon width="20" height="20" /> Employee</span>
        </li>
        <li className={`${styles.navbarItem} ${activePath === "/add-admin" ? styles.active : ""}`} onClick={() => handleNavigation("/add-admin")}>
          <span className={styles.navbarLink}><AddAdminIcon width="20" height="20" /> Add Admin</span>
        </li>
        <li className={styles.navbarItem} onClick={() => setIsLogoutModalOpen(true)}>
          <span className={styles.navbarLink}><LogoutIcon width="20" height="20" /> Logout</span>
        </li>
      </ul>

      <Modal isOpen={isLogoutModalOpen} onRequestClose={() => setIsLogoutModalOpen(false)} className={styles.modal} overlayClassName={styles.overlay}>
        <h2>Are you sure you want to logout?</h2>
        <div className={styles.modalButtons}>
          <button onClick={() => setIsLogoutModalOpen(false)} className={styles.cancelButton}>NO</button>
          <button onClick={handleLogout} className={styles.confirmButton}>YES</button>
        </div>
      </Modal>
      <Modal 
        isOpen={isAlertModalOpen} 
        onRequestClose={() => setIsAlertModalOpen(false)} 
        className={styles.modal} 
        overlayClassName={styles.overlay}
      >
        <h2>{alertMessage}</h2>
        <button onClick={() => setIsAlertModalOpen(false)} className={styles.confirmButton}>OK</button>
      </Modal>
    </div>
  );
};

export default NavigationBar;