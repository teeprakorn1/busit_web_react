// hooks/useUIState.js
import { useState, useEffect, useCallback } from 'react';

export const useUIState = () => {
  // UI states
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [showBuddhistYear, setShowBuddhistYear] = useState(true);
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalButtons, setModalButtons] = useState([]);
  
  // DataEdit Modal states
  const [dataEditModalOpen, setDataEditModalOpen] = useState(false);
  const [selectedDataEdit, setSelectedDataEdit] = useState(null);
  
  // ActivityEdit Modal states
  const [activityEditModalOpen, setActivityEditModalOpen] = useState(false);
  const [selectedActivityEdit, setSelectedActivityEdit] = useState(null);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // Alert/Toast states
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('info'); // 'success', 'error', 'warning', 'info'

  // Modal handlers
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

  // DataEdit Modal handlers
  const openDataEditModal = useCallback((dataEdit) => {
    setSelectedDataEdit(dataEdit);
    setDataEditModalOpen(true);
  }, []);

  const closeDataEditModal = useCallback(() => {
    setDataEditModalOpen(false);
    setSelectedDataEdit(null);
  }, []);

  // ActivityEdit Modal handlers
  const openActivityEditModal = useCallback((activityEdit) => {
    setSelectedActivityEdit(activityEdit);
    setActivityEditModalOpen(true);
  }, []);

  const closeActivityEditModal = useCallback(() => {
    setActivityEditModalOpen(false);
    setSelectedActivityEdit(null);
  }, []);

  // Loading handlers
  const showLoading = useCallback((message = 'กำลังโหลด...') => {
    setLoadingMessage(message);
    setIsLoading(true);
  }, []);

  const hideLoading = useCallback(() => {
    setIsLoading(false);
    setLoadingMessage('');
  }, []);

  // Alert/Toast handlers
  const showAlert = useCallback((message, type = 'info') => {
    setAlertMessage(message);
    setAlertType(type);
    setAlertOpen(true);
    
    // Auto close after 5 seconds
    setTimeout(() => {
      setAlertOpen(false);
    }, 5000);
  }, []);

  const closeAlert = useCallback(() => {
    setAlertOpen(false);
    setAlertMessage('');
    setAlertType('info');
  }, []);

  // Notification handlers
  const toggleNotifications = useCallback(() => {
    setNotifyOpen(prev => !prev);
  }, []);

  const closeNotifications = useCallback(() => {
    setNotifyOpen(false);
  }, []);

  // Sidebar handlers
  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const openSidebar = useCallback(() => {
    setSidebarOpen(true);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  // Buddhist year toggle
  const toggleBuddhistYear = useCallback(() => {
    setShowBuddhistYear(prev => !prev);
  }, []);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle click outside notifications
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

  // Prevent body scroll when modals are open
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
    // UI States
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
    dataEditModalOpen,
    selectedDataEdit,
    activityEditModalOpen,
    selectedActivityEdit,

    // Loading states
    isLoading,
    loadingMessage,

    // Alert states
    alertOpen,
    alertMessage,
    alertType,

    // Modal handlers
    showModal,
    closeModal,
    openDataEditModal,
    closeDataEditModal,
    openActivityEditModal,
    closeActivityEditModal,

    // Loading handlers
    showLoading,
    hideLoading,

    // Alert handlers
    showAlert,
    closeAlert,

    // Notification handlers
    toggleNotifications,
    closeNotifications,

    // Sidebar handlers
    toggleSidebar,
    openSidebar,
    closeSidebar,

    // Other handlers
    toggleBuddhistYear
  };
};