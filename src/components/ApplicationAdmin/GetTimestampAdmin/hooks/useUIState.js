import { useState, useEffect, useCallback } from 'react';

export const useUIState = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [showBuddhistYear, setShowBuddhistYear] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalButtons, setModalButtons] = useState([]);
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

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

  const openStudentModal = useCallback((student) => {
    setSelectedStudent(student);
    setStudentModalOpen(true);
  }, []);

  const closeStudentModal = useCallback(() => {
    setStudentModalOpen(false);
    setSelectedStudent(null);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.notifyWrapper')) {
        setNotifyOpen(false);
      }
    };

    if (notifyOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [notifyOpen]);

  return {
    isMobile,
    sidebarOpen,
    setSidebarOpen,
    notifyOpen,
    setNotifyOpen,
    showBuddhistYear,
    setShowBuddhistYear,
    modalOpen,
    modalMessage,
    modalButtons,
    studentModalOpen,
    selectedStudent,
    showModal,
    closeModal,
    openStudentModal,
    closeStudentModal
  };
};