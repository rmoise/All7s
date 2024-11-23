import confetti from 'canvas-confetti'
import { NavigationLink } from '@types/sanity'

// Navigation utilities
export const generateKey = (item: NavigationLink, index: number): string => {
  return `nav-${item.name}-${index}-${item.href}`
}

export const classNames = (...classes: string[]): string =>
  classes.filter(Boolean).join(' ')

// Debug utilities
export const logSectionInfo = (contentBlocks: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Content blocks:', contentBlocks)
    const sections = document.querySelectorAll('section[id]')
    console.log('Available sections:', Array.from(sections).map(s => s.id))
  }
}

// Animation utilities
export const runSnow = () => {
  const duration = 5 * 1000
  const animationEnd = Date.now() + duration
  let skew = 1

  function randomInRange(min: number, max: number): number {
    return Math.random() * (max - min) + min
  }

  (function frame() {
    const timeLeft = animationEnd - Date.now()
    const ticks = Math.max(200, 500 * (timeLeft / duration))
    skew = Math.max(0.8, skew - 0.001)

    confetti({
      particleCount: 1,
      startVelocity: 0,
      ticks: ticks,
      origin: {
        x: Math.random(),
        y: (Math.random() * skew) - 0.2
      },
      colors: [`#${Math.floor(Math.random()*16777215).toString(16)}`],
      shapes: ['circle'],
      gravity: randomInRange(0.4, 0.6),
      scalar: randomInRange(0.4, 1),
      drift: randomInRange(-0.4, 0.4)
    })

    if (timeLeft > 0) {
      requestAnimationFrame(frame)
    }
  }())
}

// Media utilities
export function extractYouTubeID(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
  const match = url.match(regExp)
  return (match && match[2].length === 11) ? match[2] : null
}

export function extractSpotifyEmbedUrlFromIframe(iframeString: string): string | null {
  const srcRegex = /src="(https:\/\/open\.spotify\.com\/embed\/[^"]+)"/
  const match = iframeString.match(srcRegex)
  return match ? match[1] : null
}

// Function utilities
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T & { cancel: () => void } {
  let timeout: NodeJS.Timeout | undefined

  function debounced(this: any, ...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout)
      func.apply(this, args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }

  debounced.cancel = () => {
    clearTimeout(timeout)
  }

  return debounced as T & { cancel: () => void }
}