function resolveNotificationUrl(raw) {
  try {
    const parsed = new URL(raw || '/', self.location.origin)
    return `${self.location.origin}${parsed.pathname}${parsed.search}${parsed.hash}`
  } catch {
    return `${self.location.origin}/`
  }
}

self.addEventListener('push', event => {
  let payload = { title: 'Nikssens', body: '', url: '/' }

  try {
    payload = { ...payload, ...(event.data?.json() ?? {}) }
  } catch {
    const text = event.data?.text()
    if (text) {
      payload.body = text
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title || 'Nikssens', {
      body: payload.body || '',
      icon: '/pwa-192.png',
      badge: '/Mark.png',
      data: { url: payload.url || '/' },
    }),
  )
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  const url = resolveNotificationUrl(event.notification.data?.url)

  event.waitUntil(
    (async () => {
      const windowClients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      })

      for (const client of windowClients) {
        if (!client.url.startsWith(self.location.origin) || !('focus' in client)) {
          continue
        }

        await client.focus()

        if (typeof client.navigate === 'function') {
          try {
            await client.navigate(url)
            return
          } catch {
            // iOS / some browsers reject navigate — open a new window instead
          }
        }

        if (self.clients.openWindow) {
          return self.clients.openWindow(url)
        }

        return
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(url)
      }
    })(),
  )
})
