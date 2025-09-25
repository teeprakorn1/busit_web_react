import { useRef, useCallback, useEffect } from 'react';

const useRequestDeduplicator = (options = {}) => {
  const {
    cacheTTL = 30000,
    maxCacheSize = 100,
    debugMode = false
  } = options;

  const pendingRequests = useRef(new Map());
  const cache = useRef(new Map());
  const cacheTimestamps = useRef(new Map());
  const requestCounters = useRef(new Map());

  const log = useCallback((...args) => {
    if (debugMode) {
      console.log('[RequestDeduplicator]', ...args);
    }
  }, [debugMode]);

  const cleanupExpiredCache = useCallback(() => {
    const now = Date.now();
    const expiredKeys = [];

    cacheTimestamps.current.forEach((timestamp, key) => {
      if (now - timestamp > cacheTTL) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => {
      cache.current.delete(key);
      cacheTimestamps.current.delete(key);
      log(`Expired cache cleared for key: ${key}`);
    });

    if (cache.current.size > maxCacheSize) {
      const entries = Array.from(cacheTimestamps.current.entries());
      entries.sort((a, b) => a[1] - b[1]);

      const keysToRemove = entries
        .slice(0, cache.current.size - maxCacheSize)
        .map(([key]) => key);

      keysToRemove.forEach(key => {
        cache.current.delete(key);
        cacheTimestamps.current.delete(key);
        log(`LRU cache cleared for key: ${key}`);
      });
    }
  }, [cacheTTL, maxCacheSize, log]);

  const createRequestKey = useCallback((endpoint, params = {}) => {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        acc[key] = params[key];
        return acc;
      }, {});

    return `${endpoint}::${JSON.stringify(sortedParams)}`;
  }, []);

  const request = useCallback(async (key, requestFunction, options = {}) => {
    const {
      forceRefresh = false,
      useCache = true
    } = options;

    const currentCount = (requestCounters.current.get(key) || 0) + 1;
    requestCounters.current.set(key, currentCount);

    log(`Request #${currentCount} for key: ${key}`);

    if (useCache && !forceRefresh) {
      cleanupExpiredCache();

      if (cache.current.has(key)) {
        const cachedResult = cache.current.get(key);
        const cacheAge = Date.now() - cacheTimestamps.current.get(key);
        log(`Cache hit for key: ${key} (age: ${cacheAge}ms)`);
        return cachedResult;
      }
    }

    if (pendingRequests.current.has(key)) {
      const existingRequest = pendingRequests.current.get(key);
      log(`⏳ Deduplicating request for key: ${key}`);
      return await existingRequest;
    }

    log(`Starting new request for key: ${key}`);

    const requestPromise = (async () => {
      try {
        const startTime = Date.now();
        const result = await requestFunction();
        const duration = Date.now() - startTime;
        log(`Request completed for key: ${key} (${duration}ms)`);

        if (useCache) {
          cache.current.set(key, result);
          cacheTimestamps.current.set(key, Date.now());
          log(`Result cached for key: ${key}`);
        }

        return result;
      } catch (error) {
        log(`Request failed for key: ${key}`, error.message);
        throw error;
      } finally {
        pendingRequests.current.delete(key);
        log(`🧹 Cleaned up pending request for key: ${key}`);
      }
    })();
    pendingRequests.current.set(key, requestPromise);

    return await requestPromise;
  }, [cleanupExpiredCache, log]);

  const apiRequest = useCallback(async (endpoint, requestFunction, params = {}, options = {}) => {
    const key = createRequestKey(endpoint, params);
    return await request(key, requestFunction, options);
  }, [request, createRequestKey]);

  const clearCache = useCallback((key = null) => {
    if (key) {
      cache.current.delete(key);
      cacheTimestamps.current.delete(key);
      log(`Cache cleared for key: ${key}`);
    } else {
      cache.current.clear();
      cacheTimestamps.current.clear();
      log(`All cache cleared`);
    }
  }, [log]);

  const cancelRequest = useCallback((key) => {
    if (pendingRequests.current.has(key)) {
      pendingRequests.current.delete(key);
      log(`Cancelled pending request for key: ${key}`);
    }
  }, [log]);

  const getStats = useCallback(() => {
    return {
      cacheSize: cache.current.size,
      pendingRequests: pendingRequests.current.size,
      requestCounts: Object.fromEntries(requestCounters.current),
      cacheKeys: Array.from(cache.current.keys()),
      pendingKeys: Array.from(pendingRequests.current.keys())
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(cleanupExpiredCache, cacheTTL / 2);

    return () => {
      clearInterval(interval);
      const pendingRequestsRef = pendingRequests.current;
      const cacheRef = cache.current;
      const cacheTimestampsRef = cacheTimestamps.current;
      const requestCountersRef = requestCounters.current;

      pendingRequestsRef.clear();
      cacheRef.clear();
      cacheTimestampsRef.clear();
      requestCountersRef.clear();

      log('Component unmounted - all data cleared');
    };
  }, [cleanupExpiredCache, cacheTTL, log]);

  return {
    request,
    apiRequest,
    createRequestKey,
    clearCache,
    cancelRequest,
    cleanupExpiredCache,
    getStats,
    isCached: (key) => cache.current.has(key),
    isPending: (key) => pendingRequests.current.has(key),
    getCacheAge: (key) => {
      const timestamp = cacheTimestamps.current.get(key);
      return timestamp ? Date.now() - timestamp : null;
    }
  };
};

export default useRequestDeduplicator;