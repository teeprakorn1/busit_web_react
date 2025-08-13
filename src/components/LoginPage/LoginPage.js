import React, { useEffect, useState } from 'react';
import styles from './LoginPage.module.css';
import InputField from './InputField';
import { encryptToken } from '../../utils/crypto';
import axios from "axios";
import CustomModal from '../../services/CustomModal';
import Logo from '../../assets/logo/busitplus_logo.png';

function LoginPage() {
  const [Employee_Username, setUsername] = useState("");
  const [Employee_Password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  useEffect(() => {
    const savedUsername = localStorage.getItem("savedUsername");
    const savedPassword = localStorage.getItem("savedPassword");
    if (savedUsername && savedPassword) {
      setUsername(savedUsername);
      setPassword(savedPassword);
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

    if (!Employee_Username || !Employee_Password) {
      openLoginModal("กรุณากรอกชื่อผู้ใช้และรหัสผ่านของคุณให้ครบถ้วน.");
      return;
    }

    try {
      const response = await axios.post(
        process.env.REACT_APP_BASE_URL + process.env.REACT_APP_API_LOGINL,
        {
          Employee_Username,
          Employee_Password,
        }
      );

      const result = response.data;
      if (result['status'] === true) {
        const encrypted = encryptToken(result['token']);
        localStorage.setItem('token', encrypted);

        if (rememberMe) {
          localStorage.setItem("savedUsername", Employee_Username);
          localStorage.setItem("savedPassword", Employee_Password);
        } else {
          localStorage.removeItem("savedUsername");
          localStorage.removeItem("savedPassword");
        }

        window.location.href = '/';
      } else {
        openLoginModal(result['message']);
      }
    } catch (error) {
      openLoginModal("มีบางอย่างผิดพลาด โปรดลองอีกครั้ง.");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
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

        <form className={styles.loginForm} onSubmit={handleSubmit}>
          <InputField
            id="username"
            type="text"
            placeholder="Email / Username"
            value={Employee_Username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <InputField
            id="password"
            type="password"
            placeholder="Password"
            value={Employee_Password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
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


          <button className={styles.loginButton} type="submit">
            LOGIN
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
