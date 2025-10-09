'use client'

import { useEffect } from 'react'

// Performance monitoring for Core Web Vitals
export function PerformanceMonitor() {
  useEffect(() => {
    // Only run performance monitoring in production or development
    if (typeof window === 'undefined') return

    // Simple performance monitoring
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        // Log slow resources (> 1 second)
        if (entry.duration > 1000) {
          console.warn(`Slow resource: ${entry.name} took ${Math.round(entry.duration)}ms`)
        }
        
        // Monitor navigation timing
        if (entry.entryType === 'navigation') {
          const navigationEntry = entry as PerformanceNavigationTiming
          const loadTime = navigationEntry.loadEventEnd - navigationEntry.startTime
          if (loadTime > 0) {
            console.log(`Page load time: ${Math.round(loadTime)}ms`)
          }
        }
      })
    })
    
    try {
      observer.observe({ entryTypes: ['resource', 'navigation'] })
    } catch (error) {
      // Browser doesn't support PerformanceObserver
      console.log('PerformanceObserver not supported')
    }

    return () => observer.disconnect()
  }, [])

  return null
}

// Service Worker registration for better caching
export function ServiceWorkerMonitor() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration)
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError)
        })
    }
  }, [])

  return null
}