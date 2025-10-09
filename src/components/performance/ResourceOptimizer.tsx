'use client'

import { useEffect } from 'react'

export function ResourcePreloader() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Preload critical resources
    const criticalResources = [
      // BMKG API endpoint for faster subsequent calls
      'https://api.bmkg.go.id/publik/prakiraan-cuaca',
    ]

    criticalResources.forEach((url) => {
      const link = document.createElement('link')
      link.rel = 'dns-prefetch'
      link.href = url
      document.head.appendChild(link)
    })

    // Preload commonly used icons
    const iconPreloader = () => {
      const commonIcons = [
        'https://cdn.bmkg.go.id/web/bmkg_upload/cuaca/icon-cuaca/cerah.svg',
        'https://cdn.bmkg.go.id/web/bmkg_upload/cuaca/icon-cuaca/berawan.svg',
        'https://cdn.bmkg.go.id/web/bmkg_upload/cuaca/icon-cuaca/hujan-ringan.svg',
      ]

      commonIcons.forEach((iconUrl) => {
        const link = document.createElement('link')
        link.rel = 'prefetch'
        link.href = iconUrl
        document.head.appendChild(link)
      })
    }

    // Delay icon preloading to not interfere with critical resources
    const timeoutId = setTimeout(iconPreloader, 2000)

    return () => clearTimeout(timeoutId)
  }, [])

  return null
}

export function ImageOptimizer() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Optimize images with Intersection Observer for lazy loading
    const images = document.querySelectorAll('img[data-src]')
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement
            img.src = img.dataset.src || ''
            img.classList.remove('lazy')
            imageObserver.unobserve(img)
          }
        })
      })

      images.forEach((img) => imageObserver.observe(img))

      return () => imageObserver.disconnect()
    } else {
      // Fallback for browsers without Intersection Observer
      images.forEach((img) => {
        const htmlImg = img as HTMLImageElement
        htmlImg.src = htmlImg.dataset.src || ''
      })
    }
  }, [])

  return null
}