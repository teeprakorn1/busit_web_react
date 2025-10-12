// components/BulkActions/BulkActions.jsx
import React, { useState } from 'react';
import { 
  CheckCircle, XCircle, LogIn, LogOut, X, 
  AlertTriangle, ChevronDown, FileSpreadsheet
} from 'lucide-react';
import styles from './BulkActions.module.css';

const BulkActions = ({
  selectedCount,
  selectedParticipants,
  onApprove,
  onReject,
  onCheckIn,
  onCheckOut,
  onExport,
  onDeselectAll,
  approving,
  rejecting,
  checkingIn,
  checkingOut,
  getSelectedParticipantsData
}) => {
  const [showConfirm, setShowConfirm] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const isLoading = approving || rejecting || checkingIn || checkingOut;

  const handleAction = (action, actionFn) => {
    setShowConfirm(action);
    
    // Auto confirm after showing message
    setTimeout(() => {
      setShowConfirm(null);
      actionFn();
    }, 100);
  };

  const handleExport = () => {
    const data = getSelectedParticipantsData();
    onExport(data);
    setShowExportMenu(false);
  };

  const confirmMessages = {
    approve: `ยืนยันการอนุมัติรูปภาพ ${selectedCount} รายการ?`,
    reject: `ยืนยันการปฏิเสธรูปภาพ ${selectedCount} รายการ?`,
    checkIn: `ยืนยันการเช็คอิน ${selectedCount} คน?`,
    checkOut: `ยืนยันการเช็คเอาท์ ${selectedCount} คน?`
  };

  return (
    <div className={styles.bulkActionsWrapper}>
      <div className={styles.bulkActionsBar}>
        {/* Selection Info */}
        <div className={styles.selectionInfo}>
          <div className={styles.selectionBadge}>
            <div className={styles.count}>{selectedCount}</div>
            <div className={styles.countLabel}>
              <span className={styles.label}>รายการที่เลือก</span>
              <button 
                className={styles.viewDetails}
                onClick={() => console.log('View selected')}
              >
                ดูรายละเอียด
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.actions}>
          {/* Picture Actions */}
          <div className={styles.actionGroup}>
            <span className={styles.groupLabel}>การอนุมัติ:</span>
            
            <button
              className={`${styles.actionBtn} ${styles.approve}`}
              onClick={() => handleAction('approve', onApprove)}
              disabled={isLoading}
              title="อนุมัติรูปภาพที่เลือก"
            >
              {approving ? (
                <>
                  <div className={styles.spinner}></div>
                  <span>กำลังอนุมัติ...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  <span>อนุมัติ ({selectedCount})</span>
                </>
              )}
            </button>

            <button
              className={`${styles.actionBtn} ${styles.reject}`}
              onClick={() => handleAction('reject', onReject)}
              disabled={isLoading}
              title="ปฏิเสธรูปภาพที่เลือก"
            >
              {rejecting ? (
                <>
                  <div className={styles.spinner}></div>
                  <span>กำลังปฏิเสธ...</span>
                </>
              ) : (
                <>
                  <XCircle size={18} />
                  <span>ปฏิเสธ</span>
                </>
              )}
            </button>
          </div>

          <div className={styles.divider}></div>

          {/* Check In/Out Actions */}
          <div className={styles.actionGroup}>
            <span className={styles.groupLabel}>การเข้าร่วม:</span>
            
            <button
              className={`${styles.actionBtn} ${styles.checkIn}`}
              onClick={() => handleAction('checkIn', onCheckIn)}
              disabled={isLoading}
              title="เช็คอินที่เลือก"
            >
              {checkingIn ? (
                <>
                  <div className={styles.spinner}></div>
                  <span>กำลังเช็คอิน...</span>
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>เช็คอิน</span>
                </>
              )}
            </button>

            <button
              className={`${styles.actionBtn} ${styles.checkOut}`}
              onClick={() => handleAction('checkOut', onCheckOut)}
              disabled={isLoading || checkingOut}
              title="เช็คเอาท์ที่เลือก"
            >
              {checkingOut ? (
                <>
                  <div className={styles.spinner}></div>
                  <span>กำลังเช็คเอาท์...</span>
                </>
              ) : (
                <>
                  <LogOut size={18} />
                  <span>เช็คเอาท์</span>
                </>
              )}
            </button>
          </div>

          <div className={styles.divider}></div>

          {/* Export & Cancel */}
          <div className={styles.actionGroup}>
            <div className={styles.exportWrapper}>
              <button
                className={`${styles.actionBtn} ${styles.export}`}
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={isLoading}
                title="Export ข้อมูล"
              >
                <FileSpreadsheet size={18} />
                <span>Export</span>
                <ChevronDown size={16} />
              </button>

              {showExportMenu && (
                <div className={styles.exportMenu}>
                  <button
                    className={styles.exportOption}
                    onClick={handleExport}
                  >
                    <FileSpreadsheet size={16} />
                    <div>
                      <div className={styles.optionTitle}>Export Excel</div>
                      <div className={styles.optionDesc}>ไฟล์ .xlsx พร้อมข้อมูลทั้งหมด</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            <button
              className={`${styles.actionBtn} ${styles.cancel}`}
              onClick={onDeselectAll}
              disabled={isLoading}
              title="ยกเลิกการเลือก"
            >
              <X size={18} />
              <span>ยกเลิก</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Toast */}
      {showConfirm && (
        <div className={styles.confirmToast}>
          <AlertTriangle size={18} />
          <span>{confirmMessages[showConfirm]}</span>
        </div>
      )}

      {/* Quick Stats */}
      <div className={styles.quickStats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>เลือกทั้งหมด:</span>
          <span className={styles.statValue}>{selectedCount} รายการ</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>คาดว่าจะใช้เวลา:</span>
          <span className={styles.statValue}>~{Math.ceil(selectedCount * 0.5)} วินาที</span>
        </div>
      </div>
    </div>
  );
};

export default BulkActions;