import { LRUCache } from 'lru-cache';

/**
 * Cache configuration for different types of data.
 * 
 * NOTE: In serverless environments (e.g., Vercel), this in-memory cache is NOT shared 
 * across different function instances and is lost when the instance is destroyed.
 * For persistent global caching, consider using Redis (e.g., Upstash).
 */
const options = {
  // Analytics and Dashboard stats: 5 minutes TTL
  analytics: {
    max: 50,
    ttl: 1000 * 60 * 5,
    updateAgeOnGet: false,
  },
  // Shipment lists: 2 minutes TTL
  shipments: {
    max: 20,
    ttl: 1000 * 60 * 2,
    updateAgeOnGet: false,
  },
  // Tracking info: 1 minute TTL
  tracking: {
    max: 100,
    ttl: 1000 * 60 * 1,
    updateAgeOnGet: true,
  }
};

// Create cache instances
export const analyticsCache = new LRUCache(options.analytics);
export const shipmentCache = new LRUCache(options.shipments);
export const trackingCache = new LRUCache(options.tracking);

// Helper to generate cache keys
export const getCacheKey = (endpoint, params = {}) => {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  return `${endpoint}?${sortedParams}`;
};

// Global helper to invalidate caches when needed
export const invalidateAllCaches = () => {
  analyticsCache.clear();
  shipmentCache.clear();
  trackingCache.clear();
  console.log('All caches invalidated');
};
