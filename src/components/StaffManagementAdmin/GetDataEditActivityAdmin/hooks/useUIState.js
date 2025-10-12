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

  const [activityEditModalOpen, setActivityEditModalOpen] = useState(false);
  const [selectedActivityEdit, setSelectedActivityEdit] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('info');

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

  const openActivityEditModal = useCallback((activityEdit) => {
    setSelectedActivityEdit(activityEdit);
    setActivityEditModalOpen(true);
  }, []);

  const closeActivityEditModal = useCallback(() => {
    setActivityEditModalOpen(false);
    setSelectedActivityEdit(null);
  }, []);

  const showLoading = useCallback((message = 'กำลังโหลด...') => {
    setLoadingMessage(message);
    setIsLoading(true);
  }, []);

  const hideLoading = useCallback(() => {
    setIsLoading(false);
    setLoadingMessage('');
  }, []);

  const showAlert = useCallback((message, type = 'info') => {
    setAlertMessage(message);
    setAlertType(type);
    setAlertOpen(true);

    setTimeout(() => {
      setAlertOpen(false);
    }, 5000);
  }, []);

  const closeAlert = useCallback(() => {
    setAlertOpen(false);
    setAlertMessage('');
    setAlertType('info');
  }, []);

  const toggleNotifications = useCallback(() => {
    setNotifyOpen(prev => !prev);
  }, []);

  const closeNotifications = useCallback(() => {
    setNotifyOpen(false);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const openSidebar = useCallback(() => {
    setSidebarOpen(true);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const toggleBuddhistYear = useCallback(() => {
    setShowBuddhistYear(prev => !prev);
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
      if (!e.target.closest('.notifyWrapper') && !e.target.closest('.notifyButton')) {
        setNotifyOpen(false);
      }
    };

    if (notifyOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [notifyOpen]);

  useEffect(() => {
    if (modalOpen || dataEditModalOpen || activityEditModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [modalOpen, dataEditModalOpen, activityEditModalOpen]);

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
    activityEditModalOpen,
    selectedActivityEdit,
    isLoading,
    loadingMessage,
    alertOpen,
    alertMessage,
    alertType,
    showModal,
    closeModal,
    openDataEditModal,
    closeDataEditModal,
    openActivityEditModal,
    closeActivityEditModal,
    showLoading,
    hideLoading,
    showAlert,
    closeAlert,
    toggleNotifications,
    closeNotifications,
    toggleSidebar,
    openSidebar,
    closeSidebar,
    toggleBuddhistYear
  };
};