// components/ImageGallery/ImageGallery.js
import React, { useState } from 'react';
import {
  X, CheckCircle, XCircle, ChevronLeft, ChevronRight, Eye, AlertCircle, Clock, User, Calendar
} from 'lucide-react';
import styles from './ImageGallery.module.css';

const ImageGallery = ({ images, onClose, onApprove, onReject, onRefresh }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedImages, setSelectedImages] = useState(new Set());
  const [isProcessing, setIsProcessing] = useState(false);

  const currentImage = images[currentIndex];

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const toggleImageSelection = (imageId) => {
    const newSelected = new Set(selectedImages);
    if (newSelected.has(imageId)) {
      newSelected.delete(imageId);
    } else {
      newSelected.add(imageId);
    }
    setSelectedImages(newSelected);
  };

  const handleBulkApprove = async () => {
    if (selectedImages.size === 0) {
      alert('กรุณาเลือกรูปภาพที่ต้องการอนุมัติ');
      return;
    }

    setIsProcessing(true);
    try {
      await onApprove(Array.from(selectedImages));
      setSelectedImages(new Set());
      if (onRefresh) await onRefresh();
    } catch (error) {
      console.error('Bulk approve error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedImages.size === 0) {
      alert('กรุณาเลือกรูปภาพที่ต้องการปฏิเสธ');
      return;
    }

    setIsProcessing(true);
    try {
      await onReject(Array.from(selectedImages));
      setSelectedImages(new Set());
      if (onRefresh) await onRefresh();
    } catch (error) {
      console.error('Bulk reject error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'รออนุมัติ':
        return { icon: <Clock size={16} />, className: styles.pending };
      case 'อนุมัติแล้ว':
        return { icon: <CheckCircle size={16} />, className: styles.approved };
      case 'ปฏิเสธ':
        return { icon: <XCircle size={16} />, className: styles.rejected };
      default:
        return { icon: <AlertCircle size={16} />, className: styles.unknown };
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return '-';
    return new Date(dateTime).toLocaleString('th-TH', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getImageUrl = (imageFile) => {
    return `${process.env.REACT_APP_SERVER_PROTOCOL}${process.env.REACT_APP_SERVER_BASE_URL}${process.env.REACT_APP_SERVER_PORT}/api/admin/images/registration-images/${imageFile}`;
  };

  if (!images || images.length === 0) {
    return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.emptyState}>
            <Eye size={64} />
            <h3>ไม่มีรูปภาพ</h3>
            <p>ผู้ใช้ยังไม่ได้อัปโหลดรูปภาพกิจกรรม</p>
            <button className={styles.closeButton} onClick={onClose}>
              ปิด
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(currentImage.RegistrationPictureStatus_Name);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h2>รูปภาพกิจกรรม</h2>
            <span className={styles.imageCount}>
              {currentIndex + 1} / {images.length}
            </span>
          </div>
          <button className={styles.closeIconButton} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Main Content */}
        <div className={styles.content}>
          {/* Image Viewer */}
          <div className={styles.imageViewer}>
            <button
              className={`${styles.navButton} ${styles.prevButton}`}
              onClick={handlePrevious}
              disabled={images.length === 1}
            >
              <ChevronLeft size={32} />
            </button>

            <div className={styles.imageContainer}>
              <img
                src={getImageUrl(currentImage.RegistrationPicture_ImageFile)}
                alt="Activity"
                className={styles.mainImage}
                crossOrigin="use-credentials"
                onError={(e) => {
                  e.target.src = '/placeholder-image.png';
                }}
              />

              {/* AI Success Indicator */}
              {currentImage.RegistrationPicture_IsAiSuccess !== null && (
                <div className={`${styles.aiIndicator} ${currentImage.RegistrationPicture_IsAiSuccess
                    ? styles.aiSuccess
                    : styles.aiFailed
                  }`}>
                  {currentImage.RegistrationPicture_IsAiSuccess ? (
                    <>
                      <CheckCircle size={16} />
                      <span>ยืนยันโดย AI</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={16} />
                      <span>AI ไม่สามารถยืนยันได้</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <button
              className={`${styles.navButton} ${styles.nextButton}`}
              onClick={handleNext}
              disabled={images.length === 1}
            >
              <ChevronRight size={32} />
            </button>
          </div>

          {/* Image Info */}
          <div className={styles.imageInfo}>
            <div className={`${styles.statusBadge} ${statusInfo.className}`}>
              {statusInfo.icon}
              <span>{currentImage.RegistrationPictureStatus_Name}</span>
            </div>

            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <User size={18} />
                <div>
                  <div className={styles.infoLabel}>ผู้อัปโหลด</div>
                  <div className={styles.infoValue}>
                    {currentImage.Student_FirstName || currentImage.Teacher_FirstName}{' '}
                    {currentImage.Student_LastName || currentImage.Teacher_LastName}
                  </div>
                  <div className={styles.infoSubtext}>
                    {currentImage.Student_Code || currentImage.Teacher_Code}
                  </div>
                </div>
              </div>

              <div className={styles.infoItem}>
                <Calendar size={18} />
                <div>
                  <div className={styles.infoLabel}>วันที่อัปโหลด</div>
                  <div className={styles.infoValue}>
                    {formatDateTime(currentImage.RegistrationPicture_RegisTime)}
                  </div>
                </div>
              </div>
            </div>

            {currentImage.RegistrationPicture_RejectReason && (
              <div className={styles.rejectReason}>
                <AlertCircle size={18} />
                <div>
                  <div className={styles.reasonLabel}>เหตุผลที่ปฏิเสธ:</div>
                  <div className={styles.reasonText}>
                    {currentImage.RegistrationPicture_RejectReason}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {currentImage.RegistrationPictureStatus_ID === 1 && (
              <div className={styles.actionButtons}>
                <button
                  className={`${styles.actionButton} ${styles.approve}`}
                  onClick={() => onApprove([currentImage.RegistrationPicture_ID])}
                  disabled={isProcessing}
                >
                  <CheckCircle size={18} />
                  อนุมัติรูปนี้
                </button>
                <button
                  className={`${styles.actionButton} ${styles.reject}`}
                  onClick={() => onReject([currentImage.RegistrationPicture_ID])}
                  disabled={isProcessing}
                >
                  <XCircle size={18} />
                  ปฏิเสธรูปนี้
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Thumbnail Strip */}
        <div className={styles.thumbnailStrip}>
          <div className={styles.thumbnailContainer}>
            {images.map((image, index) => {
              const isSelected = selectedImages.has(image.RegistrationPicture_ID);
              const isCurrent = index === currentIndex;
              const imgStatusInfo = getStatusInfo(image.RegistrationPictureStatus_Name);

              return (
                <div
                  key={image.RegistrationPicture_ID}
                  className={`${styles.thumbnail} ${isCurrent ? styles.currentThumbnail : ''
                    } ${isSelected ? styles.selectedThumbnail : ''}`}
                  onClick={() => setCurrentIndex(index)}
                >
                  <input
                    type="checkbox"
                    className={styles.thumbnailCheckbox}
                    checked={isSelected}
                    onChange={() => toggleImageSelection(image.RegistrationPicture_ID)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <img
                    src={getImageUrl(image.RegistrationPicture_ImageFile)}
                    alt={`Thumbnail ${index + 1}`}
                    crossOrigin="use-credentials"
                    onError={(e) => {
                      e.target.src = '/placeholder-image.png';
                    }}
                  />
                  <div className={`${styles.thumbnailStatus} ${imgStatusInfo.className}`}>
                    {imgStatusInfo.icon}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedImages.size > 0 && (
          <div className={styles.bulkActions}>
            <div className={styles.bulkInfo}>
              เลือกแล้ว {selectedImages.size} รูป
            </div>
            <div className={styles.bulkButtons}>
              <button
                className={`${styles.bulkButton} ${styles.bulkApprove}`}
                onClick={handleBulkApprove}
                disabled={isProcessing}
              >
                <CheckCircle size={18} />
                อนุมัติที่เลือก
              </button>
              <button
                className={`${styles.bulkButton} ${styles.bulkReject}`}
                onClick={handleBulkReject}
                disabled={isProcessing}
              >
                <XCircle size={18} />
                ปฏิเสธที่เลือก
              </button>
              <button
                className={`${styles.bulkButton} ${styles.bulkCancel}`}
                onClick={() => setSelectedImages(new Set())}
              >
                <X size={18} />
                ยกเลิก
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGallery;