import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User } from 'lucide-react';

const ImageWithFallback = ({ 
  filename, 
  imageUrls, 
  loadImageWithCredentials, 
  handleImageError, 
  shouldLoadImage,
  alt,
  className,
  fallbackIcon: FallbackIcon = User,
  fallbackIconSize = 48,
  onLoadStart,
  onLoadEnd,
  onError,
  ...props 
}) => {
  const [imageState, setImageState] = useState('loading'); // 'loading', 'loaded', 'error', 'fallback'
  const [displayUrl, setDisplayUrl] = useState(null);
  const imgRef = useRef(null);
  const mountedRef = useRef(true);
  const loadAttemptRef = useRef(0);

  // Reset state when filename changes
  useEffect(() => {
    mountedRef.current = true;
    loadAttemptRef.current = 0;
    setImageState('loading');
    setDisplayUrl(null);

    return () => {
      mountedRef.current = false;
    };
  }, [filename]);

  const handleLoadError = useCallback((error) => {
    if (!mountedRef.current) return;

    console.error(`Image load error for: ${filename}`, error);
    
    setImageState('error');
    setDisplayUrl(null);
    
    // Call external error handler
    if (handleImageError) {
      handleImageError(filename);
    }
    
    // Call component-specific error handler
    if (onError) {
      onError(error, filename);
    }

    if (onLoadEnd) {
      onLoadEnd(false);
    }
  }, [filename, handleImageError, onError, onLoadEnd]);

  const handleLoadSuccess = useCallback((url) => {
    if (!mountedRef.current) return;

    console.log(`Image loaded successfully: ${filename}`);
    
    setImageState('loaded');
    setDisplayUrl(url);

    if (onLoadEnd) {
      onLoadEnd(true);
    }
  }, [filename, onLoadEnd]);

  // Main image loading logic
  useEffect(() => {
    const loadImage = async () => {
      if (!filename || !mountedRef.current) {
        setImageState('fallback');
        return;
      }

      // Check if we have a cached image
      const cachedUrl = imageUrls?.get(filename);
      if (cachedUrl) {
        handleLoadSuccess(cachedUrl);
        return;
      }

      // Check if we should load this image
      if (!shouldLoadImage || !shouldLoadImage(filename)) {
        setImageState('fallback');
        return;
      }

      // Start loading
      if (onLoadStart) {
        onLoadStart();
      }

      try {
        loadAttemptRef.current += 1;
        const currentAttempt = loadAttemptRef.current;

        const url = await loadImageWithCredentials(filename);
        
        // Check if this is still the current attempt and component is mounted
        if (currentAttempt !== loadAttemptRef.current || !mountedRef.current) {
          return;
        }

        if (url) {
          handleLoadSuccess(url);
        } else {
          handleLoadError(new Error('Failed to load image'));
        }
      } catch (error) {
        if (loadAttemptRef.current === loadAttemptRef.current && mountedRef.current) {
          handleLoadError(error);
        }
      }
    };

    loadImage();
  }, [filename, imageUrls, shouldLoadImage, loadImageWithCredentials, handleLoadSuccess, handleLoadError, onLoadStart]);

  // Handle img element load/error events
  const handleImgLoad = useCallback((event) => {
    if (!mountedRef.current) return;
    
    // Image element loaded successfully
    if (imageState !== 'loaded') {
      setImageState('loaded');
    }
  }, [imageState]);

  const handleImgError = useCallback((event) => {
    if (!mountedRef.current) return;
    
    console.error('IMG element error for:', filename);
    handleLoadError(new Error('IMG element failed to load'));
  }, [filename, handleLoadError]);

  // Render based on current state
  const renderContent = () => {
    switch (imageState) {
      case 'loaded':
        if (displayUrl) {
          return (
            <img
              ref={imgRef}
              src={displayUrl}
              alt={alt}
              className={className}
              onLoad={handleImgLoad}
              onError={handleImgError}
              {...props}
            />
          );
        }
        // Fallback if loaded but no URL
        return (
          <div className={`${className || ''} image-fallback`} {...props}>
            <FallbackIcon size={fallbackIconSize} />
          </div>
        );

      case 'loading':
        return (
          <div className={`${className || ''} image-loading`} {...props}>
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
          </div>
        );

      case 'error':
      case 'fallback':
      default:
        return (
          <div className={`${className || ''} image-fallback`} {...props}>
            <FallbackIcon size={fallbackIconSize} />
          </div>
        );
    }
  };

  return renderContent();
};

// Usage example for the AdminUsersDetail component
const renderUserProfileCard = () => {
  if (!userInfo) return null;

  return (
    <div className={styles.profileCard}>
      <div className={styles.profileHeader}>
        <div className={styles.profileAvatar}>
          <ImageWithFallback
            filename={userInfo.imageFile}
            imageUrls={imageUrls}
            loadImageWithCredentials={loadImageWithCredentials}
            handleImageError={handleImageError}
            shouldLoadImage={shouldLoadImage}
            alt={`รูปโปรไฟล์ของ ${userInfo.displayName}`}
            className={styles.profileImage}
            fallbackIcon={User}
            fallbackIconSize={48}
            onLoadStart={() => console.log('Starting to load image:', userInfo.imageFile)}
            onLoadEnd={(success) => console.log('Image load finished:', userInfo.imageFile, success ? 'success' : 'failed')}
            onError={(error, filename) => console.error('Image component error:', filename, error)}
          />
        </div>
        <div className={styles.profileInfo}>
          {/* Rest of profile info */}
        </div>
      </div>
    </div>
  );
};

export default ImageWithFallback;