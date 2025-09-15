import { useState, useEffect, useCallback } from 'react';

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.replace(/[<>"'&]/g, '').trim();
};

const useUIState = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const notifications = ["มีผู้ใช้งานเข้าร่วมกิจกรรม", "มีการอัพเดทข้อมูลกิจกรรมใหม่"];

  const handleTabChange = useCallback((tab) => {
    const allowedTabs = ['profile', 'activities'];
    if (allowedTabs.includes(sanitizeInput(tab))) {
      setActiveTab(tab);
    }
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
    
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return {
    isMobile,
    sidebarOpen,
    setSidebarOpen,
    notifyOpen,
    setNotifyOpen,
    activeTab,
    handleTabChange,
    notifications
  };
};

export default useUIState;