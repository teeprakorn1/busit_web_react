import React, { useState } from 'react';
import { User, Edit, Save, X, Plus, Trash2 } from 'lucide-react';
import styles from './ProfileForms.module.css';

const StaffProfileForm = ({ userData, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    code: userData.staff?.code || '',
    firstName: userData.staff?.firstName || '',
    lastName: userData.staff?.lastName || '',
    phone: userData.staff?.phone || '',
    otherPhones: userData.staff?.otherPhones || [{ name: '', phone: '' }],
    birthdate: userData.staff?.birthdate || '',
    religion: userData.staff?.religion || '',
    position: userData.staff?.position || '',
    department: userData.staff?.department || '',
    responsibilities: userData.staff?.responsibilities || '',
    startDate: userData.staff?.startDate || '',
    workLocation: userData.staff?.workLocation || '',
    employeeType: userData.staff?.employeeType || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
    setFormData(prev => ({
      ...prev,
      otherPhones: [...prev.otherPhones, { name: '', phone: '' }]
    }));
  };

  const removeOtherPhone = (index) => {
    if (formData.otherPhones.length > 1) {
      const newOtherPhones = formData.otherPhones.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        otherPhones: newOtherPhones
      }));
    }
  };

  const handleSave = () => {
    const filteredOtherPhones = formData.otherPhones.filter(item =>
      item.name.trim() !== '' || item.phone.trim() !== ''
    );
    const updatedData = {
      ...formData,
      otherPhones: filteredOtherPhones.length > 0 ? filteredOtherPhones : [{ name: '', phone: '' }]
    };

    onUpdate({
      staff: updatedData
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      code: userData.staff?.code || '',
      firstName: userData.staff?.firstName || '',
      lastName: userData.staff?.lastName || '',
      phone: userData.staff?.phone || '',
      otherPhones: userData.staff?.otherPhones || [{ name: '', phone: '' }],
      birthdate: userData.staff?.birthdate || '',
      religion: userData.staff?.religion || '',
      position: userData.staff?.position || '',
      department: userData.staff?.department || '',
      responsibilities: userData.staff?.responsibilities || '',
      startDate: userData.staff?.startDate || '',
      workLocation: userData.staff?.workLocation || '',
      employeeType: userData.staff?.employeeType || ''
    });
    setIsEditing(false);
  };

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
              <button className={styles.saveButton} onClick={handleSave}>
                <Save size={16} /> บันทึก
              </button>
              <button className={styles.cancelButton} onClick={handleCancel}>
                <X size={16} /> ยกเลิก
              </button>
            </>
          ) : (
            <button className={styles.editButton} onClick={() => setIsEditing(true)}>
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
                />
              ) : (
                <span className={styles.value}>{userData.staff?.phone || '-'}</span>
              )}
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>วันเกิด:</span>
              {isEditing ? (
                <input
                  type="date"
                  name="birthdate"
                  value={formData.birthdate}
                  onChange={handleChange}
                  className={styles.inputField}
                />
              ) : (
                <span className={styles.value}>
                  {userData.staff?.birthdate ? new Date(userData.staff.birthdate).toLocaleDateString('th-TH') : '-'}
                </span>
              )}
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>ศาสนา:</span>
              {isEditing ? (
                <select
                  name="religion"
                  value={formData.religion}
                  onChange={handleChange}
                  className={styles.selectField}
                >
                  <option value="">เลือกศาสนา</option>
                  <option value="พุทธ">พุทธ</option>
                  <option value="คริสต์">คริสต์</option>
                  <option value="อิสลาม">อิสลาม</option>
                  <option value="อื่นๆ">อื่นๆ</option>
                </select>
              ) : (
                <span className={styles.value}>{userData.staff?.religion || '-'}</span>
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
              <span className={styles.label}>เบอร์โทรศัพท์อื่นๆ:</span>
              {isEditing ? (
                <div className={styles.phoneList}>
                  {formData.otherPhones.map((item, index) => (
                    <div key={index} className={styles.phoneItemContainer}>
                      <div className={styles.phoneInputGroup}>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleOtherPhoneChange(index, 'name', e.target.value)}
                          className={styles.phoneNameInput}
                          placeholder="ชื่อ (เช่น บ้าน, ที่ทำงาน)"
                        />
                        <input
                          type="tel"
                          value={item.phone}
                          onChange={(e) => handleOtherPhoneChange(index, 'phone', e.target.value)}
                          className={styles.phoneNumberInput}
                          placeholder="หมายเลขโทรศัพท์"
                        />
                      </div>
                      {formData.otherPhones.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeOtherPhone(index)}
                          className={styles.deletePhone}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addOtherPhone}
                    className={styles.addPhone}
                  >
                    <Plus size={14} /> เพิ่มหมายเลข
                  </button>
                </div>
              ) : (
                <div className={styles.phoneDisplayList}>
                  {userData.staff?.otherPhones?.filter(item =>
                    item.name?.trim() !== '' || item.phone?.trim() !== ''
                  ).map((item, index) => (
                    <div key={index} className={styles.phoneDisplay}>
                      <span className={styles.phoneName}>{item.name || 'ไม่ระบุ'}:</span>
                      <span className={styles.phoneNumber}>{item.phone || '-'}</span>
                    </div>
                  )) || <span className={styles.value}>-</span>}
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