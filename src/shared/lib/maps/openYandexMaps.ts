export const openYandexMaps = (place: {
  query: string
  lat?: string | null
  lon?: string | null
}) => {
  const url = new URL('https://yandex.ru/maps/')

  if (place.lat && place.lon) {
    url.searchParams.set('pt', `${place.lon},${place.lat}`)
    url.searchParams.set('z', '17')
    url.searchParams.set('l', 'map')
  } else if (place.query.trim()) {
    url.searchParams.set('text', place.query.trim())
  } else {
    return
  }

  window.open(url.toString(), '_blank', 'noopener,noreferrer')
}

export const getYandexMapsUrl = (query: string) => {
  const trimmed = query.trim()
  if (!trimmed) return undefined

  const url = new URL('https://yandex.ru/maps/')
  url.searchParams.set('text', trimmed)
  return url.toString()
}
