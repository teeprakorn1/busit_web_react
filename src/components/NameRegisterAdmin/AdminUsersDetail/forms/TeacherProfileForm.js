import React, { useState } from 'react';
import { User, Edit, Save, X, Plus, Trash2, Crown } from 'lucide-react';
import styles from './ProfileForms.module.css';

const TeacherProfileForm = ({ userData, onUpdate, loading }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    code: userData.teacher?.code || '',
    firstName: userData.teacher?.firstName || '',
    lastName: userData.teacher?.lastName || '',
    phone: userData.teacher?.phone || '',
    otherPhones: userData.teacher?.otherPhones || [{ name: '', phone: '' }],
    birthdate: userData.teacher?.birthdate || '',
    religion: userData.teacher?.religion || '',
    medicalProblem: userData.teacher?.medicalProblem || '',
    position: userData.teacher?.position || (userData.teacher?.isDean ? 'คณบดี' : 'อาจารย์'),
    department: userData.teacher?.department || '',
    faculty: userData.teacher?.faculty || '',
    isDean: userData.teacher?.isDean || false,
    isResigned: userData.teacher?.isResigned || false
  });

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
      otherPhones: filteredOtherPhones.length > 0 ? filteredOtherPhones : [{ name: '', phone: '' }],
      isDean: formData.position === 'คณบดี'
    };

    onUpdate({
      teacher: updatedData
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      code: userData.teacher?.code || '',
      firstName: userData.teacher?.firstName || '',
      lastName: userData.teacher?.lastName || '',
      phone: userData.teacher?.phone || '',
      otherPhones: userData.teacher?.otherPhones || [{ name: '', phone: '' }],
      birthdate: userData.teacher?.birthdate || '',
      religion: userData.teacher?.religion || '',
      medicalProblem: userData.teacher?.medicalProblem || '',
      position: userData.teacher?.position || (userData.teacher?.isDean ? 'คณบดี' : 'อาจารย์'),
      department: userData.teacher?.department || '',
      faculty: userData.teacher?.faculty || '',
      isDean: userData.teacher?.isDean || false,
      isResigned: userData.teacher?.isResigned || false
    });
    setIsEditing(false);
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className={styles.profileContent}>
      <div className={styles.sectionHeader}>
        <h3>
          <User size={20} />
          ข้อมูลส่วนตัวอาจารย์
          {userData.teacher?.isDean && (
            <Crown className={styles.crownIcon} title="คณบดี" />
          )}
        </h3>
        <div className={styles.actionButtons}>
          {isEditing ? (
            <>
              <button 
                className={styles.saveButton} 
                onClick={handleSave}
                disabled={loading}
              >
                <Save size={16} /> {loading ? 'กำลังบันทึก...' : 'บันทึก'}
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
            <button className={styles.editButton} onClick={() => setIsEditing(true)}>
              <Edit size={16} /> แก้ไข
            </button>
          )}
        </div>
      </div>

      <div className={styles.infoGrid}>
        <div className={`${styles.infoSection} ${styles.teacherSection}`}>
          <h4>ข้อมูลพื้นฐาน</h4>
          <div className={styles.infoCard}>
            <div className={styles.infoRow}>
              <span className={styles.label}>รหัสอาจารย์:</span>
              {isEditing ? (
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  className={styles.inputField}
                  placeholder="รหัสอาจารย์"
                />
              ) : (
                <span className={styles.value}>{userData.teacher?.code || '-'}</span>
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
                  placeholder="ชื่อ"
                  required
                />
              ) : (
                <span className={styles.value}>{userData.teacher?.firstName || '-'}</span>
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
                  placeholder="นามสกุล"
                  required
                />
              ) : (
                <span className={styles.value}>{userData.teacher?.lastName || '-'}</span>
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
                  placeholder="หมายเลขโทรศัพท์"
                />
              ) : (
                <span className={styles.value}>{userData.teacher?.phone || '-'}</span>
              )}
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>วันเกิด:</span>
              {isEditing ? (
                <input
                  type="date"
                  name="birthdate"
                  value={formatDateForInput(formData.birthdate)}
                  onChange={handleChange}
                  className={styles.inputField}
                />
              ) : (
                <span className={styles.value}>
                  {formatDateForDisplay(userData.teacher?.birthdate)}
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
                <span className={styles.value}>{userData.teacher?.religion || '-'}</span>
              )}
            </div>
          </div>
        </div>
        <div className={`${styles.infoSection} ${styles.teacherSection}`}>
          <h4>ข้อมูลการทำงาน</h4>
          <div className={styles.infoCard}>
            <div className={styles.infoRow}>
              <span className={styles.label}>ตำแหน่ง:</span>
              {isEditing ? (
                <select
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  className={styles.selectField}
                >
                  <option value="">เลือกตำแหน่ง</option>
                  <option value="อาจารย์">อาจารย์</option>
                  <option value="คณบดี">คณบดี</option>
                </select>
              ) : (
                <span className={styles.value}>
                  {userData.teacher?.isDean ? 'คณบดี' : 'อาจารย์'}
                  {userData.teacher?.isDean && (
                    <Crown className={styles.positionIcon} size={16} />
                  )}
                </span>
              )}
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>คณะ:</span>
              <span className={styles.value}>{userData.teacher?.faculty || '-'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>สาขาวิชา:</span>
              <span className={styles.value}>{userData.teacher?.department || '-'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>สถานะการลาออก:</span>
              <span className={`${styles.value} ${styles.statusBadge} ${userData.teacher?.isResigned ? styles.resigned : styles.notResigned}`}>
                {userData.teacher?.isResigned ? 'ลาออกแล้ว' : 'ยังไม่ลาออก'}
              </span>
            </div>
          </div>
        </div>
        <div className={`${styles.infoSection} ${styles.teacherSection}`}>
          <h4>ข้อมูลสุขภาพ</h4>
          <div className={styles.infoCard}>
            <div className={styles.infoRow}>
              <span className={styles.label}>ปัญหาสุขภาพ:</span>
              {isEditing ? (
                <textarea
                  name="medicalProblem"
                  value={formData.medicalProblem}
                  onChange={handleChange}
                  className={styles.textareaField}
                  placeholder="ระบุปัญหาสุขภาพ หรือ โรคประจำตัว (ถ้ามี)"
                  rows="3"
                />
              ) : (
                <span className={styles.value}>
                  {userData.teacher?.medicalProblem || 'ไม่มี'}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className={`${styles.infoSection} ${styles.teacherSection}`}>
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
        <div className={`${styles.infoSection} ${styles.teacherSection}`}>
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
                          title="ลบหมายเลขนี้"
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
                  {userData.teacher?.otherPhones?.filter(item =>
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

export default TeacherProfileForm;