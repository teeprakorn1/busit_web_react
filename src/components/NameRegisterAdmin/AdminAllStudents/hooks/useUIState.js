import { useState, useEffect, useCallback } from 'react';

export const useUIState = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [showBuddhistYear, setShowBuddhistYear] = useState(true);
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalButtons, setModalButtons] = useState([]);
  
  // Student modal states - เปลี่ยนจาก selectedStudent เป็น selectedStudentId
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  // Responsive handler
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile && sidebarOpen === false) {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  // Modal functions
  const showModal = useCallback((message, buttons = []) => {
    setModalMessage(message);
    setModalButtons(buttons);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setModalMessage('');
    setModalButtons([]);
  }, []);

  // Student modal functions - อัปเดตให้ใช้ studentId
  const openStudentModal = useCallback((studentId) => {
    console.log('Opening student modal for ID:', studentId);
    setSelectedStudentId(studentId);
    setStudentModalOpen(true);
  }, []);

  const closeStudentModal = useCallback(() => {
    console.log('Closing student modal');
    setStudentModalOpen(false);
    setSelectedStudentId(null);
  }, []);

  return {
    // Responsive states
    isMobile,
    sidebarOpen,
    setSidebarOpen,
    notifyOpen,
    setNotifyOpen,
    showBuddhistYear,
    setShowBuddhistYear,
    
    // Modal states
    modalOpen,
    modalMessage,
    modalButtons,
    showModal,
    closeModal,
    
    // Student modal states - เปลี่ยนชื่อ
    studentModalOpen,
    selectedStudentId, // เปลี่ยนจาก selectedStudent
    openStudentModal,
    closeStudentModal
  };
};