// components/BulkActions/BulkActions.js
import React, { useState } from 'react';
import { 
  CheckCircle, XCircle, LogIn, LogOut, X, 
  AlertTriangle, ChevronDown, FileSpreadsheet, Eye, Award
} from 'lucide-react';
import styles from './BulkActions.module.css';

const BulkActions = ({
  selectedCount,
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
  getSelectedParticipantsData,
  selectedActivity
}) => {
  const [showConfirm, setShowConfirm] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const isLoading = approving || rejecting || checkingIn || checkingOut;
  const hasTemplate = selectedActivity?.Template_ID;

  const handleAction = (action, actionFn) => {
    setShowConfirm(action);
    setTimeout(() => {
      setShowConfirm(null);
    }, 2000);
    
    actionFn();
  };

  const handleExport = () => {
    onExport();
    setShowExportMenu(false);
  };

  const confirmMessages = {
    approve: hasTemplate 
      ? `ยืนยันการอนุมัติรูปภาพ ${selectedCount} รายการ?\n\n✅ จะสร้างเกียรติบัตรอัตโนมัติ`
      : `ยืนยันการอนุมัติรูปภาพ ${selectedCount} รายการ?\n\n⚠️ กิจกรรมนี้ยังไม่มีเทมเพลตเกียรติบัตร`,
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
                onClick={() => setShowDetails(!showDetails)}
              >
                <Eye size={14} />
                {showDetails ? 'ซ่อน' : 'ดูรายละเอียด'}
              </button>
            </div>
          </div>
          
          {/* Certificate Status Indicator */}
          {hasTemplate && (
            <div className={styles.certIndicator}>
              <Award size={16} />
              <span>จะสร้างเกียรติบัตรอัตโนมัติ</span>
            </div>
          )}
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
              title={hasTemplate 
                ? "อนุมัติรูปภาพและสร้างเกียรติบัตรอัตโนมัติ" 
                : "อนุมัติรูปภาพที่เลือก"}
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
                  {hasTemplate && <Award size={14} className={styles.certIcon} />}
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
              disabled={isLoading}
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
                <ChevronDown size={16} className={showExportMenu ? styles.rotated : ''} />
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
        {hasTemplate && (
          <div className={`${styles.stat} ${styles.certStat}`}>
            <Award size={16} />
            <span className={styles.statLabel}>สร้างเกียรติบัตร:</span>
            <span className={styles.statValue}>อัตโนมัติ</span>
          </div>
        )}
      </div>

      {/* Selected Details */}
      {showDetails && getSelectedParticipantsData && (
        <div className={styles.selectedDetails}>
          <div className={styles.detailsHeader}>
            <h4>รายการที่เลือก ({selectedCount} คน)</h4>
            <button onClick={() => setShowDetails(false)} className={styles.closeDetails}>
              <X size={16} />
            </button>
          </div>
          <div className={styles.detailsList}>
            {getSelectedParticipantsData().map((participant, index) => (
              <div key={participant.Users_ID} className={styles.detailItem}>
                <span className={styles.itemNumber}>{index + 1}.</span>
                <div className={styles.itemInfo}>
                  <div className={styles.itemName}>
                    {participant.FirstName} {participant.LastName}
                  </div>
                  <div className={styles.itemMeta}>
                    {participant.Code} • {participant.Department_Name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

BulkActions.defaultProps = {
  selectedActivity: null
};

export default BulkActions;