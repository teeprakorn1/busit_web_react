import React from 'react';
import styles from './ImportDataModal.module.css';

function ImportDataModal({ open, setOpen }) {
  if (!open) return null;
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3>Preview ข้อมูล Excel</h3>
        <div className={styles.content}>/* ใส่ table preview */</div>
        <button onClick={() => setOpen(false)}>ปิด</button>
      </div>
    </div>
  );
}

export default ImportDataModal;
