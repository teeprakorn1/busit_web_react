import React, { useState, useEffect } from 'react';
import { User, Edit, Save, X, Plus, Trash2, Loader } from 'lucide-react';
import styles from './ProfileForms.module.css';

const StudentProfileForm = ({ userData, onUpdate, loading = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    firstName: '',
    lastName: '',
    phone: '',
    otherPhones: [{ name: '', phone: '' }],
    academicYear: '',
    birthdate: '',
    religion: '',
    medicalProblem: '',
    department: '',
    faculty: '',
    advisor: '',
    isGraduated: false
  });

  // Update formData when userData changes
  useEffect(() => {
    if (userData?.student) {
      setFormData({
        code: userData.student.code || '',
        firstName: userData.student.firstName || '',
        lastName: userData.student.lastName || '',
        phone: userData.student.phone || '',
        otherPhones: userData.student.otherPhones && userData.student.otherPhones.length > 0 
          ? userData.student.otherPhones 
          : [{ name: '', phone: '' }],
        academicYear: userData.student.academicYear || '',
        birthdate: userData.student.birthdate || '',
        religion: userData.student.religion || '',
        medicalProblem: userData.student.medicalProblem || '',
        department: userData.student.department || '',
        faculty: userData.student.faculty || '',
        advisor: userData.student.advisor || '',
        isGraduated: userData.student.isGraduated || false
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

  const handleSave = async () => {
    if (!onUpdate || loading) return;

    // Filter out empty other phones but keep at least one empty entry for UI
    const filteredOtherPhones = formData.otherPhones.filter(item =>
      item.name.trim() !== '' || item.phone.trim() !== ''
    );

    // If no valid phones, add empty entry
    const updatedOtherPhones = filteredOtherPhones.length > 0 
      ? filteredOtherPhones 
      : [{ name: '', phone: '' }];

    const updatedData = {
      student: {
        ...formData,
        otherPhones: updatedOtherPhones
      }
    };

    try {
      await onUpdate(updatedData);
      setIsEditing(false);
    } catch (error) {
      console.error('Update error:', error);
      // Error handling is done in parent component
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    if (userData?.student) {
      setFormData({
        code: userData.student.code || '',
        firstName: userData.student.firstName || '',
        lastName: userData.student.lastName || '',
        phone: userData.student.phone || '',
        otherPhones: userData.student.otherPhones && userData.student.otherPhones.length > 0 
          ? userData.student.otherPhones 
          : [{ name: '', phone: '' }],
        academicYear: userData.student.academicYear || '',
        birthdate: userData.student.birthdate || '',
        religion: userData.student.religion || '',
        medicalProblem: userData.student.medicalProblem || '',
        department: userData.student.department || '',
        faculty: userData.student.faculty || '',
        advisor: userData.student.advisor || '',
        isGraduated: userData.student.isGraduated || false
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
          ข้อมูลส่วนตัวนักศึกษา
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
        <div className={styles.infoSection}>
          <h4>ข้อมูลพื้นฐาน</h4>
          <div className={styles.infoCard}>
            <div className={styles.infoRow}>
              <span className={styles.label}>รหัสนักศึกษา:</span>
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
                <span className={styles.value}>{userData.student?.code || '-'}</span>
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
                <span className={styles.value}>{userData.student?.firstName || '-'}</span>
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
                <span className={styles.value}>{userData.student?.lastName || '-'}</span>
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
                <span className={styles.value}>{userData.student?.phone || '-'}</span>
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
                  disabled={loading}
                />
              ) : (
                <span className={styles.value}>
                  {userData.student?.birthdate ? new Date(userData.student.birthdate).toLocaleDateString('th-TH') : '-'}
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
                <span className={styles.value}>{userData.student?.religion || '-'}</span>
              )}
            </div>
          </div>
        </div>
        
        <div className={styles.infoSection}>
          <h4>ข้อมูลการศึกษา</h4>
          <div className={styles.infoCard}>
            <div className={styles.infoRow}>
              <span className={styles.label}>ปีการศึกษาที่เข้า:</span>
              {isEditing ? (
                <input
                  type="number"
                  name="academicYear"
                  value={formData.academicYear}
                  onChange={handleChange}
                  className={styles.inputField}
                  min="2000"
                  max="2030"
                  disabled={loading}
                />
              ) : (
                <span className={styles.value}>{userData.student?.academicYear || '-'}</span>
              )}
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>คณะ:</span>
              {isEditing ? (
                <input
                  type="text"
                  name="faculty"
                  value={formData.faculty}
                  onChange={handleChange}
                  className={styles.inputField}
                  disabled={loading}
                  readOnly
                  title="ข้อมูลนี้ไม่สามารถแก้ไขได้"
                />
              ) : (
                <span className={styles.value}>{userData.student?.faculty || '-'}</span>
              )}
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>สาขาวิชา:</span>
              {isEditing ? (
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className={styles.inputField}
                  disabled={loading}
                  readOnly
                  title="ข้อมูลนี้ไม่สามารถแก้ไขได้"
                />
              ) : (
                <span className={styles.value}>{userData.student?.department || '-'}</span>
              )}
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>อาจารย์ที่ปรึกษา:</span>
              {isEditing ? (
                <input
                  type="text"
                  name="advisor"
                  value={formData.advisor}
                  onChange={handleChange}
                  className={styles.inputField}
                  disabled={loading}
                  readOnly
                  title="ข้อมูลนี้ไม่สามารถแก้ไขได้"
                />
              ) : (
                <span className={styles.value}>{userData.student?.advisor || '-'}</span>
              )}
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>สถานะการศึกษา:</span>
              {isEditing ? (
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="isGraduated"
                    checked={formData.isGraduated}
                    onChange={handleChange}
                    className={styles.checkboxField}
                    disabled={loading}
                  />
                  จบการศึกษาแล้ว
                </label>
              ) : (
                <span className={`${styles.value} ${styles.statusBadge} ${userData.student?.isGraduated ? styles.graduated : styles.studying}`}>
                  {userData.student?.isGraduated ? 'จบการศึกษา' : 'กำลังศึกษา'}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className={styles.infoSection}>
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
        
        <div className={styles.infoSection}>
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
                      {formData.otherPhones.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeOtherPhone(index)}
                          className={styles.deletePhone}
                          disabled={loading}
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
                    disabled={loading}
                  >
                    <Plus size={14} /> เพิ่มหมายเลข
                  </button>
                </div>
              ) : (
                <div className={styles.phoneDisplayList}>
                  {userData.student?.otherPhones?.filter(item =>
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
        
        <div className={styles.infoSection}>
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
                  rows={3}
                  placeholder="ระบุปัญหาสุขภาพหรือโรคประจำตัว (ถ้ามี)"
                  disabled={loading}
                />
              ) : (
                <span className={styles.value}>{userData.student?.medicalProblem || 'ไม่มี'}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfileForm;