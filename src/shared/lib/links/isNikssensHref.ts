const NIKSSENS_HOSTS = new Set(['nikssens.ru', 'nikssens.com', 'www.nikssens.ru', 'www.nikssens.com'])

const isNikssensHost = (hostname: string) => {
  const host = hostname.toLowerCase()

  if (typeof window !== 'undefined' && host === window.location.hostname.toLowerCase()) {
    return true
  }

  return (
    NIKSSENS_HOSTS.has(host) ||
    host.endsWith('.nikssens.ru') ||
    host.endsWith('.nikssens.com')
  )
}

export const normalizeHref = (href: string) => {
  const trimmed = href.trim()

  if (/^www\./i.test(trimmed)) {
    return `https://${trimmed}`
  }

  return trimmed
}

export const isNikssensHref = (href: string) => {
  const trimmed = href.trim()

  if (!trimmed) return false
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) return true
  if (trimmed.startsWith('mailto:')) return true

  try {
    const url = new URL(normalizeHref(trimmed), window.location.origin)
    return isNikssensHost(url.hostname)
  } catch {
    return false
  }
}

export const openHref = (href: string) => {
  const normalized = normalizeHref(href)

  if (normalized.startsWith('/') || normalized.startsWith('#')) {
    window.location.assign(normalized)
    return
  }

  window.open(normalized, '_blank', 'noopener,noreferrer')
}
