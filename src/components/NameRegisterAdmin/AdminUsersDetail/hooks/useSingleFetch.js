import { useCallback, useRef, useState } from 'react';

const useSingleFetch = () => {
  const pendingRequests = useRef(new Map());
  const [loadingStates, setLoadingStates] = useState(new Map());

  const singleFetch = useCallback(async (key, fetchFunction) => {
    if (pendingRequests.current.has(key)) {
      return await pendingRequests.current.get(key);
    }

    const requestPromise = (async () => {
      try {
        setLoadingStates(prev => new Map(prev.set(key, true)));

        const result = await fetchFunction();
        return result;
      } catch (error) {
        throw error;
      } finally {
        pendingRequests.current.delete(key);
        setLoadingStates(prev => {
          const newMap = new Map(prev);
          newMap.delete(key);
          return newMap;
        });
      }
    })();

    pendingRequests.current.set(key, requestPromise);
    return await requestPromise;
  }, []);

  const isLoading = useCallback((key) => {
    return loadingStates.get(key) || false;
  }, [loadingStates]);

  const cancelRequest = useCallback((key) => {
    if (pendingRequests.current.has(key)) {
      pendingRequests.current.delete(key);
      setLoadingStates(prev => {
        const newMap = new Map(prev);
        newMap.delete(key);
        return newMap;
      });
    }
  }, []);

  const clearAllRequests = useCallback(() => {
    pendingRequests.current.clear();
    setLoadingStates(new Map());
  }, []);

  return {
    singleFetch,
    isLoading,
    cancelRequest,
    clearAllRequests,
    getPendingKeys: () => Array.from(pendingRequests.current.keys())
  };
};

export default useSingleFetch;