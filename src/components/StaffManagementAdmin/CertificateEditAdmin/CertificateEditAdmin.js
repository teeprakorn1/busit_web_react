import React, { useState, useEffect } from 'react';
import Navbar from '../../NavigationBar/NavigationBar';
import { FiEye, FiEdit2, FiTrash2, FiPlus, FiX, FiRefreshCw, FiAlertTriangle } from 'react-icons/fi';
import { useCertificateData } from './hooks/useCertificateData';
import { useModal } from './hooks/useModal';
import {
  logCertificateTemplateViewTimestamp,
  logCertificateSignatureViewTimestamp
} from './../../../utils/systemLog';
import CertificateForm from './CertificateForm/CertificateForm';
import CertificatePreview from './CertificatePreview/CertificatePreview';
import styles from './CertificateEditAdmin.module.css';

function CertificateEditAdmin() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [activeTab, setActiveTab] = useState('templates');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const {
    templates,
    signatures,
    loading,
    error,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    addSignature,
    updateSignature,
    deleteSignature,
    getSignatureName,
    refreshData,
    clearError,
    getImageUrl
  } = useCertificateData();

  const {
    showModal,
    modalType,
    selectedItem,
    formData,
    openModal,
    closeModal,
    updateFormData,
    handleFileChange,
    hasUnsavedChanges
  } = useModal();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSubmit = async (formData) => {
    try {
      setSubmitLoading(true);

      if (activeTab === 'templates') {
        if (modalType === 'add') {
          setLoadingMessage('กำลังเพิ่มแม่แบบเกียรติบัตร...');
          await addTemplate(formData);
          setLoadingMessage('เพิ่มแม่แบบสำเร็จ!');
        } else if (modalType === 'edit') {
          setLoadingMessage('กำลังบันทึกการแก้ไข...');
          await updateTemplate(selectedItem.Template_ID, formData);
          setLoadingMessage('บันทึกสำเร็จ!');
        }
      } else {
        if (modalType === 'add') {
          setLoadingMessage('กำลังเพิ่มลายเซ็น...');
          await addSignature(formData);
          setLoadingMessage('เพิ่มลายเซ็นสำเร็จ!');
        } else if (modalType === 'edit') {
          setLoadingMessage('กำลังบันทึกการแก้ไข...');
          await updateSignature(selectedItem.Signature_ID, formData);
          setLoadingMessage('บันทึกสำเร็จ!');
        }
      }

      await new Promise(resolve => setTimeout(resolve, 800));
      closeModal();
    } catch (error) {
      console.error('Form submission error:', error);
      setLoadingMessage('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
      await new Promise(resolve => setTimeout(resolve, 1500));
    } finally {
      setSubmitLoading(false);
      setLoadingMessage('');
    }
  };

  const handleDelete = async (id) => {
    try {
      setSubmitLoading(true);

      if (activeTab === 'templates') {
        setLoadingMessage('กำลังลบแม่แบบ...');
        await deleteTemplate(id);
        setLoadingMessage('ลบแม่แบบสำเร็จ!');
      } else {
        setLoadingMessage('กำลังลบลายเซ็น...');
        await deleteSignature(id);
        setLoadingMessage('ลบลายเซ็นสำเร็จ!');
      }

      await new Promise(resolve => setTimeout(resolve, 800));
    } catch (error) {
      console.error('Delete error:', error);
      setLoadingMessage('เกิดข้อผิดพลาดในการลบ');
      await new Promise(resolve => setTimeout(resolve, 1500));
    } finally {
      setSubmitLoading(false);
      setLoadingMessage('');
    }
  };

  const handlePreview = async (item, tab) => {
    openModal('preview', item, tab);

    try {
      if (tab === 'templates') {
        await logCertificateTemplateViewTimestamp(
          item.Template_Name,
          item.Template_ID
        );
      } else {
        await logCertificateSignatureViewTimestamp(
          item.Signature_Name,
          item.Signature_ID
        );
      }
    } catch (error) {
      console.warn('Failed to log preview timestamp:', error);
    }
  };

  const handleFormFileChange = (file) => {
    handleFileChange(file);
  };

  const handleModalClose = () => {
    if (submitLoading) return;

    if (hasUnsavedChanges(selectedItem, activeTab)) {
      if (window.confirm('คุณมีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก ต้องการปิดหน้าต่างนี้หรือไม่?')) {
        closeModal();
      }
    } else {
      closeModal();
    }
  };

  const handleRefresh = async () => {
    setSubmitLoading(true);
    setLoadingMessage('กำลังรีเฟรชข้อมูล...');
    await refreshData();
    await new Promise(resolve => setTimeout(resolve, 500));
    setSubmitLoading(false);
    setLoadingMessage('');
  };

  const handleClearError = () => {
    clearError();
  };

  const getCurrentData = () => {
    return activeTab === 'templates' ? templates : signatures;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'ไม่ระบุ';
    try {
      return new Date(dateString).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className={styles.container}>
      <Navbar
        isMobile={isMobile}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <main
        className={`${styles.mainContent} 
          ${isMobile ? styles.mobileContent : ""} 
          ${sidebarOpen && !isMobile ? styles.contentShift : ""}`}
      >
        <div className={styles.headerBar}>
          <h1 className={styles.heading}>จัดการแม่แบบและลายเซ็นเกียรติบัตร</h1>
          <div className={styles.headerRight}>
            <button
              className={styles.refreshButton}
              onClick={handleRefresh}
              disabled={loading || submitLoading}
              title="รีเฟรชข้อมูล"
            >
              <FiRefreshCw className={`${styles.buttonIcon} ${(loading || submitLoading) ? styles.spinning : ''}`} />
            </button>
            <button
              className={styles.addButton}
              onClick={() => openModal('add', null, activeTab)}
              disabled={loading || submitLoading}
            >
              <FiPlus className={styles.buttonIcon} />
              เพิ่ม{activeTab === 'templates' ? 'แม่แบบ' : 'ลายเซ็น'}
            </button>
          </div>
        </div>

        {error && (
          <div className={styles.errorBanner}>
            <div className={styles.errorContent}>
              <FiAlertTriangle className={styles.errorIcon} />
              <span className={styles.errorMessage}>{error}</span>
              <button
                className={styles.errorCloseButton}
                onClick={handleClearError}
                title="ปิดข้อความแสดงข้อผิดพลาด"
              >
                <FiX />
              </button>
            </div>
          </div>
        )}

        <div className={styles.tabNav}>
          <button
            className={`${styles.tabButton} ${activeTab === 'templates' ? styles.active : ''}`}
            onClick={() => setActiveTab('templates')}
            disabled={loading || submitLoading}
          >
            แม่แบบเกียรติบัตร
            {templates.length > 0 && (
              <span className={styles.tabBadge}>{templates.length}</span>
            )}
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'signatures' ? styles.active : ''}`}
            onClick={() => setActiveTab('signatures')}
            disabled={loading || submitLoading}
          >
            ลายเซ็น
            {signatures.length > 0 && (
              <span className={styles.tabBadge}>{signatures.length}</span>
            )}
          </button>
        </div>

        <div className={styles.contentArea}>
          {loading && getCurrentData().length === 0 ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p>กำลังโหลดข้อมูล...</p>
            </div>
          ) : getCurrentData().length === 0 ? (
            <div className={styles.emptyState}>
              <h3>ยังไม่มี{activeTab === 'templates' ? 'แม่แบบ' : 'ลายเซ็น'}</h3>
              <p>เริ่มต้นโดยการเพิ่ม{activeTab === 'templates' ? 'แม่แบบ' : 'ลายเซ็น'}ใหม่</p>
              <button
                className={styles.emptyStateButton}
                onClick={() => openModal('add', null, activeTab)}
                disabled={loading || submitLoading}
              >
                <FiPlus className={styles.buttonIcon} />
                เพิ่ม{activeTab === 'templates' ? 'แม่แบบ' : 'ลายเซ็น'}ใหม่
              </button>
            </div>
          ) : (
            <div className={styles.cardGrid}>
              {activeTab === 'templates' ? (
                templates.map((template) => (
                  <div key={template.Template_ID} className={styles.itemCard}>
                    <div className={styles.cardHeader}>
                      <h3 className={styles.cardTitle}>{template.Template_Name}</h3>
                      <div className={styles.cardActions}>
                        <button
                          className={styles.actionButton}
                          onClick={() => handlePreview(template, activeTab)}
                          title="ดูตัวอย่าง"
                          disabled={loading || submitLoading}
                        >
                          <FiEye />
                        </button>
                        <button
                          className={styles.actionButton}
                          onClick={() => openModal('edit', template, activeTab)}
                          title="แก้ไข"
                          disabled={loading || submitLoading}
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          className={`${styles.actionButton} ${styles.deleteButton}`}
                          onClick={() => handleDelete(template.Template_ID)}
                          title="ลบ"
                          disabled={loading || submitLoading}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                    <div className={styles.cardBody}>
                      <p className={styles.cardInfo}>ไฟล์: {template.Template_ImageFile}</p>
                      <p className={styles.cardInfo}>
                        ตำแหน่งลายเซ็น: ({template.Template_PositionX || 0}, {template.Template_PositionY || 0})
                      </p>
                      <p className={styles.cardInfo}>
                        ลายเซ็น: {template.Signature_Name || getSignatureName(template.Signature_ID)}
                      </p>
                      <p className={styles.cardDate}>สร้างเมื่อ: {formatDate(template.Template_RegisTime)}</p>
                    </div>
                  </div>
                ))
              ) : (
                signatures.map((sig) => (
                  <div key={sig.Signature_ID} className={styles.itemCard}>
                    <div className={styles.cardHeader}>
                      <h3 className={styles.cardTitle}>{sig.Signature_Name}</h3>
                      <div className={styles.cardActions}>
                        <button
                          className={styles.actionButton}
                          onClick={() => handlePreview(sig, activeTab)}
                          title="ดูตัวอย่าง"
                          disabled={loading || submitLoading}
                        >
                          <FiEye />
                        </button>
                        <button
                          className={styles.actionButton}
                          onClick={() => openModal('edit', sig, activeTab)}
                          title="แก้ไข"
                          disabled={loading || submitLoading}
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          className={`${styles.actionButton} ${styles.deleteButton}`}
                          onClick={() => handleDelete(sig.Signature_ID)}
                          title="ลบ"
                          disabled={loading || submitLoading}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                    <div className={styles.cardBody}>
                      <p className={styles.cardInfo}>ไฟล์: {sig.Signature_ImageFile}</p>
                      <p className={styles.cardDate}>สร้างเมื่อ: {formatDate(sig.Signature_RegisTime)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {showModal && (
          <div className={styles.modalOverlay} onClick={handleModalClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>
                  {modalType === 'add' ? 'เพิ่ม' :
                    modalType === 'edit' ? 'แก้ไข' : 'ตัวอย่าง'}
                  {activeTab === 'templates' ? 'แม่แบบ' : 'ลายเซ็น'}
                </h2>
                <button
                  className={styles.closeButton}
                  onClick={handleModalClose}
                  disabled={loading || submitLoading}
                >
                  <FiX />
                </button>
              </div>

              <div className={styles.modalBody}>
                {modalType === 'preview' ? (
                  <CertificatePreview
                    activeTab={activeTab}
                    selectedItem={selectedItem}
                    getSignatureName={getSignatureName}
                    getImageUrl={getImageUrl}
                  />
                ) : (
                  <CertificateForm
                    activeTab={activeTab}
                    modalType={modalType}
                    formData={formData}
                    signatures={signatures}
                    onSubmit={handleSubmit}
                    onCancel={handleModalClose}
                    onFormDataChange={updateFormData}
                    onFileChange={handleFormFileChange}
                    loading={submitLoading}
                    error={error}
                  />
                )}
              </div>
            </div>
          </div>
        )}
        {submitLoading && (
          <div className={styles.modernLoadingOverlay}>
            <div className={styles.modernLoadingContent}>
              <div className={styles.modernLoadingSpinner}>
                <div className={styles.spinnerRing}></div>
                <div className={styles.spinnerRing}></div>
                <div className={styles.spinnerRing}></div>
              </div>
              <p className={styles.modernLoadingText}>{loadingMessage}</p>
              <div className={styles.loadingDots}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default CertificateEditAdmin;