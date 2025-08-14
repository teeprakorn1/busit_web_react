import React, { useEffect, useState } from 'react';
import styles from './LoginPage.module.css';
import InputField from './InputField';
import { encryptToken } from '../../utils/crypto';
import axios from "axios";
import CustomModal from '../../services/CustomModal';
import Logo from '../../assets/logo/busitplus_logo.png';

const getApiUrl = (endpoint) => {
  return `${process.env.REACT_APP_SERVER_PROTOCOL}${process.env.REACT_APP_SERVER_BASE_URL}${process.env.REACT_APP_SERVER_PORT}${endpoint}`;
};

function LoginPage() {
  const [Admin_Username, setUsername] = useState("");
  const [Admin_Password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  useEffect(() => {
    const savedUsername = localStorage.getItem("savedUsername");
    if (savedUsername) {
      setUsername(savedUsername);
      setRememberMe(true);
    }
  }, []);

  const openLoginModal = (message) => {
    setModalMessage(message);
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
    setModalMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    if (!Admin_Username || !Admin_Password) {
      openLoginModal("กรุณากรอกชื่อผู้ใช้และรหัสผ่านให้ครบถ้วน.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        getApiUrl(process.env.REACT_APP_API_LOGIN_WEBSITE),
        {
          Users_Email: Admin_Username,
          Users_Password: Admin_Password
        }
      );

      const result = response.data;

      if (result.status === true) {
        const encrypted = encryptToken(result.token);
        localStorage.setItem('token', encrypted);
        if (rememberMe) {
          localStorage.setItem("savedUsername", Admin_Username);
        } else {
          localStorage.removeItem("savedUsername");
        }
        window.location.href = '/';
      } else {
        openLoginModal(result.message || "รหัสผ่านหรือชื่อผู้ใช้ไม่ถูกต้อง.");
      }
    } catch (error) {
      if (error.response) {
        openLoginModal("รหัสผ่านหรือชื่อผู้ใช้ไม่ถูกต้อง.");
      } else if (error.request) {
        openLoginModal("ไม่สามารถเชื่อมต่อ server ได้ โปรดลองอีกครั้ง.");
      } else {
        openLoginModal("มีบางอย่างผิดพลาด โปรดลองอีกครั้ง.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        <img
          loading="lazy"
          src={Logo}
          className={styles.loginLogo}
          alt="Company Logo"
        />
        <h1 className={styles.loginTitle}>Admin Login</h1>

        <form className={styles.loginForm} onSubmit={handleSubmit} autoComplete="on">
          <InputField
            id="username"
            type="text"
            placeholder="Email / Username"
            value={Admin_Username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            autoComplete="username"
          />
          <InputField
            id="password"
            type="password"
            placeholder="Password"
            value={Admin_Password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          <div className={styles.rememberMe}>
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="rememberMe">Remember Me</label>
          </div>

          <button
            className={styles.loginButton}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "LOGIN"}
          </button>
        </form>
      </div>

      <CustomModal
        isOpen={isLoginModalOpen}
        message={modalMessage}
        onClose={closeLoginModal}
      />
    </div>
  );
}

export default LoginPage;
