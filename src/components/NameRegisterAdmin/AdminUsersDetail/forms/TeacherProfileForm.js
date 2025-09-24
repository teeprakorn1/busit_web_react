import React, { useState, useEffect } from 'react';
import { User, Edit, Save, X, Plus, Trash2, Crown, Loader } from 'lucide-react';
import styles from './ProfileForms.module.css';

const TeacherProfileForm = ({ userData, onUpdate, loading }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    firstName: '',
    lastName: '',
    phone: '',
    otherPhones: [],
    birthdate: '',
    religion: '',
    medicalProblem: '',
    position: '',
    department: '',
    faculty: '',
    isDean: false,
    isResigned: false
  });

  // Update formData when userData changes
  useEffect(() => {
    if (userData?.teacher) {
      setFormData({
        code: userData.teacher.code || '',
        firstName: userData.teacher.firstName || '',
        lastName: userData.teacher.lastName || '',
        phone: userData.teacher.phone || '',
        otherPhones: userData.teacher.otherPhones && userData.teacher.otherPhones.length > 0 
          ? userData.teacher.otherPhones.slice(0, 2) // จำกัดเพียง 2 เบอร์
          : [],
        birthdate: userData.teacher.birthdate || '',
        religion: userData.teacher.religion || '',
        medicalProblem: userData.teacher.medicalProblem || '',
        position: userData.teacher.position || (userData.teacher.isDean ? 'คณบดี' : 'อาจารย์'),
        department: userData.teacher.department || '',
        faculty: userData.teacher.faculty || '',
        isDean: userData.teacher.isDean || false,
        isResigned: userData.teacher.isResigned || false
      });
    }
  }, [userData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let processedValue = value;
    
    // Convert string boolean values to actual boolean for isResigned
    if (name === 'isResigned') {
      processedValue = value === 'true';
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : processedValue
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
    // จำกัดให้มีได้สูงสุด 2 เบอร์เท่านั้น
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

  const handleSave = () => {
    const filteredOtherPhones = formData.otherPhones.filter(item =>
      item.name.trim() !== '' || item.phone.trim() !== ''
    );
    
    const updatedData = {
      ...formData,
      otherPhones: filteredOtherPhones,
      isDean: formData.position === 'คณบดี'
    };

    onUpdate({
      teacher: updatedData
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (userData?.teacher) {
      setFormData({
        code: userData.teacher.code || '',
        firstName: userData.teacher.firstName || '',
        lastName: userData.teacher.lastName || '',
        phone: userData.teacher.phone || '',
        otherPhones: userData.teacher.otherPhones && userData.teacher.otherPhones.length > 0 
          ? userData.teacher.otherPhones.slice(0, 2) // จำกัดเพียง 2 เบอร์
          : [],
        birthdate: userData.teacher.birthdate || '',
        religion: userData.teacher.religion || '',
        medicalProblem: userData.teacher.medicalProblem || '',
        position: userData.teacher.position || (userData.teacher.isDean ? 'คณบดี' : 'อาจารย์'),
        department: userData.teacher.department || '',
        faculty: userData.teacher.faculty || '',
        isDean: userData.teacher.isDean || false,
        isResigned: userData.teacher.isResigned || false
      });
    }
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
                  disabled={loading}
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
                  disabled={loading}
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
                  disabled={loading}
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
                  disabled={loading}
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
                  disabled={loading}
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
                  disabled={loading}
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
                  disabled={loading}
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
              {isEditing ? (
                <select
                  name="isResigned"
                  value={formData.isResigned ? 'true' : 'false'}
                  onChange={handleChange}
                  className={styles.selectField}
                  disabled={loading}
                >
                  <option value="false">ยังไม่ลาออก</option>
                  <option value="true">ลาออกแล้ว</option>
                </select>
              ) : (
                <span className={`${styles.value} ${styles.statusBadge} ${userData.teacher?.isResigned ? styles.resigned : styles.working}`}>
                  {userData.teacher?.isResigned ? 'ลาออกแล้ว' : 'ยังไม่ลาออก'}
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
              <span className={styles.label}>เบอร์โทรศัพท์อื่นๆ (สูงสุด 2 เบอร์):</span>
              {isEditing ? (
                <div className={styles.phoneList}>
                  {/* แสดงช่องกรอกข้อมูลเมื่อมี otherPhones */}
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
                  
                  {/* แสดงปุ่มเพิ่มเฉพาะเมื่อมีน้อยกว่า 2 เบอร์ */}
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
                  
                  {/* แสดงข้อความเมื่อครบ 2 เบอร์แล้ว */}
                  {formData.otherPhones.length >= 2 && (
                    <div className={styles.maxPhonesNote}>
                      <span>ครบจำนวนเบอร์โทรศัพท์แล้ว (2/2)</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className={styles.phoneDisplayList}>
                  {userData.teacher?.otherPhones?.filter(item =>
                    item.name?.trim() !== '' || item.phone?.trim() !== ''
                  ).length > 0 ? (
                    <>
                      {userData.teacher.otherPhones.filter(item =>
                        item.name?.trim() !== '' || item.phone?.trim() !== ''
                      ).slice(0, 2).map((item, index) => (
                        <div key={index} className={styles.phoneDisplay}>
                          <span className={styles.phoneName}>{item.name || `เบอร์ที่ ${index + 1}`}:</span>
                          <span className={styles.phoneNumber}>{item.phone || '-'}</span>
                        </div>
                      ))}
                      <div className={styles.phoneCount}>
                        จำนวนเบอร์: {userData.teacher.otherPhones.filter(item =>
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
        
        <div className={`${styles.infoSection} ${styles.teacherSection}`}>
          <h4>ข้อมูลสุขภาพ</h4>
          <div className={styles.infoCard}>
            <div className={styles.infoRow}>
              <span className={styles.label}>ปัญหาสุขภาพ/โรคประจำตัว:</span>
              {isEditing ? (
                <textarea
                  name="medicalProblem"
                  value={formData.medicalProblem}
                  onChange={handleChange}
                  className={styles.textareaField}
                  placeholder="ระบุปัญหาสุขภาพหรือโรคประจำตัว (ถ้ามี)"
                  rows="3"
                  disabled={loading}
                />
              ) : (
                <span className={styles.value}>
                  {userData.teacher?.medicalProblem || 'ไม่มี'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfileForm;