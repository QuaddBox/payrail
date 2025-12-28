'use client'

import * as React from 'react'

// Generic cache store for any page data
interface CacheEntry<T> {
  data: T
  timestamp: number
}

interface DataCacheContextType {
  // Get cached data for a key
  get: <T>(key: string) => T | null
  // Set cached data for a key
  set: <T>(key: string, data: T) => void
  // Check if cache has valid data for a key
  has: (key: string) => boolean
  // Invalidate a specific cache key
  invalidate: (key: string) => void
  // Invalidate all cache
  invalidateAll: () => void
}

const DataCacheContext = React.createContext<DataCacheContextType | undefined>(undefined)

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000

export function DashboardDataProvider({ children }: { children: React.ReactNode }) {
  const cacheRef = React.useRef<Map<string, CacheEntry<any>>>(new Map())

  const get = React.useCallback(<T,>(key: string): T | null => {
    const entry = cacheRef.current.get(key)
    if (!entry) return null
    
    // Check if cache is still valid
    const isExpired = Date.now() - entry.timestamp > CACHE_DURATION
    if (isExpired) {
      cacheRef.current.delete(key)
      return null
    }
    
    return entry.data as T
  }, [])

  const set = React.useCallback(<T,>(key: string, data: T) => {
    cacheRef.current.set(key, {
      data,
      timestamp: Date.now()
    })
  }, [])

  const has = React.useCallback((key: string): boolean => {
    const entry = cacheRef.current.get(key)
    if (!entry) return false
    
    const isExpired = Date.now() - entry.timestamp > CACHE_DURATION
    if (isExpired) {
      cacheRef.current.delete(key)
      return false
    }
    
    return true
  }, [])

  const invalidate = React.useCallback((key: string) => {
    cacheRef.current.delete(key)
  }, [])

  const invalidateAll = React.useCallback(() => {
    cacheRef.current.clear()
  }, [])

  const value: DataCacheContextType = {
    get,
    set,
    has,
    invalidate,
    invalidateAll,
  }

  return (
    <DataCacheContext.Provider value={value}>
      {children}
    </DataCacheContext.Provider>
  )
}

export function useDataCache() {
  const context = React.useContext(DataCacheContext)
  if (context === undefined) {
    throw new Error('useDataCache must be used within a DashboardDataProvider')
  }
  return context
}

// Hook to automatically cache server-provided data and use cached data on return visits
export function useCachedServerData<T>(
  cacheKey: string,
  serverData: T | null | undefined,
  onDataReady?: (data: T) => void
): { data: T | null; isFromCache: boolean } {
  const cache = useDataCache()
  const [data, setData] = React.useState<T | null>(null)
  const [isFromCache, setIsFromCache] = React.useState(false)
  const initialized = React.useRef(false)

  React.useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    // First, check if we have cached data
    const cachedData = cache.get<T>(cacheKey)
    
    if (cachedData) {
      // Use cached data immediately
      setData(cachedData)
      setIsFromCache(true)
      if (onDataReady) onDataReady(cachedData)
    }

    // When server data arrives, use it and update cache
    if (serverData !== null && serverData !== undefined) {
      setData(serverData)
      cache.set(cacheKey, serverData)
      setIsFromCache(false)
      if (onDataReady) onDataReady(serverData)
    }
  }, [cacheKey, serverData, cache, onDataReady])

  // Update cache when server data changes
  React.useEffect(() => {
    if (serverData !== null && serverData !== undefined) {
      setData(serverData)
      cache.set(cacheKey, serverData)
    }
  }, [serverData, cacheKey, cache])

  return { data, isFromCache }
}
