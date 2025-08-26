import React from 'react';
import styles from './ExcelImportExport.module.css';

function ExcelImportExport({ setModalOpen }) {
  return (
    <div className={styles.wrapper}>
      <button onClick={() => setModalOpen(true)}>Import Excel</button>
      <button>Download Template</button>
      <button>Export Data</button>
    </div>
  );
}

export default ExcelImportExport; 
