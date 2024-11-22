'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface SanityLiveProps {
  children: React.ReactNode
  enabled?: boolean
}

export function SanityLive({ children, enabled }: SanityLiveProps) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<number>(0)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleUpdate = useCallback(async () => {
    if (!mounted || !enabled || isUpdating) return

    const now = Date.now()
    if (now - lastUpdate < 1000) return

    setIsUpdating(true)
    setLastUpdate(now)

    try {
      // First, revalidate the cache
      await fetch('/api/revalidate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tag: 'home',
          purgeCache: true
        })
      })

      // Wait a moment for cache to clear
      await new Promise(resolve => setTimeout(resolve, 500))

      // Force a full page reload with cache busting
      const url = new URL(window.location.href)
      url.searchParams.set('preview', '1')
      url.searchParams.set('purge', now.toString())

      // Clear any existing caches
      if ('caches' in window) {
        await caches.keys().then(keys =>
          Promise.all(keys.map(key => caches.delete(key)))
        )
      }

      // Use location.replace for a clean reload
      window.location.replace(url.toString())
    } catch (error) {
      console.error('Preview update failed:', error)
      // Fallback to force reload
      window.location.reload()
    } finally {
      setIsUpdating(false)
    }
  }, [mounted, enabled, lastUpdate, isUpdating])

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (!enabled || !mounted) return

    const eventSource = new EventSource('/api/preview/listen')

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'update' || data.type === 'reorder') {
          handleUpdate()
        }
      } catch (error) {
        console.error('Preview update error:', error)
      }
    }

    eventSource.onerror = (error) => {
      console.error('Preview connection error:', error)
      setIsSubscribed(false)
      eventSource.close()
    }

    eventSource.onopen = () => {
      setIsSubscribed(true)
    }

    return () => {
      eventSource.close()
      setIsSubscribed(false)
    }
  }, [enabled, mounted, handleUpdate])

  return (
    <div style={{ position: 'relative' }}>
      {children}
      {enabled && mounted && (
        <div style={{
          position: 'fixed',
          bottom: '1rem',
          right: '1rem',
          padding: '0.5rem',
          background: isSubscribed ? (isUpdating ? '#FFA000' : '#00C853') : '#FF3D00',
          color: '#fff',
          borderRadius: '0.25rem',
          fontSize: '0.875rem',
          zIndex: 9999,
          cursor: isUpdating ? 'default' : 'pointer'
        }} onClick={isUpdating ? undefined : handleUpdate}>
          Preview Mode {isUpdating ? 'Updating...' : (isSubscribed ? '(Live)' : '(Disconnected)')}
          {!isUpdating && ' - Click to refresh'}
        </div>
      )}
    </div>
  )
}