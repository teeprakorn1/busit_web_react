import { useState, useCallback, useEffect, useRef } from 'react';

const getApiUrl = (endpoint) => {
  const protocol = process.env.REACT_APP_SERVER_PROTOCOL;
  const baseUrl = process.env.REACT_APP_SERVER_BASE_URL;
  const port = process.env.REACT_APP_SERVER_PORT;

  if (!protocol || !baseUrl || !port) {
    throw new Error('Missing required environment variables');
  }

  return `${protocol}${baseUrl}${port}${endpoint}`;
};

const getProfileImageUrl = (filename) => {
  if (!filename || filename === 'undefined' || filename.trim() === '') {
    return null;
  }

  if (!filename.match(/^[a-zA-Z0-9._-]+$/)) {
    return null;
  }

  const allowedExt = ['.jpg', '.jpeg', '.png'];
  const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();

  if (!allowedExt.includes(ext)) {
    return null;
  }

  return getApiUrl(`${process.env.REACT_APP_API_ADMIN_IMAGES_GET}${filename}`);
};

const fetchImageWithCredentials = async (imageUrl) => {
  try {
    const response = await fetch(imageUrl, {
      method: 'GET',
      credentials: 'include',
      mode: 'cors',
      headers: {
        'Accept': 'image/*',
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Failed to fetch image:', error);
    return null;
  }
};

const useImageLoader = () => {
  const [imageLoadErrors, setImageLoadErrors] = useState(new Set());
  const [imageUrls, setImageUrls] = useState(new Map());
  const [loadingImages, setLoadingImages] = useState(new Set());

  const activeRequests = useRef(new Map());
  const mountedRef = useRef(true);
  const activeBlobUrls = useRef(new Set());

  const handleImageError = useCallback((filename) => {
    if (!mountedRef.current) return;
    setImageLoadErrors(prev => new Set([...prev, filename]));
    setLoadingImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(filename);
      return newSet;
    });

    if (imageUrls.has(filename)) {
      const blobUrl = imageUrls.get(filename);
      if (blobUrl && blobUrl.startsWith('blob:')) {
        setTimeout(() => {
          if (!activeBlobUrls.current.has(blobUrl)) {
            URL.revokeObjectURL(blobUrl);
          }
        }, 1000);
      }
      setImageUrls(prev => {
        const newMap = new Map(prev);
        newMap.delete(filename);
        return newMap;
      });
    }
  }, [imageUrls]);

  const shouldLoadImage = useCallback((filename) => {
    return filename &&
      !imageLoadErrors.has(filename) &&
      !loadingImages.has(filename) &&
      !imageUrls.has(filename);
  }, [imageLoadErrors, loadingImages, imageUrls]);

  const loadImageWithCredentials = useCallback(async (filename) => {
    if (!filename || typeof filename !== 'string' || filename.trim() === '') {
      return null;
    }

    if (!mountedRef.current) {
      return null;
    }

    if (imageLoadErrors.has(filename)) {
      return null;
    }

    if (imageUrls.has(filename)) {
      const cachedUrl = imageUrls.get(filename);
      if (cachedUrl && cachedUrl.startsWith('blob:')) {
        activeBlobUrls.current.add(cachedUrl);
      }
      return cachedUrl;
    }

    if (loadingImages.has(filename) || activeRequests.current.has(filename)) {
      return activeRequests.current.get(filename);
    }

    const loadingPromise = (async () => {
      try {
        if (!mountedRef.current) return null;

        setLoadingImages(prev => new Set([...prev, filename]));

        const imageUrl = getProfileImageUrl(filename);
        if (!imageUrl) {
          throw new Error('Invalid filename or unable to construct image URL');
        }

        const blobUrl = await fetchImageWithCredentials(imageUrl);

        if (!mountedRef.current) {
          if (blobUrl && blobUrl.startsWith('blob:')) {
            URL.revokeObjectURL(blobUrl);
          }
          return null;
        }

        if (blobUrl) {
          activeBlobUrls.current.add(blobUrl);
          setImageUrls(prev => new Map(prev.set(filename, blobUrl)));
          return blobUrl;
        } else {
          throw new Error('Failed to create blob URL');
        }
      } catch (error) {
        if (mountedRef.current) {
          setImageLoadErrors(prev => new Set([...prev, filename]));
        }
        return null;
      } finally {
        if (mountedRef.current) {
          setLoadingImages(prev => {
            const newSet = new Set(prev);
            newSet.delete(filename);
            return newSet;
          });
        }
        activeRequests.current.delete(filename);
      }
    })();

    activeRequests.current.set(filename, loadingPromise);
    return loadingPromise;
  }, [imageLoadErrors, imageUrls, loadingImages]);

  const preloadImage = useCallback((filename) => {
    if (!filename ||
      imageLoadErrors.has(filename) ||
      imageUrls.has(filename) ||
      loadingImages.has(filename) ||
      activeRequests.current.has(filename)) {
      return;
    }

    loadImageWithCredentials(filename).catch(error => {
      console.error(error);
    });
  }, [imageLoadErrors, imageUrls, loadingImages, loadImageWithCredentials]);

  const getCachedImageUrl = useCallback((filename) => {
    if (!filename || imageLoadErrors.has(filename)) {
      return null;
    }
    const url = imageUrls.get(filename) || null;
    if (url && url.startsWith('blob:')) {
      activeBlobUrls.current.add(url);
    }
    return url;
  }, [imageLoadErrors, imageUrls]);

  const clearImageCache = useCallback((filename) => {
    if (activeRequests.current.has(filename)) {
      activeRequests.current.delete(filename);
    }

    if (imageUrls.has(filename)) {
      const blobUrl = imageUrls.get(filename);
      if (blobUrl && blobUrl.startsWith('blob:')) {
        activeBlobUrls.current.delete(blobUrl);
        setTimeout(() => {
          URL.revokeObjectURL(blobUrl);
        }, 2000);
      }
      setImageUrls(prev => {
        const newMap = new Map(prev);
        newMap.delete(filename);
        return newMap;
      });
    }

    setImageLoadErrors(prev => {
      const newSet = new Set(prev);
      newSet.delete(filename);
      return newSet;
    });

    setLoadingImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(filename);
      return newSet;
    });
  }, [imageUrls]);

  const clearAllCaches = useCallback(() => {
    activeRequests.current.clear();
    imageUrls.forEach(blobUrl => {
      if (blobUrl && blobUrl.startsWith('blob:')) {
        activeBlobUrls.current.delete(blobUrl);
        setTimeout(() => {
          URL.revokeObjectURL(blobUrl);
        }, 2000);
      }
    });

    setImageUrls(new Map());
    setImageLoadErrors(new Set());
    setLoadingImages(new Set());
    activeBlobUrls.current.clear();
  }, [imageUrls]);

  useEffect(() => {
    mountedRef.current = true;
    const currentActiveRequests = activeRequests.current;
    const currentActiveBlobUrls = activeBlobUrls.current;
    const currentImageUrls = imageUrls;

    return () => {
      mountedRef.current = false;
      currentActiveRequests.clear();

      setTimeout(() => {
        currentImageUrls.forEach(blobUrl => {
          if (blobUrl && blobUrl.startsWith('blob:')) {
            URL.revokeObjectURL(blobUrl);
          }
        });
        currentActiveBlobUrls.clear();
      }, 3000);
    };
  }, [imageUrls]);

  return {
    imageLoadErrors,
    imageUrls,
    loadingImages,
    handleImageError,
    shouldLoadImage,
    loadImageWithCredentials,
    preloadImage,
    getCachedImageUrl,
    clearImageCache,
    clearAllCaches,
    getProfileImageUrl,
    isLoading: (filename) => loadingImages.has(filename),
    hasError: (filename) => imageLoadErrors.has(filename),
    isLoaded: (filename) => imageUrls.has(filename)
  };
};

export default useImageLoader;