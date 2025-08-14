import React, { useState } from 'react';
import styles from './LoginPage.module.css';
import UserIcon from '../../assets/icons/users_icon.svg';
import LockIcon from '../../assets/icons/lock_icon.svg';
import EyeOpenIcon from '../../assets/icons/eye_open_icon.svg';
import EyeClosedIcon from '../../assets/icons/eye_close_icon.svg';

const InputField = ({ id, type, placeholder, value, onChange }) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => setShowPassword(!showPassword);

  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;
  const leftIconSrc = isPassword ? LockIcon : UserIcon;

  return (
    <div className={styles.inputWrapper}>
      <img
        loading="lazy"
        src={leftIconSrc}
        className={styles.inputIcon}
        alt=""
      />
      <input
        type={inputType}
        id={id}
        placeholder={placeholder}
        className={styles.inputField}
        value={value}
        onChange={onChange}
      />
      {isPassword && (
        <button
          type="button"
          className={styles.passwordToggle}
          onClick={togglePassword}
          tabIndex={-1}
        >
          <img
            src={showPassword ? EyeOpenIcon : EyeClosedIcon}
            alt={showPassword ? "Hide password" : "Show password"}
            className={styles.eyeIcon}
          />
        </button>
      )}
    </div>
  );
};

export default InputField;
