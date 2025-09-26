import { useState, useEffect, useCallback } from 'react';

export const useUIState = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [notifyOpen, setNotifyOpen] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalButtons, setModalButtons] = useState([]);

  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState(null);

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
    // ป้องกันการเปิด modal ซ้ำ
    if (modalOpen) return;
    
    setModalMessage(message);
    setModalButtons(buttons);
    setModalOpen(true);
  }, [modalOpen]);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setModalMessage('');
    setModalButtons([]);
  }, []);

  const openStaffModal = useCallback((staffId) => {
    // ป้องกันการเปิด modal ซ้ำ
    if (staffModalOpen) return;
    
    setSelectedStaffId(staffId);
    setStaffModalOpen(true);
  }, [staffModalOpen]);

  const closeStaffModal = useCallback(() => {
    // ป้องกันการปิด modal ซ้ำ
    if (!staffModalOpen) return;
    
    setStaffModalOpen(false);
    setSelectedStaffId(null);
  }, [staffModalOpen]);

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
    staffModalOpen,
    selectedStaffId,
    openStaffModal,
    closeStaffModal
  };
};