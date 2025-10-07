import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Award, Loader } from 'lucide-react';
import axios from 'axios';
import styles from './CertificatePreview.module.css';

const CertificatePreview = ({
    templateImageFile,
    signatureImageFile,
    positionX = 0,
    positionY = 0,
    templateName,
    signatureName
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
        if (!templateImageFile) return;

        const loadTemplateImage = async () => {
            try {
                const response = await axios.get(
                    `${baseUrl}/api/images/certificate-files/${templateImageFile}`,
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
    }, [templateImageFile, baseUrl]);

    useEffect(() => {
        if (!signatureImageFile) {
            setSignatureLoaded(true);
            return;
        }

        const loadSignatureImage = async () => {
            try {
                const response = await axios.get(
                    `${baseUrl}/api/images/certificate-files/${signatureImageFile}`,
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
    }, [signatureImageFile, baseUrl]);

    const drawCertificate = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const templateImg = templateImgRef.current;

        if (!canvas || !ctx || !templateImg) return;

        canvas.width = templateImg.naturalWidth;
        canvas.height = templateImg.naturalHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);

        if (signatureImageFile && signatureImgRef.current && signatureLoaded && !signatureError) {
            const signatureImg = signatureImgRef.current;
            const signatureWidth = signatureImg.naturalWidth * 0.3;
            const signatureHeight = signatureImg.naturalHeight * 0.3;

            ctx.drawImage(
                signatureImg,
                positionX,
                positionY,
                signatureWidth,
                signatureHeight
            );
        }
    }, [signatureImageFile, signatureLoaded, signatureError, positionX, positionY]);

    useEffect(() => {
        if (templateLoaded && (signatureLoaded || !signatureImageFile)) {
            drawCertificate();
        }
    }, [templateLoaded, signatureLoaded, signatureImageFile, drawCertificate]);

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

    if (!templateImageFile) {
        return (
            <div className={styles.noTemplate}>
                <Award size={48} />
                <p>ไม่มีแม่แบบเกียรติบัตร</p>
            </div>
        );
    }

    return (
        <div className={styles.certificateContainer}>
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

            {signatureBlobUrl && signatureImageFile && (
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
            {(templateName || signatureName) && templateLoaded && !imageError && (
                <div className={styles.certificateInfo}>
                    <div className={styles.infoItem}>
                        <Award size={16} />
                        <span>{templateName}</span>
                    </div>
                    {signatureName && !signatureError && (
                        <div className={styles.infoItem}>
                            <span className={styles.signatureLabel}>ลายเซ็น:</span>
                            <span>{signatureName}</span>
                        </div>
                    )}
                    {signatureImageFile && signatureError && (
                        <div className={styles.warningItem}>
                            <span>ไม่สามารถโหลดลายเซ็นได้</span>
                        </div>
                    )}
                    <div className={styles.positionInfo}>
                        <span className={styles.positionLabel}>ตำแหน่งลายเซ็น:</span>
                        <span>X: {positionX}px, Y: {positionY}px</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CertificatePreview;