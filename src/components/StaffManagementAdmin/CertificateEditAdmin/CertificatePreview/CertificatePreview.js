import React from 'react';
import { FiAward, FiPenTool } from 'react-icons/fi';
import styles from './CertificatePreview.module.css';

const CertificatePreview = ({
  activeTab,
  selectedItem,
  getSignatureName,
  getImageUrl
}) => {

  const renderCertificatePreview = () => {
    const studentName = "นางสาวปริญญา ใจดี";
    const courseName = "การพัฒนาเว็บไซต์ด้วย React";

    const templateImageUrl = selectedItem?.Template_ImageFile
      ? getImageUrl(selectedItem.Template_ImageFile)
      : null;

    const signatureImageUrl = selectedItem?.Signature_ID
      ? getImageUrl(
        selectedItem.Signature_ImageFile ||
        (typeof getSignatureName === 'function' ? null : null)
      )
      : null;

    return (
      <div className={styles.certificatePreview}>
        <div className={styles.previewContainer}>
          <div className={styles.certificateTemplate}>
            {templateImageUrl ? (
              <div className={styles.templateImageContainer}>
                <img
                  src={templateImageUrl}
                  alt={selectedItem?.Template_Name || 'แม่แบบเกียรติบัตร'}
                  className={styles.templateImage}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <div className={styles.templateFallback} style={{ display: 'none' }}>
                  <FiAward size={64} />
                  <p>ไม่สามารถโหลดภาพแม่แบบได้</p>
                </div>

                {signatureImageUrl && (
                  <img
                    src={signatureImageUrl}
                    alt="ลายเซ็น"
                    className={styles.signatureOverlay}
                    style={{
                      left: `${selectedItem.Template_PositionX || 0}px`,
                      top: `${selectedItem.Template_PositionY || 0}px`
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
              </div>
            ) : (
              <>
                <div className={styles.universityLogo}>
                  <div className={styles.logoPlaceholder}>
                    <FiAward size={48} />
                  </div>
                </div>
                <div className={styles.certificateHeader}>
                  <h2>มหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน</h2>
                  <h3>คณะบริหารธุรกิจและเทคโนโลยีสารสนเทศ</h3>
                </div>
                <div className={styles.certificateTitle}>
                  <h1>ใบประกาศเกียรติ</h1>
                  <p className={styles.subtitle}>CERTIFICATE OF ACHIEVEMENT</p>
                </div>
                <div className={styles.certificateContent}>
                  <p className={styles.grantedTo}>ขอมอบให้แก่</p>
                  <h2 className={styles.recipientName}>{studentName}</h2>
                  <p className={styles.achievementText}>
                    ได้ผ่านการอบรมหลักสูตร
                  </p>
                  <h3 className={styles.courseName}>{courseName}</h3>
                  <p className={styles.completionText}>
                    เรียบร้อยแล้ว เมื่อวันที่ 28 กันยายน พ.ศ. 2568
                  </p>
                </div>
                <div className={styles.signatureSection}>
                  <div className={styles.signatureBlock}>
                    <div className={styles.signatureImage}>
                      <div className={styles.signaturePlaceholder}>
                        <FiPenTool size={48} />
                      </div>
                    </div>
                    <div className={styles.signatureLine}></div>
                    <p className={styles.signatureName}>
                      {selectedItem?.Signature_ID ? getSignatureName(selectedItem.Signature_ID) : 'ลายเซ็น'}
                    </p>
                    <p className={styles.signatureTitle}>อธิการบดี</p>
                  </div>
                </div>
                <div className={styles.decorativeCorners}>
                  <div className={styles.cornerTopLeft}></div>
                  <div className={styles.cornerTopRight}></div>
                  <div className={styles.cornerBottomLeft}></div>
                  <div className={styles.cornerBottomRight}></div>
                </div>
              </>
            )}
          </div>
          {selectedItem && (
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
                    X: {selectedItem.Template_PositionX || 0}, Y: {selectedItem.Template_PositionY || 0}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>ลายเซ็น:</span>
                  <span className={styles.infoValue}>
                    {selectedItem.Signature_ID ? getSignatureName(selectedItem.Signature_ID) : 'ไม่ระบุ'}
                  </span>
                </div>
              </div>
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