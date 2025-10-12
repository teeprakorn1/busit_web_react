// hooks/useUIState.js
import { useState, useEffect, useCallback } from 'react';

export const useUIState = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [showBuddhistYear, setShowBuddhistYear] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalButtons, setModalButtons] = useState([]);
  const [dataEditModalOpen, setDataEditModalOpen] = useState(false);
  const [selectedDataEdit, setSelectedDataEdit] = useState(null);
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

  const openDataEditModal = useCallback((dataEdit) => {
    setSelectedDataEdit(dataEdit);
    setDataEditModalOpen(true);
  }, []);

  const closeDataEditModal = useCallback(() => {
    setDataEditModalOpen(false);
    setSelectedDataEdit(null);
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
    dataEditModalOpen,
    selectedDataEdit,
    showModal,
    closeModal,
    openDataEditModal,
    closeDataEditModal
  };
};