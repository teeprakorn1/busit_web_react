import React from "react";
import Modal from "react-modal";
import styles from "./CustomModal.module.css";

Modal.setAppElement("#root");

function CustomModal({ isOpen, message, onClose, icon, buttons }) {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      shouldCloseOnOverlayClick={true}
      shouldCloseOnEsc={true}
      className={styles.modal}
      overlayClassName={styles.overlay}
    >
      {icon && (
        <div className={styles.iconWrapper}>
          <img src={icon} alt="Icon" />
        </div>
      )}

      <p className={styles.alertTitle}>แจ้งเตือนจากระบบ</p>
      <div className={styles.doubleDivider}></div>
      <h2>{message}</h2>

      <div className={styles.modalButtons}>
        {buttons && buttons.length > 0 ? (
          buttons.map((btn, idx) => (
            <button
              key={idx}
              onClick={btn.onClick}
              className={btn.className || styles.confirmButton}
            >
              {btn.label}
            </button>
          ))
        ) : (
          <button onClick={onClose} className={styles.confirmButton}>
            ตกลง
          </button>
        )}
      </div>
    </Modal>
  );
}

export default CustomModal;
