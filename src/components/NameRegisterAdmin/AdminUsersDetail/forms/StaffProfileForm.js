import React, { useState, useEffect } from 'react';
import { User, Edit, Save, X, Plus, Trash2, Loader } from 'lucide-react';
import styles from './ProfileForms.module.css';

const StaffProfileForm = ({ userData, onUpdate, loading = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    firstName: '',
    lastName: '',
    phone: '',
    otherPhones: [],
    isResigned: false
  });

  useEffect(() => {
    if (userData?.staff) {
      setFormData({
        code: userData.staff.code || '',
        firstName: userData.staff.firstName || '',
        lastName: userData.staff.lastName || '',
        phone: userData.staff.phone || '',
        otherPhones: userData.staff.otherPhones && userData.staff.otherPhones.length > 0
          ? userData.staff.otherPhones.slice(0, 2)
          : [],
        isResigned: userData.staff.isResigned || false
      });
    }
  }, [userData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleOtherPhoneChange = (index, field, value) => {
    const newOtherPhones = [...formData.otherPhones];
    newOtherPhones[index][field] = value;
    setFormData(prev => ({
      ...prev,
      otherPhones: newOtherPhones
    }));
  };

  const addOtherPhone = () => {
    if (formData.otherPhones.length < 2) {
      setFormData(prev => ({
        ...prev,
        otherPhones: [...prev.otherPhones, { name: '', phone: '' }]
      }));
    }
  };

  const removeOtherPhone = (index) => {
    const newOtherPhones = formData.otherPhones.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      otherPhones: newOtherPhones
    }));
  };

  const handleSave = async () => {
    if (!onUpdate || loading) return;

    const filteredOtherPhones = formData.otherPhones.filter(item =>
      item.name.trim() !== '' || item.phone.trim() !== ''
    );

    const updatedData = {
      staff: {
        ...formData,
        otherPhones: filteredOtherPhones
      }
    };

    try {
      await onUpdate(updatedData);
      setIsEditing(false);
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  const handleCancel = () => {
    if (userData?.staff) {
      setFormData({
        code: userData.staff.code || '',
        firstName: userData.staff.firstName || '',
        lastName: userData.staff.lastName || '',
        phone: userData.staff.phone || '',
        otherPhones: userData.staff.otherPhones && userData.staff.otherPhones.length > 0
          ? userData.staff.otherPhones.slice(0, 2)
          : [],
        isResigned: userData.staff.isResigned || false
      });
    }
    setIsEditing(false);
  };

  if (!userData) {
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
          <User size={20} />
          ข้อมูลส่วนตัวเจ้าหน้าที่
        </h3>
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
              onClick={() => setIsEditing(true)}
              disabled={loading}
            >
              <Edit size={16} /> แก้ไข
            </button>
          )}
        </div>
      </div>

      <div className={styles.infoGrid}>
        <div className={`${styles.infoSection} ${styles.staffSection}`}>
          <h4>ข้อมูลพื้นฐาน</h4>
          <div className={styles.infoCard}>
            <div className={styles.infoRow}>
              <span className={styles.label}>รหัสเจ้าหน้าที่:</span>
              {isEditing ? (
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  className={styles.inputField}
                  disabled={loading}
                />
              ) : (
                <span className={styles.value}>{userData.staff?.code || '-'}</span>
              )}
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>ชื่อ:</span>
              {isEditing ? (
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={styles.inputField}
                  disabled={loading}
                  required
                />
              ) : (
                <span className={styles.value}>{userData.staff?.firstName || '-'}</span>
              )}
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>นามสกุล:</span>
              {isEditing ? (
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={styles.inputField}
                  disabled={loading}
                  required
                />
              ) : (
                <span className={styles.value}>{userData.staff?.lastName || '-'}</span>
              )}
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>เบอร์โทรศัพท์หลัก:</span>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={styles.inputField}
                  disabled={loading}
                />
              ) : (
                <span className={styles.value}>{userData.staff?.phone || '-'}</span>
              )}
            </div>
          </div>
        </div>

        <div className={`${styles.infoSection} ${styles.staffSection}`}>
          <h4>ข้อมูลการทำงาน</h4>
          <div className={styles.infoCard}>
            <div className={styles.infoRow}>
              <span className={styles.label}>วันที่เริ่มงาน:</span>
              <span className={styles.value}>
                {userData.staff?.regisTime ? new Date(userData.staff.regisTime).toLocaleDateString('th-TH', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : '-'}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>สถานะการลาออก:</span>
              {isEditing ? (
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="isResigned"
                    checked={formData.isResigned}
                    onChange={handleChange}
                    className={styles.checkboxField}
                    disabled={loading}
                  />
                  ลาออกแล้ว
                </label>
              ) : (
                <span className={`${styles.value} ${styles.statusBadge} ${userData.staff?.isResigned ? styles.resigned : styles.working}`}>
                  {userData.staff?.isResigned ? 'ลาออกแล้ว' : 'ปฏิบัติงาน'}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className={`${styles.infoSection} ${styles.staffSection}`}>
          <h4>ข้อมูลระบบ</h4>
          <div className={styles.infoCard}>
            <div className={styles.infoRow}>
              <span className={styles.label}>อีเมล:</span>
              <span className={styles.value}>{userData.email || '-'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>ชื่อผู้ใช้:</span>
              <span className={styles.value}>{userData.username || '-'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>วันที่สมัครสมาชิก:</span>
              <span className={styles.value}>
                {userData.regisTime ? new Date(userData.regisTime).toLocaleDateString('th-TH', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : '-'}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>สถานะบัญชี:</span>
              <span className={`${styles.value} ${styles.statusBadge} ${userData.isActive ? styles.active : styles.inactive}`}>
                {userData.isActive ? 'ใช้งาน' : 'ระงับ'}
              </span>
            </div>
          </div>
        </div>

        <div className={`${styles.infoSection} ${styles.staffSection}`}>
          <h4>ข้อมูลติดต่อเพิ่มเติม</h4>
          <div className={styles.infoCard}>
            <div className={styles.infoRow}>
              <span className={styles.label}>เบอร์โทรศัพท์อื่นๆ (สูงสุด 2 เบอร์):</span>
              {isEditing ? (
                <div className={styles.phoneList}>
                  {formData.otherPhones.length > 0 && formData.otherPhones.map((item, index) => (
                    <div key={index} className={styles.phoneItemContainer}>
                      <div className={styles.phoneInputGroup}>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleOtherPhoneChange(index, 'name', e.target.value)}
                          className={styles.phoneNameInput}
                          placeholder={`ชื่อเบอร์ที่ ${index + 1} (เช่น บ้าน, ที่ทำงาน)`}
                          disabled={loading}
                        />
                        <input
                          type="tel"
                          value={item.phone}
                          onChange={(e) => handleOtherPhoneChange(index, 'phone', e.target.value)}
                          className={styles.phoneNumberInput}
                          placeholder="หมายเลขโทรศัพท์"
                          disabled={loading}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeOtherPhone(index)}
                        className={styles.deletePhone}
                        disabled={loading}
                        title="ลบเบอร์นี้"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}

                  {formData.otherPhones.length < 2 && (
                    <button
                      type="button"
                      onClick={addOtherPhone}
                      className={styles.addPhone}
                      disabled={loading}
                      title="เพิ่มเบอร์โทรศัพท์ (สูงสุด 2 เบอร์)"
                    >
                      <Plus size={14} /> เพิ่มหมายเลข ({formData.otherPhones.length}/2)
                    </button>
                  )}

                  {formData.otherPhones.length >= 2 && (
                    <div className={styles.maxPhonesNote}>
                      <span>ครบจำนวนเบอร์โทรศัพท์แล้ว (2/2)</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className={styles.phoneDisplayList}>
                  {userData.staff?.otherPhones?.filter(item =>
                    item.name?.trim() !== '' || item.phone?.trim() !== ''
                  ).length > 0 ? (
                    <>
                      {userData.staff.otherPhones.filter(item =>
                        item.name?.trim() !== '' || item.phone?.trim() !== ''
                      ).slice(0, 2).map((item, index) => (
                        <div key={index} className={styles.phoneDisplay}>
                          <span className={styles.phoneName}>{item.name || `เบอร์ที่ ${index + 1}`}:</span>
                          <span className={styles.phoneNumber}>{item.phone || '-'}</span>
                        </div>
                      ))}
                      <div className={styles.phoneCount}>
                        จำนวนเบอร์: {userData.staff.otherPhones.filter(item =>
                          item.name?.trim() !== '' || item.phone?.trim() !== ''
                        ).length}/2
                      </div>
                    </>
                  ) : (
                    <span className={styles.value}>-</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffProfileForm;