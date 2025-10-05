// hooks/useUIState.js
import { useState, useEffect, useCallback } from 'react';

const useUIState = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [activeTab, setActiveTab] = useState('basic');

  const handleTabChange = useCallback((tab) => {
    const allowedTabs = ['basic', 'participants', 'stats', 'departments'];
    if (allowedTabs.includes(tab)) {
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

  return {
    isMobile,
    sidebarOpen,
    setSidebarOpen,
    activeTab,
    handleTabChange
  };
};

export default useUIState;