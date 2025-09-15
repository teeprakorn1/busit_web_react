import { useState, useEffect, useCallback } from 'react';

export const useUIState = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [notifyOpen, setNotifyOpen] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalButtons, setModalButtons] = useState([]);

  const [teacherModalOpen, setTeacherModalOpen] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);

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

  const openTeacherModal = useCallback((teacherId) => {
    setSelectedTeacherId(teacherId);
    setTeacherModalOpen(true);
  }, []);

  const closeTeacherModal = useCallback(() => {
    setTeacherModalOpen(false);
    setSelectedTeacherId(null);
  }, []);

  return {
    isMobile,
    sidebarOpen,
    setSidebarOpen,
    notifyOpen,
    setNotifyOpen,
    modalOpen,
    modalMessage,
    modalButtons,
    showModal,
    closeModal,
    teacherModalOpen,
    selectedTeacherId,
    openTeacherModal,
    closeTeacherModal
  };
};