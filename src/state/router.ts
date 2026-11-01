import { useEffect, useState } from 'react'

/** Hash routing keeps GitHub Pages happy (no server rewrites needed). */
export type Route =
  | { name: 'title' }
  | { name: 'map' }
  | { name: 'concert'; concertId: string }
  | { name: 'play'; concertId: string; index: number }
  | { name: 'story'; storyId: string; next?: string }
  | { name: 'scrapbook'; tab?: string }
  | { name: 'settings' }
  | { name: 'daily' }
  | { name: 'free'; mode?: string }
  | { name: 'about' }
  | { name: 'jam' }
  | { name: 'trivia' }

export function parseHash(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent)
  switch (parts[0]) {
    case undefined:
    case '':
      return { name: 'title' }
    case 'map':
      return { name: 'map' }
    case 'concert':
      return parts[1] ? { name: 'concert', concertId: parts[1] } : { name: 'map' }
    case 'play': {
      const index = Number(parts[2] ?? 0)
      return parts[1] ? { name: 'play', concertId: parts[1], index: Number.isFinite(index) ? index : 0 } : { name: 'map' }
    }
    case 'story':
      return parts[1] ? { name: 'story', storyId: parts[1], next: parts[2] } : { name: 'map' }
    case 'scrapbook':
      return { name: 'scrapbook', tab: parts[1] }
    case 'settings':
      return { name: 'settings' }
    case 'daily':
      return { name: 'daily' }
    case 'free':
      return { name: 'free', mode: parts[1] }
    case 'about':
      return { name: 'about' }
    case 'jam':
      return { name: 'jam' }
    case 'trivia':
      return { name: 'trivia' }
    default:
      return { name: 'title' }
  }
}

export function toHash(route: Route): string {
  switch (route.name) {
    case 'title': return '#/'
    case 'map': return '#/map'
    case 'concert': return `#/concert/${route.concertId}`
    case 'play': return `#/play/${route.concertId}/${route.index}`
    case 'story': return `#/story/${route.storyId}${route.next ? `/${encodeURIComponent(route.next)}` : ''}`
    case 'scrapbook': return `#/scrapbook${route.tab ? `/${route.tab}` : ''}`
    case 'settings': return '#/settings'
    case 'daily': return '#/daily'
    case 'free': return `#/free${route.mode ? `/${route.mode}` : ''}`
    case 'about': return '#/about'
    case 'jam': return '#/jam'
    case 'trivia': return '#/trivia'
  }
}

export function navigate(route: Route): void {
  const h = toHash(route)
  if (window.location.hash === h) {
    window.dispatchEvent(new HashChangeEvent('hashchange'))
  } else {
    window.location.hash = h
  }
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash))
  useEffect(() => {
    const onChange = () => {
      setRoute(parseHash(window.location.hash))
      window.scrollTo({ top: 0 })
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}
