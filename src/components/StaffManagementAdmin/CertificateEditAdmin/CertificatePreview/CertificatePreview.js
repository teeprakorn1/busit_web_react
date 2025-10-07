// CertificateEditAdmin CertificatePreview.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FiPenTool } from 'react-icons/fi';
import { Award, Loader } from 'lucide-react';
import axios from 'axios';
import styles from './CertificatePreview.module.css';

const CertificatePreview = ({
  activeTab,
  selectedItem,
  getSignatureName,
  getImageUrl
}) => {
  const [templateLoaded, setTemplateLoaded] = useState(false);
  const [signatureLoaded, setSignatureLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [signatureError, setSignatureError] = useState(false);
  const [templateBlobUrl, setTemplateBlobUrl] = useState(null);
  const [signatureBlobUrl, setSignatureBlobUrl] = useState(null);

  const canvasRef = useRef(null);
  const templateImgRef = useRef(null);
  const signatureImgRef = useRef(null);

  const baseUrl = `${process.env.REACT_APP_SERVER_PROTOCOL}${process.env.REACT_APP_SERVER_BASE_URL}${process.env.REACT_APP_SERVER_PORT}`;

  useEffect(() => {
    return () => {
      if (templateBlobUrl) {
        URL.revokeObjectURL(templateBlobUrl);
      }
      if (signatureBlobUrl) {
        URL.revokeObjectURL(signatureBlobUrl);
      }
    };
  }, [templateBlobUrl, signatureBlobUrl]);

  useEffect(() => {
    if (!selectedItem?.Template_ImageFile || activeTab !== 'templates') return;

    const loadTemplateImage = async () => {
      try {
        const response = await axios.get(
          `${baseUrl}/api/images/certificate-files/${selectedItem.Template_ImageFile}`,
          {
            withCredentials: true,
            responseType: 'blob'
          }
        );

        const blobUrl = URL.createObjectURL(response.data);
        setTemplateBlobUrl(blobUrl);
        setImageError(false);
      } catch (error) {
        console.error('Error loading template image:', error);
        setImageError(true);
        setTemplateLoaded(false);
      }
    };

    loadTemplateImage();
  }, [selectedItem?.Template_ImageFile, baseUrl, activeTab]);

  useEffect(() => {
    if (activeTab !== 'templates') return;

    if (!selectedItem?.Signature_ID || !selectedItem?.Signature_ImageFile) {
      setSignatureLoaded(true);
      return;
    }

    const loadSignatureImage = async () => {
      try {
        const response = await axios.get(
          `${baseUrl}/api/images/certificate-files/${selectedItem.Signature_ImageFile}`,
          {
            withCredentials: true,
            responseType: 'blob'
          }
        );

        const blobUrl = URL.createObjectURL(response.data);
        setSignatureBlobUrl(blobUrl);
        setSignatureError(false);
      } catch (error) {
        console.error('Error loading signature image:', error);
        setSignatureError(true);
        setSignatureLoaded(false);
      }
    };

    loadSignatureImage();
  }, [selectedItem?.Signature_ID, selectedItem?.Signature_ImageFile, baseUrl, activeTab]);

  const drawCertificate = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const templateImg = templateImgRef.current;

    if (!canvas || !ctx || !templateImg) return;
    canvas.width = templateImg.naturalWidth;
    canvas.height = templateImg.naturalHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);

    if (selectedItem?.Signature_ImageFile && signatureImgRef.current && signatureLoaded && !signatureError) {
      const signatureImg = signatureImgRef.current;
      const signatureWidth = signatureImg.naturalWidth * 0.3;
      const signatureHeight = signatureImg.naturalHeight * 0.3;
      ctx.drawImage(
        signatureImg,
        selectedItem.Template_PositionX || 0,
        selectedItem.Template_PositionY || 0,
        signatureWidth,
        signatureHeight
      );
    }
  }, [selectedItem?.Signature_ImageFile, selectedItem?.Template_PositionX, selectedItem?.Template_PositionY, signatureLoaded, signatureError]);

  useEffect(() => {
    if (activeTab === 'templates' && templateLoaded && (signatureLoaded || !selectedItem?.Signature_ID)) {
      drawCertificate();
    }
  }, [activeTab, templateLoaded, signatureLoaded, selectedItem?.Signature_ID, drawCertificate]);

  const handleTemplateLoad = () => {
    setTemplateLoaded(true);
    setImageError(false);
  };

  const handleSignatureLoad = () => {
    setSignatureLoaded(true);
    setSignatureError(false);
  };

  const handleTemplateError = () => {
    setImageError(true);
    setTemplateLoaded(false);
  };

  const handleSignatureError = () => {
    setSignatureError(true);
    setSignatureLoaded(false);
  };

  const renderCertificatePreview = () => {
    if (!selectedItem?.Template_ImageFile) {
      return (
        <div className={styles.noTemplate}>
          <Award size={48} />
          <p>ไม่มีแม่แบบเกียรติบัตร</p>
        </div>
      );
    }

    return (
      <div className={styles.certificatePreview}>
        <div className={styles.previewContainer}>
          {templateBlobUrl && (
            <img
              ref={templateImgRef}
              src={templateBlobUrl}
              alt="Template"
              style={{ display: 'none' }}
              onLoad={handleTemplateLoad}
              onError={handleTemplateError}
            />
          )}

          {signatureBlobUrl && selectedItem?.Signature_ImageFile && (
            <img
              ref={signatureImgRef}
              src={signatureBlobUrl}
              alt="Signature"
              style={{ display: 'none' }}
              onLoad={handleSignatureLoad}
              onError={handleSignatureError}
            />
          )}
          {!templateLoaded && !imageError && (
            <div className={styles.loadingState}>
              <Loader className={styles.spinner} />
              <p>กำลังโหลดตัวอย่างเกียรติบัตร...</p>
            </div>
          )}
          {imageError && (
            <div className={styles.errorState}>
              <Award size={48} />
              <p>ไม่สามารถแสดงตัวอย่างเกียรติบัตรได้</p>
              <p style={{ fontSize: '12px', color: '#6b7280' }}>
                กรุณาตรวจสอบสิทธิ์การเข้าถึงไฟล์
              </p>
            </div>
          )}
          {templateLoaded && !imageError && (
            <div className={styles.certificateWrapper}>
              <canvas
                ref={canvasRef}
                className={styles.certificateCanvas}
              />
            </div>
          )}
          {selectedItem && templateLoaded && !imageError && (
            <div className={styles.templateInfo}>
              <h4>ข้อมูลแม่แบบ</h4>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>ชื่อแม่แบบ:</span>
                  <span className={styles.infoValue}>{selectedItem.Template_Name}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>ตำแหน่งลายเซ็น:</span>
                  <span className={styles.infoValue}>
                    X: {selectedItem.Template_PositionX || 0}px, Y: {selectedItem.Template_PositionY || 0}px
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>ลายเซ็น:</span>
                  <span className={styles.infoValue}>
                    {selectedItem.Signature_ID ? getSignatureName(selectedItem.Signature_ID) : 'ไม่ระบุ'}
                  </span>
                </div>
              </div>
              {selectedItem.Signature_ImageFile && signatureError && (
                <div className={styles.warningItem}>
                  <span>ไม่สามารถโหลดลายเซ็นได้</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSignaturePreview = () => {
    const signatureImageUrl = selectedItem?.Signature_ImageFile
      ? getImageUrl(selectedItem.Signature_ImageFile)
      : null;

    return (
      <div className={styles.signaturePreview}>
        <h3 className={styles.previewTitle}>ตัวอย่างลายเซ็น</h3>

        <div className={styles.signatureInfo}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>ชื่อ:</span>
            <span className={styles.infoValue}>{selectedItem?.Signature_Name}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>ไฟล์:</span>
            <span className={styles.infoValue}>{selectedItem?.Signature_ImageFile}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>วันที่สร้าง:</span>
            <span className={styles.infoValue}>
              {selectedItem?.Signature_RegisTime
                ? new Date(selectedItem.Signature_RegisTime).toLocaleDateString('th-TH', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })
                : 'ไม่ระบุ'}
            </span>
          </div>
        </div>

        <div className={styles.mockSignature}>
          {signatureImageUrl ? (
            <img
              src={signatureImageUrl}
              alt={selectedItem?.Signature_Name || 'ลายเซ็น'}
              className={styles.signatureImagePreview}
              onError={(e) => {
                console.error('Failed to load signature image:', signatureImageUrl);
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'flex';
              }}
            />
          ) : null}

          <div
            className={styles.signatureFallback}
            style={{ display: signatureImageUrl ? 'none' : 'flex' }}
          >
            <FiPenTool size={32} className={styles.signatureIcon} />
            <span className={styles.signatureText}>
              {signatureImageUrl ? 'ไม่สามารถโหลดรูปภาพได้' : selectedItem?.Signature_Name}
            </span>
          </div>
        </div>

        <div className={styles.previewNote}>
          <p>ตัวอย่างการแสดงผลลายเซ็นในเกียรติบัตร</p>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.previewArea}>
      {activeTab === 'templates' ? (
        renderCertificatePreview()
      ) : (
        renderSignaturePreview()
      )}
    </div>
  );
};

export default CertificatePreview;