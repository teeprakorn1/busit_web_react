// hooks/useUIState.js
import { useState, useEffect } from 'react';

export const useUIState = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [showFilters, setShowFilters] = useState(false);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isMobile,
    sidebarOpen,
    setSidebarOpen,
    showFilters,
    setShowFilters,
    showImageGallery,
    setShowImageGallery,
    selectedImages,
    setSelectedImages
  };
};