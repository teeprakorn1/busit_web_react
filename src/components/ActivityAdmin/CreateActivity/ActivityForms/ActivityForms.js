import React, { useState } from 'react';
import styles from './ActivityForms.module.css';
import { FiUpload, FiX, FiMapPin, FiCalendar, FiClock } from 'react-icons/fi';
import LocationPicker from '../LocationPicker/LocationPicker';
import DepartmentSelector from '../DepartmentSelector/DepartmentSelector';

function ActivityForms({ formData, setFormData, errors = {}, activityTypes, activityStatuses, templates }) {
    const [imagePreview, setImagePreview] = useState(null);
    const [showLocationPicker, setShowLocationPicker] = useState(false);

    const formatDateTimeForDisplay = (datetimeLocal) => {
        if (!datetimeLocal) return '';

        const date = new Date(datetimeLocal);

        const thaiMonths = [
            'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
            'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
        ];

        const day = date.getDate().toString().padStart(2, '0');
        const month = thaiMonths[date.getMonth()];
        const year = date.getFullYear() + 543;
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');

        return `${day} ${month} ${year} เวลา ${hours}:${minutes} น.`;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('ไฟล์รูปภาพต้องมีขนาดไม่เกิน 5MB');
                return;
            }

            setFormData(prev => ({ ...prev, imageFile: file }));

            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setFormData(prev => ({ ...prev, imageFile: null }));
        setImagePreview(null);
    };

    const handleLocationSelect = (location) => {
        setFormData(prev => ({ ...prev, locationGPS: location }));
    };

    const handleRemoveLocation = () => {
        setFormData(prev => ({ ...prev, locationGPS: null }));
    };

    const handleDepartmentsChange = (selectedDepts) => {
        setFormData(prev => ({ ...prev, selectedDepartments: selectedDepts }));
    };

    return (
        <>
            <div className={styles.formContainer}>
                <h3 className={styles.formTitle}>ข้อมูลพื้นฐาน</h3>

                <div className={styles.fieldGroup}>
                    <label htmlFor="title" className={styles.label}>
                        ชื่อกิจกรรม <span className={styles.required}>*</span>
                    </label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData?.title || ''}
                        onChange={handleChange}
                        className={`${styles.inputField} ${errors.title ? styles.error : ''}`}
                        placeholder="กรอกชื่อกิจกรรม"
                        required
                    />
                    {errors.title && <span className={styles.errorText}>{errors.title}</span>}
                </div>

                <div className={styles.fieldGroup}>
                    <label htmlFor="description" className={styles.label}>
                        รายละเอียดกิจกรรม <span className={styles.required}>*</span>
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData?.description || ''}
                        onChange={handleChange}
                        className={`${styles.textareaField} ${errors.description ? styles.error : ''}`}
                        placeholder="กรอกรายละเอียดกิจกรรม"
                        rows="5"
                        required
                    />
                    {errors.description && <span className={styles.errorText}>{errors.description}</span>}
                </div>

                <div className={styles.fieldGroup}>
                    <label htmlFor="activityTypeId" className={styles.label}>
                        ประเภทกิจกรรม
                    </label>
                    <select
                        id="activityTypeId"
                        name="activityTypeId"
                        value={formData?.activityTypeId || ''}
                        onChange={handleChange}
                        className={styles.selectField}
                    >
                        <option value="">-- เลือกประเภทกิจกรรม --</option>
                        {activityTypes.map(type => (
                            <option key={type.ActivityType_ID} value={type.ActivityType_ID}>
                                {type.ActivityType_Name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.fieldGroup}>
                    <label htmlFor="activityStatusId" className={styles.label}>
                        สถานะกิจกรรม
                    </label>
                    <div className={styles.statusDisplay}>
                        <span className={styles.statusBadge}>
                            {activityStatuses.find(s => s.ActivityStatus_ID === formData?.activityStatusId)?.ActivityStatus_Name || 'เปิดรับสมัคร'}
                        </span>
                    </div>
                    <small className={styles.helpText}>
                        สถานะเริ่มต้นเป็น "เปิดรับสมัคร" สามารถเปลี่ยนแปลงได้หลังสร้างกิจกรรม
                    </small>
                </div>

                <div className={styles.fieldGroup}>
                    <label className={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            name="isRequire"
                            checked={formData?.isRequire || false}
                            onChange={handleChange}
                            className={styles.checkbox}
                        />
                        <span>กิจกรรมบังคับ</span>
                    </label>
                    <small className={styles.helpText}>
                        เลือกหากกิจกรรมนี้เป็นกิจกรรมที่นักศึกษาต้องเข้าร่วม
                    </small>
                </div>
                <div className={styles.fieldGroup}>
                    <label className={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            name="allowTeachers"
                            checked={formData?.allowTeachers || false}
                            onChange={handleChange}
                            className={styles.checkbox}
                        />
                        <span>
                            อนุญาตให้อาจารย์เข้าร่วมกิจกรรม
                        </span>
                    </label>
                    <small className={styles.helpText}>
                        เลือกหากต้องการให้อาจารย์สามารถลงทะเบียนและเข้าร่วมกิจกรรมนี้ได้
                        <br />
                        <strong>หมายเหตุ:</strong> จำนวนผู้เข้าร่วมที่คาดหวังจะนับรวมอาจารย์ด้วย
                    </small>
                </div>
            </div>

            <div className={styles.formContainer}>
                <h3 className={styles.formTitle}>
                    <FiCalendar className={styles.titleIcon} />
                    วันที่และเวลา
                </h3>

                <div className={styles.fieldGroup}>
                    <label htmlFor="startTime" className={styles.label}>
                        เวลาเริ่มต้น <span className={styles.required}>*</span>
                    </label>
                    <div className={styles.inputWrapper}>
                        <FiClock className={styles.inputIcon} />
                        <input
                            type="datetime-local"
                            id="startTime"
                            name="startTime"
                            value={formData?.startTime || ''}
                            onChange={handleChange}
                            className={`${styles.inputField} ${errors.startTime ? styles.error : ''}`}
                            required
                        />
                    </div>
                    {formData?.startTime && (
                        <div className={styles.dateDisplay}>
                            {formatDateTimeForDisplay(formData.startTime)}
                        </div>
                    )}
                    {errors.startTime && <span className={styles.errorText}>{errors.startTime}</span>}
                </div>

                <div className={styles.fieldGroup}>
                    <label htmlFor="endTime" className={styles.label}>
                        เวลาสิ้นสุด <span className={styles.required}>*</span>
                    </label>
                    <div className={styles.inputWrapper}>
                        <FiClock className={styles.inputIcon} />
                        <input
                            type="datetime-local"
                            id="endTime"
                            name="endTime"
                            value={formData?.endTime || ''}
                            onChange={handleChange}
                            className={`${styles.inputField} ${errors.endTime ? styles.error : ''}`}
                            required
                        />
                    </div>
                    {formData?.endTime && (
                        <div className={styles.dateDisplay}>
                            {formatDateTimeForDisplay(formData.endTime)}
                        </div>
                    )}
                    {errors.endTime && <span className={styles.errorText}>{errors.endTime}</span>}
                </div>
            </div>

            {/* Location */}
            <div className={styles.formContainer}>
                <h3 className={styles.formTitle}>
                    <FiMapPin className={styles.titleIcon} />
                    สถานที่
                </h3>

                <div className={styles.fieldGroup}>
                    <label htmlFor="locationDetail" className={styles.label}>
                        รายละเอียดสถานที่
                    </label>
                    <input
                        type="text"
                        id="locationDetail"
                        name="locationDetail"
                        value={formData?.locationDetail || ''}
                        onChange={handleChange}
                        className={styles.inputField}
                        placeholder="เช่น ห้องประชุม 301 อาคาร 3"
                    />
                    <small className={styles.helpText}>
                        กรอกรายละเอียดสถานที่จัดกิจกรรม
                    </small>
                </div>

                <div className={styles.fieldGroup}>
                    <label className={styles.label}>
                        ตำแหน่งบนแผนที่ (GPS)
                    </label>
                    <div className={styles.locationPickerWrapper}>
                        {formData?.locationGPS ? (
                            <div className={styles.selectedLocation}>
                                <div className={styles.locationInfo}>
                                    <FiMapPin className={styles.locationIcon} />
                                    <div className={styles.locationCoords}>
                                        <span>ละติจูด: {formData.locationGPS.lat.toFixed(6)}</span>
                                        <span>ลองจิจูด: {formData.locationGPS.lng.toFixed(6)}</span>
                                    </div>
                                </div>
                                <div className={styles.locationActions}>
                                    <button
                                        type="button"
                                        onClick={() => setShowLocationPicker(true)}
                                        className={styles.changeLocationBtn}
                                    >
                                        <FiMapPin /> เปลี่ยนตำแหน่ง
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleRemoveLocation}
                                        className={styles.removeLocationBtn}
                                    >
                                        <FiX />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setShowLocationPicker(true)}
                                className={styles.selectLocationBtn}
                            >
                                <FiMapPin className={styles.btnIcon} />
                                เลือกตำแหน่งบนแผนที่
                            </button>
                        )}
                    </div>
                    <small className={styles.helpText}>
                        คลิกเพื่อเลือกตำแหน่งกิจกรรมบนแผนที่ (ไม่บังคับ)
                    </small>
                </div>
            </div>

            <DepartmentSelector
                selectedDepartments={formData?.selectedDepartments || []}
                onDepartmentsChange={handleDepartmentsChange}
                errors={errors}
                allowTeachers={formData?.allowTeachers || false}
            />

            <div className={styles.formContainer}>
                <h3 className={styles.formTitle}>เกียรติบัตร</h3>

                <div className={styles.fieldGroup}>
                    <label htmlFor="templateId" className={styles.label}>
                        แม่แบบเกียรติบัตร
                    </label>
                    <select
                        id="templateId"
                        name="templateId"
                        value={formData?.templateId || ''}
                        onChange={handleChange}
                        className={styles.selectField}
                    >
                        <option value="">-- ไม่ใช้แม่แบบเกียรติบัตร --</option>
                        {templates.map(template => (
                            <option key={template.Template_ID} value={template.Template_ID}>
                                {template.Template_Name}
                            </option>
                        ))}
                    </select>
                    <small className={styles.helpText}>
                        เลือกแม่แบบเกียรติบัตรสำหรับผู้เข้าร่วมกิจกรรม (ถ้ามี)
                    </small>
                </div>
            </div>

            <div className={styles.formContainer}>
                <h3 className={styles.formTitle}>
                    <FiUpload className={styles.titleIcon} />
                    รูปภาพกิจกรรม
                </h3>

                <div className={styles.fieldGroup}>
                    {!imagePreview ? (
                        <div className={styles.uploadArea}>
                            <input
                                type="file"
                                id="imageFile"
                                accept="image/*"
                                onChange={handleImageChange}
                                className={styles.fileInput}
                            />
                            <label htmlFor="imageFile" className={styles.uploadLabel}>
                                <FiUpload className={styles.uploadIcon} />
                                <span>คลิกเพื่ออัปโหลดรูปภาพ</span>
                                <small>รองรับ JPG, PNG (ขนาดไม่เกิน 5MB)</small>
                            </label>
                        </div>
                    ) : (
                        <div className={styles.imagePreviewContainer}>
                            <img src={imagePreview} alt="Preview" className={styles.imagePreview} />
                            <button
                                type="button"
                                onClick={handleRemoveImage}
                                className={styles.removeImageBtn}
                            >
                                <FiX /> ลบรูปภาพ
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {showLocationPicker && (
                <LocationPicker
                    selectedLocation={formData?.locationGPS}
                    onLocationSelect={handleLocationSelect}
                    onClose={() => setShowLocationPicker(false)}
                />
            )}
        </>
    );
}

export default ActivityForms;