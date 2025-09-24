import React, { useState, useEffect } from 'react';
import { User, Edit, Save, X, Plus, Trash2, Loader, AlertCircle, RefreshCw } from 'lucide-react';
import styles from './ProfileForms.module.css';

const StudentProfileForm = ({ 
  userData, 
  onUpdate, 
  loading = false,
  faculties,
  departments,
  teachers,
  dropdownLoading,
  dropdownError,
  loadDropdownData,
  retryLoadDropdownData,
  handleAssignmentChange,
  formatDateForInput,
  formatDateForSubmit
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    firstName: '',
    lastName: '',
    phone: '',
    otherPhones: [],
    academicYear: '',
    birthdate: '',
    religion: '',
    medicalProblem: '',
    departmentId: '',
    facultyId: '',
    advisorId: '',
    isGraduated: false
  });

  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);

  // Update formData when userData changes
  useEffect(() => {
    if (userData?.student && userData?.department) {
      const initialData = {
        code: userData.student.code || '',
        firstName: userData.student.firstName || '',
        lastName: userData.student.lastName || '',
        phone: userData.student.phone || '',
        otherPhones: userData.student.otherPhones && userData.student.otherPhones.length > 0 
          ? userData.student.otherPhones.slice(0, 2) // จำกัดเพียง 2 เบอร์
          : [],
        academicYear: userData.student.academicYear || '',
        birthdate: formatDateForInput(userData.student.birthdate),
        religion: userData.student.religion || '',
        medicalProblem: userData.student.medicalProblem || '',
        departmentId: userData.department.id || '',
        facultyId: userData.department.faculty?.id || '',
        advisorId: '',
        isGraduated: userData.student.isGraduated || false
      };

      // หา advisor ID หากมีข้อมูล advisor และมี departmentId
      if (userData.student.advisor && userData.department.id && teachers.length > 0) {
        const advisor = teachers.find(teacher => teacher.Teacher_Name === userData.student.advisor);
        if (advisor) {
          initialData.advisorId = advisor.Teacher_ID.toString();
        }
      }

      setFormData(initialData);
    }
  }, [userData, formatDateForInput, teachers]);

  // Load dropdown data when editing starts
  useEffect(() => {
    if (isEditing) {
      loadDropdownData();
    }
  }, [isEditing, loadDropdownData]);

  // Filter departments when faculty changes
  useEffect(() => {
    if (formData.facultyId) {
      const filtered = departments.filter(dept => dept.Faculty_ID === parseInt(formData.facultyId));
      setFilteredDepartments(filtered);
      
      if (formData.departmentId && !filtered.find(dept => dept.Department_ID === parseInt(formData.departmentId))) {
        setFormData(prev => ({ ...prev, departmentId: '', advisorId: '' }));
        setFilteredTeachers([]);
      }
    } else {
      setFilteredDepartments([]);
      setFilteredTeachers([]);
    }
  }, [formData.facultyId, formData.departmentId, departments]);

  // Filter teachers when department changes
  useEffect(() => {
    if (formData.departmentId) {
      const selectedDept = departments.find(dept => dept.Department_ID === parseInt(formData.departmentId));
      if (selectedDept) {
        const filtered = teachers.filter(teacher => 
          teacher.Department_Name === selectedDept.Department_Name
        );
        setFilteredTeachers(filtered);
        
        if (formData.advisorId && !filtered.find(teacher => teacher.Teacher_ID === parseInt(formData.advisorId))) {
          setFormData(prev => ({ ...prev, advisorId: '' }));
        }
      }
    } else {
      setFilteredTeachers([]);
    }
  }, [formData.departmentId, formData.advisorId, teachers, departments]);

  // Set advisor ID after teachers are loaded
  useEffect(() => {
    if (teachers.length > 0 && userData?.student?.advisor && !formData.advisorId && formData.departmentId) {
      const advisorName = userData.student.advisor;
      const advisor = teachers.find(teacher => teacher.Teacher_Name === advisorName);
      if (advisor) {
        // ตรวจสอบว่าอาจารย์อยู่ในภาควิชาที่เลือกหรือไม่
        const selectedDept = departments.find(dept => dept.Department_ID === parseInt(formData.departmentId));
        if (selectedDept && advisor.Department_Name === selectedDept.Department_Name) {
          setFormData(prev => ({ ...prev, advisorId: advisor.Teacher_ID.toString() }));
        }
      }
    }
  }, [teachers, userData?.student?.advisor, formData.advisorId, formData.departmentId, departments]);

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
    // ตรวจสอบจำนวนเบอร์ที่มีอยู่ในปัจจุบัน
    const currentPhoneCount = formData.otherPhones.length;
    
    // จำกัดให้มีได้สูงสุด 2 เบอร์เท่านั้น
    if (currentPhoneCount < 2) {
      setFormData(prev => ({
        ...prev,
        otherPhones: [...prev.otherPhones, { name: '', phone: '' }]
      }));
    }
  };

  const removeOtherPhone = (index) => {
    // ลบเบอร์ที่เลือก
    const newOtherPhones = formData.otherPhones.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      otherPhones: newOtherPhones
    }));
  };

  const handleSave = async () => {
    if (!onUpdate || loading) return;

    try {
      const currentDeptId = userData?.department?.id;
      const currentAdvisorName = userData?.student?.advisor;
      const newAdvisorName = teachers.find(t => t.Teacher_ID === parseInt(formData.advisorId))?.Teacher_Name;

      const departmentChanged = currentDeptId !== parseInt(formData.departmentId);
      const advisorChanged = currentAdvisorName !== newAdvisorName;

      if (departmentChanged || advisorChanged) {
        // ตรวจสอบว่ามีข้อมูลที่จำเป็นครบถ้วน และต้องมีทั้งสองค่า
        if (!formData.departmentId || !formData.advisorId) {
          console.error('Missing department or advisor data:', {
            departmentId: formData.departmentId,
            advisorId: formData.advisorId
          });
          alert('กรุณาเลือกภาควิชาและอาจารย์ที่ปรึกษาให้ครบถ้วน');
          return;
        }

        // ตรวจสอบว่าอาจารย์ที่เลือกอยู่ในภาควิชาที่เลือกหรือไม่
        const selectedDept = departments.find(dept => dept.Department_ID === parseInt(formData.departmentId));
        const selectedTeacher = teachers.find(teacher => teacher.Teacher_ID === parseInt(formData.advisorId));
        
        if (selectedDept && selectedTeacher && selectedTeacher.Department_Name !== selectedDept.Department_Name) {
          alert('อาจารย์ที่เลือกไม่ได้อยู่ในภาควิชาที่เลือก กรุณาตรวจสอบอีกครั้ง');
          return;
        }

        await handleAssignmentChange(formData.departmentId, formData.advisorId);
      }

      const filteredOtherPhones = formData.otherPhones.filter(item =>
        item.name.trim() !== '' || item.phone.trim() !== ''
      );

      // ส่งข้อมูลตามที่มีจริง
      const updatedOtherPhones = filteredOtherPhones;

      const updatedData = {
        student: {
          code: formData.code,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          otherPhones: updatedOtherPhones,
          academicYear: formData.academicYear,
          birthdate: formatDateForSubmit(formData.birthdate),
          religion: formData.religion,
          medicalProblem: formData.medicalProblem,
          isGraduated: formData.isGraduated
        }
      };

      await onUpdate(updatedData);
      setIsEditing(false);
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  const handleCancel = () => {
    if (userData?.student && userData?.department) {
      setFormData({
        code: userData.student.code || '',
        firstName: userData.student.firstName || '',
        lastName: userData.student.lastName || '',
        phone: userData.student.phone || '',
        otherPhones: userData.student.otherPhones && userData.student.otherPhones.length > 0 
          ? userData.student.otherPhones.slice(0, 2) // จำกัดเพียง 2 เบอร์
          : [],
        academicYear: userData.student.academicYear || '',
        birthdate: formatDateForInput(userData.student.birthdate),
        religion: userData.student.religion || '',
        medicalProblem: userData.student.medicalProblem || '',
        departmentId: userData.department.id || '',
        facultyId: userData.department.faculty?.id || '',
        advisorId: teachers.find(t => t.Teacher_Name === userData.student.advisor)?.Teacher_ID?.toString() || '',
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
                disabled={loading || dropdownLoading}
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
                disabled={loading || dropdownLoading}
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

      {dropdownError && (
        <div className={styles.errorAlert}>
          <AlertCircle size={16} />
          <span>{dropdownError}</span>
          <button 
            onClick={retryLoadDropdownData} 
            className={styles.retryButton}
            disabled={dropdownLoading}
            style={{
              marginLeft: '10px',
              padding: '4px 8px',
              fontSize: '12px',
              border: '1px solid #dc3545',
              background: 'transparent',
              color: '#dc3545',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {dropdownLoading ? (
              <Loader size={12} className={styles.spinningIcon} />
            ) : (
              <RefreshCw size={12} />
            )}
            ลองใหม่
          </button>
        </div>
      )}

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
                  disabled={loading || dropdownLoading}
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
                  disabled={loading || dropdownLoading}
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
                  disabled={loading || dropdownLoading}
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
                  disabled={loading || dropdownLoading}
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
                  disabled={loading || dropdownLoading}
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
                  disabled={loading || dropdownLoading}
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
                  disabled={loading || dropdownLoading}
                />
              ) : (
                <span className={styles.value}>{userData.student?.academicYear || '-'}</span>
              )}
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>คณะ:</span>
              {isEditing ? (
                <select
                  name="facultyId"
                  value={formData.facultyId}
                  onChange={handleChange}
                  className={styles.selectField}
                  disabled={loading || dropdownLoading}
                >
                  <option value="">เลือกคณะ</option>
                  {faculties.map(faculty => (
                    <option key={faculty.Faculty_ID} value={faculty.Faculty_ID}>
                      {faculty.Faculty_Name}
                    </option>
                  ))}
                </select>
              ) : (
                <span className={styles.value}>{userData.student?.faculty || '-'}</span>
              )}
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>สาขาวิชา:</span>
              {isEditing ? (
                <select
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleChange}
                  className={styles.selectField}
                  disabled={loading || dropdownLoading || !formData.facultyId}
                >
                  <option value="">เลือกสาขาวิชา</option>
                  {filteredDepartments.map(department => (
                    <option key={department.Department_ID} value={department.Department_ID}>
                      {department.Department_Name}
                    </option>
                  ))}
                </select>
              ) : (
                <span className={styles.value}>{userData.student?.department || '-'}</span>
              )}
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>อาจารย์ที่ปรึกษา:</span>
              {isEditing ? (
                <select
                  name="advisorId"
                  value={formData.advisorId}
                  onChange={handleChange}
                  className={styles.selectField}
                  disabled={loading || dropdownLoading || !formData.departmentId}
                >
                  <option value="">เลือกอาจารย์ที่ปรึกษา</option>
                  {filteredTeachers.map(teacher => (
                    <option key={teacher.Teacher_ID} value={teacher.Teacher_ID}>
                      {teacher.Display_Name}
                    </option>
                  ))}
                </select>
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
                    disabled={loading || dropdownLoading}
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
                          disabled={loading || dropdownLoading}
                        />
                        <input
                          type="tel"
                          value={item.phone}
                          onChange={(e) => handleOtherPhoneChange(index, 'phone', e.target.value)}
                          className={styles.phoneNumberInput}
                          placeholder="หมายเลขโทรศัพท์"
                          disabled={loading || dropdownLoading}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeOtherPhone(index)}
                        className={styles.deletePhone}
                        disabled={loading || dropdownLoading}
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
                      disabled={loading || dropdownLoading}
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
                  {userData.student?.otherPhones?.filter(item =>
                    item.name?.trim() !== '' || item.phone?.trim() !== ''
                  ).length > 0 ? (
                    <>
                      {userData.student.otherPhones.filter(item =>
                        item.name?.trim() !== '' || item.phone?.trim() !== ''
                      ).slice(0, 2).map((item, index) => (
                        <div key={index} className={styles.phoneDisplay}>
                          <span className={styles.phoneName}>{item.name || `เบอร์ที่ ${index + 1}`}:</span>
                          <span className={styles.phoneNumber}>{item.phone || '-'}</span>
                        </div>
                      ))}
                      <div className={styles.phoneCount}>
                        จำนวนเบอร์: {userData.student.otherPhones.filter(item =>
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
                  disabled={loading || dropdownLoading}
                />
              ) : (
                <span className={styles.value}>{userData.student?.medicalProblem || 'ไม่มี'}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {dropdownLoading && (
        <div className={styles.dropdownLoadingOverlay}>
          <div className={styles.dropdownLoadingContent}>
            <Loader className={styles.spinner} />
            <p>กำลังโหลดข้อมูล dropdown...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfileForm;