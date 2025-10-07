import React, { useState, useEffect, useRef } from 'react';
import { Activity, Edit, Save, X, Loader, Upload, MapPin, Award } from 'lucide-react';
import CertificatePreview from '../CertificatePreview/CertificatePreview';
import LocationDisplay from '../LocationDisplay/LocationDisplay';
import axios from 'axios';
import styles from './ActivityForms.module.css';
import { logActivityEditStart, logActivityEditCancel } from '../../../../utils/systemLog';

const ActivityBasicForm = ({ activityData, onUpdate, loading, canEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activityStatuses, setActivityStatuses] = useState([]);
  const [activityTypes, setActivityTypes] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [templatePreview, setTemplatePreview] = useState(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    startTime: '',
    endTime: '',
    isRequired: false,
    locationGPS: null,
    statusId: '',
    typeId: '',
    templateId: ''
  });

  useEffect(() => {
    if (activityData) {
      const formatDateTimeLocal = (dateString) => {
        if (!dateString) return '';
        try {
          const date = new Date(dateString);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          return `${year}-${month}-${day}T${hours}:${minutes}`;
        } catch {
          return '';
        }
      };

      setFormData({
        title: activityData.Activity_Title || '',
        description: activityData.Activity_Description || '',
        location: activityData.Activity_LocationDetail || '',
        startTime: formatDateTimeLocal(activityData.Activity_StartTime),
        endTime: formatDateTimeLocal(activityData.Activity_EndTime),
        isRequired: activityData.Activity_IsRequire || false,
        locationGPS: parseGPSLocation(activityData.Activity_LocationGPS),
        statusId: activityData.ActivityStatus_ID || '',
        typeId: activityData.ActivityType_ID || '',
        templateId: activityData.Template_ID || ''
      });

      if (activityData.Template_ImageFile) {
        setTemplatePreview({
          filename: activityData.Template_ImageFile,
          name: activityData.Template_Name
        });
      }
    }
  }, [activityData]);

  useEffect(() => {
    fetchActivityStatuses();
    fetchActivityTypes();
    fetchTemplates();
  }, []);

  const fetchActivityStatuses = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_SERVER_PROTOCOL}${process.env.REACT_APP_SERVER_BASE_URL}${process.env.REACT_APP_SERVER_PORT}/api/admin/activity-statuses`,
        { withCredentials: true }
      );
      if (response.data?.status) {
        setActivityStatuses(response.data.data);
      }
    } catch (err) {
      console.error('Fetch activity statuses error:', err);
    }
  };

  const fetchActivityTypes = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_SERVER_PROTOCOL}${process.env.REACT_APP_SERVER_BASE_URL}${process.env.REACT_APP_SERVER_PORT}/api/admin/activity-types`,
        { withCredentials: true }
      );
      if (response.data?.status) {
        setActivityTypes(response.data.data);
      }
    } catch (err) {
      console.error('Fetch activity types error:', err);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_SERVER_PROTOCOL}${process.env.REACT_APP_SERVER_BASE_URL}${process.env.REACT_APP_SERVER_PORT}/api/admin/templates`,
        { withCredentials: true }
      );
      if (response.data?.status) {
        setTemplates(response.data.data);
      }
    } catch (err) {
      console.error('Fetch templates error:', err);
    }
  };

  const parseGPSLocation = (gpsString) => {
    if (!gpsString) return null;

    try {
      if (typeof gpsString === 'string') {
        if (gpsString.includes(',')) {
          const [lat, lng] = gpsString.split(',').map(coord => parseFloat(coord.trim()));
          if (!isNaN(lat) && !isNaN(lng)) {
            return { lat, lng };
          }
        }

        const parsed = JSON.parse(gpsString);
        if (parsed.lat && parsed.lng) {
          return {
            lat: parseFloat(parsed.lat),
            lng: parseFloat(parsed.lng)
          };
        }
      }

      if (gpsString.lat && gpsString.lng) {
        return {
          lat: parseFloat(gpsString.lat),
          lng: parseFloat(gpsString.lng)
        };
      }
    } catch (error) {
      console.error('GPS parsing error:', error);
    }

    return null;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTemplateChange = (e) => {
    const templateId = e.target.value;
    setFormData(prev => ({
      ...prev,
      templateId: templateId
    }));

    if (templateId) {
      const selectedTemplate = templates.find(t => t.Template_ID === parseInt(templateId));
      if (selectedTemplate) {
        setTemplatePreview({
          filename: selectedTemplate.Template_ImageFile,
          name: selectedTemplate.Template_Name,
          signatureName: selectedTemplate.Signature_Name,
          signatureFile: selectedTemplate.Signature_ImageFile,
          positionX: selectedTemplate.Template_PositionX || 0,
          positionY: selectedTemplate.Template_PositionY || 0
        });
      }
    } else {
      setTemplatePreview(null);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('ขนาดไฟล์ต้องไม่เกิน 5MB');
        return;
      }

      setSelectedImage(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMapClick = (e) => {
    if (!isEditing) return;

    const lat = parseFloat(e.latlng.lat.toFixed(6));
    const lng = parseFloat(e.latlng.lng.toFixed(6));

    setFormData(prev => ({
      ...prev,
      locationGPS: { lat, lng }
    }));
  };

  const handleLatChange = (e) => {
    const lat = parseFloat(e.target.value);
    if (!isNaN(lat) && lat >= -90 && lat <= 90) {
      setFormData(prev => ({
        ...prev,
        locationGPS: { ...prev.locationGPS, lat }
      }));
    }
  };

  const handleLngChange = (e) => {
    const lng = parseFloat(e.target.value);
    if (!isNaN(lng) && lng >= -180 && lng <= 180) {
      setFormData(prev => ({
        ...prev,
        locationGPS: { ...prev.locationGPS, lng }
      }));
    }
  };

  const handleEditStart = async () => {
    setIsEditing(true);
    
    // Log edit start
    if (activityData?.Activity_ID && activityData?.Activity_Title) {
      await logActivityEditStart(
        activityData.Activity_ID,
        activityData.Activity_Title
      );
    }
  };

  const handleSave = async () => {
    if (!onUpdate || loading) return;

    if (!formData.title.trim()) {
      alert('กรุณากรอกชื่อกิจกรรม');
      return;
    }

    if (!formData.description.trim()) {
      alert('กรุณากรอกคำอธิบายกิจกรรม');
      return;
    }

    if (!formData.startTime) {
      alert('กรุณาเลือกเวลาเริ่มกิจกรรม');
      return;
    }

    if (!formData.endTime) {
      alert('กรุณาเลือกเวลาสิ้นสุดกิจกรรม');
      return;
    }

    if (new Date(formData.endTime) <= new Date(formData.startTime)) {
      alert('เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น');
      return;
    }

    try {
      const updateData = {
        activityTitle: formData.title,
        activityDescription: formData.description,
        activityLocationDetail: formData.location,
        activityStartTime: formData.startTime,
        activityEndTime: formData.endTime,
        activityIsRequire: formData.isRequired,
        activityLocationGPS: formData.locationGPS ? JSON.stringify(formData.locationGPS) : null,
        activityStatusId: formData.statusId,
        activityTypeId: formData.typeId,
        templateId: formData.templateId || null
      };

      if (selectedImage) {
        updateData.activityImage = selectedImage;
      }

      const result = await onUpdate(updateData);

      if (result?.success) {
        setIsEditing(false);
        setSelectedImage(null);
        setImagePreview(null);
        alert('อัพเดทข้อมูลสำเร็จ');
      } else {
        alert(result?.error || 'เกิดข้อผิดพลาดในการอัพเดท');
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('เกิดข้อผิดพลาดในการอัพเดท');
    }
  };

  const handleCancel = async () => {
    // Log cancel action
    if (activityData?.Activity_ID && activityData?.Activity_Title) {
      await logActivityEditCancel(
        activityData.Activity_ID,
        activityData.Activity_Title
      );
    }

    if (activityData) {
      const formatDateTimeLocal = (dateString) => {
        if (!dateString) return '';
        try {
          const date = new Date(dateString);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          return `${year}-${month}-${day}T${hours}:${minutes}`;
        } catch {
          return '';
        }
      };

      setFormData({
        title: activityData.Activity_Title || '',
        description: activityData.Activity_Description || '',
        location: activityData.Activity_LocationDetail || '',
        startTime: formatDateTimeLocal(activityData.Activity_StartTime),
        endTime: formatDateTimeLocal(activityData.Activity_EndTime),
        isRequired: activityData.Activity_IsRequire || false,
        locationGPS: parseGPSLocation(activityData.Activity_LocationGPS),
        statusId: activityData.ActivityStatus_ID || '',
        typeId: activityData.ActivityType_ID || '',
        templateId: activityData.Template_ID || ''
      });

      if (activityData.Template_ImageFile) {
        setTemplatePreview({
          filename: activityData.Template_ImageFile,
          name: activityData.Template_Name
        });
      } else {
        setTemplatePreview(null);
      }
    }
    setIsEditing(false);
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!activityData) {
    return (
      <div className={styles.profileContent}>
        <div className={styles.loadingContainer}>
          <Loader className={styles.spinner} />
          <p>กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.profileContent}>
      <div className={styles.sectionHeader}>
        <h3>
          <Activity size={20} />
          ข้อมูลกิจกรรม
        </h3>
        {canEdit && (
          <div className={styles.actionButtons}>
            {isEditing ? (
              <>
                <button
                  className={styles.saveButton}
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader size={16} className={styles.spinningIcon} />
                  ) : (
                    <Save size={16} />
                  )}
                  {loading ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
                <button
                  className={styles.cancelButton}
                  onClick={handleCancel}
                  disabled={loading}
                >
                  <X size={16} /> ยกเลิก
                </button>
              </>
            ) : (
              <button
                className={styles.editButton}
                onClick={handleEditStart}
                disabled={loading}
              >
                <Edit size={16} /> แก้ไข
              </button>
            )}
          </div>
        )}
      </div>

      {/* Rest of the component remains the same as the original */}
      <div className={styles.infoGrid}>
        <div className={styles.infoSection}>
          <h4>ข้อมูลหลัก</h4>
          <div className={styles.infoCard}>
            {isEditing && (
              <div className={styles.infoRow}>
                <span className={styles.label}>รูปภาพกิจกรรม:</span>
                <div className={styles.imageUploadSection}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className={styles.fileInput}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className={styles.uploadButton}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                  >
                    <Upload size={16} /> เลือกรูปภาพใหม่
                  </button>
                  {(imagePreview || activityData.Activity_ImageFile) && (
                    <div className={styles.imagePreview}>
                      <img
                        src={imagePreview || `${process.env.REACT_APP_SERVER_PROTOCOL}${process.env.REACT_APP_SERVER_BASE_URL}${process.env.REACT_APP_SERVER_PORT}/api/images/activities-images/${activityData.Activity_ImageFile}`}
                        alt="Preview"
                        style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover' }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className={styles.infoRow}>
              <span className={styles.label}>ชื่อกิจกรรม:</span>
              {isEditing ? (
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={styles.inputField}
                  disabled={loading}
                  required
                  placeholder="กรอกชื่อกิจกรรม"
                />
              ) : (
                <span className={styles.value}>{activityData.Activity_Title || '-'}</span>
              )}
            </div>

            <div className={styles.infoRow}>
              <span className={styles.label}>คำอธิบาย:</span>
              {isEditing ? (
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className={styles.textareaField}
                  disabled={loading}
                  rows={3}
                  placeholder="กรอกคำอธิบายกิจกรรม"
                />
              ) : (
                <span className={styles.value}>{activityData.Activity_Description || '-'}</span>
              )}
            </div>

            <div className={styles.infoRow}>
              <span className={styles.label}>สถานที่:</span>
              {isEditing ? (
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={styles.inputField}
                  disabled={loading}
                  placeholder="กรอกสถานที่จัดกิจกรรม"
                />
              ) : (
                <span className={styles.value}>{activityData.Activity_LocationDetail || '-'}</span>
              )}
            </div>

            <div className={styles.infoRow}>
              <span className={styles.label}>กิจกรรมบังคับ:</span>
              {isEditing ? (
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="isRequired"
                    checked={formData.isRequired}
                    onChange={handleChange}
                    className={styles.checkboxField}
                    disabled={loading}
                  />
                  บังคับเข้าร่วม
                </label>
              ) : (
                <span className={styles.value}>
                  {activityData.Activity_IsRequire ? 'บังคับ' : 'ไม่บังคับ'}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className={styles.infoSection}>
          <h4>วันและเวลา</h4>
          <div className={styles.infoCard}>
            <div className={styles.infoRow}>
              <span className={styles.label}>เวลาเริ่ม:</span>
              {isEditing ? (
                <input
                  type="datetime-local"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className={styles.inputField}
                  disabled={loading}
                  required
                />
              ) : (
                <span className={styles.value}>
                  {activityData.Activity_StartTime
                    ? new Date(activityData.Activity_StartTime).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                    : '-'}
                </span>
              )}
            </div>

            <div className={styles.infoRow}>
              <span className={styles.label}>เวลาสิ้นสุด:</span>
              {isEditing ? (
                <input
                  type="datetime-local"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className={styles.inputField}
                  disabled={loading}
                  required
                />
              ) : (
                <span className={styles.value}>
                  {activityData.Activity_EndTime
                    ? new Date(activityData.Activity_EndTime).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                    : '-'}
                </span>
              )}
            </div>

            <div className={styles.infoRow}>
              <span className={styles.label}>ประเภทกิจกรรม:</span>
              {isEditing ? (
                <select
                  name="typeId"
                  value={formData.typeId}
                  onChange={handleChange}
                  className={styles.selectField}
                  disabled={loading}
                >
                  <option value="">เลือกประเภทกิจกรรม</option>
                  {activityTypes.map(type => (
                    <option key={type.ActivityType_ID} value={type.ActivityType_ID}>
                      {type.ActivityType_Name}
                    </option>
                  ))}
                </select>
              ) : (
                <span className={styles.value}>{activityData.ActivityType_Name || '-'}</span>
              )}
            </div>

            <div className={styles.infoRow}>
              <span className={styles.label}>สถานะ:</span>
              {isEditing ? (
                <select
                  name="statusId"
                  value={formData.statusId}
                  onChange={handleChange}
                  className={styles.selectField}
                  disabled={loading}
                >
                  <option value="">เลือกสถานะ</option>
                  {activityStatuses.map(status => (
                    <option key={status.ActivityStatus_ID} value={status.ActivityStatus_ID}>
                      {status.ActivityStatus_Name}
                    </option>
                  ))}
                </select>
              ) : (
                <span className={styles.value}>{activityData.ActivityStatus_Name || '-'}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* GPS Section */}
      <div className={styles.infoSection} style={{ marginTop: '24px' }}>
        <h4>
          <MapPin size={18} style={{ display: 'inline', marginRight: '8px' }} />
          ตำแหน่งที่ตั้ง GPS
        </h4>
        <div className={styles.infoCard}>
          {isEditing && (
            <>
              <div className={styles.gpsEditSection}>
                <div className={styles.gpsInputGroup}>
                  <label>ละติจูด (Latitude):</label>
                  <input
                    type="number"
                    step="0.000001"
                    min="-90"
                    max="90"
                    value={formData.locationGPS?.lat || ''}
                    onChange={handleLatChange}
                    className={styles.inputField}
                    placeholder="เช่น 13.7563"
                    disabled={loading}
                  />
                </div>
                <div className={styles.gpsInputGroup}>
                  <label>ลองจิจูด (Longitude):</label>
                  <input
                    type="number"
                    step="0.000001"
                    min="-180"
                    max="180"
                    value={formData.locationGPS?.lng || ''}
                    onChange={handleLngChange}
                    className={styles.inputField}
                    placeholder="เช่น 100.5018"
                    disabled={loading}
                  />
                </div>
              </div>
              <p className={styles.gpsHint}>
                คลิกบนแผนที่เพื่อเลือกตำแหน่ง หรือกรอกพิกัดด้านบน
              </p>
            </>
          )}

          {formData.locationGPS ? (
            <LocationDisplay
              location={formData.locationGPS}
              locationDetail={activityData.Activity_LocationDetail}
              onMapClick={isEditing ? handleMapClick : null}
              interactive={isEditing}
            />
          ) : (
            <div className={styles.noGPS}>
              <MapPin size={48} />
              <p>ไม่มีข้อมูลตำแหน่ง GPS</p>
              {isEditing && <p className={styles.gpsHint}>กรุณากรอกพิกัดด้านบนหรือคลิกบนแผนที่</p>}
            </div>
          )}
        </div>
      </div>

      {/* Certificate Template Section */}
      <div className={styles.infoSection} style={{ marginTop: '24px' }}>
        <h4>
          <Award size={18} style={{ display: 'inline', marginRight: '8px' }} />
          แม่แบบเกียรติบัตร
        </h4>
        <div className={styles.infoCard}>
          <div className={styles.certificatePreviewSection}>
            {isEditing && (
              <div className={styles.templateSelectSection}>
                <div className={styles.infoRow}>
                  <span className={styles.label}>เลือกแม่แบบ:</span>
                  <select
                    name="templateId"
                    value={formData.templateId}
                    onChange={handleTemplateChange}
                    className={styles.selectField}
                    disabled={loading}
                  >
                    <option value="">ไม่ใช้แม่แบบเกียรติบัตร</option>
                    {templates.map(template => (
                      <option key={template.Template_ID} value={template.Template_ID}>
                        {template.Template_Name}
                        {template.Signature_Name && ` (ลายเซ็น: ${template.Signature_Name})`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {!isEditing && activityData.Template_ID && (
              <div className={styles.certificateInfo}>
                <div className={styles.infoRow}>
                  <span className={styles.label}>แม่แบบที่ใช้:</span>
                  <span className={styles.value}>{activityData.Template_Name || 'ไม่มีแม่แบบ'}</span>
                </div>
                {activityData.Signature_Name && (
                  <div className={styles.infoRow}>
                    <span className={styles.label}>ลายเซ็น:</span>
                    <span className={styles.value}>{activityData.Signature_Name}</span>
                  </div>
                )}
              </div>
            )}

            {(templatePreview || activityData.Template_ImageFile) && (
              <CertificatePreview
                templateImageFile={isEditing ? templatePreview?.filename : activityData.Template_ImageFile}
                signatureImageFile={isEditing ? templatePreview?.signatureFile : activityData.Signature_ImageFile}
                positionX={isEditing ? templatePreview?.positionX : activityData.Template_PositionX}
                positionY={isEditing ? templatePreview?.positionY : activityData.Template_PositionY}
                templateName={isEditing ? templatePreview?.name : activityData.Template_Name}
                signatureName={isEditing ? templatePreview?.signatureName : activityData.Signature_Name}
              />
            )}

            {!templatePreview && !activityData.Template_ID && (
              <div className={styles.noTemplate}>
                <Award size={48} />
                <p>ไม่มีแม่แบบเกียรติบัตร</p>
                {isEditing && <p className={styles.gpsHint}>เลือกแม่แบบด้านบนเพื่อดูตัวอย่าง</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityBasicForm;