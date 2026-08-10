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
  const url = event.notification.data?.url || '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      for (const client of clients) {
        if ('focus' in client) {
          client.navigate?.(url)
          return client.focus()
        }
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(url)
      }
    }),
  )
})
