import React, { useState } from 'react';
import styles from './UserTypeSelector.module.css';

function UserTypeSelector() {
  const [type, setType] = useState('student');
  return (
    <div className={styles.selector}>
      <button
        className={type === 'student' ? styles.active : ''}
        onClick={() => setType('student')}
      >
        นักเรียน
      </button>
      <button
        className={type === 'teacher' ? styles.active : ''}
        onClick={() => setType('teacher')}
      >
        อาจารย์
      </button>
    </div>
  );
}

export default UserTypeSelector;
